/**
 * Etheria Chronicles - Persistence & Save Management Modal
 */

import React, { useState } from 'react';
import { gameState } from '../../game/state/GameState';

interface SaveModalProps {
  onClose: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleExport = () => {
    const json = gameState.exportSaveJson();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setStatusMsg('Save data copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = gameState.importSaveJson(importText.trim());
    if (success) {
      setStatusMsg('Save data imported successfully!');
      setTimeout(() => onClose(), 1200);
    } else {
      setStatusMsg('Failed to parse save JSON. Check format.');
    }
  };

  const handleReset = () => {
    gameState.resetProgress();
    setConfirmReset(false);
    setStatusMsg('Progress reset to new character!');
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Save & Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          <div className="bg-emerald-950/30 border border-emerald-800/60 p-3 rounded-lg flex items-center gap-2">
            <span className="text-emerald-400 text-lg">💾</span>
            <div className="text-slate-300">
              <b className="text-emerald-300 block">Auto-Save Active</b>
              Your character stats, gear, quests, and inventory are saved in browser storage.
            </div>
          </div>

          {statusMsg && (
            <div className="p-2 rounded bg-amber-950/50 border border-amber-800 text-amber-300 font-medium text-center">
              {statusMsg}
            </div>
          )}

          {/* Export Save Data */}
          <div>
            <h4 className="font-bold text-slate-300 mb-1">Export Save Data</h4>
            <p className="text-slate-400 mb-2">
              Back up your character or transfer to another browser tab:
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy Save JSON to Clipboard'}
            </button>
          </div>

          {/* Import Save Data */}
          <div>
            <h4 className="font-bold text-slate-300 mb-1">Import Save Data</h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste save JSON string here..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="mt-1.5 w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
            >
              Load Imported Character
            </button>
          </div>

          {/* Danger Zone: Reset */}
          <div className="pt-2 border-t border-slate-800">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                Reset Character Progress
              </button>
            ) : (
              <div className="space-y-2 p-2 bg-red-950/60 border border-red-800 rounded-lg text-center">
                <span className="text-red-200 font-bold block">Are you sure? This cannot be undone!</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
