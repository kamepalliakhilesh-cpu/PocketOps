import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, FileText, ListTodo, GitBranch, Laptop, Activity, X } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { relativeTime, dueLabel, normalizeSearch } from '../../shared/utils';

interface Result {
  id: string;
  type: 'task' | 'file' | 'workflow' | 'device' | 'activity';
  title: string;
  subtitle: string;
  route: string;
}

export default function SearchScreen() {
  const nav = useNavigate();
  const { state } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo<Result[]>(() => {
    const q = normalizeSearch(query);
    if (!q) return [];
    const out: Result[] = [];

    state.tasks.forEach(t => {
      if (normalizeSearch(t.title).includes(q) || normalizeSearch(t.description || '').includes(q)) {
        out.push({ id: t.id, type: 'task', title: t.title, subtitle: `${t.priority} · ${dueLabel(t.dueDate)}`, route: '/tasks' });
      }
    });
    state.files.forEach(f => {
      if (normalizeSearch(f.name).includes(q)) {
        out.push({ id: f.id, type: 'file', title: f.name, subtitle: f.synced ? 'Offline Vault' : f.size, route: '/files' });
      }
    });
    state.workflows.forEach(w => {
      if (normalizeSearch(w.name).includes(q) || normalizeSearch(w.description || '').includes(q)) {
        out.push({ id: w.id, type: 'workflow', title: w.name, subtitle: `${w.steps.length} steps`, route: `/workflow-run/${w.id}` });
      }
    });
    if (normalizeSearch('laptop').includes(q) || normalizeSearch('device').includes(q)) {
      out.push({ id: 'laptop', type: 'device', title: state.device.name, subtitle: state.device.status === 'connected' ? 'Connected' : 'Offline', route: '/devices' });
    }
    state.activity.forEach(a => {
      if (normalizeSearch(a.title).includes(q) || normalizeSearch(a.detail || '').includes(q)) {
        out.push({ id: a.id, type: 'activity', title: a.title, subtitle: a.detail || relativeTime(a.timestamp), route: '/activity' });
      }
    });
    return out;
  }, [query, state]);

  const grouped = useMemo(() => {
    const map: Record<string, Result[]> = {};
    results.forEach(r => { (map[r.type] = map[r.type] || []).push(r); });
    return map;
  }, [results]);

  const TYPE_META: Record<string, { label: string; icon: typeof ListTodo; color: string }> = {
    task: { label: 'Tasks', icon: ListTodo, color: 'var(--cyan)' },
    file: { label: 'Files', icon: FileText, color: 'var(--pink)' },
    workflow: { label: 'Workflows', icon: GitBranch, color: 'var(--purple-bright)' },
    device: { label: 'Devices', icon: Laptop, color: 'var(--green)' },
    activity: { label: 'Activity', icon: Activity, color: 'var(--orange)' },
  };

  const SUGGESTIONS = ['project report', 'hackathon', 'laptop', 'workflow', 'files'];

  return (
    <div className="page">
      <div className="row gap-12 mb-16">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            autoFocus className="input" style={{ paddingLeft: 40, paddingRight: 40 }}
            placeholder="Search everything…"
            value={query} onChange={e => setQuery(e.target.value)}
            aria-label="Universal search"
          />
          {query && (
            <button
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              onClick={() => setQuery('')} aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {!query && (
        <div className="mb-24">
          <div className="section-label">Try searching</div>
          <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn btn-secondary btn-sm" onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="text-xs text-tertiary mt-16" style={{ lineHeight: 1.6 }}>
            Universal search covers tasks, files, workflows, devices, and activity — all in one query.
          </div>
        </div>
      )}

      {/* Results */}
      {query && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Search size={24} /></div>
          <h3>No results</h3>
          <p>Nothing matched "{query}". Try a different term.</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const meta = TYPE_META[type];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <div key={type} className="mb-20">
            <div className="row gap-8 mb-10">
              <span style={{ color: meta.color }}><Icon size={15} /></span>
              <span className="section-label" style={{ marginBottom: 0 }}>{meta.label}</span>
              <span className="text-xs text-tertiary">({items.length})</span>
            </div>
            <div className="col gap-8">
              {items.map((r, i) => (
                <button
                  key={r.id}
                  className="card fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => nav(r.route)}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: `${meta.color}15`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-semibold truncate">{r.title}</div>
                    <div className="text-xs text-tertiary">{r.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
