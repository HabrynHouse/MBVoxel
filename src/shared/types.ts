import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';

export const VOXEL_SIZE = 0.02;
export const CHARACTER_HEIGHT = 1.85;

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: Color3;
}

export interface ColorPalette {
  skin: Color3;
  skinShadow: Color3;
  hair: Color3;
  hairHighlight: Color3;
  eyeWhite: Color3;
  eyeIris: Color3;
  tunic: Color3;
  tunicShadow: Color3;
  tunicTrim: Color3;
  belt: Color3;
  beltBuckle: Color3;
  pants: Color3;
  pantsShadow: Color3;
  boot: Color3;
  bootShadow: Color3;
  leather: Color3;
  leatherDark: Color3;
  steel: Color3;
  steelHighlight: Color3;
  steelShadow: Color3;
  gold: Color3;
  goldHighlight: Color3;
  cape: Color3;
  capeShadow: Color3;
  wood: Color3;
  woodDark: Color3;
  cloth: Color3;
}

export const ADVENTURER_PALETTE: ColorPalette = {
  skin: new Color3(0.82, 0.65, 0.52),
  skinShadow: new Color3(0.68, 0.52, 0.4),
  hair: new Color3(0.35, 0.22, 0.12),
  hairHighlight: new Color3(0.48, 0.32, 0.18),
  eyeWhite: new Color3(0.95, 0.93, 0.9),
  eyeIris: new Color3(0.25, 0.45, 0.55),
  tunic: new Color3(0.28, 0.38, 0.55),
  tunicShadow: new Color3(0.18, 0.26, 0.4),
  tunicTrim: new Color3(0.75, 0.6, 0.25),
  belt: new Color3(0.35, 0.22, 0.1),
  beltBuckle: new Color3(0.85, 0.7, 0.25),
  pants: new Color3(0.22, 0.2, 0.28),
  pantsShadow: new Color3(0.14, 0.12, 0.18),
  boot: new Color3(0.32, 0.2, 0.1),
  bootShadow: new Color3(0.2, 0.12, 0.06),
  leather: new Color3(0.45, 0.28, 0.14),
  leatherDark: new Color3(0.3, 0.18, 0.08),
  steel: new Color3(0.62, 0.65, 0.7),
  steelHighlight: new Color3(0.82, 0.85, 0.9),
  steelShadow: new Color3(0.4, 0.42, 0.48),
  gold: new Color3(0.78, 0.62, 0.18),
  goldHighlight: new Color3(0.92, 0.78, 0.35),
  cape: new Color3(0.55, 0.15, 0.12),
  capeShadow: new Color3(0.35, 0.08, 0.06),
  wood: new Color3(0.42, 0.28, 0.14),
  woodDark: new Color3(0.28, 0.18, 0.08),
  cloth: new Color3(0.5, 0.35, 0.22),
};

export function colorToColor4(c: Color3, alpha = 1): Color4 {
  return new Color4(c.r, c.g, c.b, alpha);
}

export function fillBox(
  voxels: Voxel[],
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  color: Color3,
  hollow = false
): void {
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        if (
          hollow &&
          x > x0 &&
          x < x1 &&
          y > y0 &&
          y < y1 &&
          z > z0 &&
          z < z1
        ) {
          continue;
        }
        voxels.push({ x, y, z, color });
      }
    }
  }
}

export function fillEllipsoid(
  voxels: Voxel[],
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  color: Color3,
  colorFn?: (x: number, y: number, z: number, nx: number, ny: number, nz: number) => Color3
): void {
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  const z0 = Math.floor(cz - rz);
  const z1 = Math.ceil(cz + rz);

  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        const nz = (z - cz) / rz;
        if (nx * nx + ny * ny + nz * nz <= 1) {
          const c = colorFn ? colorFn(x, y, z, nx, ny, nz) : color;
          voxels.push({ x, y, z, color: c });
        }
      }
    }
  }
}

export function mirrorVoxelsX(voxels: Voxel[], centerX: number): Voxel[] {
  const mirrored: Voxel[] = [];
  for (const v of voxels) {
    if (v.x !== centerX) {
      mirrored.push({
        x: Math.round(2 * centerX - v.x),
        y: v.y,
        z: v.z,
        color: v.color,
      });
    }
  }
  return [...voxels, ...mirrored];
}

export type ArmorSlot =
  | 'helmet'
  | 'chest'
  | 'pauldrons'
  | 'gauntlets'
  | 'greaves'
  | 'boots';

export type WeaponType = 'sword' | 'axe' | 'mace' | 'bow' | 'shield' | 'none';

export const ALL_ARMOR_SLOTS: ArmorSlot[] = [
  'helmet',
  'chest',
  'pauldrons',
  'gauntlets',
  'greaves',
  'boots',
];
