import { useState } from 'react';
import { RefreshCw, GitMerge, CheckCircle2, FileCode, Check, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';

export default function ResyncMergeModal() {
  const { state, setResyncModalOpen, toast, logActivity } = useStore();
  const isOpen = state.isResyncModalOpen;
  const report = state.diffReport;
  const [isMerged, setIsMerged] = useState(false);

  if (!isOpen || !report) return null;

  const handleApplyMerge = () => {
    setIsMerged(true);
    toast('Git commit merged to Laptop repo without conflicts!', 'success');
    logActivity('diff_merged', 'P2P Diff Auto-Committed', 'SHA256: 8f9b2c4e1a0d7f3e synced to master');
    setTimeout(() => {
      setResyncModalOpen(false);
      setIsMerged(false);
    }, 1600);
  };

  return (
    <div className="modal-backdrop fade-in" onClick={() => setResyncModalOpen(false)}>
      <div className="modal-sheet resync-modal" onClick={e => e.stopPropagation()}>
        {/* Grab Handle */}
        <div className="sheet-handle" />

        {/* Header */}
        <div className="resync-header">
          <div className="row gap-10 align-center">
            <span className="resync-icon-badge">
              <GitMerge size={18} color="var(--green-bright)" />
            </span>
            <div>
              <div className="font-bold text-xs" style={{ color: 'var(--green-bright)', letterSpacing: '0.04em' }}>
                GIT-STYLE P2P DIFF REVIEW & MERGE
              </div>
              <div className="text-xs text-secondary mt-1">
                Workstation Reconnected · Visual Diff & Patch Review
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setResyncModalOpen(false)} aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        {/* Checksum & Status info */}
        <div className="resync-info-strip">
          <div className="row gap-6 align-center">
            <ShieldCheck size={13} color="var(--cyan)" />
            <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>{report.checksum}</span>
          </div>
          <span className="badge badge-online">CLEAN DIFF</span>
        </div>

        {/* List of Files Merged */}
        <div className="resync-body">
          <div className="section-label mb-8">Merged Changes ({report.filesMerged.length} Files)</div>
          <div className="col gap-8 mb-16">
            {report.filesMerged.map((f, i) => (
              <div key={i} className="resync-file-card">
                <div className="row gap-8 align-center flex-1">
                  <FileCode size={15} color="var(--iqoo-amber)" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-xs">{f.name}</div>
                    <div className="text-xs text-tertiary">Direct P2P Patch Applied</div>
                  </div>
                </div>
                <div className="row gap-8 align-center">
                  <span className="diff-tag add">+{f.additions}</span>
                  <span className="diff-tag del">-{f.deletions}</span>
                  <CheckCircle2 size={14} color="var(--green-bright)" />
                </div>
              </div>
            ))}
          </div>

          {/* Visual Diff Snippet Preview */}
          <div className="section-label mb-8">Live Diff Inspector (auth_controller.py)</div>
          <div className="diff-preview-box">
            <div className="diff-line unchanged">  def verify_session_token(token: str, device_id: str):</div>
            <div className="diff-line unchanged">      payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])</div>
            <div className="diff-line deleted">-     if not is_device_authorized(device_id):</div>
            <div className="diff-line added">+     # [OFFLINE TAKEOVER] Verify hardware biometric hash</div>
            <div className="diff-line added">+     if not is_device_authorized(device_id) or not verify_biometric_node():</div>
            <div className="diff-line deleted">-         raise SecurityException("Device authorization missing")</div>
            <div className="diff-line added">+         raise SecurityException("Device authorization missing or biometric invalid")</div>
            <div className="diff-line added">+     return &#123;"status": "authorized", "user": payload["sub"], "edge_mesh": True&#125;</div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="resync-footer">
          <button className="btn btn-ghost btn-sm flex-1" onClick={() => setResyncModalOpen(false)}>
            Review Later
          </button>
          <button
            className={`btn btn-primary btn-sm flex-2 ${isMerged ? 'btn-success' : ''}`}
            onClick={handleApplyMerge}
          >
            {isMerged ? <Check size={14} /> : <RefreshCw size={14} />}
            {isMerged ? 'Patch Applied to Workstation' : 'Approve & Apply Patch to Workstation'}
          </button>
        </div>

        <style>{`
          .resync-modal {
            max-height: 86vh;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(52, 211, 153, 0.25);
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 40px rgba(52, 211, 153, 0.1);
            background: #090c14;
          }
          .resync-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background: rgba(52, 211, 153, 0.06);
            border-bottom: 1px solid rgba(52, 211, 153, 0.18);
          }
          .resync-icon-badge {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(52, 211, 153, 0.15);
            border: 1px solid rgba(52, 211, 153, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .resync-info-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 18px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .resync-body {
            flex: 1;
            overflow-y: auto;
            padding: 14px 18px;
          }
          .resync-file-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
          }
          .diff-tag {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: var(--font-mono);
          }
          .diff-tag.add { background: rgba(52, 211, 153, 0.15); color: var(--green-bright); }
          .diff-tag.del { background: rgba(244, 63, 94, 0.15); color: var(--red); }
          .diff-preview-box {
            background: #04060a;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 12px;
            font-family: var(--font-mono);
            font-size: 10.5px;
            line-height: 1.5;
            overflow-x: auto;
          }
          .diff-line { padding: 1px 4px; border-radius: 3px; }
          .diff-line.unchanged { color: #64748b; }
          .diff-line.added { background: rgba(52, 211, 153, 0.15); color: #34d399; }
          .diff-line.deleted { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
          .resync-footer {
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
