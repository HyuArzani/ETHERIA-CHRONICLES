/**
 * Etheria Chronicles - Asset Pipeline & Sprite Sheet Generator
 * Generates genuine 32-bit transparent pixel-art PNG sprite sheets and tilesets
 * for Sunken Ruins monsters and the Tide Lord boss according to master RPG specs.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// --- CRC32 & PNG ENCODER ---
function createCRC32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBody = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcBody);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

export function encodePNG(width: number, height: number, rgbaData: Uint8Array): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineWidth = width * 4;
  const rawData = Buffer.alloc(height * (1 + scanlineWidth));
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + scanlineWidth);
    rawData[rawOffset] = 0; // Filter: None
    const srcOffset = y * scanlineWidth;
    for (let x = 0; x < scanlineWidth; x++) {
      rawData[rawOffset + 1 + x] = rgbaData[srcOffset + x];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// --- PIXEL BUFFER CANVAS ABSTRACTION ---
export class PixelCanvas {
  public width: number;
  public height: number;
  public data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4); // all transparent zeros
  }

  public setPixel(x: number, y: number, r: number, g: number, b: number, a: number = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 4;

    if (a >= 255) {
      this.data[idx] = r;
      this.data[idx + 1] = g;
      this.data[idx + 2] = b;
      this.data[idx + 3] = 255;
    } else if (a > 0) {
      // Alpha blending
      const prevA = this.data[idx + 3] / 255;
      const alpha = a / 255;
      const outA = alpha + prevA * (1 - alpha);
      if (outA > 0) {
        this.data[idx] = Math.round((r * alpha + this.data[idx] * prevA * (1 - alpha)) / outA);
        this.data[idx + 1] = Math.round((g * alpha + this.data[idx + 1] * prevA * (1 - alpha)) / outA);
        this.data[idx + 2] = Math.round((b * alpha + this.data[idx + 2] * prevA * (1 - alpha)) / outA);
        this.data[idx + 3] = Math.round(outA * 255);
      }
    }
  }

  public fillRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 255) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let cy = y; cy < y + h; cy++) {
      for (let cx = x; cx < x + w; cx++) {
        this.setPixel(cx, cy, r, g, b, a);
      }
    }
  }

  public strokeRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 255) {
    this.fillRect(x, y, w, 1, r, g, b, a);
    this.fillRect(x, y + h - 1, w, 1, r, g, b, a);
    this.fillRect(x, y, 1, h, r, g, b, a);
    this.fillRect(x + w - 1, y, 1, h, r, g, b, a);
  }

  public fillCircle(cx: number, cy: number, radius: number, r: number, g: number, b: number, a: number = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    const r2 = radius * radius;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= r2) {
          this.setPixel(cx + x, cy + y, r, g, b, a);
        }
      }
    }
  }

  public fillEllipse(cx: number, cy: number, rx: number, ry: number, r: number, g: number, b: number, a: number = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.0) {
          this.setPixel(cx + x, cy + y, r, g, b, a);
        }
      }
    }
  }

  public toPNG(): Buffer {
    return encodePNG(this.width, this.height, this.data);
  }
}

// --- MONSTER SPRITE SHEET RENDERERS ---

// Helper to draw shadow under monster feet
function drawShadow(c: PixelCanvas, x: number, y: number, rx: number, ry: number = 4) {
  c.fillEllipse(x, y, rx, ry, 0, 0, 0, 75);
}

/**
 * 1. AQUA SLIME SPRITE SHEET (384 x 256: 6 cols x 4 rows of 64x64 frames)
 * Row 0: Idle (4 frames, cols 0..3)
 * Row 1: Move (6 frames, cols 0..5)
 * Row 2: Attack (4 frames, cols 0..3)
 * Row 3: Hit (2 frames) & Death (4 frames) (cols 0..5)
 */
