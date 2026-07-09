import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';

// ---------- Mock data ----------
const MOCK_MEDICINES = Array.from({ length: 34 }, (_, i) => {
    const base = [
        { name: 'LEUTON 200 (SOFTULES)', qty: '10 CAP', description: 'MICRONISE PROGESTERONE 200 MG SOFT GELATIN CAPSULE' },
        { name: 'ALKOR SYRUP', qty: '100 ML', description: 'EACH 5 ML CONTAINS : DISODIUM HYDROGEN CITRATE B.P 1.2 GM' },
        { name: 'MYOFERTIL TABLET', qty: '1X10', description: 'MYO-INOSITOL 1000MG + D-CHIRO INOSITOL' },
        { name: 'BETADINE OINTMENT', qty: '20 GM', description: 'POVIDONE IODINE OINTMENT USP 5% W/W' },
        { name: 'CALPOL 500', qty: '15 TAB', description: 'PARACETAMOL TABLETS I.P. 500 MG' },
        { name: 'DOLO 650', qty: '15 TAB', description: 'PARACETAMOL TABLETS I.P. 650 MG' },
    ];
    const item = base[i % base.length];
    return {
        id: `med-${i + 1}`,
        name: `${item.name}${i >= base.length ? ` (${Math.floor(i / base.length) + 1})` : ''}`,
        qty: item.qty,
        description: item.description,
        image: `https://picsum.photos/seed/med${i}/200/200`,
    };
});

const ITEMS_PER_PAGE_OPTIONS = [6, 10, 20, 50];

