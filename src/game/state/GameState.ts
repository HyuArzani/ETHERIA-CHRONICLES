/**
 * Etheria Chronicles - Authoritative Game State & Persistence Manager
 */

import { ITEM_CATALOG } from '../data/items';
import { MAPS } from '../data/maps';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { QUEST_CATALOG } from '../data/quests';
import { calculateDerivedStats, getExpForLevel } from '../systems/formulas';
import { soundEffects } from '../audio/SoundEffects';
import { 
  DerivedStats, 
  EquipmentSlot, 
  FloatingText, 
  GroundDropItem, 
  InventoryItem, 
  MapId, 
  PetCompanion, 
  PlayerProfile 
} from '../types';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  channel: 'all' | 'system' | 'combat';
  timestamp: string;
}

export type StateListener = (profile: PlayerProfile, derived: DerivedStats) => void;

class GameStateManager {
  private profile: PlayerProfile;
  private derivedStats: DerivedStats;
  private listeners: Set<StateListener> = new Set();
  private chatMessages: ChatMessage[] = [];
  private chatListeners: Set<(messages: ChatMessage[]) => void> = new Set();
  private floatingTexts: FloatingText[] = [];
  private groundDrops: GroundDropItem[] = [];
  private groundDropListeners: Set<(drops: GroundDropItem[]) => void> = new Set();

  constructor() {
    this.profile = this.loadOrInitProfile();
    this.derivedStats = calculateDerivedStats(
      this.profile.level,
      this.profile.job,
      this.profile.baseStats,
      this.profile.equipment
    );
    this.addSystemMessage('Welcome to Etheria Chronicles! Explore, train, and forge your destiny.');
  }

  private loadOrInitProfile(): PlayerProfile {
    try {
      const saved = localStorage.getItem('etheria_player_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.baseStats) {
          return parsed;
        }
      }
    } catch {
      console.warn('Failed to parse saved game state, starting fresh');
    }

