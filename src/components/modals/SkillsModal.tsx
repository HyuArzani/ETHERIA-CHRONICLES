/**
 * Etheria Chronicles - Skills & Job System Modal
 */

import React, { useState } from 'react';
import { SKILL_CATALOG } from '../../game/data/skills';
import { JobClass, PlayerProfile } from '../../game/types';

interface SkillsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const SkillsModal: React.FC<SkillsModalProps> = ({ profile, onClose }) => {
  const [selectedJobTab, setSelectedJobTab] = useState<JobClass>(profile.job);

  const skillsList = Object.values(SKILL_CATALOG).filter((s) => s.job === selectedJobTab);

  const jobDescriptions: Record<JobClass, { title: string; desc: string; icon: string }> = {
    novice: {
      title: 'Novice Class',
      desc: 'The beginning path for all Etherian adventurers. Balanced stats, basic strikes, spark bolts, and first aid.',
      icon: '🗡️',
    },
    warrior: {
      title: 'Warrior (1st Class)',
      desc: 'Frontline physical specialist with unmatched durability, high DEF, heavy strike attacks, and defensive iron will.',
      icon: '⚔️',
    },
    mage: {
      title: 'Mage (1st Class)',
      desc: 'Master of elemental mana. High INT scaling, arcane burst spells, frost novas, and battlefield control.',
      icon: '🔮',
    },
    archer: {
      title: 'Archer (1st Class)',
      desc: 'Deadly ranged marksman. Scales heavily with DEX and AGI, precision double-strafe volleys, and high critical hit rates.',
      icon: '🏹',
    },
    acolyte: {
      title: 'Acolyte (1st Class)',
      desc: 'Divine servant of Etheria. Healing miracles, defensive blessings, and holy light magic against corrupted foes.',
      icon: '✨',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Skills & Job Progression
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
          {/* Job Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            {(['novice', 'warrior', 'mage', 'archer', 'acolyte'] as const).map((job) => (
              <button
                key={job}
                onClick={() => setSelectedJobTab(job)}
                className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold capitalize transition-all cursor-pointer ${selectedJobTab === job ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {jobDescriptions[job].icon} {job}
              </button>
            ))}
          </div>

          {/* Job Overview Card */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="text-3xl">{jobDescriptions[selectedJobTab].icon}</span>
            <div>
              <h3 className="font-bold text-sm text-slate-100 mb-0.5">
                {jobDescriptions[selectedJobTab].title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {jobDescriptions[selectedJobTab].desc}
              </p>
              {selectedJobTab !== 'novice' && (
                <span className="inline-block mt-2 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                  Advancement Requirement: Level 10 + Speak with Job Instructor Thorne in Dawnshire
                </span>
              )}
            </div>
          </div>

          {/* Skills Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Job Abilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {skillsList.map((skill) => {
                const isLearned = profile.learnedSkills[skill.id] !== undefined;

                return (
                  <div
                    key={skill.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isLearned ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-950/40 border-slate-800/60 opacity-60'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                      {skill.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-100 truncate">{skill.name}</span>
                        <span className="text-[10px] font-mono text-sky-400">{skill.mpCost} MP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>CD: {skill.cooldown}s</span>
                        <span>Range: {skill.range || 'Self'}</span>
                        <span>Req: Lv.{skill.levelReq}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
