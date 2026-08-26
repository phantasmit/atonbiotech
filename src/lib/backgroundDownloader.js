// /**
//  * ----------------------------------------------------------------------
//  * backgroundDownloader.js
//  *
//  * Thin wrapper around @kesha-antonov/react-native-background-downloader.
//  *
//  * Why this library instead of react-native-blob-util:
//  *  - iOS: uses a real NSURLSession *background* configuration. The OS
//  *    hands the transfer to its own daemon (nsurlsessiond), so it keeps
//  *    running even if your app is suspended or the OS kills it to free
//  *    memory. react-native-blob-util's fetch() is tied to your JS/app
//  *    process and iOS will pause/kill it in the background.
//  *  - Android: uses DownloadManager + a Foreground Service, so the
//  *    system (not your Activity) owns the transfer and shows a
//  *    notification. This is why large files (100MB+) were failing
//  *    before — CacheDir + a plain fetch() has no protection from the
//  *    OS suspending your process mid-download.
//  *  - Both platforms let you "re-attach" to a download that kept running
//  *    while your app was closed/killed — see initBackgroundDownloader().
//  *
//  * Install:
//  *   yarn add @kesha-antonov/react-native-background-downloader
//  *   cd ios && pod install
//  *
//  * Then follow /native-setup/README.md in this bundle for the iOS
//  * AppDelegate hook and Android MMKV dependency — both are mandatory,
//  * not optional, or downloads silently stop working in the background.
//  * ----------------------------------------------------------------------
//  */

// import { Platform } from 'react-native';
// import {
//   setConfig,
//   createDownloadTask,
//   getExistingDownloadTasks,
//   completeHandler,
//   directories,
// } from '@kesha-antonov/react-native-background-downloader';

// // ---- Global config (call once, e.g. in App.js before render) ----------
// export function configureBackgroundDownloader() {
//   setConfig({
//     // Keep true unless you specifically want to force Wi-Fi-only downloads.
//     allowsCellularAccess: true,

//     // Android 14+ requires *some* notification for background transfers
//     // (OS policy, cannot be fully disabled). This shows a real progress
//     // notification instead of the barely-visible default one.
//     showNotificationsEnabled: true,
//     notificationsGrouping: {
//       enabled: false,
//     },
//   });
// }

// /**
//  * Call once at app startup (e.g. inside a useEffect in your root
//  * component). This is the single most important call in this file:
//  * it reconnects your JS layer to any download that kept running while
//  * the app was backgrounded, force-killed by the OS, or the user
//  * relaunched the app mid-download. Without this, a download that
//  * finishes while your JS isn't running is "lost" from the UI's
//  * perspective even though the file downloaded fine.
//  *
//  * @param {(taskId: string, task: import('@kesha-antonov/react-native-background-downloader').DownloadTask) => void} onReattach
//  */
// export async function reattachBackgroundDownloads(onReattach) {
//   try {
//     const lostTasks = await getExistingDownloadTasks();
//     for (const task of lostTasks) {
//       onReattach?.(task.id, task);
//     }
//   } catch (err) {
//     console.log('Could not re-attach background downloads:', err);
//   }
// }

// /**
//  * Starts (or re-describes) a background download.
//  *
//  * @param {object} params
//  * @param {string} params.id - stable, meaningful ID (e.g. 'brochure-pdf'),
//  *   NOT a random UUID — you need this to re-match the task after relaunch.
//  * @param {string} params.url
//  * @param {string} params.fileName
//  * @param {(pct: number, info: {bytesDownloaded:number, bytesTotal:number}) => void} [params.onProgress]
//  * @param {(info: {location:string, bytesDownloaded:number, bytesTotal:number}) => void} [params.onDone]
//  * @param {(info: {error:any, errorCode:any}) => void} [params.onError]
//  * @param {(info: {expectedBytes:number}) => void} [params.onBegin]
//  * @returns {{ task: any, filePath: string }}
//  */
// export function startBackgroundDownload({
//   id,
//   url,
//   fileName,
//   onProgress,
//   onDone,
//   onError,
//   onBegin,
// }) {
//   if (!id) throw new Error('startBackgroundDownload: `id` is required.');
//   if (!url) throw new Error('startBackgroundDownload: `url` is required.');

