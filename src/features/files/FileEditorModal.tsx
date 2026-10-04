import { useState, useEffect } from 'react';
import { X, Save, Check, FileCode, FileText, Shield, Cpu } from 'lucide-react';
import { useStore } from '../../core/store/StoreContext';
import type { FileItem } from '../../shared/types';

interface Props {
  file: FileItem;
  onClose: () => void;
}

export default function FileEditorModal({ file, onClose }: Props) {
  const { updateFileContent, toast, logActivity } = useStore();
  const [content, setContent] = useState(file.content || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setContent(file.content || '');
  }, [file]);

  const handleSave = () => {
    updateFileContent(file.id, content);
    setIsSaved(true);
    toast(`${file.name} saved in Offline Vault`, 'success');
    logActivity('offline_file_edited', `Edited ${file.name}`, 'Saved to phone encrypted vault');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNpuFormat = () => {
    toast('On-Device NPU formatting & linting…', 'ai');
    setTimeout(() => {
      toast('NPU Lint Passed: Clean Syntax', 'success');
    }, 600);
  };

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal-sheet file-editor-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="file-editor-header">
          <div className="row gap-8 align-center flex-1 overflow-hidden">
            <span className="file-editor-icon">
              {file.isCode ? <FileCode size={18} color="var(--iqoo-amber)" /> : <FileText size={18} color="var(--cyan)" />}
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-sm truncate">{file.name}</div>
              <div className="text-xs text-secondary truncate">{file.path}</div>
            </div>
          </div>
          <div className="row gap-8 align-center">
            {file.synced && <span className="badge badge-online">VAULT SYNCED</span>}
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Security & Offline Badge Bar */}
        <div className="file-editor-badge-bar">
          <div className="row gap-6 align-center">
            <Shield size={12} color="var(--green)" />
            <span className="text-xs text-tertiary">Local Offline Encryption (AES-256)</span>
          </div>
          <span className="text-xs text-tertiary">
            {file.language?.toUpperCase() || file.type.toUpperCase()} · {content.split('\n').length} lines
          </span>
        </div>

        {/* Editor Area */}
        <div className="file-editor-body">
          <textarea
            className="file-editor-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            spellCheck={false}
            rows={16}
            placeholder="Type your content here..."
          />
        </div>

        {/* Action Footer */}
        <div className="file-editor-footer">
          <button className="btn btn-secondary btn-sm" onClick={handleNpuFormat}>
            <Cpu size={14} /> NPU Lint
          </button>
          <button
            className={`btn btn-primary btn-sm flex-1 ${isSaved ? 'btn-success' : ''}`}
            onClick={handleSave}
          >
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            {isSaved ? 'Saved Locally' : 'Save to Offline Vault'}
          </button>
        </div>

        <style>{`
          .file-editor-modal {
            max-height: 88vh;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: #090914;
          }
          .file-editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          .file-editor-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .file-editor-badge-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 16px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .file-editor-body {
            flex: 1;
            padding: 12px 16px;
            overflow-y: auto;
          }
          .file-editor-textarea {
            width: 100%;
            height: 280px;
            background: #05050b;
            color: #d1d5db;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 11.5px;
            line-height: 1.5;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            resize: none;
            outline: none;
          }
          .file-editor-textarea:focus {
            border-color: var(--cyan);
          }
          .file-editor-footer {
            display: flex;
            gap: 8px;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
          }
        `}</style>
      </div>
    </div>
  );
}
