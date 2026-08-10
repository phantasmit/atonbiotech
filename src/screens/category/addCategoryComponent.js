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
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../addDoctor/hospitalThunks';

// ---------- Component ----------
const AddCategoryComponent = () => {
    const navigation = useNavigation();
    //
    const dispatch = useDispatch();
    const { categoryData, loading: categoryLoading } = useSelector((state) => state.hospitalReducer)
    //
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    // breakpoints: phone < 600, tablet/iPad >= 600, large tablet/landscape >= 900
    const isTablet = width >= 600;
    const numColumns = width >= 900 ? 2 : 1; // 2-column grid on large tablets/landscape iPad

    const [allItems, setAllItems] = useState([]); // full dataset from the single API call

    const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [dateFilter, setDateFilter] = useState('All');
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const isMountedRef = useRef(true);
    useEffect(() => () => { isMountedRef.current = false; }, []);

    useEffect(() => {
        // set Initial data if any available 
        //alert(JSON.stringify(categoryData))
        setAllItems(categoryData)
    }, [categoryData]);

    const onRefresh = useCallback(() => {
        // API need to call here again
        dispatch(fetchCategories())
    }, []);

    const onRetry = useCallback(() => {
        //API Need to call here again
        dispatch(fetchCategories())
    }, []);

    // ---------- Search + sort + date filter (client-side over full dataset) ----------
    const isWithinDateFilter = useCallback((itemDate) => {
        if (dateFilter === 'All') return true;
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
            list = list.filter((item) => item.name.toLowerCase().includes(q));
        }

        list = list.filter((item) => isWithinDateFilter(item.modifiedDate));

        list = [...list].sort((a, b) =>
            sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );

        return list;
    }, [allItems, search, sortAsc, isWithinDateFilter]);

    //const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    // ---------- Render helpers ----------
    // const formatDate = (d) =>
    //     d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    // Formats a Date -> "28 Jul 2026" (this is the exact string shape the API is expected to return)
    const formatDate = (d) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Parses "28 Jul 2026" -> Date object (for filtering/sorting only; display uses the raw string as-is)
    const parseDisplayDate = (str) => {
        const parsed = new Date(str);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };
    const STATUSES = ['Confirmed', 'Pending', 'Cancelled'];
    const STATUS_COLORS = {
        Active: '#268872',
        Inactive: '#B98900',
        Cancelled: '#D2434B',
    };
    const StatusBadge = ({ status }) => (
        <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[status] || '#999') + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] || '#999' }]}>{status}</Text>
        </View>
    );
    const renderItem = ({ item }) => (
        <View style={[styles.card, numColumns === 2 && styles.cardHalf]}>
            <View style={styles.imageWrap}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Icon name="medkit" size={22} color="#bbb" />
                    </View>
                )}
            </View>
            <TouchableOpacity onPress={() => {
                navigation.navigate('product', item)
            }} style={styles.cardContent}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.products_count}</Text>
                <Text style={styles.itemDesc} >{item.description}</Text>
                {/* <Text style={styles.itemDate}>{item.modifiedDate}</Text> */}
                {/* <View style={{ flex: 0.9 }}><StatusBadge status={item.status} /></View> */}
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="trash" size={18} color="#D2434B" />
            </TouchableOpacity> */}
        </View>
    );

    const renderEmpty = () => {
        if (categoryLoading.category) return null;
        return (
            <View style={styles.emptyWrap}>
                <Icon name="inbox" size={40} color="#ccc" />
                <Text style={styles.emptyTitle}>
                    {error ? 'Something went wrong' : 'No category found'}
                </Text>
                {/* <Text style={styles.emptySubtitle}>
                    {error || 'Try adjusting your search or filters'}
                </Text> */}
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                    <Icon name="refresh" size={14} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
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
                    />
                    {!!search && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Icon name="times-circle" size={16} color="#bbb" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.iconSquareBtn} onPress={() => setSortAsc((s) => !s)}>
                    <Text style={styles.sortText}>A{sortAsc ? '↓' : '↑'}Z</Text>
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

            {/* Initial loading state */}
            {categoryLoading.category ? (
                <View style={styles.initialLoading}>
                    <ActivityIndicator size="large" color="#3562a6" />
                </View>
            ) : (
                <FlatList
                    data={displayedItems}
                    keyExtractor={(item) => item.id}
                    key={numColumns} // force re-mount when column count changes (orientation change)
                    numColumns={numColumns}
                    columnWrapperStyle={numColumns === 2 ? { gap: 12 } : undefined}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingHorizontal: isTablet ? 24 : 12 },
                    ]}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3562a6']}
                            tintColor="#3562a6"
                        />
                    }
                />
            )}
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
        alignItems: 'center', justifyContent: 'center',
    },
    sortText: { fontSize: 13, fontWeight: '700', color: '#333' },

    activeFilterRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingBottom: 8,
    },
    activeFilterText: { fontSize: 12, color: '#3562a6', fontWeight: '600' },

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
    imageWrap: { marginRight: 12 },
    image: { width: 60, height: 60, borderRadius: 6 },
    imagePlaceholder: { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#222' },
    itemQty: { fontSize: 12, color: '#888', marginTop: 2 },
    itemDesc: { fontSize: 11, color: '#999', marginTop: 4 },
    itemDate: { fontSize: 10, color: '#bbb', marginTop: 4 },
    deleteBtn: { padding: 8, marginLeft: 4 },

    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 6 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: '#444', marginTop: 8 },
    emptySubtitle: { fontSize: 12, color: '#999', marginBottom: 12 },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#3562a6',
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8,
    },
    retryText: { color: '#fff', fontSize: 13, fontWeight: '700' },

    initialLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: '700' },
});

export default AddCategoryComponent;
export { AddCategoryComponent };