//   const filePath = `${directories.documents}/${fileName}`;

//   const task = createDownloadTask({
//     id,
//     url,
//     destination: filePath,
//     metadata: {},
//   })
//     .begin(({ expectedBytes }) => {
//       onBegin?.({ expectedBytes });
//     })
//     .progress(({ bytesDownloaded, bytesTotal }) => {
//       if (bytesTotal > 0) {
//         const pct = Math.floor((bytesDownloaded / bytesTotal) * 100);
//         onProgress?.(pct, { bytesDownloaded, bytesTotal });
//       }
//     })
//     .done(({ bytesDownloaded, bytesTotal }) => {
//       // Required: tells the OS (mainly iOS) this job is fully finished,
//       // letting it release background resources and, per Apple's
//       // background-session contract, call your completion handler.
//       // Skipping this can cause the OS to throttle future background
//       // downloads for your app.
//       completeHandler(id);
//       onDone?.({ location: filePath, bytesDownloaded, bytesTotal });
//     })
//     .error(({ error, errorCode }) => {
//       onError?.({ error, errorCode });
//     });

//   task.start();

//   return { task, filePath };
// }

// /** Opens a downloaded file with the OS's default viewer. */
// export async function openDownloadedFile(filePath, mimeType = 'application/pdf') {
//   // FileViewer handles the correct native intent/UTI lookup for both
//   // platforms and is the standard companion to background-downloader.
//   const FileViewer = require('react-native-file-viewer').default;
//   const normalizedPath =
//     Platform.OS === 'android' && !filePath.startsWith('file://')
//       ? filePath
//       : filePath.replace('file://', '');

//   await FileViewer.open(normalizedPath, { showOpenWithDialog: true });
//   return normalizedPath;
// }

// // ----------------------------------------------------------------------
// // Pre-flight helpers (unchanged from your original code, kept here so
// // they're bundled with the rest of the download logic). These use
// // react-native-blob-util ONLY for a disk-free-space check and a HEAD
// // request — not for the download itself, so it's fine to keep it
// // installed for just this.
// // ----------------------------------------------------------------------
// import ReactNativeBlobUtil from 'react-native-blob-util';

// /** HEAD request to read Content-Length without downloading the body. */
// export async function getRemoteFileSize(url) {
//   try {
//     const res = await fetch(url, { method: 'HEAD' });
//     const len = res.headers.get('content-length');
//     return len ? parseInt(len, 10) : null;
//   } catch (err) {
//     console.log('Could not determine remote file size:', err);
//     return null;
//   }
// }

// /** Checks free device storage against file size + a safety margin. */
// export async function hasEnoughStorage(requiredBytes, marginRatio = 0.2) {
//   if (!requiredBytes) return true;
//   try {
//     const stats = await ReactNativeBlobUtil.fs.df();
//     const freeBytes = stats.free ?? stats.internal_free ?? 0;
//     return freeBytes > requiredBytes * (1 + marginRatio);
//   } catch (err) {
//     console.log('Could not check device storage:', err);
//     return true;
//   }
// }

// export { directories };


/**
 * ----------------------------------------------------------------------
 * backgroundDownloader.js
 *
 * Thin wrapper around @kesha-antonov/react-native-background-downloader.
 *
 * Why this library instead of react-native-blob-util:
 *  - iOS: uses a real NSURLSession *background* configuration. The OS
 *    hands the transfer to its own daemon (nsurlsessiond), so it keeps
 *    running even if your app is suspended or the OS kills it to free
 *    memory. react-native-blob-util's fetch() is tied to your JS/app
 *    process and iOS will pause/kill it in the background.
 *  - Android: uses DownloadManager + a Foreground Service, so the
 *    system (not your Activity) owns the transfer and shows a
 *    notification. This is why large files (100MB+) were failing
 *    before — CacheDir + a plain fetch() has no protection from the
 *    OS suspending your process mid-download.
 *  - Both platforms let you "re-attach" to a download that kept running
 *    while your app was closed/killed — see initBackgroundDownloader().
 *
 * Install:
 *   yarn add @kesha-antonov/react-native-background-downloader
 *   cd ios && pod install
 *
 * Then follow /native-setup/README.md in this bundle for the iOS
 * AppDelegate hook and Android MMKV dependency — both are mandatory,
 * not optional, or downloads silently stop working in the background.
 * ----------------------------------------------------------------------
 */

