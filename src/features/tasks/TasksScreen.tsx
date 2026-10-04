import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle2, Trash2, Sparkles, ChevronRight, X, Pencil, Calendar, Flag, GitBranch } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { dueLabel, todayISO, uid } from '../../shared/utils';
import { aiProvider } from '../../core/ai/LLMProvider';
import type { Priority, TaskBreakdownResult, Task, SubTask } from '../../shared/types';

type Tab = 'all' | 'today' | 'upcoming' | 'completed';

export default function TasksScreen() {
  const { state, addTask, toggleTask, deleteTask, updateTask, addWorkflow, toast, logActivity } = useStore();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (params.get('add')) { setShowAdd(true); setParams({}); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const filtered = useMemo(() => {
    let list = state.tasks;
    if (tab === 'today') list = list.filter(t => !t.completed && dueLabel(t.dueDate) === 'Today');
    else if (tab === 'upcoming') list = list.filter(t => !t.completed && dueLabel(t.dueDate) !== 'Today' && dueLabel(t.dueDate) !== 'No deadline');
    else if (tab === 'completed') list = list.filter(t => t.completed);
    if (query) list = list.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [state.tasks, tab, query]);

  const editTask = editing ? state.tasks.find(t => t.id === editing) : null;

  return (
    <div className="page">
      <div className="row-between mb-16">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{state.tasks.filter(t => !t.completed).length} open · {state.tasks.filter(t => t.completed).length} done</p>
        </div>
        <div className="row gap-8">
          <button className="icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search tasks">
            <Search size={18} />
          </button>
          <button className="icon-btn" style={{ background: 'linear-gradient(135deg, var(--purple), var(--cyan))', color: '#fff' }} onClick={() => { setEditing(null); setShowAdd(true); }} aria-label="Add task">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {showSearch && (
        <input
          autoFocus className="input mb-16" placeholder="Search tasks…" value={query}
          onChange={e => setQuery(e.target.value)} onBlur={() => !query && setShowSearch(false)}
        />
      )}

      <div className="row gap-8 mb-16" style={{ overflowX: 'auto' }}>
        {(['all', 'today', 'upcoming', 'completed'] as Tab[]).map(t => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="col gap-12">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><CheckCircle2 size={24} /></div>
            <h3>{tab === 'completed' ? 'No completed tasks' : 'No unfinished operations'}</h3>
            <p>{tab === 'completed' ? 'Completed tasks will appear here.' : 'Tap + to create your first task.'}</p>
          </div>
        ) : filtered.map((t, i) => (
          <TaskRow
            key={t.id} task={t} index={i}
            onToggle={() => toggleTask(t.id)}
            onEdit={() => { setEditing(t.id); setShowAdd(true); }}
            onDelete={() => deleteTask(t.id)}
            onOpenWorkflow={() => t.workflowId && nav(`/workflow-run/${t.workflowId}`)}
          />
        ))}
      </div>

      {showAdd && (
        <AddTaskSheet
          editTask={editTask}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSave={(data) => {
            if (editTask) {
              updateTask(editTask.id, data);
              logActivity('task_updated', 'Task updated', data.title);
              toast('Task updated', 'success');
            }
            else { addTask({ ...data, subtasks: [], progress: 0, completed: false }); }
            setShowAdd(false); setEditing(null);
          }}
          onBreakdown={async (title: string) => {
            toast('Analyzing task…', 'ai');
            try {
              const result = await aiProvider.decomposeTask(title);
              if (!result.valid || !result.data) { toast('AI unavailable', 'error'); return undefined; }
              return result.data;
            } catch {
              toast('AI unavailable', 'error');
              return undefined;
            }
          }}
          onCreateWorkflow={async (title, steps) => {
            const task = addTask({ title, description: `AI breakdown: ${steps.length} steps`, priority: 'HIGH', dueDate: todayISO(), reminder: '', subtasks: steps.map(s => ({ id: uid(), title: s, completed: false })), progress: 0, completed: false });
            const wf = addWorkflow({
              name: title,
              description: `AI-generated workflow for "${title}"`,
              steps: steps.map(s => ({ id: uid(), title: s, status: 'pending' as const })),
              status: 'not_started',
              sourceTaskId: task.id,
            });
            updateTask(task.id, { workflowId: wf.id });
            logActivity('ai_breakdown', 'AI breakdown generated', `${steps.length} steps for ${title}`);
            setShowAdd(false); setEditing(null);
            nav(`/workflow-run/${wf.id}`);
          }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, index, onToggle, onEdit, onDelete, onOpenWorkflow }: {
  task: Task; index: number; onToggle: () => void; onEdit: () => void;
  onDelete: () => void; onOpenWorkflow: () => void;
}) {
  const badgeClass = task.priority === 'HIGH' ? 'badge-high' : task.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  const doneSubs = task.subtasks.filter((s: SubTask) => s.completed).length;
  return (
    <div className="card fade-in-up" style={{ animationDelay: `${index * 0.05}s`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <button
        aria-label={task.completed ? 'Reopen' : 'Complete'}
        onClick={onToggle}
        className="task-check"
        style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 3,
          border: task.completed ? 'none' : '2px solid var(--text-tertiary)',
          background: task.completed ? 'linear-gradient(135deg, var(--purple), var(--cyan))' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        {task.completed && <CheckCircle2 size={14} color="#fff" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-semibold text-sm" style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-tertiary)' : 'var(--text)' }}>
          {task.title}
        </div>
        {task.description && <div className="text-xs text-tertiary mt-4 truncate">{task.description}</div>}
        <div className="row gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
          <span className={`badge ${badgeClass}`}>{task.priority}</span>
          <span className="text-xs text-tertiary">{dueLabel(task.dueDate)}</span>
          {task.subtasks.length > 0 && <span className="text-xs text-tertiary">{doneSubs}/{task.subtasks.length} subtasks</span>}
          {task.workflowId && (
            <button className="badge badge-ai" style={{ cursor: 'pointer' }} onClick={onOpenWorkflow}>
              Workflow <ChevronRight size={10} />
            </button>
          )}
        </div>
        {task.progress > 0 && task.progress < 100 && (
          <div className="row gap-8 mt-8" style={{ alignItems: 'center' }}>
            <div className="progress-track" style={{ flex: 1, height: 4 }}>
              <div className="progress-bar" style={{ width: `${task.progress}%` }} />
            </div>
            <span className="text-xs text-tertiary">{task.progress}%</span>
          </div>
        )}
      </div>
      <div className="col gap-4">
        <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onEdit} aria-label="Edit">
          <Pencil size={14} />
        </button>
        <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--red)' }} onClick={onDelete} aria-label="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Add / Edit Task Sheet ---------- */
interface SheetProps {
  editTask?: Task | null;
  onClose: () => void;
  onSave: (data: { title: string; description: string; priority: Priority; dueDate: string; reminder: string }) => void;
  onBreakdown: (title: string) => Promise<TaskBreakdownResult | undefined>;
  onCreateWorkflow: (title: string, steps: string[]) => Promise<void>;
}

function AddTaskSheet({ editTask, onClose, onSave, onBreakdown, onCreateWorkflow }: SheetProps) {
  const [title, setTitle] = useState(editTask?.title || '');
  const [desc, setDesc] = useState(editTask?.description || '');
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || todayISO());
  const [reminder, setReminder] = useState(editTask?.reminder || '');
  const [phase, setPhase] = useState<'form' | 'analyzing' | 'result'>('form');
  const [breakdown, setBreakdown] = useState<TaskBreakdownResult | null>(null);
  const [editingSteps, setEditingSteps] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  /* Escape closes the sheet */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleBreakdown = async () => {
    if (!title.trim()) { return; }
    setPhase('analyzing');
    try {
      const result = await onBreakdown(title);
      if (result) { setBreakdown(result); setSteps(result.steps); setPhase('result'); }
      else setPhase('form');
    } catch {
      setPhase('form');
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editTask ? 'Edit task' : 'Add task'}>
        <div className="sheet-handle" />
        <div className="row-between mb-16">
          <h2 className="section-heading">{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {phase === 'form' && (
          <div className="col gap-16">
            <div>
              <label className="input-label" htmlFor="task-title">Task title</label>
              <input id="task-title" className="input" placeholder="e.g. Finish project report" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="input-label" htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="input" rows={3} placeholder="Optional details…" value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'none' }} />
            </div>
            <div>
              <label className="input-label"><Flag size={13} /> Priority</label>
              <div className="row gap-8">
                {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => (
                  <button key={p} className={`btn btn-sm ${priority === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPriority(p)} style={{ flex: 1 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <label className="input-label" htmlFor="task-due"><Calendar size={13} /> Due date</label>
                <input id="task-due" type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="input-label" htmlFor="task-rem">Reminder</label>
                <input id="task-rem" type="time" className="input" value={reminder} onChange={e => setReminder(e.target.value)} />
              </div>
            </div>
            <div className="col gap-8">
              <button className="btn btn-primary btn-lg btn-block" onClick={() => onSave({ title: title.trim() || 'Untitled task', description: desc, priority, dueDate, reminder })}>
                {editTask ? 'Save Changes' : 'Create Task'}
              </button>
              {!editTask && (
                <button className="btn btn-secondary btn-lg btn-block" onClick={handleBreakdown} disabled={!title.trim()}>
                  <Sparkles size={16} /> Break down with AI
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="col items-center text-center" style={{ alignItems: 'center', padding: '40px 20px', gap: 20 }}>
            <AIOrb />
            <div className="font-semibold">Analyzing task…</div>
            <div className="text-sm text-secondary">{title}</div>
          </div>
        )}

        {phase === 'result' && breakdown && (
          <div className="col gap-16">
            <div className="row-between">
              <div className="section-heading">AI Suggested Plan</div>
              <span className="badge badge-ai">{steps.length} steps</span>
            </div>
            <div className="text-sm text-secondary">{breakdown.summary}</div>
            <div className="col gap-8">
              {editingSteps ? steps.map((s, i) => (
                <div key={i} className="row gap-8">
                  <span className="text-xs text-tertiary" style={{ width: 20 }}>{i + 1}</span>
                  <input className="input" style={{ padding: '8px 12px', fontSize: 14 }} value={s} onChange={e => { const ns = [...steps]; ns[i] = e.target.value; setSteps(ns); }} />
                </div>
              )) : steps.map((s, i) => (
                <div key={i} className="row gap-8 text-sm card" style={{ padding: '10px 14px', animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}>
                  <span style={{ width: 22, height: 22, borderRadius: 8, background: 'rgba(124,58,237,0.15)', color: 'var(--purple-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
            <div className="col gap-8">
              <button className="btn btn-primary btn-lg btn-block" onClick={() => onCreateWorkflow(title, steps)}>
                <GitBranch size={16} /> Create Workflow
              </button>
              <button className="btn btn-secondary btn-lg btn-block" onClick={() => setEditingSteps(!editingSteps)}>
                {editingSteps ? 'Done Editing' : 'Edit Steps'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPhase('form')}>Back to form</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .sheet-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: flex-end; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @media (min-width: 500px) {
          .sheet-backdrop { align-items: center; }
        }
        .sheet {
          width: 100%; max-width: 460px;
          max-height: 88vh; overflow-y: auto;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong);
          border-radius: 24px 24px 0 0;
          padding: 12px 20px 32px;
          animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (min-width: 500px) {
          .sheet { border-radius: 24px; }
        }
        .sheet-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 999px;
          margin: 0 auto 16px;
        }
        .ai-orb {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: conic-gradient(var(--purple), var(--cyan), var(--pink), var(--purple));
          animation: spin 2s linear infinite;
          position: relative;
        }
        .ai-orb::after {
          content: '';
          position: absolute; inset: 4px;
          background: var(--bg-elevated);
          border-radius: 50%;
        }
        .ai-orb::before {
          content: '';
          position: absolute; inset: -6px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%);
          animation: breathe 1.5s ease infinite;
        }
      `}</style>
    </div>
  );
}

function AIOrb() {
  return <div className="ai-orb" aria-hidden="true" />;
}
