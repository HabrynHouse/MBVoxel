import { Vector3 } from '@babylonjs/core';
import { ALL_ARMOR_SLOTS, ArmorSlot, WeaponType } from '../shared/types';
import { CharacterInterface } from '../game/PlayerController';
import { isMobileDevice } from '../shared/platform';

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
  private menuBackdrop: HTMLElement;
  private menuToggle: HTMLElement;
  private mobileHealthText: HTMLElement;

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
    this.menuBackdrop = document.getElementById('menu-backdrop')!;
    this.menuToggle = document.getElementById('menu-toggle')!;
    this.mobileHealthText = document.getElementById('mobile-health-text')!;

    if (isMobileDevice()) {
      document.body.classList.add('is-mobile');
    }

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

    this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
    this.menuBackdrop.addEventListener('click', () => this.closeMobileMenu());
  }

  private toggleMobileMenu(): void {
    const open = document.body.classList.toggle('menu-open');
    this.menuToggle.setAttribute('aria-expanded', String(open));
  }

  private closeMobileMenu(): void {
    document.body.classList.remove('menu-open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
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
    const healthLabel = `${Math.ceil(health)} / ${maxHealth}`;
    this.healthText.textContent = healthLabel;
    this.mobileHealthText.textContent = healthLabel;
    this.healthFill.style.width = `${(health / maxHealth) * 100}%`;
    this.killCount.textContent = String(kills);
    this.enemyCount.textContent = String(enemies);

    const mobileKills = document.getElementById('kill-count-mobile');
    const mobileEnemies = document.getElementById('enemy-count-mobile');
    if (mobileKills) mobileKills.textContent = String(kills);
    if (mobileEnemies) mobileEnemies.textContent = String(enemies);
  }
}

export class InputManager {
  private keys = new Set<string>();
  private attackPressed = false;
  private touchMove = Vector3.Zero();
  private touchRunning = false;
  private joystickActive = false;
  private joystickOrigin = { x: 0, y: 0 };
  private joystickPointerId: number | null = null;

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

    this.setupTouchControls();
  }

  private setupTouchControls(): void {
    const joystick = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    const attackBtn = document.getElementById('touch-attack');
    const runBtn = document.getElementById('touch-run');

    if (!joystick || !knob || !attackBtn || !runBtn) return;

    const maxRadius = 42;

    const resetJoystick = () => {
      this.joystickActive = false;
      this.joystickPointerId = null;
      this.touchMove = Vector3.Zero();
      knob.style.transform = 'translate(-50%, -50%)';
    };

    joystick.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.joystickActive = true;
      this.joystickPointerId = e.pointerId;
      this.joystickOrigin = { x: e.clientX, y: e.clientY };
      joystick.setPointerCapture(e.pointerId);
    });

    joystick.addEventListener('pointermove', (e) => {
      if (!this.joystickActive || e.pointerId !== this.joystickPointerId) return;
      e.preventDefault();

      const dx = e.clientX - this.joystickOrigin.x;
      const dy = e.clientY - this.joystickOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const offsetX = Math.cos(angle) * clamped;
      const offsetY = Math.sin(angle) * clamped;
      knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

      const normX = offsetX / maxRadius;
      const normY = offsetY / maxRadius;
      this.touchMove.set(normX, 0, -normY);
    });

    const endJoystick = (e: PointerEvent) => {
      if (e.pointerId !== this.joystickPointerId) return;
      resetJoystick();
    };

    joystick.addEventListener('pointerup', endJoystick);
    joystick.addEventListener('pointercancel', endJoystick);

    attackBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.attackPressed = true;
      attackBtn.classList.add('pressed');
    });

    attackBtn.addEventListener('pointerup', () => {
      attackBtn.classList.remove('pressed');
    });

    runBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.touchRunning = !this.touchRunning;
      runBtn.classList.toggle('active', this.touchRunning);
    });
  }

  getMoveDirection(): Vector3 {
    const dir = Vector3.Zero();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dir.z += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dir.z -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dir.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dir.x += 1;

    if (this.touchMove.length() > 0.05) {
      return this.touchMove.clone();
    }

    return dir;
  }

  isRunning(): boolean {
    return (
      this.touchRunning ||
      this.keys.has('ShiftLeft') ||
      this.keys.has('ShiftRight')
    );
  }

  consumeAttack(): boolean {
    if (this.attackPressed) {
      this.attackPressed = false;
      return true;
    }
    return false;
  }
}

export function showError(message: string): void {
  const overlay = document.getElementById('error-overlay');
  const text = document.getElementById('error-message');
  const loading = document.getElementById('loading-overlay');
  if (loading) loading.style.display = 'none';
  if (overlay && text) {
    text.textContent = message;
    overlay.style.display = 'flex';
  }
}

export function hideLoading(): void {
  const loading = document.getElementById('loading-overlay');
  if (loading) loading.style.display = 'none';
}
