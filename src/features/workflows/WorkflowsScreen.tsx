import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, ChevronRight, GitBranch, CircleDot, CheckCircle2 } from 'lucide-react';
import { useStore, workflowPercent } from '../../core/store/StoreContext';
import type { WorkflowStep } from '../../shared/types';

export default function WorkflowsScreen() {
  const nav = useNavigate();
  const { state, updateWorkflow, toast, logActivity } = useStore();

  return (
    <div className="page">
      <div className="row-between mb-16">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="page-subtitle">Complex tasks compiled into executable plans</p>
        </div>
        <button
          className="icon-btn"
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--cyan))', color: '#fff' }}
          onClick={() => nav('/tasks?add=1&ai=1')}
          aria-label="New workflow"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="col gap-12">
        {state.workflows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><GitBranch size={24} /></div>
            <h3>No workflows yet</h3>
            <p>Turn a complex task into your first workflow.</p>
          </div>
        ) : state.workflows.map((wf, i) => {
          const pct = workflowPercent(wf.steps);
          const isActive = wf.status === 'running';
          const isPaused = wf.status === 'paused';
          const isDone = wf.status === 'completed';
          return (
            <div
              key={wf.id}
              className="card fade-in-up"
              style={{ animationDelay: `${i * 0.07}s`, cursor: 'pointer' }}
              onClick={() => nav(`/workflow-run/${wf.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && nav(`/workflow-run/${wf.id}`)}
            >
              <div className="row-between mb-8">
                <div className="section-heading">{wf.name}</div>
                <span className={`badge ${isActive ? 'badge-online' : isDone ? 'badge-info' : isPaused ? 'badge-medium' : 'badge-ai'}`}>
                  {isActive ? 'Running' : isDone ? 'Complete' : isPaused ? 'Paused' : 'Not started'}
                </span>
              </div>
              <div className="row-between text-xs text-tertiary mb-8">
                <span>{wf.steps.length} steps</span>
                <span>{pct === 0 ? 'Not started' : `${pct}% complete`}</span>
              </div>
              <div className="progress-track mb-12">
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="col gap-6 mb-12">
                {wf.steps.slice(0, 4).map((s: WorkflowStep) => (
                  <div key={s.id} className="row gap-8 text-xs" style={{ color: s.status === 'completed' ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}>
                    {s.status === 'completed' ? <CheckCircle2 size={13} color="var(--green)" /> :
                     s.status === 'active' ? <CircleDot size={13} color="var(--cyan)" /> :
                     <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--text-tertiary)', flexShrink: 0 }} />}
                    <span style={{ textDecoration: s.status === 'completed' ? 'line-through' : 'none' }}>{s.title}</span>
                  </div>
                ))}
                {wf.steps.length > 4 && (
                  <div className="text-xs text-tertiary">+{wf.steps.length - 4} more steps</div>
                )}
              </div>
              <div className="row-between">
                <div className="row gap-8">
                  {!isDone && (
                    <button
                      className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={e => {
                        e.stopPropagation();
                        if (isActive) {
                          updateWorkflow(wf.id, { status: 'paused' });
                          logActivity('workflow_paused', 'Workflow paused', wf.name);
                          toast('Workflow paused', 'info');
                        } else {
                          const firstPending = wf.steps.find(s => s.status === 'pending');
                          updateWorkflow(wf.id, {
                            status: 'running',
                            steps: wf.status === 'not_started' && firstPending
                              ? wf.steps.map(s => s.id === firstPending.id ? { ...s, status: 'active' as const } : s)
                              : wf.steps,
                          });
                          logActivity(wf.status === 'not_started' ? 'workflow_started' : 'workflow_resumed', wf.status === 'not_started' ? 'Workflow started' : 'Workflow resumed', wf.name);
                          toast(wf.status === 'not_started' ? 'Workflow started' : 'Workflow resumed', 'success');
                        }
                      }}
                    >
                      {isActive ? <><Pause size={13} /> Pause</> : <><Play size={13} /> {wf.status === 'not_started' ? 'Start' : 'Resume'}</>}
                    </button>
                  )}
                </div>
                <ChevronRight size={18} color="var(--text-tertiary)" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-24" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}>
        <div className="row gap-12">
          <span style={{ color: 'var(--purple-bright)', flexShrink: 0 }}><GitBranch size={18} /></span>
          <div>
            <div className="text-sm font-semibold">Safe execution</div>
            <div className="text-xs text-secondary mt-4">AI suggests actions. PocketOps executes only validated workflow steps — never raw LLM output.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
