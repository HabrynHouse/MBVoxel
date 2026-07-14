import { Color3 } from '@babylonjs/core/Maths/math.color';
import {
  ADVENTURER_PALETTE,
  ColorPalette,
  fillBox,
  fillEllipsoid,
  mirrorVoxelsX,
  Voxel,
} from '../shared/types';

const C = 0; // center X for mirroring

export function buildBaseBodyVoxels(palette: ColorPalette = ADVENTURER_PALETTE): {
  head: Voxel[];
  torso: Voxel[];
  leftUpperArm: Voxel[];
  leftForearm: Voxel[];
  leftHand: Voxel[];
  leftUpperLeg: Voxel[];
  leftLowerLeg: Voxel[];
  leftFoot: Voxel[];
  cape: Voxel[];
} {
  const head: Voxel[] = [];
  const torso: Voxel[] = [];
  const leftUpperArm: Voxel[] = [];
  const leftForearm: Voxel[] = [];
  const leftHand: Voxel[] = [];
  const leftUpperLeg: Voxel[] = [];
  const leftLowerLeg: Voxel[] = [];
  const leftFoot: Voxel[] = [];
  const cape: Voxel[] = [];

  // Head — detailed with facial features (~14x14x14 voxels)
  fillEllipsoid(head, C, 82, 0, 5.5, 6.5, 5, palette.skin, (_x, _y, _z, _nx, ny, nz) => {
    if (ny > 0.3 && nz > 0.2) return palette.hair;
    if (ny < -0.5) return palette.skinShadow;
    return palette.skin;
  });

  // Eyes
  fillBox(head, -2, 81, 4, -1, 82, 5, palette.eyeWhite);
  fillBox(head, 1, 81, 4, 2, 82, 5, palette.eyeWhite);
  fillBox(head, -2, 81, 5, -1, 81, 5, palette.eyeIris);
  fillBox(head, 1, 81, 5, 2, 81, 5, palette.eyeIris);

  // Nose bridge
  fillBox(head, -1, 79, 5, 0, 80, 6, palette.skinShadow);

  // Beard stubble / jaw shadow
  fillBox(head, -3, 76, 2, 3, 78, 5, palette.skinShadow);

  // Hair volume
  fillEllipsoid(head, C, 86, -1, 6, 4, 5.5, palette.hair);
  fillBox(head, -6, 84, -3, 6, 88, 2, palette.hair);
  // Hair strands highlight
  fillBox(head, -4, 87, -2, -2, 89, 0, palette.hairHighlight);
  fillBox(head, 2, 87, -2, 4, 89, 0, palette.hairHighlight);

  // Neck
  fillBox(torso, -2, 74, -2, 2, 76, 2, palette.skin);

  // Torso — tunic with belt and trim
  fillBox(torso, -7, 52, -4, 7, 74, 4, palette.tunic);
  // Tunic shadow sides
  fillBox(torso, -7, 52, -4, -5, 74, 4, palette.tunicShadow);
  fillBox(torso, 5, 52, -4, 7, 74, 4, palette.tunicShadow);
  // Collar
  fillBox(torso, -4, 72, -3, 4, 74, 3, palette.tunicTrim);
  // Belt
  fillBox(torso, -8, 50, -5, 8, 52, 5, palette.belt);
  fillBox(torso, -2, 50, 5, 2, 52, 6, palette.beltBuckle);
  // Tunic hem
  fillBox(torso, -8, 52, -5, 8, 54, 5, palette.tunicTrim);
  // Chest detail — leather strap
  fillBox(torso, -1, 58, 4, 1, 68, 5, palette.leather);

  // Cape
  fillBox(cape, -9, 55, -6, 9, 74, -4, palette.cape);
  fillBox(cape, -10, 40, -7, 10, 55, -5, palette.capeShadow);

  // Left upper arm
  fillBox(leftUpperArm, -12, 58, -3, -8, 68, 3, palette.tunic);
  fillBox(leftUpperArm, -12, 58, -3, -10, 68, 3, palette.tunicShadow);

  // Left forearm
  fillBox(leftForearm, -12, 48, -2.5, -8, 58, 2.5, palette.skin);
  fillBox(leftForearm, -12, 48, -2.5, -10, 58, 2.5, palette.skinShadow);

  // Left hand
  fillBox(leftHand, -12, 44, -2, -8, 48, 2, palette.skin);
  fillBox(leftHand, -12, 44, 1, -9, 47, 3, palette.skin);

  // Left upper leg
  fillBox(leftUpperLeg, -6, 28, -3, -2, 50, 3, palette.pants);
  fillBox(leftUpperLeg, -6, 28, -3, -4, 50, 3, palette.pantsShadow);

  // Left lower leg
  fillBox(leftLowerLeg, -6, 8, -2.5, -2, 28, 2.5, palette.pants);
  fillBox(leftLowerLeg, -4, 8, -2.5, -2, 28, 2.5, palette.pantsShadow);

  // Left foot / boot
  fillBox(leftFoot, -7, 0, -4, -1, 8, 4, palette.boot);
  fillBox(leftFoot, -7, 0, -4, -5, 3, 4, palette.bootShadow);
  fillBox(leftFoot, -7, 3, 2, -1, 6, 6, palette.boot); // toe cap

  return {
    head: mirrorVoxelsX(head, C),
    torso: mirrorVoxelsX(torso, C),
    leftUpperArm: mirrorVoxelsX(leftUpperArm, C),
    leftForearm: mirrorVoxelsX(leftForearm, C),
    leftHand: mirrorVoxelsX(leftHand, C),
    leftUpperLeg: mirrorVoxelsX(leftUpperLeg, C),
    leftLowerLeg: mirrorVoxelsX(leftLowerLeg, C),
    leftFoot: mirrorVoxelsX(leftFoot, C),
    cape: mirrorVoxelsX(cape, C),
  };
}