function generateAquaSlimeSheet(): Buffer {
  const c = new PixelCanvas(384, 256);
  const FW = 64;
  const FH = 64;

  // Helper for drawing 1 slime frame
  function drawSlime(col: number, row: number, squishX: number, squishY: number, yOff: number, state: 'idle' | 'move' | 'atk' | 'hit' | 'die', frameIdx: number) {
    const ox = col * FW + 32;
    const oy = row * FH + 44 + yOff;

    if (state === 'die') {
      const dissolve = frameIdx; // 0..3
      const rad = Math.max(3, 16 - dissolve * 3);
      drawShadow(c, ox, oy + 4, rad + 4, 3);
      c.fillEllipse(ox, oy + 2, rad + 4, Math.max(2, 6 - dissolve), 6, 182, 212, 220 - dissolve * 45);
      // Dissolving air bubbles
      if (dissolve > 0) {
        c.fillCircle(ox - 6 - dissolve * 2, oy - dissolve * 8, 2, 103, 232, 249, 200);
        c.fillCircle(ox + 8 + dissolve * 3, oy - dissolve * 12, 3, 165, 243, 252, 180);
      }
      return;
    }

    // Shadow
    drawShadow(c, ox, oy + 10, 14 + squishX, 4);

    const baseColor = state === 'hit' ? [239, 68, 68] : [6, 182, 212];
    const highlight = state === 'hit' ? [254, 202, 202] : [103, 232, 249];
    const rimColor = state === 'hit' ? [185, 28, 28] : [8, 51, 68];

    // Main jelly body
    const rx = 16 + squishX;
    const ry = 14 + squishY;
    c.fillEllipse(ox, oy, rx, ry, baseColor[0], baseColor[1], baseColor[2], 240);

    // Dark bottom rim
    c.fillEllipse(ox, oy + ry - 4, rx - 2, 4, rimColor[0], rimColor[1], rimColor[2], 180);

    // Crest water fin/droplet
    c.fillCircle(ox, oy - ry, 4 + Math.round(squishY * 0.5), highlight[0], highlight[1], highlight[2], 255);

    // Glistening bubble highlight
    c.fillEllipse(ox - 5, oy - 5, 5, 4, highlight[0], highlight[1], highlight[2], 220);
    c.fillCircle(ox - 6, oy - 6, 2, 255, 255, 255, 250);

    // Eyes
    if (state === 'hit') {
      // X X eyes
      c.fillRect(ox - 6, oy - 2, 3, 1, 255, 255, 255, 255);
      c.fillRect(ox + 3, oy - 2, 3, 1, 255, 255, 255, 255);
    } else {
      // Cute blinking / looking eyes
      const eyeH = (state === 'idle' && frameIdx === 2) ? 1 : 3;
      c.fillRect(ox - 6, oy - 2, 2, eyeH, 8, 51, 68, 255);
      c.fillRect(ox + 4, oy - 2, 2, eyeH, 8, 51, 68, 255);
      if (eyeH > 1) {
        c.setPixel(ox - 6, oy - 2, 255, 255, 255, 255);
        c.setPixel(ox + 4, oy - 2, 255, 255, 255, 255);
      }
    }

    // Water projectile for attack
    if (state === 'atk' && frameIdx >= 2) {
      const projX = ox + (frameIdx - 1) * 12;
      const projY = oy - 2;
      c.fillCircle(projX, projY, 5, 34, 211, 238, 230);
      c.fillCircle(projX, projY, 2, 255, 255, 255, 255);
    }
  }

  // Row 0: Idle (4 frames)
  drawSlime(0, 0, 0, 0, 0, 'idle', 0);
  drawSlime(1, 0, 1, -1, 1, 'idle', 1);
  drawSlime(2, 0, 0, 0, 0, 'idle', 2); // blink
  drawSlime(3, 0, -1, 1, -1, 'idle', 3);

  // Row 1: Move (6 frames)
  drawSlime(0, 1, 2, -2, 2, 'move', 0);
  drawSlime(1, 1, -2, 3, -4, 'move', 1);
  drawSlime(2, 1, -3, 4, -8, 'move', 2);
  drawSlime(3, 1, 0, 1, -3, 'move', 3);
  drawSlime(4, 1, 3, -3, 3, 'move', 4);
  drawSlime(5, 1, 0, 0, 0, 'move', 5);

  // Row 2: Attack (4 frames)
  drawSlime(0, 2, -3, 2, -1, 'atk', 0); // windup
  drawSlime(1, 2, -4, 4, -3, 'atk', 1);
  drawSlime(2, 2, 4, -2, 2, 'atk', 2); // fire
  drawSlime(3, 2, 2, -1, 1, 'atk', 3);

  // Row 3: Hit (2 frames) & Death (4 frames)
  drawSlime(0, 3, 2, -2, 0, 'hit', 0);
  drawSlime(1, 3, 3, -3, 1, 'hit', 1);
  drawSlime(2, 3, 0, 0, 0, 'die', 0);
  drawSlime(3, 3, 0, 0, 0, 'die', 1);
  drawSlime(4, 3, 0, 0, 0, 'die', 2);
  drawSlime(5, 3, 0, 0, 0, 'die', 3);

  return c.toPNG();
}

/**
 * 2. REEF CRAB SPRITE SHEET (384 x 256: 6 cols x 4 rows of 64x64 frames)
 */
