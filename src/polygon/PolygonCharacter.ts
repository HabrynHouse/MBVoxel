import {
  Color3,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  TransformNode,
} from '@babylonjs/core';
import { CharacterRig } from '../voxel/VoxelCharacter';
import { ALL_ARMOR_SLOTS, ArmorSlot, WeaponType } from '../shared/types';

interface MaterialSet {
  skin: PBRMaterial;
  hair: PBRMaterial;
  tunic: PBRMaterial;
  pants: PBRMaterial;
  leather: PBRMaterial;
  steel: PBRMaterial;
  gold: PBRMaterial;
  cape: PBRMaterial;
  wood: PBRMaterial;
}

function createMaterials(scene: Scene, prefix: string): MaterialSet {
  const make = (name: string, color: Color3, metallic: number, roughness: number) => {
    const m = new PBRMaterial(`${prefix}_${name}`, scene);
    m.albedoColor = color;
    m.metallic = metallic;
    m.roughness = roughness;
    m.environmentIntensity = 1.0;
    return m;
  };

  return {
    skin: make('skin', new Color3(0.82, 0.65, 0.52), 0, 0.75),
    hair: make('hair', new Color3(0.35, 0.22, 0.12), 0, 0.85),
    tunic: make('tunic', new Color3(0.28, 0.38, 0.55), 0, 0.7),
    pants: make('pants', new Color3(0.22, 0.2, 0.28), 0, 0.8),
    leather: make('leather', new Color3(0.45, 0.28, 0.14), 0, 0.65),
    steel: make('steel', new Color3(0.62, 0.65, 0.7), 0.9, 0.2),
    gold: make('gold', new Color3(0.78, 0.62, 0.18), 1, 0.25),
    cape: make('cape', new Color3(0.55, 0.15, 0.12), 0, 0.85),
    wood: make('wood', new Color3(0.42, 0.28, 0.14), 0, 0.75),
  };
}

function buildHead(scene: Scene, mats: MaterialSet): Mesh {
  const head = MeshBuilder.CreateSphere('polyHead', { diameter: 0.22, segments: 24 }, scene);
  head.scaling.y = 1.15;
  head.material = mats.skin;

  const hair = MeshBuilder.CreateSphere('polyHair', { diameter: 0.24, segments: 16 }, scene);
  hair.scaling.set(1, 0.7, 1.05);
  hair.position.y = 0.04;
  hair.parent = head;
  hair.material = mats.hair;

  const eyeL = MeshBuilder.CreateSphere('eyeL', { diameter: 0.025, segments: 8 }, scene);
  eyeL.position.set(-0.045, 0.01, 0.09);
  eyeL.parent = head;
  const eyeMat = mats.skin.clone('eyeWhite');
  eyeMat.albedoColor = new Color3(0.95, 0.93, 0.9);
  eyeL.material = eyeMat;

  const eyeR = eyeL.clone('eyeR')!;
  eyeR.position.x = 0.045;

  const irisMat = mats.skin.clone('iris');
  irisMat.albedoColor = new Color3(0.25, 0.45, 0.55);
  const irisL = MeshBuilder.CreateSphere('irisL', { diameter: 0.015, segments: 6 }, scene);
  irisL.position.set(-0.045, 0.01, 0.1);
  irisL.parent = head;
  irisL.material = irisMat;
  const irisR = irisL.clone('irisR')!;
  irisR.position.x = 0.045;

  return head;
}

function buildTorso(scene: Scene, mats: MaterialSet): Mesh {
  const torso = MeshBuilder.CreateBox('polyTorso', { width: 0.38, height: 0.48, depth: 0.22 }, scene);
  torso.material = mats.tunic;

  const collar = MeshBuilder.CreateTorus('collar', { diameter: 0.2, thickness: 0.015, tessellation: 16 }, scene);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.22;
  collar.parent = torso;
  const trimMat = mats.gold.clone('trim');
  collar.material = trimMat;

  const belt = MeshBuilder.CreateBox('belt', { width: 0.4, height: 0.05, depth: 0.24 }, scene);
  belt.position.y = -0.18;
  belt.parent = torso;
  belt.material = mats.leather;

  const buckle = MeshBuilder.CreateBox('buckle', { width: 0.06, height: 0.05, depth: 0.03 }, scene);
  buckle.position.set(0, -0.18, 0.13);
  buckle.parent = torso;
  buckle.material = mats.gold;

  return torso;
}