export function buildHelmetVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  fillBox(voxels, -6, 78, -6, 6, 90, 6, palette.steel, true);
  fillBox(voxels, -5, 90, -5, 5, 92, 5, palette.steelHighlight);
  fillBox(voxels, -1, 90, 4, 1, 93, 6, palette.steelHighlight);
  // Visor slit
  fillBox(voxels, -4, 80, 5, 4, 82, 6, new Color3(0.1, 0.1, 0.12));
  // Cheek guards
  fillBox(voxels, -7, 76, -2, -5, 84, 4, palette.steelShadow);
  fillBox(voxels, 5, 76, -2, 7, 84, 4, palette.steelShadow);
  // Gold trim
  fillBox(voxels, -6, 88, -6, 6, 89, 6, palette.gold);
  fillBox(voxels, -7, 84, -7, 7, 85, 7, palette.gold);
  // Nasal guard
  fillBox(voxels, -1, 78, 5, 1, 88, 6, palette.steelHighlight);
  return mirrorVoxelsX(voxels, C);
}

export function buildChestArmorVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  fillBox(voxels, -9, 54, -5, 9, 74, 5, palette.steel, true);
  // Breastplate curvature illusion
  fillBox(voxels, -7, 58, 4, 7, 72, 6, palette.steelHighlight);
  fillBox(voxels, -5, 60, 5, 5, 70, 7, palette.steelHighlight);
  // Gold heraldic cross
  fillBox(voxels, -1, 58, 6, 1, 70, 7, palette.gold);
  fillBox(voxels, -4, 63, 6, 4, 65, 7, palette.gold);
  // Fauld (lower plate skirt)
  fillBox(voxels, -9, 50, -5, 9, 54, 5, palette.steelShadow);
  for (let x = -8; x <= 8; x += 4) {
    fillBox(voxels, x, 50, -5, x + 2, 54, 5, palette.steel);
  }
  // Rivets
  for (let y = 56; y <= 70; y += 4) {
    fillBox(voxels, -8, y, 5, -7, y, 5, palette.gold);
    fillBox(voxels, 7, y, 5, 8, y, 5, palette.gold);
  }
  return mirrorVoxelsX(voxels, C);
}

export function buildPauldronVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const left: Voxel[] = [];
  fillEllipsoid(left, -11, 68, 0, 4, 3, 4, palette.steel);
  fillBox(left, -14, 66, -3, -8, 70, 3, palette.steelHighlight);
  fillBox(left, -13, 68, -4, -9, 70, 4, palette.steelShadow);
  fillBox(left, -12, 70, -2, -10, 71, 2, palette.gold);
  return mirrorVoxelsX(left, C);
}

