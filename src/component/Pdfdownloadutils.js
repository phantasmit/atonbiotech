import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * ----------------------------------------------------------------------
 * getRemoteFileSize
 * Sends a HEAD request to read Content-Length without downloading the
 * body — used to warn the user before starting a large download and to
 * check available device storage ahead of time.
 * Returns bytes (number) or null if the server doesn't report a size.
 * ----------------------------------------------------------------------
 */
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

/**
 * ----------------------------------------------------------------------
 * hasEnoughStorage
 * Checks free device storage against the file size plus a safety
 * margin (default 20%), since large downloads can otherwise fail
 * partway through with a confusing low-level write error.
 * ----------------------------------------------------------------------
 */
export async function hasEnoughStorage(requiredBytes, marginRatio = 0.2) {
  if (!requiredBytes) return true; // unknown size — can't check, don't block
  try {
    const stats = await ReactNativeBlobUtil.fs.df();
    const freeBytes = stats.free ?? stats.internal_free ?? 0;
    return freeBytes > requiredBytes * (1 + marginRatio);
  } catch (err) {
    console.log('Could not check device storage:', err);
    return true; // fail open — don't block download if the check itself fails
  }
}

/**
 * ----------------------------------------------------------------------
 * downloadAndOpenPdf
 *
 * Downloads a PDF from `url` and opens it with the device's default
 * viewer once complete. Works from any trigger — a button, a drawer
 * item, a list row, etc.
 *
 * @param {string} url - the PDF file URL
 * @param {string} fileName - filename to save as (defaults to last URL segment)
 * @param {(percent: number) => void} onProgress - optional progress callback (0-100)
 *
 * Usage:
 *   await downloadAndOpenPdf(brochureUrl, 'brochure.pdf', (p) => setProgress(p));
 * ----------------------------------------------------------------------
 */
export async function downloadAndOpenPdf(url, fileName, onProgress, _retryCount = 0) {
  if (!url) throw new Error('No file URL provided.');

  const MAX_RETRIES = 2;
  const resolvedFileName = fileName || url.split('/').pop() || `file_${Date.now()}.pdf`;

  // Save to the app's own cache dir — no runtime storage permission needed
  // on either platform, and res.path() is guaranteed accurate here.
  const { dirs } = ReactNativeBlobUtil.fs;
  const filePath = `${dirs.CacheDir}/${resolvedFileName}`;

  let res;
  try {
    const task = ReactNativeBlobUtil.config({
      fileCache: true,
      path: filePath,
      overwrite: true,
      timeout: 300000, // 5 min — large files need real headroom, not the default
      indicator: true, // shows the native iOS network activity indicator
    }).fetch('GET', url);

    task.progress((received, total) => {
      if (onProgress && total > 0) {
        onProgress(Math.floor((received / total) * 100));
      }
    });

    res = await task;

    if (!res) {
      throw new Error('Download did not return a response (res is undefined).');
    }

    const status = res.info()?.status;
    if (status && (status < 200 || status >= 300)) {
      throw new Error(`Download failed with HTTP status ${status}.`);
    }
  } catch (err) {
    console.log('PDF download fetch failed:', err);

    // "Download interrupted" is usually transient (dropped connection,
    // dev-mode Flipper network interception, brief network blip) — retry
    // a couple of times before giving up and surfacing the error.
    const isInterrupted = String(err?.message || err).includes('interrupted');
    if (isInterrupted && _retryCount < MAX_RETRIES) {
      console.log(`Retrying PDF download (attempt ${_retryCount + 1}/${MAX_RETRIES})...`);
      return downloadAndOpenPdf(url, fileName, onProgress, _retryCount + 1);
    }

    throw err;
  }

  const savedPath = res.path();
  console.log('PDF saved at:', savedPath);

  try {
    if (Platform.OS === 'ios') {
      await ReactNativeBlobUtil.ios.openDocument(savedPath);
    } else {
      await ReactNativeBlobUtil.android.actionViewIntent(savedPath, 'application/pdf');
    }
  } catch (err) {
    console.log('Opening PDF failed:', err);
    throw err;
  }

  return savedPath;
}