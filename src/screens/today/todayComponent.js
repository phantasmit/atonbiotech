import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    useWindowDimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import ExpandableFab from '../../component/ExpandableFab';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchHospitals, fetchLabels, fetchAppointment } from '../addDoctor/hospitalThunks';
// ---------- Mock data ----------
const DOCTOR_NAMES = [
    'Dr. Sarah Mitchell', 'Dr. James Carter', 'Dr. Emily Chen',
    'Dr. Michael Brown', 'Dr. Priya Nair', 'Dr. Robert Lee',
    'Dr. Anjali Verma', 'Dr. David Kim',
];
const STATUSES = ['Confirmed', 'Pending', 'Cancelled'];
const STATUS_COLORS = {
    Confirmed: '#268872',
    Pending: '#B98900',
    Cancelled: '#D2434B',
};
const TIMES = ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:45 PM', '04:00 PM'];

const formatDate = (d) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

const generateMockAppointments = (count, baseDate) =>
    Array.from({ length: count }, (_, i) => ({
        id: `appt-${i + 1}`,
        doctorName: DOCTOR_NAMES[i % DOCTOR_NAMES.length],
        date: formatDate(baseDate),
        time: TIMES[i % TIMES.length],
        status: STATUSES[i % STATUSES.length],
    }));

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

