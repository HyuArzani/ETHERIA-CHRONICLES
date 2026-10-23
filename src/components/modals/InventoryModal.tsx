/**
 * Etheria Chronicles - Inventory & Equipment Paperdoll Modal
 */

import React, { useState } from 'react';
import { ITEM_CATALOG } from '../../game/data/items';
import { gameState } from '../../game/state/GameState';
import { EquipmentSlot, InventoryItem, ItemDefinition, PlayerProfile } from '../../game/types';

interface InventoryModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ profile, onClose }) => {
  const [selectedInvItem, setSelectedInvItem] = useState<InventoryItem | null>(null);
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<EquipmentSlot | null>(null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
      case 'rare': return 'text-sky-400 border-sky-500/40 bg-sky-950/20';
      case 'epic': return 'text-purple-400 border-purple-500/40 bg-purple-950/20';
      case 'legendary': return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
      case 'mythic': return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
      default: return 'text-slate-200 border-slate-700/60 bg-slate-800/40';
    }
  };

  const equipSlots: { slot: EquipmentSlot; label: string; icon: string }[] = [
    { slot: 'headgear', label: 'Head', icon: '🧢' },
    { slot: 'mainHand', label: 'Main Hand', icon: '⚔️' },
    { slot: 'armor', label: 'Armor', icon: '👕' },
    { slot: 'offHand', label: 'Off Hand', icon: '🛡️' },
    { slot: 'pants', label: 'Pants', icon: '👖' },
    { slot: 'accessory1', label: 'Accessory 1', icon: '💍' },
    { slot: 'boots', label: 'Boots', icon: '🥾' },
    { slot: 'accessory2', label: 'Accessory 2', icon: '✨' },
  ];

  const activeInspectItem: ItemDefinition | null = selectedInvItem
    ? ITEM_CATALOG[selectedInvItem.itemId] || null
    : selectedEquipSlot
    ? profile.equipment[selectedEquipSlot] || null
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-bold text-base text-slate-100 font-fantasy tracking-wider">
              Equipment & Inventory
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-amber-400">
              🪙 {profile.gold.toLocaleString()} Gold
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Split: Equipment Left, Inventory Right */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipment Paperdoll */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Equipped Items
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {equipSlots.map(({ slot, label, icon }) => {
                  const item = profile.equipment[slot];
                  const isSelected = selectedEquipSlot === slot;
                  const refine = item?.refinement || 0;

                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedEquipSlot(slot);
                        setSelectedInvItem(null);
                      }}
                      className={`relative p-2 rounded-lg border flex items-center gap-2 text-left transition-all cursor-pointer ${isSelected ? 'border-amber-400 bg-amber-950/20' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                      <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-lg shrink-0 relative">
                        {item ? item.icon : icon}
                        {refine > 0 && (
                          <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1 rounded-sm shadow">
                            +{refine}
                          </span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">{label}</span>
                        <span className={`text-xs font-semibold truncate block ${item ? getRarityColor(item.rarity) : 'text-slate-500'}`}>
                          {item ? `${refine > 0 ? `+${refine} ` : ''}${item.name}` : 'Empty'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedEquipSlot && profile.equipment[selectedEquipSlot] && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    gameState.unequipItem(selectedEquipSlot);
                    setSelectedEquipSlot(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-200 rounded cursor-pointer transition-colors"
                >
                  Unequip to Bag
                </button>
              </div>
            )}
          </div>

          {/* 28-Slot Inventory Grid */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Backpack ({profile.inventory.length} / 28)
                </h3>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-56 overflow-y-auto p-1">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const invItem = profile.inventory[idx];
                  const itemDef = invItem ? ITEM_CATALOG[invItem.itemId] : null;
                  const isSelected = selectedInvItem?.id === invItem?.id && invItem !== undefined;
                  const refine = invItem?.refinement || 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (invItem) {
                          setSelectedInvItem(invItem);
                          setSelectedEquipSlot(null);
                        }
                      }}
                      className={`relative w-11 h-11 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400' : invItem ? 'border-slate-700 bg-slate-850 hover:border-slate-500' : 'border-slate-800/60 bg-slate-900/40 opacity-40 cursor-default'}`}
                    >
                      {itemDef && (
                        <>
                          <span className="text-xl select-none">{itemDef.icon}</span>
                          {refine > 0 && (
                            <span className="absolute top-0.5 left-0.5 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1 rounded-sm shadow">
                              +{refine}
                            </span>
                          )}
                          {invItem.quantity > 1 && (
                            <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-white bg-slate-900/90 px-1 rounded">
                              {invItem.quantity}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory Action Bar */}
            {selectedInvItem && activeInspectItem && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Sell: <b className="text-amber-400 font-mono">{activeInspectItem.sellPrice} G</b>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      gameState.sellItem(selectedInvItem.id, 1);
                      setSelectedInvItem(null);
                    }}
                    className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs rounded cursor-pointer"
                  >
                    Sell 1
                  </button>

                  {/* Contextual Action: Equip or Use or Hatch */}
                  {activeInspectItem.category === 'weapon' ||
                  activeInspectItem.category === 'shield' ||
                  activeInspectItem.category === 'headgear' ||
                  activeInspectItem.category === 'armor' ||
                  activeInspectItem.category === 'pants' ||
                  activeInspectItem.category === 'boots' ||
                  activeInspectItem.category === 'accessory' ? (
                    <button
                      onClick={() => {
                        gameState.equipItem(selectedInvItem.id);
                        setSelectedInvItem(null);
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : activeInspectItem.category === 'consumable' ? (
                    <button
                      onClick={() => {
                        gameState.useConsumable(activeInspectItem.id);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer"
                    >
                      Use
                    </button>
                  ) : activeInspectItem.category === 'pet_item' ? (
                    <button
                      onClick={() => {
                        gameState.hatchPetEgg(selectedInvItem.id);
                        setSelectedInvItem(null);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded cursor-pointer"
                    >
                      Hatch Egg
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Item Tooltip Inspection Box */}
        {activeInspectItem && (
          <div className="mx-4 mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{activeInspectItem.icon}</span>
                <span className={`font-bold text-sm ${getRarityColor(activeInspectItem.rarity)}`}>
                  {activeInspectItem.name}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
                {activeInspectItem.rarity} · {activeInspectItem.category}
              </span>
            </div>

            <p className="text-slate-400 text-xs italic">{activeInspectItem.description}</p>

            {/* Active Refinement Tier */}
            {((selectedInvItem?.refinement || (selectedEquipSlot && profile.equipment[selectedEquipSlot]?.refinement)) ?? 0) > 0 && (
              <div className="text-amber-400 font-bold font-mono text-[11px] bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded flex items-center justify-between">
                <span>✦ Refinement: +{selectedInvItem?.refinement || (selectedEquipSlot && profile.equipment[selectedEquipSlot]?.refinement)}</span>
                <span className="text-amber-300">
                  {activeInspectItem.category === 'weapon'
                    ? `+${((selectedInvItem?.refinement || profile.equipment[selectedEquipSlot!]?.refinement) || 0) * 8} ATK, +${((selectedInvItem?.refinement || profile.equipment[selectedEquipSlot!]?.refinement) || 0) * 6} MATK`
                    : `+${((selectedInvItem?.refinement || profile.equipment[selectedEquipSlot!]?.refinement) || 0) * 4} DEF, +${((selectedInvItem?.refinement || profile.equipment[selectedEquipSlot!]?.refinement) || 0) * 2} MDEF`}
                </span>
              </div>
            )}

            {/* Stat Bonuses */}
            {activeInspectItem.stats && (
              <div className="flex flex-wrap gap-2 text-amber-300 font-mono text-[11px] pt-1">
                {activeInspectItem.stats.atk && <span>+ATK {activeInspectItem.stats.atk}</span>}
                {activeInspectItem.stats.matk && <span>+MATK {activeInspectItem.stats.matk}</span>}
                {activeInspectItem.stats.def && <span>+DEF {activeInspectItem.stats.def}</span>}
                {activeInspectItem.stats.mdef && <span>+MDEF {activeInspectItem.stats.mdef}</span>}
                {activeInspectItem.stats.str && <span>+STR {activeInspectItem.stats.str}</span>}
                {activeInspectItem.stats.agi && <span>+AGI {activeInspectItem.stats.agi}</span>}
                {activeInspectItem.stats.vit && <span>+VIT {activeInspectItem.stats.vit}</span>}
                {activeInspectItem.stats.int && <span>+INT {activeInspectItem.stats.int}</span>}
                {activeInspectItem.stats.dex && <span>+DEX {activeInspectItem.stats.dex}</span>}
                {activeInspectItem.stats.luk && <span>+LUK {activeInspectItem.stats.luk}</span>}
                {activeInspectItem.stats.hpBonus && <span>+MaxHP {activeInspectItem.stats.hpBonus}</span>}
                {activeInspectItem.stats.mpBonus && <span>+MaxMP {activeInspectItem.stats.mpBonus}</span>}
                {activeInspectItem.stats.critBonus && <span>+Crit {activeInspectItem.stats.critBonus}%</span>}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Required: Lv. {activeInspectItem.levelReq}</span>
              <span>Sell Value: {activeInspectItem.sellPrice} Gold</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
