import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    useWindowDimensions,
    Clipboard,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import AppointmentActionIcons from '../../component/AppointmentActionIcons';
//import CloseAppointmentModal from '../../component/CloseAppointmentModal';
import ExpandableFab from '../../component/ExpandableFab';
import { useDispatch, useSelector } from 'react-redux';
import { CANCEL_APPOINTMENT_API, IMAGE_BASE_URL } from '../../services/api-end-points';
import { request } from '../../services/services';
import { fetchAppointment } from '../addDoctor/hospitalThunks';
import { HTTP_METHODS } from '../../services/api-constants';
import AppHeader from '../../component/AppHeader';

// ---------- Mock data ----------
// const DOCTOR_NAMES = [
//     'Harsh Harani', 'Rahul Mehta', 'Dr. Sarah Mitchell', 'Dr. James Carter',
//     'Dr. Emily Chen', 'Dr. Michael Brown', 'Dr. Priya Nair', 'Dr. Robert Lee',
// ];
//const STATUSES = ['Confirmed', 'Pending', 'Cancelled', 'Closed'];
const STATUS_COLORS = {
    scheduled: '#268872',
    rescheduled: '#B98900',
    cancelled: '#D2434B',
    Closed: '#777777',
};
//const TIMES = ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:45 PM', '04:00 PM'];

const pad = (n) => String(n).padStart(2, '0');
//const formatISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// const generateMockAppointments = (count) =>
//     Array.from({ length: count }, (_, i) => {
//         // Spread mock dates across the past ~3 years for variety, matching the screenshot
//         const d = new Date();
//         d.setDate(d.getDate() - i * 37 - (i % 5));
//         d.setFullYear(d.getFullYear() - (i % 3));
//         return {
//             id: `appt-${i + 1}`,
//             doctorName: DOCTOR_NAMES[i % DOCTOR_NAMES.length],
//             date: formatISODate(d),
//             time: TIMES[i % TIMES.length],
//             status: STATUSES[i % STATUSES.length],
//         };
//     });

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