// ---------- Component ----------
const TodayComponent = () => {

    const navigation = useNavigation();
    //
    const dispatch = useDispatch();
    const { categoryData, hospitalData, labelData, appointmentData, loading, error } = useSelector((state) => state.hospitalReducer)
    //
    const { width } = useWindowDimensions();
    const isTableLayout = width >= 700; // tablet/iPad or landscape phone -> table, else cards

    const today = useMemo(() => new Date(), []);
    const allAppointments = useMemo(() => generateMockAppointments(23, today), [today]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [menuVisible, setMenuVisible] = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return allAppointments;
        const q = search.trim().toLowerCase();
        return allAppointments.filter((a) => a.doctorName.toLowerCase().includes(q));
    }, [search, allAppointments]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * itemsPerPage;
    const pageData = filtered.slice(start, start + itemsPerPage);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    // useEffect(() => {
    //     navigation.navigate('addDoctor')
    // }, [])

    const renderTableHeader = () => (
        <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, { flex: 1.3 }]}>Dr. Name</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>Appointment Date</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Appointment Time</Text>
            <Text style={[styles.headerCell, { flex: 0.9 }]}>Status</Text>
            <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Action</Text>
        </View>
    );

    const StatusBadge = ({ status }) => (
        <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[status] || '#999') + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] || '#999' }]}>{status}</Text>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 1.3 }]} numberOfLines={1}>{item.doctorName}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.date}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.time}</Text>
            <View style={{ flex: 0.9 }}><StatusBadge status={item.status} /></View>
            <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Icon name="eye" size={16} color="#3DC2FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                    <Icon name="pencil" size={15} color="#268872" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardTopRow}>
                <Text style={styles.cardDoctor} numberOfLines={1}>{item.doctorName}</Text>
                <StatusBadge status={item.status} />
            </View>
            <View style={styles.cardMetaRow}>
                <Icon name="calendar" size={12} color="#888" />
                <Text style={styles.cardMetaText}>{item.date}</Text>
                <Icon name="clock-o" size={12} color="#888" style={{ marginLeft: 14 }} />
                <Text style={styles.cardMetaText}>{item.time}</Text>
            </View>
            <View style={styles.cardActionsRow}>
                <TouchableOpacity style={styles.cardActionBtn}>
                    <Icon name="eye" size={13} color="#3DC2FF" />
                    <Text style={[styles.cardActionText, { color: '#3DC2FF' }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardActionBtn}>
                    <Icon name="pencil" size={13} color="#268872" />
                    <Text style={[styles.cardActionText, { color: '#268872' }]}>Edit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    useEffect(() => {
        Promise.allSettled([
            dispatch(fetchCategories()),
            dispatch(fetchHospitals()),
            dispatch(fetchLabels()),
            dispatch(fetchAppointment()),
        ])
    }, [])

    const isLoading = loading.category || loading.hospitals || loading.lables || loading.appointment;
    const isDataAvailable = (categoryData.length > 0) || (hospitalData.length > 0) || (labelData.length > 0) || (appointmentData.length > 0)

    if (isLoading && !isDataAvailable)
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size={'large'} color={'#3562a6'} style={{ alignSelf: "center" }} />
            </View>
        );
    else
        return (
            <View style={{ flex: 1, backgroundColor: colors.WHITE_COLOR }}>
                {/* Top app bar */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={openDrawer} hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
                        <Icon name="bars" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>Konsyl Pharmaceuticals</Text>
                    <TouchableOpacity onPress={() => { navigation.navigate('myProfile') }}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={pageData}
                    keyExtractor={(item) => item.id}
                    key={isTableLayout ? 'table' : 'cards'} // force re-mount layout cleanly when switching modes
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingHorizontal: isTableLayout ? 20 : 12 },
                    ]}
                    ListHeaderComponent={
                        <>
                            <View style={[styles.subHeader, !isTableLayout && styles.subHeaderStacked]}>
                                <Text style={styles.titleText}>
                                    Appointments: <Text style={styles.dateText}>{formatDate(today)}</Text>
                                </Text>
                                <View style={[styles.searchWrap, !isTableLayout && { width: '100%', marginTop: 10 }]}>
                                    <Icon name="search" size={14} color="#999" style={{ marginRight: 8 }} />
                                    <TextInput
                                        placeholder="Search"
                                        placeholderTextColor="#999"
                                        value={search}
                                        onChangeText={(t) => { setSearch(t); setPage(0); }}
                                        style={styles.searchInput}
                                    />
                                </View>
                            </View>
                            {isTableLayout && renderTableHeader()}
                        </>
                    }
                    renderItem={isTableLayout ? renderTableRow : renderCard}
                    ItemSeparatorComponent={() =>
                        isTableLayout ? <View style={styles.rowDivider} /> : <View style={{ height: 10 }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No Data Found!</Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={[styles.footer, !isTableLayout && styles.footerStacked]}>
                            <View style={styles.footerLeft}>
                                <Text style={styles.footerLabel}>Items per page:</Text>
                                <Menu
                                    visible={menuVisible}
                                    onDismiss={() => setMenuVisible(false)}
                                    anchor={
                                        <TouchableOpacity style={styles.perPageBtn} onPress={() => setMenuVisible(true)}>
                                            <Text style={styles.perPageText}>{itemsPerPage}</Text>
                                            <Icon name="caret-down" size={12} color="#555" style={{ marginLeft: 6 }} />
                                        </TouchableOpacity>
                                    }
                                >
                                    {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                                        <Menu.Item
                                            key={opt}
                                            onPress={() => { setItemsPerPage(opt); setPage(0); setMenuVisible(false); }}
                                            title={String(opt)}
                                        />
                                    ))}
                                </Menu>
                            </View>
                            <View style={styles.footerRight}>
                                <Text style={styles.footerCount}>
                                    {filtered.length === 0
                                        ? '0 of 0'
                                        : `${start + 1}-${Math.min(filtered.length, start + itemsPerPage)} of ${filtered.length}`}
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
                    }
                />

                {/* <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <Icon name="plus" size={22} color="#fff" />
            </TouchableOpacity> */}
                <ExpandableFab
                    mainColor={colors.ICON_COLOR_PRIMARY}
                    actions={[
                        { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { navigation.navigate('AddAppointment') } },
                        { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { navigation.navigate('AddLabel') } },
                        { label: 'Add Hospital', icon: 'plus', color: '#55D88A', onPress: () => { navigation.navigate('addDoctor') } },
                    ]}
                />
            </View>
        );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE_COLOR,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 16,
    },
    headerTitle: {
        flex: 1,
        color: 'black',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'black' },

    listContent: { paddingBottom: 100, paddingTop: 16 },

    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    subHeaderStacked: { flexDirection: 'column', alignItems: 'flex-start' },
    titleText: { fontSize: 20, fontWeight: '700', color: '#111', fontFamily: fonts.POPPINS_REGULAR },
    dateText: { color: colors.ICON_COLOR_PRIMARY },

    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 42,
        width: 260,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#222', padding: 0 },

    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 10,
    },
    headerCell: { fontSize: 13, fontWeight: '700', color: '#333' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    cell: { fontSize: 13, color: '#333', paddingRight: 6 },
    rowDivider: { height: 1, backgroundColor: '#F0F0F0' },
    iconBtn: { paddingHorizontal: 8 },

    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    card: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardDoctor: { flex: 1, fontSize: 15, fontWeight: '700', color: '#222', marginRight: 8 },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    cardMetaText: { fontSize: 12, color: '#666', marginLeft: 5 },
    cardActionsRow: { flexDirection: 'row', marginTop: 12, gap: 20 },
    cardActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cardActionText: { fontSize: 12, fontWeight: '600' },

    emptyWrap: { paddingVertical: 40, alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 8 },
    emptyText: { fontSize: 14, color: '#666' },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        gap: 20,
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

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

export default TodayComponent;
export { TodayComponent };