export function buildGauntletVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const left: Voxel[] = [];
  fillBox(left, -13, 44, -3, -7, 50, 3, palette.steel);
  fillBox(left, -13, 44, -3, -11, 50, 3, palette.steelShadow);
  // Knuckle ridges
  for (let z = -2; z <= 2; z += 2) {
    fillBox(left, -13, 48, z, -7, 49, z, palette.steelHighlight);
  }
  fillBox(left, -12, 50, -2, -8, 51, 2, palette.gold);
  return mirrorVoxelsX(left, C);
}

export function buildGreaveVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const left: Voxel[] = [];
  fillBox(left, -7, 8, -3, -1, 30, 3, palette.steel, true);
  fillBox(left, -6, 20, 2, -2, 28, 4, palette.steelHighlight);
  fillBox(left, -7, 8, -3, -5, 30, 3, palette.steelShadow);
  fillBox(left, -6, 28, -2, -2, 30, 2, palette.gold);
  return mirrorVoxelsX(left, C);
}

export function buildArmoredBootVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const left: Voxel[] = [];
  fillBox(left, -8, 0, -5, 0, 10, 5, palette.steel);
  fillBox(left, -8, 0, -5, -6, 4, 5, palette.steelShadow);
  fillBox(left, -8, 6, 2, 0, 8, 7, palette.steelHighlight);
  fillBox(left, -7, 8, -3, -1, 9, 3, palette.gold);
  return mirrorVoxelsX(left, C);
}

export function buildSwordVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  // Blade
  fillBox(voxels, -1, 20, -1, 1, 55, 1, palette.steelHighlight);
  fillBox(voxels, 0, 20, -1, 0, 55, 1, palette.steel);
  // Fuller (blood groove)
  fillBox(voxels, 0, 25, 0, 0, 50, 0, palette.steelShadow);
  // Crossguard
  fillBox(voxels, -6, 18, -1, 6, 20, 1, palette.gold);
  fillBox(voxels, -6, 18, -2, -5, 20, 2, palette.goldHighlight);
  fillBox(voxels, 5, 18, -2, 6, 20, 2, palette.goldHighlight);
  // Grip
  fillBox(voxels, -1, 8, -1, 1, 18, 1, palette.leather);
  fillBox(voxels, -1, 10, -1, 1, 12, 1, palette.leatherDark);
  fillBox(voxels, -1, 14, -1, 1, 16, 1, palette.leatherDark);
  // Pommel
  fillBox(voxels, -2, 4, -2, 2, 8, 2, palette.gold);
  fillEllipsoid(voxels, 0, 5, 0, 2.5, 2, 2.5, palette.goldHighlight);
  return voxels;
}

export function buildAxeVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  // Handle
  fillBox(voxels, -1, 0, -1, 1, 40, 1, palette.wood);
  fillBox(voxels, 0, 0, -1, 0, 40, 1, palette.woodDark);
  // Axe head
  fillBox(voxels, -1, 36, -1, 1, 42, 1, palette.steel);
  fillBox(voxels, 1, 36, -4, 8, 44, 4, palette.steelHighlight);
  fillBox(voxels, 7, 37, -3, 9, 43, 3, palette.steel);
  fillBox(voxels, 8, 38, -2, 10, 42, 2, palette.steelShadow);
  // Back spike
  fillBox(voxels, -6, 38, -1, -1, 42, 1, palette.steelShadow);
  // Binding
  fillBox(voxels, -2, 34, -2, 2, 36, 2, palette.leather);
  return voxels;
}

export function buildMaceVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  fillBox(voxels, -1, 0, -1, 1, 32, 1, palette.wood);
  fillBox(voxels, -3, 32, -3, 3, 36, 3, palette.steel);
  fillEllipsoid(voxels, 0, 40, 0, 5, 5, 5, palette.steel);
  // Spikes
  fillBox(voxels, 0, 45, 0, 0, 48, 0, palette.steelHighlight);
  fillBox(voxels, 4, 40, 0, 7, 40, 0, palette.steelHighlight);
  fillBox(voxels, -7, 40, 0, -4, 40, 0, palette.steelHighlight);
  fillBox(voxels, 0, 40, 4, 0, 40, 7, palette.steelHighlight);
  fillBox(voxels, 0, 40, -7, 0, 40, -4, palette.steelHighlight);
  fillBox(voxels, -2, 28, -2, 2, 32, 2, palette.gold);
  return voxels;
}

