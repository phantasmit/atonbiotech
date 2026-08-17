// import React, { useEffect, useState } from 'react';
// import {
//     Modal,
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     useWindowDimensions,
//     KeyboardAvoidingView,
//     Platform,
//     Pressable,
//     FlatList,
//     ActivityIndicator,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import colors from '../assets/appColor/colors';
// import fonts from '../assets/fonts/fonts';
// import { useDispatch, useSelector } from 'react-redux';
// import { navigate } from '../navigation/RootNavigation';


// // --- Responsive helpers -----------------------------------------------
// // Base reference width = 375 (iPhone SE / standard small phone)
// const BASE_WIDTH = 375;

// const getBreakpoint = (width) => {
//     if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
//     if (width >= 600) return 'tablet';       // iPad mini/portrait, Android tablets
//     return 'phone';                          // all phones, iOS & Android
// };

// // Clamped scale factor so text/padding never blow up on huge tablets
// // or shrink too much on the smallest phones.
// const scale = (width, size) => {
//     const factor = width / BASE_WIDTH;
//     const clamped = Math.min(Math.max(factor, 0.9), 1.25);
//     return Math.round(size * clamped);
// };
// // ------------------------------------------------------------------------

// const AssignProduct = ({ navigation, route }) => {
//     const dispatch = useDispatch();
//     const onSubmit = route.params?.onSubmit;

//     const { width, height } = useWindowDimensions();
//     const insets = useSafeAreaInsets();

//     const breakpoint = getBreakpoint(width);
//     const fontScale = (size) => scale(width, size);

//     // NOTE: assumes hospitalReducer exposes labels the same way it exposes
//     // categories elsewhere in the app (categoryData / loading.category), e.g.
//     //   { labelData: [{ id, name }, ...], loading: { label: boolean } }
//     // Adjust these two lines if your reducer's actual field names differ.
//     const { labelData, hospitalData } = useSelector((state) => state.hospitalReducer);
//     const stateData = (route.params?.optionId == 0) ? labelData : hospitalData;

//     const [selectedIds, setSelectedIds] = useState({}); // { [id]: true }

//     // Fetch fresh labels from the store each time the modal opens, and
//     // reset any previous selection.
//     useEffect(() => {
//         setSelectedIds({});
//     }, []);

//     const toggleSelect = (id) => {
//         setSelectedIds((prev) => {
//             const next = { ...prev };
//             if (next[id]) delete next[id];
//             else next[id] = true;
//             return next;
//         });
//     };

//     const selectedCount = Object.keys(selectedIds).length;
//     const isValid = selectedCount > 0;

//     const handleClose = () => {
//         setSelectedIds({});
//         navigation.goBack();
//     };

//     // Builds the JSON payload of everything checked and hands it to the
//     // caller via onSubmit, then closes the modal.
//     const handleUpdate = () => {
//         if (!isValid) return;
//         const selectedLabels = stateData.filter((label) => selectedIds[label.id]);
//         const payload = {
//             labels: selectedLabels.map((label) => ({ id: label.id, name: label.name })),
//         };
//         onSubmit && onSubmit(payload);
//         handleClose();
//     };

//     // Card sizing: percentage/clamped width so it behaves correctly from a
//     // 360dp Android phone up through a 1024pt+ iPad Pro landscape.
//     const cardStyle = (() => {
//         if (breakpoint === 'largeTablet') {
//             return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
//         }
//         if (breakpoint === 'tablet') {
//             return { width: Math.min(560, width * 0.6), maxHeight: height * 0.85 };
//         }
//         // phone (iOS + Android)
//         return { width: width - 32, maxHeight: height * 0.88 };
//     })();

//     // Keeps the list from either collapsing to nothing (few labels) or
//     // pushing the footer off-screen (many labels), on any device size.
//     const listWrapStyle = { maxHeight: height * 0.5 };

//     const renderLabelItem = ({ item }) => {
//         const isSelected = !!selectedIds[item.id];
//         return (
//             <TouchableOpacity
//                 style={styles.labelRow}
//                 activeOpacity={0.7}
//                 onPress={() => toggleSelect(item.id)}
//             >
//                 <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
//                     {isSelected && <Icon name="check" size={11} color="#fff" />}
//                 </View>
//                 <Text style={[styles.labelText, { fontSize: fontScale(14) }]} numberOfLines={1}>
//                     {item.name}
//                 </Text>
//             </TouchableOpacity>
//         );
//     };

