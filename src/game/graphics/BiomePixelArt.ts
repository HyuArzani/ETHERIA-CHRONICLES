/**
 * Etheria Chronicles - Phase 2 Biome Pixel Art Generator
 * Generates Sunken Ruins, Frostpeak, Crimson Desert, and Celestial Tower
 * monsters, bosses, tiles, and vfx.
 */

import Phaser from 'phaser';

export class BiomePixelArt {
  public static generateAll(scene: Phaser.Scene) {
    if (scene.textures.exists('boss_tide_lord')) return;

    this.createSunkenRuinsAssets(scene);
    this.createFrostpeakAssets(scene);
    this.createCrimsonDesertAssets(scene);
    this.createCelestialTowerAssets(scene);
    this.createPhase2NpcAssets(scene);
  }

  // ==========================================
  // SUNKEN RUINS ASSETS & MONSTERS
  // ==========================================
  private static createSunkenRuinsAssets(scene: Phaser.Scene) {
    // 1. Aqua Slime (32x32)
    const cSlime = document.createElement('canvas');
    cSlime.width = 32; cSlime.height = 32;
    const ctxS = cSlime.getContext('2d')!;
    ctxS.imageSmoothingEnabled = false;

    ctxS.fillStyle = 'rgba(0,0,0,0.3)';
    ctxS.beginPath(); ctxS.ellipse(16, 28, 12, 3, 0, 0, Math.PI * 2); ctxS.fill();
    ctxS.fillStyle = '#06b6d4'; // Cyan aquatic jelly
    ctxS.beginPath(); ctxS.arc(16, 17, 11, 0, Math.PI * 2); ctxS.fill();
    ctxS.fillStyle = '#67e8f9';
    ctxS.beginPath(); ctxS.arc(13, 12, 4, 0, Math.PI * 2); ctxS.fill();
    ctxS.fillStyle = '#083344';
    ctxS.fillRect(12, 15, 3, 4); ctxS.fillRect(18, 15, 3, 4);
    ctxS.fillStyle = '#ffffff';
    ctxS.fillRect(12, 15, 1, 2); ctxS.fillRect(18, 15, 1, 2);
    // Bubble fin
    ctxS.fillStyle = '#22d3ee';
    ctxS.fillRect(14, 4, 4, 4);
    scene.textures.addCanvas('monster_aqua_slime', cSlime);

    // 2. Reef Crab (34x34)
    const cCrab = document.createElement('canvas');
    cCrab.width = 34; cCrab.height = 34;
    const ctxC = cCrab.getContext('2d')!;
    ctxC.imageSmoothingEnabled = false;

    ctxC.fillStyle = 'rgba(0,0,0,0.3)';
    ctxC.beginPath(); ctxC.ellipse(17, 30, 13, 3, 0, 0, Math.PI * 2); ctxC.fill();
    // Coral red carapace
    ctxC.fillStyle = '#ef4444';
    ctxC.beginPath(); ctxC.ellipse(17, 18, 11, 8, 0, 0, Math.PI * 2); ctxC.fill();
    ctxC.fillStyle = '#b91c1c';
    ctxC.fillRect(10, 15, 14, 2);
    // Big pincer claws
    ctxC.fillStyle = '#f87171';
    ctxC.fillRect(4, 10, 6, 8); ctxC.fillRect(24, 10, 6, 8);
    ctxC.fillStyle = '#450a0a';
    ctxC.fillRect(4, 12, 6, 2); ctxC.fillRect(24, 12, 6, 2);
    // Stalk eyes
    ctxC.fillStyle = '#000000';
    ctxC.fillRect(13, 8, 2, 3); ctxC.fillRect(19, 8, 2, 3);
    scene.textures.addCanvas('monster_reef_crab', cCrab);

    // 3. Drowned Warrior (36x36)
    const cDw = document.createElement('canvas');
    cDw.width = 36; cDw.height = 36;
    const ctxDw = cDw.getContext('2d')!;
    ctxDw.imageSmoothingEnabled = false;

    ctxDw.fillStyle = 'rgba(0,0,0,0.3)';
    ctxDw.beginPath(); ctxDw.ellipse(18, 32, 10, 3, 0, 0, Math.PI * 2); ctxDw.fill();
    // Water-logged green skin
    ctxDw.fillStyle = '#059669';
    ctxDw.fillRect(14, 8, 8, 8);
    // Glowing sea eyes
    ctxDw.fillStyle = '#6ee7b7';
    ctxDw.fillRect(15, 11, 2, 2); ctxDw.fillRect(19, 11, 2, 2);
    // Coral barnacle armor
    ctxDw.fillStyle = '#065f46';
    ctxDw.fillRect(12, 16, 12, 11);
    ctxDw.fillStyle = '#047857';
    ctxDw.fillRect(13, 27, 4, 5); ctxDw.fillRect(19, 27, 4, 5);
    // Rusted ocean cutlass
    ctxDw.fillStyle = '#38bdf8';
    ctxDw.fillRect(26, 12, 4, 14);
    ctxDw.fillStyle = '#b45309';
    ctxDw.fillRect(25, 23, 6, 2);
    scene.textures.addCanvas('monster_drowned_warrior', cDw);

    // 4. Sea Serpent (44x40)
    const cSrp = document.createElement('canvas');
    cSrp.width = 44; cSrp.height = 40;
    const ctxSrp = cSrp.getContext('2d')!;
    ctxSrp.imageSmoothingEnabled = false;

    ctxSrp.fillStyle = 'rgba(0,0,0,0.3)';
    ctxSrp.beginPath(); ctxSrp.ellipse(22, 36, 16, 3, 0, 0, Math.PI * 2); ctxSrp.fill();
    // Coiled azure serpent body
    ctxSrp.fillStyle = '#0284c7';
    ctxSrp.beginPath(); ctxSrp.ellipse(22, 22, 14, 12, 0, 0, Math.PI * 2); ctxSrp.fill();
    ctxSrp.fillStyle = '#38bdf8';
    ctxSrp.fillRect(14, 10, 16, 8);
    // Crest fins
    ctxSrp.fillStyle = '#06b6d4';
    ctxSrp.fillRect(18, 4, 8, 6);
    // Fierce glowing eyes
    ctxSrp.fillStyle = '#fbbf24';
    ctxSrp.fillRect(16, 13, 3, 2); ctxSrp.fillRect(25, 13, 3, 2);
    scene.textures.addCanvas('monster_sea_serpent', cSrp);

    // 5. BOSS: TIDE LORD (64x64)
    const cBossTide = document.createElement('canvas');
    cBossTide.width = 64; cBossTide.height = 64;
    const ctxBt = cBossTide.getContext('2d')!;
    ctxBt.imageSmoothingEnabled = false;

    // Shadow
    ctxBt.fillStyle = 'rgba(0,0,0,0.4)';
    ctxBt.beginPath(); ctxBt.ellipse(32, 58, 22, 5, 0, 0, Math.PI * 2); ctxBt.fill();
    // Armored merman torso
    ctxBt.fillStyle = '#0369a1';
    ctxBt.fillRect(20, 20, 24, 24);
    // Golden chestplate
    ctxBt.fillStyle = '#f59e0b';
    ctxBt.fillRect(22, 22, 20, 18);
    ctxBt.fillStyle = '#fbbf24';
    ctxBt.fillRect(28, 26, 8, 8);
    // Oceanic head & gills
    ctxBt.fillStyle = '#0284c7';
    ctxBt.fillRect(24, 8, 16, 14);
    // Golden King Crown
    ctxBt.fillStyle = '#f59e0b';
    ctxBt.fillRect(23, 4, 18, 5);
    ctxBt.fillRect(25, 1, 4, 4); ctxBt.fillRect(35, 1, 4, 4); ctxBt.fillRect(30, 0, 4, 5);
    // Glowing cyan eyes
    ctxBt.fillStyle = '#67e8f9';
    ctxBt.fillRect(27, 13, 3, 3); ctxBt.fillRect(34, 13, 3, 3);
    // Massive Golden Trident in Hand
    ctxBt.fillStyle = '#f59e0b';
    ctxBt.fillRect(46, 6, 4, 48); // Shaft
    ctxBt.fillStyle = '#fbbf24';
    ctxBt.fillRect(42, 6, 12, 3);
    ctxBt.fillRect(42, 0, 3, 8); ctxBt.fillRect(47, 0, 2, 7); ctxBt.fillRect(52, 0, 3, 8);
    // Fin tail
    ctxBt.fillStyle = '#0c4a6e';
    ctxBt.fillRect(24, 44, 16, 14);
    scene.textures.addCanvas('boss_tide_lord', cBossTide);

    // Sunken Ruins Tile: 32x32 flooded stone
    const cTileS = document.createElement('canvas');
    cTileS.width = 32; cTileS.height = 32;
    const ctxTs = cTileS.getContext('2d')!;
    ctxTs.fillStyle = '#0e7490'; ctxTs.fillRect(0, 0, 32, 32);
    ctxTs.fillStyle = '#155e75';
    ctxTs.fillRect(1, 1, 14, 14); ctxTs.fillRect(17, 1, 14, 14);
    ctxTs.fillRect(1, 17, 14, 14); ctxTs.fillRect(17, 17, 14, 14);
    ctxTs.fillStyle = '#67e8f9'; // Water caustics
    ctxTs.fillRect(6, 8, 5, 1); ctxTs.fillRect(20, 22, 6, 1);
    scene.textures.addCanvas('tile_sunken', cTileS);

    // Sunken Marble Column Prop: 60x80
    const cCol = document.createElement('canvas');
    cCol.width = 60; cCol.height = 80;
    const ctxCol = cCol.getContext('2d')!;
    ctxCol.fillStyle = '#cbd5e1';
    ctxCol.fillRect(16, 12, 28, 58);
    ctxCol.fillStyle = '#94a3b8';
    ctxCol.fillRect(12, 8, 36, 8); ctxCol.fillRect(12, 66, 36, 8);
    // Green kelp wrap
    ctxCol.fillStyle = '#059669';
    ctxCol.fillRect(16, 26, 28, 4); ctxCol.fillRect(16, 44, 28, 4);
    scene.textures.addCanvas('prop_sunken_pillar', cCol);
  }

