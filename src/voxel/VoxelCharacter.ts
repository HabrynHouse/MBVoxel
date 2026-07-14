import {
  AbstractMesh,
  Mesh,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { buildVoxelMesh } from './VoxelMeshBuilder';
import {
  buildArmoredBootVoxels,
  buildAxeVoxels,
  buildBaseBodyVoxels,
  buildBowVoxels,
  buildChestArmorVoxels,
  buildEnemyVoxels,
  buildGauntletVoxels,
  buildGreaveVoxels,
  buildHelmetVoxels,
  buildMaceVoxels,
  buildPauldronVoxels,
  buildShieldVoxels,
  buildSwordVoxels,
} from './VoxelCharacterParts';
import { ALL_ARMOR_SLOTS, ArmorSlot, WeaponType } from '../shared/types';

function createVoxelMaterial(scene: Scene, name: string): PBRMaterial {
  const mat = new PBRMaterial(name, scene);
  mat.metallic = 0.15;
  mat.roughness = 0.65;
  mat.environmentIntensity = 0.8;
  return mat;
}

export class VoxelCharacter {
  readonly root: TransformNode;
  readonly rig: CharacterRig;

  private scene: Scene;
  private bodyMeshes: Map<string, Mesh> = new Map();
  private armorMeshes: Map<ArmorSlot, Mesh> = new Map();
  private weaponMesh: Mesh | null = null;
  private shieldMesh: Mesh | null = null;
  private equippedArmor: Set<ArmorSlot> = new Set();
  private currentWeapon: WeaponType = 'sword';
  private mobileOptimized: boolean;

  constructor(scene: Scene, name: string, mobileOptimized = false) {
    this.scene = scene;
    this.mobileOptimized = mobileOptimized;
    this.root = new TransformNode(`${name}_root`, scene);
    this.rig = new CharacterRig(scene, `${name}_rig`, this.root);

    this.buildBody();
    this.buildArmor();
    this.equipWeapon('sword');
  }

  private createMesh(name: string, voxels: import('../shared/types').Voxel[]): Mesh {
    return buildVoxelMesh(this.scene, name, voxels, null, this.mobileOptimized);
  }

  private buildBody(): void {
    const parts = buildBaseBodyVoxels();
    const mat = createVoxelMaterial(this.scene, 'voxelBodyMat');

    const partMap: Record<string, keyof typeof parts> = {
      head: 'head',
      torso: 'torso',
      upperArmL: 'leftUpperArm',
      forearmL: 'leftForearm',
      handL: 'leftHand',
      upperLegL: 'leftUpperLeg',
      lowerLegL: 'leftLowerLeg',
      footL: 'leftFoot',
      cape: 'cape',
    };

    for (const [meshName, partKey] of Object.entries(partMap)) {
      const voxels = parts[partKey];
      const mesh = this.createMesh(meshName, voxels);
      mesh.material = mat;
      this.bodyMeshes.set(meshName, mesh);
    }

    // Mirror left parts to right
    this.mirrorPart('upperArmL', 'upperArmR');
    this.mirrorPart('forearmL', 'forearmR');
    this.mirrorPart('handL', 'handR');
    this.mirrorPart('upperLegL', 'upperLegR');
    this.mirrorPart('lowerLegL', 'lowerLegR');
    this.mirrorPart('footL', 'footR');

    this.rig.attachBodyPart('head', this.bodyMeshes.get('head')!);
    this.rig.attachBodyPart('torso', this.bodyMeshes.get('torso')!);
    this.rig.attachBodyPart('cape', this.bodyMeshes.get('cape')!);
    this.rig.attachBodyPart('upperArmL', this.bodyMeshes.get('upperArmL')!);
    this.rig.attachBodyPart('upperArmR', this.bodyMeshes.get('upperArmR')!);
    this.rig.attachBodyPart('forearmL', this.bodyMeshes.get('forearmL')!);
    this.rig.attachBodyPart('forearmR', this.bodyMeshes.get('forearmR')!);
    this.rig.attachBodyPart('handL', this.bodyMeshes.get('handL')!);
    this.rig.attachBodyPart('handR', this.bodyMeshes.get('handR')!);
    this.rig.attachBodyPart('upperLegL', this.bodyMeshes.get('upperLegL')!);
    this.rig.attachBodyPart('upperLegR', this.bodyMeshes.get('upperLegR')!);
    this.rig.attachBodyPart('lowerLegL', this.bodyMeshes.get('lowerLegL')!);
    this.rig.attachBodyPart('lowerLegR', this.bodyMeshes.get('lowerLegR')!);
    this.rig.attachBodyPart('footL', this.bodyMeshes.get('footL')!);
    this.rig.attachBodyPart('footR', this.bodyMeshes.get('footR')!);
  }

  private mirrorPart(leftName: string, rightName: string): void {
    const left = this.bodyMeshes.get(leftName)!;
    const right = left.clone(rightName, null)!;
    right.scaling.x = -1;
    this.bodyMeshes.set(rightName, right as Mesh);
  }

  private buildArmor(): void {
    const mat = createVoxelMaterial(this.scene, 'voxelArmorMat');
    mat.metallic = 0.85;
    mat.roughness = 0.25;

    const builders: Record<ArmorSlot, () => ReturnType<typeof buildHelmetVoxels>> = {
      helmet: buildHelmetVoxels,
      chest: buildChestArmorVoxels,
      pauldrons: buildPauldronVoxels,
      gauntlets: buildGauntletVoxels,
      greaves: buildGreaveVoxels,
      boots: buildArmoredBootVoxels,
    };

    for (const slot of ALL_ARMOR_SLOTS) {
      const mesh = this.createMesh(`armor_${slot}`, builders[slot]());
      mesh.material = mat;
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

    const mat = createVoxelMaterial(this.scene, 'voxelWeaponMat');
    mat.metallic = 0.7;
    mat.roughness = 0.3;

    if (type === 'shield') {
      this.shieldMesh = this.createMesh('shield', buildShieldVoxels());
      this.shieldMesh.material = mat;
      this.rig.attachShield(this.shieldMesh);
      return;
    }

    const builders: Partial<Record<WeaponType, () => ReturnType<typeof buildSwordVoxels>>> = {
      sword: buildSwordVoxels,
      axe: buildAxeVoxels,
      mace: buildMaceVoxels,
      bow: buildBowVoxels,
    };

    const builder = builders[type];
    if (!builder) return;

    this.weaponMesh = this.createMesh(`weapon_${type}`, builder());
    this.weaponMesh.material = mat;
    this.rig.attachWeapon(this.weaponMesh, type);
  }

  getWeaponType(): WeaponType {
    return this.currentWeapon;
  }

  getMeshes(): AbstractMesh[] {
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

export class CharacterRig {
  readonly pelvis: TransformNode;
  readonly torso: TransformNode;
  readonly head: TransformNode;
  readonly upperArmL: TransformNode;
  readonly upperArmR: TransformNode;
  readonly forearmL: TransformNode;
  readonly forearmR: TransformNode;
  readonly handL: TransformNode;
  readonly handR: TransformNode;
  readonly upperLegL: TransformNode;
  readonly upperLegR: TransformNode;
  readonly lowerLegL: TransformNode;
  readonly lowerLegR: TransformNode;
  readonly footL: TransformNode;
  readonly footR: TransformNode;
  readonly weaponAttach: TransformNode;
  readonly shieldAttach: TransformNode;

  constructor(scene: Scene, name: string, parent: TransformNode) {
    this.pelvis = new TransformNode(`${name}_pelvis`, scene);
    this.pelvis.parent = parent;
    this.pelvis.position.y = 0.92;

    this.torso = new TransformNode(`${name}_torso`, scene);
    this.torso.parent = this.pelvis;
    this.torso.position.y = 0.15;

    this.head = new TransformNode(`${name}_head`, scene);
    this.head.parent = this.torso;
    this.head.position.y = 0.55;

    this.upperArmL = new TransformNode(`${name}_upperArmL`, scene);
    this.upperArmL.parent = this.torso;
    this.upperArmL.position.set(-0.22, 0.38, 0);

    this.upperArmR = new TransformNode(`${name}_upperArmR`, scene);
    this.upperArmR.parent = this.torso;
    this.upperArmR.position.set(0.22, 0.38, 0);

    this.forearmL = new TransformNode(`${name}_forearmL`, scene);
    this.forearmL.parent = this.upperArmL;
    this.forearmL.position.y = -0.22;

    this.forearmR = new TransformNode(`${name}_forearmR`, scene);
    this.forearmR.parent = this.upperArmR;
    this.forearmR.position.y = -0.22;

    this.handL = new TransformNode(`${name}_handL`, scene);
    this.handL.parent = this.forearmL;
    this.handL.position.y = -0.22;

    this.handR = new TransformNode(`${name}_handR`, scene);
    this.handR.parent = this.forearmR;
    this.handR.position.y = -0.22;

    this.weaponAttach = new TransformNode(`${name}_weaponAttach`, scene);
    this.weaponAttach.parent = this.handR;
    this.weaponAttach.position.set(0, -0.05, 0.05);

    this.shieldAttach = new TransformNode(`${name}_shieldAttach`, scene);
    this.shieldAttach.parent = this.handL;
    this.shieldAttach.position.set(-0.05, 0, 0.05);

    this.upperLegL = new TransformNode(`${name}_upperLegL`, scene);
    this.upperLegL.parent = this.pelvis;
    this.upperLegL.position.set(-0.1, -0.05, 0);

    this.upperLegR = new TransformNode(`${name}_upperLegR`, scene);
    this.upperLegR.parent = this.pelvis;
    this.upperLegR.position.set(0.1, -0.05, 0);

    this.lowerLegL = new TransformNode(`${name}_lowerLegL`, scene);
    this.lowerLegL.parent = this.upperLegL;
    this.lowerLegL.position.y = -0.42;

    this.lowerLegR = new TransformNode(`${name}_lowerLegR`, scene);
    this.lowerLegR.parent = this.upperLegR;
    this.lowerLegR.position.y = -0.42;

    this.footL = new TransformNode(`${name}_footL`, scene);
    this.footL.parent = this.lowerLegL;
    this.footL.position.y = -0.42;

    this.footR = new TransformNode(`${name}_footR`, scene);
    this.footR.parent = this.lowerLegR;
    this.footR.position.y = -0.42;
  }

  attachBodyPart(name: string, mesh: Mesh): void {
    const node = (this as unknown as Record<string, TransformNode>)[name];
    if (node) {
      mesh.parent = node;
      mesh.position = Vector3.Zero();
    } else if (name === 'cape') {
      mesh.parent = this.torso;
      mesh.position = Vector3.Zero();
    }
  }

  attachArmor(slot: ArmorSlot, mesh: Mesh): void {
    switch (slot) {
      case 'helmet':
        mesh.parent = this.head;
        break;
      case 'chest':
      case 'pauldrons':
        mesh.parent = this.torso;
        break;
      case 'gauntlets':
        mesh.parent = this.torso;
        break;
      case 'greaves':
        mesh.parent = this.pelvis;
        break;
      case 'boots':
        mesh.parent = this.pelvis;
        break;
    }
    mesh.position = Vector3.Zero();
  }

  attachWeapon(mesh: Mesh, type: WeaponType): void {
    mesh.parent = this.weaponAttach;
    mesh.position = Vector3.Zero();
    mesh.rotation = Vector3.Zero();

    switch (type) {
      case 'sword':
        mesh.rotation.z = Math.PI / 2;
        mesh.position.y = -0.3;
        break;
      case 'axe':
        mesh.rotation.z = Math.PI / 2;
        mesh.position.y = -0.15;
        break;
      case 'mace':
        mesh.rotation.z = Math.PI / 2;
        mesh.position.y = -0.2;
        break;
      case 'bow':
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(0, 0.1, 0.1);
        break;
    }
  }

  attachShield(mesh: Mesh): void {
    mesh.parent = this.shieldAttach;
    mesh.position = Vector3.Zero();
    mesh.rotation.y = -Math.PI / 2;
  }

  dispose(): void {
    const nodes = [
      this.pelvis, this.torso, this.head,
      this.upperArmL, this.upperArmR, this.forearmL, this.forearmR,
      this.handL, this.handR, this.upperLegL, this.upperLegR,
      this.lowerLegL, this.lowerLegR, this.footL, this.footR,
      this.weaponAttach, this.shieldAttach,
    ];
    nodes.forEach((n) => n.dispose());
  }
}

export function buildVoxelEnemy(
  scene: Scene,
  name: string,
  isElite: boolean,
  mobileOptimized = false
): {
  mesh: Mesh;
  root: TransformNode;
} {
  const voxels = buildEnemyVoxels(isElite);
  const mat = createVoxelMaterial(scene, 'enemyVoxelMat');
  mat.metallic = 0.2;
  mat.roughness = 0.7;

  const root = new TransformNode(`${name}_root`, scene);
  const mesh = buildVoxelMesh(scene, name, voxels, null, mobileOptimized);
  mesh.material = mat;
  mesh.parent = root;

  return { mesh, root };
}