function buildLimb(
  scene: Scene,
  name: string,
  width: number,
  height: number,
  depth: number,
  mat: PBRMaterial
): Mesh {
  const limb = MeshBuilder.CreateCylinder(
    name,
    { height, diameter: width, tessellation: 12, enclose: true },
    scene
  );
  limb.scaling.z = depth / width;
  limb.material = mat;
  return limb;
}

function buildHand(scene: Scene, name: string): Mesh {
  const hand = MeshBuilder.CreateBox(name, { width: 0.07, height: 0.09, depth: 0.07 }, scene);
  return hand;
}

function buildFoot(scene: Scene, name: string, mat: PBRMaterial): Mesh {
  const foot = MeshBuilder.CreateBox(name, { width: 0.1, height: 0.08, depth: 0.18 }, scene);
  foot.material = mat;
  return foot;
}

function buildHelmet(scene: Scene, mats: MaterialSet): Mesh {
  const helmet = MeshBuilder.CreateSphere('polyHelmet', { diameter: 0.28, segments: 20 }, scene);
  helmet.scaling.y = 1.1;
  helmet.material = mats.steel;

  const visor = MeshBuilder.CreateBox('visor', { width: 0.18, height: 0.04, depth: 0.02 }, scene);
  visor.position.set(0, -0.02, 0.12);
  visor.parent = helmet;
  const visorMat = mats.steel.clone('visor');
  visorMat.albedoColor = new Color3(0.1, 0.1, 0.12);
  visor.material = visorMat;

  const crest = MeshBuilder.CreateBox('crest', { width: 0.04, height: 0.12, depth: 0.16 }, scene);
  crest.position.y = 0.12;
  crest.parent = helmet;
  crest.material = mats.gold;

  const trim = MeshBuilder.CreateTorus('helmTrim', { diameter: 0.26, thickness: 0.012, tessellation: 20 }, scene);
  trim.rotation.x = Math.PI / 2;
  trim.position.y = 0.06;
  trim.parent = helmet;
  trim.material = mats.gold;

  return helmet;
}

function buildChestPlate(scene: Scene, mats: MaterialSet): Mesh {
  const chest = MeshBuilder.CreateBox('polyChest', { width: 0.42, height: 0.44, depth: 0.26 }, scene);
  chest.material = mats.steel;

  const crossV = MeshBuilder.CreateBox('crossV', { width: 0.04, height: 0.28, depth: 0.02 }, scene);
  crossV.position.set(0, 0, 0.14);
  crossV.parent = chest;
  crossV.material = mats.gold;

  const crossH = MeshBuilder.CreateBox('crossH', { width: 0.16, height: 0.04, depth: 0.02 }, scene);
  crossH.position.set(0, 0.02, 0.14);
  crossH.parent = chest;
  crossH.material = mats.gold;

  const fauld = MeshBuilder.CreateBox('fauld', { width: 0.44, height: 0.08, depth: 0.28 }, scene);
  fauld.position.y = -0.22;
  fauld.parent = chest;
  const fauldMat = mats.steel.clone('fauld');
  fauldMat.albedoColor = new Color3(0.45, 0.48, 0.52);
  fauld.material = fauldMat;

  return chest;
}

function buildPauldron(scene: Scene, name: string, mats: MaterialSet): Mesh {
  const pauldron = MeshBuilder.CreateSphere(name, { diameter: 0.18, segments: 16 }, scene);
  pauldron.scaling.set(1.2, 0.8, 1);
  pauldron.material = mats.steel;

  const trim = MeshBuilder.CreateTorus(`${name}Trim`, { diameter: 0.16, thickness: 0.01, tessellation: 12 }, scene);
  trim.rotation.x = Math.PI / 2;
  trim.parent = pauldron;
  trim.material = mats.gold;

  return pauldron;
}