import { Platform } from 'react-native';
import {
  setConfig,
  createDownloadTask,
  getExistingDownloadTasks,
  completeHandler,
  directories,
} from '@kesha-antonov/react-native-background-downloader';

// ---- Global config (call once, e.g. in App.js before render) ----------
export function configureBackgroundDownloader() {
  setConfig({
    // Keep true unless you specifically want to force Wi-Fi-only downloads.
    allowsCellularAccess: true,

    // Android 14+ requires *some* notification for background transfers
    // (OS policy, cannot be fully disabled). This shows a real progress
    // notification instead of the barely-visible default one.
    showNotificationsEnabled: true,
    notificationsGrouping: {
      enabled: false,
    },
  });
}

/**
 * Call once at app startup (e.g. inside a useEffect in your root
 * component). This is the single most important call in this file:
 * it reconnects your JS layer to any download that kept running while
 * the app was backgrounded, force-killed by the OS, or the user
 * relaunched the app mid-download. Without this, a download that
 * finishes while your JS isn't running is "lost" from the UI's
 * perspective even though the file downloaded fine.
 *
 * @param {(taskId: string, task: import('@kesha-antonov/react-native-background-downloader').DownloadTask) => void} onReattach
 */
export async function reattachBackgroundDownloads(onReattach) {
  try {
    const lostTasks = await getExistingDownloadTasks();
    for (const task of lostTasks) {
      onReattach?.(task.id, task);
    }
  } catch (err) {
    console.log('Could not re-attach background downloads:', err);
  }
}

/**
 * Starts (or re-describes) a background download.
 *
 * @param {object} params
 * @param {string} params.id - stable, meaningful ID (e.g. 'brochure-pdf'),
 *   NOT a random UUID — you need this to re-match the task after relaunch.
 * @param {string} params.url
 * @param {string} params.fileName
 * @param {(pct: number, info: {bytesDownloaded:number, bytesTotal:number}) => void} [params.onProgress]
 * @param {(info: {location:string, bytesDownloaded:number, bytesTotal:number}) => void} [params.onDone]
 * @param {(info: {error:any, errorCode:any}) => void} [params.onError]
 * @param {(info: {expectedBytes:number}) => void} [params.onBegin]
 * @returns {{ task: any, filePath: string }}
 */
export function startBackgroundDownload({
  id,
  url,
  fileName,
  onProgress,
  onDone,
  onError,
  onBegin,
}) {
  if (!id) throw new Error('startBackgroundDownload: `id` is required.');
  if (!url) throw new Error('startBackgroundDownload: `url` is required.');

  const filePath = `${directories.documents}/${fileName}`;

  const task = createDownloadTask({
    id,
    url,
    destination: filePath,
    metadata: {},
  })
    .begin(({ expectedBytes }) => {
      onBegin?.({ expectedBytes });
    })
    .progress(({ bytesDownloaded, bytesTotal }) => {
      if (bytesTotal > 0) {
        const pct = Math.floor((bytesDownloaded / bytesTotal) * 100);
        onProgress?.(pct, { bytesDownloaded, bytesTotal });
      }
    })
    .done(async ({ bytesDownloaded, bytesTotal }) => {
      // Required: tells the OS (mainly iOS) this job is fully finished,
      // letting it release background resources and, per Apple's
      // background-session contract, call your completion handler.
      // Skipping this can cause the OS to throttle future background
      // downloads for your app.
      completeHandler(id);

      // Move the file from private storage into the public Downloads
      // folder so the user can find it outside your app (Android only —
      // see saveToPublicDownloads() above). If this fails for any
      // reason, fall back to the private path so onDone/openFile still
      // work — the file just won't be visible in a file manager.
      const publicPath = await saveToPublicDownloads(filePath, fileName);
      onDone?.({ location: publicPath || filePath, bytesDownloaded, bytesTotal });
    })
    .error(({ error, errorCode }) => {
      onError?.({ error, errorCode });
    });

  task.start();

  return { task, filePath };
}

