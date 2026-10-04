import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  Task, Workflow, WorkflowStep, FileItem, ActivityEvent, Device, DeviceMetric,
  UserSettings, ToastType, ActivityType, Command, SyncItem,
  JudgeDemoStage, SessionSnapshot, MeshTelemetry, DiffMergeReport,
} from '../../shared/types';
import { uid, nowISO, todayISO, tomorrowISO, workflowPercent } from '../../shared/utils';
import {
  DEMO_TASKS, DEMO_WORKFLOWS, DEMO_FILES, DEMO_ACTIVITY, DEMO_DEVICE,
  DEMO_SESSION_SNAPSHOT, DEMO_MESH_TELEMETRY,
} from '../../shared/utils/demoData';
import { initEngine, dispatch as engineDispatch } from '../commands/intentEngine';
import { useToast } from '../../shared/components/Toast';

/* ---------- state shape ---------- */
export interface AppState {
  tasks: Task[];
  workflows: Workflow[];
  files: FileItem[];
  activity: ActivityEvent[];
  device: Device;
  settings: UserSettings;
  syncItems: SyncItem[];
  // iQOO Flagship Continuity & Judge Demo state
  sessionSnapshot: SessionSnapshot;
  meshTelemetry: MeshTelemetry;
  judgeStage: JudgeDemoStage;
  diffReport: DiffMergeReport | null;
  selectedFileForEdit: FileItem | null;
  isBlackoutModalOpen: boolean;
  isResyncModalOpen: boolean;
}

const PERSIST_KEY = 'pocketops-state-v2';

const DEFAULT_SETTINGS: UserSettings = {
  demoMode: false,
  laptopOffline: false,
  voiceEnabled: false,
  notifications: true,
  cameraPermission: true,
  micPermission: true,
  reducedMotion: false,
  theme: 'dark',
};

function sanitizeSettings(raw: unknown): UserSettings {
  const out = { ...DEFAULT_SETTINGS };
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof UserSettings)[]) {
      if (key === 'theme') {
        if (o.theme === 'light' || o.theme === 'dark') out.theme = o.theme;
      } else if (typeof o[key] === 'boolean') {
        (out as Record<string, unknown>)[key] = o[key];
      }
    }
  }
  return out;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const deviceOk = parsed.device
          && typeof parsed.device === 'object'
          && Array.isArray((parsed.device as Device).metrics);
        return {
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks as Task[] : DEMO_TASKS,
          workflows: Array.isArray(parsed.workflows) ? parsed.workflows as Workflow[] : DEMO_WORKFLOWS,
          files: Array.isArray(parsed.files) ? parsed.files as FileItem[] : DEMO_FILES,
          activity: Array.isArray(parsed.activity) ? parsed.activity as ActivityEvent[] : DEMO_ACTIVITY,
          device: deviceOk ? parsed.device as Device : DEMO_DEVICE,
          settings: sanitizeSettings(parsed.settings),
          syncItems: [],
          sessionSnapshot: parsed.sessionSnapshot || DEMO_SESSION_SNAPSHOT,
          meshTelemetry: parsed.meshTelemetry || DEMO_MESH_TELEMETRY,
          judgeStage: parsed.judgeStage || 'normal',
          diffReport: parsed.diffReport || null,
          selectedFileForEdit: null,
          isBlackoutModalOpen: false,
          isResyncModalOpen: false,
        };
      }
    }
  } catch { /* fall through — corrupted storage recovers to demo data */ }
  return {
    tasks: DEMO_TASKS,
    workflows: DEMO_WORKFLOWS,
    files: DEMO_FILES,
    activity: DEMO_ACTIVITY,
    device: DEMO_DEVICE,
    settings: { ...DEFAULT_SETTINGS },
    syncItems: [],
    sessionSnapshot: DEMO_SESSION_SNAPSHOT,
    meshTelemetry: DEMO_MESH_TELEMETRY,
    judgeStage: 'normal',
    diffReport: null,
    selectedFileForEdit: null,
    isBlackoutModalOpen: false,
    isResyncModalOpen: false,
  };
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'ADD_WORKFLOW'; wf: Workflow }
  | { type: 'UPDATE_WORKFLOW'; id: string; patch: Partial<Workflow> }
  | { type: 'COMPLETE_STEP'; wfId: string; stepId: string }
  | { type: 'SKIP_STEP'; wfId: string; stepId: string }
  | { type: 'SYNC_FILE'; id: string }
  | { type: 'UPDATE_FILE_CONTENT'; id: string; content: string }
  | { type: 'ADD_ACTIVITY'; ev: ActivityEvent }
  | { type: 'CLEAR_ACTIVITY' }
  | { type: 'SET_DEVICE'; patch: Partial<Device> }
  | { type: 'SET_LAPTOP_OFFLINE'; offline: boolean }
  | { type: 'SET_SETTING'; key: keyof UserSettings; value: UserSettings[keyof UserSettings] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; theme: 'dark' | 'light' }
  | { type: 'START_SYNC'; item: SyncItem }
  | { type: 'UPDATE_SYNC'; id: string; patch: Partial<SyncItem> }
  | { type: 'SET_JUDGE_STAGE'; stage: JudgeDemoStage }
  | { type: 'TRIGGER_BLACKOUT_TAKEOVER' }
  | { type: 'TRIGGER_RESYNC_MERGE' }
  | { type: 'SET_SELECTED_FILE_FOR_EDIT'; file: FileItem | null }
  | { type: 'SET_BLACKOUT_MODAL_OPEN'; open: boolean }
  | { type: 'SET_RESYNC_MODAL_OPEN'; open: boolean }
  | { type: 'UPDATE_SESSION_BUFFER'; unsavedBuffer: string }
  | { type: 'RESET' };

