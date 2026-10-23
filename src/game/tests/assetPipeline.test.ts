/**
 * Etheria Chronicles - Asset Pipeline & Sprite Sheet Validation Tests
 * Verifies real PNG files, binary signatures, frame dimensions, and animation manifest
 */

import fs from 'fs';
import path from 'path';

export function runAssetTests() {
  console.log('🧪 Starting Etheria Chronicles Asset Pipeline Tests...');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Asset test failed: ${testName}`);
    }
  }

  // 1. Verify Animation Manifest
  const manifestPath = path.resolve('public/assets/manifests/animations.json');
  assert(fs.existsSync(manifestPath), 'Animation manifest exists on disk');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert(manifest.version === '2.1.0', 'Manifest version is 2.1.0');
  assert(manifest.monsters.aqua_slime !== undefined, 'Aqua Slime entry exists in manifest');
  assert(manifest.monsters.reef_crab !== undefined, 'Reef Crab entry exists in manifest');
  assert(manifest.monsters.drowned_warrior !== undefined, 'Drowned Warrior entry exists in manifest');
  assert(manifest.monsters.sea_serpent !== undefined, 'Sea Serpent entry exists in manifest');
  assert(manifest.bosses.tide_lord !== undefined, 'Tide Lord Boss entry exists in manifest');
  assert(manifest.tilesets.sunken_ruins !== undefined, 'Sunken Ruins tileset entry exists in manifest');

  // PNG Signature helper
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  function checkPNG(filePath: string, expectedWidth: number, expectedHeight: number, label: string) {
    const fullPath = path.resolve(filePath);
    assert(fs.existsSync(fullPath), `${label} file exists at ${filePath}`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 200, `${label} file size is valid (>200 bytes, actual: ${stat.size} bytes)`);

    const buf = fs.readFileSync(fullPath);
    assert(buf.subarray(0, 8).equals(pngSignature), `${label} has valid 8-byte PNG header signature`);

    // Parse IHDR width & height from bytes 16..24
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    assert(width === expectedWidth && height === expectedHeight, `${label} dimensions match specification (${width}x${height} == ${expectedWidth}x${expectedHeight})`);
  }

  // 2. Validate Sunken Ruins Monster PNGs
  checkPNG('public/assets/monsters/sunken-ruins/aqua_slime.png', 384, 256, 'Aqua Slime Sprite Sheet');
  checkPNG('public/assets/monsters/sunken-ruins/reef_crab.png', 384, 256, 'Reef Crab Sprite Sheet');
  checkPNG('public/assets/monsters/sunken-ruins/drowned_warrior.png', 384, 256, 'Drowned Warrior Sprite Sheet');
  checkPNG('public/assets/monsters/sunken-ruins/sea_serpent.png', 384, 256, 'Sea Serpent Sprite Sheet');

  // 3. Validate Boss PNG
  checkPNG('public/assets/bosses/tide_lord.png', 768, 512, 'Tide Lord Boss Sprite Sheet');

  // 4. Validate Tileset PNG
  checkPNG('public/assets/tilesets/sunken_ruins_tileset.png', 160, 128, 'Sunken Ruins Tileset Image');

  // 5. Validate Animation Frame Ranges
  const slimeAnims = manifest.monsters.aqua_slime.animations;
  assert(slimeAnims.idle.frames.length === 4, 'Aqua Slime has 4-frame idle animation');
  assert(slimeAnims.walk.frames.length === 6, 'Aqua Slime has 6-frame walk animation');
  assert(slimeAnims.attack.frames.length === 4, 'Aqua Slime has 4-frame attack animation');
  assert(slimeAnims.hit.frames.length === 2, 'Aqua Slime has 2-frame hit animation');
  assert(slimeAnims.die.frames.length === 4, 'Aqua Slime has 4-frame death animation');

  const tideAnims = manifest.bosses.tide_lord.animations;
  assert(tideAnims.idle.frames.length === 4, 'Tide Lord has 4-frame idle animation');
  assert(tideAnims.walk.frames.length === 6, 'Tide Lord has 6-frame float/walk animation');
  assert(tideAnims.attack.frames.length === 4, 'Tide Lord has 4-frame Tidal Surge attack animation');
  assert(tideAnims.hit.frames.length === 2, 'Tide Lord has 2-frame hit animation');
  assert(tideAnims.die.frames.length === 4, 'Tide Lord has 4-frame death animation');

  console.log(`\n🎉 All ${passed}/${total} Asset Pipeline tests passed successfully!`);
  return true;
}

runAssetTests();
