/**
 * Etheria Chronicles - Quest Log Modal
 */

import React, { useState } from 'react';
import { ITEM_CATALOG } from '../../game/data/items';
import { QUEST_CATALOG } from '../../game/data/quests';
import { gameState } from '../../game/state/GameState';
import { PlayerProfile } from '../../game/types';

interface QuestLogModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const QuestLogModal: React.FC<QuestLogModalProps> = ({ profile, onClose }) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>('quest_mosslings');

  const allQuests = Object.values(QUEST_CATALOG);
  const activeQuest = QUEST_CATALOG[selectedQuestId] || allQuests[0];
  const progress = profile.quests[activeQuest.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Quest Journal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Split: Quest List Left, Details Right */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quest List */}
          <div className="space-y-1.5 md:col-span-1 border-r border-slate-800 pr-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Available Quests
            </h3>
            {allQuests.map((q) => {
              const qProg = profile.quests[q.id];
              const isSelected = selectedQuestId === q.id;

              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestId(q.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-amber-400 bg-amber-950/20 text-white' : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold truncate">
                    <span className="truncate">{q.title}</span>
                    {qProg?.turnedIn ? (
                      <span className="text-[10px] text-slate-500 font-normal">Done</span>
                    ) : qProg?.completed ? (
                      <span className="text-[10px] text-emerald-400 font-bold">Turn In</span>
                    ) : qProg ? (
                      <span className="text-[10px] text-amber-400 font-normal">Active</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Lv.{q.levelReq}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">{q.giverName}</span>
                </button>
              );
            })}
          </div>

          {/* Quest Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-slate-100">{activeQuest.title}</h3>
                <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono">
                  Req. Lv.{activeQuest.levelReq}
                </span>
              </div>
              <span className="text-xs text-slate-400 block mb-2">
                Quest Giver: <b className="text-slate-200">{activeQuest.giverName}</b>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {activeQuest.description}
              </p>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Objectives
              </h4>
              <div className="space-y-1.5">
                {activeQuest.requirements.map((req, idx) => {
                  const current = progress ? progress.currentCounts[req.targetId] || 0 : 0;
                  const isDone = current >= req.required;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{isDone ? '✅' : '⚪'}</span>
                        <span className={isDone ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {req.type === 'kill' ? 'Defeat' : 'Collect'} {req.targetName}
                        </span>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-amber-400 font-bold">
                        {Math.min(current, req.required)} / {req.required}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Rewards
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-sky-950/60 border border-sky-800 text-sky-300 px-2.5 py-1 rounded font-mono font-bold">
                  +{activeQuest.reward.exp} EXP
                </span>
                <span className="bg-amber-950/60 border border-amber-800 text-amber-300 px-2.5 py-1 rounded font-mono font-bold">
                  🪙 {activeQuest.reward.gold} Gold
                </span>
                {activeQuest.reward.items?.map((rew, i) => {
                  const def = ITEM_CATALOG[rew.itemId];
                  return (
                    <span
                      key={i}
                      className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>{def?.icon}</span>
                      <span>{def?.name} x{rew.quantity}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Accept / Turn In Button */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              {!progress ? (
                <button
                  onClick={() => gameState.acceptQuest(activeQuest.id)}
                  disabled={profile.level < activeQuest.levelReq}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded cursor-pointer transition-colors"
                >
                  Accept Quest
                </button>
              ) : progress.turnedIn ? (
                <span className="text-xs text-slate-500 font-medium">Quest Completed & Turned In</span>
              ) : progress.completed ? (
                <button
                  onClick={() => gameState.completeQuest(activeQuest.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer transition-colors animate-pulse"
                >
                  Turn In & Claim Rewards
                </button>
              ) : (
                <span className="text-xs text-amber-400 font-medium">In Progress...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