function resolveAfterStep(w: Workflow, steps: WorkflowStep[]): Pick<Workflow, 'steps' | 'status' | 'updatedAt'> {
  const allDone = steps.every(s => s.status === 'completed' || s.status === 'skipped');
  const anyActive = steps.some(s => s.status === 'active');
  const status = allDone ? 'completed' : anyActive ? 'running' : w.status;
  return { steps, status, updatedAt: nowISO() };
}

function mapStepAdvance(
  w: Workflow,
  stepId: string,
  apply: (s: WorkflowStep) => WorkflowStep,
): Pick<Workflow, 'steps' | 'status' | 'updatedAt'> | null {
  const idx = w.steps.findIndex(s => s.id === stepId);
  if (idx === -1) return null;
  const hasOtherActive = w.steps.some((s, i) => s.status === 'active' && i !== idx);
  const steps = w.steps.map((s, i) => {
    if (i === idx) return apply(s);
    if (!hasOtherActive && i === idx + 1 && s.status === 'pending') return { ...s, status: 'active' as const };
    return s;
  });
  return resolveAfterStep(w, steps);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, ...action.patch, updatedAt: nowISO() } : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'TOGGLE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, completed: !t.completed, progress: t.completed ? 0 : 100, updatedAt: nowISO() } : t) };
    case 'ADD_WORKFLOW':
      return { ...state, workflows: [action.wf, ...state.workflows] };
    case 'UPDATE_WORKFLOW':
      return { ...state, workflows: state.workflows.map(w => w.id === action.id ? { ...w, ...action.patch, updatedAt: nowISO() } : w) };
    case 'COMPLETE_STEP': {
      return {
        ...state,
        workflows: state.workflows.map(w => {
          if (w.id !== action.wfId) return w;
          const next = mapStepAdvance(w, action.stepId, s => ({ ...s, status: 'completed' as const }));
          return next ? { ...w, ...next } : w;
        }),
      };
    }
    case 'SKIP_STEP': {
      return {
        ...state,
        workflows: state.workflows.map(w => {
          if (w.id !== action.wfId) return w;
          const next = mapStepAdvance(w, action.stepId, s => ({ ...s, status: 'skipped' as const }));
          return next ? { ...w, ...next } : w;
        }),
      };
    }
    case 'SYNC_FILE':
      return { ...state, files: state.files.map(f => f.id === action.id ? { ...f, synced: true, syncedAt: nowISO() } : f) };
    case 'UPDATE_FILE_CONTENT': {
      const f = state.files.find(x => x.id === action.id);
      return {
        ...state,
        files: state.files.map(file => {
          if (file.id !== action.id) return file;
          return {
            ...file,
            content: action.content,
            modifiedOffline: true,
            modified: nowISO(),
            diffSnippet: `+ Line modified in Offline Vault (${action.content.split('\n').length} lines)`,
          };
        }),
        selectedFileForEdit: f ? { ...f, content: action.content, modifiedOffline: true } : null,
      };
    }
    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.ev, ...state.activity].slice(0, 50) };
    case 'CLEAR_ACTIVITY':
      return { ...state, activity: [] };
    case 'SET_DEVICE':
      return { ...state, device: { ...state.device, ...action.patch, lastUpdated: action.patch.lastUpdated ?? nowISO() } };
    case 'SET_LAPTOP_OFFLINE': {
      const offline = action.offline;
      const metrics = state.device.metrics.map((m: DeviceMetric) => ({ ...m, lastKnown: offline }));
      return {
        ...state,
        device: {
          ...state.device,
          status: offline ? 'offline' as const : 'connected' as const,
          health: offline ? 'unknown' as const : 'good' as const,
          metrics,
          lastUpdated: offline ? state.device.lastUpdated : nowISO(),
        },
        settings: { ...state.settings, laptopOffline: offline },
        meshTelemetry: {
          ...state.meshTelemetry,
          transport: offline ? 'Offline Hot-Standby (Local Node)' : 'P2P Protocol (Direct Link)',
          latencyMs: offline ? 0.0 : 2.4,
          throughputMbps: offline ? 0 : 840,
        },
      };
    }
    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };
    case 'TOGGLE_THEME': {
      const nextTheme = state.settings.theme === 'light' ? 'dark' : 'light';
      return { ...state, settings: { ...state.settings, theme: nextTheme } };
    }
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.theme } };
    case 'START_SYNC':
      return { ...state, syncItems: [...state.syncItems.filter(s => s.id !== action.item.id), action.item] };
    case 'UPDATE_SYNC':
      return { ...state, syncItems: state.syncItems.map(s => s.id === action.id ? { ...s, ...action.patch } : s) };
    
    /* iQOO Flagship & Judge Demo Actions */
    case 'SET_JUDGE_STAGE':
      return { ...state, judgeStage: action.stage };

    case 'TRIGGER_BLACKOUT_TAKEOVER': {
      const metrics = state.device.metrics.map((m: DeviceMetric) => ({ ...m, lastKnown: true }));
      return {
        ...state,
        judgeStage: 'blackout',
        device: {
          ...state.device,
          status: 'offline' as const,
          health: 'unknown' as const,
          metrics,
        },
        settings: { ...state.settings, laptopOffline: true },
        isBlackoutModalOpen: true,
        meshTelemetry: {
          ...state.meshTelemetry,
          transport: 'Autonomous Hot-Standby (Enclave Node)',
          latencyMs: 0.0,
          throughputMbps: 0,
        },
      };
    }

    case 'TRIGGER_RESYNC_MERGE': {
      const metrics = state.device.metrics.map((m: DeviceMetric) => ({ ...m, lastKnown: false }));
      const report: DiffMergeReport = {
        timestamp: nowISO(),
        filesMerged: [
          { name: 'auth_controller.py', additions: 7, deletions: 1, status: 'conflict_free' },
          { name: 'PROJECT_SPEC.md', additions: 3, deletions: 0, status: 'conflict_free' },
          { name: 'mesh_config.json', additions: 2, deletions: 0, status: 'merged' },
        ],
        totalDiffs: 3,
        checksum: 'SHA256: 8f9b2c4e1a0d7f3e',
      };
      return {
        ...state,
        judgeStage: 'resync_merge',
        device: {
          ...state.device,
          status: 'connected' as const,
          health: 'good' as const,
          metrics,
          lastUpdated: nowISO(),
        },
        settings: { ...state.settings, laptopOffline: false },
        diffReport: report,
        isResyncModalOpen: true,
        meshTelemetry: {
          ...state.meshTelemetry,
          transport: 'Wi-Fi 7 Direct + BLE 5.4',
          latencyMs: 1.1,
          throughputMbps: 1840,
        },
      };
    }

    case 'SET_SELECTED_FILE_FOR_EDIT':
      return { ...state, selectedFileForEdit: action.file };

    case 'SET_BLACKOUT_MODAL_OPEN':
      return { ...state, isBlackoutModalOpen: action.open };

    case 'SET_RESYNC_MODAL_OPEN':
      return { ...state, isResyncModalOpen: action.open };

    case 'UPDATE_SESSION_BUFFER':
      return {
        ...state,
        sessionSnapshot: {
          ...state.sessionSnapshot,
          unsavedBuffer: action.unsavedBuffer,
          timestamp: nowISO(),
        },
      };

    case 'RESET':
      try { localStorage.removeItem(PERSIST_KEY); } catch { /* storage unavailable */ }
      return loadState();
    default:
      return state;
  }
}

