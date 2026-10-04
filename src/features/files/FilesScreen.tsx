import { useState, useMemo } from 'react';
import {
  Search, Folder, FileText, Image, FileArchive, Presentation,
  Wifi, WifiOff, Download, CloudUpload, Shield, Lock, ArrowLeft,
  FolderOpen, ChevronRight, CheckCircle2, Code2, Edit3,
} from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { relativeTime, normalizeSearch } from '../../shared/utils';
import type { FileItem } from '../../shared/types';

type View = 'browse' | 'vault' | 'remote';

const CATS = [
  { key: 'recent', label: 'Recent' },
  { key: 'documents', label: 'Documents' },
  { key: 'images', label: 'Images' },
  { key: 'projects', label: 'Projects' },
] as const;

function fileIcon(f: FileItem, size = 18) {
  if (f.isCode) return <Code2 size={size} />;
  switch (f.type) {
    case 'document': return <FileText size={size} />;
    case 'image': return <Image size={size} />;
    case 'presentation': return <Presentation size={size} />;
    case 'archive': return <FileArchive size={size} />;
    default: return <FileText size={size} />;
  }
}

function fileTypeColor(f: FileItem) {
  if (f.isCode) return 'var(--iqoo-amber, #ff7a00)';
  switch (f.type) {
    case 'document': return '#60a5fa';
    case 'image': return '#f472b6';
    case 'presentation': return '#fb923c';
    case 'archive': return '#a78bfa';
    default: return '#94a3b8';
  }
}