  // ==========================================
  // FROSTPEAK MOUNTAINS ASSETS & MONSTERS
  // ==========================================
  private static createFrostpeakAssets(scene: Phaser.Scene) {
    // 1. Ice Wolf (36x36)
    const cWolf = document.createElement('canvas');
    cWolf.width = 36; cWolf.height = 36;
    const ctxW = cWolf.getContext('2d')!;
    ctxW.imageSmoothingEnabled = false;
    ctxW.fillStyle = 'rgba(0,0,0,0.3)';
    ctxW.beginPath(); ctxW.ellipse(18, 32, 12, 3, 0, 0, Math.PI * 2); ctxW.fill();
    ctxW.fillStyle = '#93c5fd';
    ctxW.beginPath(); ctxW.ellipse(18, 20, 11, 8, 0, 0, Math.PI * 2); ctxW.fill();
    ctxW.fillStyle = '#60a5fa';
    ctxW.fillRect(12, 14, 14, 6);
    // Icicle fur spikes
    ctxW.fillStyle = '#e0f2fe';
    ctxW.fillRect(10, 6, 4, 6); ctxW.fillRect(22, 6, 4, 6);
    ctxW.fillStyle = '#38bdf8';
    ctxW.fillRect(14, 14, 2, 2); ctxW.fillRect(21, 14, 2, 2);
    scene.textures.addCanvas('monster_ice_wolf', cWolf);

    // 2. Snow Golem (40x40)
    const cSg = document.createElement('canvas');
    cSg.width = 40; cSg.height = 40;
    const ctxSg = cSg.getContext('2d')!;
    ctxSg.imageSmoothingEnabled = false;
    ctxSg.fillStyle = 'rgba(0,0,0,0.3)';
    ctxSg.beginPath(); ctxSg.ellipse(20, 36, 14, 3, 0, 0, Math.PI * 2); ctxSg.fill();
    ctxSg.fillStyle = '#e2e8f0';
    ctxSg.beginPath(); ctxSg.arc(20, 22, 14, 0, Math.PI * 2); ctxSg.fill();
    ctxSg.fillStyle = '#f8fafc';
    ctxSg.beginPath(); ctxSg.arc(20, 12, 9, 0, Math.PI * 2); ctxSg.fill();
    // Ice stones
    ctxSg.fillStyle = '#0284c7';
    ctxSg.fillRect(16, 11, 2, 2); ctxSg.fillRect(22, 11, 2, 2);
    ctxSg.fillStyle = '#64748b';
    ctxSg.fillRect(19, 18, 3, 3); ctxSg.fillRect(19, 24, 3, 3);
    scene.textures.addCanvas('monster_snow_golem', cSg);

    // 3. Frost Witch (36x36)
    const cWitch = document.createElement('canvas');
    cWitch.width = 36; cWitch.height = 36;
    const ctxWi = cWitch.getContext('2d')!;
    ctxWi.imageSmoothingEnabled = false;
    ctxWi.fillStyle = 'rgba(0,0,0,0.3)';
    ctxWi.beginPath(); ctxWi.ellipse(18, 32, 10, 3, 0, 0, Math.PI * 2); ctxWi.fill();
    // Purple & frost robe
    ctxWi.fillStyle = '#4f46e5';
    ctxWi.fillRect(12, 14, 12, 16);
    // Pointy ice hat
    ctxWi.fillStyle = '#3730a3';
    ctxWi.beginPath(); ctxWi.moveTo(18, 2); ctxWi.lineTo(28, 12); ctxWi.lineTo(8, 12); ctxWi.fill();
    ctxWi.fillStyle = '#818cf8';
    ctxWi.fillRect(7, 11, 22, 3);
    // Glowing staff with ice crystal
    ctxWi.fillStyle = '#78350f';
    ctxWi.fillRect(26, 10, 2, 22);
    ctxWi.fillStyle = '#38bdf8';
    ctxWi.fillRect(24, 6, 6, 6);
    scene.textures.addCanvas('monster_frost_witch', cWitch);

    // 4. Yeti (48x48)
    const cYeti = document.createElement('canvas');
    cYeti.width = 48; cYeti.height = 48;
    const ctxY = cYeti.getContext('2d')!;
    ctxY.imageSmoothingEnabled = false;
    ctxY.fillStyle = 'rgba(0,0,0,0.35)';
    ctxY.beginPath(); ctxY.ellipse(24, 44, 18, 4, 0, 0, Math.PI * 2); ctxY.fill();
    // Huge white fur body
    ctxY.fillStyle = '#f8fafc';
    ctxY.beginPath(); ctxY.arc(24, 26, 18, 0, Math.PI * 2); ctxY.fill();
    ctxY.fillStyle = '#e2e8f0';
    ctxY.fillRect(16, 20, 16, 18);
    // Fierce blue face
    ctxY.fillStyle = '#38bdf8';
    ctxY.fillRect(18, 14, 12, 8);
    ctxY.fillStyle = '#0f172a';
    ctxY.fillRect(20, 16, 2, 2); ctxY.fillRect(26, 16, 2, 2);
    // Fangs
    ctxY.fillStyle = '#ffffff';
    ctxY.fillRect(21, 20, 2, 3); ctxY.fillRect(25, 20, 2, 3);
    scene.textures.addCanvas('monster_yeti', cYeti);

    // Frostpeak Snow Tile: 32x32
    const cTileSnow = document.createElement('canvas');
    cTileSnow.width = 32; cTileSnow.height = 32;
    const ctxSn = cTileSnow.getContext('2d')!;
    ctxSn.fillStyle = '#e0f2fe'; ctxSn.fillRect(0, 0, 32, 32);
    ctxSn.fillStyle = '#bae6fd';
    ctxSn.fillRect(4, 6, 3, 3); ctxSn.fillRect(20, 18, 4, 3);
    ctxSn.fillStyle = '#ffffff';
    ctxSn.fillRect(12, 12, 6, 4); ctxSn.fillRect(24, 26, 4, 3);
    scene.textures.addCanvas('tile_snow', cTileSnow);

    // Snow Pine Tree: 60x80
    const cSp = document.createElement('canvas');
    cSp.width = 60; cSp.height = 80;
    const ctxSp = cSp.getContext('2d')!;
    ctxSp.fillStyle = '#78350f';
    ctxSp.fillRect(26, 55, 8, 20);
    // Tiered snowy pine layers
    ctxSp.fillStyle = '#065f46';
    ctxSp.beginPath(); ctxSp.moveTo(30, 8); ctxSp.lineTo(48, 30); ctxSp.lineTo(12, 30); ctxSp.fill();
    ctxSp.beginPath(); ctxSp.moveTo(30, 24); ctxSp.lineTo(54, 46); ctxSp.lineTo(6, 46); ctxSp.fill();
    ctxSp.beginPath(); ctxSp.moveTo(30, 38); ctxSp.lineTo(58, 62); ctxSp.lineTo(2, 62); ctxSp.fill();
    // Snow caps on branches
    ctxSp.fillStyle = '#f8fafc';
    ctxSp.fillRect(20, 26, 20, 4); ctxSp.fillRect(14, 42, 32, 4); ctxSp.fillRect(8, 58, 44, 4);
    scene.textures.addCanvas('prop_snow_pine', cSp);
  }

