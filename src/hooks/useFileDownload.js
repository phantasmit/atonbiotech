/**
 * ----------------------------------------------------------------------
 * useFileDownload.js
 *
 * Drop-in replacement for your old handleDownloadBrochure + useState pair.
 * Keeps your existing pre-flight checks (size, cellular warning, free
 * space) and swaps only the transport layer for a true background one.
 *
 * State machine:
 *   idle -> downloading (with % progress, survives backgrounding)
 *        -> completed  (shows a confirm dialog with "Open")
 *        -> error
 * ----------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  startBackgroundDownload,
  reattachBackgroundDownloads,
  openDownloadedFile,
} from '../lib/backgroundDownloader';
import { showErrorToast } from '../utils/Toastutils';

/**
 * @param {object} opts
 * @param {string} opts.taskId - stable ID for this specific download
 *   (e.g. 'brochure-pdf'). Must be unique per distinct file in your app.
 * @param {string} opts.fileName
 */
export function useFileDownload({ taskId, fileName }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | completed | error
  const [progress, setProgress] = useState(0);
  const filePathRef = useRef(null);

  // Re-attach to a download that kept going while the app was
  // backgrounded/killed, so relaunching the app doesn't "lose" it.
  useEffect(() => {
    reattachBackgroundDownloads((id, task) => {
      if (id !== taskId) return;

      setStatus('downloading');
      task
        .progress(({ bytesDownloaded, bytesTotal }) => {
          if (bytesTotal > 0) setProgress(Math.floor((bytesDownloaded / bytesTotal) * 100));
        })
        .done(({ location }) => {
          filePathRef.current = location;
          setStatus('completed');
        })
        .error(() => {
          setStatus('error');
        });
    });
  }, [taskId]);

  // Purely cosmetic: lets you show "still downloading in background"
  // messaging if you want it. The download itself does NOT depend on
  // AppState — it keeps running via the native session either way.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  const download = useCallback(
    async ({ url, warnOnCellularAboveMB = 20, getRemoteFileSize, hasEnoughStorage }) => {
      try {
        // --- keep your existing pre-flight checks -----------------
        const fileSizeBytes = getRemoteFileSize ? await getRemoteFileSize(url) : null;
        const fileSizeMB = fileSizeBytes ? (fileSizeBytes / (1024 * 1024)).toFixed(1) : null;

        const netState = await NetInfo.fetch();
        const isCellular = netState.type === 'cellular';
        if (
          isCellular &&
          fileSizeBytes &&
          fileSizeBytes > warnOnCellularAboveMB * 1024 * 1024
        ) {
          const proceed = await new Promise((resolve) => {
            Alert.alert(
              'Download over cellular data',
              `This file is ${fileSizeMB} MB. You're on cellular data — continue anyway?`,
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Download', onPress: () => resolve(true) },
              ]
            );
          });
          if (!proceed) return;
        }

        if (hasEnoughStorage) {
          const enoughSpace = await hasEnoughStorage(fileSizeBytes);
          if (!enoughSpace) {
            Alert.alert(
              'Not enough storage',
              `Not enough free storage to download this file${
                fileSizeMB ? ` (${fileSizeMB} MB)` : ''
              }. Please free up some space and try again.`
            );
            return;
          }
        }
        // ------------------------------------------------------------

        setStatus('downloading');
        setProgress(0);

        startBackgroundDownload({
          id: taskId,
          url,
          fileName,
          onProgress: (pct) => setProgress(pct),
          onDone: ({ location }) => {
            filePathRef.current = location;
            setStatus('completed');
          },
          onError: ({ error }) => {
            setStatus('error');
            showErrorToast('Download failed! Please try again.')
          },
        });
      } catch (e) {
        setStatus('error');
        showErrorToast('Download failed! Please try again.')
      }
    },
    [taskId, fileName]
  );

  const openFile = useCallback(async () => {
    if (!filePathRef.current) return;
    try {
      await openDownloadedFile(filePathRef.current);
    } catch (e) {
      showErrorToast('The file downloaded but could not be opened.')
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    filePathRef.current = null;
  }, []);

  return { status, progress, download, openFile, reset, filePath: filePathRef.current };
}
