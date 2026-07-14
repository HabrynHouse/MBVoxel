import { Vector3 } from '@babylonjs/core';
import { ALL_ARMOR_SLOTS, ArmorSlot, WeaponType } from '../shared/types';
import { CharacterInterface } from '../game/PlayerController';

export class UIManager {
  private onCharacterSwitch: (isVoxel: boolean) => void;
  private onArmorToggle: (slot: ArmorSlot) => void;
  private onWeaponEquip: (weapon: WeaponType) => void;
  private onSpawnEnemy: () => void;
  private onHeal: () => void;

  private btnVoxel: HTMLButtonElement;
  private btnPolygon: HTMLButtonElement;
  private healthText: HTMLElement;
  private healthFill: HTMLElement;
  private killCount: HTMLElement;
  private enemyCount: HTMLElement;

  constructor(callbacks: {
    onCharacterSwitch: (isVoxel: boolean) => void;
    onArmorToggle: (slot: ArmorSlot) => void;
    onWeaponEquip: (weapon: WeaponType) => void;
    onSpawnEnemy: () => void;
    onHeal: () => void;
  }) {
    this.onCharacterSwitch = callbacks.onCharacterSwitch;
    this.onArmorToggle = callbacks.onArmorToggle;
    this.onWeaponEquip = callbacks.onWeaponEquip;
    this.onSpawnEnemy = callbacks.onSpawnEnemy;
    this.onHeal = callbacks.onHeal;

    this.btnVoxel = document.getElementById('btn-voxel') as HTMLButtonElement;
    this.btnPolygon = document.getElementById('btn-polygon') as HTMLButtonElement;
    this.healthText = document.getElementById('health-text')!;
    this.healthFill = document.getElementById('health-fill')!;
    this.killCount = document.getElementById('kill-count')!;
    this.enemyCount = document.getElementById('enemy-count')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.btnVoxel.addEventListener('click', () => {
      this.setCharacterType(true);
      this.onCharacterSwitch(true);
    });

    this.btnPolygon.addEventListener('click', () => {
      this.setCharacterType(false);
      this.onCharacterSwitch(false);
    });

    for (const slot of ALL_ARMOR_SLOTS) {
      const btn = document.getElementById(`armor-${slot}`) as HTMLButtonElement;
      btn.addEventListener('click', () => {
        this.onArmorToggle(slot);
      });
    }

    const weapons: WeaponType[] = ['sword', 'axe', 'mace', 'bow', 'shield', 'none'];
    for (const weapon of weapons) {
      const btn = document.getElementById(`weapon-${weapon}`) as HTMLButtonElement;
      btn.addEventListener('click', () => {
        this.onWeaponEquip(weapon);
      });
    }

    document.getElementById('btn-spawn')!.addEventListener('click', () => {
      this.onSpawnEnemy();
    });

    document.getElementById('btn-heal')!.addEventListener('click', () => {
      this.onHeal();
    });
  }

  setCharacterType(isVoxel: boolean): void {
    this.btnVoxel.classList.toggle('active', isVoxel);
    this.btnPolygon.classList.toggle('active', !isVoxel);
  }

  updateArmorButtons(character: CharacterInterface): void {
    for (const slot of ALL_ARMOR_SLOTS) {
      const btn = document.getElementById(`armor-${slot}`) as HTMLButtonElement;
      btn.classList.toggle('equipped', character.isArmorEquipped(slot));
    }
  }

  updateWeaponButtons(activeWeapon: WeaponType): void {
    const weapons: WeaponType[] = ['sword', 'axe', 'mace', 'bow', 'shield', 'none'];
    for (const weapon of weapons) {
      const btn = document.getElementById(`weapon-${weapon}`) as HTMLButtonElement;
      btn.classList.toggle('equipped', weapon === activeWeapon);
    }
  }

  updateStatus(health: number, maxHealth: number, kills: number, enemies: number): void {
    this.healthText.textContent = `${Math.ceil(health)} / ${maxHealth}`;
    this.healthFill.style.width = `${(health / maxHealth) * 100}%`;
    this.killCount.textContent = String(kills);
    this.enemyCount.textContent = String(enemies);
  }
}

export class InputManager {
  private keys = new Set<string>();
  private attackPressed = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Space') {
        e.preventDefault();
        this.attackPressed = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  getMoveDirection(): Vector3 {
    const dir = Vector3.Zero();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dir.z += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dir.z -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dir.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dir.x += 1;
    return dir;
  }

  isRunning(): boolean {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  consumeAttack(): boolean {
    if (this.attackPressed) {
      this.attackPressed = false;
      return true;
    }
    return false;
  }
}
