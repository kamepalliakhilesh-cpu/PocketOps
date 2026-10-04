import { useState } from 'react';
import { ShieldAlert, RefreshCw, Cpu, Flame, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import type { JudgeDemoStage } from '../types';

export default function JudgeDemoBar() {
  const { state, setJudgeStage } = useStore();
  const [expanded, setExpanded] = useState(false);
  const currentStage = state.judgeStage;

  const stages: { id: JudgeDemoStage; label: string; desc: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    {
      id: 'normal',
      label: '1. P2P Mesh Protocol',
      desc: 'Local P2P telemetry & continuous state synchronization',
      icon: Radio,
    },
    {
      id: 'blackout',
      label: '2. Power Cut / Takeover',
      desc: 'Simulate workstation heartbeat drop & trigger mobile hot-standby',
      icon: ShieldAlert,
    },
    {
      id: 'offline_ops',
      label: '3. Autonomous Phone Ops',
      desc: 'Edit unsaved code in Offline Vault + local schema validation offline',
      icon: Cpu,
    },
    {
      id: 'resync_merge',
      label: '4. Reconnect & Diff Review',
      desc: 'Workstation reconnected — visual Git diff inspection & patch review',
      icon: RefreshCw,
    },
  ];

  return (
    <div className="judge-demo-bar-container">
      <div className="judge-demo-bar-header">
        <div className="judge-stage-pill cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="judge-live-pulse" />
          <span className="judge-brand-tag">iQOO DEMO</span>
          <span className="judge-stage-name">
            {stages.find(s => s.id === currentStage)?.label || 'Demo Mode'}
          </span>
          <span className="judge-chevron-icon">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>

        <div className="row gap-6 align-center">
          <button
            className={`judge-quick-btn ${currentStage === 'blackout' ? 'danger' : ''}`}
            onClick={() => setJudgeStage(currentStage === 'blackout' ? 'normal' : 'blackout')}
            title="Simulate Instant Blackout Takeover"
          >
            <Flame size={12} />
            <span>{currentStage === 'blackout' ? 'Restore PC' : 'Kill Power'}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="judge-demo-dropdown fade-in-up">
          <div className="judge-subtext">
            <span>60-Second Live Judge Walkthrough:</span>
            <span className="text-secondary">Stage {currentStage === 'normal' ? '1/4' : currentStage === 'blackout' ? '2/4' : currentStage === 'offline_ops' ? '3/4' : '4/4'}</span>
          </div>
          <div className="judge-stages-grid">
            {stages.map((st) => {
              const active = currentStage === st.id;
              const Icon = st.icon;
              return (
                <button
                  key={st.id}
                  className={`judge-stage-card ${active ? 'active' : ''}`}
                  onClick={() => setJudgeStage(st.id)}
                >
                  <div className="row-between mb-4">
                    <div className="row gap-6 align-center">
                      <span className={`judge-card-icon-wrap ${active ? 'active' : ''}`}>
                        <Icon size={12} />
                      </span>
                      <span className="judge-stage-card-title">{st.label}</span>
                    </div>
                    {active && <span className="judge-active-chip">ACTIVE</span>}
                  </div>
                  <div className="judge-stage-card-desc">{st.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .judge-demo-bar-container {
          background: rgba(8, 10, 16, 0.88);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          position: sticky;
          top: 0;
          z-index: 120;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .judge-demo-bar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 14px;
          min-height: 40px;
        }
        .judge-stage-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 3px 10px 3px 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.15s ease;
          max-width: calc(100% - 100px);
        }
        .judge-stage-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.14);
        }
        .judge-live-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--iqoo-amber, #ff5500);
          box-shadow: 0 0 8px var(--iqoo-amber);
          animation: pulse 1.8s infinite;
          flex-shrink: 0;
        }
        .judge-brand-tag {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          background: linear-gradient(135deg, var(--iqoo-amber), #ff8800);
          color: #000;
          padding: 2px 5.5px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .judge-stage-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          letter-spacing: -0.01em;
        }
        .judge-chevron-icon {
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          margin-left: 2px;
        }
        .judge-quick-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 85, 0, 0.12);
          border: 1px solid rgba(255, 85, 0, 0.35);
          color: #ff914d;
          font-size: 10.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 8px rgba(255, 85, 0, 0.15);
        }
        .judge-quick-btn:hover {
          background: rgba(255, 85, 0, 0.2);
          transform: translateY(-1px);
        }
        .judge-quick-btn.danger {
          background: rgba(244, 63, 94, 0.15);
          border-color: rgba(244, 63, 94, 0.4);
          color: #fda4af;
          box-shadow: 0 2px 10px rgba(244, 63, 94, 0.2);
        }
        .judge-quick-btn.danger:hover {
          background: rgba(244, 63, 94, 0.25);
        }
        .judge-demo-dropdown {
          padding: 10px 14px 14px;
          background: rgba(8, 10, 16, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .judge-subtext {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          margin-bottom: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .judge-stages-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }
        .judge-stage-card {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 9px 10px;
          text-align: left;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .judge-stage-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.14);
        }
        .judge-stage-card.active {
          background: rgba(255, 85, 0, 0.08);
          border-color: var(--iqoo-amber, #ff5500);
          box-shadow: 0 0 12px rgba(255, 85, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .judge-card-icon-wrap {
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
        }
        .judge-card-icon-wrap.active {
          color: var(--iqoo-amber);
        }
        .judge-stage-card-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .judge-stage-card-desc {
          font-size: 9.5px;
          color: var(--text-secondary);
          line-height: 1.3;
          margin-top: 2px;
        }
        .judge-active-chip {
          font-size: 7.5px;
          font-weight: 800;
          background: var(--iqoo-amber, #ff5500);
          color: #000;
          padding: 1.5px 4.5px;
          border-radius: 3px;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}
