/**
 * Adapter interfaces — mock implementations by default.
 * Replace with real platform adapters when integrating hardware.
 */

import type { DeviceMetric } from '../shared/types';

export interface DeviceAdapter {
  getMetrics(): Promise<DeviceMetric[]>;
  getStatus(): Promise<'connected' | 'offline'>;
  sendWake(): Promise<'sent' | 'unsupported'>;
}

export interface FileAdapter {
  list(path: string): Promise<{ name: string; size: string }[]>;
  readFile(id: string): Promise<{ available: boolean; reason?: string }>;
  syncFile(id: string): Promise<boolean>;
}

export interface CameraAdapter {
  requestPermission(): Promise<boolean>;
  capture(): Promise<{ dataUrl: string }>;
}

export interface ClipboardAdapter {
  read(): Promise<string>;
  write(text: string): Promise<void>;
  sync(): Promise<boolean>;
}

export interface SyncAdapter {
  syncFolder(path: string): Promise<{ synced: number; failed: number }>;
}

/* -------- Mock implementations (prototype) -------- */

export const mockDeviceAdapter: DeviceAdapter = {
  async getMetrics() {
    return [
      { key: 'cpu', label: 'CPU', value: '32', unit: '%' },
      { key: 'ram', label: 'RAM', value: '61', unit: '%' },
      { key: 'battery', label: 'Battery', value: '78', unit: '%' },
      { key: 'storage', label: 'Storage', value: '64', unit: '%' },
      { key: 'temp', label: 'Temperature', value: '42', unit: '°C' },
      { key: 'network', label: 'Network', value: 'Online' },
    ];
  },
  async getStatus() { return 'connected'; },
  async sendWake() { return 'sent'; },
};

export const mockFileAdapter: FileAdapter = {
  async list() { return []; },
  async readFile() { return { available: true }; },
  async syncFile() { return true; },
};

export const mockCameraAdapter: CameraAdapter = {
  async requestPermission() { return true; },
  async capture() { return { dataUrl: '' }; },
};

export const mockClipboardAdapter: ClipboardAdapter = {
  async read() { return 'npm run build'; },
  async write() { },
  async sync() { return true; },
};

export const mockSyncAdapter: SyncAdapter = {
  async syncFolder() { return { synced: 1, failed: 0 }; },
};
