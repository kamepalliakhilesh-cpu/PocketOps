import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Camera, RotateCcw, CheckCircle2, Shield, Eye, AlertTriangle, Zap } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import { aiProvider } from '../../core/ai/LLMProvider';

type Phase = 'live' | 'captured' | 'analyzing' | 'result';

export default function CameraScreen() {
  const { wfId, stepId } = useParams<{ wfId: string; stepId: string }>();
  const nav = useNavigate();
  const { state, completeStep, toast, logActivity } = useStore();
  const [phase, setPhase] = useState<Phase>('live');
  const [captured, setCaptured] = useState<string | null>(null);
  const [observation, setObservation] = useState<{ observation: string; confidence: string; metrics: Record<string, string> } | null>(null);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const wf = state.workflows.find(w => w.id === wfId);
  const step = wf?.steps.find(s => s.id === (stepId ?? ''));
  const cameraAllowed = state.settings.cameraPermission;
  const routeValid = Boolean(wf && step);
  const backTo = wf ? `/workflow-run/${wf.id}` : '/workflows';

  const attachStream = () => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => { /* autoplay blocked — user can still capture after interaction */ });
    }
  };

  useEffect(() => {
    if (!routeValid || !cameraAllowed) return;
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        /* stop immediately if the user left before permission was granted */
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        attachStream();
      })
      .catch(() => { /* permission denied — simulated feed is fine for prototype */ });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeValid, cameraAllowed]);

  /* re-attach the live stream when returning from captured/retake */
  useEffect(() => {
    if (phase === 'live') attachStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const capture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    const canvas = canvasRef.current;
    if (canvas && videoRef.current && videoRef.current.videoWidth) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCaptured(canvas.toDataURL('image/jpeg', 0.8));
    } else {
      /* Simulated capture gradient for demo */
      setCaptured('simulated');
    }
    setPhase('captured');
    logActivity('camera_captured', 'Image captured', step?.title || 'Evidence capture');
  };

  const analyze = async () => {
    setPhase('analyzing');
    try {
      const result = await aiProvider.interpretImage('machine-surface');
      if (result.valid && result.data) {
        setObservation(result.data);
        setPhase('result');
      } else {
        toast('AI analysis unavailable', 'error');
        setPhase('captured');
      }
    } catch {
      toast('AI analysis unavailable', 'error');
      setPhase('captured');
    }
  };

  const confirm = () => {
    if (wf && step) {
      completeStep(wf.id, step.id);
      toast('Evidence confirmed — step completed', 'success');
      nav(`/workflow-run/${wf.id}`);
    } else {
      nav('/workflows');
    }
  };

  /* Invalid deep link — never a dead end (nav(-1) can be a no-op with no history). */
  if (!routeValid) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07070e', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="empty-state">
          <div className="empty-icon"><AlertTriangle size={24} /></div>
          <h3>Camera step not found</h3>
          <p>This camera step may have been removed, or the link is invalid.</p>
          <button className="btn btn-primary mt-16" onClick={() => nav('/workflows')}>Back to workflows</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', zIndex: 10 }}>
        <button className="icon-btn" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }} onClick={() => nav(backTo)} aria-label="Close camera">
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold" style={{ color: '#fff' }}>{wf?.name || 'Camera'}</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{step?.title || 'Capture evidence'}</div>
        </div>
        <span className="badge badge-info" style={{ background: 'rgba(34,211,238,0.2)' }}>
          {phase === 'live' ? 'LIVE' : phase === 'analyzing' ? 'ANALYZING' : 'REVIEW'}
        </span>
      </div>

      {/* Viewfinder / preview */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Viewfinder overlay (live) */}
        {phase === 'live' && (
          <>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Simulated feed fallback background */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: -1,
              background: 'linear-gradient(145deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <Camera size={48} />
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  {cameraAllowed ? 'Camera preview' : 'Simulated feed — camera permission denied'}
                </div>
              </div>
            </div>
            {/* Crosshair */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{ width: 200, height: 200, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 8, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTop: '3px solid var(--cyan)', borderLeft: '3px solid var(--cyan)' }} />
                <span style={{ position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTop: '3px solid var(--cyan)', borderRight: '3px solid var(--cyan)' }} />
                <span style={{ position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottom: '3px solid var(--cyan)', borderLeft: '3px solid var(--cyan)' }} />
                <span style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottom: '3px solid var(--cyan)', borderRight: '3px solid var(--cyan)' }} />
              </div>
            </div>
          </>
        )}

        {/* Captured preview */}
        {phase === 'captured' && captured && (
          <div style={{ width: '100%', height: '100%', background: captured === 'simulated'
            ? 'linear-gradient(145deg, #1a1a2e, #16213e)'
            : undefined,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {captured !== 'simulated' && (
              <img src={captured} alt="Captured evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {captured === 'simulated' && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <Camera size={48} />
                <div style={{ fontSize: 13, marginTop: 8 }}>Captured image</div>
              </div>
            )}
          </div>
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div className="ai-orb" style={{ width: 72, height: 72 }} />
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Analyzing image…</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Running vision model locally</div>
            <div style={{ width: 160, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--cyan))', borderRadius: 999, animation: 'shimmer 1.2s ease infinite', width: '60%' }} />
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && observation && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'auto', padding: 20, background: 'rgba(7,7,14,0.95)' }}>
            <div className="fade-in-up">
              <div className="row gap-8 mb-16">
                <Eye size={18} color="var(--purple-bright)" />
                <div className="section-heading">AI Observation</div>
                <span className="badge badge-ai">AI interpretation</span>
              </div>

              <div className="card mb-16" style={{ borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.06)' }}>
                <div className="row gap-8 mb-8">
                  <AlertTriangle size={16} color="var(--orange)" />
                  <span className="text-sm font-bold" style={{ color: 'var(--orange)' }}>{observation.observation}</span>
                </div>
                <div className="text-xs text-tertiary">Confidence: {observation.confidence}</div>
                <div className="text-xs text-tertiary mt-4">This is an AI interpretation, not a verified measurement.</div>
              </div>

              <div className="section-label">Measured Data</div>
              <div className="col gap-8 mb-16">
                {Object.entries(observation.metrics).map(([k, v], i) => (
                  <div key={k} className="card row-between" style={{ padding: '10px 14px', animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}>
                    <span className="text-sm text-secondary">{k}</span>
                    <span className="text-sm font-bold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="section-label">User Confirmation</div>
              <div className="card mb-16" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
                <div className="text-xs text-secondary" style={{ lineHeight: 1.6 }}>
                  <strong>Required:</strong> Review the AI observation and confirm before this result is recorded in the workflow. AI output alone never completes a step.
                </div>
              </div>

              <div className="row gap-8 mb-24">
                <button className="btn btn-primary flex-1" onClick={confirm}>
                  <CheckCircle2 size={16} /> Confirm & Continue
                </button>
                <button className="btn btn-secondary" onClick={() => { setPhase('live'); setCaptured(null); setObservation(null); }}>
                  <RotateCcw size={16} /> Retake
                </button>
              </div>

              <div className="row gap-8 text-xs" style={{ color: 'var(--text-tertiary)', paddingBottom: 20 }}>
                <Shield size={14} />
                <span>PocketOps records confirmed observations only. AI interpretation is advisory.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flash overlay */}
      {flash && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 100, animation: 'fadeIn 0.1s ease, fadeOut 0.2s ease 0.1s forwards', pointerEvents: 'none' }} />
      )}

      {/* Bottom controls */}
      {(phase === 'live' || phase === 'captured') && (
        <div style={{ padding: '24px 32px 32px', display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', background: 'rgba(0,0,0,0.6)' }}>
          {phase === 'live' ? (
            <>
              <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => nav(backTo)}>
                Cancel
              </button>
              <button
                onClick={capture}
                aria-label="Capture image"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'transparent', border: '4px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 4,
                }}
              >
                <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', transition: 'all 0.1s' }} />
              </button>
              <div style={{ width: 60 }} />
            </>
          ) : (
            <>
              <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }} onClick={() => { setPhase('live'); setCaptured(null); }}>
                <RotateCcw size={16} /> Retake
              </button>
              <button className="btn btn-primary" onClick={analyze}>
                <Zap size={16} /> Analyze
              </button>
            </>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        .ai-orb {
          border-radius: 50%;
          background: conic-gradient(var(--purple), var(--cyan), var(--pink), var(--purple));
          animation: spin 2s linear infinite;
          position: relative;
        }
        .ai-orb::after {
          content: '';
          position: absolute; inset: 5px;
          background: rgba(7,7,14,0.95);
          border-radius: 50%;
        }
        @keyframes fadeOut { to { opacity: 0; } }
      `}</style>
    </div>
  );
}
