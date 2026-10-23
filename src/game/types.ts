/**
 * Etheria Chronicles - Core Type Definitions
 */

export type JobClass = 'novice' | 'warrior' | 'mage' | 'archer' | 'acolyte';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type ItemCategory = 
  | 'weapon' 
  | 'shield' 
  | 'headgear' 
  | 'armor' 
  | 'pants' 
  | 'boots' 
  | 'accessory' 
  | 'consumable' 
  | 'material' 
  | 'pet_item'
  | 'refine_material';

export type WeaponType = 'sword' | 'dagger' | 'staff' | 'bow' | 'mace' | 'spear';

export interface BaseStats {
  str: number; // Attack & physical scaling
  agi: number; // Attack speed & evasion
  vit: number; // Max HP & physical defense
  int: number; // Magic attack & max MP
  dex: number; // Accuracy & cast speed
  luk: number; // Critical hit rate & drop luck
}

export interface DerivedStats {
  maxHp: number;
  maxMp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  critRate: number; // 0-100%
  critDmg: number;  // 1.5 default multiplier
  aspd: number;     // Attacks per second (e.g. 1.25)
  moveSpeed: number; // Pixels per second (e.g. 140)
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  weaponType?: WeaponType;
  rarity: ItemRarity;
  levelReq: number;
  jobReq?: JobClass[];
  icon: string;
  sellPrice: number;
  buyPrice?: number;
  refinement?: number; // +0 to +10 refinement level
  sockets?: number; // 0 to 2 card sockets
  specialEffect?: string;
  // Stat bonuses when equipped
  stats?: Partial<BaseStats> & {
    atk?: number;
    matk?: number;
    def?: number;
    mdef?: number;
    hpBonus?: number;
    mpBonus?: number;
    critBonus?: number;
  };
  // Consumable effects
  effect?: {
    hpRestore?: number;
    mpRestore?: number;
    teleportToTown?: boolean;
    petExp?: number;
    buffType?: 'berserk' | 'elixir';
    buffDuration?: number;
  };
}

export interface InventoryItem {
  id: string; // unique instance id
  itemId: string;
  quantity: number;
  refinement?: number;
}

export type EquipmentSlot = 
  | 'mainHand' 
  | 'offHand' 
  | 'headgear' 
  | 'armor' 
  | 'pants' 
  | 'boots' 
  | 'accessory1' 
  | 'accessory2';

export type EquipmentState = Partial<Record<EquipmentSlot, ItemDefinition>>;

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  job: JobClass;
  levelReq: number;
  mpCost: number;
  cooldown: number; // in seconds
  range: number;    // in pixels
  damageMult: number; // e.g. 1.8 for 180%
  isMagic?: boolean;
  isHeal?: boolean;
  healPercent?: number;
  icon: string;
  animationType: 'slash' | 'thrust' | 'fire' | 'heal' | 'buff';
}

export interface DropTableEntry {
  itemId: string;
  chance: number; // 0.0 to 1.0 (e.g. 0.05 is 5%)
  minQty: number;
  maxQty: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  atk: number;
  def: number;
  mdef: number;
  expReward: number;
  goldReward: number;
  aggroRadius: number;
  attackRange: number;
  attackCooldown: number; // seconds
  moveSpeed: number;
  spriteKey: string;
  color: string;
  isElite?: boolean;
  isBoss?: boolean;
  drops: DropTableEntry[];
  telegraphAttack?: boolean;
}

export interface ActiveMonster {
  instanceId: string;
  templateId: string;
  name: string;
  level: number;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  hp: number;
  maxHp: number;
  state: 'idle' | 'chase' | 'attack' | 'return' | 'hurt' | 'dead';
  targetPlayer: boolean;
  lastAttackTime: number;
  stateTimer: number;
  color: string;
  isElite?: boolean;
  telegraphing?: boolean;
  telegraphEnd?: number;
}

export interface GroundDropItem {
  id: string;
  itemId: string;
  quantity: number;
  x: number;
  y: number;
  rarity: ItemRarity;
  createdAt: number;
}

export interface PetCompanion {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  loyalty: number; // 0-100
  active: boolean;
  bonusDesc: string;
  color: string;
}

export interface QuestRequirement {
  type: 'kill' | 'collect';
  targetId: string; // monsterId or itemId
  targetName: string;
  required: number;
}

export interface QuestReward {
  exp: number;
  gold: number;
  items?: { itemId: string; quantity: number }[];
}

export interface QuestDefinition {
  id: string;
  title: string;
  giverName: string;
  description: string;
  levelReq: number;
  requirements: QuestRequirement[];
  reward: QuestReward;
}

export interface QuestProgress {
  questId: string;
  currentCounts: Record<string, number>;
  completed: boolean;
  turnedIn: boolean;
}

export type MapId = 
  | 'dawnshire' 
  | 'verdant_fields' 
  | 'whisperwood'
  | 'sunken_ruins'
  | 'frostpeak_mountains'
  | 'crimson_desert'
  | 'celestial_tower';

export interface PortalDefinition {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetMap: MapId;
  targetX: number;
  targetY: number;
  label: string;
  levelReq?: number;
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: 
    | 'weapon_merchant' 
    | 'goods_merchant' 
    | 'job_instructor' 
    | 'pet_handler' 
    | 'elder'
    | 'alchemist'
    | 'refinement_master'
    | 'dungeon_guide'
    | 'guild_master';
  title: string;
  x: number;
  y: number;
  dialogue: string[];
  shopItems?: string[]; // item IDs
  givesQuestIds?: string[];
}

export interface GatherableNode {
  id: string;
  type: 'herb' | 'mineral';
  name: string;
  x: number;
  y: number;
  itemId: string;
  respawnTime: number;
  lastGathered?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
  isExp?: boolean;
  isHeal?: boolean;
  createdAt: number;
  duration: number;
}

export interface PlayerCustomization {
  name: string;
  gender: 'male' | 'female';
  hairStyle: number; // 1-4
  hairColor: string; // hex
  outfitColor: string; // hex
}

export interface PlayerProfile {
  id: string;
  customization: PlayerCustomization;
  job: JobClass;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  jobLevel: number;
  jobExp: number;
  jobExpToNextLevel: number;
  gold: number;
  statPoints: number;
  skillPoints: number;
  baseStats: BaseStats;
  currentHp: number;
  currentMp: number;
  x: number;
  y: number;
  currentMap: MapId;
  inventory: InventoryItem[];
  equipment: EquipmentState;
  activePet?: PetCompanion;
  quests: Record<string, QuestProgress>;
  learnedSkills: Record<string, number>; // skillId -> level
  hotbar: (string | null)[]; // 4 skill slots
}
