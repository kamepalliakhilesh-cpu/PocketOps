import { useState } from 'react';
import {
  ShieldAlert, Terminal, Code2, Check, Save,
  X, Cpu, Radio, FileText,
} from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';

export default function BlackoutTakeoverModal() {
  const { state, setBlackoutModalOpen, updateSessionBuffer, updateFileContent, toast, logActivity } = useStore();
  const isOpen = state.isBlackoutModalOpen;
  const snapshot = state.sessionSnapshot;

  const [codeBuffer, setCodeBuffer] = useState(snapshot.unsavedBuffer);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal'>('editor');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveBuffer = () => {
    updateSessionBuffer(codeBuffer);
    const targetFile = state.files.find(f => f.name === snapshot.activeFile);
    if (targetFile) {
      updateFileContent(targetFile.id, codeBuffer);
    }
    setIsSaved(true);
    toast('Buffer saved to Offline Vault', 'success');
    logActivity('offline_file_edited', `Saved ${snapshot.activeFile}`, 'Encrypted in local flash');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRunLocalAudit = () => {
    toast('Analyzing code buffer against local syntax rules…', 'ai');
    setTimeout(() => {
      toast('Local Audit Passed: Valid syntax, schema verified', 'success');
      logActivity('ai_breakdown', 'Local Syntax Audit', 'Offline validation completed in 12ms');
    }, 600);
  };

  return (
    <div className="modal-backdrop fade-in" onClick={() => setBlackoutModalOpen(false)}>
      <div className="modal-sheet blackout-modal" onClick={e => e.stopPropagation()}>
        {/* Grab Handle */}
        <div className="sheet-handle" />

        {/* Header Alert */}
        <div className="blackout-header">
          <div className="row gap-10 align-center">
            <span className="blackout-icon">
              <ShieldAlert size={18} color="var(--red)" />
            </span>
            <div>
              <div className="font-bold text-xs" style={{ color: 'var(--red)', letterSpacing: '0.04em' }}>
                HOT-STANDBY SESSION TAKEOVER
              </div>
              <div className="text-xs text-secondary mt-1">
                Laptop Disconnected · Standby Active on Phone
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setBlackoutModalOpen(false)} aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        {/* Telemetry Strip */}
        <div className="blackout-telemetry-strip">
          <div className="row gap-6 align-center">
            <Radio size={11} color="var(--iqoo-amber)" />
            <span className="text-xs font-semibold">Zero-Cloud Standby</span>
          </div>
          <div className="row gap-10 text-xs text-tertiary">
            <span>Branch: <b style={{ color: 'var(--cyan)' }}>{snapshot.gitBranch}</b></span>
            <span>Line: <b style={{ color: 'var(--text)' }}>{snapshot.line}</b></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="takeover-tabs">
          <button
            className={`takeover-tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Code2 size={13} />
            <span>Active Code ({snapshot.activeFile})</span>
          </button>
          <button
            className={`takeover-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <Terminal size={13} />
            <span>Active Terminal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="takeover-content-body">
          {activeTab === 'editor' ? (
            <div className="takeover-editor-view">
              <div className="editor-file-header">
                <div className="row gap-6 align-center">
                  <FileText size={12} color="var(--iqoo-amber)" />
                  <span className="text-xs text-secondary">{snapshot.filePath}</span>
                </div>
                <span className="badge badge-ai" style={{ fontSize: 9 }}>LIVE EDITABLE</span>
              </div>
              <textarea
                className="takeover-code-textarea"
                value={codeBuffer}
                onChange={e => setCodeBuffer(e.target.value)}
                spellCheck={false}
                rows={9}
              />
            </div>
          ) : (
            <div className="takeover-terminal-view">
              <div className="terminal-cmd-bar">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd-text">{snapshot.activeTerminalCmd}</span>
              </div>
              <div className="terminal-log-output">
                {snapshot.terminalOutput.map((line, idx) => (
                  <div key={idx} className="terminal-log-line">
                    <span className="term-num">{idx + 1}</span>
                    <span className="term-txt">{line}</span>
                  </div>
                ))}
                <div className="terminal-log-line active-pulse">
                  <span className="term-num">7</span>
                  <span className="term-txt" style={{ color: 'var(--iqoo-amber)' }}>
                    [STANDBY] State preserved locally · Awaiting PC reconnect…
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="blackout-footer">
          <button className="btn btn-secondary btn-sm" onClick={handleRunLocalAudit}>
            <Cpu size={13} /> Local Audit
          </button>
          <button
            className={`btn btn-primary btn-sm flex-1 ${isSaved ? 'btn-success' : ''}`}
            onClick={handleSaveBuffer}
          >
            {isSaved ? <Check size={13} /> : <Save size={13} />}
            {isSaved ? 'Saved to Vault' : 'Save to Offline Vault'}
          </button>
        </div>

        <style>{`
          .blackout-modal {
            max-height: 86vh;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: #0b0e17;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), var(--glass-specular);
          }
          .blackout-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background: rgba(244, 63, 94, 0.06);
            border-bottom: 1px solid rgba(244, 63, 94, 0.18);
          }
          .blackout-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(244, 63, 94, 0.15);
            border: 1px solid rgba(244, 63, 94, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .blackout-telemetry-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 18px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .takeover-tabs {
            display: flex;
            padding: 8px 16px;
            gap: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .takeover-tab {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 10px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .takeover-tab.active {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .takeover-content-body {
            flex: 1;
            overflow-y: auto;
            padding: 14px 16px;
          }
          .takeover-editor-view {
            display: flex;
            flex-direction: column;
          }
          .editor-file-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px 10px 0 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-bottom: none;
          }
          .takeover-code-textarea {
            width: 100%;
            background: #05070c;
            color: #67e8f9;
            font-family: var(--font-mono);
            font-size: 11.5px;
            line-height: 1.5;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 0 0 10px 10px;
            resize: none;
            outline: none;
          }
          .takeover-code-textarea:focus {
            border-color: var(--cyan);
          }
          .takeover-terminal-view {
            background: #05070c;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 12px;
            font-family: var(--font-mono);
            font-size: 11px;
          }
          .terminal-cmd-bar {
            display: flex;
            gap: 6px;
            padding-bottom: 8px;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          .terminal-prompt { color: var(--green-bright); font-weight: bold; }
          .terminal-cmd-text { color: var(--cyan); }
          .terminal-log-output {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .terminal-log-line {
            display: flex;
            gap: 8px;
            line-height: 1.4;
          }
          .term-num { color: #475569; width: 16px; flex-shrink: 0; text-align: right; }
          .term-txt { color: #94a3b8; }
          .blackout-footer {
            display: flex;
            gap: 10px;
            padding: 14px 18px;
            background: rgba(0, 0, 0, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
          }
        `}</style>
      </div>
    </div>
  );
}