//     return (
//         <Modal
//             transparent
//             animationType="fade"
//             onRequestClose={handleClose}
//             statusBarTranslucent
//         >
//             <KeyboardAvoidingView
//                 style={styles.backdrop}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             >
//                 <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

//                 <View style={[styles.card, cardStyle]}>
//                     {/* Header */}
//                     <View style={[styles.header, { paddingTop: Math.max(18, insets.top > 0 ? 18 : 18) }]}>
//                         <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>Assign Product to Label</Text>
//                         <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
//                             <Icon name="close" size={20} color="#333" />
//                         </TouchableOpacity>
//                     </View>

//                     {selectedCount > 0 && (
//                         <View style={styles.selectedBanner}>
//                             <Text style={styles.selectedBannerText}>
//                                 {selectedCount} label{selectedCount !== 1 ? 's' : ''} selected
//                             </Text>
//                         </View>
//                     )}

//                     {/* Label checklist */}
//                     <FlatList
//                         data={stateData}
//                         keyExtractor={(item) => String(item.id)}
//                         renderItem={renderLabelItem}
//                         ItemSeparatorComponent={() => <View style={styles.separator} />}
//                         style={[styles.list, listWrapStyle]}
//                         contentContainerStyle={styles.listContent}
//                         keyboardShouldPersistTaps="handled"
//                         showsVerticalScrollIndicator={false}
//                     />

//                     {/* Footer */}
//                     <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
//                         <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
//                             <Text style={styles.cancelText}>CANCEL</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={[styles.doneBtn, !isValid && styles.doneBtnDisabled]}
//                             onPress={handleUpdate}
//                             disabled={!isValid}
//                         >
//                             <Text style={styles.doneText}>UPDATE</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </KeyboardAvoidingView>
//         </Modal>
//     );
// };

// // Moved to module scope — styles were previously re-created on every render
// // (and, worse, defined after an unreachable `return` inside handleDone).
// const styles = StyleSheet.create({
//     backdrop: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.45)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     card: {
//         backgroundColor: '#fff',
//         borderRadius: 14,
//         overflow: 'hidden',
//         elevation: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.25,
//         shadowRadius: 10,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 18,
//         backgroundColor: '#F3F5F7',
//     },
//     headerTitle: { fontWeight: '700', color: '#1a1a1a', fontFamily: fonts.POPPINS_REGULAR, flex: 1, marginRight: 12 },

//     selectedBanner: {
//         paddingHorizontal: 20,
//         paddingVertical: 8,
//         backgroundColor: '#EAF1FB',
//     },
//     selectedBannerText: { fontSize: 12, fontWeight: '600', color: '#3562a6' },

//     list: { flexGrow: 0 },
//     listContent: { paddingHorizontal: 20, paddingVertical: 8 },
//     loadingWrap: { alignItems: 'center', justifyContent: 'center' },

//     labelRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 14,
//         gap: 12,
//     },
//     checkbox: {
//         width: 20,
//         height: 20,
//         borderRadius: 5,
//         borderWidth: 1.5,
//         borderColor: '#bbb',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     checkboxChecked: { backgroundColor: colors.ICON_COLOR_PRIMARY, borderColor: colors.ICON_COLOR_PRIMARY },
//     labelText: { color: '#222', fontWeight: '500', flex: 1 },
//     separator: { height: 1, backgroundColor: '#F0F0F0' },

//     emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
//     emptyText: { fontSize: 13, color: '#999' },

//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         gap: 24,
//         paddingHorizontal: 20,
//         paddingTop: 16,
//         borderTopWidth: 1,
//         borderTopColor: '#F0F0F0',
//     },
//     cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
//     cancelText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
//     doneBtn: {
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 8,
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//     },
//     doneBtnDisabled: { opacity: 0.4 },
//     doneText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
// });

// export default AssignProduct;


import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '../navigation/RootNavigation';


// --- Responsive helpers -----------------------------------------------
// Base reference width = 375 (iPhone SE / standard small phone)
const BASE_WIDTH = 375;

const getBreakpoint = (width) => {
    if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
    if (width >= 600) return 'tablet';       // iPad mini/portrait, Android tablets
    return 'phone';                          // all phones, iOS & Android
};

// Clamped scale factor so text/padding never blow up on huge tablets
// or shrink too much on the smallest phones.
const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};
// ------------------------------------------------------------------------

