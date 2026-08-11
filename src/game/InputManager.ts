import { Vector2 } from 'three';

export interface InputDiagnostics {
  pressedKeys: string[];
  keyboard: readonly [number, number];
  joystick: readonly [number, number];
  combined: readonly [number, number];
}

const GAME_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
]);

/** Unifies desktop movement keys and UI-provided touch movement. */
export class InputManager {
  private readonly pressed = new Set<string>();
  private readonly virtualMovement = new Vector2();
  private readonly combinedMovement = new Vector2();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.reset);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  getMovement(target = new Vector2()): Vector2 {
    this.readKeyboardMovement(target).add(this.virtualMovement);
    if (target.lengthSq() > 1) target.normalize();
    this.combinedMovement.copy(target);
    return target;
  }

  getDiagnostics(): InputDiagnostics {
    const keyboard = this.readKeyboardMovement(new Vector2());
    return {
      pressedKeys: [...this.pressed].sort(),
      keyboard: [keyboard.x, keyboard.y],
      joystick: [this.virtualMovement.x, this.virtualMovement.y],
      combined: [this.combinedMovement.x, this.combinedMovement.y],
    };
  }

  setVirtualMovement(x: number, forward: number): void {
    this.virtualMovement.set(x, forward);
    if (this.virtualMovement.lengthSq() > 1) this.virtualMovement.normalize();
  }

  isPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.reset);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.reset();
  }

  private readKeyboardMovement(target: Vector2): Vector2 {
    const left = this.isAnyPressed('KeyA', 'ArrowLeft') ? 1 : 0;
    const right = this.isAnyPressed('KeyD', 'ArrowRight') ? 1 : 0;
    const forward = this.isAnyPressed('KeyW', 'ArrowUp') ? 1 : 0;
    const backward = this.isAnyPressed('KeyS', 'ArrowDown') ? 1 : 0;
    return target.set(right - left, forward - backward);
  }

  private isAnyPressed(...codes: string[]): boolean {
    return codes.some((code) => this.pressed.has(code));
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.isTypingTarget(event.target) || !GAME_KEYS.has(event.code)) return;
    this.pressed.add(event.code);
    event.preventDefault();
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.code);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.reset();
  };

  private readonly reset = (): void => {
    this.pressed.clear();
    this.virtualMovement.set(0, 0);
    this.combinedMovement.set(0, 0);
  };

  private isTypingTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    );
  }
}
