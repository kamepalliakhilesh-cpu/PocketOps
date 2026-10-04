import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle2, CircleDot, Circle, XCircle, RotateCcw, Camera, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useStore, workflowPercent } from '../../core/store/StoreContext';
import type { WorkflowStep } from '../../shared/types';

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  active: CircleDot,
  pending: Circle,
  paused: Clock,
  failed: XCircle,
  skipped: SkipForward,
};

const STATUS_COLOR: Record<string, string> = {
  completed: 'var(--green)',
  active: 'var(--cyan)',
  pending: 'var(--text-tertiary)',
  paused: 'var(--orange)',
  failed: 'var(--red)',
  skipped: 'var(--text-tertiary)',
};

export default function WorkflowRunScreen() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { state, updateWorkflow, completeStep, skipStep, toast, logActivity } = useStore();

  const wf = state.workflows.find(w => w.id === id);

  if (!wf) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon"><AlertTriangle size={24} /></div>
          <h3>Workflow not found</h3>
          <p>This workflow may have been deleted.</p>
          <button className="btn btn-primary mt-16" onClick={() => nav('/workflows')}>Back to workflows</button>
        </div>
      </div>
    );
  }

  const pct = workflowPercent(wf.steps);
  const currentIdx = wf.steps.findIndex((s: WorkflowStep) => s.status === 'active');
  const currentStep = currentIdx >= 0 ? wf.steps[currentIdx] : null;
  const isRunning = wf.status === 'running';
  const isDone = wf.status === 'completed';
  const isPaused = wf.status === 'paused';
  const completedCount = wf.steps.filter((s: WorkflowStep) => s.status === 'completed').length;
  const skippedCount = wf.steps.filter((s: WorkflowStep) => s.status === 'skipped').length;

  const handleToggleRun = () => {
    if (isRunning) {
      updateWorkflow(wf.id, { status: 'paused' });
      logActivity('workflow_paused', 'Workflow paused', wf.name);
      toast('Workflow paused', 'info');
    } else {
      const first = wf.steps.find((s: WorkflowStep) => s.status === 'pending');
      updateWorkflow(wf.id, {
        status: 'running',
        steps: wf.status === 'not_started' && first
          ? wf.steps.map((s: WorkflowStep) => s.id === first.id ? { ...s, status: 'active' as const } : s)
          : wf.steps,
      });
      logActivity(wf.status === 'not_started' ? 'workflow_started' : 'workflow_resumed', wf.status === 'not_started' ? 'Workflow started' : 'Workflow resumed', wf.name);
      toast(wf.status === 'not_started' ? 'Workflow started' : 'Workflow running', 'success');
    }
  };

  const handleComplete = (stepId: string) => {
    const step = wf.steps.find((s: WorkflowStep) => s.id === stepId);
    if (step?.requiresCamera) {
      nav(`/camera/${wf.id}/${stepId}`);
      return;
    }
    if (step?.requiresConfirmation) {
      toast('Confirm this step before continuing', 'info');
      return;
    }
    completeStep(wf.id, stepId);
  };

  const handleRetry = (stepId: string) => {
    updateWorkflow(wf.id, {
      steps: wf.steps.map((s: WorkflowStep) => s.id === stepId ? { ...s, status: 'active' as const } : s),
    });
    toast('Retrying step…', 'info');
  };

  return (
    <div className="page" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="row gap-12 mb-20">
        <button className="icon-btn" onClick={() => nav('/workflows')} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 22 }}>{wf.name}</h1>
          <p className="page-subtitle">
            {completedCount} / {wf.steps.length} completed{skippedCount > 0 ? ` · ${skippedCount} skipped` : ''} · {pct}%
          </p>
        </div>
        <span className={`badge ${isRunning ? 'badge-online' : isDone ? 'badge-info' : isPaused ? 'badge-medium' : 'badge-ai'}`}>
          {isRunning ? 'Running' : isDone ? 'Complete' : isPaused ? 'Paused' : 'Not started'}
        </span>
      </div>

      {/* Progress */}
      <div className="card mb-16">
        <div className="progress-track" style={{ height: 8 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="row-between mt-8 text-xs text-tertiary">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* Current step highlight */}
      {currentStep && (
        <div className="card mb-16" style={{ borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.05)' }}>
          <div className="text-xs text-secondary mb-8" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Current step</div>
          <div className="font-bold" style={{ fontSize: 16 }}>{currentStep.title}</div>
          <div className="row gap-8 mt-12">
            <button className="btn btn-primary btn-sm" onClick={() => handleComplete(currentStep.id)}>
              <CheckCircle2 size={14} /> Complete
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => skipStep(wf.id, currentStep.id)}>
              <SkipForward size={14} /> Skip
            </button>
            {currentStep.requiresCamera && (
              <button className="btn btn-secondary btn-sm" onClick={() => nav(`/camera/${wf.id}/${currentStep.id}`)}>
                <Camera size={14} /> Camera
              </button>
            )}
          </div>
        </div>
      )}

      {/* Run controls */}
      <div className="row gap-8 mb-20">
        <button className="btn btn-primary flex-1" onClick={handleToggleRun} disabled={isDone}>
          {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {wf.status === 'not_started' ? 'Start' : 'Resume'}</>}
        </button>
        {currentStep && (
          <>
            <button className="btn btn-secondary" onClick={() => handleComplete(currentStep.id)}>
              <CheckCircle2 size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => skipStep(wf.id, currentStep.id)}>
              <SkipForward size={16} />
            </button>
          </>
        )}
      </div>

      {/* Step list */}
      <div className="section-label">Steps</div>
      <div className="col gap-8 mb-24">
        {wf.steps.map((step: WorkflowStep, i: number) => {
          const Icon = STATUS_ICON[step.status] || Circle;
          const color = STATUS_COLOR[step.status] || 'var(--text-tertiary)';
          const isActive = step.status === 'active';
          return (
            <div
              key={step.id}
              className={`card ${isActive ? '' : ''}`}
              style={{
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                borderColor: isActive ? 'rgba(34,211,238,0.3)' : undefined,
                animation: `fadeInUp 0.3s ease ${i * 0.06}s both`,
              }}
            >
              <span className="text-xs text-tertiary" style={{ width: 18, flexShrink: 0 }}>{i + 1}</span>
              <Icon size={20} color={color} style={{ flexShrink: 0, transition: 'all 0.3s' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm font-semibold" style={{ textDecoration: step.status === 'completed' || step.status === 'skipped' ? 'line-through' : 'none', color: step.status === 'completed' || step.status === 'skipped' ? 'var(--text-tertiary)' : 'var(--text)' }}>
                  {step.title}
                </div>
                <div className="text-xs" style={{ color, textTransform: 'capitalize', fontWeight: 600 }}>
                  {step.status.replace('_', ' ')}
                  {step.requiresCamera && ' · Camera required'}
                </div>
              </div>
              <div className="row gap-4">
                {step.status === 'failed' && (
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => handleRetry(step.id)} aria-label="Retry">
                    <RotateCcw size={14} />
                  </button>
                )}
                {(step.status === 'pending' || step.status === 'active') && (
                  <button className="btn btn-sm btn-secondary" onClick={() => handleComplete(step.id)}>
                    {step.requiresCamera ? <Camera size={13} /> : <CheckCircle2 size={13} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety note */}
      <div className="card" style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.15)' }}>
        <div className="row gap-10">
          <Shield size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div className="text-xs text-secondary" style={{ lineHeight: 1.6 }}>
            AI suggests actions. PocketOps executes only validated workflow steps — never raw LLM output.
          </div>
        </div>
      </div>
    </div>
  );
}
