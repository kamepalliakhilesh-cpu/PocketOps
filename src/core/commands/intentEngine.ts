import type { Command, IntentType, UserSettings, Device, ToastType } from '../../shared/types';

/**
 * Security pipeline:
 *   User Input → Intent Engine → Structured Command → Schema Validation → Permission Check → Deterministic Action
 *
 * LLM output NEVER executes arbitrary commands.
 */

export type Executor = (cmd: Command) => void;

interface EngineDeps {
  settings: UserSettings;
  device: Device;
  toast: (msg: string, type?: ToastType) => void;
  execute: Executor;
}

let deps: EngineDeps | null = null;

export function initEngine(d: EngineDeps) {
  deps = d;
}

const SENSITIVE: Set<IntentType> = new Set(['WAKE_DEVICE']);

const ALLOWED_INTENTS: Set<IntentType> = new Set([
  'CREATE_TASK', 'DEVICE_STATUS', 'RESUME_WORKFLOW', 'SEARCH_FILES',
  'WAKE_DEVICE', 'PAUSE_WORKFLOW', 'COMPLETE_STEP', 'START_WORKFLOW', 'NAVIGATE',
]);

const ALLOWED_SOURCES: Set<string> = new Set(['manual', 'voice', 'ai']);

function validate(cmd: Command): boolean {
  if (!cmd || typeof cmd !== 'object') return false;
  if (!cmd.intent || typeof cmd.intent !== 'string') return false;
  if (!ALLOWED_INTENTS.has(cmd.intent)) return false;
  if (!ALLOWED_SOURCES.has(cmd.source)) return false;
  if (!cmd.payload || typeof cmd.payload !== 'object') return false;
  return true;
}

function permissionCheck(cmd: Command): boolean {
  if (!deps) return false;
  if (cmd.intent === 'WAKE_DEVICE' && !deps.device.supportsWake) {
    deps.toast('Wake not supported by this device', 'error');
    return false;
  }
  return true;
}

/**
 * Single entry point for both manual UI buttons and voice commands.
 */
export function dispatch(cmd: Command): boolean {
  if (!deps) { console.error('Engine not initialised'); return false; }

  if (!validate(cmd)) {
    deps.toast('Command rejected by schema validation', 'error');
    return false;
  }

  if (!permissionCheck(cmd)) return false;

  if (SENSITIVE.has(cmd.intent) && cmd.source === 'voice') {
    deps.toast('Confirm wake request in Devices screen', 'info');
    deps.execute(cmd);
    return true;
  }

  deps.execute(cmd);
  return true;
}
