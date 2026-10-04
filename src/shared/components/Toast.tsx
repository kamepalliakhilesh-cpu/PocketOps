import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastType, ToastItem } from '../types';
import { uid } from '../utils';

/* ---------- Toast ---------- */
interface ToastCtx {
  show: (msg: string, type?: ToastType) => void;
}
const TCtx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = uid();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3400);
  }, []);

  return (
    <TCtx.Provider value={{ show }}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'ai' ? '✦' : 'ℹ'}
            </span>
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        .toast-viewport {
          position: fixed;
          bottom: calc(var(--nav-height) + 20px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          width: calc(100% - 40px);
          max-width: 370px;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: rgba(20, 20, 40, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          pointer-events: auto;
        }
        .toast-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          flex-shrink: 0;
        }
        .toast-success .toast-icon { background: rgba(52,211,153,0.2); color: #34d399; }
        .toast-error .toast-icon { background: rgba(248,113,113,0.2); color: #f87171; }
        .toast-ai .toast-icon { background: rgba(124,58,237,0.25); color: #a78bfa; }
        .toast-info .toast-icon { background: rgba(34,211,238,0.15); color: #22d3ee; }
        .toast-success { border-left: 3px solid #34d399; }
        .toast-error { border-left: 3px solid #f87171; }
        .toast-ai { border-left: 3px solid #8b5cf6; }
        .toast-info { border-left: 3px solid #22d3ee; }
        @media (min-width: 500px) {
          .toast-viewport { bottom: 40px; }
        }
      `}</style>
    </TCtx.Provider>
  );
}

export function useToast(): ToastCtx {
  const c = useContext(TCtx);
  if (!c) throw new Error('useToast must be inside ToastProvider');
  return c;
}
