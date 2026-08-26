import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { StatusBar, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import RouteContainer from './src/navigation/route';
import Orientation from 'react-native-orientation-locker';
import {
    configureBackgroundDownloader,
    reattachBackgroundDownloads,
    openDownloadedFile,
} from './src/lib/backgroundDownloader';
import { completedDownloadsStore } from './src/lib/completedDownloadsStore';
import DownloadCompleteModal from './src/component/DownloadCompleteModal';
import Toast from 'react-native-toast-message';
import { showErrorToast } from './src/utils/Toastutils';

// Runs once at module load, before RouteContainer (or anything else)
// mounts — this only sets NSURLSessionConfiguration / DownloadManager
// options, it does not start any network activity by itself.
configureBackgroundDownloader();

// Every taskId you download in the app that should trigger this global
// "download complete" modal. Add more entries here as you add more
// background-downloadable files.
const GLOBAL_DOWNLOAD_TASKS = {
    'brochure-pdf': { fileName: 'brochure.pdf' },
};

export default function App() {
    const userid = store.getState().auth.userid;

    useEffect(() => {
        Orientation.lockToLandscape();
    }, [])

    // Re-attach to any download that kept running while the app was
    // backgrounded, force-killed by the OS, or the user relaunched
    // mid-download. This must run at the app root — not just inside the
    // specific download screen — because a task can finish (or need its
    // `completeHandler` called on iOS) before the user ever navigates
    // back to that screen.
    useEffect(() => {
        reattachBackgroundDownloads((id, task) => {
            completedDownloadsStore.track(id, task);
        });
    }, []);

    // ---- Global "download complete" modal -----------------------------
    // Lives at the app root so it shows regardless of which screen the
    // user is currently on when the download finishes — this is the
    // whole point of subscribing here instead of inside DrawerOption.
    const [completedDownload, setCompletedDownload] = useState(null); // { taskId, filePath, fileName } | null

    useEffect(() => {
        const unsubscribers = Object.entries(GLOBAL_DOWNLOAD_TASKS).map(([taskId, meta]) =>
            completedDownloadsStore.subscribe(taskId, (state) => {
                if (state.status === 'completed' && state.filePath) {
                    setCompletedDownload({ taskId, filePath: state.filePath, fileName: meta.fileName });
                }
            })
        );
        return () => unsubscribers.forEach((unsub) => unsub());
    }, []);

    const handleOpenCompletedDownload = async () => {
        if (!completedDownload) return;
        try {
            await openDownloadedFile(completedDownload.filePath);
        } catch (e) {
            showErrorToast('The file downloaded but could not be opened.')
        }
        completedDownloadsStore.reset(completedDownload.taskId);
        setCompletedDownload(null);
    };

    const handleDismissCompletedDownload = () => {
        if (completedDownload) completedDownloadsStore.reset(completedDownload.taskId);
        setCompletedDownload(null);
    };
    // ---------------------------------------------------------------------

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f6fb" }} edges={["top", 'bottom']}>
                        <PaperProvider
                            settings={{
                                rippleEffectEnabled: false
                            }}
                            theme={{
                                ...DefaultTheme,
                                colors: {
                                    ...DefaultTheme.colors,
                                    background: 'transparent',
                                },
                            }}
                        >
                            {/* <StatusBar
                                barStyle="dark-content"
                                backgroundColor={'#f3f6fb'}
                                translucent={false}
                            /> */}

                            <StatusBar
                                barStyle="dark-content"
                                backgroundColor={userid ? '#6B9FE4' : '#6B9FE4'}
                                translucent={false}
                            />
                            <RouteContainer />

                            <DownloadCompleteModal
                                visible={!!completedDownload}
                                fileName={completedDownload?.fileName}
                                onOpen={handleOpenCompletedDownload}
                                onDismiss={handleDismissCompletedDownload}
                            />
                            {/* Mounted ONCE, as a sibling at the very end — Toast.show() calls
          anywhere in the app will render into this single instance. */}
                            <Toast />
                        </PaperProvider>
                    </SafeAreaView>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}