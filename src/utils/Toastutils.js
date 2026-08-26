import Toast from 'react-native-toast-message';

/**
 * ----------------------------------------------------------------------
 * toastUtils
 *
 * Thin wrapper around react-native-toast-message so every screen calls
 * the same simple API instead of remembering Toast.show()'s options
 * shape each time.
 *
 * Usage:
 *   showSuccessToast('Registration successful');
 *   showErrorToast('Failed to download brochure. Please try again.');
 *   showInfoToast('Copied to clipboard');
 * ----------------------------------------------------------------------
 */

const DEFAULT_OPTIONS = {
  position: 'bottom',   // matches native Android Toast's default position
  visibilityTime: 3000, // ms before auto-dismiss
  autoHide: true,
  bottomOffset: 60,
};

export function showSuccessToast(message, title = 'Success') {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
  });
}

export function showErrorToast(message, title = 'Error') {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
  });
}

export function showInfoToast(message, title) {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
  });
}