  // ==========================================
  // CRIMSON DESERT ASSETS & MONSTERS
  // ==========================================
  private static createCrimsonDesertAssets(scene: Phaser.Scene) {
    // 1. Desert Scorpion (36x36)
    const cScorp = document.createElement('canvas');
    cScorp.width = 36; cScorp.height = 36;
    const ctxSc = cScorp.getContext('2d')!;
    ctxSc.imageSmoothingEnabled = false;
    ctxSc.fillStyle = 'rgba(0,0,0,0.3)';
    ctxSc.beginPath(); ctxSc.ellipse(18, 32, 12, 3, 0, 0, Math.PI * 2); ctxSc.fill();
    ctxSc.fillStyle = '#ea580c'; // Fiery red-orange
    ctxSc.beginPath(); ctxSc.ellipse(18, 22, 9, 6, 0, 0, Math.PI * 2); ctxSc.fill();
    // Claws
    ctxSc.fillStyle = '#c2410c';
    ctxSc.fillRect(6, 16, 5, 8); ctxSc.fillRect(25, 16, 5, 8);
    // Tail with stinger
    ctxSc.fillStyle = '#9a3412';
    ctxSc.fillRect(16, 12, 4, 10);
    ctxSc.fillRect(14, 6, 8, 6);
    ctxSc.fillStyle = '#ef4444'; // Glowing venom stinger
    ctxSc.fillRect(17, 3, 2, 4);
    scene.textures.addCanvas('monster_desert_scorpion', cScorp);

    // 2. Sand Worm (44x36)
    const cWorm = document.createElement('canvas');
    cWorm.width = 44; cWorm.height = 36;
    const ctxWm = cWorm.getContext('2d')!;
    ctxWm.imageSmoothingEnabled = false;
    ctxWm.fillStyle = 'rgba(0,0,0,0.3)';
    ctxWm.beginPath(); ctxWm.ellipse(22, 32, 15, 3, 0, 0, Math.PI * 2); ctxWm.fill();
    // Segmented dune body
    ctxWm.fillStyle = '#d97706';
    ctxWm.beginPath(); ctxWm.ellipse(22, 18, 16, 10, 0, 0, Math.PI * 2); ctxWm.fill();
    ctxWm.fillStyle = '#b45309';
    ctxWm.fillRect(12, 12, 4, 14); ctxWm.fillRect(20, 12, 4, 14); ctxWm.fillRect(28, 12, 4, 14);
    // Open spiked maw
    ctxWm.fillStyle = '#78350f';
    ctxWm.beginPath(); ctxWm.arc(36, 18, 6, 0, Math.PI * 2); ctxWm.fill();
    ctxWm.fillStyle = '#fef3c7';
    ctxWm.fillRect(34, 15, 2, 2); ctxWm.fillRect(38, 19, 2, 2);
    scene.textures.addCanvas('monster_sand_worm', cWorm);

    // 3. Desert Assassin (36x36)
    const cAssa = document.createElement('canvas');
    cAssa.width = 36; cAssa.height = 36;
    const ctxAs = cAssa.getContext('2d')!;
    ctxAs.imageSmoothingEnabled = false;
    ctxAs.fillStyle = 'rgba(0,0,0,0.3)';
    ctxAs.beginPath(); ctxAs.ellipse(18, 32, 9, 3, 0, 0, Math.PI * 2); ctxAs.fill();
    // Red cloak & hood
    ctxAs.fillStyle = '#dc2626';
    ctxAs.fillRect(12, 14, 12, 16);
    ctxAs.fillStyle = '#991b1b';
    ctxAs.fillRect(13, 6, 10, 10);
    // Dark mask with sinister slit eyes
    ctxAs.fillStyle = '#18181b';
    ctxAs.fillRect(14, 10, 8, 5);
    ctxAs.fillStyle = '#facc15';
    ctxAs.fillRect(15, 11, 2, 1); ctxAs.fillRect(19, 11, 2, 1);
    // Twin curved scimitars
    ctxAs.fillStyle = '#e2e8f0';
    ctxAs.fillRect(6, 14, 4, 12); ctxAs.fillRect(26, 14, 4, 12);
    scene.textures.addCanvas('monster_desert_assassin', cAssa);

    // 4. Ancient Golem (48x48)
    const cGol = document.createElement('canvas');
    cGol.width = 48; cGol.height = 48;
    const ctxG = cGol.getContext('2d')!;
    ctxG.imageSmoothingEnabled = false;
    ctxG.fillStyle = 'rgba(0,0,0,0.4)';
    ctxG.beginPath(); ctxG.ellipse(24, 44, 18, 4, 0, 0, Math.PI * 2); ctxG.fill();
    // Sandstone block torso
    ctxG.fillStyle = '#b45309';
    ctxG.fillRect(12, 16, 24, 22);
    ctxG.fillStyle = '#d97706';
    ctxG.fillRect(14, 18, 20, 18);
    // Glowing hieroglyph core
    ctxG.fillStyle = '#ef4444';
    ctxG.fillRect(20, 24, 8, 6);
    // Heavy fists
    ctxG.fillStyle = '#78350f';
    ctxG.fillRect(4, 22, 8, 16); ctxG.fillRect(36, 22, 8, 16);
    scene.textures.addCanvas('monster_ancient_golem', cGol);

    // 5. BOSS: SAND KING (64x64)
    const cBossSk = document.createElement('canvas');
    cBossSk.width = 64; cBossSk.height = 64;
    const ctxSk = cBossSk.getContext('2d')!;
    ctxSk.imageSmoothingEnabled = false;
    ctxSk.fillStyle = 'rgba(0,0,0,0.5)';
    ctxSk.beginPath(); ctxSk.ellipse(32, 58, 26, 5, 0, 0, Math.PI * 2); ctxSk.fill();
    // Colossal stone scorpion titan
    ctxSk.fillStyle = '#9a3412';
    ctxSk.fillRect(18, 20, 28, 28);
    ctxSk.fillStyle = '#c2410c';
    ctxSk.fillRect(20, 22, 24, 24);
    // Golden rune chest core
    ctxSk.fillStyle = '#f59e0b';
    ctxSk.fillRect(26, 28, 12, 12);
    ctxSk.fillStyle = '#fef08a';
    ctxSk.fillRect(28, 30, 8, 8);
    // Massive dual pincer arms
    ctxSk.fillStyle = '#7c2d12';
    ctxSk.fillRect(4, 14, 12, 18); ctxSk.fillRect(48, 14, 12, 18);
    // Towering stinger tail overhead
    ctxSk.fillStyle = '#ea580c';
    ctxSk.fillRect(28, 2, 8, 18);
    ctxSk.fillStyle = '#ef4444';
    ctxSk.fillRect(26, 0, 12, 6);
    scene.textures.addCanvas('boss_sand_king', cBossSk);

    // Crimson Desert Sand Tile: 32x32
    const cTileD = document.createElement('canvas');
    cTileD.width = 32; cTileD.height = 32;
    const ctxTd = cTileD.getContext('2d')!;
    ctxTd.fillStyle = '#ea580c'; ctxTd.fillRect(0, 0, 32, 32);
    ctxTd.fillStyle = '#c2410c';
    ctxTd.fillRect(0, 8, 32, 3); ctxTd.fillRect(0, 22, 32, 3);
    ctxTd.fillStyle = '#f97316';
    ctxTd.fillRect(4, 16, 8, 2); ctxTd.fillRect(20, 4, 8, 2);
    scene.textures.addCanvas('tile_desert', cTileD);

    // Sandstone Hieroglyph Ruin Prop: 60x80
    const cRuin = document.createElement('canvas');
    cRuin.width = 60; cRuin.height = 80;
    const ctxRu = cRuin.getContext('2d')!;
    ctxRu.fillStyle = '#9a3412';
    ctxRu.fillRect(14, 10, 32, 65);
    ctxRu.fillStyle = '#c2410c';
    ctxRu.fillRect(16, 12, 28, 60);
    // Engraved runes
    ctxRu.fillStyle = '#fef08a';
    ctxRu.fillRect(22, 22, 16, 4); ctxRu.fillRect(22, 34, 16, 4); ctxRu.fillRect(22, 46, 16, 4);
    scene.textures.addCanvas('prop_desert_ruin', cRuin);
  }

