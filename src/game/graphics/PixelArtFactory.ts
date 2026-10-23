/**
 * Etheria Chronicles - Procedural Pixel Art Texture Generator
 * Generates crisp 16-bit retro sprites and tiles directly in memory
 */

import Phaser from 'phaser';
import { BiomePixelArt } from './BiomePixelArt';

export class PixelArtFactory {
  /**
   * Generates all required textures and adds them to the Phaser TextureManager
   */
  public static generateAllTextures(scene: Phaser.Scene) {
    if (scene.textures.exists('player_idle')) {
      return; // Already initialized
    }

    // 1. Generate Player Sprites
    this.createPlayerTextures(scene);

    // 2. Generate Monster Sprites
    this.createMonsterTextures(scene);

    // 3. Generate NPC & Dummy Sprites
    this.createNpcTextures(scene);

    // 4. Generate Pet Companion Sprites
    this.createPetTextures(scene);

    // 5. Generate Environment & Tile Textures
    this.createEnvironmentTextures(scene);

    // 6. Generate VFX & Particle Textures
    this.createVfxTextures(scene);

    // 7. Generate Phase 2 Biome Pixel Art (16 monsters, 3 bosses, 4 NPCs, biome tiles/props)
    BiomePixelArt.generateAll(scene);
  }

