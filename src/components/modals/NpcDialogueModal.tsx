/**
 * Etheria Chronicles - NPC Dialogue, Shop, Alchemy, Refinement & Expeditions Modal
 */

import React, { useState } from 'react';
import { ITEM_CATALOG } from '../../game/data/items';
import { MAPS } from '../../game/data/maps';
import { QUEST_CATALOG } from '../../game/data/quests';
import { gameState } from '../../game/state/GameState';
import { EquipmentSlot, MapId, NpcDefinition, PlayerProfile } from '../../game/types';

interface NpcDialogueModalProps {
  npcId: string;
  profile: PlayerProfile;
  onClose: () => void;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({ npcId, profile, onClose }) => {
  // Find NPC across all maps
  let npc: NpcDefinition | undefined;
  for (const mId of Object.keys(MAPS) as MapId[]) {
    const found = MAPS[mId]?.npcs.find((n) => n.id === npcId);
    if (found) {
      npc = found;
      break;
    }
  }

  if (!npc) return null;

  const [tab, setTab] = useState<'dialogue' | 'shop' | 'quests' | 'job' | 'alchemy' | 'refine' | 'expeditions' | 'guild'>('dialogue');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedRefineSlot, setSelectedRefineSlot] = useState<EquipmentSlot>('mainHand');
  const [refineFeedback, setRefineFeedback] = useState<string | null>(null);

  const shopItems = (npc.shopItems || []).map((id) => ITEM_CATALOG[id]).filter(Boolean);
  const npcQuests = (npc.givesQuestIds || []).map((id) => QUEST_CATALOG[id]).filter(Boolean);

  const isInstructor = npc.role === 'job_instructor';
  const isAlchemist = npc.role === 'alchemist';
  const isRefiner = npc.role === 'refinement_master';
  const isGuide = npc.role === 'dungeon_guide';
  const isGuildMaster = npc.role === 'guild_master';