/* ---------- context interface ---------- */
interface StoreCtx {
  state: AppState;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addWorkflow: (w: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Workflow;
  updateWorkflow: (id: string, patch: Partial<Workflow>) => void;
  completeStep: (wfId: string, stepId: string) => void;
  skipStep: (wfId: string, stepId: string) => void;
  syncFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  updateDevice: (patch: Partial<Device>) => void;
  logActivity: (type: ActivityType, title: string, detail?: string) => void;
  clearActivity: () => void;
  setLaptopOffline: (v: boolean) => void;
  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toast: (msg: string, type?: ToastType) => void;
  dispatch: (cmd: Command) => boolean;
  reset: () => void;
  // iQOO Flagship & Judge Demo Methods
  setJudgeStage: (stage: JudgeDemoStage) => void;
  triggerBlackoutTakeover: () => void;
  triggerResyncMerge: () => void;
  openFileEditor: (file: FileItem) => void;
  closeFileEditor: () => void;
  setBlackoutModalOpen: (open: boolean) => void;
  setResyncModalOpen: (open: boolean) => void;
  updateSessionBuffer: (buffer: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadState);
  const stateRef = useRef(state);
  const { show } = useToast();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const { syncItems: _syncItems, selectedFileForEdit: _file, ...persist } = state;
      localStorage.setItem(PERSIST_KEY, JSON.stringify(persist));
    } catch { /* storage unavailable */ }
  }, [state]);

  const toast = useCallback((msg: string, type: ToastType = 'info') => {
    show(msg, type);
  }, [show]);

  const logActivity = useCallback((type: ActivityType, title: string, detail?: string) => {
    rawDispatch({ type: 'ADD_ACTIVITY', ev: { id: uid(), type, title, detail, timestamp: nowISO() } });
  }, []);

  const addTask = useCallback((t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = { ...t, id: uid(), createdAt: nowISO(), updatedAt: nowISO() };
    rawDispatch({ type: 'ADD_TASK', task });
    logActivity('task_created', 'Task created', t.title);
    toast('Task created', 'success');
    return task;
  }, [logActivity, toast]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    rawDispatch({ type: 'UPDATE_TASK', id, patch });
  }, []);

  const deleteTask = useCallback((id: string) => {
    rawDispatch({ type: 'DELETE_TASK', id });
    toast('Task deleted', 'info');
  }, [toast]);

  const toggleTask = useCallback((id: string) => {
    const t = stateRef.current.tasks.find(x => x.id === id);
    rawDispatch({ type: 'TOGGLE_TASK', id });
    if (t && !t.completed) logActivity('task_completed', 'Task completed', t.title);
  }, [logActivity]);

  const addWorkflow = useCallback((w: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    const wf: Workflow = { ...w, id: uid(), createdAt: nowISO(), updatedAt: nowISO() };
    rawDispatch({ type: 'ADD_WORKFLOW', wf });
    logActivity('workflow_created', 'Workflow created', wf.name);
    toast('Workflow created', 'success');
    return wf;
  }, [logActivity, toast]);

  const updateWorkflow = useCallback((id: string, patch: Partial<Workflow>) => {
    rawDispatch({ type: 'UPDATE_WORKFLOW', id, patch });
  }, []);

  const completeStep = useCallback((wfId: string, stepId: string) => {
    const wf = stateRef.current.workflows.find(w => w.id === wfId);
    const step = wf?.steps.find(s => s.id === stepId);
    rawDispatch({ type: 'COMPLETE_STEP', wfId, stepId });
    if (step) logActivity('step_completed', 'Step completed', step.title);
    toast('Step completed', 'success');
  }, [logActivity, toast]);

  const skipStep = useCallback((wfId: string, stepId: string) => {
    rawDispatch({ type: 'SKIP_STEP', wfId, stepId });
    toast('Step skipped', 'info');
  }, [toast]);

  const syncFile = useCallback((id: string) => {
    const f = stateRef.current.files.find(x => x.id === id);
    rawDispatch({ type: 'SYNC_FILE', id });
    if (f) logActivity('file_synced', `${f.name} synced`, 'Available in Predictive Offline Vault');
    toast('File synced to Vault', 'success');
  }, [logActivity, toast]);

  const updateFileContent = useCallback((id: string, content: string) => {
    const f = stateRef.current.files.find(x => x.id === id);
    rawDispatch({ type: 'UPDATE_FILE_CONTENT', id, content });
    if (f) logActivity('offline_file_edited', `${f.name} edited offline`, 'Saved to local secure storage');
    toast('File saved in Offline Vault', 'success');
  }, [logActivity, toast]);

  const updateDevice = useCallback((patch: Partial<Device>) => {
    rawDispatch({ type: 'SET_DEVICE', patch });
  }, []);

  const clearActivity = useCallback(() => {
    if (!window.confirm('Clear all activity history? This cannot be undone.')) return;
    rawDispatch({ type: 'CLEAR_ACTIVITY' });
    toast('Activity history cleared', 'info');
  }, [toast]);

  const setLaptopOffline = useCallback((v: boolean) => {
    rawDispatch({ type: 'SET_LAPTOP_OFFLINE', offline: v });
    toast(v ? 'Laptop offline — Hot Standby engaged' : 'Laptop connected via Wi-Fi 7 Direct', v ? 'error' : 'success');
    logActivity(v ? 'device_offline' : 'device_online', v ? 'Laptop heartbeat lost' : 'Laptop connected via P2P');
  }, [toast, logActivity]);

  const setSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    rawDispatch({ type: 'SET_SETTING', key, value });
  }, []);

  const toggleTheme = useCallback(() => {
    rawDispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    rawDispatch({ type: 'SET_THEME', theme });
  }, []);

  useEffect(() => {
    const theme = state.settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [state.settings.theme]);

  const reset = useCallback(() => {
    if (!window.confirm('Reset all demo data? Your tasks, workflows, files, and activity will be replaced with original demo data.')) return;
    rawDispatch({ type: 'RESET' });
    toast('Demo data restored', 'info');
  }, [toast]);

  /* iQOO Hackathon Specific Handlers */
  const setJudgeStage = useCallback((stage: JudgeDemoStage) => {
    rawDispatch({ type: 'SET_JUDGE_STAGE', stage });
    if (stage === 'blackout') {
      rawDispatch({ type: 'TRIGGER_BLACKOUT_TAKEOVER' });
      logActivity('blackout_takeover', '🚨 Sudden Blackout Detected', 'Session handed over to iQOO phone');
      toast('Blackout Detected — Session Preserved on Phone!', 'ai');
    } else if (stage === 'resync_merge') {
      rawDispatch({ type: 'TRIGGER_RESYNC_MERGE' });
      logActivity('diff_merged', '✨ P2P Diff Merge Ready', '3 files merged back to Laptop');
      toast('Laptop Reconnected — Git Diff Review Ready!', 'success');
    } else if (stage === 'normal') {
      rawDispatch({ type: 'SET_LAPTOP_OFFLINE', offline: false });
      logActivity('device_online', 'P2P Mesh Synchronized', 'Local P2P direct link active');
      toast('SuperSync Mesh Active (Direct Link)', 'success');
    } else if (stage === 'offline_ops') {
      rawDispatch({ type: 'SET_LAPTOP_OFFLINE', offline: true });
      logActivity('offline_file_edited', 'Autonomous Mobile Ops', 'Running on local schema validator');
      toast('Offline Ops Active (Zero Cloud Needed)', 'ai');
    }
  }, [logActivity, toast]);

  const triggerBlackoutTakeover = useCallback(() => {
    rawDispatch({ type: 'TRIGGER_BLACKOUT_TAKEOVER' });
    logActivity('blackout_takeover', '🚨 Sudden Blackout Detected', 'Active IDE & Terminal mirrored to phone');
    toast('Emergency Hot-Standby Engaged!', 'ai');
  }, [logActivity, toast]);

  const triggerResyncMerge = useCallback(() => {
    rawDispatch({ type: 'TRIGGER_RESYNC_MERGE' });
    logActivity('diff_merged', '✨ Conflict-Free P2P Diff Merge', 'Auto-merged 3 offline modified files');
    toast('P2P Diff Merge Completed (0 Conflicts)', 'success');
  }, [logActivity, toast]);

  const openFileEditor = useCallback((file: FileItem) => {
    rawDispatch({ type: 'SET_SELECTED_FILE_FOR_EDIT', file });
  }, []);

  const closeFileEditor = useCallback(() => {
    rawDispatch({ type: 'SET_SELECTED_FILE_FOR_EDIT', file: null });
  }, []);

  const setBlackoutModalOpen = useCallback((open: boolean) => {
    rawDispatch({ type: 'SET_BLACKOUT_MODAL_OPEN', open });
  }, []);

  const setResyncModalOpen = useCallback((open: boolean) => {
    rawDispatch({ type: 'SET_RESYNC_MODAL_OPEN', open });
  }, []);

  const updateSessionBuffer = useCallback((buffer: string) => {
    rawDispatch({ type: 'UPDATE_SESSION_BUFFER', unsavedBuffer: buffer });
  }, []);

  /* deterministic intent executor */
  const executeCmd = useCallback((cmd: Command) => {
    const s = stateRef.current;
    const payload = cmd.payload ?? {};

    switch (cmd.intent) {
      case 'CREATE_TASK': {
        const rawTitle = payload.title;
        const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
        if (!title) { toast('Could not create task — missing title', 'error'); return; }
        const priority = payload.priority === 'HIGH' || payload.priority === 'LOW' || payload.priority === 'MEDIUM'
          ? payload.priority : 'MEDIUM';
        let dueDate = '';
        if (payload.dueDate === 'today') dueDate = todayISO();
        else if (payload.dueDate === 'tomorrow') dueDate = tomorrowISO();
        else if (typeof payload.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.dueDate)) dueDate = payload.dueDate;
        addTask({ title, description: '', priority, dueDate, reminder: '', subtasks: [], progress: 0, completed: false });
        break;
      }
      case 'DEVICE_STATUS': {
        const d = stateRef.current.device;
        const online = d.status === 'connected';
        toast(online ? `${d.name} connected · Health ${d.health === 'good' ? 'Good' : d.health}` : `${d.name} is offline (Standby Active)`, online ? 'success' : 'error');
        logActivity('device_checked', 'Device status checked', online ? `${d.name} connected` : `${d.name} offline`);
        break;
      }
      case 'RESUME_WORKFLOW': {
        const wf = s.workflows.find(w => w.status === 'paused')
          || s.workflows.find(w => w.status === 'running')
          || s.workflows.find(w => w.status === 'not_started');
        if (!wf) { toast('No workflow available to resume', 'error'); return; }
        updateWorkflow(wf.id, { status: 'running' });
        logActivity('workflow_resumed', 'Workflow resumed', wf.name);
        toast(`Resumed ${wf.name}`, 'success');
        break;
      }
      case 'PAUSE_WORKFLOW': {
        const wf = s.workflows.find(w => w.status === 'running') || s.workflows.find(w => w.status === 'paused');
        if (!wf) { toast('No active workflow to pause', 'info'); return; }
        if (wf.status === 'running') {
          updateWorkflow(wf.id, { status: 'paused' });
          logActivity('workflow_paused', 'Workflow paused', wf.name);
          toast(`Paused ${wf.name}`, 'info');
        } else {
          toast(`${wf.name} is already paused`, 'info');
        }
        break;
      }
      case 'START_WORKFLOW': {
        const wf = s.workflows.find(w => w.status === 'not_started');
        if (!wf) { toast('No workflow waiting to start', 'info'); return; }
        const firstPending = wf.steps.find(st => st.status === 'pending');
        updateWorkflow(wf.id, {
          status: 'running',
          steps: firstPending
            ? wf.steps.map(st => st.id === firstPending.id ? { ...st, status: 'active' as const } : st)
            : wf.steps,
        });
        logActivity('workflow_started', 'Workflow started', wf.name);
        toast(`Started ${wf.name}`, 'success');
        break;
      }
      case 'SEARCH_FILES': {
        const q = typeof payload.query === 'string' ? payload.query : '';
        toast(q ? `Searching files for "${q}"` : 'Opening files', 'info');
        break;
      }
      case 'WAKE_DEVICE':
        break;
      case 'COMPLETE_STEP': {
        const wfId = typeof payload.wfId === 'string' ? payload.wfId : '';
        const stepId = typeof payload.stepId === 'string' ? payload.stepId : '';
        const wf = s.workflows.find(w => w.id === wfId);
        if (!wf || !wf.steps.some(st => st.id === stepId)) { toast('Step not found', 'error'); return; }
        completeStep(wfId, stepId);
        break;
      }
      default:
        toast('Command not supported', 'error');
    }
  }, [addTask, completeStep, logActivity, toast, updateWorkflow]);

  const executeRef = useRef<(cmd: Command) => void>(() => {});
  useEffect(() => {
    executeRef.current = executeCmd;
  }, [executeCmd]);

  useEffect(() => {
    initEngine({
      get settings() { return stateRef.current.settings; },
      get device() { return stateRef.current.device; },
      toast,
      execute: (cmd) => executeRef.current(cmd),
    });
  }, [toast]);

  const dispatch = useCallback((cmd: Command) => engineDispatch(cmd), []);

  const value: StoreCtx = {
    state, addTask, updateTask, deleteTask, toggleTask,
    addWorkflow, updateWorkflow, completeStep, skipStep,
    syncFile, updateFileContent, updateDevice, logActivity, clearActivity,
    setLaptopOffline, setSetting, toggleTheme, setTheme, toast, dispatch, reset,
    setJudgeStage, triggerBlackoutTakeover, triggerResyncMerge,
    openFileEditor, closeFileEditor, setBlackoutModalOpen, setResyncModalOpen,
    updateSessionBuffer,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be inside StoreProvider');
  return c;
}

export { workflowPercent };
