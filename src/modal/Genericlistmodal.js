import React, { useState, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * GenericListModal
 * -----------------
 * A reusable "pick from a list" modal. Give it ANY array of records from
 * state (products, hospitals, doctors, etc.) and it renders each row as
 * just a name + right chevron. Tapping a row either:
 *   - calls onItemPress(item)  — if you passed one, OR
 *   - calls navigation.navigate(detailScreenName, { item, titleField })
 *     — if you passed a `navigation` + `detailScreenName` instead.
 *
 * Built on FlatList (not ScrollView) so 50, 500, or 5000 rows all stay
 * smooth — only the rows on screen are ever rendered.
 *
 * Props:
 *  visible          bool     - controls modal visibility
 *  onClose          fn       - called when the modal should close
 *  data             array    - the records to list (from Redux/state/API)
 *  titleField       string   - which key to show as the row label (default 'name')
 *  keyField         string   - unique id key (default 'id')
 *  title            string   - modal header title
 *  searchable       bool     - show a search box that filters by titleField (default true)
 *  onItemPress      fn(item) - optional custom press handler
 *  navigation       object   - optional, from useNavigation(), used if onItemPress is not given
 *  detailScreenName string   - optional, screen to navigate to (used with `navigation`)
 */
const GenericListModal = ({
    visible,
    onClose,
    data = [],
    titleField = 'name',
    keyField = 'id',
    title = 'Select an item',
    searchable = true,
    onItemPress,
    navigation,
    detailScreenName = 'GenericDetail',
}) => {
    const [query, setQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchable || !query.trim()) return data;
        const q = query.trim().toLowerCase();
        return data.filter((item) =>
            String(item?.[titleField] ?? '').toLowerCase().includes(q)
        );
    }, [data, query, searchable, titleField]);

    const handlePress = (item) => {
        if (onItemPress) {
            onItemPress(item);
            return;
        }
        if (navigation) {
            navigation.navigate(detailScreenName, { item, titleField });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.row}
            activeOpacity={0.65}
            onPress={() => handlePress(item)}
        >
            <Text style={styles.rowText} numberOfLines={1}>
                {item?.[titleField] ?? '—'}
            </Text>
            <Icon name="chevron-right" size={14} color="#9aa0a6" />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.flexOne}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Icon name="times" size={18} color="#222" />
                    </TouchableOpacity>
                </View>

                {searchable && (
                    <View style={styles.searchWrap}>
                        <Icon name="search" size={14} color="#9aa0a6" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            placeholderTextColor="#9aa0a6"
                            value={query}
                            onChangeText={setQuery}
                            autoCorrect={false}
                        />
                    </View>
                )}

                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) =>
                        item?.[keyField] != null ? String(item[keyField]) : String(index)
                    }
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    }
                    // Virtualization tuning — keeps memory/CPU flat regardless of list size
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    removeClippedSubviews
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        filteredData.length === 0 ? styles.emptyContainer : undefined
                    }
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexOne: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eef0f2',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f6f8',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#222',
        padding: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    rowText: {
        flex: 1,
        fontSize: 15,
        color: '#222',
        marginRight: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f1f3',
        marginLeft: 20,
    },
    emptyContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9aa0a6',
        fontSize: 14,
    },
});

export default GenericListModal;
export { GenericListModal };