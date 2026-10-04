import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, ListTodo, GitBranch, Folder, MonitorSmartphone,
  Search, Mic, Wifi, BatteryCharging, Sun, Moon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import { useStore } from '../../core/store/StoreContext';
import { aiProvider } from '../../core/ai/LLMProvider';

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/workflows', label: 'Workflows', icon: GitBranch },
  { to: '/files', label: 'Files', icon: Folder },
  { to: '/devices', label: 'Devices', icon: MonitorSmartphone },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            aria-label={label}
            end={to === '/'}
          >
            <span className="nav-indicator" />
            <Icon size={19} strokeWidth={2.2} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </div>

      <style>{`
        .bottom-nav {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: var(--nav-height);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px 6px;
          z-index: 100;
          pointer-events: none;
        }
        .bottom-nav-inner {
          pointer-events: auto;
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(11, 14, 22, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          padding: 0 4px;
        }
        .nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.5px;
          padding: 6px 10px;
          border-radius: 12px;
          color: var(--text-tertiary);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex: 1;
        }
        .nav-item.active {
          color: var(--text);
        }
        .nav-item:hover {
          color: var(--text-secondary);
        }
        .nav-item.active:hover {
          color: var(--text);
        }
        .nav-indicator {
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 16px;
          height: 2.5px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--iqoo-amber), var(--cyan));
          box-shadow: 0 0 8px var(--iqoo-amber);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-item.active .nav-indicator {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>
    </nav>
  );
}

/* ---------- Global Top Bar with Simulated Hardware Status Bar ---------- */
export function TopBar() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { state, toggleTheme, dispatch, logActivity } = useStore();
  const [listening, setListening] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleVoice = async () => {
    if (listening) return;
    setListening(true);
    show('Listening…', 'ai');
    const commands = ['Check my laptop', 'Show project files', 'Wake my laptop', 'Add a task to submit my project tomorrow'];
    const cmd = commands[Math.floor(Math.random() * commands.length)];

    timerRef.current = setTimeout(async () => {
      try {
        show(`"${cmd}"`, 'ai');
        const result = await aiProvider.extractIntent(cmd);
        if (result.valid && result.data) {
          logActivity('search_performed', 'Voice command', `${result.data.intent}`);
          show(`Intent: ${result.data.intent}`, 'ai');
          dispatch({ intent: result.data.intent, payload: result.data as unknown as Record<string, unknown>, source: 'voice' });
          if (result.data.intent === 'DEVICE_STATUS') navigate('/devices');
          else if (result.data.intent === 'SEARCH_FILES') navigate('/files');
          else if (result.data.intent === 'WAKE_DEVICE') navigate('/devices');
          else if (result.data.intent === 'CREATE_TASK') navigate('/tasks');
          else if (result.data.intent === 'RESUME_WORKFLOW' || result.data.intent === 'PAUSE_WORKFLOW' || result.data.intent === 'START_WORKFLOW') navigate('/workflows');
        } else {
          show('Could not interpret command', 'error');
        }
      } catch {
        show('Could not interpret command', 'error');
      } finally {
        setListening(false);
      }
    }, 1800);
  };

  return (
    <div className="top-shell">
      {/* Native Flagship Hardware Status Bar */}
      <div className="phone-status-bar">
        <span>09:41</span>
        <div className="status-bar-icons">
          <Wifi size={11} strokeWidth={2.5} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>5G</span>
          <div className="row gap-4 align-center" style={{ marginLeft: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 600 }}>98%</span>
            <BatteryCharging size={13} color="var(--green)" />
          </div>
        </div>
      </div>

      {/* Primary Navigation Header */}
      <header className="top-bar">
        <button className="logo" onClick={() => navigate('/')} aria-label="PocketOps home">
          <span className="logo-mark">
            <span className="logo-sparkle" />⚡
          </span>
          <div className="col" style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <span className="logo-text">PocketOps</span>
            <span className="logo-badge-brand">iQOO ECOSYSTEM</span>
          </div>
        </button>

        <div className="top-actions">
          <button
            className="icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${state.settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
            title={`Switch to ${state.settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {state.settings.theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="var(--iqoo-amber)" />}
          </button>
          <button className="icon-btn" onClick={() => navigate('/search')} aria-label="Search">
            <Search size={15} />
          </button>
          <button
            className={`icon-btn voice-btn ${listening ? 'listening' : ''}`}
            onClick={handleVoice}
            aria-label="Voice command"
          >
            <Mic size={15} />
          </button>
          <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Settings">
            <span className="avatar-dot">AK</span>
          </button>
        </div>
      </header>

      <style>{`
        .top-shell {
          position: sticky;
          top: 0;
          z-index: 110;
          background: rgba(7, 9, 14, 0.9);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px 10px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }
        .logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--iqoo-amber) 0%, #ff8800 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          color: #000;
          box-shadow: 0 0 14px rgba(255, 85, 0, 0.35);
          position: relative;
        }
        .logo-text {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
        }
        .logo-badge-brand {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--iqoo-amber);
        }
        .top-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .avatar-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--purple), var(--cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9.5px;
          font-weight: 800;
          color: #fff;
        }
        .voice-btn.listening {
          background: rgba(255, 85, 0, 0.2);
          color: var(--iqoo-amber);
          border-color: var(--iqoo-amber);
          animation: pulse 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
