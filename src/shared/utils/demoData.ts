import { uid, nowISO, todayISO, tomorrowISO } from '../utils';
import type { Task, Workflow, FileItem, ActivityEvent, Device, DeviceMetric, SessionSnapshot, MeshTelemetry } from '../types';

export const DEMO_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Deploy Edge Mesh & Finish Report',
    description: 'Verify Wi-Fi 7 Direct link, run local container tests, compile benchmark results, and export submission PDF.',
    priority: 'HIGH',
    dueDate: todayISO(),
    completed: false,
    progress: 60,
    subtasks: [
      { id: 's1', title: 'Verify P2P Wi-Fi 7 Direct transport', completed: true },
      { id: 's2', title: 'Compile benchmark latency results (<2ms)', completed: true },
      { id: 's3', title: 'Run local NPU inference verification', completed: true },
      { id: 's4', title: 'Review offline vault file hashes', completed: false },
      { id: 's5', title: 'Export final Hackathon PDF report', completed: false },
    ],
    workflowId: 'w1',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 't2',
    title: 'Inspect Biometric Token Controller',
    description: 'Audit auth_controller.py for zero-cloud token validation before power-cut handover.',
    priority: 'MEDIUM',
    dueDate: todayISO(),
    completed: false,
    progress: 40,
    subtasks: [
      { id: 's6', title: 'Check fallback token TTL', completed: true },
      { id: 's7', title: 'Validate hardware signature', completed: false },
    ],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 't3',
    title: 'iQOO Hackathon Stage Demonstration',
    description: 'Execute the 4-stage Live Blackout pitch for judges.',
    priority: 'HIGH',
    dueDate: tomorrowISO(),
    completed: false,
    progress: 75,
    subtasks: [
      { id: 's8', title: 'Stage 1: P2P Mesh Telemetry link', completed: true },
      { id: 's9', title: 'Stage 2: Simulate power outage takeover', completed: true },
      { id: 's10', title: 'Stage 3: Edit code in Offline Vault on phone', completed: true },
      { id: 's11', title: 'Stage 4: Automated conflict-free diff merge', completed: false },
    ],
    workflowId: 'w3',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Edge Mesh Deployment & Validation',
    description: 'AI-generated plan for zero-downtime cross-device deployment.',
    steps: [
      { id: 'ws1', title: 'Verify Wi-Fi 7 Direct P2P link', status: 'completed' },
      { id: 'ws2', title: 'Stream active session telemetry to iQOO phone', status: 'completed' },
      { id: 'ws3', title: 'Simulate power blackout & trigger hot-standby', status: 'completed' },
      { id: 'ws4', title: 'Resume editing in Offline Vault', status: 'active' },
      { id: 'ws5', title: 'Reconnect laptop & merge diff report', status: 'pending' },
    ],
    status: 'running',
    sourceTaskId: 't1',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'w2',
    name: 'Multimodal Hardware Inspection',
    description: 'Inspect laptop motherboard status, scan QR verification, and generate diagnostics.',
    steps: [
      { id: 'ws6', title: 'Ping laptop hardware sensor bus', status: 'completed' },
      { id: 'ws7', title: 'Verify thermal dissipation state', status: 'completed' },
      { id: 'ws8', title: 'Capture circuit inspection photo', status: 'pending', requiresCamera: true, requiresConfirmation: true },
      { id: 'ws9', title: 'Analyze observation via on-device NPU', status: 'pending' },
      { id: 'ws10', title: 'Generate signed audit report', status: 'pending' },
    ],
    status: 'not_started',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'w3',
    name: 'Live Judge Pitch Flow',
    description: '4-stage interactive walkthrough designed for iQOO Hackathon judges.',
    steps: [
      { id: 'ws11', title: 'Stage 1: P2P Mesh Telemetry live streaming', status: 'completed' },
      { id: 'ws12', title: 'Stage 2: Simulate power cut & instant session takeover', status: 'completed' },
      { id: 'ws13', title: 'Stage 3: Edit code in Offline Vault on phone', status: 'completed' },
      { id: 'ws14', title: 'Stage 4: Laptop power restoration & auto diff merge', status: 'pending' },
    ],
    status: 'running',
    sourceTaskId: 't3',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export const DEMO_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'auth_controller.py',
    type: 'document',
    category: 'projects',
    size: '14.2 KB',
    modified: nowISO(),
    synced: true,
    syncedAt: nowISO(),
    path: 'Workspace/backend/auth_controller.py',
    isCode: true,
    language: 'python',
    content: `# PocketOps Edge Session Handoff Target
import jwt
from typing import Dict, Any

SECRET_KEY = "iqoo-supersync-local-mesh-key"

def verify_session_token(token: str, device_id: str) -> Dict[str, Any]:
    """Validates device token over local P2P Mesh with zero cloud dependency."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    
    # [OFFLINE TAKEOVER EDIT]
    if not is_device_authorized(device_id):
        raise SecurityException("Device node not recognized in local mesh")
        
    return {
        "status": "authorized",
        "node": device_id,
        "latency_mode": "DIRECT_P2P",
        "offline_ready": True
    }

def is_device_authorized(device_id: str) -> bool:
    # Hardware UUID verification against local secure enclave
    return device_id.startswith("iqoo-node-")`,
  },
  {
    id: 'f2',
    name: 'PROJECT_SPEC.md',
    type: 'document',
    category: 'documents',
    size: '8.4 KB',
    modified: nowISO(),
    synced: true,
    syncedAt: nowISO(),
    path: 'Workspace/docs/PROJECT_SPEC.md',
    isCode: false,
    language: 'markdown',
    content: `# PocketOps: Edge-First Cross-Device Continuity Engine

## Core Philosophy
When the laptop fails or loses power, your work should never stop.

### Key Performance Metrics:
- **P2P Transport:** Wi-Fi 7 Direct + BLE 5.4
- **Handshake Latency:** < 1.5ms
- **Encryption:** AES-256-GCM End-to-End
- **NPU Engine:** On-device SLM task breakdown`,
  },
  {
    id: 'f3',
    name: 'Hackathon_Pitch_Deck.pptx',
    type: 'presentation',
    category: 'projects',
    size: '6.4 MB',
    modified: nowISO(),
    synced: true,
    syncedAt: nowISO(),
    path: 'Workspace/presentations/Hackathon_Pitch_Deck.pptx',
    isCode: false,
  },
  {
    id: 'f4',
    name: 'mesh_config.json',
    type: 'document',
    category: 'projects',
    size: '3.1 KB',
    modified: nowISO(),
    synced: true,
    syncedAt: nowISO(),
    path: 'Workspace/config/mesh_config.json',
    isCode: true,
    language: 'json',
    content: `{
  "mesh_node": "iqoo-flagship-standby-01",
  "p2p_channel": "WiFi-7-Direct-CH149",
  "heartbeat_interval_ms": 200,
  "blackout_trigger_threshold_ms": 500,
  "hot_standby_enabled": true,
  "auto_merge_on_reconnect": true
}`,
  },
  {
    id: 'f5',
    name: 'Architecture_Blueprint.png',
    type: 'image',
    category: 'images',
    size: '2.8 MB',
    modified: nowISO(),
    synced: false,
    path: 'Workspace/assets/Architecture_Blueprint.png',
    isCode: false,
  },
];

