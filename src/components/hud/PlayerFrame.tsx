/**
 * Etheria Chronicles - Player Status HUD Frame
 */

import React from 'react';
import { DerivedStats, PlayerProfile } from '../../game/types';

interface PlayerFrameProps {
  profile: PlayerProfile;
  derived: DerivedStats;
  onOpenCharacter: () => void;
}

export const PlayerFrame: React.FC<PlayerFrameProps> = ({ profile, derived, onOpenCharacter }) => {
  const hpPct = Math.max(0, Math.min(100, (profile.currentHp / derived.maxHp) * 100));
  const mpPct = Math.max(0, Math.min(100, (profile.currentMp / derived.maxMp) * 100));
  const expPct = Math.max(0, Math.min(100, (profile.currentExp / profile.expToNextLevel) * 100));

  return (
    <div className="flex items-start gap-3 pointer-events-auto">
      {/* Avatar & Level Badge */}
      <button
        onClick={onOpenCharacter}
        title="Click to open Character Status (C)"
        className="relative group p-1 bg-slate-900/90 border-2 border-amber-600/70 hover:border-amber-400 rounded-lg shadow-lg cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-2xl select-none">
          {profile.job === 'warrior' ? '⚔️' : profile.job === 'mage' ? '🔮' : profile.job === 'archer' ? '🏹' : profile.job === 'acolyte' ? '✨' : '🗡️'}
        </div>
        <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 font-bold text-xs px-1.5 py-0.5 rounded font-mono border border-slate-900 shadow">
          {profile.level}
        </span>
        {profile.statPoints > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
            +{profile.statPoints}
          </span>
        )}
      </button>

      {/* Bars Cluster */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 shadow-xl w-60 backdrop-blur-xs">
        {/* Name & Job */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-sm text-slate-100 truncate">{profile.customization.name}</span>
          <span className="text-xs text-amber-400 capitalize font-medium">{profile.job}</span>
        </div>

        {/* HP Bar */}
        <div className="mb-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5 tabular-nums">
            <span className="text-emerald-400 font-bold">HP</span>
            <span>{profile.currentHp} / {derived.maxHp}</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-xs overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-xs transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* MP Bar */}
        <div className="mb-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5 tabular-nums">
            <span className="text-sky-400 font-bold">MP</span>
            <span>{profile.currentMp} / {derived.maxMp}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-xs overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-linear-to-r from-sky-600 to-sky-400 rounded-xs transition-all duration-150"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>

        {/* EXP Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5 tabular-nums">
            <span className="text-amber-400 font-semibold">EXP</span>
            <span>{expPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-xs overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-amber-400 rounded-xs transition-all duration-200"
              style={{ width: `${expPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
