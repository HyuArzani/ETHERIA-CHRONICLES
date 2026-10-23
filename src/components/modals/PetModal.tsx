/**
 * Etheria Chronicles - Pet Companion Modal
 */

import React from 'react';
import { gameState } from '../../game/state/GameState';
import { PlayerProfile } from '../../game/types';

interface PetModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const PetModal: React.FC<PetModalProps> = ({ profile, onClose }) => {
  const pet = profile.activePet;

  const petTreats = profile.inventory
    .filter((i) => i.itemId === 'pet_treat')
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Companion Sanctuary
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
        <div className="p-4 space-y-4">
          {pet ? (
            <>
              {/* Pet Showcase Card */}
              <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                  🌱
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-100">{pet.name}</h3>
                    <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                      Lv.{pet.level}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize block mt-0.5">
                    Species: Sproutling
                  </span>
                  <span className="text-xs text-amber-300 font-semibold block mt-1">
                    Bonus: {pet.bonusDesc}
                  </span>
                </div>
              </div>

              {/* Loyalty Meter */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Loyalty & Affection</span>
                    <span className="font-mono text-pink-400 font-bold">{pet.loyalty} / 100</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-linear-to-r from-pink-500 to-rose-400 rounded-full transition-all"
                      style={{ width: `${pet.loyalty}%` }}
                    />
                  </div>
                </div>

                {/* Pet EXP */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Pet EXP</span>
                    <span className="font-mono text-emerald-400 font-bold">{pet.exp} / {pet.maxExp}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${(pet.exp / pet.maxExp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => gameState.togglePetSummon()}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer transition-colors border ${pet.active ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400'}`}
                >
                  {pet.active ? 'Dismiss Companion' : 'Summon Companion'}
                </button>

                <button
                  onClick={() => gameState.useConsumable('pet_treat')}
                  disabled={petTreats <= 0}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-colors border border-amber-400 flex items-center justify-center gap-1.5"
                >
                  <span>Feed Cookie</span>
                  <span className="font-mono text-[11px]">({petTreats})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl block">🥚</span>
              <h3 className="font-bold text-sm text-slate-200">No Companion Hatched Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Visit <b>Pet Handler Mimi</b> in Dawnshire Village or hunt rare monsters in Verdant Fields to discover a Sproutling Pet Egg!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