  // ==========================================
  // CELESTIAL TOWER ASSETS & MONSTERS
  // ==========================================
  private static createCelestialTowerAssets(scene: Phaser.Scene) {
    // 1. Sky Harpy (40x40)
    const cHarpy = document.createElement('canvas');
    cHarpy.width = 40; cHarpy.height = 40;
    const ctxH = cHarpy.getContext('2d')!;
    ctxH.imageSmoothingEnabled = false;
    ctxH.fillStyle = 'rgba(0,0,0,0.3)';
    ctxH.beginPath(); ctxH.ellipse(20, 36, 12, 3, 0, 0, Math.PI * 2); ctxH.fill();
    ctxH.fillStyle = '#38bdf8';
    ctxH.fillRect(14, 12, 12, 16);
    // Wings spread
    ctxH.fillStyle = '#0284c7';
    ctxH.beginPath(); ctxH.moveTo(20, 14); ctxH.lineTo(4, 6); ctxH.lineTo(8, 24); ctxH.fill();
    ctxH.beginPath(); ctxH.moveTo(20, 14); ctxH.lineTo(36, 6); ctxH.lineTo(32, 24); ctxH.fill();
    // Talons
    ctxH.fillStyle = '#fbbf24';
    ctxH.fillRect(15, 28, 3, 5); ctxH.fillRect(22, 28, 3, 5);
    scene.textures.addCanvas('monster_sky_harpy', cHarpy);

    // 2. Cloud Spirit (32x32)
    const cCloud = document.createElement('canvas');
    cCloud.width = 32; cCloud.height = 32;
    const ctxCl = cCloud.getContext('2d')!;
    ctxCl.imageSmoothingEnabled = false;
    ctxCl.fillStyle = '#e0f2fe';
    ctxCl.beginPath();
    ctxCl.arc(16, 16, 10, 0, Math.PI * 2);
    ctxCl.arc(10, 18, 7, 0, Math.PI * 2);
    ctxCl.arc(22, 18, 7, 0, Math.PI * 2);
    ctxCl.fill();
    ctxCl.fillStyle = '#0284c7';
    ctxCl.fillRect(12, 14, 2, 3); ctxCl.fillRect(18, 14, 2, 3);
    scene.textures.addCanvas('monster_cloud_spirit', cCloud);

    // 3. Celestial Mage (36x36)
    const cCm = document.createElement('canvas');
    cCm.width = 36; cCm.height = 36;
    const ctxCm = cCm.getContext('2d')!;
    ctxCm.imageSmoothingEnabled = false;
    ctxCm.fillStyle = 'rgba(0,0,0,0.3)';
    ctxCm.beginPath(); ctxCm.ellipse(18, 32, 9, 3, 0, 0, Math.PI * 2); ctxCm.fill();
    ctxCm.fillStyle = '#7c3aed'; // Deep celestial violet
    ctxCm.fillRect(12, 14, 12, 16);
    ctxCm.fillStyle = '#a855f7';
    ctxCm.fillRect(14, 8, 8, 8);
    // Floating starlight ring
    ctxCm.strokeStyle = '#fef08a'; ctxCm.lineWidth = 2;
    ctxCm.strokeRect(10, 4, 16, 4);
    // Wand with crescent moon
    ctxCm.fillStyle = '#fbbf24';
    ctxCm.fillRect(26, 8, 2, 22);
    ctxCm.fillRect(24, 4, 6, 4);
    scene.textures.addCanvas('monster_celestial_mage', cCm);

    // 4. Sky Dragon (52x48)
    const cDrg = document.createElement('canvas');
    cDrg.width = 52; cDrg.height = 48;
    const ctxDg = cDrg.getContext('2d')!;
    ctxDg.imageSmoothingEnabled = false;
    ctxDg.fillStyle = 'rgba(0,0,0,0.4)';
    ctxDg.beginPath(); ctxDg.ellipse(26, 42, 18, 4, 0, 0, Math.PI * 2); ctxDg.fill();
    // Azure dragon torso
    ctxDg.fillStyle = '#2563eb';
    ctxDg.beginPath(); ctxDg.ellipse(26, 24, 16, 12, 0, 0, Math.PI * 2); ctxDg.fill();
    // Draconic wings
    ctxDg.fillStyle = '#60a5fa';
    ctxDg.beginPath(); ctxDg.moveTo(26, 20); ctxDg.lineTo(6, 6); ctxDg.lineTo(12, 30); ctxDg.fill();
    ctxDg.beginPath(); ctxDg.moveTo(26, 20); ctxDg.lineTo(46, 6); ctxDg.lineTo(40, 30); ctxDg.fill();
    // Horned crest & glowing maw
    ctxDg.fillStyle = '#1d4ed8';
    ctxDg.fillRect(22, 10, 10, 10);
    ctxDg.fillStyle = '#fde047';
    ctxDg.fillRect(20, 6, 4, 6); ctxDg.fillRect(30, 6, 4, 6);
    ctxDg.fillStyle = '#ef4444';
    ctxDg.fillRect(25, 14, 4, 3);
    scene.textures.addCanvas('monster_sky_dragon', cDrg);

    // 5. BOSS: SKY GUARDIAN (72x72 Seraphic 6-winged deity)
    const cSg = document.createElement('canvas');
    cSg.width = 72; cSg.height = 72;
    const ctxSg = cSg.getContext('2d')!;
    ctxSg.imageSmoothingEnabled = false;

    // Shadow
    ctxSg.fillStyle = 'rgba(0,0,0,0.5)';
    ctxSg.beginPath(); ctxSg.ellipse(36, 66, 24, 4, 0, 0, Math.PI * 2); ctxSg.fill();
    // 6 Radiant Wings
    ctxSg.fillStyle = '#fef08a';
    ctxSg.beginPath(); ctxSg.moveTo(36, 24); ctxSg.lineTo(8, 4); ctxSg.lineTo(16, 36); ctxSg.fill();
    ctxSg.beginPath(); ctxSg.moveTo(36, 24); ctxSg.lineTo(64, 4); ctxSg.lineTo(56, 36); ctxSg.fill();
    ctxSg.fillStyle = '#ffffff';
    ctxSg.beginPath(); ctxSg.moveTo(36, 32); ctxSg.lineTo(4, 24); ctxSg.lineTo(16, 52); ctxSg.fill();
    ctxSg.beginPath(); ctxSg.moveTo(36, 32); ctxSg.lineTo(68, 24); ctxSg.lineTo(56, 52); ctxSg.fill();
    // Divine Golden Armor Body
    ctxSg.fillStyle = '#f59e0b';
    ctxSg.fillRect(28, 22, 16, 26);
    ctxSg.fillStyle = '#fbbf24';
    ctxSg.fillRect(30, 24, 12, 22);
    // Seraph Halo
    ctxSg.strokeStyle = '#fde047'; ctxSg.lineWidth = 3;
    ctxSg.beginPath(); ctxSg.arc(36, 12, 10, 0, Math.PI * 2); ctxSg.stroke();
    // Holy Face
    ctxSg.fillStyle = '#fed7aa';
    ctxSg.fillRect(32, 14, 8, 8);
    // Radiant Sword of Light
    ctxSg.fillStyle = '#ffffff';
    ctxSg.fillRect(48, 8, 4, 46);
    ctxSg.fillStyle = '#f59e0b';
    ctxSg.fillRect(44, 42, 12, 3);
    scene.textures.addCanvas('boss_sky_guardian', cSg);

    // Celestial Tower Tile: 32x32
    const cTileCel = document.createElement('canvas');
    cTileCel.width = 32; cTileCel.height = 32;
    const ctxTc = cTileCel.getContext('2d')!;
    ctxTc.fillStyle = '#312e81'; ctxTc.fillRect(0, 0, 32, 32);
    ctxTc.fillStyle = '#4338ca';
    ctxTc.fillRect(2, 2, 28, 28);
    // Gold filigree edge
    ctxTc.strokeStyle = '#fbbf24'; ctxTc.lineWidth = 1;
    ctxTc.strokeRect(4, 4, 24, 24);
    scene.textures.addCanvas('tile_celestial', cTileCel);

    // Celestial Pillar Prop: 60x80
    const cCp = document.createElement('canvas');
    cCp.width = 60; cCp.height = 80;
    const ctxCp = cCp.getContext('2d')!;
    ctxCp.fillStyle = '#f8fafc';
    ctxCp.fillRect(18, 14, 24, 55);
    ctxCp.fillStyle = '#fbbf24';
    ctxCp.fillRect(14, 8, 32, 8); ctxCp.fillRect(14, 64, 32, 8);
    // Floating starlight gem
    ctxCp.fillStyle = '#38bdf8';
    ctxCp.fillRect(25, 0, 10, 10);
    scene.textures.addCanvas('prop_celestial_pillar', cCp);
  }

