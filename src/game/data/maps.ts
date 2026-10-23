/**
 * Etheria Chronicles - Maps, Spawns, NPCs, and Portals
 */

import { GatherableNode, MapId, NpcDefinition, PortalDefinition } from '../types';

export interface MonsterSpawnConfig {
  templateId: string;
  x: number;
  y: number;
  roamRadius: number;
  respawnSeconds: number;
}

export interface MapObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'building' | 'tree' | 'water' | 'fence' | 'ruin' | 'dummy' | 'pillar' | 'coral' | 'pine' | 'ice' | 'dune' | 'cacti' | 'celestial_pillar';
}

export interface MapData {
  id: MapId;
  name: string;
  theme: string;
  width: number;
  height: number;
  bgColor: string;
  portals: PortalDefinition[];
  npcs: NpcDefinition[];
  monsters: MonsterSpawnConfig[];
  obstacles: MapObstacle[];
  gatherables: GatherableNode[];
}

export const MAPS: Record<MapId, MapData> = {
  dawnshire: {
    id: 'dawnshire',
    name: 'Dawnshire Village',
    theme: 'peaceful_town',
    width: 1200,
    height: 900,
    bgColor: '#3b82f6',
    portals: [
      {
        id: 'portal_to_fields',
        x: 1140,
        y: 450,
        radius: 36,
        targetMap: 'verdant_fields',
        targetX: 90,
        targetY: 550,
        label: 'To Verdant Fields →',
      },
    ],
    npcs: [
      {
        id: 'npc_blacksmith',
        name: 'Roger',
        role: 'weapon_merchant',
        title: 'Village Blacksmith',
        x: 280,
        y: 280,
        dialogue: [
          'Welcome to the Forge of Dawnshire! Need a sturdy blade or buckler?',
          'The wild beasts outside have been restless lately. Best keep your gear in prime condition!',
        ],
        shopItems: [
          'novice_knife',
          'wooden_sword',
          'iron_broadsword',
          'apprentice_staff',
          'hunter_bow',
          'novice_shield',
          'novice_cotton_shirt',
          'leather_vest',
          'novice_cap',
          'cloth_trousers',
          'worn_boots',
        ],
        givesQuestIds: ['quest_blacksmith_supplies'],
      },
      {
        id: 'npc_merchant',
        name: 'Kelly',
        role: 'goods_merchant',
        title: 'General Goods & Potions',
        x: 740,
        y: 280,
        dialogue: [
          'Freshly brewed herbs and alchemical draughts! Never step into the wilds without Red Potions.',
          'Looking to nurture a companion? I also sell delicious pet cookies!',
        ],
        shopItems: [
          'red_potion',
          'blue_potion',
          'pet_treat',
          'butterfly_wing',
          'copper_ring',
        ],
      },
      {
        id: 'npc_elder',
        name: 'Elder Althea',
        role: 'elder',
        title: 'Village Elder',
        x: 520,
        y: 200,
        dialogue: [
          'Greetings, young traveler. May the blessing of Etheria watch over your footsteps.',
          'Speak to the Job Instructor once you reach Level 10 to choose your specialized destiny.',
        ],
        givesQuestIds: ['quest_mosslings', 'quest_whisperwood_terror'],
      },
      {
        id: 'npc_instructor',
        name: 'Thorne',
        role: 'job_instructor',
        title: 'Master Job Instructor',
        x: 880,
        y: 480,
        dialogue: [
          'A novice today, a legend tomorrow. Train hard, distribute your stats wisely, and unlock your true potential.',
          'At Level 10, I can promote you into a Warrior, Mage, Archer, or Acolyte!',
        ],
      },
      {
        id: 'npc_pet_handler',
        name: 'Mimi',
        role: 'pet_handler',
        title: 'Companion Caretaker',
        x: 320,
        y: 620,
        dialogue: [
          'Creatures in Etheria are wonderful friends if treated with love!',
          'Bring me forest materials, and I will help you hatch a loyal Sproutling pet!',
        ],
        givesQuestIds: ['quest_pet_companion'],
      },
      {
        id: 'npc_alchemist',
        name: 'Celine',
        role: 'alchemist',
        title: 'Grand Alchemist',
        x: 750,
        y: 620,
        dialogue: [
          'Welcome to the Alchemy Laboratory. I distill raw herbs, aqua crystals, and minerals into potent restorative elixirs!',
          'Need greater healing power for challenging dungeons? Bring me materials to brew greater potions.',
        ],
        shopItems: [
          'greater_red_potion',
          'greater_blue_potion',
          'berserk_elixir',
        ],
      },
      {
        id: 'npc_refiner',
        name: 'Walter',
        role: 'refinement_master',
        title: 'Refinement Master',
        x: 200,
        y: 420,
        dialogue: [
          'Looking to draw out the dormant power of your arms and armor? I am Walter, master of the anvil!',
          'Bring me Oridecon for weapons or Elunium for armors. Safe refinement up to +4 is guaranteed!',
        ],
      },
      {
        id: 'npc_dungeon_guide',
        name: 'Ralph',
        role: 'dungeon_guide',
        title: 'Dungeon Expedition Guide',
        x: 940,
        y: 280,
        dialogue: [
          'Etheria holds vast sunken ruins, frozen peaks, scorching deserts, and celestial spires.',
          'Are you prepared to face the Tide Lord, the Sand King, or the Sky Guardian? Choose your expedition!',
        ],
      },
      {
        id: 'npc_guild_master',
        name: 'Vane',
        role: 'guild_master',
        title: 'Knights Guild Master',
        x: 480,
        y: 340,
        dialogue: [
          'Stand tall, champion! The realm needs heroes of your caliber to brave the high-level frontiers.',
          'Form alliances, hone your skills, and challenge the legendary world bosses.',
        ],
      },
      {
        id: 'npc_training_dummy',
        name: 'Training Dummy',
        role: 'elder', // interactive
        title: 'Combat Practice Dummy',
        x: 600,
        y: 600,
        dialogue: ['(A reinforced straw dummy designed to withstand countless blade slashes and spells.)'],
      },
    ],
    monsters: [], // Town is safe!
    obstacles: [
      // Blacksmith shop building
      { x: 200, y: 180, width: 160, height: 110, type: 'building' },
      // Goods store building
      { x: 670, y: 180, width: 150, height: 110, type: 'building' },
      // Town hall / Elder manor
      { x: 440, y: 80, width: 170, height: 110, type: 'building' },
      // Town walls / fence bounds
      { x: 0, y: 0, width: 1200, height: 40, type: 'fence' },
      { x: 0, y: 860, width: 1200, height: 40, type: 'fence' },
      { x: 0, y: 40, width: 40, height: 820, type: 'fence' },
      { x: 1160, y: 40, width: 40, height: 360, type: 'fence' },
      { x: 1160, y: 530, width: 40, height: 330, type: 'fence' },
      // Central fountain plaza
      { x: 500, y: 400, width: 90, height: 90, type: 'water' },
      // Garden trees
      { x: 100, y: 350, width: 60, height: 80, type: 'tree' },
      { x: 100, y: 480, width: 60, height: 80, type: 'tree' },
      { x: 1000, y: 200, width: 70, height: 90, type: 'tree' },
      { x: 1000, y: 680, width: 70, height: 90, type: 'tree' },
      { x: 420, y: 700, width: 60, height: 80, type: 'tree' },
      { x: 780, y: 700, width: 60, height: 80, type: 'tree' },
    ],
    gatherables: [],
  },

  verdant_fields: {
    id: 'verdant_fields',
    name: 'Verdant Fields',
    theme: 'grassy_meadows',
    width: 1800,
    height: 1200,
    bgColor: '#16a34a',
    portals: [
      {
        id: 'portal_back_to_dawnshire',
        x: 60,
        y: 550,
        radius: 36,
        targetMap: 'dawnshire',
        targetX: 1080,
        targetY: 450,
        label: '← To Dawnshire Village',
      },
      {
        id: 'portal_to_whisperwood',
        x: 1740,
        y: 600,
        radius: 36,
        targetMap: 'whisperwood',
        targetX: 100,
        targetY: 700,
        label: 'To Whisperwood Forest →',
      },
      {
        id: 'portal_to_sunken_ruins',
        x: 900,
        y: 1140,
        radius: 40,
        targetMap: 'sunken_ruins',
        targetX: 120,
        targetY: 650,
        label: '↓ Sunken Ruins (Lv 20+)',
        levelReq: 20,
      },
    ],
    npcs: [
      {
        id: 'npc_ranger_finn',
        name: 'Finn',
        role: 'elder',
        title: 'Verdant Field Ranger',
        x: 320,
        y: 460,
        dialogue: [
          'Be on guard, adventurer! The Mosslings are mild, but the beetles have tough shells, and wolves hunt near the woods.',
          'Need assistance or bounties? I have plenty of field survey tasks.',
        ],
        givesQuestIds: ['quest_slime_menace', 'quest_wolf_hunt'],
      },
    ],
    monsters: [
      // Mosslings (Beginner)
      { templateId: 'mossling', x: 450, y: 320, roamRadius: 90, respawnSeconds: 5 },
      { templateId: 'mossling', x: 580, y: 480, roamRadius: 90, respawnSeconds: 5 },
      { templateId: 'mossling', x: 500, y: 780, roamRadius: 90, respawnSeconds: 5 },
      { templateId: 'mossling', x: 720, y: 320, roamRadius: 90, respawnSeconds: 5 },

      // Gooey Sproutlings
      { templateId: 'sprout_slime', x: 800, y: 550, roamRadius: 100, respawnSeconds: 6 },
      { templateId: 'sprout_slime', x: 920, y: 360, roamRadius: 100, respawnSeconds: 6 },
      { templateId: 'sprout_slime', x: 880, y: 820, roamRadius: 100, respawnSeconds: 6 },
      { templateId: 'sprout_slime', x: 1060, y: 640, roamRadius: 100, respawnSeconds: 6 },

      // Thornback Beetles
      { templateId: 'thornback_beetle', x: 1180, y: 340, roamRadius: 90, respawnSeconds: 7 },
      { templateId: 'thornback_beetle', x: 1280, y: 520, roamRadius: 90, respawnSeconds: 7 },
      { templateId: 'thornback_beetle', x: 1220, y: 860, roamRadius: 90, respawnSeconds: 7 },
      { templateId: 'thornback_beetle', x: 1360, y: 740, roamRadius: 90, respawnSeconds: 7 },

      // Wildfang Wolves (East side near forest entrance)
      { templateId: 'wildfang_wolf', x: 1520, y: 420, roamRadius: 120, respawnSeconds: 9 },
      { templateId: 'wildfang_wolf', x: 1560, y: 780, roamRadius: 120, respawnSeconds: 9 },
      { templateId: 'wildfang_wolf', x: 1650, y: 540, roamRadius: 110, respawnSeconds: 9 },
    ],
    obstacles: [
      // River bisecting middle with bridge gap
      { x: 760, y: 0, width: 45, height: 460, type: 'water' },
      { x: 760, y: 640, width: 45, height: 560, type: 'water' },
      // Boundary edges
      { x: 0, y: 0, width: 1800, height: 35, type: 'tree' },
      { x: 0, y: 1165, width: 1800, height: 35, type: 'tree' },
      { x: 0, y: 35, width: 35, height: 480, type: 'tree' },
      { x: 0, y: 620, width: 35, height: 545, type: 'tree' },
      { x: 1765, y: 35, width: 35, height: 520, type: 'tree' },
      { x: 1765, y: 670, width: 35, height: 495, type: 'tree' },
      // Tree copses & rock clusters
      { x: 380, y: 150, width: 90, height: 100, type: 'tree' },
      { x: 350, y: 880, width: 110, height: 110, type: 'tree' },
      { x: 960, y: 180, width: 100, height: 90, type: 'tree' },
      { x: 1020, y: 920, width: 110, height: 110, type: 'tree' },
      { x: 1420, y: 220, width: 90, height: 90, type: 'tree' },
      { x: 1440, y: 980, width: 100, height: 100, type: 'tree' },
    ],
    gatherables: [
      { id: 'herb_1', type: 'herb', name: 'Wild Herb Bush', x: 260, y: 320, itemId: 'wild_herb', respawnTime: 25 },
      { id: 'herb_2', type: 'herb', name: 'Wild Herb Bush', x: 620, y: 240, itemId: 'wild_herb', respawnTime: 25 },
      { id: 'herb_3', type: 'herb', name: 'Wild Herb Bush', x: 1100, y: 440, itemId: 'wild_herb', respawnTime: 25 },
      { id: 'herb_4', type: 'herb', name: 'Wild Herb Bush', x: 1380, y: 640, itemId: 'wild_herb', respawnTime: 25 },
      { id: 'ore_1', type: 'mineral', name: 'Copper Deposit', x: 500, y: 940, itemId: 'copper_ore', respawnTime: 30 },
      { id: 'ore_2', type: 'mineral', name: 'Copper Deposit', x: 1320, y: 180, itemId: 'copper_ore', respawnTime: 30 },
      { id: 'ore_3', type: 'mineral', name: 'Copper Deposit', x: 1600, y: 920, itemId: 'copper_ore', respawnTime: 30 },
    ],
  },

  whisperwood: {
    id: 'whisperwood',
    name: 'Whisperwood Forest',
    theme: 'mystic_canopy',
    width: 1600,
    height: 1400,
    bgColor: '#064e3b',
    portals: [
      {
        id: 'portal_back_to_fields',
        x: 60,
        y: 700,
        radius: 36,
        targetMap: 'verdant_fields',
        targetX: 1680,
        targetY: 600,
        label: '← To Verdant Fields',
      },
      {
        id: 'portal_to_frostpeak',
        x: 1520,
        y: 300,
        radius: 40,
        targetMap: 'frostpeak_mountains',
        targetX: 120,
        targetY: 650,
        label: '↗ Frostpeak Mountains (Lv 30+)',
        levelReq: 30,
      },
    ],
    npcs: [],
    monsters: [
      // Wolves
      { templateId: 'wildfang_wolf', x: 340, y: 450, roamRadius: 100, respawnSeconds: 8 },
      { templateId: 'wildfang_wolf', x: 400, y: 950, roamRadius: 100, respawnSeconds: 8 },
      { templateId: 'wildfang_wolf', x: 650, y: 350, roamRadius: 100, respawnSeconds: 8 },

      // Ember Sprites
      { templateId: 'ember_sprite', x: 920, y: 320, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'ember_sprite', x: 1180, y: 420, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'ember_sprite', x: 960, y: 1040, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'ember_sprite', x: 1220, y: 980, roamRadius: 110, respawnSeconds: 8 },

      // ELITE MINI-BOSS: Ancient Rootbeast!
      { templateId: 'ancient_rootbeast', x: 1050, y: 700, roamRadius: 140, respawnSeconds: 45 },
    ],
    obstacles: [
      // Map borders
      { x: 0, y: 0, width: 1600, height: 40, type: 'tree' },
      { x: 0, y: 1360, width: 1600, height: 40, type: 'tree' },
      { x: 0, y: 40, width: 40, height: 620, type: 'tree' },
      { x: 0, y: 780, width: 40, height: 580, type: 'tree' },
      { x: 1560, y: 40, width: 40, height: 1320, type: 'tree' },
      // Ancient stone pillars & altar around the boss
      { x: 880, y: 560, width: 50, height: 60, type: 'ruin' },
      { x: 1220, y: 560, width: 50, height: 60, type: 'ruin' },
      { x: 880, y: 840, width: 50, height: 60, type: 'ruin' },
      { x: 1220, y: 840, width: 50, height: 60, type: 'ruin' },
      // Dense ancient trees
      { x: 250, y: 200, width: 120, height: 120, type: 'tree' },
      { x: 520, y: 700, width: 110, height: 120, type: 'tree' },
      { x: 260, y: 1150, width: 120, height: 120, type: 'tree' },
      { x: 1400, y: 220, width: 120, height: 120, type: 'tree' },
      { x: 1380, y: 1180, width: 120, height: 120, type: 'tree' },
    ],
    gatherables: [
      { id: 'whisper_herb_1', type: 'herb', name: 'Luminescent Herb', x: 420, y: 280, itemId: 'wild_herb', respawnTime: 20 },
      { id: 'whisper_herb_2', type: 'herb', name: 'Luminescent Herb', x: 740, y: 1150, itemId: 'wild_herb', respawnTime: 20 },
      { id: 'whisper_ore_1', type: 'mineral', name: 'Ember Ore Deposit', x: 1320, y: 320, itemId: 'copper_ore', respawnTime: 25 },
      { id: 'whisper_ore_2', type: 'mineral', name: 'Ember Ore Deposit', x: 1420, y: 840, itemId: 'copper_ore', respawnTime: 25 },
    ],
  },

  // ==========================================
  // MAP 4: SUNKEN RUINS (Lv 20+)
  // Flooded stone corridors, aquatic temple, Tide Lord Boss!
  // ==========================================
  sunken_ruins: {
    id: 'sunken_ruins',
    name: 'Sunken Ruins (Lv 20+)',
    theme: 'flooded_ruins',
    width: 1800,
    height: 1300,
    bgColor: '#083344',
    portals: [
      {
        id: 'portal_back_to_fields',
        x: 80,
        y: 650,
        radius: 40,
        targetMap: 'verdant_fields',
        targetX: 900,
        targetY: 1060,
        label: '↑ Return to Verdant Fields',
      },
    ],
    npcs: [
      {
        id: 'npc_sunken_scholar',
        name: 'Historian Nerida',
        role: 'elder',
        title: 'Aquatic Archaeologist',
        x: 280,
        y: 620,
        dialogue: [
          'These ruins sank millennia ago during the Great Deluge of Etheria.',
          'Step on the ancient sea altar in the west corridor to unlock the watery sanctum of the Tide Lord!',
        ],
      },
    ],
    monsters: [
      // Aqua Slimes
      { templateId: 'aqua_slime', x: 420, y: 450, roamRadius: 90, respawnSeconds: 6 },
      { templateId: 'aqua_slime', x: 550, y: 850, roamRadius: 90, respawnSeconds: 6 },
      { templateId: 'aqua_slime', x: 680, y: 380, roamRadius: 90, respawnSeconds: 6 },

      // Reef Crabs
      { templateId: 'reef_crab', x: 780, y: 620, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'reef_crab', x: 880, y: 920, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'reef_crab', x: 980, y: 440, roamRadius: 100, respawnSeconds: 7 },

      // Drowned Warriors
      { templateId: 'drowned_warrior', x: 1080, y: 720, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'drowned_warrior', x: 1200, y: 520, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'drowned_warrior', x: 1240, y: 880, roamRadius: 110, respawnSeconds: 8 },

      // Sea Serpents
      { templateId: 'sea_serpent', x: 1360, y: 380, roamRadius: 120, respawnSeconds: 9 },
      { templateId: 'sea_serpent', x: 1420, y: 950, roamRadius: 120, respawnSeconds: 9 },

      // BOSS: TIDE LORD (Lv 35 Boss in the sunken throne)
      { templateId: 'tide_lord', x: 1520, y: 650, roamRadius: 150, respawnSeconds: 50 },
    ],
    obstacles: [
      // Map borders
      { x: 0, y: 0, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 1260, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 40, width: 40, height: 570, type: 'ruin' },
      { x: 0, y: 730, width: 40, height: 530, type: 'ruin' },
      { x: 1760, y: 40, width: 40, height: 1220, type: 'ruin' },
      // Flooded water channels
      { x: 350, y: 150, width: 60, height: 400, type: 'water' },
      { x: 350, y: 750, width: 60, height: 400, type: 'water' },
      // Submerged marble pillars
      { x: 620, y: 280, width: 60, height: 80, type: 'ruin' },
      { x: 620, y: 920, width: 60, height: 80, type: 'ruin' },
      { x: 1050, y: 260, width: 70, height: 90, type: 'ruin' },
      { x: 1050, y: 980, width: 70, height: 90, type: 'ruin' },
      // Inner sanctum barrier pillars
      { x: 1380, y: 150, width: 50, height: 380, type: 'ruin' },
      { x: 1380, y: 780, width: 50, height: 480, type: 'ruin' },
    ],
    gatherables: [
      { id: 'ruins_crystal_1', type: 'mineral', name: 'Aqua Crystal Cluster', x: 500, y: 320, itemId: 'aqua_crystal', respawnTime: 25 },
      { id: 'ruins_crystal_2', type: 'mineral', name: 'Aqua Crystal Cluster', x: 1140, y: 350, itemId: 'aqua_crystal', respawnTime: 25 },
      { id: 'ruins_crystal_3', type: 'mineral', name: 'Aqua Crystal Cluster', x: 880, y: 1100, itemId: 'aqua_crystal', respawnTime: 25 },
    ],
  },

  // ==========================================
  // MAP 5: FROSTPEAK MOUNTAINS (Lv 30+)
  // Snowy pine mountains, frozen rivers, Yeti & Frost Witch!
  // ==========================================
  frostpeak_mountains: {
    id: 'frostpeak_mountains',
    name: 'Frostpeak Mountains (Lv 30+)',
    theme: 'snowy_peaks',
    width: 1800,
    height: 1300,
    bgColor: '#1e293b',
    portals: [
      {
        id: 'portal_back_to_whisper',
        x: 80,
        y: 650,
        radius: 40,
        targetMap: 'whisperwood',
        targetX: 1440,
        targetY: 340,
        label: '↙ To Whisperwood Forest',
      },
      {
        id: 'portal_to_desert',
        x: 1720,
        y: 650,
        radius: 40,
        targetMap: 'crimson_desert',
        targetX: 120,
        targetY: 650,
        label: 'To Crimson Desert (Lv 40+) →',
        levelReq: 40,
      },
    ],
    npcs: [
      {
        id: 'npc_ice_mountaineer',
        name: 'Mountaineer Torvald',
        role: 'elder',
        title: 'Frostpeak Scout',
        x: 260,
        y: 580,
        dialogue: [
          'Brrr! The biting blizzards of Frostpeak spare no novice. Only seasoned heroes should cross the glaciers!',
          'Beyond the ice ridge lies the scorching dunes of the Crimson Desert.',
        ],
      },
    ],
    monsters: [
      // Ice Wolves
      { templateId: 'ice_wolf', x: 420, y: 420, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'ice_wolf', x: 550, y: 820, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'ice_wolf', x: 740, y: 460, roamRadius: 100, respawnSeconds: 7 },

      // Snow Golems
      { templateId: 'snow_golem', x: 860, y: 740, roamRadius: 90, respawnSeconds: 8 },
      { templateId: 'snow_golem', x: 1020, y: 380, roamRadius: 90, respawnSeconds: 8 },
      { templateId: 'snow_golem', x: 1140, y: 880, roamRadius: 90, respawnSeconds: 8 },

      // Frost Witches
      { templateId: 'frost_witch', x: 1260, y: 420, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'frost_witch', x: 1350, y: 780, roamRadius: 110, respawnSeconds: 8 },

      // Yetis
      { templateId: 'yeti', x: 1480, y: 520, roamRadius: 120, respawnSeconds: 10 },
      { templateId: 'yeti', x: 1560, y: 850, roamRadius: 120, respawnSeconds: 10 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 1800, height: 40, type: 'tree' },
      { x: 0, y: 1260, width: 1800, height: 40, type: 'tree' },
      { x: 0, y: 40, width: 40, height: 570, type: 'tree' },
      { x: 0, y: 730, width: 40, height: 530, type: 'tree' },
      { x: 1760, y: 40, width: 40, height: 570, type: 'tree' },
      { x: 1760, y: 730, width: 40, height: 530, type: 'tree' },
      // Frozen river with ice bridge
      { x: 680, y: 40, width: 60, height: 480, type: 'water' },
      { x: 680, y: 680, width: 60, height: 580, type: 'water' },
      // Snow-capped pine clusters
      { x: 380, y: 180, width: 100, height: 110, type: 'tree' },
      { x: 380, y: 980, width: 100, height: 110, type: 'tree' },
      { x: 1120, y: 150, width: 110, height: 110, type: 'tree' },
      { x: 1180, y: 1020, width: 120, height: 110, type: 'tree' },
    ],
    gatherables: [
      { id: 'frost_crystal_1', type: 'mineral', name: 'Frost Shard Vein', x: 480, y: 320, itemId: 'frost_shard', respawnTime: 25 },
      { id: 'frost_crystal_2', type: 'mineral', name: 'Frost Shard Vein', x: 1240, y: 280, itemId: 'frost_shard', respawnTime: 25 },
    ],
  },

  // ==========================================
  // MAP 6: CRIMSON DESERT (Lv 40+)
  // Vast orange dunes, sandstone temples, Sand King Boss!
  // ==========================================
  crimson_desert: {
    id: 'crimson_desert',
    name: 'Crimson Desert (Lv 40+)',
    theme: 'desert_dunes',
    width: 1800,
    height: 1300,
    bgColor: '#7c2d12',
    portals: [
      {
        id: 'portal_back_to_frost',
        x: 80,
        y: 650,
        radius: 40,
        targetMap: 'frostpeak_mountains',
        targetX: 1660,
        targetY: 650,
        label: '← To Frostpeak Mountains',
      },
      {
        id: 'portal_to_celestial',
        x: 1720,
        y: 650,
        radius: 40,
        targetMap: 'celestial_tower',
        targetX: 120,
        targetY: 650,
        label: 'To Celestial Tower (Lv 50+) →',
        levelReq: 50,
      },
    ],
    npcs: [
      {
        id: 'npc_nomad',
        name: 'Nomad Rashid',
        role: 'elder',
        title: 'Desert Nomad Caravan',
        x: 280,
        y: 580,
        dialogue: [
          'Beware the subterranean rumblings under the crimson sands! The Sand King sleeps beneath the pyramid.',
          'Ancient golems and lethal assassins prowl these ruins.',
        ],
      },
    ],
    monsters: [
      // Desert Scorpions
      { templateId: 'desert_scorpion', x: 420, y: 400, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'desert_scorpion', x: 540, y: 840, roamRadius: 100, respawnSeconds: 7 },
      { templateId: 'desert_scorpion', x: 680, y: 480, roamRadius: 100, respawnSeconds: 7 },

      // Sand Worms
      { templateId: 'sand_worm', x: 820, y: 720, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'sand_worm', x: 920, y: 380, roamRadius: 110, respawnSeconds: 8 },

      // Desert Assassins
      { templateId: 'desert_assassin', x: 1050, y: 550, roamRadius: 120, respawnSeconds: 9 },
      { templateId: 'desert_assassin', x: 1120, y: 880, roamRadius: 120, respawnSeconds: 9 },

      // Ancient Golems
      { templateId: 'ancient_golem', x: 1280, y: 420, roamRadius: 90, respawnSeconds: 10 },
      { templateId: 'ancient_golem', x: 1380, y: 850, roamRadius: 90, respawnSeconds: 10 },

      // BOSS: SAND KING (Lv 45 Boss)
      { templateId: 'sand_king', x: 1540, y: 650, roamRadius: 150, respawnSeconds: 50 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 1260, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 40, width: 40, height: 570, type: 'ruin' },
      { x: 0, y: 730, width: 40, height: 530, type: 'ruin' },
      { x: 1760, y: 40, width: 40, height: 570, type: 'ruin' },
      { x: 1760, y: 730, width: 40, height: 530, type: 'ruin' },
      // Desert ruins & sand stone blocks
      { x: 500, y: 220, width: 90, height: 90, type: 'ruin' },
      { x: 500, y: 920, width: 90, height: 90, type: 'ruin' },
      { x: 960, y: 180, width: 110, height: 100, type: 'ruin' },
      { x: 960, y: 960, width: 110, height: 100, type: 'ruin' },
      // Desert temple pillars
      { x: 1400, y: 350, width: 60, height: 80, type: 'ruin' },
      { x: 1400, y: 880, width: 60, height: 80, type: 'ruin' },
    ],
    gatherables: [
      { id: 'desert_ore_1', type: 'mineral', name: 'Crimson Sunstone Deposit', x: 620, y: 320, itemId: 'sand_gem', respawnTime: 30 },
      { id: 'desert_ore_2', type: 'mineral', name: 'Crimson Sunstone Deposit', x: 1200, y: 980, itemId: 'sand_gem', respawnTime: 30 },
    ],
  },

  // ==========================================
  // MAP 7: CELESTIAL TOWER (Lv 50+)
  // Floating sky islands, celestial ruins, Sky Guardian Boss!
  // ==========================================
  celestial_tower: {
    id: 'celestial_tower',
    name: 'Celestial Tower (Lv 50+)',
    theme: 'floating_islands',
    width: 1800,
    height: 1400,
    bgColor: '#1e1b4b',
    portals: [
      {
        id: 'portal_back_to_desert',
        x: 80,
        y: 650,
        radius: 40,
        targetMap: 'crimson_desert',
        targetX: 1660,
        targetY: 650,
        label: '← To Crimson Desert',
      },
      {
        id: 'portal_return_town',
        x: 1720,
        y: 650,
        radius: 40,
        targetMap: 'dawnshire',
        targetX: 520,
        targetY: 450,
        label: '⚡ Celestial Warp to Dawnshire',
      },
    ],
    npcs: [
      {
        id: 'npc_archon',
        name: 'Archon Lysander',
        role: 'elder',
        title: 'Celestial Spire Watcher',
        x: 280,
        y: 580,
        dialogue: [
          'Welcome to the apex of Etheria. Here, the heavens touch the clouds.',
          'The Sky Guardian tests all mortals who seek ascension into mythic glory.',
        ],
      },
    ],
    monsters: [
      // Sky Harpies
      { templateId: 'sky_harpy', x: 440, y: 420, roamRadius: 110, respawnSeconds: 7 },
      { templateId: 'sky_harpy', x: 560, y: 880, roamRadius: 110, respawnSeconds: 7 },
      { templateId: 'sky_harpy', x: 720, y: 520, roamRadius: 110, respawnSeconds: 7 },

      // Cloud Spirits
      { templateId: 'cloud_spirit', x: 860, y: 380, roamRadius: 110, respawnSeconds: 8 },
      { templateId: 'cloud_spirit', x: 940, y: 920, roamRadius: 110, respawnSeconds: 8 },

      // Celestial Mages
      { templateId: 'celestial_mage', x: 1080, y: 620, roamRadius: 120, respawnSeconds: 9 },
      { templateId: 'celestial_mage', x: 1180, y: 420, roamRadius: 120, respawnSeconds: 9 },

      // Sky Dragons
      { templateId: 'sky_dragon', x: 1320, y: 850, roamRadius: 130, respawnSeconds: 10 },
      { templateId: 'sky_dragon', x: 1380, y: 480, roamRadius: 130, respawnSeconds: 10 },

      // BOSS: SKY GUARDIAN (Lv 60 Boss)
      { templateId: 'sky_guardian', x: 1540, y: 650, roamRadius: 160, respawnSeconds: 50 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 1360, width: 1800, height: 40, type: 'ruin' },
      { x: 0, y: 40, width: 40, height: 570, type: 'ruin' },
      { x: 0, y: 730, width: 40, height: 630, type: 'ruin' },
      { x: 1760, y: 40, width: 40, height: 570, type: 'ruin' },
      { x: 1760, y: 730, width: 40, height: 630, type: 'ruin' },
      // Celestial marble columns with glowing gold
      { x: 480, y: 250, width: 80, height: 90, type: 'ruin' },
      { x: 480, y: 1050, width: 80, height: 90, type: 'ruin' },
      { x: 980, y: 220, width: 90, height: 90, type: 'ruin' },
      { x: 980, y: 1080, width: 90, height: 90, type: 'ruin' },
      { x: 1420, y: 320, width: 70, height: 80, type: 'ruin' },
      { x: 1420, y: 980, width: 70, height: 80, type: 'ruin' },
    ],
    gatherables: [
      { id: 'starlight_node_1', type: 'mineral', name: 'Starlight Crystal Vein', x: 620, y: 340, itemId: 'starlight_feather', respawnTime: 25 },
      { id: 'starlight_node_2', type: 'mineral', name: 'Starlight Crystal Vein', x: 1220, y: 950, itemId: 'starlight_feather', respawnTime: 25 },
    ],
  },
};