// ---------- Component ----------
const AllAppointmentComponent = () => {
    const navigation = useNavigation();
    //
    const dispatch = useDispatch();
    const { appointmentData } = useSelector((state) => state.hospitalReducer)
    const { profile_picture } = useSelector((state) => state.auth.userData);
    //
    const { width } = useWindowDimensions();
    const isTableLayout = width >= 700;

    //    const allAppointments = useMemo(() => generateMockAppointments(37), []);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [perPageMenuVisible, setPerPageMenuVisible] = useState(false);

    const [closeModalVisible, setCloseModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return appointmentData;
        const q = search.trim().toLowerCase();
        return appointmentData.filter(
            (a) => a.doctor_name.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)
        );
    }, [search, appointmentData]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * itemsPerPage;
    const pageData = filtered.slice(start, start + itemsPerPage);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    const openCloseModal = (appointment) => {
        setSelectedAppointment(appointment);
        setCloseModalVisible(true);
    };

    const handleCloseSubmit = (reason) => {
        // TODO: wire to real API / redux action using selectedAppointment.id + reason
        console.log('Closing appointment', selectedAppointment?.id, 'reason:', reason);
        setCloseModalVisible(false);
        setSelectedAppointment(null);
    };

    const handleEdit = (item) => {
        // TODO: navigate to edit screen with item
        navigation.navigate('EditAppointment', item)
    };

    const handleDelete = (item) => {
        // TODO: confirm + delete

        navigation.navigate('ConfirmModal', {
            title: 'Cancel',
            messageTemplate: "Are you sure to cancel {item} ?",
            itemName: 'Appointment',
            onConfirm: () => {
                setTimeout(() => {
                    navigation.navigate('CancelReason', item);
                }, 100);
            },
        })
    };

    const StatusBadge = ({ status }) => (
        <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[status] || '#999') + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] || '#999' }]}>{capitalizeFirstLetter(status)}</Text>
        </View>
    );

    // function splitDateTime(isoString) {
    //     const date = new Date(isoString);
    //     const pad = (num) => String(num).padStart(2, '0');

    //     const year = date.getUTCFullYear();
    //     const month = pad(date.getUTCMonth() + 1);
    //     const day = pad(date.getUTCDate());
    //     const hours = pad(date.getUTCHours());
    //     const minutes = pad(date.getUTCMinutes());
    //     const seconds = pad(date.getUTCSeconds());

    //     const datePart = `${year}-${month}-${day}`;
    //     const timePart = `${hours}:${minutes}:${seconds}`;

    //     return { datePart, timePart };
    // }

    const formatTimeForRow = (d) => {
        const date = d instanceof Date ? d : new Date(d);
        return d ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    };

    const formatDateForRow = (d) => {
        const date = d instanceof Date ? d : new Date(d);
        return d ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, { flex: 1.3 }]}>Dr. Name</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>Appointment Date</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Appointment Time</Text>
            <Text style={[styles.headerCell, { flex: 0.9 }]}>Status</Text>
            <Text style={[styles.headerCell, { flex: 1.1, textAlign: 'right' }]}>Action</Text>
        </View>
    );
    const capitalizeFirstLetter = (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();

        date.setHours(Number(hours), Number(minutes));

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    const renderTableRow = ({ item }) => {
        //const { datePart, timePart } = splitDateTime(item.appointment_at);
        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 1.3 }]} numberOfLines={1}>{item.doctor_name}</Text>
                <Text style={[styles.cell, { flex: 1.2 }]}>{formatDateForRow(item.appointment_at)}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{formatTime(formatTimeForRow(item.appointment_at))}</Text>
                <View style={{ flex: 0.9 }}><StatusBadge status={item.status} /></View>
                <View style={{ flex: 1.1, alignItems: 'flex-end' }}>
                    <AppointmentActionIcons
                        onEdit={() => handleEdit(item)}
                        onClose={() => handleDelete(item)}
                        //onDelete={() => handleDelete(item)}
                        isDeleteDisable={item.status === 'cancelled'}
                        isEditDisable={item.status === 'cancelled'}
                    />
                </View>
            </View>
        )
    };

    const renderCard = ({ item }) => {
        //const { datePart, timePart } = splitDateTime(item.appointment_at);
        return (
            <View style={styles.card}>
                <View style={styles.cardTopRow}>
                    <Text style={styles.cardDoctor} numberOfLines={1}>{item.doctor_name}</Text>
                    <StatusBadge status={item.status} />
                </View>
                <View style={styles.cardMetaRow}>
                    <Icon name="calendar" size={12} color="#888" />
                    <Text style={styles.cardMetaText}>{formatDateForRow(item.appointment_at)}</Text>
                    <Icon name="clock-o" size={12} color="#888" style={{ marginLeft: 14 }} />
                    <Text style={styles.cardMetaText}>{formatTime(formatTimeForRow(item.appointment_at))}</Text>
                </View>
                <View style={{ marginTop: 12 }}>
                    <AppointmentActionIcons
                        onEdit={() => handleEdit(item)}
                        onClose={() => handleDelete(item)}
                        //onDelete={() => handleDelete(item)}
                        isDeleteDisable={item.status === 'cancelled'}
                        isEditDisable={item.status === 'cancelled'}
                    />
                </View>
            </View>
        )
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
            {/* Top app bar */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={openDrawer} hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
                    <Icon name="bars" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Konsyl Pharmaceuticals</Text>
                <TouchableOpacity onPress={() => { navigation.navigate('myProfile') }}>
                    {
                        profile_picture ?
                            <Image
                                source={{ uri: `${IMAGE_BASE_URL}/${profile_picture}` }}
                                style={styles.avatar}
                            /> :
                            <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                                <TextInputPaper.Icon icon={'account'} />
                            </View>
                    }
                </TouchableOpacity>
            </View> */}
            <AppHeader
                title="All Appointment"
                onLeftPress={() => navigation.goBack()}
                leftIconName="chevron-left"
                rightType="none"
                onRightPress={() => navigation.navigate('myProfile')}
            />
            <FlatList
                data={pageData}
                keyExtractor={(item) => item.id}
                key={isTableLayout ? 'table' : 'cards'}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingHorizontal: isTableLayout ? 20 : 12 },
                ]}
                ListHeaderComponent={
                    <>
                        <View style={[styles.subHeader, !isTableLayout && styles.subHeaderStacked]}>
                            <Text style={styles.titleText}>All Appointments</Text>
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
                                visible={perPageMenuVisible}
                                onDismiss={() => setPerPageMenuVisible(false)}
                                anchor={
                                    <TouchableOpacity
                                        style={styles.perPageBtn}
                                        onPress={() => setPerPageMenuVisible(true)}
                                    >
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

            {/* <ExpandableFab
                mainColor={colors.ICON_COLOR_PRIMARY}
                actions={[
                    { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { } },
                    { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { } },
                    { label: 'Add Doctor', icon: 'plus', color: '#55D88A', onPress: () => { } },
                ]}
            /> */}

            {/* <CloseAppointmentModal
                visible={closeModalVisible}
                doctorName={selectedAppointment?.doctorName || ''}
                onClose={() => setCloseModalVisible(false)}
                onSubmit={handleCloseSubmit}
            /> */}
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

    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
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
});

export default AllAppointmentComponent;
export { AllAppointmentComponent };