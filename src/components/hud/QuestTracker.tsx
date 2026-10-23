/**
 * Etheria Chronicles - Floating Quest Tracker HUD
 */

import React from 'react';
import { QUEST_CATALOG } from '../../game/data/quests';
import { PlayerProfile } from '../../game/types';

interface QuestTrackerProps {
  profile: PlayerProfile;
  onOpenQuests: () => void;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ profile, onOpenQuests }) => {
  const activeQuests = Object.values(profile.quests).filter((q) => !q.turnedIn);

  if (activeQuests.length === 0) return null;

  return (
    <div className="w-56 bg-slate-900/85 border border-slate-700/80 rounded-lg p-2.5 shadow-xl backdrop-blur-xs pointer-events-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
          Active Quests
        </span>
        <button
          onClick={onOpenQuests}
          className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          View All [L]
        </button>
      </div>

      <div className="space-y-2.5">
        {activeQuests.map((qProg) => {
          const qDef = QUEST_CATALOG[qProg.questId];
          if (!qDef) return null;

          return (
            <div key={qProg.questId} className="text-xs">
              <div className="flex items-center justify-between mb-1 font-semibold text-slate-200 truncate">
                <span className="truncate">{qDef.title}</span>
                {qProg.completed && (
                  <span className="text-[10px] text-emerald-400 font-bold ml-1">READY</span>
                )}
              </div>

              <div className="space-y-0.5 text-[11px] text-slate-400 pl-1">
                {qDef.requirements.map((req, idx) => {
                  const current = qProg.currentCounts[req.targetId] || 0;
                  const isDone = current >= req.required;

                  return (
                    <div key={idx} className="flex items-center justify-between tabular-nums">
                      <span className={isDone ? 'text-emerald-400 line-through' : 'text-slate-300'}>
                        {req.targetName}
                      </span>
                      <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {Math.min(current, req.required)} / {req.required}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
