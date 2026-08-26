// /**
//  * ----------------------------------------------------------------------
//  * completedDownloadsStore.js
//  *
//  * Why this exists: reattachBackgroundDownloads() should only be called
//  * ONCE per app session (in App.js), because calling it again from a
//  * screen's hook would attach a second set of .progress()/.done()/.error()
//  * listeners to the same native task and double-fire your callbacks.
//  *
//  * App.js owns the single reattach call and pushes updates here.
//  * useFileDownload() subscribes by taskId instead of calling
//  * reattachBackgroundDownloads() itself.
//  * ----------------------------------------------------------------------
//  */

// const listenersByTaskId = new Map(); // taskId -> Set<fn>
// const latestStateByTaskId = new Map(); // taskId -> { status, progress, filePath }

// function notify(taskId) {
//   const state = latestStateByTaskId.get(taskId);
//   const listeners = listenersByTaskId.get(taskId);
//   if (!state || !listeners) return;
//   listeners.forEach((fn) => fn(state));
// }

// export const completedDownloadsStore = {
//   /**
//    * Called once from App.js's reattachBackgroundDownloads callback.
//    * Wires the native task's events into this store so any screen that
//    * mounts later (even after the download already finished) can sync.
//    */
//   track(taskId, task) {
//     latestStateByTaskId.set(taskId, { status: 'downloading', progress: 0, filePath: null });
//     notify(taskId);

//     task
//       .progress(({ bytesDownloaded, bytesTotal }) => {
//         const pct = bytesTotal > 0 ? Math.floor((bytesDownloaded / bytesTotal) * 100) : 0;
//         latestStateByTaskId.set(taskId, { status: 'downloading', progress: pct, filePath: null });
//         notify(taskId);
//       })
//       .done(({ location }) => {
//         latestStateByTaskId.set(taskId, { status: 'completed', progress: 100, filePath: location });
//         notify(taskId);
//       })
//       .error(() => {
//         latestStateByTaskId.set(taskId, { status: 'error', progress: 0, filePath: null });
//         notify(taskId);
//       });
//   },

//   /** Screens call this from useEffect to get live updates for one taskId. */
//   subscribe(taskId, fn) {
//     if (!listenersByTaskId.has(taskId)) listenersByTaskId.set(taskId, new Set());
//     listenersByTaskId.get(taskId).add(fn);

//     // Immediately flush the latest known state, in case the download
//     // already finished before this screen mounted.
//     const state = latestStateByTaskId.get(taskId);
//     if (state) fn(state);

//     return () => listenersByTaskId.get(taskId)?.delete(fn);
//   },

//   /** Called by the screen's own startBackgroundDownload() to seed state. */
//   setState(taskId, state) {
//     latestStateByTaskId.set(taskId, state);
//     notify(taskId);
//   },
// };

/**
 * ----------------------------------------------------------------------
 * completedDownloadsStore.js
 *
 * Why this exists: reattachBackgroundDownloads() should only be called
 * ONCE per app session (in App.js), because calling it again from a
 * screen's hook would attach a second set of .progress()/.done()/.error()
 * listeners to the same native task and double-fire your callbacks.
 *
 * App.js owns the single reattach call and pushes updates here.
 * useFileDownload() subscribes by taskId instead of calling
 * reattachBackgroundDownloads() itself.
 * ----------------------------------------------------------------------
 */

const listenersByTaskId = new Map(); // taskId -> Set<fn>
const latestStateByTaskId = new Map(); // taskId -> { status, progress, filePath }

function notify(taskId) {
  const state = latestStateByTaskId.get(taskId);
  const listeners = listenersByTaskId.get(taskId);
  if (!state || !listeners) return;
  listeners.forEach((fn) => fn(state));
}

export const completedDownloadsStore = {
  /**
   * Called once from App.js's reattachBackgroundDownloads callback.
   * Wires the native task's events into this store so any screen that
   * mounts later (even after the download already finished) can sync.
   */
  track(taskId, task) {
    latestStateByTaskId.set(taskId, { status: 'downloading', progress: 0, filePath: null });
    notify(taskId);

    task
      .progress(({ bytesDownloaded, bytesTotal }) => {
        const pct = bytesTotal > 0 ? Math.floor((bytesDownloaded / bytesTotal) * 100) : 0;
        latestStateByTaskId.set(taskId, { status: 'downloading', progress: pct, filePath: null });
        notify(taskId);
      })
      .done(({ location }) => {
        latestStateByTaskId.set(taskId, { status: 'completed', progress: 100, filePath: location });
        notify(taskId);
      })
      .error(() => {
        latestStateByTaskId.set(taskId, { status: 'error', progress: 0, filePath: null });
        notify(taskId);
      });
  },

  /** Screens call this from useEffect to get live updates for one taskId. */
  subscribe(taskId, fn) {
    if (!listenersByTaskId.has(taskId)) listenersByTaskId.set(taskId, new Set());
    listenersByTaskId.get(taskId).add(fn);

    // Immediately flush the latest known state, in case the download
    // already finished before this screen mounted.
    const state = latestStateByTaskId.get(taskId);
    if (state) fn(state);

    return () => listenersByTaskId.get(taskId)?.delete(fn);
  },

  /** Called by the screen's own startBackgroundDownload() to seed state. */
  setState(taskId, state) {
    latestStateByTaskId.set(taskId, state);
    notify(taskId);
  },

  /**
   * Clears a task back to idle. Call this after the user opens or
   * dismisses the completion modal, so re-subscribing (e.g. a screen
   * mounting later) doesn't immediately re-trigger the modal for a
   * download that's already been acknowledged.
   */
  reset(taskId) {
    latestStateByTaskId.set(taskId, { status: 'idle', progress: 0, filePath: null });
    notify(taskId);
  },
};