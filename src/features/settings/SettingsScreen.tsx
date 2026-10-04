import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Laptop, FileText, Monitor, WifiOff,
  Camera, Mic, Bell, Trash2, FolderSync, Unlink, Clock, ChevronRight, Activity, FlaskConical, RotateCcw, Sparkles,
  Sun, Moon,
} from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';

export default function SettingsScreen() {
  const nav = useNavigate();
  const { state, setSetting, setTheme, clearActivity, reset, toast } = useStore();
  const syncedCount = state.files.filter(f => f.synced).length;
  const isOnline = state.device.status === 'connected';

  const perms = [
    { name: 'Camera', icon: Camera, granted: state.settings.cameraPermission },
    { name: 'Microphone', icon: Mic, granted: state.settings.micPermission },
    { name: 'Notifications', icon: Bell, granted: state.settings.notifications },
  ];

  return (
    <div className="page">
      <div className="row gap-12 mb-20">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 22 }}>Settings</h1>
          <p className="page-subtitle">Privacy Center</p>
        </div>
        <span style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--purple), var(--pink))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 16, color: '#fff',
        }}>A</span>
      </div>

      {/* Overview */}
      <div className="grid-2 gap-8 mb-24">
        <OverviewCard icon={Laptop} label="Connected Devices" value={isOnline ? '1' : '0'} color={isOnline ? 'var(--green)' : 'var(--red)'} />
        <OverviewCard icon={FileText} label="Synced Files" value={`${syncedCount}`} color="var(--cyan)" />
        <OverviewCard icon={Monitor} label="Active Sessions" value={isOnline ? '1' : '0'} color="var(--purple-bright)" />
        <OverviewCard icon={Shield} label="Local Storage" value="On" color="var(--pink)" />
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="card mb-24" style={{ padding: 14 }}>
          <div className="row-between mb-12">
            <div>
              <div className="text-sm font-semibold">Interface Theme</div>
              <div className="text-xs text-secondary mt-2">Switch between OLED Dark Mode and Studio Light Mode</div>
            </div>
          </div>
          <div className="grid-2 gap-8">
            <button
              className={`card theme-choice-card ${state.settings.theme !== 'light' ? 'active' : ''}`}
              onClick={() => {
                setTheme('dark');
                toast('Switched to Dark Mode', 'info');
              }}
            >
              <div className="row-between w-full mb-6">
                <Moon size={16} color="var(--iqoo-amber)" />
                {state.settings.theme !== 'light' && <span className="badge badge-online">ACTIVE</span>}
              </div>
              <div className="font-bold text-xs">Dark Mode</div>
              <div className="text-xs text-tertiary mt-2">OLED Black & Neon</div>
            </button>
            <button
              className={`card theme-choice-card ${state.settings.theme === 'light' ? 'active' : ''}`}
              onClick={() => {
                setTheme('light');
                toast('Switched to Light Mode', 'info');
              }}
            >
              <div className="row-between w-full mb-6">
                <Sun size={16} color="var(--cyan)" />
                {state.settings.theme === 'light' && <span className="badge badge-online">ACTIVE</span>}
              </div>
              <div className="font-bold text-xs">Light Mode</div>
              <div className="text-xs text-tertiary mt-2">Crisp Studio Slate</div>
            </button>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="card" style={{ padding: 14 }}>
          <div className="row gap-10">
            <Shield size={18} color="var(--green)" />
            <div>
              <div className="text-sm font-semibold">Local-only storage</div>
              <div className="text-xs text-secondary mt-4">All tasks, workflows, and settings are stored in your browser's local storage — nothing is sent to a server.</div>
            </div>
          </div>
        </div>
        <div className="card mt-8" style={{ padding: 14 }}>
          <div className="row gap-10">
            <Sparkles size={18} color="var(--purple-bright)" />
            <div>
              <div className="text-sm font-semibold">Safe AI execution</div>
              <div className="text-xs text-secondary mt-4">AI output is schema-validated before any action. Raw LLM output never executes commands.</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Permissions */}
      <Section title="Permissions">
        {perms.map(({ name, icon: Icon, granted }) => (
          <div key={name} className="card" style={{ padding: 14, marginBottom: 8 }}>
            <div className="row-between">
              <div className="row gap-10">
                <Icon size={18} color={granted ? 'var(--green)' : 'var(--red)'} />
                <span className="text-sm font-semibold">{name}</span>
              </div>
              <span className={`badge ${granted ? 'badge-online' : 'badge-offline'}`}>
                {granted ? 'Granted' : 'Denied'}
              </span>
            </div>
          </div>
        ))}
      </Section>

      {/* Data Controls */}
      <Section title="Data Controls">
        <DataButton icon={FolderSync} label="Manage synced folders" onClick={() => nav('/files')} />
        <DataButton icon={Trash2} label="Clear local cache" onClick={() => { toast('Simulated in prototype — no local cache to clear', 'info'); }} />
        <DataButton icon={Unlink} label="Revoke device" onClick={() => { toast('Simulated in prototype — device revocation not available', 'info'); }} />
        <DataButton icon={Clock} label="Clear activity history" onClick={clearActivity} />
        <DataButton icon={Activity} label="View activity timeline" onClick={() => nav('/activity')} />
      </Section>

      {/* Demo Mode */}
      <Section title="Demo Mode">
        <div className="card" style={{ padding: 16, background: 'rgba(251,146,60,0.06)', borderColor: 'rgba(251,146,60,0.2)' }}>
          <div className="row-between mb-8">
            <div className="row gap-10">
              <FlaskConical size={18} color="var(--orange)" />
              <div>
                <div className="text-sm font-bold">Demo Mode</div>
                <div className="text-xs text-secondary mt-4">Presentation preference for hackathon demos. Use the controls below and the Devices screen to simulate offline conditions.</div>
              </div>
            </div>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={state.settings.demoMode}
                onChange={e => {
                  setSetting('demoMode', e.target.checked);
                  toast(e.target.checked ? 'Demo mode enabled' : 'Demo mode disabled', 'info');
                }}
                aria-label="Demo mode"
              />
              <span className="slider" />
            </label>
          </div>
          <div className="row gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => nav('/devices')}>
              <WifiOff size={13} /> Laptop Offline Toggle
            </button>
            <button className="btn btn-secondary btn-sm" onClick={reset}>
              <RotateCcw size={13} /> Reset Demo Data
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
      <div className="text-center mt-24 mb-24" style={{ paddingBottom: 20 }}>
        <div className="font-bold" style={{ fontSize: 15 }}>PocketOps</div>
        <div className="text-xs text-tertiary mt-4">Smart Tasks. Cross-Device Care.</div>
        <div className="text-xs text-tertiary mt-8">Prototype v1.0 · Hackathon Edition</div>
      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background: rgba(255,255,255,0.15); transition: .3s; border-radius: 24px; }
        .slider:before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; transition: .3s; border-radius: 50%; }
        .switch input:checked + .slider { background: var(--purple); }
        .switch input:checked + .slider:before { transform: translateX(20px); }
        .theme-choice-card {
          padding: 14px;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
        }
        .theme-choice-card.active {
          border-color: var(--iqoo-amber);
          background: var(--iqoo-amber-subtle);
          box-shadow: 0 0 16px rgba(255, 85, 0, 0.12);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-24">
      <div className="section-label">{title}</div>
      {children}
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, color }: {
  icon: typeof Laptop; label: string; value: string; color: string;
}) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <Icon size={18} color={color} />
      <div className="font-bold mt-8" style={{ fontSize: 22 }}>{value}</div>
      <div className="text-xs text-tertiary mt-4">{label}</div>
    </div>
  );
}

function DataButton({ icon: Icon, label, onClick }: {
  icon: typeof Laptop; label: string; onClick: () => void;
}) {
  return (
    <button
      className="card w-full"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 8, cursor: 'pointer', textAlign: 'left' }}
      onClick={onClick}
    >
      <Icon size={17} color="var(--text-secondary)" />
      <span className="text-sm font-semibold" style={{ flex: 1 }}>{label}</span>
      <ChevronRight size={16} color="var(--text-tertiary)" />
    </button>
  );
}
