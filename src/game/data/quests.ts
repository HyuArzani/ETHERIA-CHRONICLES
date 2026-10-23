/**
 * Etheria Chronicles - Quest Database & Objectives
 */

import { QuestDefinition } from '../types';

export const QUEST_CATALOG: Record<string, QuestDefinition> = {
  quest_mosslings: {
    id: 'quest_mosslings',
    title: 'Clearing the Meadows',
    giverName: 'Elder Althea',
    description: 'The outskirts of Dawnshire are overrun with curious Mosslings nibbling on local crops. Slay 5 of them in Verdant Fields.',
    levelReq: 1,
    requirements: [
      {
        type: 'kill',
        targetId: 'mossling',
        targetName: 'Mossling',
        required: 5,
      },
    ],
    reward: {
      exp: 90,
      gold: 50,
      items: [
        { itemId: 'red_potion', quantity: 4 },
        { itemId: 'copper_ring', quantity: 1 },
      ],
    },
  },

  quest_slime_menace: {
    id: 'quest_slime_menace',
    title: 'Gooey Field Survey',
    giverName: 'Ranger Finn',
    description: 'Collect Sticky Jelly samples from the bouncing Gooey Sproutlings in Verdant Fields to assist our alchemy study.',
    levelReq: 2,
    requirements: [
      {
        type: 'collect',
        targetId: 'sticky_jelly',
        targetName: 'Sticky Jelly',
        required: 3,
      },
      {
        type: 'kill',
        targetId: 'sprout_slime',
        targetName: 'Gooey Sproutling',
        required: 4,
      },
    ],
    reward: {
      exp: 140,
      gold: 80,
      items: [
        { itemId: 'blue_potion', quantity: 3 },
        { itemId: 'feathered_beret', quantity: 1 },
      ],
    },
  },

  quest_pet_companion: {
    id: 'quest_pet_companion',
    title: 'A Companion for the Journey',
    giverName: 'Pet Handler Mimi',
    description: 'Bring Mimi 2 Moss Clumps and 2 Sticky Jellies so she can nurture a companion egg for you.',
    levelReq: 2,
    requirements: [
      {
        type: 'collect',
        targetId: 'moss_clump',
        targetName: 'Moss Clump',
        required: 2,
      },
      {
        type: 'collect',
        targetId: 'sticky_jelly',
        targetName: 'Sticky Jelly',
        required: 2,
      },
    ],
    reward: {
      exp: 150,
      gold: 75,
      items: [
        { itemId: 'pet_egg_sproutling', quantity: 1 },
        { itemId: 'pet_treat', quantity: 3 },
      ],
    },
  },

  quest_blacksmith_supplies: {
    id: 'quest_blacksmith_supplies',
    title: "Blacksmith Roger's Materials",
    giverName: 'Blacksmith Roger',
    description: 'Blacksmith Roger needs 3 Chitin Shells from Thornback Beetles and 2 Copper Ore to forge better equipment for Dawnshire.',
    levelReq: 4,
    requirements: [
      {
        type: 'collect',
        targetId: 'chitin_shell',
        targetName: 'Chitin Shell',
        required: 3,
      },
      {
        type: 'collect',
        targetId: 'copper_ore',
        targetName: 'Copper Ore',
        required: 2,
      },
    ],
    reward: {
      exp: 240,
      gold: 140,
      items: [
        { itemId: 'iron_broadsword', quantity: 1 },
        { itemId: 'novice_shield', quantity: 1 },
      ],
    },
  },

  quest_wolf_hunt: {
    id: 'quest_wolf_hunt',
    title: 'The Howling Woods',
    giverName: 'Ranger Finn',
    description: 'The Wildfang Wolves have grown aggressive near the entrance of Whisperwood Forest. Subdue 3 wolves to secure the pass.',
    levelReq: 6,
    requirements: [
      {
        type: 'kill',
        targetId: 'wildfang_wolf',
        targetName: 'Wildfang Wolf',
        required: 3,
      },
    ],
    reward: {
      exp: 360,
      gold: 220,
      items: [
        { itemId: 'runner_boots', quantity: 1 },
        { itemId: 'butterfly_wing', quantity: 2 },
      ],
    },
  },

  quest_whisperwood_terror: {
    id: 'quest_whisperwood_terror',
    title: 'The Ancient Awakens',
    giverName: 'Elder Althea',
    description: 'Deep within Whisperwood Forest, the Ancient Rootbeast has stirred. Brave adventurers must rally and put the giant guardian back to rest!',
    levelReq: 10,
    requirements: [
      {
        type: 'kill',
        targetId: 'ancient_rootbeast',
        targetName: 'Ancient Rootbeast',
        required: 1,
      },
    ],
    reward: {
      exp: 1000,
      gold: 600,
      items: [
        { itemId: 'clover_charm', quantity: 1 },
        { itemId: 'red_potion', quantity: 5 },
        { itemId: 'blue_potion', quantity: 5 },
      ],
    },
  },
};
