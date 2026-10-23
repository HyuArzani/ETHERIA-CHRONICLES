/**
 * Etheria Chronicles - Main Application Container & Game Shell
 * Full-viewport Game Shell adhering to Game Craft & MMORPG master brief.
 */

import React, { useEffect, useState } from 'react';
import { ChatBox } from './components/hud/ChatBox';
import { Hotbar } from './components/hud/Hotbar';
import { LocationHeader } from './components/hud/LocationHeader';
import { PlayerFrame } from './components/hud/PlayerFrame';
import { QuestTracker } from './components/hud/QuestTracker';
import { TargetFrame } from './components/hud/TargetFrame';
import { CharacterModal } from './components/modals/CharacterModal';
import { HelpModal } from './components/modals/HelpModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { NpcDialogueModal } from './components/modals/NpcDialogueModal';
import { PetModal } from './components/modals/PetModal';
import { QuestLogModal } from './components/modals/QuestLogModal';
import { SaveModal } from './components/modals/SaveModal';
import { SkillsModal } from './components/modals/SkillsModal';
import { TitleScreen } from './components/TitleScreen';
import { PhaserGame } from './game/engine/PhaserGame';
import { gameState } from './game/state/GameState';
import { ActiveMonster, DerivedStats, MonsterTemplate, PlayerProfile } from './game/types';

type ActiveModal = 'character' | 'inventory' | 'skills' | 'quests' | 'pet' | 'help' | 'save' | null;

export default function App() {
  const [gameStateMode, setGameStateMode] = useState<'TITLE_MENU' | 'PLAYING'>('TITLE_MENU');
  const [profile, setProfile] = useState<PlayerProfile>(gameState.getProfile());
  const [derived, setDerived] = useState<DerivedStats>(gameState.getDerivedStats());
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [targetMonster, setTargetMonster] = useState<ActiveMonster | null>(null);
  const [targetTemplate, setTargetTemplate] = useState<MonsterTemplate | null>(null);

  // Subscribe to authoritative game state updates
  useEffect(() => {
    const unsub = gameState.subscribe((newProfile, newDerived) => {
      setProfile({ ...newProfile });
      setDerived({ ...newDerived });
    });
    return unsub;
  }, []);

  // Keyboard shortcut listener for UI panels
  useEffect(() => {
    if (gameStateMode !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in chat input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'escape') {
        setActiveModal(null);
        setActiveNpcId(null);
      } else if (key === 'c') {
        setActiveModal((prev) => (prev === 'character' ? null : 'character'));
      } else if (key === 'i' || key === 'b') {
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
      } else if (key === 'k') {
        setActiveModal((prev) => (prev === 'skills' ? null : 'skills'));
      } else if (key === 'l') {
        setActiveModal((prev) => (prev === 'quests' ? null : 'quests'));
      } else if (key === 'p') {
        setActiveModal((prev) => (prev === 'pet' ? null : 'pet'));
      } else if (key === 'h') {
        setActiveModal((prev) => (prev === 'help' ? null : 'help'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStateMode]);

  // Handle NPC interaction trigger from 2D scene
  const handleNpcInteract = (npcId: string) => {
    setActiveNpcId(npcId);
  };

  // Handle combat target change from 2D scene
  const handleTargetChange = (monster: ActiveMonster | null, template: MonsterTemplate | null) => {
    setTargetMonster(monster);
    setTargetTemplate(template);
  };

  if (gameStateMode === 'TITLE_MENU') {
    return <TitleScreen onStartGame={() => setGameStateMode('PLAYING')} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Isolated Phaser 2D Canvas Container (never re-mounted by React state) */}
      <PhaserGame
        onNpcInteract={handleNpcInteract}
        onTargetChange={handleTargetChange}
      />

      {/* World-Matched, Low-Occlusion UI Layer (pointer-events: none on outer wrapper) */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
        {/* Top Header Cluster */}
        <div className="flex items-start justify-between w-full">
          {/* Top-Left: Player Frame */}
          <PlayerFrame
            profile={profile}
            derived={derived}
            onOpenCharacter={() => setActiveModal('character')}
          />

          {/* Top-Center: Target Frame */}
          <TargetFrame
            monster={targetMonster}
            template={targetTemplate}
            onClearTarget={() => {
              setTargetMonster(null);
              setTargetTemplate(null);
            }}
          />

          {/* Top-Right: Location & Menus */}
          <LocationHeader
            currentMap={profile.currentMap}
            profile={profile}
            onOpenModal={(modal) => setActiveModal(modal)}
          />
        </div>

        {/* Center / Right: Floating Quest Tracker */}
        <div className="flex justify-end my-auto">
          <QuestTracker
            profile={profile}
            onOpenQuests={() => setActiveModal('quests')}
          />
        </div>

        {/* Bottom Bar Cluster */}
        <div className="flex items-end justify-between w-full">
          {/* Bottom-Left: Chat Box */}
          <ChatBox />

          {/* Bottom-Center: Combat Hotbar */}
          <div className="mx-auto">
            <Hotbar
              profile={profile}
              onUseSkill={(slotIdx) => {
                const win = window as unknown as { __phaserWorldScene?: { executeSkill?: (idx: number, t: number) => void } };
                if (win.__phaserWorldScene?.executeSkill) {
                  win.__phaserWorldScene.executeSkill(slotIdx, performance.now());
                }
              }}
              onUsePotion={(type) => gameState.useConsumable(type)}
              onBasicAttack={() => {
                const win = window as unknown as { __phaserWorldScene?: { executeBasicAttack?: (t: number) => void } };
                if (win.__phaserWorldScene?.executeBasicAttack) {
                  win.__phaserWorldScene.executeBasicAttack(performance.now());
                }
              }}
              onInteract={() => {
                // Handled in WorldScene via 'F' key
              }}
            />
          </div>

          {/* Bottom-Right: Spacer / Mini Control Indicator */}
          <div className="w-80 flex justify-end text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-auto">
            <span>WASD: Move · Space: Attack · F: Loot</span>
          </div>
        </div>
      </div>

      {/* --- MODALS & DIALOGUES --- */}
      {activeModal === 'character' && (
        <CharacterModal
          profile={profile}
          derived={derived}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'skills' && (
        <SkillsModal
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'quests' && (
        <QuestLogModal
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'pet' && (
        <PetModal
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'save' && (
        <SaveModal onClose={() => setActiveModal(null)} />
      )}

      {activeNpcId && (
        <NpcDialogueModal
          npcId={activeNpcId}
          profile={profile}
          onClose={() => setActiveNpcId(null)}
        />
      )}
    </div>
  );
}
