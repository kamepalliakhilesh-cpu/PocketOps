export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type StepStatus = 'pending' | 'active' | 'completed' | 'paused' | 'failed' | 'skipped';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  reminder?: string;
  completed: boolean;
  progress: number;
  subtasks: SubTask[];
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  status: StepStatus;
  requiresCamera?: boolean;
  requiresConfirmation?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'not_started' | 'running' | 'paused' | 'completed';
  sourceTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceMetric {
  key: string;
  label: string;
  value: string | null;
  unit?: string;
  lastKnown?: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'other';
  status: 'connected' | 'offline' | 'unknown';
  health: 'good' | 'warning' | 'error' | 'unknown';
  metrics: DeviceMetric[];
  lastUpdated: string;
  supportsWake: boolean;
}

export type FileCategory = 'recent' | 'documents' | 'images' | 'projects';

export interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'presentation' | 'archive' | 'other';
  category: FileCategory;
  size: string;
  modified: string;
  synced: boolean;
  syncedAt?: string;
  path: string;
  content?: string;
  language?: string;
  isCode?: boolean;
  modifiedOffline?: boolean;
  diffSnippet?: string;
}

export type ActivityType =
  | 'task_created' | 'task_completed' | 'task_updated'
  | 'ai_breakdown' | 'workflow_created' | 'workflow_started'
  | 'workflow_paused' | 'workflow_resumed' | 'step_completed'
  | 'file_synced' | 'device_checked' | 'device_offline'
  | 'device_online' | 'wake_sent' | 'clipboard_synced'
  | 'camera_captured' | 'search_performed' | 'context_saved'
  | 'blackout_takeover' | 'diff_merged' | 'offline_file_edited';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  detail?: string;
  timestamp: string;
}

export type IntentType =
  | 'CREATE_TASK' | 'DEVICE_STATUS' | 'RESUME_WORKFLOW'
  | 'SEARCH_FILES' | 'WAKE_DEVICE' | 'PAUSE_WORKFLOW'
  | 'COMPLETE_STEP' | 'START_WORKFLOW' | 'NAVIGATE';

export interface Command {
  intent: IntentType;
  payload: Record<string, unknown>;
  source: 'manual' | 'voice' | 'ai';
}

export interface AIResult<T = unknown> {
  valid: boolean;
  data?: T;
  error?: string;
}

export interface TaskBreakdownResult {
  intent: 'BREAKDOWN_TASK';
  taskId: string;
  steps: string[];
  summary: string;
}

export interface IntentResult {
  intent: IntentType;
  title?: string;
  dueDate?: string;
  priority?: Priority;
  workflowName?: string;
  query?: string;
}

export interface SyncItem {
  id: string;
  fileName: string;
  status: 'idle' | 'syncing' | 'synced' | 'failed';
  progress: number;
}

export interface UserSettings {
  demoMode: boolean;
  laptopOffline: boolean;
  voiceEnabled: boolean;
  notifications: boolean;
  cameraPermission: boolean;
  micPermission: boolean;
  reducedMotion: boolean;
  theme: 'dark' | 'light';
}

export type ToastType = 'success' | 'error' | 'info' | 'ai';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

/* ---------- iQOO Flagship Hackathon Extensions ---------- */

export type JudgeDemoStage = 'normal' | 'blackout' | 'offline_ops' | 'resync_merge';

export interface SessionSnapshot {
  activeFile: string;
  filePath: string;
  line: number;
  gitBranch: string;
  unsavedBuffer: string;
  originalBuffer: string;
  activeTerminalCmd: string;
  terminalOutput: string[];
  activeWorkflowId?: string;
  timestamp: string;
  appTitle: string;
}

export interface MeshTelemetry {
  transport: string;
  latencyMs: number;
  throughputMbps: number;
  localEncryption: string;
  npuStatus: string;
  packetsPerSec: number;
  signalStrength: number;
}

export interface DiffMergeReport {
  timestamp: string;
  filesMerged: { name: string; additions: number; deletions: number; status: 'merged' | 'conflict_free' }[];
  totalDiffs: number;
  checksum: string;
}
