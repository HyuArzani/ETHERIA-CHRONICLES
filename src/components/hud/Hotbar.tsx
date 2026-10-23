/**
 * Etheria Chronicles - Combat Action Hotbar HUD
 */

import React from 'react';
import { SKILL_CATALOG } from '../../game/data/skills';
import { gameState } from '../../game/state/GameState';
import { PlayerProfile } from '../../game/types';

interface HotbarProps {
  profile: PlayerProfile;
  onUseSkill: (slotIndex: number) => void;
  onUsePotion: (type: 'red_potion' | 'blue_potion') => void;
  onBasicAttack: () => void;
  onInteract: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  profile,
  onUseSkill,
  onUsePotion,
  onBasicAttack,
  onInteract,
}) => {
  const redPotions = profile.inventory
    .filter((i) => i.itemId === 'red_potion')
    .reduce((sum, i) => sum + i.quantity, 0);

  const bluePotions = profile.inventory
    .filter((i) => i.itemId === 'blue_potion')
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2 rounded-xl shadow-2xl backdrop-blur-xs pointer-events-auto">
      {/* Skill Slots 1-4 */}
      <div className="flex items-center gap-1.5">
        {profile.hotbar.map((skillId, idx) => {
          const skill = skillId ? SKILL_CATALOG[skillId] : null;
          return (
            <button
              key={idx}
              onClick={() => onUseSkill(idx)}
              title={skill ? `${skill.name} (${skill.mpCost} MP) [Key: ${idx + 1}]\n${skill.description}` : 'Empty Slot'}
              className="relative w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 active:scale-95 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <span className="text-xl select-none group-hover:scale-110 transition-transform">
                {skill?.icon || '•'}
              </span>
              <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold text-amber-400">
                {idx + 1}
              </span>
              {skill && skill.mpCost > 0 && (
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-sky-300">
                  {skill.mpCost}m
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="h-8 w-px bg-slate-700" />

      {/* Potion Slots Q & E */}
      <div className="flex items-center gap-1.5">
        {/* Red Potion */}
        <button
          onClick={() => onUsePotion('red_potion')}
          title="Drink Red Potion [Q] - Restores 90 HP"
          className="relative w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-red-900/60 active:scale-95 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          <span className="text-xl select-none">🧪</span>
          <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold text-red-400">
            Q
          </span>
          <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-slate-200">
            {redPotions}
          </span>
        </button>

        {/* Blue Potion */}
        <button
          onClick={() => onUsePotion('blue_potion')}
          title="Drink Blue Potion [E] - Restores 60 MP"
          className="relative w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-sky-900/60 active:scale-95 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          <span className="text-xl select-none">🧴</span>
          <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold text-sky-400">
            E
          </span>
          <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-slate-200">
            {bluePotions}
          </span>
        </button>
      </div>

      <div className="h-8 w-px bg-slate-700" />

      {/* Basic Attack & Interact */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onBasicAttack}
          title="Basic Strike [Spacebar]"
          className="relative px-3 h-12 bg-amber-700/80 hover:bg-amber-600 border border-amber-500 active:scale-95 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          <span className="text-base font-bold text-white leading-none">ATTACK</span>
          <span className="text-[10px] font-mono text-amber-200 mt-0.5">Space</span>
        </button>

        <button
          onClick={onInteract}
          title="Interact / Loot [F]"
          className="relative px-2.5 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 active:scale-95 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          <span className="text-base leading-none">🖐️</span>
          <span className="text-[10px] font-mono text-slate-300 mt-0.5">F</span>
        </button>
      </div>
    </div>
  );
};