function generateReefCrabSheet(): Buffer {
  const c = new PixelCanvas(384, 256);
  const FW = 64;
  const FH = 64;

  function drawCrab(col: number, row: number, legPhase: number, pincerOpen: boolean, yOff: number, state: 'idle' | 'move' | 'atk' | 'hit' | 'die', frameIdx: number) {
    const ox = col * FW + 32;
    const oy = row * FH + 44 + yOff;

    if (state === 'die') {
      const dissolve = frameIdx;
      drawShadow(c, ox, oy + 8, Math.max(4, 18 - dissolve * 4), 4);
      // Broken shell pieces
      c.fillEllipse(ox, oy + 4, Math.max(3, 14 - dissolve * 3), Math.max(2, 8 - dissolve * 2), 185, 28, 28, 255 - dissolve * 50);
      c.fillRect(ox - 14, oy + 6, 6, 4, 239, 68, 68, 240 - dissolve * 55);
      c.fillRect(ox + 8, oy + 4, 5, 4, 239, 68, 68, 240 - dissolve * 55);
      return;
    }

    drawShadow(c, ox, oy + 10, 18, 5);

    const bodyCol = state === 'hit' ? [254, 202, 202] : [239, 68, 68];
    const shellDark = state === 'hit' ? [239, 68, 68] : [185, 28, 28];
    const pincerCol = state === 'hit' ? [252, 165, 165] : [248, 113, 113];

    // 6 Scuttling articulated legs
    const legY = oy + 6;
    for (let i = -1; i <= 1; i++) {
      const lOff = Math.sin(legPhase + i) * 3;
      // Left legs
      c.fillRect(ox - 16, legY + i * 4, -6, 2, shellDark[0], shellDark[1], shellDark[2]);
      c.fillRect(ox - 22, legY + i * 4 + 2 + Math.round(lOff), 2, 5, shellDark[0], shellDark[1], shellDark[2]);
      // Right legs
      c.fillRect(ox + 16, legY + i * 4, 6, 2, shellDark[0], shellDark[1], shellDark[2]);
      c.fillRect(ox + 20, legY + i * 4 + 2 - Math.round(lOff), 2, 5, shellDark[0], shellDark[1], shellDark[2]);
    }

    // Carapace body
    c.fillEllipse(ox, oy, 15, 10, bodyCol[0], bodyCol[1], bodyCol[2]);
    c.fillRect(ox - 10, oy - 2, 20, 3, shellDark[0], shellDark[1], shellDark[2]);
    // Barnacle dots on shell
    c.fillRect(ox - 5, oy - 6, 3, 3, 203, 213, 225);
    c.fillRect(ox + 4, oy - 4, 2, 2, 203, 213, 225);

    // Stalk eyes
    c.fillRect(ox - 6, oy - 14, 2, 6, shellDark[0], shellDark[1], shellDark[2]);
    c.fillRect(ox + 4, oy - 14, 2, 6, shellDark[0], shellDark[1], shellDark[2]);
    c.fillCircle(ox - 5, oy - 14, 3, 15, 23, 42);
    c.fillCircle(ox + 5, oy - 14, 3, 15, 23, 42);
    c.setPixel(ox - 6, oy - 15, 255, 255, 255);
    c.setPixel(ox + 4, oy - 15, 255, 255, 255);

    // Giant Pincer Claws
    const clawW = state === 'atk' ? 10 : 7;
    const clawSpread = pincerOpen ? 4 : 1;

    // Left claw
    c.fillRect(ox - 24, oy - 8, clawW, 8, pincerCol[0], pincerCol[1], pincerCol[2]);
    c.fillRect(ox - 26, oy - 10 - clawSpread, 5, 4, pincerCol[0], pincerCol[1], pincerCol[2]);
    c.fillRect(ox - 26, oy - 4 + clawSpread, 5, 4, pincerCol[0], pincerCol[1], pincerCol[2]);

    // Right claw (Main weapon claw)
    c.fillRect(ox + 16, oy - 8, clawW, 8, pincerCol[0], pincerCol[1], pincerCol[2]);
    c.fillRect(ox + 20, oy - 10 - clawSpread, 5, 4, pincerCol[0], pincerCol[1], pincerCol[2]);
    c.fillRect(ox + 20, oy - 4 + clawSpread, 5, 4, pincerCol[0], pincerCol[1], pincerCol[2]);

    // Snapping spark on attack
    if (state === 'atk' && frameIdx >= 2) {
      c.fillCircle(ox + 26, oy - 6, 4, 251, 191, 36);
      c.setPixel(ox + 26, oy - 6, 255, 255, 255);
    }
  }

  // Row 0: Idle (4 frames)
  drawCrab(0, 0, 0, false, 0, 'idle', 0);
  drawCrab(1, 0, 0.5, true, 1, 'idle', 1);
  drawCrab(2, 0, 1.0, false, 0, 'idle', 2);
  drawCrab(3, 0, 1.5, true, -1, 'idle', 3);

  // Row 1: Move (6 frames)
  for (let i = 0; i < 6; i++) {
    drawCrab(i, 1, (i * Math.PI) / 3, i % 2 === 0, (i % 2) * -1, 'move', i);
  }

  // Row 2: Attack (4 frames)
  drawCrab(0, 2, 0, true, -2, 'atk', 0);
  drawCrab(1, 2, 0, true, -4, 'atk', 1);
  drawCrab(2, 2, 0, false, 2, 'atk', 2); // Snap!
  drawCrab(3, 2, 0, false, 1, 'atk', 3);

  // Row 3: Hit & Death
  drawCrab(0, 3, 0, true, -3, 'hit', 0);
  drawCrab(1, 3, 0, false, 1, 'hit', 1);
  drawCrab(2, 3, 0, false, 0, 'die', 0);
  drawCrab(3, 3, 0, false, 1, 'die', 1);
  drawCrab(4, 3, 0, false, 2, 'die', 2);
  drawCrab(5, 3, 0, false, 3, 'die', 3);

  return c.toPNG();
}

/**
 * 3. DROWNED WARRIOR SPRITE SHEET (384 x 256: 6 cols x 4 rows of 64x64 frames)
 */
