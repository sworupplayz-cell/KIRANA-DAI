import { Vector2 } from 'three';

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

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.reset);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  getMovement(target = new Vector2()): Vector2 {
    const left = this.isAnyPressed('KeyA', 'ArrowLeft') ? 1 : 0;
    const right = this.isAnyPressed('KeyD', 'ArrowRight') ? 1 : 0;
    const forward = this.isAnyPressed('KeyW', 'ArrowUp') ? 1 : 0;
    const backward = this.isAnyPressed('KeyS', 'ArrowDown') ? 1 : 0;

    target.set(right - left, forward - backward).add(this.virtualMovement);
    if (target.lengthSq() > 1) target.normalize();
    return target;
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