export function buildBowVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  // Bow limbs — curved shape approximated
  for (let y = 0; y <= 45; y++) {
    const spread = Math.sin((y / 45) * Math.PI) * 6;
    fillBox(voxels, Math.round(-spread), y, 0, Math.round(-spread), y, 0, palette.wood);
    fillBox(voxels, Math.round(spread), y, 0, Math.round(spread), y, 0, palette.wood);
    if (y % 5 === 0) {
      fillBox(voxels, Math.round(-spread), y, -1, Math.round(-spread), y, 1, palette.woodDark);
      fillBox(voxels, Math.round(spread), y, -1, Math.round(spread), y, 1, palette.woodDark);
    }
  }
  // Grip
  fillBox(voxels, -2, 18, -2, 2, 28, 2, palette.leather);
  // String
  for (let y = 0; y <= 45; y++) {
    const spread = Math.sin((y / 45) * Math.PI) * 6;
    fillBox(voxels, Math.round(-spread) + 1, y, 0, Math.round(spread) - 1, y, 0, new Color3(0.85, 0.82, 0.75));
  }
  return voxels;
}

export function buildShieldVoxels(palette: ColorPalette = ADVENTURER_PALETTE): Voxel[] {
  const voxels: Voxel[] = [];
  fillEllipsoid(voxels, 0, 25, 0, 12, 16, 2, palette.steel);
  fillEllipsoid(voxels, 0, 25, 1, 10, 14, 1, palette.steelHighlight);
  // Heraldic emblem
  fillBox(voxels, -3, 22, 2, 3, 30, 2, palette.gold);
  fillBox(voxels, -1, 20, 2, 1, 32, 2, palette.gold);
  // Boss
  fillEllipsoid(voxels, 0, 25, 3, 3, 3, 2, palette.goldHighlight);
  // Rim
  fillBox(voxels, -12, 10, 0, 12, 12, 1, palette.gold);
  fillBox(voxels, -12, 38, 0, 12, 40, 1, palette.gold);
  // Straps (back)
  fillBox(voxels, -4, 20, -1, 4, 22, 0, palette.leather);
  fillBox(voxels, -4, 28, -1, 4, 30, 0, palette.leather);
  return voxels;
}

export function buildEnemyVoxels(isElite = false): Voxel[] {
  const voxels: Voxel[] = [];
  const bodyColor = isElite
    ? new Color3(0.5, 0.15, 0.15)
    : new Color3(0.35, 0.12, 0.12);
  const dark = isElite
    ? new Color3(0.3, 0.08, 0.08)
    : new Color3(0.2, 0.06, 0.06);
  const highlight = isElite
    ? new Color3(0.7, 0.2, 0.15)
    : new Color3(0.45, 0.15, 0.12);

  fillEllipsoid(voxels, 0, 82, 0, 5, 6, 5, bodyColor);
  fillBox(voxels, -2, 81, 4, -1, 82, 5, new Color3(0.9, 0.2, 0.1));
  fillBox(voxels, 1, 81, 4, 2, 82, 5, new Color3(0.9, 0.2, 0.1));
  fillBox(voxels, -7, 52, -4, 7, 74, 4, bodyColor);
  fillBox(voxels, -7, 52, -4, -5, 74, 4, dark);
  fillBox(voxels, 5, 52, -4, 7, 74, 4, dark);
  fillBox(voxels, -1, 58, 4, 1, 68, 5, highlight);

  const leftArm: Voxel[] = [];
  fillBox(leftArm, -12, 48, -3, -8, 68, 3, bodyColor);
  const leftLeg: Voxel[] = [];
  fillBox(leftLeg, -6, 0, -3, -2, 50, 3, dark);
  fillBox(leftLeg, -7, 0, -4, -1, 8, 4, dark);

  const all = [...voxels, ...mirrorVoxelsX(leftArm, 0), ...mirrorVoxelsX(leftLeg, 0)];

  if (isElite) {
    fillBox(all, -5, 78, -5, 5, 88, 5, new Color3(0.3, 0.3, 0.35), true);
    fillBox(all, -1, 80, 5, 1, 82, 6, new Color3(0.1, 0.1, 0.12));
  }

  return all;
}
