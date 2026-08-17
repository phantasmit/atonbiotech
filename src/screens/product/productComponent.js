import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    RefreshControl,
    ActivityIndicator,
    Modal,
    useWindowDimensions,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { request } from '../../services/services';
import { ADD_FAVORITE_API, ADD_PRODUCT_TO_HOSPITAL_API, ADD_PRODUCT_TO_LABEL_API, GET_PRODUCT_API, PRODUCT_LIST_API, REMOVE_FAVORITE_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';

const PER_PAGE = 10;

// Enable smooth LayoutAnimation transitions on Android (no-op on iOS, which has it by default)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ASSIGN_OPTIONS = [
    { key: 'label', label: 'Assign Product to Label' },
    { key: 'doctor', label: 'Assign Product to Doctor' },
];

// ---------- Component ----------
const ProductComponent = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    // const { categoryData, loading: categoryLoading } = useSelector((state) => state.hospitalReducer)

    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Responsive breakpoints
    const isTablet = width >= 600;

    // 'list' -> single full-width row cards (always 1 column, any device)
    // 'grid' -> multi-column tiled cards, column count scales with screen size
    const [viewMode, setViewMode] = useState('list');
    const numColumns = viewMode === 'list'
        ? 1
        : (width >= 900 ? 4 : width >= 600 ? 3 : 2);

    const [allItems, setAllItems] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [assignLoading, setAssignLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [search, setSearch] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [dateFilter, setDateFilter] = useState('All');

    // ---------- Assign dropdown + selection mode ----------
    const [assignMenuVisible, setAssignMenuVisible] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [assignType, setAssignType] = useState(null); // 'label' | 'doctor' | null
    const [selectedIds, setSelectedIds] = useState({}); // { [id]: true }
    const [summaryVisible, setSummaryVisible] = useState(false);

    const isMountedRef = useRef(true);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchProducts = useCallback(async (page, mode = 'initial') => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (mode === 'initial') setInitialLoading(true);
        if (mode === 'refresh') setRefreshing(true);
        if (mode === 'loadMore') setLoadingMore(true);

        try {
            setError(null);
            const result = await request(
                (route.params?.id === -1) ? GET_PRODUCT_API(page) : PRODUCT_LIST_API(route.params?.id, page),
                HTTP_METHODS.GET,
                {}
            );
            const payload = result?.response?.data;
            const newItems = payload?.data ?? [];
            if (!isMountedRef.current) return;

            setAllItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
            setCurrentPage(payload?.current_page ?? page);
            setLastPage(payload?.last_page ?? page);
        } catch (err) {
            if (!isMountedRef.current) return;
            setError(err?.message || 'Something went wrong');
        } finally {
            if (isMountedRef.current) {
                setInitialLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
            isFetchingRef.current = false;
        }
    }, [route.params?.id]);

    useEffect(() => {
        fetchProducts(1, 'initial');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.id]);
    //
    const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

    const toggleFavorite = useCallback(async (item) => {
        if (favoriteLoadingId) return; // avoid double taps while a request is in flight
        const nextFavorite = !item.is_favorited;

        // optimistic update
        setAllItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, is_favorited: nextFavorite } : p))
        );
        setFavoriteLoadingId(item.id);

        try {
            if (nextFavorite) {
                await request(
                    ADD_FAVORITE_API(),
                    HTTP_METHODS.POST,
                    JSON.stringify({ "product_id": item.id })
                );
            } else {
                await request(
                    REMOVE_FAVORITE_API(item.id),
                    HTTP_METHODS.DELETE,
                    {}
                );
            }
        } catch (err) {
            // revert on failure
            setAllItems((prev) =>
                prev.map((p) => (p.id === item.id ? { ...p, is_favorited: !nextFavorite } : p))
            );
            alert(err?.response?.data?.message || 'Could not update favorite');
        } finally {
            if (isMountedRef.current) setFavoriteLoadingId(null);
        }
    }, [favoriteLoadingId]);
    //
    const onRefresh = useCallback(() => fetchProducts(1, 'refresh'), [fetchProducts]);
    const onRetry = useCallback(() => fetchProducts(1, 'initial'), [fetchProducts]);

    const onLoadMore = useCallback(() => {
        if (loadingMore || refreshing || initialLoading || selectionMode) return;
        if (currentPage >= lastPage) return;
        fetchProducts(currentPage + 1, 'loadMore');
    }, [currentPage, lastPage, loadingMore, refreshing, initialLoading, selectionMode, fetchProducts]);

    // ---------- Search + sort + date filter ----------
    const isWithinDateFilter = useCallback((itemDate) => {
        if (dateFilter === 'All') return true;
        if (!itemDate) return true;
        const now = new Date();
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'Today') return diffDays < 1;
        if (dateFilter === 'Last 7 Days') return diffDays <= 7;
        if (dateFilter === 'Last 30 Days') return diffDays <= 30;
        return true;
    }, [dateFilter]);

    const displayedItems = useMemo(() => {
        let list = allItems;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((item) => item.name?.toLowerCase().includes(q));
        }
        list = list.filter((item) => isWithinDateFilter(item.modifiedDate));
        list = [...list].sort((a, b) =>
            sortAsc ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '')
        );
        return list;
    }, [allItems, search, sortAsc, isWithinDateFilter]);

    const formatCurrency = (value) => `₹${(Number(value) || 0).toFixed(2)}`;

    // ---------- Assign dropdown handlers ----------
    const openAssignMenu = () => setAssignMenuVisible(true);
    const closeAssignMenu = () => setAssignMenuVisible(false);

    const chooseAssignOption = (optionKey) => {
        closeAssignMenu();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAssignType(optionKey);
        setSelectedIds({});
        setSelectionMode(true);
    };

    const cancelSelection = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectionMode(false);
        setSelectedIds({});
        setAssignType(null);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = { ...prev };
            if (next[id]) delete next[id];
            else next[id] = true;
            return next;
        });
    };

    const selectedCount = Object.keys(selectedIds).length;

    const selectedProducts = useMemo(
        () => allItems.filter((item) => selectedIds[item.id]),
        [allItems, selectedIds]
    );

    const onPressDone = () => {
        if (selectedCount === 0) return;
        setSummaryVisible(true);
    };

    // Called from the summary modal — this is where you'd fire the actual
    // "assign to label / assign to doctor" API call using selectedProducts + assignType
    const confirmAssign = async () => {
        // TODO: wire up real API call, e.g.
        // await request(ASSIGN_PRODUCT_API(), HTTP_METHODS.POST, {
        //   type: assignType,
        //   product_ids: selectedProducts.map((p) => p.id),
        // });
        const optionId = (assignType == 'doctor') ? 1 : 0;
        setSummaryVisible(false);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectionMode(false);
        setSelectedIds({});
        setAssignType(null);
        //navigation.navigate('AssignProduct')
        navigation.navigate('AssignProduct', {
            optionId: optionId,
            onSubmit: async (payload) => {
                //console.log('Selected labels JSON:', payload);
                const selectedId = selectedProducts.map(({ id }) => id);
                setAssignLoading(true)
                //alert(JSON.stringify(payload.id) + " >><<  " + [selectedId] + " " + optionId)
                try {
                    if (optionId == 0) {
                        await request(ADD_PRODUCT_TO_LABEL_API(payload.id), HTTP_METHODS.POST, JSON.stringify({ "product_ids": selectedId }))
                    } else {
                        //await request(ADD_PRODUCT_TO_LABEL_API(payload.id), HTTP_METHODS.POST, JSON.stringify({ "product_ids": selectedId }))
                        await request(ADD_PRODUCT_TO_HOSPITAL_API(payload.id), HTTP_METHODS.POST, JSON.stringify({ "product_ids": selectedId }))
                    }
                    alert('Assign Successfully!')
                    setAssignLoading(false)
                } catch (e) {
                    alert(e?.response?.data?.message)
                }
            },
        });
    };

    const assignTypeLabel = ASSIGN_OPTIONS.find((o) => o.key === assignType)?.label;

    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
    };

    // ---------- Render helpers ----------
    const renderListItem = ({ item }) => {

        const isFavorite = !!item.is_favorited;
        const isFavoriteBusy = favoriteLoadingId === item.id;

        const isSelected = !!selectedIds[item.id];
        return (
            <TouchableOpacity
                activeOpacity={selectionMode ? 0.7 : 1}
                onPress={() => selectionMode ? toggleSelect(item.id) : navigation.navigate('productDetail', item)}
                style={styles.card}
            >
                {selectionMode && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Icon name="check" size={11} color="#fff" />}
                    </View>
                )}
                <View style={styles.imageWrap}>
                    {item.thumb ? (
                        <Image source={{ uri: item.thumb }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Icon name="medkit" size={22} color="#bbb" />
                        </View>
                    )}
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {!!item.packaging && (
                        <Text style={styles.itemQty} numberOfLines={1}>{item.packaging}</Text>
                    )}
                    <View style={styles.priceRow}>
                        <Text style={styles.itemMrp}>MRP {formatCurrency(item.mrp)}</Text>
                        {item.ptr > 0 && <Text style={styles.itemPtr}>PTR {formatCurrency(item.ptr)}</Text>}
                    </View>
                </View>
                {!selectionMode && (
                    <TouchableOpacity
                        style={styles.favoriteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        disabled={isFavoriteBusy}
                        onPress={() => toggleFavorite(item)}
                    >
                        <Icon
                            name={isFavorite ? 'heart' : 'heart-o'}
                            size={18}
                            color={isFavorite ? '#3562a6' : '#bbb'}
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderGridItem = ({ item }) => {
        const isSelected = !!selectedIds[item.id];
        const isFavorite = !!item.is_favorited;
        const isFavoriteBusy = favoriteLoadingId === item.id;
        return (
            <TouchableOpacity
                activeOpacity={selectionMode ? 0.7 : 1}
                onPress={() => selectionMode && toggleSelect(item.id)}
                style={styles.gridCard}
            >
                <View style={styles.gridImageWrap}>
                    {item.thumb ? (
                        <Image source={{ uri: item.thumb }} style={styles.gridImage} />
                    ) : (
                        <View style={[styles.gridImage, styles.imagePlaceholder]}>
                            <Icon name="medkit" size={26} color="#bbb" />
                        </View>
                    )}
                    {selectionMode && (
                        <View style={[styles.checkbox, styles.gridCheckbox, isSelected && styles.checkboxChecked]}>
                            {isSelected && <Icon name="check" size={11} color="#fff" />}
                        </View>
                    )}
                    {!selectionMode && (
                        <TouchableOpacity
                            style={styles.gridFavoriteBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            disabled={isFavoriteBusy}
                            onPress={() => toggleFavorite(item)}
                        >
                            <Icon
                                name={isFavorite ? 'heart' : 'heart-o'}
                                size={16}
                                color={isFavorite ? '#3562a6' : '#bbb'}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.gridContent}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemMrp} numberOfLines={1}>MRP {formatCurrency(item.mrp)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = viewMode === 'grid' ? renderGridItem : renderListItem;

    const renderEmpty = () => {
        if (initialLoading) return null;
        return (
            <View style={styles.emptyWrap}>
                <Icon name="inbox" size={40} color="#ccc" />
                <Text style={styles.emptyTitle}>{error ? 'Something went wrong' : 'No Product found'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                    <Icon name="refresh" size={14} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#3562a6" />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{route.params?.name}</Text>
                <View style={{ width: 20 }} />
            </View>

            {/* Search + controls */}
            <View style={[styles.controlsRow, isTablet && styles.controlsRowTablet]}>
                <View style={styles.searchWrap}>
                    <Icon name="search" size={14} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        editable={!selectionMode}
                    />
                    {!!search && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Icon name="times-circle" size={16} color="#bbb" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.iconSquareBtn}
                    onPress={() => setSortAsc((s) => !s)}
                    disabled={selectionMode}
                >
                    <Text style={styles.sortText}>A{sortAsc ? '↓' : '↑'}Z</Text>
                </TouchableOpacity>

                {/* Assign dropdown trigger — sits right beside the sort icon */}
                <TouchableOpacity
                    style={[styles.iconSquareBtn, styles.assignBtn]}
                    onPress={openAssignMenu}
                    disabled={selectionMode}
                >
                    <Icon name="user-plus" size={15} color="#333" />
                    <Icon name="chevron-down" size={9} color="#333" style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Grid / list layout toggle */}
                <TouchableOpacity
                    style={styles.iconSquareBtn}
                    onPress={toggleViewMode}
                    disabled={selectionMode}
                >
                    <Icon name={viewMode === 'list' ? 'th-large' : 'bars'} size={16} color="#333" />
                </TouchableOpacity>
            </View>

            {dateFilter !== 'All' && (
                <View style={styles.activeFilterRow}>
                    <Text style={styles.activeFilterText}>Filter: {dateFilter}</Text>
                    <TouchableOpacity onPress={() => setDateFilter('All')}>
                        <Icon name="times" size={12} color="#3562a6" />
                    </TouchableOpacity>
                </View>
            )}

            {selectionMode && (
                <View style={styles.selectionBanner}>
                    <Text style={styles.selectionBannerText}>
                        {assignTypeLabel} — select products
                    </Text>
                    <TouchableOpacity onPress={cancelSelection}>
                        <Text style={styles.selectionCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Initial loading state */}
            {initialLoading ? (
                <View style={styles.initialLoading}>
                    <ActivityIndicator size="large" color="#3562a6" />
                </View>
            ) : (
                <FlatList
                    data={displayedItems}
                    keyExtractor={(item) => String(item.id)}
                    key={`${viewMode}-${numColumns}`} // force clean re-mount when mode or column count changes
                    numColumns={numColumns}
                    columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingHorizontal: isTablet ? 24 : 12 },
                        selectionMode && { paddingBottom: 100 }, // room for bottom action bar
                    ]}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={{ height: viewMode === 'grid' ? 12 : 10 }} />}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.4}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3562a6']}
                            tintColor="#3562a6"
                            enabled={!selectionMode}
                        />
                    }
                />
            )}
            {
                assignLoading &&
                <View style={{ position: "absolute", flex: 1, backgroundColor: '#89000000', width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#3562a6" />
                </View>
            }

            {/* Bottom action bar shown only during selection mode */}
            {selectionMode && (
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                    <Text style={styles.bottomBarCount}>{selectedCount} selected</Text>
                    <TouchableOpacity
                        style={[styles.doneBtn, selectedCount === 0 && styles.doneBtnDisabled]}
                        onPress={onPressDone}
                        disabled={selectedCount === 0}
                    >
                        <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Assign dropdown menu */}
            <Modal visible={assignMenuVisible} transparent animationType="fade" onRequestClose={closeAssignMenu}>
                <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeAssignMenu}>
                    <View style={[styles.menuCard, { top: insets.top + 100, right: isTablet ? 24 : 12 }]}>
                        {ASSIGN_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={styles.menuItem}
                                onPress={() => chooseAssignOption(opt.key)}
                            >
                                <Text style={styles.menuItemText}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Selected items summary after Done */}
            <Modal visible={summaryVisible} transparent animationType="slide" onRequestClose={() => setSummaryVisible(false)}>
                <View style={styles.summaryOverlay}>
                    <View style={[styles.summarySheet, isTablet && styles.summarySheetTablet]}>
                        <Text style={styles.summaryTitle}>{assignTypeLabel}</Text>
                        <Text style={styles.summarySubtitle}>{selectedCount} product{selectedCount !== 1 ? 's' : ''} selected</Text>

                        <FlatList
                            data={selectedProducts}
                            keyExtractor={(item) => String(item.id)}
                            style={{ maxHeight: 320 }}
                            renderItem={({ item }) => (
                                <View style={styles.summaryRow}>
                                    {item.thumb ? (
                                        <Image source={{ uri: item.thumb }} style={styles.summaryThumb} />
                                    ) : (
                                        <View style={[styles.summaryThumb, styles.imagePlaceholder]}>
                                            <Icon name="medkit" size={16} color="#bbb" />
                                        </View>
                                    )}
                                    <Text style={styles.summaryItemName} numberOfLines={1}>{item.name}</Text>
                                </View>
                            )}
                        />

                        <View style={styles.summaryActions}>
                            <TouchableOpacity style={styles.summaryCancelBtn} onPress={() => setSummaryVisible(false)}>
                                <Text style={styles.summaryCancelText}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.summaryConfirmBtn} onPress={confirmAssign}>
                                <Text style={styles.summaryConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        flex: 1,
        color: 'black',
        fontSize: 19,
        fontWeight: '500',
        fontFamily: fonts.POPPINS_REGULAR,
        marginLeft: 20,
    },

    controlsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, gap: 10 },
    controlsRowTablet: { paddingHorizontal: 24 },
    searchWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#222', padding: 0 },
    iconSquareBtn: {
        width: 44, height: 44, borderRadius: 10, backgroundColor: '#F2F2F2',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    },
    assignBtn: { width: 'auto', paddingHorizontal: 10 },
    sortText: { fontSize: 13, fontWeight: '700', color: '#333' },

    activeFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
    activeFilterText: { fontSize: 12, color: '#3562a6', fontWeight: '600' },

    selectionBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#EAF1FB',
    },
    selectionBannerText: { fontSize: 13, color: '#3562a6', fontWeight: '600', flex: 1 },
    selectionCancelText: { fontSize: 13, color: '#D2434B', fontWeight: '700' },

    listContent: { paddingBottom: 40, flexGrow: 1 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cardHalf: { flex: 1 },

    // ---------- Grid layout ----------
    gridCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    gridImageWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
    gridImage: { width: '100%', height: '100%' },
    gridCheckbox: {
        position: 'absolute', top: 8, left: 8, marginRight: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    gridContent: { padding: 8 },

    checkbox: {
        width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#bbb',
        alignItems: 'center', justifyContent: 'center', marginRight: 10,
    },
    checkboxChecked: { backgroundColor: '#3562a6', borderColor: '#3562a6' },
    imageWrap: { marginRight: 12 },
    image: { width: 60, height: 60, borderRadius: 6 },
    imagePlaceholder: { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#222' },
    itemQty: { fontSize: 12, color: '#888', marginTop: 2 },
    priceRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    itemMrp: { fontSize: 12, color: '#333', fontWeight: '600' },
    itemPtr: { fontSize: 12, color: '#268872', fontWeight: '600' },

    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 6 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: '#444', marginTop: 8 },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#3562a6',
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8,
    },
    retryText: { color: '#fff', fontSize: 13, fontWeight: '700' },

    initialLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    footerLoading: { paddingVertical: 20, alignItems: 'center' },

    bottomBar: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 14,
        borderTopWidth: 1, borderTopColor: '#eee',
        shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -2 }, shadowRadius: 6,
        elevation: 8,
    },
    bottomBarCount: { fontSize: 14, fontWeight: '700', color: '#333' },
    doneBtn: { backgroundColor: '#3562a6', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
    doneBtnDisabled: { backgroundColor: '#ccc' },
    doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
    menuCard: {
        position: 'absolute', backgroundColor: '#fff', borderRadius: 10,
        paddingVertical: 6, minWidth: 220,
        shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
        elevation: 10,
    },
    menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
    menuItemText: { fontSize: 14, color: '#333', fontWeight: '500' },

    summaryOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    summarySheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center',
    },
    summarySheetTablet: { borderRadius: 16, marginBottom: 40 },
    summaryTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
    summarySubtitle: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
    summaryThumb: { width: 36, height: 36, borderRadius: 6 },
    summaryItemName: { fontSize: 13, color: '#333', flex: 1 },
    summaryActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    summaryCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    summaryCancelText: { fontSize: 14, fontWeight: '600', color: '#555' },
    summaryConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#3562a6', alignItems: 'center' },
    summaryConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    favoriteBtn: {
        paddingLeft: 8,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProductComponent;
export { ProductComponent };