function generateDrownedWarriorSheet(): Buffer {
  const c = new PixelCanvas(384, 256);
  const FW = 64;
  const FH = 64;

  function drawWarrior(col: number, row: number, walkCycle: number, swordAngle: number, yOff: number, state: 'idle' | 'move' | 'atk' | 'hit' | 'die', frameIdx: number) {
    const ox = col * FW + 32;
    const oy = row * FH + 38 + yOff;

    if (state === 'die') {
      const d = frameIdx;
      drawShadow(c, ox, oy + 20, Math.max(4, 16 - d * 3), 4);
      c.fillEllipse(ox, oy + 12 + d * 2, 10, 6, 5, 150, 105, 255 - d * 55);
      c.fillRect(ox + 8, oy + 16, 12, 3, 56, 189, 248, 255 - d * 55);
      return;
    }

    drawShadow(c, ox, oy + 22, 14, 4);

    const skinCol = state === 'hit' ? [254, 202, 202] : [5, 150, 105];
    const armorCol = state === 'hit' ? [239, 68, 68] : [6, 95, 70];
    const swordBlade = [56, 189, 248];

    // Legs with walk swing
    const lOff = Math.sin(walkCycle) * 4;
    c.fillRect(ox - 6 + lOff, oy + 12, 4, 10, armorCol[0], armorCol[1], armorCol[2]);
    c.fillRect(ox + 2 - lOff, oy + 12, 4, 10, armorCol[0], armorCol[1], armorCol[2]);

    // Torso / Barnacled chainmail
    c.fillRect(ox - 8, oy, 16, 13, armorCol[0], armorCol[1], armorCol[2]);
    c.fillRect(ox - 6, oy + 2, 12, 9, 4, 120, 87);
    // Barnacles
    c.fillRect(ox - 4, oy + 3, 2, 2, 226, 232, 240);
    c.fillRect(ox + 2, oy + 6, 2, 2, 226, 232, 240);

    // Tattered sea kelp cape waving behind
    c.fillRect(ox - 12, oy + 2, 4, 14, 4, 120, 87, 190);

    // Head
    c.fillRect(ox - 6, oy - 12, 12, 11, skinCol[0], skinCol[1], skinCol[2]);
    // Rusted helmet
    c.fillRect(ox - 7, oy - 15, 14, 5, 51, 65, 85);
    c.fillRect(ox - 2, oy - 11, 4, 6, 51, 65, 85);

    // Glowing ghostly eyes
    c.fillRect(ox - 4, oy - 8, 2, 2, 110, 231, 183);
    c.fillRect(ox + 2, oy - 8, 2, 2, 110, 231, 183);

    // Rusted Ocean Cutlass
    if (state === 'atk') {
      // Swing arc
      if (frameIdx === 0) {
        c.fillRect(ox + 6, oy - 18, 4, 18, swordBlade[0], swordBlade[1], swordBlade[2]);
      } else if (frameIdx === 1) {
        c.fillRect(ox + 4, oy - 22, 6, 18, swordBlade[0], swordBlade[1], swordBlade[2]);
      } else if (frameIdx === 2) {
        // Full downward slash arc
        c.fillRect(ox + 10, oy, 18, 4, swordBlade[0], swordBlade[1], swordBlade[2]);
        c.fillCircle(ox + 22, oy, 6, 56, 189, 248, 160);
      } else {
        c.fillRect(ox + 10, oy + 6, 14, 4, swordBlade[0], swordBlade[1], swordBlade[2]);
      }
    } else {
      // Normal blade pose
      c.fillRect(ox + 8, oy - 4, 3, 14, swordBlade[0], swordBlade[1], swordBlade[2]);
      c.fillRect(ox + 6, oy + 8, 7, 2, 180, 83, 9); // Guard
      c.fillRect(ox + 8, oy + 10, 3, 3, 69, 26, 3); // Hilt
    }
  }

  // Row 0: Idle (4 frames)
  drawWarrior(0, 0, 0, 0, 0, 'idle', 0);
  drawWarrior(1, 0, 0, 0, 1, 'idle', 1);
  drawWarrior(2, 0, 0, 0, 0, 'idle', 2);
  drawWarrior(3, 0, 0, 0, -1, 'idle', 3);

  // Row 1: Move (6 frames)
  for (let i = 0; i < 6; i++) {
    drawWarrior(i, 1, (i * Math.PI) / 3, 0, (i % 2) * -1, 'move', i);
  }

  // Row 2: Attack (4 frames)
  drawWarrior(0, 2, 0, 0, -2, 'atk', 0);
  drawWarrior(1, 2, 0, 0, -4, 'atk', 1);
  drawWarrior(2, 2, 0, 0, 2, 'atk', 2);
  drawWarrior(3, 2, 0, 0, 0, 'atk', 3);

  // Row 3: Hit & Death
  drawWarrior(0, 3, 0, 0, -3, 'hit', 0);
  drawWarrior(1, 3, 0, 0, 0, 'hit', 1);
  drawWarrior(2, 3, 0, 0, 0, 'die', 0);
  drawWarrior(3, 3, 0, 0, 1, 'die', 1);
  drawWarrior(4, 3, 0, 0, 2, 'die', 2);
  drawWarrior(5, 3, 0, 0, 3, 'die', 3);

  return c.toPNG();
}

/**
 * 4. SEA SERPENT SPRITE SHEET (384 x 256: 6 cols x 4 rows of 64x64 frames)
 */