  // Count player items
  const countItem = (itemId: string) => {
    return profile.inventory.filter((i) => i.itemId === itemId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleRefine = () => {
    const res = gameState.refineEquipment(selectedRefineSlot);
    setRefineFeedback(res.message);
    setTimeout(() => setRefineFeedback(null), 4000);
  };

  const handleCraft = (recipeId: string) => {
    const res = gameState.craftPotion(recipeId);
    setRefineFeedback(res.message);
    setTimeout(() => setRefineFeedback(null), 4000);
  };

  const handleWarp = (mapId: MapId, x: number, y: number, levelReq: number) => {
    if (profile.level < levelReq) {
      setRefineFeedback(`Level ${levelReq}+ required for expedition to this territory!`);
      setTimeout(() => setRefineFeedback(null), 3000);
      return;
    }
    gameState.teleportToMap(mapId, x, y);
    onClose();
  };

  const currentEquippedForRefine = profile.equipment[selectedRefineSlot];
  const curRefine = currentEquippedForRefine?.refinement || 0;
  const isWeaponSlot = selectedRefineSlot === 'mainHand' || selectedRefineSlot === 'offHand';
  const refineOreId = isWeaponSlot ? 'oridecon' : 'elunium';
  const oreCount = countItem(refineOreId);

  // Success chances
  const getRefineChance = (level: number) => {
    if (level < 4) return 100;
    if (level === 4) return 70;
    if (level === 5) return 55;
    if (level === 6) return 40;
    if (level === 7) return 25;
    if (level === 8) return 15;
    return 10;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h2 className="font-bold text-sm text-slate-100 font-fantasy">{npc.name}</h2>
              <span className="text-[11px] text-amber-400">{npc.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setTab('dialogue')}
            className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'dialogue' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Conversation
          </button>
          {shopItems.length > 0 && (
            <button
              onClick={() => setTab('shop')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'shop' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Shop ({shopItems.length})
            </button>
          )}
          {isAlchemist && (
            <button
              onClick={() => setTab('alchemy')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'alchemy' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              ⚗️ Alchemy Lab
            </button>
          )}
          {isRefiner && (
            <button
              onClick={() => setTab('refine')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'refine' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🔨 Refinement (+10)
            </button>
          )}
          {isGuide && (
            <button
              onClick={() => setTab('expeditions')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'expeditions' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🗺️ Expeditions
            </button>
          )}
          {isGuildMaster && (
            <button
              onClick={() => setTab('guild')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'guild' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🛡️ Knights Guild
            </button>
          )}
          {npcQuests.length > 0 && (
            <button
              onClick={() => setTab('quests')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'quests' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Quests ({npcQuests.length})
            </button>
          )}
          {isInstructor && (
            <button
              onClick={() => setTab('job')}
              className={`pb-2 font-semibold capitalize cursor-pointer border-b-2 transition-colors shrink-0 ${tab === 'job' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Job Advancement
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {refineFeedback && (
            <div className="p-2.5 rounded bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs font-semibold text-center animate-bounce">
              {refineFeedback}
            </div>
          )}

          {tab === 'dialogue' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans min-h-[80px]">
                "{npc.dialogue[dialogueIndex % npc.dialogue.length]}"
              </div>
              <div className="flex justify-between items-center text-xs">
                {npc.dialogue.length > 1 && (
                  <button
                    onClick={() => setDialogueIndex((prev) => prev + 1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                  >
                    Next Line →
                  </button>
                )}
                {isRefiner ? (
                  <button
                    onClick={() => setTab('refine')}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded cursor-pointer transition-colors ml-auto"
                  >
                    Refine Gear →
                  </button>
                ) : isAlchemist ? (
                  <button
                    onClick={() => setTab('alchemy')}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded cursor-pointer transition-colors ml-auto"
                  >
                    Brew Potions →
                  </button>
                ) : isGuide ? (
                  <button
                    onClick={() => setTab('expeditions')}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer transition-colors ml-auto"
                  >
                    View Expeditions →
                  </button>
                ) : shopItems.length > 0 ? (
                  <button
                    onClick={() => setTab('shop')}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded cursor-pointer transition-colors ml-auto"
                  >
                    Browse Wares →
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* SHOP TAB */}
          {tab === 'shop' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span>Available Merchandise</span>
                <span className="font-mono text-amber-400 font-bold">
                  Balance: 🪙 {profile.gold.toLocaleString()} Gold
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {shopItems.map((item) => {
                  const canAfford = profile.gold >= (item.buyPrice || 0);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-200 block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                          🪙 {item.buyPrice} G
                        </span>
                        <button
                          onClick={() => gameState.buyItem(item.id)}
                          disabled={!canAfford}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-slate-950 font-bold text-xs rounded cursor-pointer transition-all"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALCHEMY LAB TAB */}
          {tab === 'alchemy' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-lg text-xs space-y-1">
                <h4 className="font-bold text-purple-300">Grand Alchemical Distillation</h4>
                <p className="text-slate-300">
                  Combine harvested herbs and monster ingredients to synthesize concentrated draughts.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Greater Red Potion Recipe */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧪</span>
                      <span className="font-bold text-xs text-red-300">Greater Red Potion</span>
                      <span className="text-[10px] text-emerald-400 font-mono">+450 HP</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Ingredients: 2x Red Potions ({countItem('red_potion')}/2), 1x Wild Herb ({countItem('wild_herb')}/1) + 150 G
                    </div>
                  </div>
                  <button
                    onClick={() => handleCraft('greater_red_potion')}
                    disabled={countItem('red_potion') < 2 || countItem('wild_herb') < 1 || profile.gold < 150}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold text-xs rounded cursor-pointer shrink-0"
                  >
                    Brew
                  </button>
                </div>

                {/* Greater Blue Potion Recipe */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💧</span>
                      <span className="font-bold text-xs text-blue-300">Greater Blue Potion</span>
                      <span className="text-[10px] text-sky-400 font-mono">+220 MP</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Ingredients: 2x Blue Potions ({countItem('blue_potion')}/2), 1x Aqua Pearl ({countItem('aqua_pearl')}/1) + 200 G
                    </div>
                  </div>
                  <button
                    onClick={() => handleCraft('greater_blue_potion')}
                    disabled={countItem('blue_potion') < 2 || countItem('aqua_pearl') < 1 || profile.gold < 200}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold text-xs rounded cursor-pointer shrink-0"
                  >
                    Brew
                  </button>
                </div>

                {/* Berserk Elixir Recipe */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍷</span>
                      <span className="font-bold text-xs text-amber-300">Berserk Elixir</span>
                      <span className="text-[10px] text-amber-400 font-mono">+25 ATK & +15% ASPD</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Ingredients: 1x Greater Red Potion ({countItem('greater_red_potion')}/1), 1x Scorpion Carapace ({countItem('scorpion_carapace')}/1) + 500 G
                    </div>
                  </div>
                  <button
                    onClick={() => handleCraft('berserk_elixir')}
                    disabled={countItem('greater_red_potion') < 1 || countItem('scorpion_carapace') < 1 || profile.gold < 500}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-slate-950 font-bold text-xs rounded cursor-pointer shrink-0"
                  >
                    Brew
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REFINEMENT TAB */}
          {tab === 'refine' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs space-y-1">
                <h4 className="font-bold text-amber-300">Master Forge Refinement (+1 to +10)</h4>
                <p className="text-slate-300">
                  Refine equipment safely up to +4 (100% guarantee). Beyond +4, failure reduces refinement by 1 tier. Your precious weapons and armor will <b>never break or be destroyed</b>!
                </p>
              </div>

              {/* Select Equipped Gear */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Choose Equipped Gear to Refine:</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['mainHand', 'offHand', 'armor', 'boots'] as const).map((slot) => {
                    const item = profile.equipment[slot];
                    const isSelected = selectedRefineSlot === slot;
                    const ref = item?.refinement || 0;

                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedRefineSlot(slot)}
                        className={`p-2 rounded border flex items-center gap-2 text-left cursor-pointer transition-all ${isSelected ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                      >
                        <span className="text-xl">{item ? item.icon : '⬛'}</span>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 capitalize block">{slot}</span>
                          <span className="text-xs font-bold text-slate-200 block truncate">
                            {item ? `${ref > 0 ? `+${ref} ` : ''}${item.name}` : '(Empty)'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Refinement Operation Card */}
              {currentEquippedForRefine ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-100">
                        {curRefine > 0 ? `+${curRefine} ` : ''}{currentEquippedForRefine.name}
                      </span>
                      <span className="text-xs text-amber-400 font-mono block">
                        Target: +{curRefine + 1} ({isWeaponSlot ? '+8 ATK, +6 MATK' : '+4 DEF, +2 MDEF'})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400 block">Success Chance</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {curRefine < 10 ? `${getRefineChance(curRefine)}%` : 'MAXED'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      Required Material: <b className="text-amber-300 font-mono">{refineOreId === 'oridecon' ? '✦ Oridecon' : '✦ Elunium'}</b> ({oreCount}/1)
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      Fee: 🪙 {((curRefine + 1) * 300).toLocaleString()} G
                    </span>
                  </div>

                  <button
                    onClick={handleRefine}
                    disabled={curRefine >= 10 || (oreCount < 1 && profile.gold < 1500)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-sm rounded cursor-pointer transition-all shadow-lg"
                  >
                    {curRefine >= 10 ? 'Maximum Refinement (+10) Reached' : `Hammer on Anvil (${getRefineChance(curRefine)}%)`}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                  Select an equipped weapon or armor piece above to begin refinement.
                </div>
              )}
            </div>
          )}

          {/* EXPEDITIONS / DUNGEON GUIDE TAB */}
          {tab === 'expeditions' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-lg text-xs space-y-1">
                <h4 className="font-bold text-cyan-300">Grand Realm Expeditions</h4>
                <p className="text-slate-300">
                  Direct transport to Etheria's outer territories. Ensure your gear is refined before confronting regional bosses!
                </p>
              </div>

              <div className="space-y-2">
                {/* Dawnshire */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-100">Dawnshire Village Square</h5>
                    <span className="text-[11px] text-slate-400">Safe haven · Merchant vendors · Training dummies</span>
                  </div>
                  <button
                    onClick={() => handleWarp('dawnshire', 520, 450, 1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Verdant Fields */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-emerald-300">Verdant Fields (Lv 1+)</h5>
                    <span className="text-[11px] text-slate-400">Slimes, Beetles, Wildfang Wolves</span>
                  </div>
                  <button
                    onClick={() => handleWarp('verdant_fields', 200, 560, 1)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Whisperwood Forest */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-emerald-400">Whisperwood Forest (Lv 10+)</h5>
                    <span className="text-[11px] text-slate-400">Ancient Rootbeast Boss (Lv 18)</span>
                  </div>
                  <button
                    onClick={() => handleWarp('whisperwood', 120, 680, 10)}
                    disabled={profile.level < 10}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-slate-950 font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Sunken Ruins */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-cyan-300">Sunken Ruins (Lv 20+)</h5>
                    <span className="text-[11px] text-slate-400">Flooded temple · Tide Lord Boss (Lv 35)</span>
                  </div>
                  <button
                    onClick={() => handleWarp('sunken_ruins', 120, 650, 20)}
                    disabled={profile.level < 20}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Frostpeak Mountains */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-sky-300">Frostpeak Mountains (Lv 30+)</h5>
                    <span className="text-[11px] text-slate-400">Glacial peaks · Frost Yeti · Ice Golem</span>
                  </div>
                  <button
                    onClick={() => handleWarp('frostpeak_mountains', 120, 650, 30)}
                    disabled={profile.level < 30}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-slate-950 font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Crimson Desert */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-amber-400">Crimson Desert (Lv 40+)</h5>
                    <span className="text-[11px] text-slate-400">Sunken tombs · Sand King Boss (Lv 45)</span>
                  </div>
                  <button
                    onClick={() => handleWarp('crimson_desert', 120, 650, 40)}
                    disabled={profile.level < 40}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-slate-950 font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>

                {/* Celestial Tower */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-purple-300">Celestial Tower (Lv 50+)</h5>
                    <span className="text-[11px] text-slate-400">Astral heights · Sky Guardian Boss (Lv 60)</span>
                  </div>
                  <button
                    onClick={() => handleWarp('celestial_tower', 120, 650, 50)}
                    disabled={profile.level < 50}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold text-xs rounded cursor-pointer"
                  >
                    Warp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KNIGHTS GUILD TAB */}
          {tab === 'guild' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs space-y-1">
                <h4 className="font-bold text-amber-300">The Radiant Vanguard</h4>
                <p className="text-slate-300">
                  Knights of Etheria stand between civilization and primal chaos. Receive the Guild Master's Blessing to bolster your spirit!
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-100">Vanguard's Benediction</span>
                  <span className="text-emerald-400 font-mono text-xs">+10% EXP & Full Recovery</span>
                </div>
                <p className="text-xs text-slate-400">
                  Master Vane channels celestial radiance to rejuvenate your wounds and invigorate your weapon edge.
                </p>
                <button
                  onClick={() => {
                    const derived = gameState.getDerivedStats();
                    profile.currentHp = derived.maxHp;
                    profile.currentMp = derived.maxMp;
                    gameState.addSystemMessage('Guild Master Vane grants you the Vanguard Blessing! HP and MP fully restored!');
                    setRefineFeedback('✦ Guild Master Vane blessed you! HP/MP restored! ✦');
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded cursor-pointer transition-all"
                >
                  Receive Knight's Blessing
                </button>
              </div>
            </div>
          )}

          {/* QUESTS TAB */}
          {tab === 'quests' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block">Available Quests from {npc.name}:</span>
              <div className="space-y-2">
                {npcQuests.map((q) => {
                  const qProg = profile.quests[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-200">{q.title}</h4>
                        <span className="text-[10px] font-mono text-amber-400">
                          Req: Lv.{q.levelReq}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{q.description}</p>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-sky-300 font-mono text-[11px]">
                          Reward: +{q.reward.exp} EXP · 🪙 {q.reward.gold} G
                        </span>

                        {!qProg ? (
                          <button
                            onClick={() => gameState.acceptQuest(q.id)}
                            disabled={profile.level < q.levelReq}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded cursor-pointer"
                          >
                            Accept
                          </button>
                        ) : qProg.turnedIn ? (
                          <span className="text-slate-500 font-medium">Completed</span>
                        ) : qProg.completed ? (
                          <button
                            onClick={() => gameState.completeQuest(q.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer animate-pulse"
                          >
                            Claim Reward
                          </button>
                        ) : (
                          <span className="text-amber-400 font-medium">In Progress</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* JOB ADVANCEMENT TAB */}
          {tab === 'job' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <h4 className="font-bold text-sm text-slate-100 mb-1">First Job Advancement</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upon reaching <b>Level 10</b>, you may advance from a Novice to one of four specialized combat disciplines.
                </p>
                <div className="mt-2 text-xs font-mono">
                  Current Status: <b className="text-amber-400 uppercase">{profile.job}</b> (Level {profile.level})
                </div>
              </div>

              {profile.job === 'novice' ? (
                profile.level >= 10 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {(['warrior', 'mage', 'archer', 'acolyte'] as const).map((job) => (
                      <button
                        key={job}
                        onClick={() => gameState.promoteJob(job)}
                        className="p-3 bg-slate-800 hover:bg-amber-600/30 border border-slate-700 hover:border-amber-400 rounded-lg text-left cursor-pointer transition-all group"
                      >
                        <span className="text-2xl block mb-1">
                          {job === 'warrior' ? '⚔️' : job === 'mage' ? '🔮' : job === 'archer' ? '🏹' : '✨'}
                        </span>
                        <span className="font-bold text-xs text-slate-100 capitalize block group-hover:text-amber-300">
                          {job}
                        </span>
                        <span className="text-[10px] text-slate-400">Promote to {job}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-lg text-center space-y-1">
                    <span className="text-amber-300 font-bold text-xs block">
                      Level 10 Required for Promotion
                    </span>
                    <span className="text-slate-400 text-xs">
                      Train against monsters in Verdant Fields to gain {profile.expToNextLevel - profile.currentExp} more EXP!
                    </span>
                  </div>
                )
              ) : (
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-lg text-center">
                  <span className="text-emerald-400 font-bold text-xs block">
                    You have already attained your 1st Job as a {profile.job.toUpperCase()}!
                  </span>
                  <span className="text-slate-400 text-xs">
                    Phase 2 master refinement and biome expeditions are now unlocked!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
