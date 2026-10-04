import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Activity as ActivityIcon, ListTodo, Sparkles, GitBranch, FileText, Monitor, Camera, Search, Clipboard, Power } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { formatTime, relativeTime } from '../../shared/utils';

const TYPE_META: Record<string, { icon: any; color: string }> = {
  task_created: { icon: ListTodo, color: 'var(--cyan)' },
  task_completed: { icon: ListTodo, color: 'var(--green)' },
  task_updated: { icon: ListTodo, color: 'var(--cyan)' },
  ai_breakdown: { icon: Sparkles, color: 'var(--purple-bright)' },
  workflow_created: { icon: GitBranch, color: 'var(--purple-bright)' },
  workflow_started: { icon: GitBranch, color: 'var(--cyan)' },
  workflow_paused: { icon: GitBranch, color: 'var(--orange)' },
  workflow_resumed: { icon: GitBranch, color: 'var(--cyan)' },
  step_completed: { icon: GitBranch, color: 'var(--green)' },
  file_synced: { icon: FileText, color: 'var(--pink)' },
  device_checked: { icon: Monitor, color: 'var(--cyan)' },
  device_offline: { icon: Monitor, color: 'var(--red)' },
  device_online: { icon: Monitor, color: 'var(--green)' },
  wake_sent: { icon: Power, color: 'var(--orange)' },
  clipboard_synced: { icon: Clipboard, color: 'var(--purple-bright)' },
  camera_captured: { icon: Camera, color: 'var(--pink)' },
  search_performed: { icon: Search, color: 'var(--cyan)' },
  context_saved: { icon: Sparkles, color: 'var(--purple-bright)' },
};

export default function ActivityScreen() {
  const nav = useNavigate();
  const { state, clearActivity } = useStore();

  return (
    <div className="page">
      <div className="row gap-12 mb-16">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 22 }}>Activity</h1>
          <p className="page-subtitle">{state.activity.length} events</p>
        </div>
        <button
          className="icon-btn"
          style={{ color: 'var(--red)' }}
          onClick={clearActivity}
          aria-label="Clear activity"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {state.activity.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ActivityIcon size={24} /></div>
          <h3>No activity yet</h3>
          <p>Events from tasks, workflows, files, and devices will appear here.</p>
        </div>
      ) : (
        <div className="timeline">
          {state.activity.map((ev, i) => {
            const meta = TYPE_META[ev.type] || { icon: ActivityIcon, color: 'var(--text-tertiary)' };
            const Icon = meta.icon;
            return (
              <div key={ev.id} className="timeline-item fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="timeline-dot" style={{ background: meta.color }}>
                  <Icon size={12} color="#fff" />
                </div>
                {i < state.activity.length - 1 && <div className="timeline-line" />}
                <div className="timeline-content">
                  <div className="row-between">
                    <span className="text-sm font-semibold">{ev.title}</span>
                    <span className="text-xs text-tertiary">{formatTime(ev.timestamp)}</span>
                  </div>
                  {ev.detail && <div className="text-xs text-secondary mt-4">{ev.detail}</div>}
                  <div className="text-xs text-tertiary mt-4">{relativeTime(ev.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .timeline { position: relative; }
        .timeline-item { position: relative; display: flex; gap: 14px; padding-bottom: 24px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-dot {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          z-index: 1;
          box-shadow: 0 0 0 3px var(--bg);
        }
        .timeline-line {
          position: absolute;
          left: 14px;
          top: 32px;
          bottom: 4px;
          width: 2px;
          background: rgba(255,255,255,0.06);
        }
        .timeline-content { flex: 1; min-width: 0; padding-top: 4px; }
      `}</style>
    </div>
  );
}
