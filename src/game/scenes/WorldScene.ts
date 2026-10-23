/**
 * Etheria Chronicles - Phaser 3 World Scene
 * Real-time 2D movement, combat, monster AI, drops, collisions, and portals
 */

import Phaser from 'phaser';
import { soundEffects } from '../audio/SoundEffects';
import { MAPS, MapObstacle } from '../data/maps';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { SKILL_CATALOG } from '../data/skills';
import { PixelArtFactory } from '../graphics/PixelArtFactory';
import { gameState } from '../state/GameState';
import { calculateMagicDamage, calculatePhysicalDamage, rollHitChance } from '../systems/formulas';
import { ActiveMonster, MapId, MonsterTemplate } from '../types';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private npcsGroup!: Phaser.GameObjects.Group;
  private monsterSprites: Map<string, { sprite: Phaser.Physics.Arcade.Sprite; hpBar: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text; data: ActiveMonster; template: MonsterTemplate }> = new Map();
  private petSprite: Phaser.GameObjects.Sprite | null = null;
  private targetReticle: Phaser.GameObjects.Sprite | null = null;
  private selectedMonsterId: string | null = null;
  private selectedNpcId: string | null = null;
  private groundDropSprites: Map<string, { sprite: Phaser.GameObjects.Sprite; text: Phaser.GameObjects.Text; aura: Phaser.GameObjects.Graphics }> = new Map();
  private gatherableSprites: Map<string, { sprite: Phaser.GameObjects.Sprite; text: Phaser.GameObjects.Text; node: typeof MAPS.verdant_fields.gatherables[0] }> = new Map();

  private playerNameText!: Phaser.GameObjects.Text;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private telegraphGraphics!: Phaser.GameObjects.Graphics;

  private currentMapId: MapId = 'dawnshire';
  private lastAttackTime: number = 0;
  private skillCooldowns: Record<string, number> = {};
  private gatheringProgress: { nodeId: string; startTime: number; duration: number } | null = null;
  private gatheringBar!: Phaser.GameObjects.Graphics;

  // External event hooks for React UI
  public onNpcInteract?: (npcId: string) => void;
  public onTargetChange?: (monster: ActiveMonster | null, template: MonsterTemplate | null) => void;

  constructor() {
    super({ key: 'WorldScene' });
  }

  public preload() {
    // 1. Real Image Assets & Sprite Sheets (Sunken Ruins family & Tide Lord)
    this.load.spritesheet('monster_aqua_slime_sheet', '/assets/monsters/sunken-ruins/aqua_slime.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('monster_reef_crab_sheet', '/assets/monsters/sunken-ruins/reef_crab.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('monster_drowned_warrior_sheet', '/assets/monsters/sunken-ruins/drowned_warrior.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('monster_sea_serpent_sheet', '/assets/monsters/sunken-ruins/sea_serpent.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('boss_tide_lord_sheet', '/assets/bosses/tide_lord.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('tile_sunken_sheet', '/assets/tilesets/sunken_ruins_tileset.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 2. Procedural pixel-art fallback for unmigrated assets
    PixelArtFactory.generateAllTextures(this);
  }

  public create() {
    const profile = gameState.getProfile();
    this.currentMapId = profile.currentMap;

    // Register real PNG sprite animations
    this.registerRealAnimations();

    // Build Map Environment
    this.buildMap(this.currentMapId);

    // Create Player Entity
    this.createPlayer(profile.x, profile.y);

    // Setup Camera
    const mapData = MAPS[this.currentMapId];
    this.cameras.main.setBounds(0, 0, mapData.width, mapData.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, mapData.width, mapData.height);

    // Setup Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        F: Phaser.Input.Keyboard.KeyCodes.F,
        ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
        TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
        THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
        FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
        Q: Phaser.Input.Keyboard.KeyCodes.Q,
        TAB: Phaser.Input.Keyboard.KeyCodes.TAB,
      }) as Record<string, Phaser.Input.Keyboard.Key>;
    }

    // Target reticle
    this.targetReticle = this.add.sprite(-100, -100, 'target_reticle').setVisible(false).setDepth(20);

    // Telegraph graphics
    this.telegraphGraphics = this.add.graphics().setDepth(5);
    // Gathering progress bar
    this.gatheringBar = this.add.graphics().setDepth(30);

    // Subscribe to ground drops from gameState
    gameState.subscribeDrops((drops) => {
      this.syncGroundDrops(drops);
    });

    // Mouse targeting and interaction
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        // Deselect target
        this.clearTarget();
      }
    });

    // Ambient floating text updater
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => this.updateFloatingTexts(),
    });

    // Passive regeneration ticker (every 4s)
    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => this.handlePassiveRegen(),
    });
  }

  private registerRealAnimations() {
    const monsters = [
      { key: 'aqua_slime', sheet: 'monster_aqua_slime_sheet' },
      { key: 'reef_crab', sheet: 'monster_reef_crab_sheet' },
      { key: 'drowned_warrior', sheet: 'monster_drowned_warrior_sheet' },
      { key: 'sea_serpent', sheet: 'monster_sea_serpent_sheet' },
    ];

    monsters.forEach(({ key, sheet }) => {
      if (this.textures.exists(sheet)) {
        if (!this.anims.exists(`${key}_idle`)) {
          this.anims.create({
            key: `${key}_idle`,
            frames: this.anims.generateFrameNumbers(sheet, { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1,
          });
        }
        if (!this.anims.exists(`${key}_walk`)) {
          this.anims.create({
            key: `${key}_walk`,
            frames: this.anims.generateFrameNumbers(sheet, { frames: [6, 7, 8, 9, 10, 11] }),
            frameRate: 8,
            repeat: -1,
          });
        }
        if (!this.anims.exists(`${key}_attack`)) {
          this.anims.create({
            key: `${key}_attack`,
            frames: this.anims.generateFrameNumbers(sheet, { frames: [12, 13, 14, 15] }),
            frameRate: 8,
            repeat: 0,
          });
        }
        if (!this.anims.exists(`${key}_hit`)) {
          this.anims.create({
            key: `${key}_hit`,
            frames: this.anims.generateFrameNumbers(sheet, { frames: [18, 19] }),
            frameRate: 6,
            repeat: 0,
          });
        }
        if (!this.anims.exists(`${key}_die`)) {
          this.anims.create({
            key: `${key}_die`,
            frames: this.anims.generateFrameNumbers(sheet, { frames: [20, 21, 22, 23] }),
            frameRate: 6,
            repeat: 0,
          });
        }
      }
    });

    // Tide Lord Boss Animations
    if (this.textures.exists('boss_tide_lord_sheet')) {
      if (!this.anims.exists('tide_lord_idle')) {
        this.anims.create({
          key: 'tide_lord_idle',
          frames: this.anims.generateFrameNumbers('boss_tide_lord_sheet', { frames: [0, 1, 2, 3] }),
          frameRate: 5,
          repeat: -1,
        });
      }
      if (!this.anims.exists('tide_lord_walk')) {
        this.anims.create({
          key: 'tide_lord_walk',
          frames: this.anims.generateFrameNumbers('boss_tide_lord_sheet', { frames: [6, 7, 8, 9, 10, 11] }),
          frameRate: 7,
          repeat: -1,
        });
      }
      if (!this.anims.exists('tide_lord_attack')) {
        this.anims.create({
          key: 'tide_lord_attack',
          frames: this.anims.generateFrameNumbers('boss_tide_lord_sheet', { frames: [12, 13, 14, 15] }),
          frameRate: 6,
          repeat: 0,
        });
      }
      if (!this.anims.exists('tide_lord_hit')) {
        this.anims.create({
          key: 'tide_lord_hit',
          frames: this.anims.generateFrameNumbers('boss_tide_lord_sheet', { frames: [18, 19] }),
          frameRate: 6,
          repeat: 0,
        });
      }
      if (!this.anims.exists('tide_lord_die')) {
        this.anims.create({
          key: 'tide_lord_die',
          frames: this.anims.generateFrameNumbers('boss_tide_lord_sheet', { frames: [20, 21, 22, 23] }),
          frameRate: 5,
          repeat: 0,
        });
      }
    }
  }

  private altarTriggered: boolean = false;

  private buildMap(mapId: MapId) {
    const mapData = MAPS[mapId];

    // Background tile grid based on biome
    let tileKey = 'tile_grass';
    if (mapId === 'dawnshire') tileKey = 'tile_cobblestone';
    else if (mapId === 'whisperwood') tileKey = 'tile_forest';
    else if (mapId === 'sunken_ruins') tileKey = 'tile_sunken';
    else if (mapId === 'frostpeak_mountains') tileKey = 'tile_snow';
    else if (mapId === 'crimson_desert') tileKey = 'tile_desert';
    else if (mapId === 'celestial_tower') tileKey = 'tile_celestial';

    const cols = Math.ceil(mapData.width / 32);
    const rows = Math.ceil(mapData.height / 32);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mapId === 'sunken_ruins' && this.textures.exists('tile_sunken_sheet')) {
          let frame = 0;
          const hash = (c * 17 + r * 31) % 100;
          if (hash < 8) frame = 1; // ancient runestone floor
          else if (hash < 16) frame = 2; // submerged water ripple floor
          else if (hash < 22) frame = 3; // sandy seabed with shells
          else if (hash < 26) frame = 4; // coral & aquatic flora
          this.add.image(c * 32 + 16, r * 32 + 16, 'tile_sunken_sheet', frame).setDepth(0);
        } else {
          this.add.image(c * 32 + 16, r * 32 + 16, tileKey).setDepth(0);
        }
      }
    }

    // Static obstacles
    this.obstaclesGroup = this.physics.add.staticGroup();

    mapData.obstacles.forEach((obs: MapObstacle) => {
      let texture = 'prop_building';
      if (obs.type === 'tree') texture = 'prop_tree';
      else if (obs.type === 'water') texture = 'tile_water';
      else if (obs.type === 'fence') texture = 'tile_cobblestone';
      else if (obs.type === 'pillar' || obs.type === 'ruin') texture = 'prop_pillar';
      else if (obs.type === 'coral') texture = 'prop_coral';
      else if (obs.type === 'pine') texture = 'prop_pine';
      else if (obs.type === 'ice') texture = 'prop_ice';
      else if (obs.type === 'dune') texture = 'prop_dune';
      else if (obs.type === 'cacti') texture = 'prop_cacti';
      else if (obs.type === 'celestial_pillar') texture = 'prop_celestial_pillar';

      const obsObj = this.add.rectangle(
        obs.x + obs.width / 2,
        obs.y + obs.height / 2,
        obs.width,
        obs.height,
        obs.type === 'water' ? 0x0284c7 : 0x000000,
        obs.type === 'water' ? 0.8 : 0
      );
      this.physics.add.existing(obsObj, true);
      this.obstaclesGroup.add(obsObj);

      // Render aesthetic props on top of obstacles
      if (this.textures.exists(texture) && obs.type !== 'water' && obs.type !== 'fence') {
        this.add.image(obs.x + obs.width / 2, obs.y + obs.height / 2, texture)
          .setDisplaySize(obs.width, obs.height)
          .setDepth(obs.type === 'tree' || obs.type === 'pine' ? 3 : 2);
      }
    });

    // Town Fountain if in Dawnshire
    if (mapId === 'dawnshire') {
      this.add.image(545, 445, 'fountain').setDepth(2);
    }

    // Sunken Ruins Ancient Altar Switch
    if (mapId === 'sunken_ruins') {
      const altar = this.add.rectangle(480, 700, 48, 48, 0x0e7490, 0.8).setDepth(2);
      this.physics.add.existing(altar, true);
      this.add.text(480, 670, '✦ Ancient Sea Altar ✦', {
        fontSize: '10px',
        color: '#67e8f9',
        fontFamily: 'Plus Jakarta Sans',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(15);

      this.physics.add.overlap(this.player || altar, altar, () => {
        if (!this.altarTriggered) {
          this.altarTriggered = true;
          soundEffects.playLevelUp();
          this.cameras.main.flash(400, 34, 211, 238);
          gameState.addSystemMessage('The Ancient Sea Altar glows! The watery gates to the Tide Lord unlock!');
          gameState.addFloatingText('SANCTUM UNLOCKED', 480, 640, '#38bdf8', true);
        }
      });
    }

    // Environmental Weather & Atmosphere Particles
    if (mapId === 'frostpeak_mountains') {
      // Gentle snow particles
      this.add.particles(0, 0, 'particle_sparkle', {
        x: { min: 0, max: mapData.width },
        y: 0,
        lifespan: 5000,
        speedY: { min: 40, max: 80 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.8, end: 0.3 },
        quantity: 2,
        blendMode: 'ADD',
      }).setDepth(25);
    } else if (mapId === 'crimson_desert') {
      // Sandstorm dust particles
      this.add.particles(0, 0, 'particle_crit', {
        x: 0,
        y: { min: 0, max: mapData.height },
        lifespan: 4000,
        speedX: { min: 100, max: 200 },
        speedY: { min: -10, max: 20 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.4, end: 0 },
        quantity: 3,
        tint: 0xf59e0b,
      }).setDepth(25);
    } else if (mapId === 'sunken_ruins') {
      // Rising aquatic bubbles
      this.add.particles(0, 0, 'particle_sparkle', {
        x: { min: 0, max: mapData.width },
        y: mapData.height,
        lifespan: 6000,
        speedY: { min: -30, max: -70 },
        speedX: { min: -10, max: 10 },
        scale: { start: 0.4, end: 0.9 },
        alpha: { start: 0.6, end: 0 },
        quantity: 2,
        tint: 0x38bdf8,
      }).setDepth(25);
    } else if (mapId === 'celestial_tower') {
      // Celestial starlight motes
      this.add.particles(0, 0, 'particle_sparkle', {
        x: { min: 0, max: mapData.width },
        y: { min: 0, max: mapData.height },
        lifespan: 3000,
        speedX: { min: -15, max: 15 },
        speedY: { min: -15, max: 15 },
        scale: { start: 0.2, end: 1.0 },
        alpha: { start: 0.8, end: 0 },
        quantity: 1,
        tint: 0xfde047,
        blendMode: 'ADD',
      }).setDepth(25);
    }

    // Portals
    mapData.portals.forEach((p) => {
      const portalSprite = this.add.sprite(p.x, p.y, 'portal_ring').setDepth(1);
      // Continuous pulse
      this.tweens.add({
        targets: portalSprite,
        scale: { from: 0.9, to: 1.15 },
        alpha: { from: 0.7, to: 1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });

      this.add.text(p.x, p.y - 32, p.label, {
        fontSize: '11px',
        color: '#e0f2fe',
        fontFamily: 'Plus Jakarta Sans',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(15);
    });

    // NPCs
    this.npcsGroup = this.add.group();
    mapData.npcs.forEach((npc) => {
      const isDummy = npc.id === 'npc_training_dummy';
      let spriteKey = isDummy ? 'training_dummy' : 'npc_sprite';
      if (npc.role === 'alchemist') spriteKey = 'npc_alchemist';
      else if (npc.role === 'refinement_master') spriteKey = 'npc_refiner';
      else if (npc.role === 'dungeon_guide') spriteKey = 'npc_dungeon_guide';
      else if (npc.role === 'guild_master') spriteKey = 'npc_guild_master';

      const npcSprite = this.physics.add.sprite(npc.x, npc.y, spriteKey).setDepth(10);
      npcSprite.setImmovable(true);

      npcSprite.setInteractive({ useHandCursor: true });
      npcSprite.on('pointerdown', () => {
        if (isDummy) {
          // Select dummy as combat target
          this.selectedMonsterId = 'training_dummy';
          this.updateTargetReticle(npcSprite.x, npcSprite.y);
          if (this.onTargetChange) {
            this.onTargetChange({
              instanceId: 'training_dummy',
              templateId: 'dummy',
              name: 'Training Dummy',
              level: 1,
              x: npc.x,
              y: npc.y,
              spawnX: npc.x,
              spawnY: npc.y,
              hp: 9999,
              maxHp: 9999,
              state: 'idle',
              targetPlayer: false,
              lastAttackTime: 0,
              stateTimer: 0,
              color: '#f59e0b',
            }, null);
          }
        } else {
          // Open NPC dialogue / shop
          this.triggerNpcInteraction(npc.id);
        }
      });

      // Nameplate & Role Badge
      this.add.text(npc.x, npc.y - 28, npc.name, {
        fontSize: '11px',
        color: '#fef08a',
        fontFamily: 'Plus Jakarta Sans',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(15);

      this.add.text(npc.x, npc.y - 16, npc.title, {
        fontSize: '9px',
        color: '#94a3b8',
        fontFamily: 'Plus Jakarta Sans',
      }).setOrigin(0.5).setDepth(15);

      this.npcsGroup.add(npcSprite);
    });

    // Gatherable Nodes
    mapData.gatherables.forEach((node) => {
      const texture = node.type === 'herb' ? 'node_herb' : 'node_ore';
      const gSprite = this.add.sprite(node.x, node.y, texture).setDepth(4);
      gSprite.setInteractive({ useHandCursor: true });

      const label = this.add.text(node.x, node.y - 18, node.name, {
        fontSize: '9px',
        color: '#a7f3d0',
        fontFamily: 'Plus Jakarta Sans',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(15).setVisible(false);

      gSprite.on('pointerover', () => label.setVisible(true));
      gSprite.on('pointerout', () => label.setVisible(false));
      gSprite.on('pointerdown', () => this.tryGatherNode(node));

      this.gatherableSprites.set(node.id, { sprite: gSprite, text: label, node });
    });

    // Spawn Monsters
    this.spawnMapMonsters(mapId);
  }

  private createPlayer(x: number, y: number) {
    this.player = this.physics.add.sprite(x, y, 'player', 0).setDepth(10);
    this.player.setSize(20, 24);
    this.player.setOffset(6, 6);
    this.player.setCollideWorldBounds(true);

    // Collide with obstacles
    this.physics.add.collider(this.player, this.obstaclesGroup);

    // Nameplate
    const profile = gameState.getProfile();
    this.playerNameText = this.add.text(x, y - 26, profile.customization.name, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Plus Jakarta Sans',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15);

    // Mini HP Bar
    this.playerHpBar = this.add.graphics().setDepth(15);

    // Companion Pet
    if (profile.activePet && profile.activePet.active) {
      this.petSprite = this.add.sprite(x - 20, y + 10, 'pet_sproutling').setDepth(9);
      // Floating bob tween
      this.tweens.add({
        targets: this.petSprite,
        y: '+=4',
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private spawnMapMonsters(mapId: MapId) {
    const mapData = MAPS[mapId];
    this.monsterSprites.clear();

    mapData.monsters.forEach((spawn, idx) => {
      const template = MONSTER_TEMPLATES[spawn.templateId];
      if (!template) return;

      const instanceId = `mon_${mapId}_${idx}`;
      const monsterData: ActiveMonster = {
        instanceId,
        templateId: template.id,
        name: template.name,
        level: template.level,
        x: spawn.x,
        y: spawn.y,
        spawnX: spawn.x,
        spawnY: spawn.y,
        hp: template.maxHp,
        maxHp: template.maxHp,
        state: 'idle',
        targetPlayer: false,
        lastAttackTime: 0,
        stateTimer: 0,
        color: template.color,
        isElite: template.isElite,
      };

      // Real PNG sprite sheet mapping
      const sheetMap: Record<string, string> = {
        aqua_slime: 'monster_aqua_slime_sheet',
        reef_crab: 'monster_reef_crab_sheet',
        drowned_warrior: 'monster_drowned_warrior_sheet',
        sea_serpent: 'monster_sea_serpent_sheet',
        tide_lord: 'boss_tide_lord_sheet',
      };

      const sheetKey = sheetMap[template.id];
      const hasSheet = Boolean(sheetKey && this.textures.exists(sheetKey));
      const spriteKey = hasSheet ? sheetKey : template.spriteKey;

      const sprite = this.physics.add.sprite(spawn.x, spawn.y, spriteKey, 0).setDepth(8);
      sprite.setInteractive({ useHandCursor: true });

      // Separate collision body from visual dimensions
      if (hasSheet) {
        if (template.isBoss) {
          sprite.setSize(56, 72);
          sprite.setOffset(36, 36);
        } else {
          sprite.setSize(30, 26);
          sprite.setOffset(17, 24);
        }
        if (this.anims.exists(`${template.id}_idle`)) {
          sprite.play(`${template.id}_idle`);
        }
      }

      // Monster nameplate
      const nameplate = this.add.text(spawn.x, spawn.y - (template.isBoss ? 42 : 24), `Lv.${template.level} ${template.name}`, {
        fontSize: template.isBoss ? '12px' : '10px',
        color: template.isBoss ? '#f59e0b' : '#f8fafc',
        fontFamily: 'Plus Jakarta Sans',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(15);

      const hpBar = this.add.graphics().setDepth(15);

      // Click to target monster
      sprite.on('pointerdown', () => {
        this.selectMonster(instanceId);
      });

      this.monsterSprites.set(instanceId, {
        sprite,
        hpBar,
        text: nameplate,
        data: monsterData,
        template,
      });
    });
  }

  public update(time: number, delta: number) {
    if (!this.player || !this.player.active) return;

    const dt = Math.min(delta / 1000, 0.05);
    const derived = gameState.getDerivedStats();
    const speed = derived.moveSpeed;

    // 1. Player Movement via WASD / Arrows
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.keys?.A?.isDown;
    const right = this.cursors.right.isDown || this.keys?.D?.isDown;
    const up = this.cursors.up.isDown || this.keys?.W?.isDown;
    const down = this.cursors.down.isDown || this.keys?.S?.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    if (vx !== 0 && vy !== 0) {
      // Normalize diagonal movement
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx * speed, vy * speed);

    // Update animations / flip
    if (vx !== 0 || vy !== 0) {
      // Cancel gathering if moving
      if (this.gatheringProgress) {
        this.gatheringProgress = null;
        this.gatheringBar.clear();
      }
      this.player.setFrame((Math.floor(time / 150) % 2) + 1);
      if (vx < 0) this.player.setFlipX(true);
      else if (vx > 0) this.player.setFlipX(false);
    } else {
      this.player.setFrame(0);
    }

    // Update Player Nameplate and HP bar position
    this.playerNameText.setPosition(this.player.x, this.player.y - 24);
    this.renderPlayerHpBar();

    // 2. Follow Player with Companion Pet
    if (this.petSprite) {
      const targetPetX = this.player.flipX ? this.player.x + 24 : this.player.x - 24;
      const targetPetY = this.player.y + 6;
      this.petSprite.x = Phaser.Math.Linear(this.petSprite.x, targetPetX, 0.08);
      this.petSprite.y = Phaser.Math.Linear(this.petSprite.y, targetPetY, 0.08);
      this.petSprite.setFlipX(this.player.flipX);
    }

    // 3. Update Monsters AI & Physics
    this.updateMonstersAI(time, dt);

    // 4. Check Portals Collision
    this.checkPortals();

    // 5. Input Triggers: Combat & Hotkeys
    this.handleCombatInputs(time);

    // 6. Handle Gathering Progress Bar
    if (this.gatheringProgress) {
      this.updateGathering(time);
    }

    // Update Player Position in gameState
    gameState.updatePlayerPosition(this.player.x, this.player.y);
  }

  private renderPlayerHpBar() {
    this.playerHpBar.clear();
    const profile = gameState.getProfile();
    const derived = gameState.getDerivedStats();
    const hpRatio = Math.max(0, Math.min(1, profile.currentHp / derived.maxHp));

    const w = 32;
    const h = 4;
    const bx = this.player.x - w / 2;
    const by = this.player.y - 16;

    // Background
    this.playerHpBar.fillStyle(0x1e293b, 0.8);
    this.playerHpBar.fillRect(bx, by, w, h);
    // Green HP
    this.playerHpBar.fillStyle(hpRatio > 0.3 ? 0x22c55e : 0xef4444, 1);
    this.playerHpBar.fillRect(bx, by, w * hpRatio, h);
  }

  // --- MONSTER AI & STATE MACHINE ---
  private updateMonstersAI(time: number, dt: number) {
    this.telegraphGraphics.clear();

    this.monsterSprites.forEach((entry, id) => {
      const { sprite, hpBar, text, data, template } = entry;
      if (data.state === 'dead') {
        hpBar.clear();
        text.setVisible(false);
        sprite.setVisible(false);
        return;
      }

      hpBar.clear();
      text.setVisible(true);
      sprite.setVisible(true);

      const distToPlayer = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.player.x, this.player.y);
      const distToSpawn = Phaser.Math.Distance.Between(sprite.x, sprite.y, data.spawnX, data.spawnY);

      // AI States: IDLE, CHASE, ATTACK, RETURN
      if (data.state === 'idle') {
        if (distToPlayer <= template.aggroRadius) {
          data.state = 'chase';
        } else {
          if (this.anims.exists(`${template.id}_idle`)) {
            if (!sprite.anims.isPlaying || sprite.anims.currentAnim?.key !== `${template.id}_idle`) {
              sprite.play(`${template.id}_idle`, true);
            }
          }
          // Wander slowly near spawn
          data.stateTimer += dt;
          if (data.stateTimer > 3) {
            data.stateTimer = 0;
            const wanderAngle = Math.random() * Math.PI * 2;
            const wanderDist = Math.random() * 25;
            const tx = data.spawnX + Math.cos(wanderAngle) * wanderDist;
            const ty = data.spawnY + Math.sin(wanderAngle) * wanderDist;
            this.physics.moveTo(sprite, tx, ty, template.moveSpeed * 0.4);
          }
        }
      } else if (data.state === 'chase') {
        if (distToSpawn > 350) {
          // Leashed, return to spawn
          data.state = 'return';
        } else if (distToPlayer <= template.attackRange) {
          sprite.setVelocity(0, 0);
          data.state = 'attack';
        } else {
          this.physics.moveToObject(sprite, this.player, template.moveSpeed);
          sprite.setFlipX(this.player.x < sprite.x);
          if (this.anims.exists(`${template.id}_walk`)) {
            if (!sprite.anims.isPlaying || sprite.anims.currentAnim?.key !== `${template.id}_walk`) {
              sprite.play(`${template.id}_walk`, true);
            }
          }
        }
      } else if (data.state === 'attack') {
        sprite.setVelocity(0, 0);
        if (distToPlayer > template.attackRange + 25) {
          data.state = 'chase';
        } else {
          // Execute attack on player
          if (time - data.lastAttackTime >= template.attackCooldown * 1000) {
            data.lastAttackTime = time;
            this.monsterAttackPlayer(entry, time);
          }
        }
      } else if (data.state === 'return') {
        if (distToSpawn <= 15) {
          sprite.setVelocity(0, 0);
          data.state = 'idle';
          data.hp = template.maxHp; // Reset HP when returned
        } else {
          this.physics.moveTo(sprite, data.spawnX, data.spawnY, template.moveSpeed * 1.2);
        }
      }

      // Boss Ground Smash / Ability Telegraph
      if (data.telegraphing && data.telegraphEnd) {
        const remaining = data.telegraphEnd - time;
        if (remaining > 0) {
          if (template.id === 'tide_lord') {
            // Tidal Surge: expanding aqua circle
            const radius = 120;
            this.telegraphGraphics.lineStyle(3, 0x06b6d4, 0.9);
            this.telegraphGraphics.fillStyle(0x0284c7, 0.35);
            this.telegraphGraphics.fillCircle(data.x, data.y, radius);
            this.telegraphGraphics.strokeCircle(data.x, data.y, radius);
          } else if (template.id === 'sand_king') {
            // Earth Tremor: massive desert golden shockwave
            const radius = 110;
            this.telegraphGraphics.lineStyle(3, 0xf59e0b, 0.9);
            this.telegraphGraphics.fillStyle(0xd97706, 0.35);
            this.telegraphGraphics.fillCircle(data.x, data.y, radius);
            this.telegraphGraphics.strokeCircle(data.x, data.y, radius);
          } else if (template.id === 'sky_guardian') {
            // Celestial Judgment: holy beam cross and radiant star circle
            const radius = 100;
            this.telegraphGraphics.lineStyle(3, 0xfef08a, 0.95);
            this.telegraphGraphics.fillStyle(0xfde047, 0.4);
            this.telegraphGraphics.fillCircle(data.x, data.y, radius);
            this.telegraphGraphics.strokeCircle(data.x, data.y, radius);
            this.telegraphGraphics.lineBetween(data.x - 140, data.y, data.x + 140, data.y);
            this.telegraphGraphics.lineBetween(data.x, data.y - 140, data.x, data.y + 140);
          } else {
            // Default Ancient Rootbeast smash
            const radius = 80;
            this.telegraphGraphics.lineStyle(2, 0xef4444, 0.8);
            this.telegraphGraphics.fillStyle(0xef4444, 0.25);
            this.telegraphGraphics.fillCircle(data.x, data.y, radius);
            this.telegraphGraphics.strokeCircle(data.x, data.y, radius);
          }
        } else {
          // Trigger Smash!
          data.telegraphing = false;
          data.telegraphEnd = undefined;
          this.executeBossSmash(entry);
        }
      }

      // Update monster positions in data
      data.x = sprite.x;
      data.y = sprite.y;

      // Update text and HP bar
      text.setPosition(sprite.x, sprite.y - (template.isBoss ? 44 : 22));

      // Draw Monster HP Bar
      const bw = template.isBoss ? 56 : 30;
      const bh = template.isBoss ? 5 : 3;
      const bx = sprite.x - bw / 2;
      const by = sprite.y - (template.isBoss ? 34 : 16);
      const ratio = Math.max(0, Math.min(1, data.hp / template.maxHp));

      hpBar.fillStyle(0x0f172a, 0.8);
      hpBar.fillRect(bx, by, bw, bh);
      hpBar.fillStyle(template.isBoss ? 0xf59e0b : 0xef4444, 1);
      hpBar.fillRect(bx, by, bw * ratio, bh);
    });

    // Update Target Reticle position if active
    if (this.selectedMonsterId) {
      if (this.selectedMonsterId === 'training_dummy') {
        this.updateTargetReticle(600, 600);
      } else {
        const entry = this.monsterSprites.get(this.selectedMonsterId);
        if (entry && entry.data.state !== 'dead') {
          this.updateTargetReticle(entry.sprite.x, entry.sprite.y);
        } else {
          this.clearTarget();
        }
      }
    }
  }

  private monsterAttackPlayer(entry: typeof this.monsterSprites extends Map<string, infer V> ? V : never, time: number) {
    const { template, data, sprite } = entry;

    if (this.anims.exists(`${template.id}_attack`)) {
      sprite.play(`${template.id}_attack`);
    }

    if (template.telegraphAttack) {
      // Begin 1.2s telegraph for boss smash
      data.telegraphing = true;
      data.telegraphEnd = time + 1200;
      return;
    }

    const profile = gameState.getProfile();
    const derived = gameState.getDerivedStats();

    // Check hit/flee
    const isHit = rollHitChance(template.level + 45, derived.flee);
    if (!isHit) {
      gameState.addFloatingText('MISS', this.player.x, this.player.y - 20, '#94a3b8');
      return;
    }

    const damage = calculatePhysicalDamage(template.atk, derived.def, 1.0);
    profile.currentHp = Math.max(0, profile.currentHp - damage);

    gameState.addFloatingText(`-${damage}`, this.player.x, this.player.y - 25, '#ef4444');
    soundEffects.playHitPlayer();
    this.cameras.main.shake(120, 0.005);

    gameState.recomputeStats();

    if (profile.currentHp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private executeBossSmash(entry: typeof this.monsterSprites extends Map<string, infer V> ? V : never) {
    const { template, sprite } = entry;
    soundEffects.playCritHit();
    this.cameras.main.shake(300, 0.02);

    const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.player.x, this.player.y);
    const radius = template.id === 'tide_lord' ? 120 : template.id === 'sand_king' ? 110 : template.id === 'sky_guardian' ? 100 : 80;

    if (dist <= radius) {
      const profile = gameState.getProfile();
      const derived = gameState.getDerivedStats();

      let damage = 0;
      let label = 'CRUSH!';
      let color = '#ef4444';

      if (template.id === 'tide_lord') {
        damage = calculateMagicDamage(template.atk * 1.7, derived.mdef, 1.0);
        label = 'TIDAL SURGE!';
        color = '#38bdf8';
        this.cameras.main.flash(200, 6, 182, 212);
      } else if (template.id === 'sand_king') {
        damage = calculatePhysicalDamage(template.atk * 1.9, derived.def, 1.0, true);
        label = 'EARTH TREMOR!';
        color = '#f59e0b';
      } else if (template.id === 'sky_guardian') {
        damage = calculateMagicDamage(template.atk * 2.0, derived.mdef, 1.0);
        label = 'CELESTIAL SMITE!';
        color = '#fde047';
        this.cameras.main.flash(250, 253, 224, 71);
      } else {
        damage = calculatePhysicalDamage(template.atk * 1.8, derived.def, 1.0, true);
        label = 'ROOT SLAM!';
      }

      profile.currentHp = Math.max(0, profile.currentHp - damage);
      gameState.addFloatingText(`-${damage} ${label}`, this.player.x, this.player.y - 30, color, true);
      soundEffects.playHitPlayer();
      gameState.recomputeStats();

      if (profile.currentHp <= 0) {
        this.handlePlayerDeath();
      }
    }
  }

  // --- PLAYER COMBAT & SKILLS ---
  private handleCombatInputs(time: number) {
    // Attack (Space)
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.executeBasicAttack(time);
    }

    // Skills 1-4
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.executeSkill(0, time);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.executeSkill(1, time);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.executeSkill(2, time);
    if (Phaser.Input.Keyboard.JustDown(this.keys.FOUR)) this.executeSkill(3, time);

    // Potions Q (Red) / E (Blue)
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) gameState.useConsumable('red_potion');

    // Interact / Loot (F or E)
    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      this.handleInteractOrLoot();
    }

    // TAB targeting to cycle nearest monster
    if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
      this.selectNearestMonster();
    }
  }

  public executeBasicAttack(time: number) {
    const derived = gameState.getDerivedStats();
    const attackDelay = 1000 / derived.aspd;
    if (time - this.lastAttackTime < attackDelay) return;

    this.lastAttackTime = time;
    this.player.setFrame(3); // Slash frame
    this.time.delayedCall(120, () => this.player.setFrame(0));

    soundEffects.playAttackMelee();

    if (!this.selectedMonsterId) {
      // Find nearest monster within range
      this.selectNearestMonster(75);
    }

    if (!this.selectedMonsterId) return;

    if (this.selectedMonsterId === 'training_dummy') {
      // Hit training dummy
      const isCrit = Math.random() * 100 < derived.critRate;
      const damage = calculatePhysicalDamage(derived.atk, 0, 1.0, isCrit, derived.critDmg);
      gameState.addFloatingText(`${damage}${isCrit ? ' CRIT!' : ''}`, 600, 570, isCrit ? '#f59e0b' : '#f8fafc', isCrit);
      soundEffects.playHitMonster();
      return;
    }

    const entry = this.monsterSprites.get(this.selectedMonsterId);
    if (!entry || entry.data.state === 'dead') return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y);
    if (dist > 75) {
      gameState.addSystemMessage('Target is out of attack range.');
      return;
    }

    // Check hit/flee
    const isHit = rollHitChance(derived.hit, entry.template.level + 20);
    if (!isHit) {
      gameState.addFloatingText('MISS', entry.sprite.x, entry.sprite.y - 20, '#94a3b8');
      return;
    }

    const isCrit = Math.random() * 100 < derived.critRate;
    const damage = calculatePhysicalDamage(derived.atk, entry.template.def, 1.0, isCrit, derived.critDmg);
    this.applyMonsterDamage(entry, damage, isCrit);
  }

  public executeSkill(slotIdx: number, time: number) {
    const profile = gameState.getProfile();
    const skillId = profile.hotbar[slotIdx];
    if (!skillId) return;

    const skillDef = SKILL_CATALOG[skillId];
    if (!skillDef) return;

    // Check MP
    if (profile.currentMp < skillDef.mpCost) {
      gameState.addSystemMessage(`Not enough MP for ${skillDef.name}!`);
      return;
    }

    // Check Cooldown
    const lastUsed = this.skillCooldowns[skillId] || 0;
    if (time - lastUsed < skillDef.cooldown * 1000) {
      const remainingSec = Math.ceil((skillDef.cooldown * 1000 - (time - lastUsed)) / 1000);
      gameState.addSystemMessage(`${skillDef.name} is on cooldown (${remainingSec}s).`);
      return;
    }

    // Heal skill
    if (skillDef.isHeal) {
      this.skillCooldowns[skillId] = time;
      profile.currentMp -= skillDef.mpCost;
      const healAmount = Math.round(gameState.getDerivedStats().maxHp * ((skillDef.healPercent || 25) / 100) + profile.baseStats.int * 4);
      profile.currentHp = Math.min(gameState.getDerivedStats().maxHp, profile.currentHp + healAmount);
      gameState.addFloatingText(`+${healAmount} HEAL`, this.player.x, this.player.y - 30, '#22c55e', false, false, true);
      soundEffects.playHeal();
      gameState.recomputeStats();
      return;
    }

    // Offensive skill
    if (!this.selectedMonsterId) {
      this.selectNearestMonster(skillDef.range || 120);
    }
    if (!this.selectedMonsterId) {
      gameState.addSystemMessage('Select a target first.');
      return;
    }

    if (this.selectedMonsterId === 'training_dummy') {
      this.skillCooldowns[skillId] = time;
      profile.currentMp -= skillDef.mpCost;
      gameState.recomputeStats();

      const derived = gameState.getDerivedStats();
      const dmg = skillDef.isMagic 
        ? calculateMagicDamage(derived.matk, 0, skillDef.damageMult)
        : calculatePhysicalDamage(derived.atk, 0, skillDef.damageMult, true);

      gameState.addFloatingText(`${dmg} ${skillDef.name}!`, 600, 560, '#f59e0b', true);
      soundEffects.playCritHit();
      return;
    }

    const entry = this.monsterSprites.get(this.selectedMonsterId);
    if (!entry || entry.data.state === 'dead') return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y);
    if (dist > skillDef.range) {
      gameState.addSystemMessage('Target is out of skill range.');
      return;
    }

    this.skillCooldowns[skillId] = time;
    profile.currentMp -= skillDef.mpCost;
    gameState.recomputeStats();

    const derived = gameState.getDerivedStats();
    let dmg = 0;
    if (skillDef.isMagic) {
      dmg = calculateMagicDamage(derived.matk, entry.template.mdef, skillDef.damageMult);
      soundEffects.playMagicSpell();
    } else {
      dmg = calculatePhysicalDamage(derived.atk, entry.template.def, skillDef.damageMult, true);
      soundEffects.playCritHit();
    }

    this.applyMonsterDamage(entry, dmg, true);
  }

  private applyMonsterDamage(entry: typeof this.monsterSprites extends Map<string, infer V> ? V : never, damage: number, isCrit: boolean) {
    const { sprite, data, template } = entry;
    data.hp = Math.max(0, data.hp - damage);

    // Make monster aggro onto player if attacked
    data.state = 'chase';

    if (this.anims.exists(`${template.id}_hit`)) {
      sprite.play(`${template.id}_hit`);
    }

    gameState.addFloatingText(
      `${damage}${isCrit ? '!' : ''}`,
      sprite.x,
      sprite.y - 25,
      isCrit ? '#f59e0b' : '#f8fafc',
      isCrit
    );

    if (isCrit) {
      soundEffects.playCritHit();
      this.cameras.main.shake(100, 0.006);
    } else {
      soundEffects.playHitMonster();
    }

    if (data.hp <= 0) {
      this.handleMonsterDeath(entry);
    }
  }

  private handleMonsterDeath(entry: typeof this.monsterSprites extends Map<string, infer V> ? V : never) {
    const { sprite, data, template } = entry;
    data.state = 'dead';
    sprite.setVelocity(0, 0);

    if (this.anims.exists(`${template.id}_die`)) {
      sprite.play(`${template.id}_die`);
    }

    soundEffects.playMonsterDeath();
    gameState.addExp(template.expReward);
    gameState.addGold(template.goldReward);

    // Update quest progress
    gameState.onMonsterKilled(template.id);

    // Authoritative loot roll
    template.drops.forEach((drop) => {
      if (Math.random() <= drop.chance) {
        const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
        gameState.spawnGroundDrop(drop.itemId, qty, sprite.x, sprite.y);
      }
    });

    if (this.selectedMonsterId === data.instanceId) {
      this.clearTarget();
    }

    // Respawn monster after cooldown
    const spawnConfig = MAPS[this.currentMapId].monsters.find((m) => m.templateId === template.id);
    const respawnTime = (spawnConfig?.respawnSeconds || 8) * 1000;

    this.time.delayedCall(respawnTime, () => {
      data.hp = template.maxHp;
      data.state = 'idle';
      sprite.setPosition(data.spawnX, data.spawnY);
      if (this.anims.exists(`${template.id}_idle`)) {
        sprite.play(`${template.id}_idle`);
      }
    });
  }

  private handlePlayerDeath() {
    soundEffects.playHitPlayer();
    gameState.addSystemMessage('You have collapsed! Returning safely to Dawnshire Village square...');

    const profile = gameState.getProfile();
    profile.currentHp = Math.round(gameState.getDerivedStats().maxHp * 0.5);
    profile.currentMp = Math.round(gameState.getDerivedStats().maxMp * 0.5);

    // Teleport back to Dawnshire
    this.switchMap('dawnshire', 520, 450);
  }

  // --- TARGET SELECTION ---
  public selectMonster(id: string) {
    this.selectedMonsterId = id;
    const entry = this.monsterSprites.get(id);
    if (entry && this.onTargetChange) {
      this.onTargetChange(entry.data, entry.template);
      this.updateTargetReticle(entry.sprite.x, entry.sprite.y);
    }
  }

  public selectNearestMonster(maxRadius: number = 240) {
    let nearestId: string | null = null;
    let minDistance = maxRadius;

    this.monsterSprites.forEach((entry, id) => {
      if (entry.data.state === 'dead') return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearestId = id;
      }
    });

    if (nearestId) {
      this.selectMonster(nearestId);
    }
  }

  public clearTarget() {
    this.selectedMonsterId = null;
    if (this.targetReticle) this.targetReticle.setVisible(false);
    if (this.onTargetChange) this.onTargetChange(null, null);
  }

  private updateTargetReticle(x: number, y: number) {
    if (this.targetReticle) {
      this.targetReticle.setPosition(x, y).setVisible(true);
    }
  }

  // --- GATHERING & LOOTING ---
  private handleInteractOrLoot() {
    // 1. Check nearby ground drops (within 60px)
    const drops = gameState.getGroundDrops();
    for (const drop of drops) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, drop.x, drop.y);
      if (dist <= 65) {
        gameState.pickupDrop(drop.id);
        return;
      }
    }

    // 2. Check nearby NPCs (within 70px)
    const mapData = MAPS[this.currentMapId];
    for (const npc of mapData.npcs) {
      if (npc.id === 'npc_training_dummy') continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist <= 75) {
        this.triggerNpcInteraction(npc.id);
        return;
      }
    }

    // 3. Check nearby gatherables (within 65px)
    for (const [, entry] of this.gatherableSprites) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.node.x, entry.node.y);
      if (dist <= 65 && entry.sprite.visible) {
        this.tryGatherNode(entry.node);
        return;
      }
    }
  }

  private tryGatherNode(node: typeof MAPS.verdant_fields.gatherables[0]) {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
    if (dist > 75) {
      gameState.addSystemMessage('Move closer to gather.');
      return;
    }

    soundEffects.playItemPickup();
    this.gatheringProgress = {
      nodeId: node.id,
      startTime: this.time.now,
      duration: 1500, // 1.5s gathering channel
    };
  }

  private updateGathering(time: number) {
    if (!this.gatheringProgress) return;
    const elapsed = time - this.gatheringProgress.startTime;
    const progress = Math.min(1, elapsed / this.gatheringProgress.duration);

    // Draw gathering progress bar over player head
    this.gatheringBar.clear();
    const bx = this.player.x - 24;
    const by = this.player.y - 38;
    this.gatheringBar.fillStyle(0x0f172a, 0.85);
    this.gatheringBar.fillRect(bx, by, 48, 6);
    this.gatheringBar.fillStyle(0x38bdf8, 1);
    this.gatheringBar.fillRect(bx, by, 48 * progress, 6);

    if (progress >= 1) {
      const entry = this.gatherableSprites.get(this.gatheringProgress.nodeId);
      if (entry) {
        gameState.addItem(entry.node.itemId, 1);
        soundEffects.playItemPickup();
        gameState.addFloatingText(`+1 ${entry.node.name}`, this.player.x, this.player.y - 25, '#34d399');
        entry.sprite.setVisible(false);
        this.time.delayedCall(entry.node.respawnTime * 1000, () => {
          entry.sprite.setVisible(true);
        });
      }
      this.gatheringProgress = null;
      this.gatheringBar.clear();
    }
  }

  private syncGroundDrops(drops: typeof gameState.getGroundDrops extends () => (infer T)[] ? T[] : never) {
    // Remove drops that were picked up
    const currentIds = new Set(drops.map((d) => d.id));
    this.groundDropSprites.forEach((val, id) => {
      if (!currentIds.has(id)) {
        val.sprite.destroy();
        val.text.destroy();
        val.aura.destroy();
        this.groundDropSprites.delete(id);
      }
    });

    // Add new drops
    drops.forEach((drop) => {
      if (!this.groundDropSprites.has(drop.id)) {
        const sprite = this.add.sprite(drop.x, drop.y, 'ground_drop').setDepth(6);
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => gameState.pickupDrop(drop.id));

        const aura = this.add.graphics().setDepth(5);
        aura.fillStyle(drop.rarity === 'epic' ? 0xc084fc : drop.rarity === 'rare' ? 0x60a5fa : 0xfde047, 0.35);
        aura.fillCircle(drop.x, drop.y, 10);

        const text = this.add.text(drop.x, drop.y - 14, `[${drop.quantity}] Item`, {
          fontSize: '9px',
          color: '#fef08a',
          fontFamily: 'Plus Jakarta Sans',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: { x: 2, y: 1 },
        }).setOrigin(0.5).setDepth(15);

        this.groundDropSprites.set(drop.id, { sprite, text, aura });
      }
    });
  }

  private checkPortals() {
    const mapData = MAPS[this.currentMapId];
    for (const p of mapData.portals) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (dist <= p.radius) {
        if (p.levelReq && gameState.getProfile().level < p.levelReq) {
          gameState.addSystemMessage(`Level Requirement: You must be Level ${p.levelReq}+ to enter this area!`);
          const angle = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y);
          this.player.x += Math.cos(angle) * 16;
          this.player.y += Math.sin(angle) * 16;
          break;
        }
        this.switchMap(p.targetMap, p.targetX, p.targetY);
        break;
      }
    }
  }

  public switchMap(targetMap: MapId, spawnX: number, spawnY: number) {
    soundEffects.playPortal();
    this.currentMapId = targetMap;
    gameState.getProfile().currentMap = targetMap;
    gameState.getProfile().x = spawnX;
    gameState.getProfile().y = spawnY;
    gameState.save();

    // Restart the scene with new map
    this.scene.restart();
  }

  private triggerNpcInteraction(npcId: string) {
    this.selectedNpcId = npcId;
    if (this.onNpcInteract) {
      this.onNpcInteract(npcId);
    }
  }

  private handlePassiveRegen() {
    const profile = gameState.getProfile();
    const derived = gameState.getDerivedStats();
    if (profile.currentHp < derived.maxHp) {
      const hpRegen = Math.max(1, Math.floor(derived.maxHp * 0.04 + profile.baseStats.vit * 0.5));
      profile.currentHp = Math.min(derived.maxHp, profile.currentHp + hpRegen);
    }
    if (profile.currentMp < derived.maxMp) {
      const mpRegen = Math.max(1, Math.floor(derived.maxMp * 0.05 + profile.baseStats.int * 0.6));
      profile.currentMp = Math.min(derived.maxMp, profile.currentMp + mpRegen);
    }
    gameState.recomputeStats();
  }

  private updateFloatingTexts() {
    // Floating texts handled via React HUD overlay for pixel crispness
  }
}
