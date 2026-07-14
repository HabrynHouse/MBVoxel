import {
  ArcRotateCamera,
  AbstractMesh,
  Color4,
  Engine,
  Mesh,
  Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import { AnimationController } from '../animation/AnimationController';
import { EnemyManager } from '../combat/Enemy';
import { CharacterInterface, PlayerController } from '../game/PlayerController';
import { PolygonCharacter } from '../polygon/PolygonCharacter';
import { ALL_ARMOR_SLOTS, ArmorSlot, WeaponType } from '../shared/types';
import { InputManager, UIManager } from '../ui/UIManager';
import { VoxelCharacter } from '../voxel/VoxelCharacter';
import { createGround, createSkybox, setupLighting } from '../world/Environment';

const WEAPON_DAMAGE: Record<WeaponType, number> = {
  sword: 25,
  axe: 35,
  mace: 40,
  bow: 20,
  shield: 5,
  none: 10,
};

export class Game {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private shadowGen: ShadowGenerator;

  private voxelCharacter: VoxelCharacter;
  private polygonCharacter: PolygonCharacter;
  private activeCharacter: CharacterInterface;
  private playerController: PlayerController;
  private isVoxelMode = true;

  private enemyManager: EnemyManager;
  private input: InputManager;
  private ui: UIManager;

  private attackHitRegistered = false;
  private armorState: Map<ArmorSlot, boolean> = new Map();
  private weaponState: WeaponType = 'sword';

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.55, 0.68, 0.88, 1);

    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3.2,
      12,
      new Vector3(0, 1, 0),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 25;
    this.camera.wheelPrecision = 20;

    createSkybox(this.scene);
    createGround(this.scene);
    this.shadowGen = setupLighting(this.scene);

    this.voxelCharacter = new VoxelCharacter(this.scene, 'voxel');
    this.polygonCharacter = new PolygonCharacter(this.scene, 'polygon');
    this.polygonCharacter.root.setEnabled(false);

    this.activeCharacter = this.voxelCharacter;
    this.playerController = new PlayerController(
      this.voxelCharacter.root,
      new AnimationController(this.voxelCharacter.rig)
    );

    this.enemyManager = new EnemyManager(this.scene, true);
    this.input = new InputManager();
    this.ui = new UIManager({
      onCharacterSwitch: (isVoxel) => this.switchCharacter(isVoxel),
      onArmorToggle: (slot) => this.toggleArmor(slot),
      onWeaponEquip: (weapon) => this.equipWeapon(weapon),
      onSpawnEnemy: () => this.spawnEnemy(),
      onHeal: () => this.heal(),
    });

    this.addShadows(this.voxelCharacter.getMeshes());
    this.enemyManager.spawnWave(3, new Vector3(0, 0, 0), 12);

    this.ui.updateArmorButtons(this.activeCharacter);
    this.ui.updateWeaponButtons(this.weaponState);

    this.engine.runRenderLoop(() => {
      this.update(this.engine.getDeltaTime() / 1000);
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private addShadows(meshes: AbstractMesh[]): void {
    for (const mesh of meshes) {
      this.shadowGen.addShadowCaster(mesh);
    }
  }

  private switchCharacter(isVoxel: boolean): void {
    if (this.isVoxelMode === isVoxel) return;

    const pos = this.playerController.getPosition();
    const health = this.playerController.health;
    const kills = this.playerController.kills;

    this.isVoxelMode = isVoxel;

    this.voxelCharacter.root.setEnabled(isVoxel);
    this.polygonCharacter.root.setEnabled(!isVoxel);

    if (isVoxel) {
      this.activeCharacter = this.voxelCharacter;
      this.voxelCharacter.root.position = pos;
      this.playerController = new PlayerController(
        this.voxelCharacter.root,
        new AnimationController(this.voxelCharacter.rig)
      );
    } else {
      this.activeCharacter = this.polygonCharacter;
      this.polygonCharacter.root.position = pos;
      this.playerController = new PlayerController(
        this.polygonCharacter.root,
        new AnimationController(this.polygonCharacter.rig)
      );
    }

    this.playerController.health = health;
    this.playerController.kills = kills;

    // Sync armor state
    for (const slot of ALL_ARMOR_SLOTS) {
      const equipped = this.armorState.get(slot) ?? false;
      if (equipped !== this.activeCharacter.isArmorEquipped(slot)) {
        this.activeCharacter.toggleArmor(slot);
      }
    }

    this.activeCharacter.equipWeapon(this.weaponState);
    this.enemyManager.setVoxelMode(isVoxel);
    this.camera.setTarget(new Vector3(pos.x, 1, pos.z));

    this.ui.updateArmorButtons(this.activeCharacter);
    this.ui.updateWeaponButtons(this.weaponState);
  }

  private toggleArmor(slot: ArmorSlot): void {
    const equipped = this.activeCharacter.toggleArmor(slot);
    this.armorState.set(slot, equipped);

    // Keep both characters in sync
    const other = this.isVoxelMode ? this.polygonCharacter : this.voxelCharacter;
    if (other.isArmorEquipped(slot) !== equipped) {
      other.toggleArmor(slot);
    }

    this.ui.updateArmorButtons(this.activeCharacter);
  }

  private equipWeapon(weapon: WeaponType): void {
    this.weaponState = weapon;
    this.activeCharacter.equipWeapon(weapon);
    const other = this.isVoxelMode ? this.polygonCharacter : this.voxelCharacter;
    other.equipWeapon(weapon);
    this.ui.updateWeaponButtons(weapon);
  }

  private spawnEnemy(): void {
    const playerPos = this.playerController.getPosition();
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 8;
    const pos = new Vector3(
      playerPos.x + Math.cos(angle) * dist,
      0,
      playerPos.z + Math.sin(angle) * dist
    );
    const enemy = this.enemyManager.spawn(pos);
    this.addShadows([enemy.root.getChildMeshes()[0] as Mesh]);
  }

  private heal(): void {
    this.playerController.heal(30);
  }

  private update(dt: number): void {
    dt = Math.min(dt, 0.05);

    const moveDir = this.input.getMoveDirection();
    this.playerController.setRunning(this.input.isRunning());
    this.playerController.move(moveDir, dt);

    if (this.input.consumeAttack()) {
      this.playerController.attack();
      this.attackHitRegistered = false;
    }

    // Attack hit detection at mid-swing
    if (
      this.playerController.isAttacking() &&
      !this.attackHitRegistered
    ) {
      const phase = this.playerController.getAttackPhase();
      if (phase >= 0.35 && phase <= 0.65) {
        this.attackHitRegistered = true;
        const playerPos = this.playerController.getPosition();
        const forward = this.playerController.getForward();
        const damage = WEAPON_DAMAGE[this.weaponState];
        const target = this.enemyManager.checkAttackHit(
          playerPos,
          forward,
          this.weaponState === 'bow' ? 8 : 2.5,
          this.weaponState === 'bow' ? 0.5 : 0.2
        );

        if (target) {
          const killed = target.takeHit(damage, forward);
          if (killed) {
            this.playerController.kills++;
          }
        }
      }
    }

    const playerPos = this.playerController.getPosition();
    const damage = this.enemyManager.update(dt, playerPos);
    if (damage > 0) {
      this.playerController.takeDamage(damage);
    }

    const kills = this.enemyManager.removeDead();
    if (kills > 0) {
      // kills tracked via attack
    }

    this.playerController.update(dt);

    // Camera follow
    this.camera.setTarget(
      new Vector3(playerPos.x, 1, playerPos.z)
    );

    // Keep player in bounds
    const bound = 38;
    this.playerController.root.position.x = Math.max(
      -bound,
      Math.min(bound, this.playerController.root.position.x)
    );
    this.playerController.root.position.z = Math.max(
      -bound,
      Math.min(bound, this.playerController.root.position.z)
    );

    this.ui.updateStatus(
      this.playerController.health,
      this.playerController.maxHealth,
      this.playerController.kills,
      this.enemyManager.getActiveCount()
    );
  }
}