export default function FilesScreen() {
  const { state, syncFile, openFileEditor, toast, logActivity } = useStore();
  const [view, setView] = useState<View>('browse');
  const [cat, setCat] = useState<string>('recent');
  const [query, setQuery] = useState('');
  const [remotePhase, setRemotePhase] = useState<'idle' | 'connecting' | 'connected' | 'offline'>('idle');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const isOffline = state.device.status === 'offline';
  const vaultFiles = state.files.filter(f => f.synced);

  const filtered = useMemo(() => {
    let list = state.files;
    if (view === 'vault') list = vaultFiles;
    else if (cat !== 'recent') list = list.filter(f => f.category === cat);
    else list = [...list].sort((a, b) => +new Date(b.modified) - +new Date(a.modified));
    const q = normalizeSearch(query);
    if (q) list = list.filter(f => normalizeSearch(f.name).includes(q));
    return list;
  }, [state.files, view, cat, query, vaultFiles]);

  const openRemote = () => {
    setView('remote');
    setRemotePhase('connecting');
    setTimeout(() => {
      if (isOffline) { setRemotePhase('offline'); }
      else { setRemotePhase('connected'); logActivity('device_checked', 'Remote folder opened', 'Laptop/Documents/Project'); }
    }, 1500);
  };

  const handleSync = (f: FileItem) => {
    setSyncingId(f.id);
    setTimeout(() => {
      syncFile(f.id);
      setSyncingId(null);
    }, 1400);
  };

  const handleOpenFile = (f: FileItem) => {
    if (f.content || f.isCode || f.synced) {
      openFileEditor(f);
      toast(`Opened ${f.name} in Offline Vault Editor`, 'info');
    } else if (isOffline) {
      toast('File is not in Offline Vault — laptop is disconnected', 'error');
    } else {
      toast(`Opened ${f.name} from Laptop P2P link`, 'success');
    }
  };

  return (
    <div className="page">
      <div className="row-between mb-16">
        <div>
          <h1 className="page-title">Files & Vault</h1>
          <p className="page-subtitle">Predictive Pre-Fetch Storage</p>
        </div>
        <span className={`badge ${isOffline ? 'badge-offline' : 'badge-online'}`}>
          {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
          {isOffline ? 'Offline Standby' : 'P2P Synced'}
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          className="input" style={{ paddingLeft: 40 }}
          placeholder="Search files or code in vault…" value={query} onChange={e => setQuery(e.target.value)}
          aria-label="Search files"
        />
      </div>

      {/* Tabs */}
      <div className="row gap-8 mb-16" style={{ overflowX: 'auto' }}>
        <button className={`btn btn-sm ${view === 'browse' && cat === 'recent' && !query ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setView('browse'); setCat('recent'); }}>
          Recent
        </button>
        {CATS.slice(1).map(c => (
          <button key={c.key} className={`btn btn-sm ${view === 'browse' && cat === c.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setView('browse'); setCat(c.key); }}>
            {c.label}
          </button>
        ))}
        <button className={`btn btn-sm ${view === 'vault' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: view === 'vault' ? 'none' : '1px solid rgba(255, 122, 0, 0.4)' }} onClick={() => setView('vault')}>
          <Shield size={13} color={view === 'vault' ? '#fff' : 'var(--iqoo-amber)'} /> Offline Vault
        </button>
      </div>

      {/* Offline vault banner */}
      {view === 'vault' && (
        <div className="card mb-16" style={{ background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)', borderColor: 'rgba(255, 122, 0, 0.3)' }}>
          <div className="row gap-10">
            <Lock size={18} color="var(--iqoo-amber)" style={{ flexShrink: 0 }} />
            <div>
              <div className="text-sm font-bold">Predictive Offline Vault (AES-256)</div>
              <div className="text-xs text-secondary mt-4">
                These files are pre-cached in your iQOO phone's secure storage. You can view, edit code, and save changes even without any network.
              </div>
            </div>
          </div>
          <div className="row gap-8 mt-12">
            <button className="btn btn-primary btn-sm" onClick={() => toast('Predictive Pre-Fetch completed: All project files mirrored', 'success')}>
              <CloudUpload size={13} /> Pre-Fetch Active Project
            </button>
          </div>
        </div>
      )}

      {/* Laptop offline notice */}
      {isOffline && view !== 'vault' && (
        <div className="card mb-16" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--red)' }}>Laptop Disconnected</div>
          <div className="text-xs text-secondary mt-4">
            Predictive Vault files and live code buffers remain fully accessible and editable offline.
          </div>
          <button className="btn btn-secondary btn-sm mt-8" onClick={() => setView('vault')}>
            Open Offline Vault ({vaultFiles.length} Files) <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Browse / Vault content */}
      {view !== 'remote' && (
        <>
          {/* Remote access card */}
          <button
            className="card mb-16 w-full"
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}
            onClick={openRemote}
          >
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderOpen size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="text-sm font-semibold">Laptop → Documents → Workspace</div>
              <div className="text-xs text-tertiary">Browse remote P2P file tree</div>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>

          {/* File list */}
          <div className="col gap-10">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {view === 'vault' ? <Shield size={24} /> : <Folder size={24} />}
                </div>
                <h3>{view === 'vault' ? 'No synced files' : 'No files found'}</h3>
                <p>{view === 'vault' ? 'Choose files to make them available offline.' : 'Try a different search or category.'}</p>
              </div>
            ) : filtered.map((f, i) => (
              <FileRow
                key={f.id} file={f} index={i}
                isOffline={isOffline}
                syncing={syncingId === f.id}
                onSync={() => handleSync(f)}
                onOpen={() => handleOpenFile(f)}
              />
            ))}
          </div>
        </>
      )}

      {/* Remote access view */}
      {view === 'remote' && (
        <div className="fade-in-up">
          <button className="btn btn-ghost btn-sm mb-16" onClick={() => { setView('browse'); setRemotePhase('idle'); }}>
            <ArrowLeft size={14} /> Back to files
          </button>

          <div className="card mb-16" style={{ textAlign: 'center', padding: '32px 20px' }}>
            {remotePhase === 'connecting' && (
              <>
                <div className="ai-orb" style={{ width: 48, height: 48, margin: '0 auto 16px' }} />
                <div className="font-semibold">Connecting over Wi-Fi 7 Direct…</div>
                <div className="text-sm text-secondary mt-8">Laptop → Documents → Workspace</div>
              </>
            )}
            {remotePhase === 'connected' && (
              <>
                <CheckCircle2 size={40} color="var(--green)" style={{ margin: '0 auto 12px' }} />
                <div className="font-semibold">Connected (1.1ms direct link)</div>
                <div className="text-sm text-secondary mt-8">Browsing Workspace files</div>
                <div className="col gap-8 mt-16" style={{ textAlign: 'left' }}>
                  {state.files.map(f => (
                    <div
                      key={f.id}
                      className="row-between cursor-pointer"
                      style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)' }}
                      onClick={() => handleOpenFile(f)}
                    >
                      <div className="row gap-10 align-center flex-1">
                        <span style={{ color: fileTypeColor(f) }}>{fileIcon(f, 16)}</span>
                        <div>
                          <div className="text-sm font-semibold">{f.name}</div>
                          <div className="text-xs text-tertiary">{f.size}</div>
                        </div>
                      </div>
                      <Edit3 size={15} color="var(--text-tertiary)" />
                    </div>
                  ))}
                </div>
              </>
            )}
            {remotePhase === 'offline' && (
              <>
                <WifiOff size={40} color="var(--red)" style={{ margin: '0 auto 12px' }} />
                <div className="font-semibold" style={{ color: 'var(--red)' }}>Laptop Offline</div>
                <div className="text-sm text-secondary mt-8">Remote directory unavailable. Use the Offline Vault.</div>
                <button className="btn btn-primary btn-sm mt-16" onClick={() => setView('vault')}>
                  Open Offline Vault
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({
  file, index, isOffline, syncing, onSync, onOpen,
}: {
  file: FileItem;
  index: number;
  isOffline: boolean;
  syncing: boolean;
  onSync: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className={`card fade-in-up stagger-${(index % 5) + 1}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer',
        border: file.modifiedOffline ? '1px solid rgba(52, 211, 153, 0.4)' : undefined,
      }}
      onClick={onOpen}
    >
      <span style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
        color: fileTypeColor(file),
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {fileIcon(file, 18)}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-6 align-center">
          <span className="font-semibold text-sm truncate">{file.name}</span>
          {file.modifiedOffline && (
            <span className="badge badge-online" style={{ fontSize: 9, padding: '1px 5px' }}>OFFLINE EDITED</span>
          )}
        </div>
        <div className="row gap-8 text-xs text-tertiary mt-2">
          <span>{file.size}</span>
          <span>·</span>
          <span>{relativeTime(file.modified) || 'just now'}</span>
          {file.synced && (
            <>
              <span>·</span>
              <span className="row gap-4" style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center' }}>
                <Shield size={10} /> Vault
              </span>
            </>
          )}
        </div>
      </div>

      <div className="row gap-6 align-center" onClick={e => e.stopPropagation()}>
        {!file.synced && (
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px' }}
            onClick={onSync}
            disabled={syncing || isOffline}
          >
            {syncing ? 'Syncing…' : <><Download size={13} /> Pre-Fetch</>}
          </button>
        )}
        {file.content && (
          <button className="icon-btn" onClick={onOpen} title="Edit file in vault">
            <Edit3 size={15} color="var(--text-secondary)" />
          </button>
        )}
      </div>
    </div>
  );
}
