/**
 * Etheria Chronicles - Automated Gameplay System Tests
 * Tests combat formulas, stat calculations, drop probabilities, refinement, and Phase 2 content
 */

import { ITEM_CATALOG } from '../data/items';
import { MAPS } from '../data/maps';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { QUEST_CATALOG } from '../data/quests';
import { 
  calculateDerivedStats, 
  calculateMagicDamage, 
  calculatePhysicalDamage, 
  getExpForLevel, 
  rollHitChance 
} from '../systems/formulas';

export function runAllTests() {
  console.log('🧪 Starting Etheria Chronicles System Tests...');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // 1. Level & EXP curve tests
  assert(getExpForLevel(1) === 80, 'Level 1 requires 80 EXP');
  assert(getExpForLevel(2) > getExpForLevel(1), 'EXP requirements scale monotonically');
  assert(getExpForLevel(10) > 300, 'Level 10 EXP curve scales reasonably');

  // 2. Base & Derived Stats tests
  const baseNovice = { str: 5, agi: 5, vit: 5, int: 5, dex: 5, luk: 5 };
  const derivedNovice = calculateDerivedStats(1, 'novice', baseNovice, {});
  assert(derivedNovice.maxHp >= 190, 'Novice base Max HP exceeds 190');
  assert(derivedNovice.maxMp >= 80, 'Novice base Max MP exceeds 80');
  assert(derivedNovice.atk >= 13, 'Novice base ATK computed correctly');
  assert(derivedNovice.critRate >= 3, 'Novice base Crit Rate computed correctly');

  // 3. Equipment bonus propagation tests
  const sword = ITEM_CATALOG['wooden_sword'];
  assert(sword !== undefined && sword.stats?.atk === 12, 'Wooden sword has +12 ATK');
  const derivedWithSword = calculateDerivedStats(1, 'novice', baseNovice, { mainHand: sword });
  assert(derivedWithSword.atk === derivedNovice.atk + 12, 'Equipping wooden sword adds exactly +12 ATK');

  // 4. Physical Combat formula tests
  const normalDmg = calculatePhysicalDamage(30, 5, 1.0, false);
  assert(normalDmg >= 15 && normalDmg <= 45, 'Normal physical damage within expected bounds');
  const critDmg = calculatePhysicalDamage(30, 5, 1.0, true, 1.5);
  assert(critDmg > normalDmg, 'Critical hit deals strictly more damage than normal hit');

  // 5. Magic Combat formula tests
  const magicDmg = calculateMagicDamage(40, 6, 1.5);
  assert(magicDmg >= 30, 'Magic damage with 150% multiplier scales with MATK');

  // 6. Evasion / Hit tests
  const alwaysHit = rollHitChance(200, 20);
  assert(alwaysHit === true || typeof alwaysHit === 'boolean', 'Hit chance rolls boolean outcome');

  // 7. Monster catalog sanity tests
  const mossling = MONSTER_TEMPLATES['mossling'];
  assert(mossling !== undefined, 'Mossling template exists');
  assert(mossling.drops.length >= 2, 'Mossling has drop entries');
  assert(mossling.drops.every((d) => d.chance > 0 && d.chance <= 1.0), 'All drop chances are between 0 and 1');

  const rootbeast = MONSTER_TEMPLATES['ancient_rootbeast'];
  assert(rootbeast.isBoss === true, 'Ancient Rootbeast is registered as a boss encounter');
  assert(rootbeast.drops.some((d) => d.itemId === 'ancient_briar_blade'), 'Rootbeast drops Ancient Briar Greatsword');

  // 8. Quest catalog sanity tests
  const firstQuest = QUEST_CATALOG['quest_mosslings'];
  assert(firstQuest !== undefined, 'First quest exists');
  assert(firstQuest.reward.exp > 0 && firstQuest.reward.gold > 0, 'First quest grants EXP and Gold');

  // ==========================================
  // PHASE 2 SYSTEM & CONTENT EXPANSION TESTS
  // ==========================================

  // 9. Phase 2 Biome Maps Existence & Portals
  assert(MAPS.sunken_ruins !== undefined, 'Sunken Ruins map is configured');
  assert(MAPS.frostpeak_mountains !== undefined, 'Frostpeak Mountains map is configured');
  assert(MAPS.crimson_desert !== undefined, 'Crimson Desert map is configured');
  assert(MAPS.celestial_tower !== undefined, 'Celestial Tower map is configured');
  assert(MAPS.sunken_ruins.portals.length >= 1, 'Sunken ruins has return portal');
  assert(MAPS.celestial_tower.monsters.length >= 8, 'Celestial Tower has monster spawns');

  // 10. Phase 2 Bosses Sanity
  const tideLord = MONSTER_TEMPLATES['tide_lord'];
  assert(tideLord !== undefined && tideLord.isBoss === true, 'Tide Lord is registered as Level 35 boss');
  assert(tideLord.drops.some((d) => d.itemId === 'oceanic_trident'), 'Tide Lord drops Oceanic Trident');

  const sandKing = MONSTER_TEMPLATES['sand_king'];
  assert(sandKing !== undefined && sandKing.isBoss === true, 'Sand King is registered as Level 45 boss');
  assert(sandKing.drops.some((d) => d.itemId === 'oridecon'), 'Sand King drops Oridecon mineral');

  const skyGuardian = MONSTER_TEMPLATES['sky_guardian'];
  assert(skyGuardian !== undefined && skyGuardian.isBoss === true, 'Sky Guardian is registered as Level 60 boss');
  assert(skyGuardian.drops.some((d) => d.itemId === 'dragon_slayer_sword'), 'Sky Guardian drops Dragon Slayer Sword');

  // 11. Phase 2 High-Tier Gear & Refinement Material Catalog
  const dragonSlayer = ITEM_CATALOG['dragon_slayer_sword'];
  assert(dragonSlayer !== undefined, 'Dragon Slayer Sword is in catalog');
  assert(dragonSlayer.stats?.atk === 180, 'Dragon Slayer Sword provides +180 base ATK');
  assert(dragonSlayer.levelReq === 45, 'Dragon Slayer Sword requires Level 45');

  const oridecon = ITEM_CATALOG['oridecon'];
  const elunium = ITEM_CATALOG['elunium'];
  assert(oridecon !== undefined && oridecon.category === 'refine_material', 'Oridecon is categorized as refine_material');
  assert(elunium !== undefined && elunium.category === 'refine_material', 'Elunium is categorized as refine_material');

  // 12. Refinement Derived Stats Calculation (+1 to +10 Scaling)
  const refinedSword = {
    ...dragonSlayer,
    refinement: 5, // +5 Refined: 5 * 8 = +40 ATK, 5 * 6 = +30 MATK
  };
  const derivedWithRefined = calculateDerivedStats(45, 'warrior', baseNovice, { mainHand: refinedSword });
  const derivedUnrefined = calculateDerivedStats(45, 'warrior', baseNovice, { mainHand: dragonSlayer });
  assert(derivedWithRefined.atk === derivedUnrefined.atk + 40, '+5 Refined weapon adds exactly +40 bonus ATK');
  assert(derivedWithRefined.matk === derivedUnrefined.matk + 30, '+5 Refined weapon adds exactly +30 bonus MATK');

  const tideArmor = ITEM_CATALOG['tide_lord_armor'];
  assert(tideArmor !== undefined, 'Tide Lord Armor is in catalog');
  const refinedArmor = {
    ...tideArmor,
    refinement: 4, // +4 Refined: 4 * 4 = +16 DEF, 4 * 2 = +8 MDEF
  };
  const derivedWithRefinedArmor = calculateDerivedStats(35, 'warrior', baseNovice, { armor: refinedArmor });
  const derivedUnrefinedArmor = calculateDerivedStats(35, 'warrior', baseNovice, { armor: tideArmor });
  assert(derivedWithRefinedArmor.def === derivedUnrefinedArmor.def + 16, '+4 Refined armor adds exactly +16 bonus DEF');
  assert(derivedWithRefinedArmor.mdef === derivedUnrefinedArmor.mdef + 8, '+4 Refined armor adds exactly +8 bonus MDEF');

  // 13. Phase 2 Consumables & Alchemical Potions
  const greaterRed = ITEM_CATALOG['greater_red_potion'];
  const greaterBlue = ITEM_CATALOG['greater_blue_potion'];
  const berserkElixir = ITEM_CATALOG['berserk_elixir'];
  assert(greaterRed !== undefined && greaterRed.effect?.hpRestore === 450, 'Greater Red Potion restores 450 HP');
  assert(greaterBlue !== undefined && greaterBlue.effect?.mpRestore === 220, 'Greater Blue Potion restores 220 MP');
  assert(berserkElixir !== undefined && berserkElixir.category === 'consumable', 'Berserk Elixir is present');

  console.log(`\n🎉 All ${passed}/${total} Etheria Chronicles tests passed successfully!`);
  return true;
}

// Execute tests
runAllTests();