/** Opens a downloaded file with the OS's default viewer. */
export async function openDownloadedFile(filePath, mimeType = 'application/pdf') {
  // FileViewer handles the correct native intent/UTI lookup for both
  // platforms and is the standard companion to background-downloader.
  const FileViewer = require('react-native-file-viewer').default;
  const normalizedPath =
    Platform.OS === 'android' && !filePath.startsWith('file://')
      ? filePath
      : filePath.replace('file://', '');

  await FileViewer.open(normalizedPath, { showOpenWithDialog: true });
  return normalizedPath;
}

// ----------------------------------------------------------------------
// Pre-flight helpers (unchanged from your original code, kept here so
// they're bundled with the rest of the download logic). These use
// react-native-blob-util ONLY for a disk-free-space check and a HEAD
// request — not for the download itself, so it's fine to keep it
// installed for just this.
// ----------------------------------------------------------------------
import ReactNativeBlobUtil from 'react-native-blob-util';

/** HEAD request to read Content-Length without downloading the body. */
export async function getRemoteFileSize(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const len = res.headers.get('content-length');
    return len ? parseInt(len, 10) : null;
  } catch (err) {
    console.log('Could not determine remote file size:', err);
    return null;
  }
}

/** Checks free device storage against file size + a safety margin. */
export async function hasEnoughStorage(requiredBytes, marginRatio = 0.2) {
  if (!requiredBytes) return true;
  try {
    const stats = await ReactNativeBlobUtil.fs.df();
    const freeBytes = stats.free ?? stats.internal_free ?? 0;
    return freeBytes > requiredBytes * (1 + marginRatio);
  } catch (err) {
    console.log('Could not check device storage:', err);
    return true;
  }
}

// ----------------------------------------------------------------------
// Save to the public Downloads folder (Android only)
//
// `directories.documents` (used above) is the app's PRIVATE storage —
// invisible to file manager apps. To make a finished download show up
// in the phone's real Downloads folder, it has to be explicitly copied
// there using the platform's scoped-storage APIs:
//   - Android 10+ (API 29+): MediaStore, via react-native-blob-util's
//     MediaCollection.copyToMediaStore() helper.
//   - Android 9 and below: legacy public storage, needs the runtime
//     WRITE_EXTERNAL_STORAGE permission and a plain file copy.
// iOS has no equivalent public "Downloads" folder — its Files app
// already exposes the app's Documents directory (see native-setup notes
// on Info.plist keys if you want that visible there too), so this is a
// no-op on iOS.
// ----------------------------------------------------------------------
import { PermissionsAndroid } from 'react-native';

async function requestLegacyStoragePermission() {
  if (Platform.OS !== 'android' || Platform.Version >= 29) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'Storage Permission Required',
      message: 'App needs access to storage to save the file to Downloads.',
      buttonPositive: 'OK',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Copies a file already downloaded to the app's private storage into
 * the public Downloads folder so it shows up in file manager apps.
 *
 * @param {string} localPath - absolute path to the file in private storage
 * @param {string} fileName
 * @param {string} [mimeType]
 * @returns {Promise<string|null>} the public path/URI, or null if the
 *   copy failed (caller should fall back to the original private path)
 */
export async function saveToPublicDownloads(localPath, fileName, mimeType = 'application/pdf') {
  if (Platform.OS !== 'android') return null; // no public Downloads concept on iOS

  try {
    if (Platform.Version >= 29) {
      // Android 10+: scoped storage — must go through MediaStore.
      const result = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        { name: fileName, parentFolder: '', mimeType },
        'Download',
        localPath.replace('file://', '')
      );
      return result; // content:// URI in the public Downloads collection
    }

    // Android 9 and below: legacy public storage still works with the
    // runtime permission, so just copy the file directly.
    const granted = await requestLegacyStoragePermission();
    if (!granted) {
      console.log('Storage permission denied — file stays in app-private storage.');
      return null;
    }

    const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
    await ReactNativeBlobUtil.fs.cp(localPath.replace('file://', ''), destPath);
    return destPath;
  } catch (err) {
    console.log('Could not save file to public Downloads:', err);
    return null;
  }
}

export { directories };