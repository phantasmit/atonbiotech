/**
 * ----------------------------------------------------------------------
 * DownloadCompleteModal.js
 *
 * Simple confirmation popup: "Download finished — Open / Dismiss".
 * Kept as a plain Modal (not Alert.alert) so you can style it to match
 * your app; swap the inner View for your own design system component.
 * ----------------------------------------------------------------------
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DownloadCompleteModal({ visible, fileName, onOpen, onDismiss }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Download complete</Text>
          <Text style={styles.subtitle}>
            {fileName ? `${fileName} has finished downloading.` : 'Your file has finished downloading.'}
          </Text>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onDismiss}>
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primary]} onPress={onOpen}>
              <Text style={styles.primaryText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#525252',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: '#C9C43A',
  },
  primaryText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  secondaryText: {
    color: '#525252',
    fontWeight: '600',
  },
});
