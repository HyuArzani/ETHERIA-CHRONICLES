/**
 * Etheria Chronicles - Help & Controls Modal
 */

import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Adventurer's Tome & Controls
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
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Keybindings Grid */}
          <div>
            <h3 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
              Keyboard Controls
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Move Character</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  WASD / Arrows
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Basic Attack</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  Space / Click
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Skills Hotbar</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  1 · 2 · 3 · 4
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>HP / MP Potions</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  Q (HP) · E (MP)
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Interact & Loot</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  F / Click
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Cycle Nearest Target</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  TAB
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Status & Stats</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  C
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
                <span>Inventory & Bag</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                  I
                </span>
              </div>
            </div>
          </div>

          {/* Gameplay Loop & Progression Guide */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider">
              Game Progression Loop
            </h3>
            <div className="space-y-2 text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <p>
                <b>1. Start in Dawnshire:</b> Talk to <b>Elder Althea</b> and <b>Pet Handler Mimi</b> for your first quests. Practice your attacks on the straw <b>Training Dummy</b> to see your damage numbers and test your skills.
              </p>
              <p>
                <b>2. Explore Verdant Fields:</b> Step through the eastern portal to fight <b>Mosslings</b>, bouncy <b>Gooey Sproutlings</b>, and armored <b>Thornback Beetles</b>. Collect medicinal herbs and mine shiny copper nodes.
              </p>
              <p>
                <b>3. Gear Up:</b> Pick up physical item drops (glowing bags on the ground) by pressing <b>F</b> or clicking them. Equip rare dropped weapons and shields or sell excess loot to <b>Blacksmith Roger</b> for Gold.
              </p>
              <p>
                <b>4. Job Advancement:</b> Reach <b>Level 10</b> by grinding and completing bounties. Return to Dawnshire Village and speak with <b>Instructor Thorne</b> to choose your 1st Class path: <b>Warrior</b>, <b>Mage</b>, <b>Archer</b>, or <b>Acolyte</b>!
              </p>
              <p>
                <b>5. Whisperwood Boss Raid:</b> Journey into Whisperwood Forest and confront the legendary <b>Ancient Rootbeast</b>. Dodge its ground smash telegraphs and claim epic weapons like the <b>Ancient Briar Greatsword</b>!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
