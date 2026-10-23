/**
 * Etheria Chronicles - Target Status Frame HUD
 */

import React from 'react';
import { ActiveMonster, MonsterTemplate } from '../../game/types';

interface TargetFrameProps {
  monster: ActiveMonster | null;
  template: MonsterTemplate | null;
  onClearTarget: () => void;
}

export const TargetFrame: React.FC<TargetFrameProps> = ({ monster, template, onClearTarget }) => {
  if (!monster) return null;

  const maxHp = template?.maxHp || monster.maxHp;
  const hpPct = Math.max(0, Math.min(100, (monster.hp / maxHp) * 100));
  const isBoss = template?.isBoss;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 shadow-xl w-64 backdrop-blur-xs pointer-events-auto">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-1 py-0.5 rounded">
            Lv.{monster.level}
          </span>
          <span className="font-semibold text-sm text-slate-100 truncate">
            {monster.name}
          </span>
        </div>
        <button
          onClick={onClearTarget}
          className="text-slate-400 hover:text-slate-200 text-xs px-1 cursor-pointer"
          title="Clear Target"
        >
          ✕
        </button>
      </div>

      {/* Target HP Bar */}
      <div>
        <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5 tabular-nums">
          <span className="text-red-400 font-bold">HP</span>
          <span>{monster.hp} / {maxHp}</span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-xs overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-xs transition-all duration-150 ${isBoss ? 'bg-linear-to-r from-amber-600 to-amber-400' : 'bg-linear-to-r from-red-600 to-red-400'}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {isBoss && (
        <div className="mt-1 text-center">
          <span className="text-[10px] text-amber-300 font-bold tracking-wider uppercase">
            ★ Elite Boss Encounter ★
          </span>
        </div>
      )}
    </div>
  );
};