    // Default starter character
    return {
      id: 'player_' + Math.random().toString(36).substring(2, 9),
      customization: {
        name: 'Aerith',
        gender: 'female',
        hairStyle: 1,
        hairColor: '#d97706',
        outfitColor: '#2563eb',
      },
      job: 'novice',
      level: 1,
      currentExp: 0,
      expToNextLevel: getExpForLevel(1),
      jobLevel: 1,
      jobExp: 0,
      jobExpToNextLevel: 50,
      gold: 50,
      statPoints: 5, // 5 starter points to test allocation immediately!
      skillPoints: 1,
      baseStats: {
        str: 5,
        agi: 5,
        vit: 5,
        int: 5,
        dex: 5,
        luk: 5,
      },
      currentHp: 180,
      currentMp: 80,
      x: 520,
      y: 450,
      currentMap: 'dawnshire',
      inventory: [
        { id: 'inv_1', itemId: 'red_potion', quantity: 6 },
        { id: 'inv_2', itemId: 'blue_potion', quantity: 3 },
        { id: 'inv_3', itemId: 'butterfly_wing', quantity: 1 },
      ],
      equipment: {
        mainHand: ITEM_CATALOG['novice_knife'],
        armor: ITEM_CATALOG['novice_cotton_shirt'],
        boots: ITEM_CATALOG['worn_boots'],
      },
      quests: {},
      learnedSkills: {
        basic_strike: 1,
        power_slash: 1,
        spark_bolt: 1,
        first_aid: 1,
      },
      hotbar: ['basic_strike', 'power_slash', 'spark_bolt', 'first_aid'],
    };
  }

  public save() {
    try {
      localStorage.setItem('etheria_player_save_v1', JSON.stringify(this.profile));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  public resetProgress() {
    localStorage.removeItem('etheria_player_save_v1');
    this.profile = this.loadOrInitProfile();
    this.recomputeStats();
    this.notify();
    this.addSystemMessage('Character progress reset to default novice.');
  }

  public exportSaveJson(): string {
    return JSON.stringify(this.profile, null, 2);
  }

  public importSaveJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.baseStats && data.inventory) {
        this.profile = data;
        this.recomputeStats();
        this.save();
        this.notify();
        this.addSystemMessage('Character progress imported successfully!');
        return true;
      }
    } catch (e) {
      console.error('Invalid save JSON:', e);
    }
    return false;
  }

  public subscribe(fn: StateListener): () => void {
    this.listeners.add(fn);
    fn(this.profile, this.derivedStats);
    return () => this.listeners.delete(fn);
  }

  public subscribeChat(fn: (messages: ChatMessage[]) => void): () => void {
    this.chatListeners.add(fn);
    fn(this.chatMessages);
    return () => this.chatListeners.delete(fn);
  }

  public subscribeDrops(fn: (drops: GroundDropItem[]) => void): () => void {
    this.groundDropListeners.add(fn);
    fn(this.groundDrops);
    return () => this.groundDropListeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.profile, this.derivedStats));
  }

  private notifyChat() {
    this.chatListeners.forEach((fn) => fn(this.chatMessages));
  }

  private notifyDrops() {
    this.groundDropListeners.forEach((fn) => fn(this.groundDrops));
  }

  public getProfile(): PlayerProfile {
    return this.profile;
  }

  public getDerivedStats(): DerivedStats {
    return this.derivedStats;
  }

  public recomputeStats() {
    this.derivedStats = calculateDerivedStats(
      this.profile.level,
      this.profile.job,
      this.profile.baseStats,
      this.profile.equipment
    );
    // Clamp current HP/MP to max
    this.profile.currentHp = Math.min(this.profile.currentHp, this.derivedStats.maxHp);
    this.profile.currentMp = Math.min(this.profile.currentMp, this.derivedStats.maxMp);
    this.notify();
  }

  // --- STAT ALLOCATION ---
  public allocateStat(statKey: keyof PlayerProfile['baseStats']) {
    if (this.profile.statPoints <= 0) return;
    this.profile.baseStats[statKey] += 1;
    this.profile.statPoints -= 1;
    this.recomputeStats();
    this.save();
    soundEffects.playCoin();
  }

  // --- EXP & PROGRESSION ---
  public addExp(amount: number) {
    this.profile.currentExp += amount;
    this.addFloatingText(`+${amount} EXP`, this.profile.x, this.profile.y - 20, '#38bdf8', false, true);

    while (this.profile.currentExp >= this.profile.expToNextLevel) {
      this.profile.currentExp -= this.profile.expToNextLevel;
      this.profile.level += 1;
      this.profile.statPoints += 5;
      this.profile.skillPoints += 1;
      this.profile.expToNextLevel = getExpForLevel(this.profile.level);
      
      this.recomputeStats();
      // Level up heals player to full!
      this.profile.currentHp = this.derivedStats.maxHp;
      this.profile.currentMp = this.derivedStats.maxMp;

      soundEffects.playLevelUp();
      this.addSystemMessage(`Level Up! You reached Level ${this.profile.level}! +5 Stat Points granted.`);
    }

    // Also give pet EXP if pet active
    if (this.profile.activePet) {
      this.addPetExp(Math.max(1, Math.floor(amount * 0.3)));
    }

    this.notify();
    this.save();
  }

  public addGold(amount: number) {
    this.profile.gold += amount;
    this.addFloatingText(`+${amount} Gold`, this.profile.x, this.profile.y - 35, '#fbbf24');
    this.notify();
    this.save();
  }

  // --- INVENTORY OPERATIONS ---
  public addItem(itemId: string, quantity: number = 1): boolean {
    const itemDef = ITEM_CATALOG[itemId];
    if (!itemDef) return false;

    const isStackable = itemDef.category === 'consumable' || itemDef.category === 'material';

    if (isStackable) {
      const existing = this.profile.inventory.find((i) => i.itemId === itemId);
      if (existing) {
        existing.quantity += quantity;
        this.notify();
        this.save();
        return true;
      }
    }

    // Check inventory space limit (e.g. 28 slots)
    if (this.profile.inventory.length >= 28) {
      this.addSystemMessage('Inventory is full! Sell or discard items.');
      return false;
    }

    this.profile.inventory.push({
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      itemId,
      quantity,
    });

    this.checkQuestCollectionProgress(itemId);
    this.notify();
    this.save();
    return true;
  }

  public removeItem(inventoryId: string, quantity: number = 1): boolean {
    const idx = this.profile.inventory.findIndex((i) => i.id === inventoryId);
    if (idx === -1) return false;

    const item = this.profile.inventory[idx];
    if (item.quantity > quantity) {
      item.quantity -= quantity;
    } else {
      this.profile.inventory.splice(idx, 1);
    }

    this.notify();
    this.save();
    return true;
  }

  public equipItem(inventoryId: string) {
    const itemSlot = this.profile.inventory.find((i) => i.id === inventoryId);
    if (!itemSlot) return;

    const itemDef = ITEM_CATALOG[itemSlot.itemId];
    if (!itemDef) return;

    if (itemDef.levelReq > this.profile.level) {
      this.addSystemMessage(`Requires Level ${itemDef.levelReq} to equip ${itemDef.name}.`);
      return;
    }

    let targetSlot: EquipmentSlot | null = null;
    if (itemDef.category === 'weapon') targetSlot = 'mainHand';
    else if (itemDef.category === 'shield') targetSlot = 'offHand';
    else if (itemDef.category === 'headgear') targetSlot = 'headgear';
    else if (itemDef.category === 'armor') targetSlot = 'armor';
    else if (itemDef.category === 'pants') targetSlot = 'pants';
    else if (itemDef.category === 'boots') targetSlot = 'boots';
    else if (itemDef.category === 'accessory') {
      targetSlot = this.profile.equipment.accessory1 ? 'accessory2' : 'accessory1';
    }

    if (!targetSlot) return;

    // Remove from inventory
    this.removeItem(inventoryId, 1);

    // If something was already equipped in that slot, put it back into inventory
    const currentlyEquipped = this.profile.equipment[targetSlot];
    if (currentlyEquipped) {
      this.addItemWithRefine(currentlyEquipped.id, 1, currentlyEquipped.refinement || 0);
    }

    this.profile.equipment[targetSlot] = {
      ...itemDef,
      refinement: itemSlot.refinement || 0,
    };
    this.recomputeStats();
    this.save();
    soundEffects.playItemPickup();
    const refPrefix = (itemSlot.refinement || 0) > 0 ? `+${itemSlot.refinement} ` : '';
    this.addSystemMessage(`Equipped ${refPrefix}${itemDef.name}.`);
  }

  public addItemWithRefine(itemId: string, quantity: number = 1, refinement: number = 0): boolean {
    const itemDef = ITEM_CATALOG[itemId];
    if (!itemDef) return false;

    // If refined, do not stack; give individual slot
    if (refinement === 0 && (itemDef.category === 'consumable' || itemDef.category === 'material')) {
      return this.addItem(itemId, quantity);
    }

    if (this.profile.inventory.length >= 28) {
      this.addSystemMessage('Inventory is full! Sell or discard items.');
      return false;
    }

    this.profile.inventory.push({
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      itemId,
      quantity,
      refinement,
    });

    this.checkQuestCollectionProgress(itemId);
    this.notify();
    this.save();
    return true;
  }

  public unequipItem(slot: EquipmentSlot) {
    const item = this.profile.equipment[slot];
    if (!item) return;

    if (this.profile.inventory.length >= 28) {
      this.addSystemMessage('Inventory is full! Cannot unequip.');
      return;
    }

    const ref = item.refinement || 0;
    delete this.profile.equipment[slot];
    this.addItemWithRefine(item.id, 1, ref);
    this.recomputeStats();
    this.save();
    soundEffects.playItemPickup();
    this.addSystemMessage(`Unequipped ${item.name}.`);
  }

  // --- REFINEMENT MASTER SYSTEM (+1 to +10) ---
  public refineEquipment(slot: EquipmentSlot): { success: boolean; message: string } {
    const item = this.profile.equipment[slot];
    if (!item) {
      return { success: false, message: 'No item equipped in that slot to refine!' };
    }

    const currentRefine = item.refinement || 0;
    if (currentRefine >= 10) {
      return { success: false, message: 'This item has already reached maximum +10 refinement!' };
    }

    const isWeapon = item.category === 'weapon';
    const reqStoneId = isWeapon ? 'oridecon' : 'elunium';
    const reqStoneDef = ITEM_CATALOG[reqStoneId];

    const stoneSlot = this.profile.inventory.find((i) => i.itemId === reqStoneId && i.quantity > 0);
    if (!stoneSlot) {
      return { success: false, message: `Requires 1x ${reqStoneDef?.name || reqStoneId} for refinement!` };
    }

    const goldCost = (currentRefine + 1) * 350;
    if (this.profile.gold < goldCost) {
      return { success: false, message: `Requires ${goldCost} Gold for refinement!` };
    }

    // Consume stone and gold
    this.removeItem(stoneSlot.id, 1);
    this.profile.gold -= goldCost;

    // Rates: +1..+4: 100%, +5: 80%, +6: 70%, +7: 55%, +8: 40%, +9: 25%, +10: 15%
    const rates: Record<number, number> = {
      0: 1.0,
      1: 1.0,
      2: 1.0,
      3: 1.0,
      4: 0.80,
      5: 0.70,
      6: 0.55,
      7: 0.40,
      8: 0.25,
      9: 0.15,
    };
    const chance = rates[currentRefine] ?? 0.15;
    const roll = Math.random();

    if (roll <= chance) {
      item.refinement = currentRefine + 1;
      this.recomputeStats();
      this.save();
      soundEffects.playLevelUp();
      const msg = `★ Refinement SUCCESS! ${item.name} is now +${item.refinement}! (+${isWeapon ? 8 : 4} ${isWeapon ? 'ATK' : 'DEF'})`;
      this.addSystemMessage(msg);
      return { success: true, message: msg };
    } else {
      soundEffects.playHitMonster();
      this.recomputeStats();
      this.save();
      const msg = `Refinement Failed! The mineral dissolved, but your ${item.name} was safely preserved.`;
      this.addSystemMessage(msg);
      return { success: false, message: msg };
    }
  }

  // --- ALCHEMY CRAFTING ---
  public craftPotion(recipeId: string): { success: boolean; message: string } {
    if (recipeId === 'greater_red_potion') {
      const redPot = this.profile.inventory.find((i) => i.itemId === 'red_potion' && i.quantity >= 2);
      const herb = this.profile.inventory.find((i) => i.itemId === 'wild_herb' && i.quantity >= 2);
      if (!redPot || !herb || this.profile.gold < 50) {
        return { success: false, message: 'Requires 2x Red Potions, 2x Wild Herbs, and 50 Gold!' };
      }
      this.removeItem(redPot.id, 2);
      this.removeItem(herb.id, 2);
      this.profile.gold -= 50;
      this.addItem('greater_red_potion', 1);
      soundEffects.playDrinkPotion();
      return { success: true, message: 'Crafted 1x Greater Red Elixir (+320 HP)!' };
    } else if (recipeId === 'greater_blue_potion') {
      const bluePot = this.profile.inventory.find((i) => i.itemId === 'blue_potion' && i.quantity >= 2);
      const aqua = this.profile.inventory.find((i) => i.itemId === 'aqua_crystal' && i.quantity >= 1);
      if (!bluePot || !aqua || this.profile.gold < 75) {
        return { success: false, message: 'Requires 2x Blue Potions, 1x Aqua Crystal, and 75 Gold!' };
      }
      this.removeItem(bluePot.id, 2);
      this.removeItem(aqua.id, 1);
      this.profile.gold -= 75;
      this.addItem('greater_blue_potion', 1);
      soundEffects.playDrinkPotion();
      return { success: true, message: 'Crafted 1x Greater Mana Philter (+220 MP)!' };
    } else if (recipeId === 'berserk_elixir') {
      const gRed = this.profile.inventory.find((i) => i.itemId === 'greater_red_potion' && i.quantity >= 1);
      const mat = this.profile.inventory.find((i) => (i.itemId === 'ember_core' || i.itemId === 'scorpion_venom') && i.quantity >= 1);
      if (!gRed || !mat || this.profile.gold < 120) {
        return { success: false, message: 'Requires 1x Greater Red Elixir, 1x Ember Core/Venom, and 120 Gold!' };
      }
      this.removeItem(gRed.id, 1);
      this.removeItem(mat.id, 1);
      this.profile.gold -= 120;
      this.addItem('berserk_elixir', 1);
      soundEffects.playDrinkPotion();
      return { success: true, message: 'Crafted 1x Berserk Combat Potion!' };
    }
    return { success: false, message: 'Unknown alchemy recipe' };
  }

  // --- DUNGEON TELEPORTATION ---
  public teleportToMap(mapId: MapId, x: number = 220, y: number = 650) {
    this.profile.currentMap = mapId;
    this.profile.x = x;
    this.profile.y = y;
    soundEffects.playPortal();
    this.recomputeStats();
    this.save();
    this.addSystemMessage(`Dungeon Expedition: Arrived at ${MAPS[mapId]?.name || mapId}!`);
    const win = window as unknown as { __phaserWorldScene?: { switchMap?: (m: MapId, x: number, y: number) => void } };
    if (win.__phaserWorldScene?.switchMap) {
      win.__phaserWorldScene.switchMap(mapId, x, y);
    }
  }

  public sellItem(inventoryId: string, quantity: number = 1) {
    const itemSlot = this.profile.inventory.find((i) => i.id === inventoryId);
    if (!itemSlot) return;

    const itemDef = ITEM_CATALOG[itemSlot.itemId];
    if (!itemDef) return;

    const totalGold = itemDef.sellPrice * quantity;
    this.removeItem(inventoryId, quantity);
    this.addGold(totalGold);
    soundEffects.playCoin();
    this.addSystemMessage(`Sold ${quantity}x ${itemDef.name} for ${totalGold} Gold.`);
  }

  public buyItem(itemId: string): boolean {
    const itemDef = ITEM_CATALOG[itemId];
    if (!itemDef || !itemDef.buyPrice) return false;

    if (this.profile.gold < itemDef.buyPrice) {
      this.addSystemMessage('Not enough gold!');
      return false;
    }

    if (this.profile.inventory.length >= 28) {
      this.addSystemMessage('Inventory is full!');
      return false;
    }

    this.profile.gold -= itemDef.buyPrice;
    this.addItem(itemId, 1);
    soundEffects.playCoin();
    this.addSystemMessage(`Purchased ${itemDef.name} for ${itemDef.buyPrice} Gold.`);
    this.notify();
    this.save();
    return true;
  }

  // --- CONSUMABLES & POTIONS ---
  public useConsumable(itemId: string): boolean {
    const itemDef = ITEM_CATALOG[itemId];
    if (!itemDef || !itemDef.effect) return false;

    const inv = this.profile.inventory.find((i) => i.itemId === itemId);
    if (!inv || inv.quantity <= 0) {
      this.addSystemMessage(`You have no ${itemDef.name} left.`);
      return false;
    }

    if (itemDef.effect.hpRestore) {
      if (this.profile.currentHp >= this.derivedStats.maxHp) {
        this.addSystemMessage('Your HP is already full.');
        return false;
      }
      this.profile.currentHp = Math.min(this.derivedStats.maxHp, this.profile.currentHp + itemDef.effect.hpRestore);
      this.addFloatingText(`+${itemDef.effect.hpRestore} HP`, this.profile.x, this.profile.y - 30, '#22c55e', false, false, true);
      soundEffects.playDrinkPotion();
    }

    if (itemDef.effect.mpRestore) {
      if (this.profile.currentMp >= this.derivedStats.maxMp) {
        this.addSystemMessage('Your MP is already full.');
        return false;
      }
      this.profile.currentMp = Math.min(this.derivedStats.maxMp, this.profile.currentMp + itemDef.effect.mpRestore);
      this.addFloatingText(`+${itemDef.effect.mpRestore} MP`, this.profile.x, this.profile.y - 30, '#38bdf8');
      soundEffects.playDrinkPotion();
    }

    if (itemDef.effect.teleportToTown) {
      this.profile.currentMap = 'dawnshire';
      this.profile.x = 520;
      this.profile.y = 450;
      soundEffects.playPortal();
      this.addSystemMessage('Teleported safely to Dawnshire Village!');
    }

    if (itemDef.effect.petExp) {
      if (this.profile.activePet) {
        this.addPetExp(itemDef.effect.petExp);
        this.profile.activePet.loyalty = Math.min(100, this.profile.activePet.loyalty + 8);
        soundEffects.playPetHappy();
        this.addSystemMessage(`Fed ${this.profile.activePet.name}! Loyalty increased.`);
      } else {
        this.addSystemMessage('No active pet summoned to feed!');
        return false;
      }
    }

    this.removeItem(inv.id, 1);
    this.notify();
    this.save();
    return true;
  }

  // --- PET SYSTEM ---
  public hatchPetEgg(inventoryId: string) {
    const inv = this.profile.inventory.find((i) => i.id === inventoryId);
    if (!inv || inv.itemId !== 'pet_egg_sproutling') return;

    const newPet: PetCompanion = {
      id: 'pet_' + Date.now(),
      speciesId: 'sproutling',
      name: 'Sproutling',
      level: 1,
      exp: 0,
      maxExp: 100,
      loyalty: 50,
      active: true,
      bonusDesc: '+8% Move Speed & +5 ATK',
      color: '#4ade80',
    };

    this.removeItem(inventoryId, 1);
    this.profile.activePet = newPet;
    soundEffects.playPetHappy();
    this.addSystemMessage('Congratulations! Your Sproutling Pet Egg hatched into a loyal companion!');
    this.notify();
    this.save();
  }

  public togglePetSummon() {
    if (!this.profile.activePet) return;
    this.profile.activePet.active = !this.profile.activePet.active;
    soundEffects.playPetHappy();
    this.notify();
    this.save();
  }

  public addPetExp(expAmount: number) {
    if (!this.profile.activePet) return;
    const pet = this.profile.activePet;
    pet.exp += expAmount;
    if (pet.exp >= pet.maxExp) {
      pet.exp -= pet.maxExp;
      pet.level += 1;
      pet.maxExp = Math.floor(pet.maxExp * 1.5);
      pet.loyalty = Math.min(100, pet.loyalty + 10);
      soundEffects.playPetHappy();
      this.addSystemMessage(`Companion ${pet.name} leveled up to Lv ${pet.level}!`);
    }
  }

  // --- QUEST SYSTEM ---
  public acceptQuest(questId: string) {
    const qDef = QUEST_CATALOG[questId];
    if (!qDef) return;

    if (this.profile.quests[questId]) {
      this.addSystemMessage('You have already taken this quest.');
      return;
    }

    const counts: Record<string, number> = {};
    qDef.requirements.forEach((r) => {
      if (r.type === 'collect') {
        // Count how many player already holds in inventory
        const held = this.profile.inventory
          .filter((i) => i.itemId === r.targetId)
          .reduce((sum, item) => sum + item.quantity, 0);
        counts[r.targetId] = held;
      } else {
        counts[r.targetId] = 0;
      }
    });

    const isComplete = this.isQuestRequirementsMet(qDef, counts);

    this.profile.quests[questId] = {
      questId,
      currentCounts: counts,
      completed: isComplete,
      turnedIn: false,
    };

    soundEffects.playCoin();
    this.addSystemMessage(`Accepted Quest: [${qDef.title}] from ${qDef.giverName}.`);
    this.notify();
    this.save();
  }

  public onMonsterKilled(monsterId: string) {
    let anyQuestUpdated = false;
    for (const qId in this.profile.quests) {
      const qProg = this.profile.quests[qId];
      if (qProg.completed || qProg.turnedIn) continue;

      const qDef = QUEST_CATALOG[qId];
      if (!qDef) continue;

      const req = qDef.requirements.find((r) => r.type === 'kill' && r.targetId === monsterId);
      if (req) {
        qProg.currentCounts[monsterId] = (qProg.currentCounts[monsterId] || 0) + 1;
        anyQuestUpdated = true;
        this.addSystemMessage(`Quest [${qDef.title}]: Defeated ${req.targetName} (${qProg.currentCounts[monsterId]}/${req.required})`);
        
        if (this.isQuestRequirementsMet(qDef, qProg.currentCounts)) {
          qProg.completed = true;
          soundEffects.playQuestComplete();
          this.addSystemMessage(`Quest [${qDef.title}] Objectives Completed! Return to ${qDef.giverName} for your reward.`);
        }
      }
    }

    if (anyQuestUpdated) {
      this.notify();
      this.save();
    }
  }

  private checkQuestCollectionProgress(itemId: string) {
    for (const qId in this.profile.quests) {
      const qProg = this.profile.quests[qId];
      if (qProg.completed || qProg.turnedIn) continue;

      const qDef = QUEST_CATALOG[qId];
      if (!qDef) continue;

      const req = qDef.requirements.find((r) => r.type === 'collect' && r.targetId === itemId);
      if (req) {
        const held = this.profile.inventory
          .filter((i) => i.itemId === itemId)
          .reduce((sum, item) => sum + item.quantity, 0);
        qProg.currentCounts[itemId] = held;

        if (this.isQuestRequirementsMet(qDef, qProg.currentCounts)) {
          qProg.completed = true;
          soundEffects.playQuestComplete();
          this.addSystemMessage(`Quest [${qDef.title}] Objectives Completed! Return to ${qDef.giverName}.`);
        }
      }
    }
  }

  private isQuestRequirementsMet(qDef: typeof QUEST_CATALOG[string], counts: Record<string, number>): boolean {
    return qDef.requirements.every((r) => (counts[r.targetId] || 0) >= r.required);
  }

  public completeQuest(questId: string): boolean {
    const qProg = this.profile.quests[questId];
    const qDef = QUEST_CATALOG[questId];
    if (!qProg || !qDef || qProg.turnedIn) return false;

    // Deduct collected items from inventory if collect quest
    for (const req of qDef.requirements) {
      if (req.type === 'collect') {
        let remainingToDeduct = req.required;
        for (let i = this.profile.inventory.length - 1; i >= 0; i--) {
          const invItem = this.profile.inventory[i];
          if (invItem.itemId === req.targetId) {
            if (invItem.quantity <= remainingToDeduct) {
              remainingToDeduct -= invItem.quantity;
              this.profile.inventory.splice(i, 1);
            } else {
              invItem.quantity -= remainingToDeduct;
              remainingToDeduct = 0;
            }
          }
          if (remainingToDeduct <= 0) break;
        }
      }
    }

    qProg.turnedIn = true;
    soundEffects.playQuestComplete();

    // Give rewards
    this.addExp(qDef.reward.exp);
    this.addGold(qDef.reward.gold);
    if (qDef.reward.items) {
      qDef.reward.items.forEach((rew) => {
        this.addItem(rew.itemId, rew.quantity);
      });
    }

    this.addSystemMessage(`Quest [${qDef.title}] turned in! +${qDef.reward.exp} EXP and +${qDef.reward.gold} Gold.`);
    this.notify();
    this.save();
    return true;
  }

  // --- JOB PROMOTION ---
  public promoteJob(newJob: PlayerProfile['job']) {
    if (this.profile.level < 10) {
      this.addSystemMessage('You must reach Level 10 before choosing a 1st Job specialization.');
      return;
    }
    this.profile.job = newJob;
    this.recomputeStats();
    soundEffects.playLevelUp();
    this.addSystemMessage(`Congratulations! You have been promoted to ${newJob.toUpperCase()}!`);
    this.notify();
    this.save();
  }

  // --- GROUND DROPS ---
  public spawnGroundDrop(itemId: string, quantity: number, x: number, y: number) {
    const itemDef = ITEM_CATALOG[itemId];
    if (!itemDef) return;

    const drop: GroundDropItem = {
      id: 'drop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      itemId,
      quantity,
      x: x + (Math.random() * 24 - 12),
      y: y + (Math.random() * 24 - 12),
      rarity: itemDef.rarity,
      createdAt: Date.now(),
    };

    this.groundDrops.push(drop);
    soundEffects.playItemDrop();
    this.notifyDrops();
  }

  public pickupDrop(dropId: string): boolean {
    const idx = this.groundDrops.findIndex((d) => d.id === dropId);
    if (idx === -1) return false;

    const drop = this.groundDrops[idx];
    const success = this.addItem(drop.itemId, drop.quantity);
    if (success) {
      this.groundDrops.splice(idx, 1);
      soundEffects.playItemPickup();
      const def = ITEM_CATALOG[drop.itemId];
      this.addFloatingText(`+${drop.quantity} ${def?.name || 'Item'}`, drop.x, drop.y - 15, '#facc15');
      this.notifyDrops();
      return true;
    }
    return false;
  }

  public getGroundDrops(): GroundDropItem[] {
    return this.groundDrops;
  }

  // --- CHAT SYSTEM ---
  public addChatMessage(sender: string, text: string, channel: 'all' | 'system' | 'combat' = 'all') {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg: ChatMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender,
      text,
      channel,
      timestamp: time,
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
    this.notifyChat();
  }

  public addSystemMessage(text: string) {
    this.addChatMessage('System', text, 'system');
  }

  public addCombatMessage(text: string) {
    this.addChatMessage('Combat', text, 'combat');
  }

  // --- FLOATING TEXT ---
  public addFloatingText(
    text: string, 
    x: number, 
    y: number, 
    color: string = '#ffffff', 
    isCrit: boolean = false,
    isExp: boolean = false,
    isHeal: boolean = false
  ) {
    const ft: FloatingText = {
      id: 'ft_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text,
      x,
      y,
      color,
      isCrit,
      isExp,
      isHeal,
      createdAt: Date.now(),
      duration: 1200,
    };
    this.floatingTexts.push(ft);
    setTimeout(() => {
      const idx = this.floatingTexts.findIndex((f) => f.id === ft.id);
      if (idx !== -1) this.floatingTexts.splice(idx, 1);
    }, 1200);
  }

  public getFloatingTexts(): FloatingText[] {
    return this.floatingTexts;
  }

  public updatePlayerPosition(x: number, y: number, mapId?: MapId) {
    this.profile.x = Math.round(x);
    this.profile.y = Math.round(y);
    if (mapId) this.profile.currentMap = mapId;
  }
}

export const gameState = new GameStateManager();