export const DEMO_SESSION_SNAPSHOT: SessionSnapshot = {
  activeFile: 'auth_controller.py',
  filePath: 'workspace/backend/controllers/auth_controller.py',
  line: 48,
  gitBranch: 'feature/p2p-continuity',
  originalBuffer: `# PocketOps Edge Session Handoff Target
import jwt
from typing import Dict, Any

SECRET_KEY = "iqoo-supersync-local-mesh-key"

def verify_session_token(token: str, device_id: str) -> Dict[str, Any]:
    """Validates device token over local P2P Mesh with zero cloud dependency."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    if not is_device_authorized(device_id):
        raise SecurityException("Device node not recognized in local mesh")
    return {"status": "authorized", "node": device_id}
`,
  unsavedBuffer: `# PocketOps Edge Session Handoff Target
import jwt
from typing import Dict, Any

SECRET_KEY = "iqoo-supersync-local-mesh-key"

def verify_session_token(token: str, device_id: str) -> Dict[str, Any]:
    """Validates device token over local P2P Mesh with zero cloud dependency."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    
    # [OFFLINE TAKEOVER] Verify hardware biometric hash
    if not is_device_authorized(device_id) or not verify_biometric_node():
        raise SecurityException("Device node not recognized or biometric missing")
        
    return {
        "status": "authorized",
        "node": device_id,
        "latency_mode": "DIRECT_P2P",
        "offline_ready": True
    }
`,
  activeTerminalCmd: 'docker compose -f docker-compose.prod.yml up -d --build',
  terminalOutput: [
    '[+] Building 8.4s (12/12) FINISHED',
    '[+] Running 4/4',
    ' ✔ Container db-cluster      Started',
    ' ✔ Container redis-mesh     Started',
    ' ✔ Container api-gateway    Started',
    ' ✔ Container edge-worker    Listening on port 8080 [Wi-Fi 7 Direct]',
  ],
  activeWorkflowId: 'w1',
  timestamp: nowISO(),
  appTitle: 'VS Code & Warp Terminal — Laptop',
};

export const DEMO_MESH_TELEMETRY: MeshTelemetry = {
  transport: 'P2P Protocol (Direct Link)',
  latencyMs: 2.4,
  throughputMbps: 840,
  localEncryption: 'AES-256-GCM (Local Keystore)',
  npuStatus: 'Local Schema Engine (0ms Cloud Latency)',
  packetsPerSec: 4920,
  signalStrength: 98,
};

export const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: uid(), type: 'blackout_takeover', title: 'Hot-Standby Takeover Ready', detail: 'VS Code buffer & Terminal state synced via P2P Mesh', timestamp: nowISO() },
  { id: uid(), type: 'file_synced', title: 'auth_controller.py pre-cached', detail: 'Predictive Vault ready for offline editing', timestamp: nowISO() },
  { id: uid(), type: 'device_checked', title: 'SuperSync Mesh Heartbeat', detail: 'Latency: <5ms target · P2P local bandwidth', timestamp: nowISO() },
  { id: uid(), type: 'ai_breakdown', title: 'Local Schema Decomposition', detail: '5-step Edge Mesh plan validated offline', timestamp: nowISO() },
  { id: uid(), type: 'task_created', title: 'Task created', detail: 'iQOO Hackathon Stage Demonstration', timestamp: nowISO() },
];

const laptopMetrics: DeviceMetric[] = [
  { key: 'cpu', label: 'CPU', value: '28', unit: '%' },
  { key: 'ram', label: 'RAM', value: '58', unit: '%' },
  { key: 'battery', label: 'Battery', value: '82', unit: '%' },
  { key: 'storage', label: 'Storage', value: '62', unit: '%' },
  { key: 'temp', label: 'Temperature', value: '39', unit: '°C' },
  { key: 'network', label: 'Transport', value: 'P2P Direct Link' },
];

export const DEMO_DEVICE: Device = {
  id: 'laptop',
  name: 'Laptop (ThinkPad X1)',
  type: 'laptop',
  status: 'connected',
  health: 'good',
  metrics: laptopMetrics,
  lastUpdated: nowISO(),
  supportsWake: true,
};
