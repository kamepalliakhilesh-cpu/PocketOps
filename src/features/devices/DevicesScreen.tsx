import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, Clipboard, ArrowLeftRight, Power,
  Laptop, ChevronRight, CheckCircle2, RefreshCw, Code2,
  GitMerge, Terminal,
} from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { mockDeviceAdapter } from '../../core/adapters';
import SuperSyncMeshCard from './SuperSyncMeshCard';

export default function DevicesScreen() {
  const nav = useNavigate();
  const {
    state, updateDevice, toast, logActivity,
    setBlackoutModalOpen, setResyncModalOpen, triggerBlackoutTakeover, triggerResyncMerge,
  } = useStore();
  const dev = state.device;
  const isOffline = dev.status === 'offline';
  const snapshot = state.sessionSnapshot;
  const [showWake, setShowWake] = useState(false);
  const [waking, setWaking] = useState(false);

  const handleAction = (action: string) => {
    if (isOffline && !['Wake', 'Remote Control', 'Hot-Standby IDE'].includes(action)) {
      toast(`${action} unavailable — laptop is offline`, 'error');
      return;
    }
    switch (action) {
      case 'Hot-Standby IDE': setBlackoutModalOpen(true); break;
      case 'Diff Merge': setResyncModalOpen(true); break;
      case 'Screen Mirror': toast('Screen mirror request sent via Wi-Fi 7 Direct', 'success'); break;
      case 'Clipboard': nav('/clipboard'); break;
      case 'Transfer File': nav('/files'); break;
      case 'Camera': nav('/camera/w2/ws8'); break;
      case 'Remote Control': toast(isOffline ? 'Reconnect laptop first' : 'Remote control session started', isOffline ? 'error' : 'success'); break;
      case 'Wake': handleWake(); break;
      default: toast(action, 'info');
    }
    logActivity('device_checked', `Action: ${action}`, dev.name);
  };

  const handleWake = () => {
    setShowWake(true);
    setWaking(true);
    logActivity('wake_sent', 'Sending wake request…', 'Wake-on-LAN P2P');
    setTimeout(() => {
      setWaking(false);
      toast('Wake request sent via local mesh', 'success');
      logActivity('wake_sent', 'Wake request dispatched', 'Waiting for laptop to respond');
    }, 1800);
  };

  const refreshMetrics = async () => {
    if (isOffline) { toast('Cannot refresh — laptop offline (Standby active)', 'error'); return; }
    toast('Fetching telemetry…', 'info');
    try {
      const m = await mockDeviceAdapter.getMetrics();
      updateDevice({ metrics: m });
      toast('Hardware metrics updated', 'success');
      logActivity('device_checked', 'Laptop telemetry checked', 'Metrics refreshed');
    } catch {
      toast('Could not fetch metrics', 'error');
    }
  };

  const actions = [
    { label: 'Hot-Standby IDE', icon: Code2 },
    { label: 'Diff Merge', icon: GitMerge },
    { label: 'Clipboard', icon: Clipboard },
    { label: 'Transfer File', icon: ArrowLeftRight },
    { label: 'Screen Mirror', icon: Monitor },
    { label: 'Wake', icon: Power },
  ];

  return (
    <div className="page">
      <div className="row-between mb-16">
        <div>
          <h1 className="page-title">Devices & Mesh</h1>
          <p className="page-subtitle">P2P Cross-Device Standby Hub</p>
        </div>
        <button className="icon-btn" onClick={refreshMetrics} aria-label="Refresh metrics">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* SuperSync Mesh Telemetry */}
      <div className="mb-16">
        <SuperSyncMeshCard />
      </div>

      {/* Active Session Mirror Preview Card */}
      <div className="card mb-16 fade-in-up" style={{ borderColor: 'rgba(255, 122, 0, 0.3)', background: 'rgba(255, 122, 0, 0.04)' }}>
        <div className="row-between mb-8">
          <div className="row gap-8 align-center">
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255, 122, 0, 0.2)', color: 'var(--iqoo-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Terminal size={15} />
            </span>
            <div>
              <div className="font-bold text-xs">Live Mirrored Session</div>
              <div className="text-xs text-secondary">{snapshot.appTitle}</div>
            </div>
          </div>
          <span className="badge badge-ai" style={{ fontSize: 9 }}>HOT-STANDBY</span>
        </div>

        <div className="row-between text-xs text-tertiary mb-12" style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 6 }}>
          <span>File: <b style={{ color: 'var(--text)' }}>{snapshot.activeFile}</b></span>
          <span>Branch: <b style={{ color: 'var(--cyan)' }}>{snapshot.gitBranch}</b></span>
        </div>

        <button
          className="btn btn-primary btn-sm w-full"
          style={{ background: 'linear-gradient(135deg, var(--iqoo-amber), var(--purple))', border: 'none' }}
          onClick={() => setBlackoutModalOpen(true)}
        >
          <Code2 size={14} /> Open Live Takeover IDE & Terminal
        </button>
      </div>

      {/* Connected Device card */}
      <div className="card mb-16 fade-in-up">
        <div className="row-between mb-16">
          <div className="row gap-10">
            <span style={{
              width: 44, height: 44, borderRadius: 14,
              background: isOffline ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
              color: isOffline ? 'var(--red)' : 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Laptop size={22} />
            </span>
            <div>
              <div className="font-bold" style={{ fontSize: 17 }}>{dev.name}</div>
              <div className="text-xs text-tertiary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isOffline ? 'var(--red)' : 'var(--green)',
                  animation: isOffline ? 'none' : 'pulse 2s ease infinite',
                }} />
                {isOffline ? 'Offline (Hot Standby)' : 'Connected via Wi-Fi 7'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-tertiary">Health</div>
            <div className="font-bold" style={{ color: isOffline ? 'var(--text-tertiary)' : 'var(--green)' }}>
              {isOffline ? 'Standby' : dev.health === 'good' ? 'Optimal' : dev.health}
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid-2 gap-8 mb-16">
          {dev.metrics.map(m => (
            <div key={m.key} className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs text-tertiary">{m.label}</div>
              {m.lastKnown || isOffline ? (
                <>
                  <div className="font-bold mt-4" style={{ fontSize: 15, color: 'var(--orange)' }}>
                    {m.value ? `${m.value}${m.unit || ''}` : 'Unavailable'}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--orange)', fontSize: 10 }}>Last known</div>
                </>
              ) : (
                <>
                  <div className="font-bold mt-4" style={{ fontSize: 18 }}>
                    {m.value ? `${m.value}${m.unit || ''}` : 'Unavailable'}
                  </div>
                  {m.key !== 'network' && m.value && (
                    <div className="progress-track mt-6" style={{ height: 4 }}>
                      <div className="progress-bar" style={{ width: `${parseInt(m.value, 10)}%` }} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="grid-2 gap-8">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => handleAction(label)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Wake animation */}
      {showWake && (
        <div className="card mb-16 fade-in-up" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)', textAlign: 'center', padding: '24px 20px' }}>
          {waking ? (
            <>
              <div className="ai-orb" style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
              <div className="font-semibold text-sm">Dispatched P2P Magic Packet…</div>
              <div className="text-xs text-secondary mt-4">Wake-on-LAN hardware trigger</div>
            </>
          ) : (
            <>
              <CheckCircle2 size={32} color="var(--green)" style={{ margin: '0 auto 8px' }} />
              <div className="font-semibold text-sm">Wake packet dispatched</div>
              <div className="text-xs text-secondary mt-4">Hardware node waking over local mesh.</div>
            </>
          )}
        </div>
      )}

      {/* Clipboard shortcut */}
      <button className="card mb-16 w-full" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }} onClick={() => nav('/clipboard')}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clipboard size={20} />
        </span>
        <div style={{ flex: 1 }}>
          <div className="text-sm font-semibold">Zero-Latency Shared Clipboard</div>
          <div className="text-xs text-tertiary">Real-time peer-to-peer snippet streaming</div>
        </div>
        <ChevronRight size={18} color="var(--text-tertiary)" />
      </button>

      {/* Hackathon Stage Triggers */}
      <div className="section-label">Hackathon Live Simulation Triggers</div>
      <div className="card" style={{ background: 'rgba(255,122,0,0.06)', borderColor: 'rgba(255,122,0,0.25)' }}>
        <div className="row-between mb-12">
          <div>
            <div className="text-sm font-bold">Simulate Blackout Takeover</div>
            <div className="text-xs text-secondary mt-2">Instantly simulate laptop power loss and auto-launch hot-standby node.</div>
          </div>
          <button
            className={`btn btn-sm ${isOffline ? 'btn-secondary' : 'btn-primary'}`}
            style={{ flexShrink: 0 }}
            onClick={() => {
              if (isOffline) {
                triggerResyncMerge();
              } else {
                triggerBlackoutTakeover();
              }
            }}
          >
            {isOffline ? 'Simulate Re-Sync' : 'Simulate Power Cut'}
          </button>
        </div>

        {isOffline && (
          <div className="text-xs mt-4" style={{ color: 'var(--iqoo-amber)', lineHeight: 1.5 }}>
            🚨 Hot-Standby Active. All work is preserved locally on your phone and ready to merge when power returns.
          </div>
        )}
      </div>

      <style>{`
        .ai-orb { border-radius: 50%; background: conic-gradient(var(--iqoo-amber), var(--cyan), var(--purple), var(--iqoo-amber)); animation: spin 2s linear infinite; position: relative; }
        .ai-orb::after { content: ''; position: absolute; inset: 4px; background: var(--bg-card); border-radius: 50%; }
      `}</style>
    </div>
  );
}