  // ==========================================
  // PHASE 2 NPC ASSETS
  // ==========================================
  private static createPhase2NpcAssets(scene: Phaser.Scene) {
    // 1. Alchemist Celine (32x32)
    const cAlc = document.createElement('canvas');
    cAlc.width = 32; cAlc.height = 32;
    const ctxAl = cAlc.getContext('2d')!;
    ctxAl.imageSmoothingEnabled = false;
    ctxAl.fillStyle = 'rgba(0,0,0,0.25)';
    ctxAl.beginPath(); ctxAl.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); ctxAl.fill();
    // Violet alchemist coat
    ctxAl.fillStyle = '#9333ea';
    ctxAl.fillRect(11, 14, 10, 10);
    // Head with green beret
    ctxAl.fillStyle = '#fed7aa'; ctxAl.fillRect(11, 6, 10, 8);
    ctxAl.fillStyle = '#10b981'; ctxAl.fillRect(9, 3, 14, 4);
    // Glowing potion flask in hand
    ctxAl.fillStyle = '#ef4444'; ctxAl.fillRect(22, 16, 5, 6);
    scene.textures.addCanvas('npc_alchemist', cAlc);

    // 2. Refinement Master Walter (32x32)
    const cRef = document.createElement('canvas');
    cRef.width = 32; cRef.height = 32;
    const ctxRf = cRef.getContext('2d')!;
    ctxRf.imageSmoothingEnabled = false;
    ctxRf.fillStyle = 'rgba(0,0,0,0.25)';
    ctxRf.beginPath(); ctxRf.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); ctxRf.fill();
    // Heavy leather blacksmith apron
    ctxRf.fillStyle = '#78350f';
    ctxRf.fillRect(11, 14, 10, 11);
    ctxRf.fillStyle = '#f59e0b';
    ctxRf.fillRect(12, 16, 8, 6);
    // Head with red headband
    ctxRf.fillStyle = '#fed7aa'; ctxRf.fillRect(11, 6, 10, 8);
    ctxRf.fillStyle = '#dc2626'; ctxRf.fillRect(10, 5, 12, 3);
    // Anvil hammer
    ctxRf.fillStyle = '#64748b'; ctxRf.fillRect(22, 12, 6, 6);
    ctxRf.fillStyle = '#451a03'; ctxRf.fillRect(24, 18, 2, 8);
    scene.textures.addCanvas('npc_refiner', cRef);

    // 3. Dungeon Guide Ralph (32x32)
    const cDg = document.createElement('canvas');
    cDg.width = 32; cDg.height = 32;
    const ctxDg = cDg.getContext('2d')!;
    ctxDg.imageSmoothingEnabled = false;
    ctxDg.fillStyle = 'rgba(0,0,0,0.25)';
    ctxDg.beginPath(); ctxDg.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); ctxDg.fill();
    // Dark traveler cloak
    ctxDg.fillStyle = '#1e293b';
    ctxDg.fillRect(11, 14, 10, 11);
    ctxDg.fillStyle = '#334155'; ctxDg.fillRect(10, 5, 12, 9);
    // Lantern
    ctxDg.fillStyle = '#fbbf24'; ctxDg.fillRect(22, 16, 4, 6);
    scene.textures.addCanvas('npc_dungeon_guide', cDg);

    // 4. Guild Master Vane (32x32)
    const cGm = document.createElement('canvas');
    cGm.width = 32; cGm.height = 32;
    const ctxGm = cGm.getContext('2d')!;
    ctxGm.imageSmoothingEnabled = false;
    ctxGm.fillStyle = 'rgba(0,0,0,0.25)';
    ctxGm.beginPath(); ctxGm.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); ctxGm.fill();
    // Golden armor & red cape
    ctxGm.fillStyle = '#dc2626'; ctxGm.fillRect(8, 14, 16, 12);
    ctxGm.fillStyle = '#f59e0b'; ctxGm.fillRect(11, 14, 10, 10);
    ctxGm.fillStyle = '#fed7aa'; ctxGm.fillRect(11, 6, 10, 8);
    ctxGm.fillStyle = '#f59e0b'; ctxGm.fillRect(10, 4, 12, 4);
    scene.textures.addCanvas('npc_guild_master', cGm);
  }
}
