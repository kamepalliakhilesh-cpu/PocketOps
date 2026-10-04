import { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Activity, Zap, Radio } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';

export default function SuperSyncMeshCard() {
  const { state } = useStore();
  const telemetry = state.meshTelemetry;
  const isOffline = state.device.status === 'offline';
  const [packetCount, setPacketCount] = useState(telemetry.packetsPerSec);

  useEffect(() => {
    if (isOffline) return;
    const interval = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 15) - 7);
    }, 1500);
    return () => clearInterval(interval);
  }, [isOffline]);

  return (
    <div className="card mesh-card fade-in-up">
      <div className="mesh-header">
        <div className="row gap-10 align-center">
          <span className="mesh-logo-badge">
            <Radio size={16} />
          </span>
          <div>
            <div className="mesh-title">iQOO SuperSync Mesh</div>
            <div className="mesh-subtitle">
              {isOffline ? 'Autonomous Local Standby' : 'Direct P2P Link (Protocol Simulation)'}
            </div>
          </div>
        </div>
        <span className={`badge ${isOffline ? 'badge-offline' : 'badge-online'}`}>
          <span className="live-dot" />
          {isOffline ? 'STANDBY' : 'P2P DIRECT'}
        </span>
      </div>

      {/* Grid of hardware metrics */}
      <div className="mesh-metrics-grid mt-12">
        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Target Latency</span>
            <Activity size={12} color="var(--cyan)" />
          </div>
          <div className="mesh-metric-val" style={{ color: isOffline ? 'var(--text-tertiary)' : 'var(--cyan)' }}>
            {isOffline ? '0.0 ms' : `${telemetry.latencyMs} ms`}
          </div>
          <div className="metric-sub">
            {isOffline ? 'Zero Cloud' : 'Target <5ms PHY'}
          </div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Peak Bandwidth</span>
            <Zap size={12} color="var(--iqoo-amber)" />
          </div>
          <div className="mesh-metric-val" style={{ color: isOffline ? 'var(--text-tertiary)' : 'var(--iqoo-amber)' }}>
            {isOffline ? 'Standby' : `${telemetry.throughputMbps} Mbps`}
          </div>
          <div className="metric-sub">
            {isOffline ? 'Cached Flash' : 'Target PHY Profile'}
          </div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Security Model</span>
            <ShieldCheck size={12} color="var(--green)" />
          </div>
          <div className="mesh-metric-val" style={{ fontSize: 13, color: 'var(--green-bright)' }}>
            AES-256-GCM
          </div>
          <div className="metric-sub">Local Keystore</div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Edge Execution</span>
            <Cpu size={12} color="var(--purple-bright)" />
          </div>
          <div className="mesh-metric-val" style={{ fontSize: 13, color: 'var(--purple-bright)' }}>
            Local Engine
          </div>
          <div className="metric-sub">100% Offline</div>
        </div>
      </div>

      <div className="mesh-footer-note mt-12">
        <span className="text-xs text-tertiary">
          Local P2P session protocol · <b style={{ color: 'var(--text-secondary)' }}>{packetCount.toLocaleString()} pkts/s</b>
        </span>
      </div>

      <style>{`
        .mesh-card {
          background: linear-gradient(180deg, rgba(20, 24, 38, 0.8) 0%, rgba(13, 16, 26, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 15px;
          border-radius: var(--radius);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .mesh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mesh-logo-badge {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(255, 85, 0, 0.12);
          border: 1px solid rgba(255, 85, 0, 0.25);
          color: var(--iqoo-amber, #ff5500);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(255, 85, 0, 0.15);
        }
        .mesh-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .mesh-subtitle {
          font-size: 11px;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
          margin-top: 1px;
        }
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 1.8s infinite;
        }
        .mesh-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .mesh-metric-tile {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 9px 11px;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .mesh-metric-tile:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.09);
        }
        .metric-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text-tertiary);
        }
        .mesh-metric-val {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .metric-sub {
          font-size: 9.5px;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .mesh-footer-note {
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