function generateSeaSerpentSheet(): Buffer {
  const c = new PixelCanvas(384, 256);
  const FW = 64;
  const FH = 64;

  function drawSerpent(col: number, row: number, wavePhase: number, jawOpen: boolean, yOff: number, state: 'idle' | 'move' | 'atk' | 'hit' | 'die', frameIdx: number) {
    const ox = col * FW + 32;
    const oy = row * FH + 38 + yOff;

    if (state === 'die') {
      const d = frameIdx;
      drawShadow(c, ox, oy + 20, Math.max(4, 18 - d * 4), 4);
      c.fillEllipse(ox, oy + 14 + d * 2, 14, 6, 2, 132, 199, 255 - d * 55);
      return;
    }

    drawShadow(c, ox, oy + 22, 20, 5);

    const bodyCol = state === 'hit' ? [254, 202, 202] : [2, 132, 199];
    const underCol = state === 'hit' ? [239, 68, 68] : [56, 189, 248];
    const finCol = [6, 182, 212];

    // Undulating coils
    for (let s = 3; s >= 0; s--) {
      const segX = ox - s * 7 + Math.sin(wavePhase + s) * 3;
      const segY = oy + s * 3 + Math.cos(wavePhase + s) * 2;
      const rad = 11 - s * 1.5;
      c.fillCircle(segX, segY, Math.round(rad), bodyCol[0], bodyCol[1], bodyCol[2]);
      c.fillCircle(segX, segY + 3, Math.round(rad * 0.6), underCol[0], underCol[1], underCol[2]);
      // Dorsal spiky fins
      c.fillRect(segX - 1, segY - rad - 3, 2, 4, finCol[0], finCol[1], finCol[2]);
    }

    // Serpent Head
    const headX = ox + 8;
    const headY = oy - 4;
    c.fillEllipse(headX, headY, 11, 8, bodyCol[0], bodyCol[1], bodyCol[2]);
    c.fillCircle(headX + 4, headY - 1, 6, bodyCol[0], bodyCol[1], bodyCol[2]);

    // Dorsal head crest
    c.fillRect(headX - 4, headY - 12, 6, 6, finCol[0], finCol[1], finCol[2]);

    // Fierce glowing golden eye
    c.fillRect(headX + 2, headY - 4, 3, 2, 251, 191, 36);
    c.setPixel(headX + 3, headY - 4, 0, 0, 0);

    // Jaws & teeth
    if (jawOpen || state === 'atk') {
      c.fillRect(headX + 8, headY + 2, 6, 4, 8, 51, 68);
      // Sharp fangs
      c.setPixel(headX + 9, headY + 2, 255, 255, 255);
      c.setPixel(headX + 11, headY + 4, 255, 255, 255);
      if (state === 'atk' && frameIdx >= 2) {
        // High pressure water breath projectile
        c.fillCircle(headX + 18, headY + 2, 5, 56, 189, 248, 220);
        c.fillCircle(headX + 24, headY + 2, 3, 165, 243, 252, 255);
      }
    }
  }

  // Row 0: Idle (4 frames)
  drawSerpent(0, 0, 0, false, 0, 'idle', 0);
  drawSerpent(1, 0, 1, false, 1, 'idle', 1);
  drawSerpent(2, 0, 2, true, 0, 'idle', 2);
  drawSerpent(3, 0, 3, false, -1, 'idle', 3);

  // Row 1: Move (6 frames)
  for (let i = 0; i < 6; i++) {
    drawSerpent(i, 1, (i * Math.PI) / 3, false, (i % 2) * -1, 'move', i);
  }

  // Row 2: Attack (4 frames)
  drawSerpent(0, 2, 0, false, -2, 'atk', 0);
  drawSerpent(1, 2, 1, true, -4, 'atk', 1);
  drawSerpent(2, 2, 2, true, 2, 'atk', 2); // Spit!
  drawSerpent(3, 2, 3, false, 1, 'atk', 3);

  // Row 3: Hit & Death
  drawSerpent(0, 3, 0, true, -3, 'hit', 0);
  drawSerpent(1, 3, 1, false, 1, 'hit', 1);
  drawSerpent(2, 3, 0, false, 0, 'die', 0);
  drawSerpent(3, 3, 0, false, 1, 'die', 1);
  drawSerpent(4, 3, 0, false, 2, 'die', 2);
  drawSerpent(5, 3, 0, false, 3, 'die', 3);

  return c.toPNG();
}

/**
 * 5. TIDE LORD BOSS SPRITE SHEET (768 x 512: 6 cols x 4 rows of 128x128 frames)
 */
