/**
 * Etheria Chronicles - Combat & Progression Formulas
 * Based on classic MMORPG design philosophy with balanced curves
 */

import { BaseStats, DerivedStats, EquipmentState, JobClass } from '../types';

export function calculateDerivedStats(
  level: number,
  job: JobClass,
  base: BaseStats,
  equipment: EquipmentState
): DerivedStats {
  // Aggregate equipment bonuses
  let equipAtk = 0;
  let equipMatk = 0;
  let equipDef = 0;
  let equipMdef = 0;
  let equipHp = 0;
  let equipMp = 0;
  let equipCrit = 0;

  for (const slotKey in equipment) {
    const item = equipment[slotKey as keyof EquipmentState];
    if (item) {
      if (item.stats) {
        equipAtk += item.stats.atk || 0;
        equipMatk += item.stats.matk || 0;
        equipDef += item.stats.def || 0;
        equipMdef += item.stats.mdef || 0;
        equipHp += item.stats.hpBonus || 0;
        equipMp += item.stats.mpBonus || 0;
        equipCrit += item.stats.critBonus || 0;
      }
      // Refinement bonus
      const ref = item.refinement || 0;
      if (ref > 0) {
        if (item.category === 'weapon') {
          equipAtk += ref * 8;
          equipMatk += ref * 6;
        } else {
          equipDef += ref * 4;
          equipMdef += ref * 2;
        }
      }
    }
  }

  // Job multipliers
  let jobHpMult = 1.0;
  let jobMpMult = 1.0;
  if (job === 'warrior') {
    jobHpMult = 1.35;
    jobMpMult = 0.8;
  } else if (job === 'mage') {
    jobHpMult = 0.85;
    jobMpMult = 1.5;
  } else if (job === 'archer') {
    jobHpMult = 1.05;
    jobMpMult = 1.1;
  } else if (job === 'acolyte') {
    jobHpMult = 1.1;
    jobMpMult = 1.35;
  }

  const maxHp = Math.floor((120 + level * 22 + base.vit * 16 + base.vit * base.vit * 0.12) * jobHpMult) + equipHp;
  const maxMp = Math.floor((50 + level * 10 + base.int * 12 + base.int * base.int * 0.08) * jobMpMult) + equipMp;

  const atk = Math.floor(base.str * 2.2 + base.dex * 0.3 + base.luk * 0.2 + equipAtk);
  const matk = Math.floor(base.int * 3.0 + base.dex * 0.4 + equipMatk);

  const def = Math.floor(base.vit * 0.7 + equipDef);
  const mdef = Math.floor(base.int * 0.6 + equipMdef);

  const hit = Math.floor(level + base.dex * 1.5 + 40);
  const flee = Math.floor(level + base.agi * 1.4 + 20);

  const critRate = Math.min(80, Math.max(1, Math.floor(2 + base.luk * 0.35 + equipCrit)));
  const critDmg = 1.5 + (base.luk * 0.003);

  // ASPD: attacks per second
  const aspd = Math.min(2.4, 0.9 + base.agi * 0.025 + base.dex * 0.005);
  // Movement speed
  const moveSpeed = 140 + Math.min(60, base.agi * 0.8);

  return {
    maxHp,
    maxMp,
    atk,
    matk,
    def,
    mdef,
    hit,
    flee,
    critRate,
    critDmg,
    aspd,
    moveSpeed,
  };
}

export function getExpForLevel(level: number): number {
  if (level <= 1) return 80;
  return Math.floor(70 * Math.pow(level, 1.65));
}

export function calculatePhysicalDamage(
  attackerAtk: number,
  defenderDef: number,
  skillMult: number = 1.0,
  isCrit: boolean = false,
  critMult: number = 1.5
): number {
  // Damage variance +/- 10%
  const variance = 0.9 + Math.random() * 0.2;
  const rawAtk = attackerAtk * skillMult * variance;

  // Percentage + flat defense mitigation
  const defReduction = defenderDef / (defenderDef + 100);
  let finalDamage = Math.max(1, rawAtk * (1 - defReduction * 0.65) - (defenderDef * 0.3));

  if (isCrit) {
    // Crits bypass flat defense and apply crit multiplier
    finalDamage = Math.max(5, rawAtk * critMult);
  }

  return Math.round(finalDamage);
}

export function calculateMagicDamage(
  attackerMatk: number,
  defenderMdef: number,
  skillMult: number = 1.0
): number {
  const variance = 0.95 + Math.random() * 0.15;
  const rawMatk = attackerMatk * skillMult * variance;
  const mdefReduction = defenderMdef / (defenderMdef + 100);
  const finalDamage = Math.max(2, rawMatk * (1 - mdefReduction * 0.6) - (defenderMdef * 0.25));
  return Math.round(finalDamage);
}

export function rollHitChance(attackerHit: number, defenderFlee: number): boolean {
  const hitChance = Math.max(0.15, Math.min(0.98, (attackerHit - defenderFlee + 80) / 100));
  return Math.random() < hitChance;
}