function buildGauntlet(scene: Scene, name: string, mats: MaterialSet): Mesh {
  const gauntlet = MeshBuilder.CreateBox(name, { width: 0.09, height: 0.1, depth: 0.09 }, scene);
  gauntlet.material = mats.steel;

  const cuff = MeshBuilder.CreateTorus(`${name}Cuff`, { diameter: 0.1, thickness: 0.012, tessellation: 10 }, scene);
  cuff.rotation.x = Math.PI / 2;
  cuff.position.y = 0.04;
  cuff.parent = gauntlet;
  cuff.material = mats.gold;

  return gauntlet;
}

function buildGreave(scene: Scene, name: string, mats: MaterialSet): Mesh {
  const greave = MeshBuilder.CreateCylinder(name, { height: 0.38, diameter: 0.12, tessellation: 12 }, scene);
  greave.material = mats.steel;

  const knee = MeshBuilder.CreateSphere(`${name}Knee`, { diameter: 0.1, segments: 10 }, scene);
  knee.position.y = 0.12;
  knee.parent = greave;
  knee.material = mats.gold;

  return greave;
}

function buildArmoredBoot(scene: Scene, name: string, mats: MaterialSet): Mesh {
  const boot = MeshBuilder.CreateBox(name, { width: 0.12, height: 0.12, depth: 0.2 }, scene);
  boot.material = mats.steel;

  const toe = MeshBuilder.CreateBox(`${name}Toe`, { width: 0.12, height: 0.06, depth: 0.06 }, scene);
  toe.position.set(0, 0.02, 0.08);
  toe.parent = boot;
  const toeMat = mats.steel.clone(`${name}ToeMat`);
  toeMat.albedoColor = new Color3(0.75, 0.78, 0.82);
  toe.material = toeMat;

  return boot;
}

function buildSword(scene: Scene, mats: MaterialSet): Mesh {
  const blade = MeshBuilder.CreateBox('blade', { width: 0.04, height: 0.72, depth: 0.012 }, scene);
  blade.material = mats.steel;

  const guard = MeshBuilder.CreateBox('guard', { width: 0.22, height: 0.025, depth: 0.04 }, scene);
  guard.position.y = -0.36;
  guard.parent = blade;
  guard.material = mats.gold;

  const grip = MeshBuilder.CreateCylinder('grip', { height: 0.14, diameter: 0.035, tessellation: 8 }, scene);
  grip.position.y = -0.44;
  grip.parent = blade;
  grip.material = mats.leather;

  const pommel = MeshBuilder.CreateSphere('pommel', { diameter: 0.06, segments: 10 }, scene);
  pommel.position.y = -0.52;
  pommel.parent = blade;
  pommel.material = mats.gold;

  return blade;
}

function buildAxe(scene: Scene, mats: MaterialSet): Mesh {
  const handle = MeshBuilder.CreateCylinder('axeHandle', { height: 0.72, diameter: 0.04, tessellation: 8 }, scene);
  handle.material = mats.wood;

  const head = MeshBuilder.CreateBox('axeHead', { width: 0.22, height: 0.12, depth: 0.06 }, scene);
  head.position.set(0.08, 0.3, 0);
  head.parent = handle;
  head.material = mats.steel;

  const blade = MeshBuilder.CreateBox('axeBlade', { width: 0.1, height: 0.14, depth: 0.04 }, scene);
  blade.position.set(0.18, 0.3, 0);
  blade.parent = handle;
  const bladeMat = mats.steel.clone('axeBlade');
  bladeMat.albedoColor = new Color3(0.78, 0.8, 0.85);
  blade.material = bladeMat;

  return handle;
}