function generateTideLordSheet(): Buffer {
  const c = new PixelCanvas(768, 512);
  const FW = 128;
  const FH = 128;

  function drawBoss(col: number, row: number, floatPhase: number, tridentUp: boolean, yOff: number, state: 'idle' | 'move' | 'atk' | 'hit' | 'die', frameIdx: number) {
    const ox = col * FW + 64;
    const oy = row * FH + 72 + yOff;

    if (state === 'die') {
      const d = frameIdx;
      drawShadow(c, ox, oy + 44, Math.max(8, 36 - d * 8), 8);
      c.fillEllipse(ox, oy + 24 + d * 4, Math.max(6, 28 - d * 6), Math.max(4, 16 - d * 3), 2, 132, 199, 255 - d * 55);
      // Shattered ocean crystals
      c.fillCircle(ox - 24, oy + 12 - d * 6, 6, 56, 189, 248, 200 - d * 40);
      c.fillCircle(ox + 28, oy + 8 - d * 8, 7, 34, 211, 238, 200 - d * 40);
      return;
    }

    // Grand boss shadow with pulsating radius
    drawShadow(c, ox, oy + 46, 34 + Math.round(Math.sin(floatPhase) * 3), 9);

    const bodyCol = state === 'hit' ? [254, 202, 202] : [2, 132, 199];
    const armorCol = state === 'hit' ? [239, 68, 68] : [8, 51, 68];
    const goldCol = [245, 158, 11];
    const magicAqua = [56, 189, 248];

    // Flowing Cape of Living Water
    const capeW = 28;
    const capeH = 36;
    for (let cy = 0; cy < capeH; cy++) {
      const wave = Math.sin(floatPhase + cy * 0.2) * 4;
      c.fillRect(ox - capeW / 2 + wave, oy - 10 + cy, capeW, 1, 6, 182, 212, 160 + cy * 2);
    }

    // Heavy Aquatic Greaves & Legs
    c.fillRect(ox - 16, oy + 18, 12, 22, armorCol[0], armorCol[1], armorCol[2]);
    c.fillRect(ox + 4, oy + 18, 12, 22, armorCol[0], armorCol[1], armorCol[2]);
    c.fillRect(ox - 18, oy + 36, 15, 6, goldCol[0], goldCol[1], goldCol[2]);
    c.fillRect(ox + 3, oy + 36, 15, 6, goldCol[0], goldCol[1], goldCol[2]);

    // Torso Armor & Plate
    c.fillRect(ox - 20, oy - 14, 40, 34, armorCol[0], armorCol[1], armorCol[2]);
    c.fillRect(ox - 16, oy - 10, 32, 26, bodyCol[0], bodyCol[1], bodyCol[2]);
    // Golden Royal Trim
    c.strokeRect(ox - 18, oy - 12, 36, 28, goldCol[0], goldCol[1], goldCol[2]);

    // Glowing Azure Core Gem
    c.fillCircle(ox, oy + 2, 7, magicAqua[0], magicAqua[1], magicAqua[2], 240);
    c.fillCircle(ox, oy + 2, 3, 255, 255, 255, 255);

    // Shoulder Pauldrons (Giant Horned Clam Shells)
    c.fillEllipse(ox - 24, oy - 12, 12, 8, goldCol[0], goldCol[1], goldCol[2]);
    c.fillEllipse(ox + 24, oy - 12, 12, 8, goldCol[0], goldCol[1], goldCol[2]);
    c.fillRect(ox - 28, oy - 18, 4, 8, magicAqua[0], magicAqua[1], magicAqua[2]);
    c.fillRect(ox + 24, oy - 18, 4, 8, magicAqua[0], magicAqua[1], magicAqua[2]);

    // Helm & Head
    c.fillRect(ox - 14, oy - 38, 28, 26, armorCol[0], armorCol[1], armorCol[2]);
    // Golden Crown Spikes
    c.fillRect(ox - 16, oy - 46, 6, 12, goldCol[0], goldCol[1], goldCol[2]);
    c.fillRect(ox - 3, oy - 50, 6, 16, goldCol[0], goldCol[1], goldCol[2]);
    c.fillRect(ox + 10, oy - 46, 6, 12, goldCol[0], goldCol[1], goldCol[2]);

    // Fierce glowing eyes
    c.fillRect(ox - 9, oy - 28, 6, 3, 103, 232, 249);
    c.fillRect(ox + 3, oy - 28, 6, 3, 103, 232, 249);
    c.fillRect(ox - 7, oy - 27, 2, 2, 255, 255, 255);
    c.fillRect(ox + 5, oy - 27, 2, 2, 255, 255, 255);

    // GRAND OCEANIC TRIDENT (Staff of the Depths)
    const triY = tridentUp ? oy - 35 : oy - 15;
    const triX = ox + 32;

    // Golden Shaft
    c.fillRect(triX, triY - 25, 4, 75, goldCol[0], goldCol[1], goldCol[2]);
    // Prongs
    c.fillRect(triX - 10, triY - 30, 24, 5, magicAqua[0], magicAqua[1], magicAqua[2]);
    c.fillRect(triX - 12, triY - 45, 4, 18, magicAqua[0], magicAqua[1], magicAqua[2]);
    c.fillRect(triX, triY - 50, 4, 23, magicAqua[0], magicAqua[1], magicAqua[2]);
    c.fillRect(triX + 12, triY - 45, 4, 18, magicAqua[0], magicAqua[1], magicAqua[2]);

    // Attack: Summoning Tidal Surge Wave
    if (state === 'atk' && frameIdx >= 2) {
      c.fillCircle(triX + 2, triY - 40, 16, 56, 189, 248, 190);
      c.fillCircle(triX + 2, triY - 40, 8, 255, 255, 255, 240);
      // Swirling tidal energy rays
      c.strokeRect(triX - 25, triY - 55, 54, 30, 103, 232, 249, 200);
    }
  }

  // Row 0: Idle (4 frames)
  drawBoss(0, 0, 0, false, 0, 'idle', 0);
  drawBoss(1, 0, 1, false, -3, 'idle', 1);
  drawBoss(2, 0, 2, false, -5, 'idle', 2);
  drawBoss(3, 0, 3, false, -2, 'idle', 3);

  // Row 1: Move (6 frames)
  for (let i = 0; i < 6; i++) {
    drawBoss(i, 1, (i * Math.PI) / 3, false, Math.sin((i * Math.PI) / 3) * 6, 'move', i);
  }

  // Row 2: Attack (4 frames)
  drawBoss(0, 2, 0, false, -2, 'atk', 0);
  drawBoss(1, 2, 1, true, -6, 'atk', 1); // Raise trident
  drawBoss(2, 2, 2, true, 4, 'atk', 2);  // Thrust down / Tidal wave surge!
  drawBoss(3, 2, 3, false, 1, 'atk', 3);

  // Row 3: Hit & Death
  drawBoss(0, 3, 0, false, -4, 'hit', 0);
  drawBoss(1, 3, 1, false, 2, 'hit', 1);
  drawBoss(2, 3, 0, false, 0, 'die', 0);
  drawBoss(3, 3, 0, false, 2, 'die', 1);
  drawBoss(4, 3, 0, false, 4, 'die', 2);
  drawBoss(5, 3, 0, false, 6, 'die', 3);

  return c.toPNG();
}

/**
 * 6. SUNKEN RUINS TILESET PNG (160 x 128: 5 cols x 4 rows of 32x32 tiles)
 */
