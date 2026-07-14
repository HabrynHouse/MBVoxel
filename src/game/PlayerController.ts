import { TransformNode, Vector3 } from '@babylonjs/core';
import { AnimationController } from '../animation/AnimationController';

export class PlayerController {
  readonly root: TransformNode;
  readonly animator: AnimationController;

  private moveSpeed = 3.5;
  private runSpeed = 6;
  private rotationSpeed = 8;
  private velocity = Vector3.Zero();
  private facingAngle = 0;
  private isRunning = false;

  health = 100;
  maxHealth = 100;
  kills = 0;

  constructor(root: TransformNode, animator: AnimationController) {
    this.root = root;
    this.animator = animator;
  }

  setRunning(running: boolean): void {
    this.isRunning = running;
  }

  move(direction: Vector3, dt: number): void {
    if (direction.length() < 0.01) {
      if (this.animator.getState() !== 'attack') {
        this.animator.setState('idle');
      }
      return;
    }

    direction.normalize();

    const speed = this.isRunning ? this.runSpeed : this.moveSpeed;
    this.velocity = direction.scale(speed);

    this.root.position.x += this.velocity.x * dt;
    this.root.position.z += this.velocity.z * dt;

    const targetAngle = Math.atan2(direction.x, direction.z);
    this.facingAngle = lerpAngle(this.facingAngle, targetAngle, this.rotationSpeed * dt);
    this.root.rotation.y = this.facingAngle;

    if (this.animator.getState() !== 'attack') {
      this.animator.setState(this.isRunning ? 'run' : 'walk');
    }
  }

  attack(): boolean {
    if (!this.animator.isAttackFinished()) return false;
    this.animator.setState('attack');
    return true;
  }

  isAttacking(): boolean {
    return this.animator.getState() === 'attack';
  }

  getAttackPhase(): number {
    return this.animator.getAttackHitProgress();
  }

  getPosition(): Vector3 {
    return this.root.position.clone();
  }

  getForward(): Vector3 {
    return new Vector3(
      Math.sin(this.facingAngle),
      0,
      Math.cos(this.facingAngle)
    );
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  update(dt: number): void {
    this.animator.update(dt);
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * Math.min(1, t);
}

export interface CharacterInterface {
  root: TransformNode;
  toggleArmor(slot: import('../shared/types').ArmorSlot): boolean;
  isArmorEquipped(slot: import('../shared/types').ArmorSlot): boolean;
  equipWeapon(type: import('../shared/types').WeaponType): void;
  getWeaponType(): import('../shared/types').WeaponType;
  dispose(): void;
}