function buildMace(scene: Scene, mats: MaterialSet): Mesh {
  const handle = MeshBuilder.CreateCylinder('maceHandle', { height: 0.58, diameter: 0.04, tessellation: 8 }, scene);
  handle.material = mats.wood;

  const head = MeshBuilder.CreateSphere('maceHead', { diameter: 0.16, segments: 12 }, scene);
  head.position.y = 0.34;
  head.parent = handle;
  head.material = mats.steel;

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const spike = MeshBuilder.CreateCylinder(`spike${i}`, { height: 0.05, diameter: 0.015, tessellation: 4 }, scene);
    spike.position.set(Math.cos(angle) * 0.09, 0.34, Math.sin(angle) * 0.09);
    spike.rotation.z = Math.PI / 2;
    spike.rotation.y = angle;
    spike.parent = handle;
    spike.material = mats.steel;
  }

  return handle;
}

function buildBow(scene: Scene, mats: MaterialSet): Mesh {
  const bow = MeshBuilder.CreateTorus('bow', { diameter: 0.7, thickness: 0.025, tessellation: 32 }, scene);
  bow.scaling.y = 1.6;
  bow.rotation.z = Math.PI / 2;
  bow.material = mats.wood;

  const grip = MeshBuilder.CreateBox('bowGrip', { width: 0.04, height: 0.1, depth: 0.04 }, scene);
  grip.material = mats.leather;

  grip.parent = bow;
  return bow;
}

function buildShield(scene: Scene, mats: MaterialSet): Mesh {
  const shield = MeshBuilder.CreateDisc('shield', { radius: 0.28, tessellation: 24 }, scene);
  shield.material = mats.steel;

  const boss = MeshBuilder.CreateSphere('boss', { diameter: 0.08, segments: 10 }, scene);
  boss.position.z = 0.03;
  boss.parent = shield;
  boss.material = mats.gold;

  const emblem = MeshBuilder.CreateBox('emblem', { width: 0.06, height: 0.2, depth: 0.01 }, scene);
  emblem.position.z = 0.02;
  emblem.parent = shield;
  emblem.material = mats.gold;

  const rim = MeshBuilder.CreateTorus('shieldRim', { diameter: 0.54, thickness: 0.015, tessellation: 24 }, scene);
  rim.parent = shield;
  rim.material = mats.gold;

  return shield;
}

export class PolygonCharacter {
  readonly root: TransformNode;
  readonly rig: CharacterRig;

  private scene: Scene;
  private mats: MaterialSet;
  private bodyMeshes: Map<string, Mesh> = new Map();
  private armorMeshes: Map<ArmorSlot, Mesh> = new Map();
  private weaponMesh: Mesh | null = null;
  private shieldMesh: Mesh | null = null;
  private equippedArmor: Set<ArmorSlot> = new Set();
  private currentWeapon: WeaponType = 'sword';

  constructor(scene: Scene, name: string) {
    this.scene = scene;
    this.mats = createMaterials(scene, name);
    this.root = new TransformNode(`${name}_root`, scene);
    this.rig = new CharacterRig(scene, `${name}_rig`, this.root);

    this.buildBody();
    this.buildArmor();
    this.equipWeapon('sword');
  }

