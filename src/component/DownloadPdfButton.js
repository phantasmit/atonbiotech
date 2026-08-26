import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/FontAwesome5';

/**
 * ----------------------------------------------------------------------
 * DownloadPdfButton
 *
 * Downloads a PDF from a URL and opens it once complete.
 * Uses react-native-blob-util (actively maintained fork of the old
 * rn-fetch-blob) for the download + native "open file" call.
 *
 * npm install react-native-blob-util
 *
 * Usage:
 * <DownloadPdfButton
 *   url="https://konsylpharma.in/img/brochures/brochure_1783282895.pdf"
 *   fileName="brochure.pdf"
 * />
 * ----------------------------------------------------------------------
 */

async function requestAndroidPermission() {
    // Only needed on Android 9 (API 28) and below — Android 10+ uses
    // scoped storage and the Downloads dir doesn't need this permission.
    if (Platform.OS !== 'android' || Platform.Version >= 29) return true;

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
            title: 'Storage Permission Required',
            message: 'App needs access to storage to download the file.',
            buttonPositive: 'OK',
        }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function DownloadPdfButton({
    url,
    fileName,
    label = 'Download Brochure',
    color = '#4A7EC7',
    style,
}) {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const resolvedFileName = fileName || url.split('/').pop() || `file_${Date.now()}.pdf`;

    const handleDownload = async () => {
        if (!url) {
            Alert.alert('Error', 'No file URL provided.');
            return;
        }

        const hasPermission = await requestAndroidPermission();
        if (!hasPermission) {
            Alert.alert('Permission denied', 'Storage permission is required to download the file.');
            return;
        }

        setDownloading(true);
        setProgress(0);

        const { dirs } = ReactNativeBlobUtil.fs;
        // iOS: app's document dir (visible in the Files app if configured).
        // Android: public Download folder, so it shows up in the device's Downloads app too.
        const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
        const filePath = `${downloadDir}/${resolvedFileName}`;

        try {
            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path: filePath,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: resolvedFileName,
                    description: 'Downloading file',
                    mime: 'application/pdf',
                    mediaScannable: true,
                    path: filePath,
                },
            })
                .fetch('GET', url)
                .progress((received, total) => {
                    setProgress(Math.floor((received / total) * 100));
                });

            const savedPath = res.path();
            setDownloading(false);

            // Open the PDF with the device's default viewer once downloaded.
            if (Platform.OS === 'ios') {
                ReactNativeBlobUtil.ios.openDocument(savedPath);
            } else {
                ReactNativeBlobUtil.android.actionViewIntent(savedPath, 'application/pdf');
            }
        } catch (err) {
            setDownloading(false);
            console.log('Download failed:', err);
            Alert.alert('Download failed', 'Something went wrong while downloading the file. Please try again.');
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { borderColor: color }, style]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.8}
        >
            <Icon
                name={downloading ? 'spinner' : 'file-pdf'}
                size={18}
                color={color}
                solid
                style={{ marginRight: 10 }}
            />
            <Text style={[styles.label, { color }]}>
                {downloading ? `Downloading... ${progress}%` : label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
});