import type { InputManager } from '../game/InputManager';

export class VirtualJoystick {
  private readonly element: HTMLElement;
  private readonly knob: HTMLElement;
  private activePointerId: number | null = null;

  constructor(host: HTMLElement, private readonly input: InputManager) {
    this.element = document.createElement('div');
    this.element.className = 'virtual-joystick';
    this.element.setAttribute('role', 'application');
    this.element.setAttribute('aria-label', 'Movement joystick');

    this.knob = document.createElement('div');
    this.knob.className = 'virtual-joystick__knob';
    this.element.append(this.knob);
    host.append(this.element);

    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('pointermove', this.onPointerMove);
    this.element.addEventListener('pointerup', this.onPointerEnd);
    this.element.addEventListener('pointercancel', this.onPointerEnd);
    this.element.addEventListener('contextmenu', this.preventContextMenu);
  }

  dispose(): void {
    this.input.setVirtualMovement(0, 0);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerup', this.onPointerEnd);
    this.element.removeEventListener('pointercancel', this.onPointerEnd);
    this.element.removeEventListener('contextmenu', this.preventContextMenu);
    this.element.remove();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.activePointerId !== null) return;
    this.activePointerId = event.pointerId;
    this.element.setPointerCapture(event.pointerId);
    this.updateFromPointer(event);
    event.preventDefault();
    event.stopPropagation();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return;
    this.updateFromPointer(event);
    event.preventDefault();
    event.stopPropagation();
  };

  private readonly onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.knob.style.transform = 'translate3d(0, 0, 0)';
    this.input.setVirtualMovement(0, 0);
    event.preventDefault();
    event.stopPropagation();
  };

  private updateFromPointer(event: PointerEvent): void {
    const bounds = this.element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radius = Math.max(1, bounds.width * 0.33);
    let x = (event.clientX - centerX) / radius;
    let y = (event.clientY - centerY) / radius;
    const magnitude = Math.hypot(x, y);

    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    this.knob.style.transform = `translate3d(${x * radius}px, ${y * radius}px, 0)`;
    this.input.setVirtualMovement(x, -y);
  }

  private readonly preventContextMenu = (event: Event): void => {
    event.preventDefault();
  };
}