const AssignProduct = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const onSubmit = route.params?.onSubmit;

    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const breakpoint = getBreakpoint(width);
    const fontScale = (size) => scale(width, size);

    // NOTE: assumes hospitalReducer exposes labels the same way it exposes
    // categories elsewhere in the app (categoryData / loading.category), e.g.
    //   { labelData: [{ id, name }, ...], loading: { label: boolean } }
    // Adjust these two lines if your reducer's actual field names differ.
    const { labelData, hospitalData } = useSelector((state) => state.hospitalReducer);
    const stateData = (route.params?.optionId == 0) ? labelData : hospitalData;

    // Single-select: store just the selected id (or null when nothing is picked)
    const [selectedId, setSelectedId] = useState(null);

    // Reset any previous selection each time the modal opens.
    useEffect(() => {
        setSelectedId(null);
    }, []);

    const handleSelect = (id) => {
        // Radio behavior: picking a new option replaces the old one.
        // Tapping the already-selected option keeps it selected (standard
        // radio group behavior — flip this to `setSelectedId(prev => prev === id ? null : id)`
        // if you want re-tapping to deselect instead).
        setSelectedId(id);
    };

    const isValid = selectedId !== null;

    const handleClose = () => {
        setSelectedId(null);
        navigation.goBack();
    };

    // Builds the JSON payload for the single selected item and hands it to
    // the caller via onSubmit, then closes the modal.
    const handleUpdate = () => {
        if (!isValid) return;
        const selectedLabel = stateData.find((label) => label.id === selectedId);
        if (!selectedLabel) return;
        const payload = { id: selectedLabel.id };
        //{ id: selectedLabel.id, name: selectedLabel.name },
        onSubmit && onSubmit(payload);
        handleClose();
    };

    // Card sizing: percentage/clamped width so it behaves correctly from a
    // 360dp Android phone up through a 1024pt+ iPad Pro landscape.
    const cardStyle = (() => {
        if (breakpoint === 'largeTablet') {
            return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
        }
        if (breakpoint === 'tablet') {
            return { width: Math.min(560, width * 0.6), maxHeight: height * 0.85 };
        }
        // phone (iOS + Android)
        return { width: width - 32, maxHeight: height * 0.88 };
    })();

    // Keeps the list from either collapsing to nothing (few labels) or
    // pushing the footer off-screen (many labels), on any device size.
    const listWrapStyle = { maxHeight: height * 0.5 };

    const renderLabelItem = ({ item }) => {
        const isSelected = selectedId === item.id;
        return (
            <TouchableOpacity
                style={styles.labelRow}
                activeOpacity={0.7}
                onPress={() => handleSelect(item.id)}
            >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.labelText, { fontSize: fontScale(14) }]} numberOfLines={1}>
                    {route.params?.optionId === 0 ? item.name : item.doctor_name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            transparent
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

                <View style={[styles.card, cardStyle]}>
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: Math.max(18, insets.top > 0 ? 18 : 18) }]}>
                        <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>Assign Product to Label</Text>
                        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Icon name="close" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {isValid && (
                        <View style={styles.selectedBanner}>
                            <Text style={styles.selectedBannerText}>
                                1 label selected
                            </Text>
                        </View>
                    )}

                    {/* Label list (single-select radio group) */}
                    <FlatList
                        data={stateData}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderLabelItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        style={[styles.list, listWrapStyle]}
                        contentContainerStyle={styles.listContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Footer */}
                    <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.doneBtn, !isValid && styles.doneBtnDisabled]}
                            onPress={handleUpdate}
                            disabled={!isValid}
                        >
                            <Text style={styles.doneText}>UPDATE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Moved to module scope — styles were previously re-created on every render
// (and, worse, defined after an unreachable `return` inside handleDone).
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#F3F5F7',
    },
    headerTitle: { fontWeight: '700', color: '#1a1a1a', fontFamily: fonts.POPPINS_REGULAR, flex: 1, marginRight: 12 },

    selectedBanner: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#EAF1FB',
    },
    selectedBannerText: { fontSize: 12, fontWeight: '600', color: '#3562a6' },

    list: { flexGrow: 0 },
    listContent: { paddingHorizontal: 20, paddingVertical: 8 },
    loadingWrap: { alignItems: 'center', justifyContent: 'center' },

    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    // Radio button styles (replaces checkbox)
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#bbb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.ICON_COLOR_PRIMARY,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
    },
    labelText: { color: '#222', fontWeight: '500', flex: 1 },
    separator: { height: 1, backgroundColor: '#F0F0F0' },

    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
    emptyText: { fontSize: 13, color: '#999' },

    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
    cancelText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
    doneBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
    },
    doneBtnDisabled: { opacity: 0.4 },
    doneText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});

export default AssignProduct;