const MedicineListComponent = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [perPageMenuVisible, setPerPageMenuVisible] = useState(false);

    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    const filteredSorted = useMemo(() => {
        let data = MOCK_MEDICINES;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            data = data.filter((m) => m.name.toLowerCase().includes(q));
        }
        return [...data].sort((a, b) =>
            sortDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );
    }, [search, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / itemsPerPage));
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * itemsPerPage;
    const pageData = filteredSorted.slice(start, start + itemsPerPage);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    const toggleSort = () => { setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc')); setPage(0); };
    const toggleView = () => setViewMode((v) => (v === 'list' ? 'grid' : 'list'));

    const onSearchChange = (t) => { setSearch(t); setPage(0); };

    const numColumns = useMemo(() => {
        if (viewMode !== 'grid') return 1;
        if (!isTabletWidth) return 1;
        if (width >= 1000) return 3;
        return 2;
    }, [viewMode, isTabletWidth, width]);

    const handleDelete = (item) => {
        // TODO: confirm + delete via API/redux
        console.log('Delete', item.id);
    };

    const renderListItem = ({ item }) => (
        <View style={styles.listRow}>
            <Image source={{ uri: item.image }} style={styles.listThumb} resizeMode="cover" />
            <View style={styles.listInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.qty}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <TouchableOpacity style={styles.deleteCircle} onPress={() => handleDelete(item)}>
                <Icon name="trash-o" size={17} color="#D2434B" />
            </TouchableOpacity>
        </View>
    );

    const renderGridItem = ({ item }) => (
        <View style={styles.gridCard}>
            <Image source={{ uri: item.image }} style={styles.gridThumb} resizeMode="cover" />
            <View style={styles.gridInfo}>
                <View style={styles.gridTopRow}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <TouchableOpacity style={styles.deleteCircleSmall} onPress={() => handleDelete(item)}>
                        <Icon name="trash-o" size={15} color="#D2434B" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.itemQty}>{item.qty}</Text>
                <Text style={styles.itemDesc} numberOfLines={3}>{item.description}</Text>
            </View>
        </View>
    );

    const PaginationFooter = () => (
        <View style={[styles.footer, !isTabletWidth && styles.footerStacked]}>
            <View style={styles.footerLeft}>
                <Text style={styles.footerLabel}>Items per page:</Text>
                <Menu
                    visible={perPageMenuVisible}
                    onDismiss={() => setPerPageMenuVisible(false)}
                    anchor={
                        <TouchableOpacity style={styles.perPageBtn} onPress={() => setPerPageMenuVisible(true)}>
                            <Text style={styles.perPageText}>{itemsPerPage}</Text>
                            <Icon name="caret-down" size={12} color="#555" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    }
                >
                    {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                        <Menu.Item
                            key={opt}
                            onPress={() => { setItemsPerPage(opt); setPage(0); setPerPageMenuVisible(false); }}
                            title={String(opt)}
                        />
                    ))}
                </Menu>
            </View>
            <View style={styles.footerRight}>
                <Text style={styles.footerCount}>
                    {filteredSorted.length === 0
                        ? '0 of 0'
                        : `${start + 1}-${Math.min(filteredSorted.length, start + itemsPerPage)} of ${filteredSorted.length}`}
                </Text>
                <TouchableOpacity
                    onPress={goPrev}
                    disabled={clampedPage === 0}
                    style={[styles.pagerBtn, clampedPage === 0 && styles.pagerBtnDisabled]}
                >
                    <Icon name="chevron-left" size={14} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={goNext}
                    disabled={clampedPage >= totalPages - 1}
                    style={[styles.pagerBtn, clampedPage >= totalPages - 1 && styles.pagerBtnDisabled]}
                >
                    <Icon name="chevron-right" size={14} color="#555" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#E9E9E9' }}>
            {/* Header */}
            <View style={styles.header}>
                {/* <TouchableOpacity onPress={openDrawer} hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
                    <Icon name="bars" size={20} color="#fff" />
                </TouchableOpacity> */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Harsh Harani</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Icon name="trash-o" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {navigation.navigate('DoctorProfile')}}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Icon name="user-o" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search + controls */}
            <View style={[styles.controlsRow, { paddingHorizontal: isTabletWidth ? 24 : 14 }]}>
                <View style={styles.searchWrap}>
                    <Icon name="search" size={16} color="#888" style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={onSearchChange}
                        style={styles.searchInput}
                    />
                </View>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleView}>
                    <Icon name={viewMode === 'list' ? 'th-large' : 'list-ul'} size={17} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleSort}>
                    <Text style={styles.sortLabel}>A{sortDirection === 'asc' ? '↓Z' : '↑Z'}</Text>
                </TouchableOpacity>
            </View>

            {/* List / Grid */}
            <FlatList
                data={pageData}
                keyExtractor={(item) => item.id}
                key={`${viewMode}-${numColumns}`}
                numColumns={numColumns}
                columnWrapperStyle={viewMode === 'grid' && numColumns > 1 ? styles.gridRow : undefined}
                renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingHorizontal: isTabletWidth ? 24 : 0 },
                ]}
                ItemSeparatorComponent={
                    viewMode === 'list' ? () => <View style={styles.divider} /> : undefined
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>No medicines found</Text>
                    </View>
                }
                ListFooterComponent={pageData.length > 0 ? <PaginationFooter /> : null}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 16,
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    headerActions: { flexDirection: 'row', gap: 20 },

    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        backgroundColor: '#E9E9E9',
    },
    searchWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 48,
        elevation: 1,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#222', padding: 0 },
    controlBtn: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    sortLabel: { fontSize: 14, fontWeight: '700', color: '#333' },

    listContent: { paddingBottom: 12, backgroundColor: '#fff', flexGrow: 1 },

    // List view
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        gap: 14,
    },
    listThumb: { width: 78, height: 78, borderRadius: 6, backgroundColor: '#F0F0F0' },
    listInfo: { flex: 1 },
    divider: { height: 1, backgroundColor: '#EFEFEF' },

    // Grid view
    gridRow: { gap: 14, paddingHorizontal: 0 },
    gridCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EEE',
        marginBottom: 14,
        overflow: 'hidden',
    },
    gridThumb: { width: '100%', height: 120, backgroundColor: '#F0F0F0' },
    gridInfo: { padding: 12 },
    gridTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },

    // Shared text
    itemName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
    itemQty: { fontSize: 12, color: '#777', marginTop: 3, fontWeight: '600' },
    itemDesc: { fontSize: 11, color: '#999', marginTop: 4, lineHeight: 15 },

    deleteCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteCircleSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyWrap: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#999' },

    // Pagination footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        gap: 20,
        backgroundColor: '#fff',
    },
    footerStacked: { justifyContent: 'space-between' },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    footerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    footerLabel: { fontSize: 13, color: '#777' },
    perPageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 2,
    },
    perPageText: { fontSize: 13, fontWeight: '600', color: '#222' },
    footerCount: { fontSize: 13, color: '#777' },
    pagerBtn: { padding: 6 },
    pagerBtnDisabled: { opacity: 0.3 },
});

export default MedicineListComponent;
export { MedicineListComponent };