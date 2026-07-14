import { CharacterRig } from '../voxel/VoxelCharacter';

export type AnimState = 'idle' | 'walk' | 'run' | 'attack';

export class AnimationController {
  private rig: CharacterRig;
  private state: AnimState = 'idle';
  private time = 0;
  private attackProgress = 0;
  private attackDuration = 0.45;

  constructor(rig: CharacterRig) {
    this.rig = rig;
  }

  setState(state: AnimState): void {
    if (state === 'attack' && this.state !== 'attack') {
      this.attackProgress = 0;
    }
    this.state = state;
  }

  getState(): AnimState {
    return this.state;
  }

  isAttackFinished(): boolean {
    return this.state !== 'attack' || this.attackProgress >= 1;
  }

  getAttackHitProgress(): number {
    return this.attackProgress;
  }

  update(dt: number): void {
    this.time += dt;

    if (this.state === 'attack') {
      this.attackProgress += dt / this.attackDuration;
      this.applyAttackPose(this.attackProgress);
      if (this.attackProgress >= 1) {
        this.state = 'idle';
        this.resetPose();
      }
      return;
    }

    switch (this.state) {
      case 'walk':
        this.applyWalkCycle(this.time, 4);
        break;
      case 'run':
        this.applyWalkCycle(this.time, 7);
        break;
      default:
        this.applyIdlePose(this.time);
        break;
    }
  }

  private resetPose(): void {
    const r = this.rig;
    r.upperLegL.rotation.x = 0;
    r.upperLegR.rotation.x = 0;
    r.lowerLegL.rotation.x = 0;
    r.lowerLegR.rotation.x = 0;
    r.footL.rotation.x = 0;
    r.footR.rotation.x = 0;
    r.upperArmL.rotation.x = 0;
    r.upperArmR.rotation.x = 0;
    r.forearmL.rotation.x = 0;
    r.forearmR.rotation.x = 0;
    r.torso.rotation.x = 0;
    r.torso.position.y = 0.15;
  }

  private applyIdlePose(time: number): void {
    this.resetPose();
    const breathe = Math.sin(time * 1.5) * 0.008;
    this.rig.torso.position.y = 0.15 + breathe;
    this.rig.head.rotation.y = Math.sin(time * 0.8) * 0.05;
  }

  private applyWalkCycle(time: number, speed: number): void {
    const r = this.rig;
    const t = time * speed;
    const legSwing = Math.sin(t) * 0.55;
    const armSwing = Math.sin(t) * 0.4;

    r.upperLegL.rotation.x = legSwing;
    r.upperLegR.rotation.x = -legSwing;
    r.lowerLegL.rotation.x = Math.max(0, legSwing) * 0.6;
    r.lowerLegR.rotation.x = Math.max(0, -legSwing) * 0.6;
    r.footL.rotation.x = -Math.max(0, legSwing) * 0.3;
    r.footR.rotation.x = -Math.max(0, -legSwing) * 0.3;

    r.upperArmL.rotation.x = -armSwing;
    r.upperArmR.rotation.x = armSwing;
    r.forearmL.rotation.x = -0.15;
    r.forearmR.rotation.x = -0.15;

    const bounce = Math.abs(Math.sin(t)) * 0.02;
    r.torso.position.y = 0.15 + bounce;
    r.torso.rotation.x = 0.04;
  }

  private applyAttackPose(progress: number): void {
    const r = this.rig;
    const swing = Math.sin(progress * Math.PI);

    r.upperArmR.rotation.x = -1.8 * swing;
    r.upperArmR.rotation.z = -0.3 * swing;
    r.forearmR.rotation.x = -0.8 * swing;
    r.upperArmL.rotation.x = 0.3 * swing;
    r.torso.rotation.x = 0.2 * swing;
    r.torso.rotation.y = -0.3 * swing;

    r.upperLegL.rotation.x = 0.15 * swing;
    r.upperLegR.rotation.x = -0.1 * swing;
  }
}

export class EnemyAnimationController {
  private root: import('@babylonjs/core').TransformNode;
  private time = 0;
  private state: AnimState = 'idle';

  constructor(root: import('@babylonjs/core').TransformNode) {
    this.root = root;
  }

  setState(state: AnimState): void {
    this.state = state;
  }

  update(dt: number): void {
    this.time += dt;

    if (this.state === 'walk' || this.state === 'run') {
      const bob = Math.sin(this.time * 6) * 0.03;
      this.root.position.y = bob;
      this.root.rotation.y += Math.sin(this.time * 3) * 0.002;
    } else if (this.state === 'attack') {
      const swing = Math.sin(this.time * 12) * 0.1;
      this.root.rotation.x = swing;
    } else {
      this.root.position.y = Math.sin(this.time * 2) * 0.01;
    }
  }
}
