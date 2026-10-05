import { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Activity, Zap, Radio, Laptop, Smartphone } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { feedback } from '../../shared/utils/haptics';

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
    <div className="card mesh-card fade-in-up" onClick={() => feedback.click()}>
      <div className="mesh-header">
        <div className="row gap-10 align-center">
          <span className="mesh-logo-badge">
            <Radio size={16} />
          </span>
          <div>
            <div className="mesh-title">Office Kit Bridge · SuperSync Mesh</div>
            <div className="mesh-subtitle">
              {isOffline ? 'Autonomous Local Standby Enclave' : 'Direct P2P Link (Wi-Fi Aware & BLE 5.4)'}
            </div>
          </div>
        </div>
        <span className={`badge ${isOffline ? 'badge-offline' : 'badge-online'}`}>
          <span className="live-dot" />
          {isOffline ? 'STANDBY' : 'P2P DIRECT'}
        </span>
      </div>

      {/* Dual Device Bridge Visualizer */}
      <div className="office-kit-bridge-bar mt-10">
        <div className="bridge-node">
          <Laptop size={13} color={isOffline ? '#64748b' : 'var(--cyan)'} />
          <span className="text-xs font-semibold" style={{ color: isOffline ? '#64748b' : 'var(--text)' }}>
            Workstation
          </span>
        </div>
        <div className="bridge-connector">
          <div className={`bridge-line ${isOffline ? 'offline' : 'active'}`} />
          <span className="bridge-tag">
            {isOffline ? 'POWER DROP' : 'OFFICE KIT P2P'}
          </span>
        </div>
        <div className="bridge-node">
          <Smartphone size={13} color="var(--iqoo-amber)" />
          <span className="text-xs font-semibold" style={{ color: 'var(--iqoo-amber)' }}>
            iQOO Enclave
          </span>
        </div>
      </div>

      {/* Grid of hardware metrics */}
      <div className="mesh-metrics-grid mt-12">
        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Link Latency</span>
            <Activity size={12} color="var(--cyan)" />
          </div>
          <div className="mesh-metric-val" style={{ color: isOffline ? 'var(--text-tertiary)' : 'var(--cyan)' }}>
            {isOffline ? '0.0 ms' : `${telemetry.latencyMs} ms`}
          </div>
          <div className="metric-sub">
            {isOffline ? 'Zero Cloud' : 'PHY <4.2ms Envelope'}
          </div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Direct Bandwidth</span>
            <Zap size={12} color="var(--iqoo-amber)" />
          </div>
          <div className="mesh-metric-val" style={{ color: isOffline ? 'var(--text-tertiary)' : 'var(--iqoo-amber)' }}>
            {isOffline ? 'Standby' : `${telemetry.throughputMbps} Mbps`}
          </div>
          <div className="metric-sub">
            {isOffline ? 'Encrypted Flash' : 'Wi-Fi Aware 802.11be'}
          </div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Enclave Crypto</span>
            <ShieldCheck size={12} color="var(--green)" />
          </div>
          <div className="mesh-metric-val" style={{ fontSize: 13, color: 'var(--green-bright)' }}>
            AES-256-GCM
          </div>
          <div className="metric-sub">Android Keystore</div>
        </div>

        <div className="mesh-metric-tile">
          <div className="row-between text-xs text-tertiary mb-4">
            <span className="metric-label">Core SLM Engine</span>
            <Cpu size={12} color="var(--purple-bright)" />
          </div>
          <div className="mesh-metric-val" style={{ fontSize: 13, color: 'var(--purple-bright)' }}>
            Qwen 2.5-Coder
          </div>
          <div className="metric-sub">1.5B Local NPU / 0ms</div>
        </div>
      </div>

      <div className="mesh-footer-note mt-12">
        <span className="text-xs text-tertiary">
          Office Kit P2P Stream · <b style={{ color: 'var(--text-secondary)' }}>{packetCount.toLocaleString()} pkts/s</b>
        </span>
      </div>

      <style>{`
        .mesh-card {
          background: linear-gradient(180deg, rgba(20, 24, 38, 0.8) 0%, rgba(13, 16, 26, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 15px;
          border-radius: var(--radius);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          cursor: pointer;
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
        .office-kit-bridge-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .bridge-node {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bridge-connector {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
          position: relative;
        }
        .bridge-line {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .bridge-line.active {
          background: linear-gradient(90deg, var(--cyan), var(--iqoo-amber));
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
        }
        .bridge-line.offline {
          background: var(--red);
          opacity: 0.6;
        }
        .bridge-tag {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-top: 3px;
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
          font-size: 14.5px;
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