  // --- PLAYER SPRITES ---
  private static createPlayerTextures(scene: Phaser.Scene) {
    // 32x32 Player Sprite - Idle and Walk frames
    const canvas = document.createElement('canvas');
    canvas.width = 128; // 4 frames: Idle, Walk1, Walk2, Attack
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Helper to draw a pixel character frame at xOffset
    const drawCharFrame = (xOff: number, legOffset: number, swordDrawn: boolean) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(xOff + 16, 28, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body / Tunic
      ctx.fillStyle = '#2563eb'; // Royal blue tunic
      ctx.fillRect(xOff + 11, 14, 10, 9);
      // Belt
      ctx.fillStyle = '#78350f';
      ctx.fillRect(xOff + 10, 19, 12, 2);
      ctx.fillStyle = '#f59e0b'; // Gold buckle
      ctx.fillRect(xOff + 15, 19, 2, 2);

      // Legs / Boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(xOff + 11 - legOffset, 23, 4, 5);
      ctx.fillRect(xOff + 17 + legOffset, 23, 4, 5);
      // Boot tips
      ctx.fillStyle = '#451a03';
      ctx.fillRect(xOff + 10 - legOffset, 26, 5, 2);
      ctx.fillRect(xOff + 17 + legOffset, 26, 5, 2);

      // Head / Skin
      ctx.fillStyle = '#fed7aa'; // Light skin
      ctx.fillRect(xOff + 11, 6, 10, 8);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(xOff + 13, 9, 2, 2);
      ctx.fillRect(xOff + 17, 9, 2, 2);

      // Hair (Classic anime spiky adventurer hair)
      ctx.fillStyle = '#d97706'; // Golden blond
      ctx.fillRect(xOff + 9, 4, 14, 4);
      ctx.fillRect(xOff + 8, 6, 3, 5);
      ctx.fillRect(xOff + 21, 6, 3, 5);
      ctx.fillRect(xOff + 13, 2, 6, 3);

      // Weapon
      if (swordDrawn) {
        // Slashing blade
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(xOff + 22, 10, 8, 3);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(xOff + 23, 11, 7, 1);
        ctx.fillStyle = '#b45309'; // Guard
        ctx.fillRect(xOff + 20, 9, 2, 5);
      } else {
        // Sheathed sword on back
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(xOff + 7, 11, 2, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(xOff + 6, 9, 4, 2);
      }
    };

    // Frame 0: Idle
    drawCharFrame(0, 0, false);
    // Frame 1: Walk A
    drawCharFrame(32, 1, false);
    // Frame 2: Walk B
    drawCharFrame(64, -1, false);
    // Frame 3: Attack Slash
    drawCharFrame(96, 0, true);

    const playerTex = scene.textures.addCanvas('player', canvas);
    if (playerTex) {
      playerTex.add(0, 0, 0, 0, 32, 32);
      playerTex.add(1, 0, 32, 0, 32, 32);
      playerTex.add(2, 0, 64, 0, 32, 32);
      playerTex.add(3, 0, 96, 0, 32, 32);
    }
  }

  // --- MONSTER SPRITES ---
  private static createMonsterTextures(scene: Phaser.Scene) {
    // 1. Mossling (Lv 1): 28x28 cute green foliage critter
    const cMoss = document.createElement('canvas');
    cMoss.width = 28;
    cMoss.height = 28;
    const ctxM = cMoss.getContext('2d')!;
    ctxM.imageSmoothingEnabled = false;

    // Shadow
    ctxM.fillStyle = 'rgba(0,0,0,0.25)';
    ctxM.beginPath();
    ctxM.ellipse(14, 25, 9, 3, 0, 0, Math.PI * 2);
    ctxM.fill();

    // Moss body
    ctxM.fillStyle = '#22c55e';
    ctxM.beginPath();
    ctxM.arc(14, 16, 9, 0, Math.PI * 2);
    ctxM.fill();
    ctxM.fillStyle = '#86efac';
    ctxM.fillRect(10, 11, 4, 4);

    // Cute eyes & blush
    ctxM.fillStyle = '#064e3b';
    ctxM.fillRect(10, 15, 2, 3);
    ctxM.fillRect(16, 15, 2, 3);
    ctxM.fillStyle = '#f472b6'; // Pink blush
    ctxM.fillRect(8, 18, 2, 1);
    ctxM.fillRect(18, 18, 2, 1);

    // Leaf sprout on head
    ctxM.fillStyle = '#15803d';
    ctxM.fillRect(13, 4, 2, 4);
    ctxM.beginPath();
    ctxM.ellipse(16, 4, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctxM.fill();

    scene.textures.addCanvas('monster_mossling', cMoss);

    // 2. Gooey Sproutling (Lv 3): 32x32 bouncy translucent slime
    const cSlime = document.createElement('canvas');
    cSlime.width = 32;
    cSlime.height = 32;
    const ctxS = cSlime.getContext('2d')!;
    ctxS.imageSmoothingEnabled = false;

    // Shadow
    ctxS.fillStyle = 'rgba(0,0,0,0.25)';
    ctxS.beginPath();
    ctxS.ellipse(16, 28, 11, 3, 0, 0, Math.PI * 2);
    ctxS.fill();

    // Slime dome
    ctxS.fillStyle = '#10b981';
    ctxS.beginPath();
    ctxS.arc(16, 18, 11, 0, Math.PI * 2);
    ctxS.fill();
    // Inner shiny highlight
    ctxS.fillStyle = '#6ee7b7';
    ctxS.beginPath();
    ctxS.arc(12, 13, 4, 0, Math.PI * 2);
    ctxS.fill();
    ctxS.fillStyle = '#ecfdf5';
    ctxS.fillRect(11, 12, 2, 2);

    // Big happy anime eyes
    ctxS.fillStyle = '#064e3b';
    ctxS.fillRect(12, 16, 3, 4);
    ctxS.fillRect(18, 16, 3, 4);
    ctxS.fillStyle = '#ffffff';
    ctxS.fillRect(12, 16, 1, 2);
    ctxS.fillRect(18, 16, 1, 2);

    // Little clover on top
    ctxS.fillStyle = '#047857';
    ctxS.fillRect(15, 3, 2, 5);
    ctxS.beginPath();
    ctxS.ellipse(13, 3, 3, 2, -Math.PI / 6, 0, Math.PI * 2);
    ctxS.ellipse(19, 3, 3, 2, Math.PI / 6, 0, Math.PI * 2);
    ctxS.fill();

    scene.textures.addCanvas('monster_sprout_slime', cSlime);

    // 3. Thornback Beetle (Lv 5): 34x34 armored insect with spiky shell
    const cBeetle = document.createElement('canvas');
    cBeetle.width = 34;
    cBeetle.height = 34;
    const ctxB = cBeetle.getContext('2d')!;
    ctxB.imageSmoothingEnabled = false;

    // Shadow
    ctxB.fillStyle = 'rgba(0,0,0,0.3)';
    ctxB.beginPath();
    ctxB.ellipse(17, 30, 12, 4, 0, 0, Math.PI * 2);
    ctxB.fill();

    // Beetle shell
    ctxB.fillStyle = '#854d0e';
    ctxB.beginPath();
    ctxB.ellipse(17, 18, 11, 9, 0, 0, Math.PI * 2);
    ctxB.fill();

    // Spikes / Carapace plates
    ctxB.fillStyle = '#ca8a04';
    ctxB.fillRect(16, 10, 2, 16);
    ctxB.fillStyle = '#fbbf24';
    ctxB.fillRect(10, 14, 3, 3);
    ctxB.fillRect(21, 14, 3, 3);

    // Horn / Mandibles
    ctxB.fillStyle = '#713f12';
    ctxB.fillRect(16, 5, 2, 6);
    ctxB.fillRect(14, 4, 6, 2);

    // Red glowing eyes
    ctxB.fillStyle = '#ef4444';
    ctxB.fillRect(13, 9, 2, 2);
    ctxB.fillRect(19, 9, 2, 2);

    // Legs
    ctxB.fillStyle = '#451a03';
    ctxB.fillRect(5, 15, 3, 2);
    ctxB.fillRect(26, 15, 3, 2);
    ctxB.fillRect(6, 21, 3, 2);
    ctxB.fillRect(25, 21, 3, 2);

    scene.textures.addCanvas('monster_thornback_beetle', cBeetle);

    // 4. Wildfang Wolf (Lv 8): 36x36 ferocious predator
    const cWolf = document.createElement('canvas');
    cWolf.width = 36;
    cWolf.height = 36;
    const ctxW = cWolf.getContext('2d')!;
    ctxW.imageSmoothingEnabled = false;

    // Shadow
    ctxW.fillStyle = 'rgba(0,0,0,0.3)';
    ctxW.beginPath();
    ctxW.ellipse(18, 32, 13, 4, 0, 0, Math.PI * 2);
    ctxW.fill();

    // Wolf body & head
    ctxW.fillStyle = '#475569';
    ctxW.beginPath();
    ctxW.ellipse(18, 20, 11, 8, 0, 0, Math.PI * 2);
    ctxW.fill();

    // Fur mane
    ctxW.fillStyle = '#334155';
    ctxW.fillRect(10, 14, 16, 5);
    ctxW.fillStyle = '#64748b';
    ctxW.fillRect(14, 12, 8, 8);

    // Ears
    ctxW.fillStyle = '#1e293b';
    ctxW.fillRect(11, 7, 3, 5);
    ctxW.fillRect(22, 7, 3, 5);

    // Fierce glowing yellow eyes
    ctxW.fillStyle = '#eab308';
    ctxW.fillRect(13, 14, 3, 2);
    ctxW.fillRect(20, 14, 3, 2);

    // Fangs
    ctxW.fillStyle = '#f8fafc';
    ctxW.fillRect(15, 21, 2, 3);
    ctxW.fillRect(19, 21, 2, 3);

    scene.textures.addCanvas('monster_wildfang_wolf', cWolf);

    // 5. Ember Sprite (Lv 10): 32x32 fiery flying wisp
    const cEmber = document.createElement('canvas');
    cEmber.width = 32;
    cEmber.height = 32;
    const ctxE = cEmber.getContext('2d')!;
    ctxE.imageSmoothingEnabled = false;

    // Floating fire aura
    ctxE.fillStyle = '#ea580c';
    ctxE.beginPath();
    ctxE.arc(16, 16, 11, 0, Math.PI * 2);
    ctxE.fill();

    ctxE.fillStyle = '#f97316';
    ctxE.beginPath();
    ctxE.arc(16, 16, 8, 0, Math.PI * 2);
    ctxE.fill();

    ctxE.fillStyle = '#fde047';
    ctxE.beginPath();
    ctxE.arc(16, 15, 5, 0, Math.PI * 2);
    ctxE.fill();

    // Sprite eyes
    ctxE.fillStyle = '#431407';
    ctxE.fillRect(13, 14, 2, 3);
    ctxE.fillRect(17, 14, 2, 3);

    // Flickering flame tips
    ctxE.fillStyle = '#ef4444';
    ctxE.fillRect(15, 3, 2, 4);
    ctxE.fillRect(10, 6, 3, 3);
    ctxE.fillRect(19, 6, 3, 3);

    scene.textures.addCanvas('monster_ember_sprite', cEmber);

    // 6. Ancient Rootbeast (Lv 15 Elite Mini-Boss): 64x64 giant treant creature
    const cBoss = document.createElement('canvas');
    cBoss.width = 64;
    cBoss.height = 64;
    const ctxBoss = cBoss.getContext('2d')!;
    ctxBoss.imageSmoothingEnabled = false;

    // Shadow
    ctxBoss.fillStyle = 'rgba(0,0,0,0.4)';
    ctxBoss.beginPath();
    ctxBoss.ellipse(32, 58, 24, 6, 0, 0, Math.PI * 2);
    ctxBoss.fill();

    // Massive trunk torso
    ctxBoss.fillStyle = '#14532d'; // Deep ancient moss
    ctxBoss.fillRect(16, 20, 32, 32);
    ctxBoss.fillStyle = '#27272a'; // Ancient petrified bark
    ctxBoss.fillRect(18, 22, 28, 28);

    // Canopy crown
    ctxBoss.fillStyle = '#15803d';
    ctxBoss.beginPath();
    ctxBoss.arc(32, 18, 18, 0, Math.PI * 2);
    ctxBoss.fill();
    ctxBoss.fillStyle = '#22c55e';
    ctxBoss.beginPath();
    ctxBoss.arc(26, 14, 8, 0, Math.PI * 2);
    ctxBoss.arc(38, 14, 8, 0, Math.PI * 2);
    ctxBoss.fill();

    // Glowing menacing ancient runes / eyes
    ctxBoss.fillStyle = '#eab308'; // Amber glow
    ctxBoss.fillRect(24, 26, 5, 4);
    ctxBoss.fillRect(35, 26, 5, 4);
    ctxBoss.fillStyle = '#fef08a';
    ctxBoss.fillRect(25, 27, 2, 2);
    ctxBoss.fillRect(36, 27, 2, 2);

    // Gnarled root limbs
    ctxBoss.fillStyle = '#3f3f46';
    ctxBoss.fillRect(10, 32, 8, 18);
    ctxBoss.fillRect(46, 32, 8, 18);
    ctxBoss.fillRect(18, 50, 10, 8);
    ctxBoss.fillRect(36, 50, 10, 8);

    // Ancient thorns
    ctxBoss.fillStyle = '#ef4444';
    ctxBoss.fillRect(8, 30, 4, 4);
    ctxBoss.fillRect(52, 30, 4, 4);

    scene.textures.addCanvas('monster_rootbeast', cBoss);
  }

  // --- NPCS & TRAINING DUMMY ---
  private static createNpcTextures(scene: Phaser.Scene) {
    // 1. General NPC Template: 32x32
    const cNpc = document.createElement('canvas');
    cNpc.width = 32;
    cNpc.height = 32;
    const ctxN = cNpc.getContext('2d')!;
    ctxN.imageSmoothingEnabled = false;

    // Shadow
    ctxN.fillStyle = 'rgba(0,0,0,0.25)';
    ctxN.beginPath();
    ctxN.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
    ctxN.fill();

    // Outfit
    ctxN.fillStyle = '#7c2d12'; // Brown merchant cloak
    ctxN.fillRect(11, 14, 10, 10);
    ctxN.fillStyle = '#f59e0b';
    ctxN.fillRect(10, 18, 12, 2);

    // Head
    ctxN.fillStyle = '#fed7aa';
    ctxN.fillRect(11, 6, 10, 8);
    ctxN.fillStyle = '#0f172a';
    ctxN.fillRect(13, 9, 2, 2);
    ctxN.fillRect(17, 9, 2, 2);

    // Merchant Hat
    ctxN.fillStyle = '#0f766e';
    ctxN.fillRect(9, 3, 14, 4);

    scene.textures.addCanvas('npc_sprite', cNpc);

    // 2. Training Dummy: 32x32 straw doll on wooden cross
    const cDummy = document.createElement('canvas');
    cDummy.width = 32;
    cDummy.height = 32;
    const ctxD = cDummy.getContext('2d')!;
    ctxD.imageSmoothingEnabled = false;

    // Shadow
    ctxD.fillStyle = 'rgba(0,0,0,0.25)';
    ctxD.beginPath();
    ctxD.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
    ctxD.fill();

    // Wood post
    ctxD.fillStyle = '#78350f';
    ctxD.fillRect(15, 12, 2, 16);
    ctxD.fillRect(8, 15, 16, 2);

    // Straw body
    ctxD.fillStyle = '#d97706';
    ctxD.fillRect(11, 12, 10, 12);
    // Rope ties
    ctxD.fillStyle = '#fef3c7';
    ctxD.fillRect(11, 16, 10, 2);

    // Straw head with target cross
    ctxD.fillStyle = '#f59e0b';
    ctxD.fillRect(11, 4, 10, 8);
    ctxD.fillStyle = '#ef4444';
    ctxD.fillRect(15, 6, 2, 4);
    ctxD.fillRect(13, 7, 6, 2);

    scene.textures.addCanvas('training_dummy', cDummy);
  }

  // --- PET COMPANIONS ---
  private static createPetTextures(scene: Phaser.Scene) {
    // Sproutling Pet: 20x20 floating adorable leaf buddy
    const cPet = document.createElement('canvas');
    cPet.width = 20;
    cPet.height = 20;
    const ctxP = cPet.getContext('2d')!;
    ctxP.imageSmoothingEnabled = false;

    // Soft round body
    ctxP.fillStyle = '#4ade80';
    ctxP.beginPath();
    ctxP.arc(10, 11, 7, 0, Math.PI * 2);
    ctxP.fill();

    // Tiny blush & sparkle eyes
    ctxP.fillStyle = '#065f46';
    ctxP.fillRect(8, 10, 2, 2);
    ctxP.fillRect(12, 10, 2, 2);
    ctxP.fillStyle = '#f472b6';
    ctxP.fillRect(6, 12, 2, 1);
    ctxP.fillRect(14, 12, 2, 1);

    // Twirling sprout on top
    ctxP.fillStyle = '#15803d';
    ctxP.fillRect(9, 2, 2, 3);
    ctxP.beginPath();
    ctxP.ellipse(12, 2, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
    ctxP.fill();

    scene.textures.addCanvas('pet_sproutling', cPet);
  }

  // --- ENVIRONMENT & TILES ---
  private static createEnvironmentTextures(scene: Phaser.Scene) {
    // 1. Grass Tile: 32x32
    const cGrass = document.createElement('canvas');
    cGrass.width = 32;
    cGrass.height = 32;
    const ctxG = cGrass.getContext('2d')!;
    ctxG.fillStyle = '#4ade80'; // Lush meadow
    ctxG.fillRect(0, 0, 32, 32);
    // Darker grass blade specks
    ctxG.fillStyle = '#22c55e';
    ctxG.fillRect(4, 6, 2, 3);
    ctxG.fillRect(18, 14, 2, 3);
    ctxG.fillRect(26, 22, 2, 3);
    ctxG.fillRect(10, 25, 2, 3);
    // Subtle flower speck
    ctxG.fillStyle = '#fef08a';
    ctxG.fillRect(14, 8, 2, 2);

    scene.textures.addCanvas('tile_grass', cGrass);

    // 2. Cobblestone Paver: 32x32
    const cCobble = document.createElement('canvas');
    cCobble.width = 32;
    cCobble.height = 32;
    const ctxC = cCobble.getContext('2d')!;
    ctxC.fillStyle = '#94a3b8';
    ctxC.fillRect(0, 0, 32, 32);
    ctxC.fillStyle = '#cbd5e1';
    ctxC.fillRect(2, 2, 12, 12);
    ctxC.fillRect(18, 2, 12, 12);
    ctxC.fillRect(2, 18, 12, 12);
    ctxC.fillRect(18, 18, 12, 12);
    ctxC.fillStyle = '#64748b';
    ctxC.fillRect(0, 15, 32, 2);
    ctxC.fillRect(15, 0, 2, 32);

    scene.textures.addCanvas('tile_cobblestone', cCobble);

    // 3. Water Tile: 32x32
    const cWater = document.createElement('canvas');
    cWater.width = 32;
    cWater.height = 32;
    const ctxW = cWater.getContext('2d')!;
    ctxW.fillStyle = '#38bdf8';
    ctxW.fillRect(0, 0, 32, 32);
    ctxW.fillStyle = '#0284c7';
    ctxW.fillRect(6, 8, 14, 3);
    ctxW.fillRect(16, 20, 12, 3);
    ctxW.fillStyle = '#bae6fd';
    ctxW.fillRect(8, 7, 6, 1);
    ctxW.fillRect(18, 19, 5, 1);

    scene.textures.addCanvas('tile_water', cWater);

    // 4. Dark Woodland Grass: 32x32
    const cDarkG = document.createElement('canvas');
    cDarkG.width = 32;
    cDarkG.height = 32;
    const ctxDG = cDarkG.getContext('2d')!;
    ctxDG.fillStyle = '#065f46';
    ctxDG.fillRect(0, 0, 32, 32);
    ctxDG.fillStyle = '#047857';
    ctxDG.fillRect(4, 10, 3, 3);
    ctxDG.fillRect(20, 18, 3, 3);
    ctxDG.fillStyle = '#34d399'; // Glowing spore
    ctxDG.fillRect(12, 24, 2, 2);

    scene.textures.addCanvas('tile_forest', cDarkG);

    // 5. Portal Ring: 48x48 glowing blue/cyan portal
    const cPortal = document.createElement('canvas');
    cPortal.width = 48;
    cPortal.height = 48;
    const ctxPort = cPortal.getContext('2d')!;
    ctxPort.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctxPort.beginPath();
    ctxPort.arc(24, 24, 22, 0, Math.PI * 2);
    ctxPort.fill();

    ctxPort.strokeStyle = '#38bdf8';
    ctxPort.lineWidth = 3;
    ctxPort.beginPath();
    ctxPort.arc(24, 24, 18, 0, Math.PI * 2);
    ctxPort.stroke();

    ctxPort.fillStyle = '#e0f2fe';
    ctxPort.beginPath();
    ctxPort.arc(24, 24, 10, 0, Math.PI * 2);
    ctxPort.fill();

    scene.textures.addCanvas('portal_ring', cPortal);

    // 6. Town Fountain: 64x64
    const cFount = document.createElement('canvas');
    cFount.width = 64;
    cFount.height = 64;
    const ctxF = cFount.getContext('2d')!;
    ctxF.fillStyle = '#64748b';
    ctxF.beginPath();
    ctxF.arc(32, 32, 28, 0, Math.PI * 2);
    ctxF.fill();
    ctxF.fillStyle = '#0284c7';
    ctxF.beginPath();
    ctxF.arc(32, 32, 22, 0, Math.PI * 2);
    ctxF.fill();
    ctxF.fillStyle = '#bae6fd';
    ctxF.beginPath();
    ctxF.arc(32, 32, 10, 0, Math.PI * 2);
    ctxF.fill();

    scene.textures.addCanvas('fountain', cFount);

    // 7. Tree: 64x80
    const cTree = document.createElement('canvas');
    cTree.width = 64;
    cTree.height = 80;
    const ctxT = cTree.getContext('2d')!;
    // Shadow
    ctxT.fillStyle = 'rgba(0,0,0,0.3)';
    ctxT.beginPath();
    ctxT.ellipse(32, 74, 24, 6, 0, 0, Math.PI * 2);
    ctxT.fill();
    // Trunk
    ctxT.fillStyle = '#78350f';
    ctxT.fillRect(26, 44, 12, 30);
    // Foliage crown
    ctxT.fillStyle = '#166534';
    ctxT.beginPath();
    ctxT.arc(32, 32, 26, 0, Math.PI * 2);
    ctxT.fill();
    ctxT.fillStyle = '#22c55e';
    ctxT.beginPath();
    ctxT.arc(26, 26, 16, 0, Math.PI * 2);
    ctxT.fill();
    ctxT.fillStyle = '#4ade80';
    ctxT.beginPath();
    ctxT.arc(36, 24, 12, 0, Math.PI * 2);
    ctxT.fill();

    scene.textures.addCanvas('prop_tree', cTree);

    // 8. Cottage Building: 120x90
    const cHouse = document.createElement('canvas');
    cHouse.width = 120;
    cHouse.height = 90;
    const ctxH = cHouse.getContext('2d')!;
    // Shadow
    ctxH.fillStyle = 'rgba(0,0,0,0.3)';
    ctxH.fillRect(5, 80, 110, 10);
    // Wall
    ctxH.fillStyle = '#e2e8f0';
    ctxH.fillRect(10, 36, 100, 48);
    // Thatched / tiled roof
    ctxH.fillStyle = '#b45309';
    ctxH.beginPath();
    ctxH.moveTo(60, 4);
    ctxH.lineTo(116, 38);
    ctxH.lineTo(4, 38);
    ctxH.closePath();
    ctxH.fill();
    // Roof ridge
    ctxH.fillStyle = '#d97706';
    ctxH.fillRect(8, 36, 104, 4);
    // Door
    ctxH.fillStyle = '#78350f';
    ctxH.fillRect(48, 52, 24, 32);
    ctxH.fillStyle = '#fbbf24';
    ctxH.fillRect(66, 68, 2, 2);
    // Windows
    ctxH.fillStyle = '#38bdf8';
    ctxH.fillRect(20, 48, 16, 16);
    ctxH.fillRect(84, 48, 16, 16);
    ctxH.strokeStyle = '#475569';
    ctxH.strokeRect(20, 48, 16, 16);
    ctxH.strokeRect(84, 48, 16, 16);

    scene.textures.addCanvas('prop_building', cHouse);

    // 9. Herb Bush Node: 24x24
    const cHerb = document.createElement('canvas');
    cHerb.width = 24;
    cHerb.height = 24;
    const ctxHb = cHerb.getContext('2d')!;
    ctxHb.fillStyle = '#15803d';
    ctxHb.beginPath();
    ctxHb.arc(12, 14, 8, 0, Math.PI * 2);
    ctxHb.fill();
    ctxHb.fillStyle = '#ef4444'; // Red medicinal berries
    ctxHb.fillRect(8, 10, 3, 3);
    ctxHb.fillRect(14, 12, 3, 3);

    scene.textures.addCanvas('node_herb', cHerb);

    // 10. Ore Deposit Node: 24x24
    const cOre = document.createElement('canvas');
    cOre.width = 24;
    cOre.height = 24;
    const ctxO = cOre.getContext('2d')!;
    ctxO.fillStyle = '#64748b';
    ctxO.beginPath();
    ctxO.arc(12, 14, 9, 0, Math.PI * 2);
    ctxO.fill();
    ctxO.fillStyle = '#fb923c'; // Copper veins
    ctxO.fillRect(9, 10, 4, 3);
    ctxO.fillRect(13, 14, 5, 2);

    scene.textures.addCanvas('node_ore', cOre);
  }

  // --- VFX & PARTICLES ---
  private static createVfxTextures(scene: Phaser.Scene) {
    // 1. Slash arc: 32x32
    const cSlash = document.createElement('canvas');
    cSlash.width = 32;
    cSlash.height = 32;
    const ctxSl = cSlash.getContext('2d')!;
    ctxSl.strokeStyle = '#f8fafc';
    ctxSl.lineWidth = 4;
    ctxSl.beginPath();
    ctxSl.arc(16, 16, 12, -Math.PI / 3, Math.PI / 3);
    ctxSl.stroke();
    ctxSl.strokeStyle = '#38bdf8';
    ctxSl.lineWidth = 2;
    ctxSl.stroke();

    scene.textures.addCanvas('vfx_slash', cSlash);

    // 2. Ground Drop Pouch: 20x20
    const cDrop = document.createElement('canvas');
    cDrop.width = 20;
    cDrop.height = 20;
    const ctxDr = cDrop.getContext('2d')!;
    ctxDr.fillStyle = '#b45309'; // Leather bag
    ctxDr.beginPath();
    ctxDr.arc(10, 13, 6, 0, Math.PI * 2);
    ctxDr.fill();
    ctxDr.fillStyle = '#f59e0b';
    ctxDr.fillRect(8, 6, 4, 3);
    ctxDr.fillStyle = '#fde047'; // Sparkle
    ctxDr.fillRect(9, 4, 2, 2);

    scene.textures.addCanvas('ground_drop', cDrop);

    // 3. Selection Reticle: 36x36
    const cReticle = document.createElement('canvas');
    cReticle.width = 36;
    cReticle.height = 36;
    const ctxR = cReticle.getContext('2d')!;
    ctxR.strokeStyle = '#ef4444';
    ctxR.lineWidth = 2;
    // Four corner brackets
    ctxR.strokeRect(2, 2, 8, 1);
    ctxR.strokeRect(2, 2, 1, 8);
    ctxR.strokeRect(26, 2, 8, 1);
    ctxR.strokeRect(33, 2, 1, 8);
    ctxR.strokeRect(2, 33, 8, 1);
    ctxR.strokeRect(2, 26, 1, 8);
    ctxR.strokeRect(26, 33, 8, 1);
    ctxR.strokeRect(33, 26, 1, 8);

    scene.textures.addCanvas('target_reticle', cReticle);
  }
}
