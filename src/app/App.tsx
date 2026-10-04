import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import BottomNav, { TopBar } from '../shared/components/Nav';
import JudgeDemoBar from '../shared/components/JudgeDemoBar';
import { ToastProvider } from '../shared/components/Toast';
import { StoreProvider, useStore } from '../core/store/StoreContext';
import HomeScreen from '../features/home/HomeScreen';
import TasksScreen from '../features/tasks/TasksScreen';
import WorkflowsScreen from '../features/workflows/WorkflowsScreen';
import WorkflowRunScreen from '../features/workflows/WorkflowRunScreen';
import FilesScreen from '../features/files/FilesScreen';
import DevicesScreen from '../features/devices/DevicesScreen';
import SearchScreen from '../features/search/SearchScreen';
import ActivityScreen from '../features/activity/ActivityScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
import CameraScreen from '../features/camera/CameraScreen';
import ClipboardScreen from '../features/devices/ClipboardScreen';
import BlackoutTakeoverModal from '../features/devices/BlackoutTakeoverModal';
import ResyncMergeModal from '../features/devices/ResyncMergeModal';
import FileEditorModal from '../features/files/FileEditorModal';

function AppRoutes() {
  const loc = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { state, closeFileEditor } = useStore();

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [loc.pathname]);

  const hideChrome = loc.pathname.startsWith('/camera') || loc.pathname.startsWith('/workflow-run');

  return (
    <div className="app-shell">
      {/* 1-Click Interactive Judge Pitch Demo Bar */}
      <JudgeDemoBar />

      {!hideChrome && <TopBar />}
      <div className="app-content" ref={contentRef}>
        <Routes location={loc}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/tasks" element={<TasksScreen />} />
          <Route path="/workflows" element={<WorkflowsScreen />} />
          <Route path="/workflow-run/:id" element={<WorkflowRunScreen />} />
          <Route path="/files" element={<FilesScreen />} />
          <Route path="/devices" element={<DevicesScreen />} />
          <Route path="/clipboard" element={<ClipboardScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/activity" element={<ActivityScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/camera/:wfId/:stepId" element={<CameraScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideChrome && <BottomNav />}

      {/* Global Interactive Modals */}
      <BlackoutTakeoverModal />
      <ResyncMergeModal />
      {state.selectedFileForEdit && (
        <FileEditorModal
          file={state.selectedFileForEdit}
          onClose={closeFileEditor}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="phone-viewport">
      <div className="phone-frame">
        <ToastProvider>
          <StoreProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </StoreProvider>
        </ToastProvider>
      </div>
    </div>
  );
}