  private buildBody(): void {
    const head = buildHead(this.scene, this.mats);
    const torso = buildTorso(this.scene, this.mats);

    const cape = MeshBuilder.CreateBox('cape', { width: 0.5, height: 0.55, depth: 0.04 }, this.scene);
    cape.position.z = -0.14;
    cape.material = this.mats.cape;

    const upperArmL = buildLimb(this.scene, 'upperArmL', 0.1, 0.22, 0.1, this.mats.tunic);
    const upperArmR = buildLimb(this.scene, 'upperArmR', 0.1, 0.22, 0.1, this.mats.tunic);
    const forearmL = buildLimb(this.scene, 'forearmL', 0.08, 0.22, 0.08, this.mats.skin);
    const forearmR = buildLimb(this.scene, 'forearmR', 0.08, 0.22, 0.08, this.mats.skin);
    const handL = buildHand(this.scene, 'handL');
    handL.material = this.mats.skin;
    const handR = buildHand(this.scene, 'handR');
    handR.material = this.mats.skin;

    const upperLegL = buildLimb(this.scene, 'upperLegL', 0.12, 0.38, 0.12, this.mats.pants);
    const upperLegR = buildLimb(this.scene, 'upperLegR', 0.12, 0.38, 0.12, this.mats.pants);
    const lowerLegL = buildLimb(this.scene, 'lowerLegL', 0.1, 0.38, 0.1, this.mats.pants);
    const lowerLegR = buildLimb(this.scene, 'lowerLegR', 0.1, 0.38, 0.1, this.mats.pants);
    const footL = buildFoot(this.scene, 'footL', this.mats.leather);
    const footR = buildFoot(this.scene, 'footR', this.mats.leather);

    const parts: Record<string, Mesh> = {
      head, torso, cape,
      upperArmL, upperArmR, forearmL, forearmR, handL, handR,
      upperLegL, upperLegR, lowerLegL, lowerLegR, footL, footR,
    };

    for (const [name, mesh] of Object.entries(parts)) {
      this.bodyMeshes.set(name, mesh);
      this.rig.attachBodyPart(name, mesh);
    }
  }

  private buildArmor(): void {
    const helmet = buildHelmet(this.scene, this.mats);
    const chest = buildChestPlate(this.scene, this.mats);

    const pauldronL = buildPauldron(this.scene, 'pauldronL', this.mats);
    pauldronL.position.x = -0.24;
    const pauldronR = buildPauldron(this.scene, 'pauldronR', this.mats);
    pauldronR.position.x = 0.24;

    const pauldronGroup = MeshBuilder.CreateBox('pauldronGroup', { size: 0.01 }, this.scene);
    pauldronGroup.isVisible = false;
    pauldronL.parent = pauldronGroup;
    pauldronR.parent = pauldronGroup;

    const gauntletL = buildGauntlet(this.scene, 'gauntletL', this.mats);
    gauntletL.position.set(-0.22, -0.42, 0);
    const gauntletR = buildGauntlet(this.scene, 'gauntletR', this.mats);
    gauntletR.position.set(0.22, -0.42, 0);
    const gauntletGroup = MeshBuilder.CreateBox('gauntletGroup', { size: 0.01 }, this.scene);
    gauntletGroup.isVisible = false;
    gauntletL.parent = gauntletGroup;
    gauntletR.parent = gauntletGroup;

    const greaveL = buildGreave(this.scene, 'greaveL', this.mats);
    greaveL.position.set(-0.1, 0.02, 0);
    const greaveR = buildGreave(this.scene, 'greaveR', this.mats);
    greaveR.position.set(0.1, 0.02, 0);
    const greaveGroup = MeshBuilder.CreateBox('greaveGroup', { size: 0.01 }, this.scene);
    greaveGroup.isVisible = false;
    greaveL.parent = greaveGroup;
    greaveR.parent = greaveGroup;

    const bootL = buildArmoredBoot(this.scene, 'armBootL', this.mats);
    bootL.position.set(-0.1, -0.38, 0.02);
    const bootR = buildArmoredBoot(this.scene, 'armBootR', this.mats);
    bootR.position.set(0.1, -0.38, 0.02);
    const bootGroup = MeshBuilder.CreateBox('bootGroup', { size: 0.01 }, this.scene);
    bootGroup.isVisible = false;
    bootL.parent = bootGroup;
    bootR.parent = bootGroup;

    const armorParts: Record<ArmorSlot, Mesh> = {
      helmet,
      chest,
      pauldrons: pauldronGroup,
      gauntlets: gauntletGroup,
      greaves: greaveGroup,
      boots: bootGroup,
    };

    for (const slot of ALL_ARMOR_SLOTS) {
      const mesh = armorParts[slot];
      mesh.setEnabled(false);
      this.armorMeshes.set(slot, mesh);
      this.rig.attachArmor(slot, mesh);
    }
  }

