import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeftRight, Camera,
  Play, CheckCircle2, ChevronRight, Activity, Zap,
  ShieldAlert, Code2, ArrowUpRight,
} from 'lucide-react';
import { useStore, workflowPercent } from '../../core/store/StoreContext';
import { greeting, dueLabel } from '../../shared/utils';
import type { Task, WorkflowStep } from '../../shared/types';
import SuperSyncMeshCard from '../devices/SuperSyncMeshCard';

export default function HomeScreen() {
  const nav = useNavigate();
  const { state, toggleTask, updateWorkflow, toast, logActivity, setBlackoutModalOpen } = useStore();

  const attention = state.tasks.filter(t => !t.completed && (dueLabel(t.dueDate) === 'Today' || dueLabel(t.dueDate) === 'Tomorrow'));
  const activeWf = state.workflows.find(w => w.status === 'running') || state.workflows.find(w => w.status === 'paused');
  const dev = state.device;
  const isOffline = dev.status === 'offline';
  const snapshot = state.sessionSnapshot;

  const quickActions = [
    { label: 'Hot-Standby', sub: 'Takeover IDE', icon: Code2, action: () => setBlackoutModalOpen(true), highlight: true },
    { label: 'AI Operations', sub: 'Task breakdown', icon: Sparkles, action: () => nav('/tasks?add=1&ai=1') },
    { label: 'Offline Vault', sub: 'Cached files', icon: ArrowLeftRight, action: () => nav('/files') },
    { label: 'Camera OCR', sub: 'Step verification', icon: Camera, action: () => nav('/camera/w2/ws8') },
  ];

  return (
    <div className="page" style={{ paddingBottom: 16 }}>
      {/* Executive Hero Header */}
      <div className="home-hero-header fade-in-up">
        <div className="row-between">
          <div>
            <div className="hero-eyebrow">
              <span className="live-pulse-dot" />
              EDGE NODE ACTIVE
            </div>
            <h1 className="page-title">{greeting()}, Akhilesh</h1>
            <p className="page-subtitle">Cross-device hot-standby continuity is armed.</p>
          </div>
          <button className="hero-status-pill" onClick={() => nav('/devices')}>
            <span className={`status-orb ${isOffline ? 'offline' : 'online'}`} />
            <span>{isOffline ? 'Standby' : 'Synced'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Hot-Standby Banner (Visible when offline or during blackout) */}
      {isOffline && (
        <div className="card emergency-takeover-banner mt-16 fade-in-up">
          <div className="row-between mb-8">
            <div className="row gap-10 align-center">
              <span className="emergency-badge-pulse">
                <ShieldAlert size={18} color="var(--red)" />
              </span>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--red)', letterSpacing: '0.04em' }}>
                  LAPTOP OFFLINE · HOT-STANDBY READY
                </div>
                <div className="text-xs text-secondary mt-2">
                  Active file: <b style={{ color: 'var(--iqoo-amber)' }}>{snapshot.activeFile}</b> (Line {snapshot.line})
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm w-full mt-6"
            style={{
              background: 'linear-gradient(135deg, var(--red) 0%, var(--iqoo-amber) 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
            }}
            onClick={() => setBlackoutModalOpen(true)}
          >
            <Code2 size={14} /> Resume Live IDE & Terminal on Phone
          </button>
        </div>
      )}

      {/* iQOO SuperSync Mesh Hardware Telemetry */}
      <section className="mt-16 fade-in-up stagger-1">
        <SuperSyncMeshCard />
      </section>

      {/* Quick Action Matrix */}
      <section className="mt-20 fade-in-up stagger-2">
        <div className="section-label">Quick Operations</div>
        <div className="grid-2">
          {quickActions.map(({ label, sub, icon: Icon, action, highlight }) => (
            <button
              key={label}
              className={`card quick-tile ${highlight ? 'highlight' : ''}`}
              onClick={action}
            >
              <div className="row-between w-full mb-6">
                <span className={`quick-tile-icon ${highlight ? 'highlight' : ''}`}>
                  <Icon size={16} />
                </span>
                <ArrowUpRight size={13} className="quick-arrow" />
              </div>
              <div className="quick-tile-label">{label}</div>
              <div className="quick-tile-sub">{sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Today's Operations */}
      <section className="mt-20 fade-in-up stagger-3">
        <div className="row-between mb-10">
          <div>
            <div className="section-label">Active Operations</div>
            <div className="text-xs text-secondary">
              {attention.length} item{attention.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/tasks')}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="col gap-10">
          {attention.slice(0, 3).map(t => (
            <HomeTaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} onOpen={() => nav('/tasks')} />
          ))}
          {attention.length === 0 && (
            <div className="card text-center text-secondary text-sm" style={{ padding: 20 }}>
              All clear — zero pending operations.
            </div>
          )}
        </div>
      </section>

      {/* Active workflow */}
      {activeWf && (
        <section className="mt-20 fade-in-up stagger-4">
          <div className="section-label">Running Workflow</div>
          <div className="card card-glass">
            <div className="row-between mb-8">
              <div className="section-heading">{activeWf.name}</div>
              <span className="badge badge-ai">{workflowPercent(activeWf.steps)}%</span>
            </div>
            <div className="text-xs text-secondary mb-10">
              {activeWf.steps.filter(s => s.status === 'completed').length} of {activeWf.steps.length} steps completed
            </div>
            <div className="progress-track mb-14">
              <div className="progress-bar" style={{ width: `${workflowPercent(activeWf.steps)}%` }} />
            </div>
            <div className="col gap-8 mb-14">
              {activeWf.steps.map((s: WorkflowStep) => (
                <div
                  key={s.id}
                  className={`row gap-8 text-xs ${s.status === 'completed' ? 'text-tertiary' : ''}`}
                  style={{ textDecoration: s.status === 'completed' ? 'line-through' : 'none' }}
                >
                  {s.status === 'completed' ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--green-bright)', flexShrink: 0 }} />
                  ) : s.status === 'active' ? (
                    <Zap size={14} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--text-tertiary)', flexShrink: 0 }} />
                  )}
                  <span className="truncate">{s.title}</span>
                </div>
              ))}
            </div>
            <div className="row gap-8">
              {activeWf.status === 'paused' && (
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => {
                    updateWorkflow(activeWf.id, { status: 'running' });
                    logActivity('workflow_resumed', 'Workflow resumed', activeWf.name);
                    toast('Workflow resumed', 'success');
                  }}
                >
                  <Play size={13} /> Resume
                </button>
              )}
              {activeWf.status === 'running' && (
                <button
                  className="btn btn-secondary btn-sm flex-1"
                  onClick={() => {
                    updateWorkflow(activeWf.id, { status: 'paused' });
                    logActivity('workflow_paused', 'Workflow paused', activeWf.name);
                    toast('Workflow paused', 'info');
                  }}
                >
                  Pause
                </button>
              )}
              <button className="btn btn-ghost btn-sm flex-1" onClick={() => nav(`/workflow-run/${activeWf.id}`)}>
                Open View
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recent activity teaser */}
      <section className="mt-20 mb-20 fade-in-up stagger-5">
        <div className="row-between mb-10">
          <div className="section-label">Audit Log</div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/activity')}>
            <Activity size={12} /> All
          </button>
        </div>
        <div className="col gap-6">
          {state.activity.slice(0, 3).map(ev => (
            <div key={ev.id} className="row gap-10 text-xs card" style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-tertiary" style={{ width: 42, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span className="text-secondary truncate flex-1">{ev.title}</span>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .home-hero-header {
          margin-bottom: 4px;
        }
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--iqoo-amber);
          margin-bottom: 4px;
        }
        .live-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--iqoo-amber);
          box-shadow: 0 0 6px var(--iqoo-amber);
          animation: pulse 1.8s infinite;
        }
        .hero-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .hero-status-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }
        .status-orb {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .status-orb.online {
          background: var(--green);
          box-shadow: 0 0 6px var(--green);
        }
        .status-orb.offline {
          background: var(--red);
          box-shadow: 0 0 6px var(--red);
        }
        .emergency-takeover-banner {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(255, 85, 0, 0.12) 100%);
          border: 1px solid rgba(244, 63, 94, 0.4);
          box-shadow: 0 0 24px rgba(244, 63, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          padding: 15px;
        }
        .emergency-badge-pulse {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(244, 63, 94, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1.5s infinite;
        }
        .quick-tile {
          text-align: left;
          padding: 13px 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
        }
        .quick-tile.highlight {
          border-color: rgba(255, 85, 0, 0.35);
          background: rgba(255, 85, 0, 0.06);
        }
        .quick-tile:hover .quick-arrow {
          transform: translate(2px, -2px);
          color: var(--text);
        }
        .quick-tile-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--purple-bright);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quick-tile-icon.highlight {
          background: rgba(255, 85, 0, 0.2);
          color: var(--iqoo-amber);
        }
        .quick-arrow {
          color: var(--text-tertiary);
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .quick-tile-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .quick-tile-sub {
          font-size: 10.5px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

function HomeTaskCard({ task, onToggle, onOpen }: { task: Task; onToggle: () => void; onOpen: () => void }) {
  const badgeClass = task.priority === 'HIGH' ? 'badge-high' : task.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
      <button
        aria-label={task.completed ? 'Reopen task' : 'Complete task'}
        onClick={onToggle}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
          border: task.completed ? 'none' : '1.5px solid var(--text-tertiary)',
          background: task.completed ? 'linear-gradient(135deg, var(--iqoo-amber), var(--cyan))' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {task.completed && <CheckCircle2 size={13} color="#fff" />}
      </button>
      <button style={{ flex: 1, textAlign: 'left', cursor: 'pointer' }} onClick={onOpen}>
        <div className="font-semibold text-xs" style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-tertiary)' : 'var(--text)' }}>
          {task.title}
        </div>
        <div className="row gap-6 mt-4">
          <span className={`badge ${badgeClass}`}>{task.priority}</span>
          <span className="text-xs text-tertiary">{dueLabel(task.dueDate)}</span>
          {task.workflowId && <span className="badge badge-ai">Workflow</span>}
        </div>
        {task.progress > 0 && task.progress < 100 && (
          <div className="progress-track mt-6" style={{ height: 3.5 }}>
            <div className="progress-bar" style={{ width: `${task.progress}%` }} />
          </div>
        )}
      </button>
    </div>
  );
}
