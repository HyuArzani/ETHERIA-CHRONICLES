/**
 * Etheria Chronicles - Character Status & Stat Distribution Modal
 */

import React from 'react';
import { gameState } from '../../game/state/GameState';
import { DerivedStats, PlayerProfile } from '../../game/types';

interface CharacterModalProps {
  profile: PlayerProfile;
  derived: DerivedStats;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ profile, derived, onClose }) => {
  const statsList: { key: keyof PlayerProfile['baseStats']; label: string; desc: string }[] = [
    { key: 'str', label: 'STR (Strength)', desc: '+2.2 Physical ATK & weapon scaling' },
    { key: 'agi', label: 'AGI (Agility)', desc: '+Attack Speed (ASPD) & Evasion (FLEE)' },
    { key: 'vit', label: 'VIT (Vitality)', desc: '+16 Max HP, +0.7 DEF & HP Recovery' },
    { key: 'int', label: 'INT (Intelligence)', desc: '+3.0 Magic ATK (MATK) & +12 Max MP' },
    { key: 'dex', label: 'DEX (Dexterity)', desc: '+Accuracy (HIT), Ranged ATK & Min Dmg' },
    { key: 'luk', label: 'LUK (Luck)', desc: '+0.35% Crit Rate & Rare Drop Luck' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Character Status
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
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Top Identity Card */}
          <div className="flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <div className="w-14 h-14 bg-slate-900 border border-amber-500/60 rounded-lg flex items-center justify-center text-3xl">
              {profile.job === 'warrior' ? '⚔️' : profile.job === 'mage' ? '🔮' : profile.job === 'archer' ? '🏹' : profile.job === 'acolyte' ? '✨' : '🗡️'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-slate-100">{profile.customization.name}</span>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {profile.job}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Base Lv. <b className="text-slate-200">{profile.level}</b></span>
                <span>Job Lv. <b className="text-slate-200">{profile.jobLevel}</b></span>
                <span>EXP: <b className="text-slate-200 tabular-nums">{profile.currentExp} / {profile.expToNextLevel}</b></span>
              </div>
            </div>
          </div>

          {/* Stat Points Banner */}
          <div className="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-300">Remaining Stat Points</span>
            <span className="font-mono font-bold text-sm text-amber-400 tabular-nums">
              {profile.statPoints} pts
            </span>
          </div>

          {/* Base Stats Distribution */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Primary Attributes
            </h3>
            <div className="space-y-1.5">
              {statsList.map((stat) => (
                <div
                  key={stat.key}
                  className="flex items-center justify-between p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded border border-slate-700/40 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{stat.label}</span>
                    <span className="text-[10px] text-slate-400">{stat.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100 w-8 text-right tabular-nums">
                      {profile.baseStats[stat.key]}
                    </span>
                    <button
                      onClick={() => gameState.allocateStat(stat.key)}
                      disabled={profile.statPoints <= 0}
                      className="w-6 h-6 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center cursor-pointer transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derived Combat Outcomes */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Combat Parameters
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Max HP</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">{derived.maxHp}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Max MP</span>
                <span className="font-mono text-sky-400 font-bold tabular-nums">{derived.maxMp}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Physical ATK</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">{derived.atk}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Magic ATK</span>
                <span className="font-mono text-purple-400 font-bold tabular-nums">{derived.matk}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Physical DEF</span>
                <span className="font-mono text-slate-200 font-bold tabular-nums">{derived.def}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Magic DEF</span>
                <span className="font-mono text-slate-200 font-bold tabular-nums">{derived.mdef}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Accuracy (HIT)</span>
                <span className="font-mono text-slate-200 font-bold tabular-nums">{derived.hit}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Evasion (FLEE)</span>
                <span className="font-mono text-slate-200 font-bold tabular-nums">{derived.flee}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Critical Rate</span>
                <span className="font-mono text-amber-300 font-bold tabular-nums">{derived.critRate}%</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Attack Cadence</span>
                <span className="font-mono text-slate-200 font-bold tabular-nums">{derived.aspd.toFixed(2)}/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
