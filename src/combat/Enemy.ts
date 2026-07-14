import {
  Color3,
  Mesh,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { EnemyAnimationController } from '../animation/AnimationController';
import { buildVoxelEnemy } from '../voxel/VoxelCharacter';
import { buildPolygonEnemy } from '../polygon/PolygonCharacter';

let enemyIdCounter = 0;

export class Enemy {
  readonly id: number;
  readonly root: TransformNode;
  readonly isElite: boolean;
  readonly isVoxel: boolean;

  private animator: EnemyAnimationController;
  private health: number;
  private maxHealth: number;
  private moveSpeed: number;
  private attackCooldown = 0;
  private attackRange = 1.8;
  private damage = 8;
  private alive = true;
  private hitFlashTime = 0;
  private mesh: Mesh;

  constructor(
    scene: Scene,
    position: Vector3,
    isVoxel: boolean,
    isElite = false,
    mobileOptimized = false
  ) {
    this.id = enemyIdCounter++;
    this.isElite = isElite;
    this.isVoxel = isVoxel;
    this.maxHealth = isElite ? 80 : 40;
    this.health = this.maxHealth;
    this.moveSpeed = isElite ? 2.5 : 1.8;
    this.damage = isElite ? 15 : 8;

    const name = `enemy_${this.id}`;
    const built = isVoxel
      ? buildVoxelEnemy(scene, name, isElite, mobileOptimized)
      : buildPolygonEnemy(scene, name, isElite);

    this.root = built.root;
    this.mesh = built.mesh;
    this.root.position = position.clone();
    this.root.position.y = 0;

    this.animator = new EnemyAnimationController(this.root);
  }

  update(dt: number, playerPos: Vector3): { attacked: boolean; damage: number } {
    if (!this.alive) return { attacked: false, damage: 0 };

    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= dt;
      if (this.hitFlashTime <= 0 && this.mesh.material) {
        (this.mesh.material as PBRMaterial).emissiveColor = Color3.Black();
      }
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    const toPlayer = playerPos.subtract(this.root.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    if (dist > this.attackRange) {
      toPlayer.normalize();
      this.root.position.x += toPlayer.x * this.moveSpeed * dt;
      this.root.position.z += toPlayer.z * this.moveSpeed * dt;
      this.root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
      this.animator.setState('walk');
    } else if (this.attackCooldown <= 0) {
      this.animator.setState('attack');
      this.attackCooldown = this.isElite ? 1.2 : 1.8;
      return { attacked: true, damage: this.damage };
    } else {
      this.animator.setState('idle');
    }

    this.animator.update(dt);
    return { attacked: false, damage: 0 };
  }

  takeHit(damage: number, knockbackDir: Vector3): boolean {
    if (!this.alive) return false;

    this.health -= damage;
    this.hitFlashTime = 0.15;

    if (this.mesh.material) {
      (this.mesh.material as PBRMaterial).emissiveColor = new Color3(0.8, 0.1, 0.1);
    }

    this.root.position.x += knockbackDir.x * 0.4;
    this.root.position.z += knockbackDir.z * 0.4;

    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  isAlive(): boolean {
    return this.alive;
  }

  getPosition(): Vector3 {
    return this.root.position.clone();
  }

  dispose(): void {
    this.root.dispose();
  }
}

export class EnemyManager {
  private scene: Scene;
  private enemies: Enemy[] = [];
  private isVoxelMode: boolean;
  private mobileOptimized: boolean;

  constructor(scene: Scene, isVoxelMode: boolean, mobileOptimized = false) {
    this.scene = scene;
    this.isVoxelMode = isVoxelMode;
    this.mobileOptimized = mobileOptimized;
  }

  setVoxelMode(isVoxel: boolean): void {
    this.isVoxelMode = isVoxel;
  }

  spawn(position?: Vector3, isElite?: boolean): Enemy {
    const pos =
      position ??
      new Vector3(
        (Math.random() - 0.5) * 30,
        0,
        (Math.random() - 0.5) * 30
      );

    const elite = isElite ?? Math.random() < 0.15;
    const enemy = new Enemy(this.scene, pos, this.isVoxelMode, elite, this.mobileOptimized);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnWave(count: number, center: Vector3, radius: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pos = new Vector3(
        center.x + Math.cos(angle) * radius,
        0,
        center.z + Math.sin(angle) * radius
      );
      this.spawn(pos);
    }
  }

  update(dt: number, playerPos: Vector3): number {
    let totalDamage = 0;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;
      const result = enemy.update(dt, playerPos);
      if (result.attacked) {
        totalDamage += result.damage;
      }
    }

    return totalDamage;
  }

  checkAttackHit(playerPos: Vector3, forward: Vector3, range: number, arc: number): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = range;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      const toEnemy = enemy.getPosition().subtract(playerPos);
      toEnemy.y = 0;
      const dist = toEnemy.length();
      if (dist > range) continue;

      toEnemy.normalize();
      const dot = Vector3.Dot(toEnemy, forward);
      if (dot < arc) continue;

      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }

    return closest;
  }

  removeDead(): number {
    const before = this.enemies.length;
    const dead = this.enemies.filter((e) => !e.isAlive());
    dead.forEach((e) => e.dispose());
    this.enemies = this.enemies.filter((e) => e.isAlive());
    return before - this.enemies.length;
  }

  getActiveCount(): number {
    return this.enemies.filter((e) => e.isAlive()).length;
  }

  clear(): void {
    this.enemies.forEach((e) => e.dispose());
    this.enemies = [];
  }
}
