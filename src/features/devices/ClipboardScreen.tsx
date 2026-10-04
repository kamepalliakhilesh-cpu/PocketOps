import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle2, Smartphone, Laptop, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';

export default function ClipboardScreen() {
  const nav = useNavigate();
  const { state, toast, logActivity } = useStore();
  const isOffline = state.device.status === 'offline';
  const [laptopClip, setLaptopClip] = useState('npm run build');
  const [phoneClip, setPhoneClip] = useState('npm run dev');
  const [syncing, setSyncing] = useState<'l2p' | 'p2l' | null>(null);
  const [syncedDir, setSyncedDir] = useState<'l2p' | 'p2l' | null>(null);

  const syncClipboard = (dir: 'l2p' | 'p2l') => {
    if (syncing) return;
    if (isOffline) {
      toast('Clipboard sync unavailable — laptop is offline', 'error');
      return;
    }
    const text = dir === 'l2p' ? laptopClip : phoneClip;
    setSyncing(dir);
    setSyncedDir(null);
    setTimeout(() => {
      setSyncing(null);
      setSyncedDir(dir);
      if (dir === 'l2p') setPhoneClip(laptopClip);
      else setLaptopClip(phoneClip);
      toast('Clipboard synced', 'success');
      logActivity('clipboard_synced', 'Clipboard synced', `Laptop ${dir === 'l2p' ? '→' : '←'} Phone · "${text.slice(0, 60)}"`);
    }, 1400);
  };

  return (
    <div className="page">
      <div className="row gap-12 mb-20">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: 22 }}>Clipboard</h1>
          <p className="page-subtitle">Cross-device clipboard sync</p>
        </div>
      </div>

      {isOffline && (
        <div className="card mb-16" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--red)' }}>Laptop offline</div>
          <div className="text-xs text-secondary mt-4">Clipboard sync requires an active laptop connection.</div>
        </div>
      )}

      <div className="col gap-16 mb-24">
        {/* Laptop */}
        <div className="card fade-in-up">
          <div className="row-between mb-12">
            <div className="row gap-10">
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Laptop size={18} />
              </span>
              <div>
                <div className="text-sm font-bold">Laptop</div>
                <div className="text-xs text-tertiary">Clipboard content {syncedDir === 'p2l' && <span style={{ color: 'var(--green)' }}>· updated</span>}</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-word' }}>
            {laptopClip}
          </div>
        </div>

        {/* Sync buttons — both directions */}
        <div className="text-center col gap-8" style={{ alignItems: 'center' }}>
          <div className="row gap-8" style={{ justifyContent: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => syncClipboard('l2p')}
              disabled={syncing !== null || isOffline}
              style={{ minWidth: 150 }}
            >
              {syncing === 'l2p' ? (
                <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Syncing…</>
              ) : (
                <><ArrowDown size={14} /> Laptop → Phone</>
              )}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => syncClipboard('p2l')}
              disabled={syncing !== null || isOffline}
              style={{ minWidth: 150 }}
            >
              {syncing === 'p2l' ? (
                <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Syncing…</>
              ) : (
                <><ArrowUp size={14} /> Phone → Laptop</>
              )}
            </button>
          </div>
          {syncedDir && (
            <div className="row gap-6 text-xs" style={{ color: 'var(--green)', alignItems: 'center' }}>
              <CheckCircle2 size={13} /> Synced {syncedDir === 'l2p' ? 'Laptop → Phone' : 'Phone → Laptop'}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="card fade-in-up stagger-2">
          <div className="row-between mb-12">
            <div className="row gap-10">
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.12)', color: 'var(--purple-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} />
              </span>
              <div>
                <div className="text-sm font-bold">Phone</div>
                <div className="text-xs text-tertiary">Clipboard content {syncedDir === 'l2p' && <span style={{ color: 'var(--green)' }}>· updated</span>}</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              className="input"
              style={{ fontFamily: 'monospace', fontSize: 14, minHeight: 64, resize: 'none', paddingRight: 42 }}
              value={phoneClip}
              onChange={e => setPhoneClip(e.target.value)}
              aria-label="Phone clipboard content"
            />
            <button
              className="icon-btn"
              style={{ position: 'absolute', right: 6, top: 6, width: 30, height: 30 }}
              onClick={() => {
                if (!phoneClip) { toast('Clipboard is empty', 'info'); return; }
                navigator.clipboard?.writeText(phoneClip)
                  .then(() => toast('Copied to clipboard', 'success'))
                  .catch(() => toast('Clipboard access unavailable', 'error'));
              }}
              aria-label="Copy phone clipboard content"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.15)' }}>
        <div className="text-xs text-secondary" style={{ lineHeight: 1.6 }}>
          <strong>How it works:</strong> Clipboard sync uses the same adapter pattern as other integrations. In the prototype, this is a mock adapter. A real implementation would use a local WebSocket server or platform clipboard API.
        </div>
      </div>
    </div>
  );
}
