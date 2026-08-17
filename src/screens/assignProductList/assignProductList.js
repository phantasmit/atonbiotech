import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    useWindowDimensions,
    Platform,
    LayoutAnimation,
    UIManager,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch } from 'react-redux';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { request } from '../../services/services';
import {
    DELETE_LABEL_API,
    DELETE_DOCTOR_API,
    DELETE_PRODUCT_FROM_LABEL_API,
    GET_PRODUCT_LIST_FOR_LABEL_API,
    GET_PRODUCT_LIST_FOR_DOCTOR_API,
    REMOVE_PRODUCT_TO_HOSPITAL_API
} from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import { fetchHospitals, fetchLabels } from '../addDoctor/hospitalThunks';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

//
const AssignProductList = ({ navigation, route }) => {
    const { name: title, doctor_name, id, indexPos } = route.params ?? {};
    //
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isTablet = width >= 600;
    //
    const [headerTitle, setHeaderTitle] = useState((indexPos === 1) ? doctor_name : title)
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [sortAsc, setSortAsc] = useState(true);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    //
    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            if (indexPos === 1) {
                await request(DELETE_DOCTOR_API(id), HTTP_METHODS.DELETE, {})
                dispatch(fetchHospitals())
            } else {
                await request(DELETE_LABEL_API(id), HTTP_METHODS.DELETE, {})
                dispatch(fetchLabels())
            }
            navigation.goBack()
        } catch (e) {
            alert(e?.response?.data?.message)
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        let isActive = true;
        const loadProducts = async () => {
            try {

                if (indexPos === 1) {
                    const result = await request(GET_PRODUCT_LIST_FOR_DOCTOR_API(id), HTTP_METHODS.GET, {});
                    if (!isActive) return; // screen was unmounted / navigated back — bail out
                    setItems(result?.response?.data?.data ?? []);
                    setIsLoading(false)
                } else {
                    const result = await request(GET_PRODUCT_LIST_FOR_LABEL_API(id), HTTP_METHODS.GET, {});
                    if (!isActive) return; // screen was unmounted / navigated back — bail out
                    setItems(result?.response?.data?.data ?? []);
                    setIsLoading(false)
                }
            } catch (err) {
                if (!isActive) return;
                console.error('Failed to load products', err);
                alert(err?.message)
                setIsLoading(false)
            }
        };
        setIsLoading(true)
        loadProducts();

        return () => {
            isActive = false;
        };
    }, [id]);

    const numColumns = viewMode === 'list' ? 1 : (width >= 900 ? 4 : width >= 600 ? 3 : 2);

    const displayedItems = useMemo(() => {
        let list = items;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (item) =>
                    item.name?.toLowerCase().includes(q) ||
                    item.description?.toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) =>
            sortAsc ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '')
        );
    }, [items, search, sortAsc]);

    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
    };

    const enterSelectionMode = () => {
        navigation.navigate('ConfirmModal', {
            itemName: headerTitle,
            onConfirm: () => handleConfirm(),
        })
    };

    // const toggleSelect = (productId) => {
    //     setSelectedIds((prev) => {
    //         const next = { ...prev };
    //         next[productId] ? delete next[productId] : (next[productId] = true);
    //         return next;
    //     });
    // };

    const handleRowDelete = useCallback((product) => {
        navigation.navigate('ConfirmModal', {
            itemName: product.name,//(indexPos === 1) ? JSON.stringify(product) : product.name,
            onConfirm: async () => {
                if (indexPos === 1) {
                    await request(REMOVE_PRODUCT_TO_HOSPITAL_API(id, product.id), HTTP_METHODS.DELETE, {})
                } else {
                    await request(DELETE_PRODUCT_FROM_LABEL_API(id, product.id), HTTP_METHODS.DELETE, {})
                }
                setItems((prev) => prev.filter((p) => p.id !== product.id));
            },
        })
    }, [dispatch, id]);

    const handleEdit = () => {
        //
        navigation.navigate('EditModal', {
            id: id,
            labelText: headerTitle,
            indexPosition: indexPos,
            updateLabel: (title) => {
                setHeaderTitle(title)
            }
        })
    };
    const formatCurrency = (value) => `₹${(Number(value) || 0).toFixed(2)}`;
    const renderListItem = ({ item }) => {
        const isSelected = !!selectedIds[item.id];
        return (
            <TouchableOpacity
                activeOpacity={selectionMode ? 0.7 : 1}
                onPress={() => { navigation.navigate('productDetail', item) }}
                style={styles.row}
            >
                {selectionMode && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Icon name="check" size={11} color={colors.SURFACE ?? '#fff'} />}
                    </View>
                )}
                {item.thumb ? (
                    <Image source={{ uri: item.thumb }} style={styles.rowImage} />
                ) : (
                    <View style={[styles.rowImage, styles.imagePlaceholder]}>
                        <Icon name="medkit" size={20} color="#bbb" />
                    </View>
                )}
                <View style={styles.rowContent}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {!!item.packaging && (
                        <Text style={styles.itemQty} numberOfLines={1}>{item.packaging}</Text>
                    )}
                    <View style={styles.priceRow}>
                        <Text style={styles.itemMrp}>MRP {formatCurrency(item.mrp)}</Text>
                        {item.ptr > 0 && <Text style={styles.itemPtr}>PTR {formatCurrency(item.ptr)}</Text>}
                    </View>
                    {/* {!!item.qty && <Text style={styles.itemQty} numberOfLines={1}>{item.qty}</Text>}
                    {!!item.description && (
                        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                    )}

                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                   
                     */}

                </View>
                {!selectionMode && (
                    <TouchableOpacity
                        style={styles.rowDeleteBtn}
                        onPress={() => handleRowDelete(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Icon name="trash" size={16} color={colors.DANGER ?? '#D2434B'} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderGridItem = ({ item }) => {
        const isSelected = !!selectedIds[item.id];
        return (
            <TouchableOpacity
                activeOpacity={selectionMode ? 0.7 : 1}
                onPress={() => { navigation.navigate('productDetail', item) }}
                style={styles.gridCard}
            >
                <View style={styles.gridImageWrap}>
                    {item.thumb ? (
                        <Image source={{ uri: item.thumb }} style={styles.gridImage} />
                    ) : (
                        <View style={[styles.gridImage, styles.imagePlaceholder]}>
                            <Icon name="medkit" size={24} color="#bbb" />
                        </View>
                    )}
                    {selectionMode ? (
                        <View style={[styles.checkbox, styles.gridCorner, isSelected && styles.checkboxChecked]}>
                            {isSelected && <Icon name="check" size={11} color={colors.SURFACE ?? '#fff'} />}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.rowDeleteBtn, styles.gridCorner]}
                            onPress={() => handleRowDelete(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Icon name="trash" size={14} color={colors.DANGER ?? '#D2434B'} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.gridContent}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {!!item.qty && <Text style={styles.itemQty} numberOfLines={1}>{item.qty}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyWrap}>
            <Icon name="inbox" size={36} color="#ccc" />
            <Text style={styles.emptyTitle}>No product found</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.SURFACE ?? '#fff' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {headerTitle}
                </Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleEdit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginRight: 18 }}>
                        <Icon name="pencil" size={17} color={colors.SURFACE ?? 'black'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={enterSelectionMode} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginRight: 18 }}>
                        <Icon name="trash" size={18} color={colors.SURFACE ?? 'black'} />
                    </TouchableOpacity>

                </View>
            </View>

            {/* Controls */}
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

                <TouchableOpacity style={styles.iconSquareBtn} onPress={toggleViewMode} disabled={selectionMode}>
                    <Icon name={viewMode === 'list' ? 'th-large' : 'bars'} size={16} color={colors.TEXT_PRIMARY ?? '#333'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconSquareBtn} onPress={() => setSortAsc((s) => !s)} disabled={selectionMode}>
                    <Text style={styles.sortText}>A{sortAsc ? '↓' : '↑'}Z</Text>
                </TouchableOpacity>
            </View>

            {/* {selectionMode && selectedCount > 0 && (
                <TouchableOpacity style={styles.bulkDeleteBar} onPress={handleBulkDelete}>
                    <Icon name="trash" size={14} color={colors.DANGER ?? '#D2434B'} />
                    <Text style={styles.bulkDeleteText}>Delete {selectedCount} selected</Text>
                </TouchableOpacity>
            )} */}

            {/* List / grid */}
            <FlatList
                data={displayedItems}
                keyExtractor={(item) => String(item.id)}
                key={`${viewMode}-${numColumns}`}
                numColumns={numColumns}
                columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingHorizontal: isTablet ? 24 : 12 },
                ]}
                renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                ItemSeparatorComponent={() => <View style={{ height: viewMode === 'grid' ? 12 : 0 }} />}
                ListEmptyComponent={!isLoading && renderEmpty}
            />
            {
                isLoading &&
                <View style={{ flex: 1, width: '100%', height: '100%', alignItems: "center", justifyContent: "center", position: 'absolute', backgroundColor: '#89000000' }}>
                    <ActivityIndicator size="large" color="#3562a6" />
                </View>
            }

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
        color: colors.SURFACE ?? 'black',
        fontSize: 18,
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        marginLeft: 16,
    },
    headerActions: { flexDirection: 'row', alignItems: 'center' },

    controlsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, gap: 10 },
    controlsRowTablet: { paddingHorizontal: 24 },
    searchWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.INPUT_BG ?? '#F2F2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.TEXT_PRIMARY ?? '#222',
        fontFamily: fonts.POPPINS_REGULAR,
        padding: 0,
    },
    iconSquareBtn: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: colors.INPUT_BG ?? '#F2F2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sortText: {
        fontSize: 13,
        fontFamily: fonts.POPPINS_SEMIBOLD ?? fonts.POPPINS_REGULAR,
        color: colors.TEXT_PRIMARY ?? '#333',
    },

    bulkDeleteBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 12,
        marginBottom: 10,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.DANGER_BG ?? '#FBECEB',
    },
    bulkDeleteText: {
        fontSize: 13,
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: colors.DANGER ?? '#D2434B',
    },

    listContent: { paddingBottom: 40, flexGrow: 1 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.SURFACE ?? '#fff',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.BORDER ?? '#eee',
        marginBottom: 10,
    },
    rowImage: { width: 56, height: 56, borderRadius: 6, marginRight: 12 },
    rowContent: { flex: 1 },
    imagePlaceholder: {
        backgroundColor: colors.INPUT_BG ?? '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 15,
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: colors.TEXT_PRIMARY ?? '#222',
    },
    itemQty: {
        fontSize: 12,
        fontFamily: fonts.POPPINS_REGULAR,
        color: colors.TEXT_SECONDARY ?? '#888',
        marginTop: 2,
    },
    itemDesc: {
        fontSize: 12,
        fontFamily: fonts.POPPINS_REGULAR,
        color: colors.TEXT_SECONDARY ?? '#888',
        marginTop: 2,
    },
    rowDeleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.DANGER_BG ?? '#FBECEB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#bbb',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: colors.SURFACE ?? '#fff',
    },
    checkboxChecked: {
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        borderColor: colors.ICON_COLOR_PRIMARY,
    },

    gridCard: {
        flex: 1,
        backgroundColor: colors.SURFACE ?? '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.BORDER ?? '#eee',
        overflow: 'hidden',
    },
    gridImageWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
    gridImage: { width: '100%', height: '100%' },
    gridCorner: { position: 'absolute', top: 8, right: 8, marginRight: 0 },
    gridContent: { padding: 8 },

    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 6 },
    emptyTitle: {
        fontSize: 14,
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: colors.TEXT_SECONDARY ?? '#444',
        marginTop: 8,
    },
    priceRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    itemMrp: { fontSize: 12, color: '#333', fontWeight: '600' },
    itemPtr: { fontSize: 12, color: '#268872', fontWeight: '600' },
});

export default AssignProductList;
export { AssignProductList };