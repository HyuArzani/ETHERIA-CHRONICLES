/**
 * Etheria Chronicles - Top-Right Location & Menu Tray HUD
 */

import React, { useState } from 'react';
import { soundEffects } from '../../game/audio/SoundEffects';
import { MAPS } from '../../game/data/maps';
import { MapId, PlayerProfile } from '../../game/types';

interface LocationHeaderProps {
  currentMap: MapId;
  profile: PlayerProfile;
  onOpenModal: (modal: 'character' | 'inventory' | 'skills' | 'quests' | 'pet' | 'help' | 'save') => void;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({ currentMap, profile, onOpenModal }) => {
  const [muted, setMuted] = useState(soundEffects.getMuted());
  const mapData = MAPS[currentMap];

  const handleToggleMute = () => {
    const isNowMuted = soundEffects.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-auto">
      {/* Location Banner & Currency */}
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-xs">
        {/* Map Name */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📍</span>
          <span className="font-semibold text-sm text-slate-100">{mapData?.name || 'Etheria'}</span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Gold */}
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400 tabular-nums">
          <span>🪙</span>
          <span>{profile.gold.toLocaleString()} G</span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={muted ? 'Unmute Audio' : 'Mute Audio'}
          className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Action Buttons Tray */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-lg shadow-xl backdrop-blur-xs">
        <button
          onClick={() => onOpenModal('character')}
          title="Character Status [C]"
          className="relative px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded cursor-pointer transition-all flex items-center gap-1"
        >
          <span>👤</span>
          <span>Status</span>
          {profile.statPoints > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          onClick={() => onOpenModal('inventory')}
          title="Inventory & Equipment [I]"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded cursor-pointer transition-all flex items-center gap-1"
        >
          <span>🎒</span>
          <span>Bag</span>
        </button>

        <button
          onClick={() => onOpenModal('skills')}
          title="Skills [K]"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded cursor-pointer transition-all flex items-center gap-1"
        >
          <span>✨</span>
          <span>Skills</span>
        </button>

        <button
          onClick={() => onOpenModal('quests')}
          title="Quest Log [L]"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded cursor-pointer transition-all flex items-center gap-1"
        >
          <span>📜</span>
          <span>Quests</span>
        </button>

        <button
          onClick={() => onOpenModal('pet')}
          title="Companion Pet [P]"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded cursor-pointer transition-all flex items-center gap-1"
        >
          <span>🐾</span>
          <span>Pet</span>
        </button>

        <button
          onClick={() => onOpenModal('help')}
          title="Game Guide & Controls [H]"
          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded cursor-pointer transition-all"
        >
          ❓
        </button>

        <button
          onClick={() => onOpenModal('save')}
          title="Save & Options"
          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded cursor-pointer transition-all"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};