function generateSunkenRuinsTileset(): Buffer {
  const c = new PixelCanvas(160, 128);

  // Tile (0, 0): Cobblestone sea floor
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const noise = ((x * 13 + y * 17) % 19) - 9;
      c.setPixel(x, y, 8 + noise, 51 + noise, 68 + noise);
    }
  }
  c.strokeRect(0, 0, 16, 16, 4, 30, 42);
  c.strokeRect(16, 0, 16, 16, 4, 30, 42);
  c.strokeRect(0, 16, 16, 16, 4, 30, 42);
  c.strokeRect(16, 16, 16, 16, 4, 30, 42);

  // Tile (1, 0): Ancient Runestone Floor with glowing cyan glyph
  for (let y = 0; y < 32; y++) {
    for (let x = 32; x < 64; x++) {
      c.setPixel(x, y, 12, 45, 62);
    }
  }
  c.strokeRect(34, 2, 28, 28, 20, 83, 105);
  // Mystic rune cross
  c.fillRect(40, 15, 16, 2, 56, 189, 248);
  c.fillRect(47, 8, 2, 16, 56, 189, 248);
  c.fillCircle(48, 16, 3, 103, 232, 249);

  // Tile (2, 0): Submerged Water Floor
  for (let y = 0; y < 32; y++) {
    for (let x = 64; x < 96; x++) {
      const wave = Math.sin((x + y) * 0.4) * 15;
      c.setPixel(x, y, 2, Math.round(132 + wave), Math.round(199 + wave));
    }
  }
  // Caustic ripples
  c.strokeRect(68, 6, 12, 8, 103, 232, 249, 140);
  c.strokeRect(80, 18, 10, 6, 103, 232, 249, 140);

  // Tile (3, 0): Sandy Seabed with Seashells
  for (let y = 0; y < 32; y++) {
    for (let x = 96; x < 128; x++) {
      const n = (x * 7 + y * 11) % 15;
      c.setPixel(x, y, 14 + n, 68 + n, 88 + n);
    }
  }
  // Shell decals
  c.fillCircle(106, 12, 3, 254, 202, 202);
  c.fillCircle(118, 22, 2, 253, 230, 138);

  // Tile (4, 0): Coral & Aquatic Flora Tile
  for (let y = 0; y < 32; y++) {
    for (let x = 128; x < 160; x++) {
      c.setPixel(x, y, 10, 48, 65);
    }
  }
  // Crimson Coral sprig
  c.fillRect(138, 12, 4, 14, 239, 68, 68);
  c.fillRect(135, 10, 3, 6, 248, 113, 113);
  c.fillRect(142, 8, 3, 8, 248, 113, 113);

  // Row 1: Altar & Architecture Tiles
  // Tile (0, 1): Broken Marble Pillar Base
  for (let y = 32; y < 64; y++) {
    for (let x = 0; x < 32; x++) {
      c.setPixel(x, y, 15, 60, 80);
    }
  }
  c.fillRect(4, 38, 24, 20, 203, 213, 225);
  c.strokeRect(4, 38, 24, 20, 100, 116, 139);
  c.fillRect(8, 42, 16, 12, 226, 232, 240);

  // Tile (1, 1): Sea Altar Sacred Switch Tile (Trident Emblem)
  for (let y = 32; y < 64; y++) {
    for (let x = 32; x < 64; x++) {
      c.setPixel(x, y, 14, 116, 144);
    }
  }
  c.strokeRect(34, 34, 28, 28, 245, 158, 11);
  c.fillRect(47, 38, 2, 20, 245, 158, 11);
  c.fillRect(43, 40, 10, 3, 56, 189, 248);
  c.fillRect(41, 36, 3, 8, 56, 189, 248);
  c.fillRect(52, 36, 3, 8, 56, 189, 248);

  return c.toPNG();
}

// --- ANIMATION MANIFEST ---
const ANIMATION_MANIFEST = {
  version: '2.1.0',
  description: 'Etheria Chronicles Phase 2.1 Genuine PNG Sprite Sheet Manifest',
  monsters: {
    aqua_slime: {
      name: 'Aqua Slime',
      path: '/assets/monsters/sunken-ruins/aqua_slime.png',
      frameWidth: 64,
      frameHeight: 64,
      framesPerRow: 6,
      totalRows: 4,
      animations: {
        idle: { frames: [0, 1, 2, 3], frameRate: 5, repeat: -1 },
        walk: { frames: [6, 7, 8, 9, 10, 11], frameRate: 8, repeat: -1 },
        attack: { frames: [12, 13, 14, 15], frameRate: 8, repeat: 0 },
        hit: { frames: [18, 19], frameRate: 6, repeat: 0 },
        die: { frames: [20, 21, 22, 23], frameRate: 6, repeat: 0 },
      },
      origin: { x: 0.5, y: 0.65 },
      bodySize: { width: 28, height: 24, offsetX: 18, offsetY: 28 },
    },
    reef_crab: {
      name: 'Reef Crab',
      path: '/assets/monsters/sunken-ruins/reef_crab.png',
      frameWidth: 64,
      frameHeight: 64,
      framesPerRow: 6,
      totalRows: 4,
      animations: {
        idle: { frames: [0, 1, 2, 3], frameRate: 5, repeat: -1 },
        walk: { frames: [6, 7, 8, 9, 10, 11], frameRate: 9, repeat: -1 },
        attack: { frames: [12, 13, 14, 15], frameRate: 9, repeat: 0 },
        hit: { frames: [18, 19], frameRate: 6, repeat: 0 },
        die: { frames: [20, 21, 22, 23], frameRate: 6, repeat: 0 },
      },
      origin: { x: 0.5, y: 0.65 },
      bodySize: { width: 34, height: 26, offsetX: 15, offsetY: 26 },
    },
    drowned_warrior: {
      name: 'Drowned Warrior',
      path: '/assets/monsters/sunken-ruins/drowned_warrior.png',
      frameWidth: 64,
      frameHeight: 64,
      framesPerRow: 6,
      totalRows: 4,
      animations: {
        idle: { frames: [0, 1, 2, 3], frameRate: 4, repeat: -1 },
        walk: { frames: [6, 7, 8, 9, 10, 11], frameRate: 7, repeat: -1 },
        attack: { frames: [12, 13, 14, 15], frameRate: 8, repeat: 0 },
        hit: { frames: [18, 19], frameRate: 6, repeat: 0 },
        die: { frames: [20, 21, 22, 23], frameRate: 5, repeat: 0 },
      },
      origin: { x: 0.5, y: 0.65 },
      bodySize: { width: 26, height: 34, offsetX: 19, offsetY: 20 },
    },
    sea_serpent: {
      name: 'Sea Serpent',
      path: '/assets/monsters/sunken-ruins/sea_serpent.png',
      frameWidth: 64,
      frameHeight: 64,
      framesPerRow: 6,
      totalRows: 4,
      animations: {
        idle: { frames: [0, 1, 2, 3], frameRate: 5, repeat: -1 },
        walk: { frames: [6, 7, 8, 9, 10, 11], frameRate: 8, repeat: -1 },
        attack: { frames: [12, 13, 14, 15], frameRate: 8, repeat: 0 },
        hit: { frames: [18, 19], frameRate: 6, repeat: 0 },
        die: { frames: [20, 21, 22, 23], frameRate: 6, repeat: 0 },
      },
      origin: { x: 0.5, y: 0.65 },
      bodySize: { width: 36, height: 30, offsetX: 14, offsetY: 22 },
    },
  },
  bosses: {
    tide_lord: {
      name: 'Tide Lord',
      path: '/assets/bosses/tide_lord.png',
      frameWidth: 128,
      frameHeight: 128,
      framesPerRow: 6,
      totalRows: 4,
      animations: {
        idle: { frames: [0, 1, 2, 3], frameRate: 5, repeat: -1 },
        walk: { frames: [6, 7, 8, 9, 10, 11], frameRate: 7, repeat: -1 },
        attack: { frames: [12, 13, 14, 15], frameRate: 6, repeat: 0 },
        hit: { frames: [18, 19], frameRate: 6, repeat: 0 },
        die: { frames: [20, 21, 22, 23], frameRate: 5, repeat: 0 },
      },
      origin: { x: 0.5, y: 0.65 },
      bodySize: { width: 56, height: 72, offsetX: 36, offsetY: 36 },
    },
  },
  tilesets: {
    sunken_ruins: {
      name: 'Sunken Ruins Tileset',
      path: '/assets/tilesets/sunken_ruins_tileset.png',
      tileWidth: 32,
      tileHeight: 32,
      columns: 5,
      rows: 4,
    },
  },
};