  toggleArmor(slot: ArmorSlot): boolean {
    const mesh = this.armorMeshes.get(slot);
    if (!mesh) return false;

    if (this.equippedArmor.has(slot)) {
      this.equippedArmor.delete(slot);
      mesh.setEnabled(false);
      return false;
    } else {
      this.equippedArmor.add(slot);
      mesh.setEnabled(true);
      return true;
    }
  }

  isArmorEquipped(slot: ArmorSlot): boolean {
    return this.equippedArmor.has(slot);
  }

  equipWeapon(type: WeaponType): void {
    if (this.weaponMesh) {
      this.weaponMesh.dispose();
      this.weaponMesh = null;
    }
    if (this.shieldMesh) {
      this.shieldMesh.dispose();
      this.shieldMesh = null;
    }

    this.currentWeapon = type;
    if (type === 'none') return;

    if (type === 'shield') {
      this.shieldMesh = buildShield(this.scene, this.mats);
      this.rig.attachShield(this.shieldMesh);
      return;
    }

    const builders: Partial<Record<WeaponType, () => Mesh>> = {
      sword: () => buildSword(this.scene, this.mats),
      axe: () => buildAxe(this.scene, this.mats),
      mace: () => buildMace(this.scene, this.mats),
      bow: () => buildBow(this.scene, this.mats),
    };

    const builder = builders[type];
    if (!builder) return;

    this.weaponMesh = builder();
    this.rig.attachWeapon(this.weaponMesh, type);
  }

  getWeaponType(): WeaponType {
    return this.currentWeapon;
  }

  getMeshes(): Mesh[] {
    return [
      ...this.bodyMeshes.values(),
      ...this.armorMeshes.values(),
      ...(this.weaponMesh ? [this.weaponMesh] : []),
      ...(this.shieldMesh ? [this.shieldMesh] : []),
    ];
  }

  dispose(): void {
    this.getMeshes().forEach((m) => m.dispose());
    this.rig.dispose();
    this.root.dispose();
  }
}

export function buildPolygonEnemy(scene: Scene, name: string, isElite: boolean): {
  mesh: Mesh;
  root: TransformNode;
} {
  const bodyColor = isElite
    ? new Color3(0.5, 0.15, 0.15)
    : new Color3(0.35, 0.12, 0.12);

  const mat = new PBRMaterial(`${name}_mat`, scene);
  mat.albedoColor = bodyColor;
  mat.metallic = 0.3;
  mat.roughness = 0.6;

  const root = new TransformNode(`${name}_root`, scene);

  const torso = MeshBuilder.CreateBox(`${name}_torso`, { width: 0.4, height: 0.5, depth: 0.25 }, scene);
  torso.position.y = 0.95;
  torso.parent = root;
  torso.material = mat;

  const head = MeshBuilder.CreateSphere(`${name}_head`, { diameter: 0.22, segments: 12 }, scene);
  head.position.y = 1.35;
  head.parent = root;
  head.material = mat;

  const eyeMat = mat.clone(`${name}_eye`);
  eyeMat.albedoColor = new Color3(0.9, 0.2, 0.1);
  const eyeL = MeshBuilder.CreateSphere(`${name}_eyeL`, { diameter: 0.03, segments: 6 }, scene);
  eyeL.position.set(-0.05, 1.36, 0.09);
  eyeL.parent = root;
  eyeL.material = eyeMat;
  const eyeR = eyeL.clone(`${name}_eyeR`)!;
  eyeR.position.x = 0.05;

  if (isElite) {
    const helm = MeshBuilder.CreateSphere(`${name}_helm`, { diameter: 0.26, segments: 10 }, scene);
    helm.scaling.y = 1.1;
    helm.position.y = 1.38;
    helm.parent = root;
    const helmMat = mat.clone(`${name}_helmMat`);
    helmMat.albedoColor = new Color3(0.3, 0.3, 0.35);
    helmMat.metallic = 0.8;
    helm.material = helmMat;
  }

  const mesh = torso;
  return { mesh, root };
}