// --- RUN GENERATION ---
export function generateAllAssets() {
  console.log('🎨 Starting Real PNG Asset & Sprite Sheet Generation...');

  const dirs = [
    'public/assets/monsters/sunken-ruins',
    'public/assets/monsters/frostpeak',
    'public/assets/monsters/crimson-desert',
    'public/assets/monsters/celestial-tower',
    'public/assets/bosses',
    'public/assets/npcs',
    'public/assets/tilesets',
    'public/assets/environments/sunken-ruins',
    'public/assets/environments/frostpeak',
    'public/assets/environments/crimson-desert',
    'public/assets/environments/celestial-tower',
    'public/assets/manifests',
  ];

  dirs.forEach((d) => {
    const full = path.resolve(d);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
    }
  });

  // 1. Aqua Slime Sheet
  const aquaSlimeBuf = generateAquaSlimeSheet();
  fs.writeFileSync('public/assets/monsters/sunken-ruins/aqua_slime.png', aquaSlimeBuf);
  console.log('  ✓ Generated: public/assets/monsters/sunken-ruins/aqua_slime.png (384x256, 24 frames)');

  // 2. Reef Crab Sheet
  const reefCrabBuf = generateReefCrabSheet();
  fs.writeFileSync('public/assets/monsters/sunken-ruins/reef_crab.png', reefCrabBuf);
  console.log('  ✓ Generated: public/assets/monsters/sunken-ruins/reef_crab.png (384x256, 24 frames)');

  // 3. Drowned Warrior Sheet
  const drownedWarriorBuf = generateDrownedWarriorSheet();
  fs.writeFileSync('public/assets/monsters/sunken-ruins/drowned_warrior.png', drownedWarriorBuf);
  console.log('  ✓ Generated: public/assets/monsters/sunken-ruins/drowned_warrior.png (384x256, 24 frames)');

  // 4. Sea Serpent Sheet
  const seaSerpentBuf = generateSeaSerpentSheet();
  fs.writeFileSync('public/assets/monsters/sunken-ruins/sea_serpent.png', seaSerpentBuf);
  console.log('  ✓ Generated: public/assets/monsters/sunken-ruins/sea_serpent.png (384x256, 24 frames)');

  // 5. Tide Lord Boss Sheet
  const tideLordBuf = generateTideLordSheet();
  fs.writeFileSync('public/assets/bosses/tide_lord.png', tideLordBuf);
  console.log('  ✓ Generated: public/assets/bosses/tide_lord.png (768x512, 24 frames)');

  // 6. Sunken Ruins Tileset
  const tilesetBuf = generateSunkenRuinsTileset();
  fs.writeFileSync('public/assets/tilesets/sunken_ruins_tileset.png', tilesetBuf);
  console.log('  ✓ Generated: public/assets/tilesets/sunken_ruins_tileset.png (160x128)');

  // 7. Animation Manifest
  fs.writeFileSync('public/assets/manifests/animations.json', JSON.stringify(ANIMATION_MANIFEST, null, 2));
  console.log('  ✓ Generated: public/assets/manifests/animations.json');

  console.log('🎉 Real PNG Asset Generation Completed Successfully!');
}

generateAllAssets();
