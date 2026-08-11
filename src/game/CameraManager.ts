import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

const EYE_HEIGHT = 1.64;
const LOOK_LIMIT = Math.PI * 0.43;

export interface CameraDiagnostics {
  eyeHeight: number;
  yaw: number;
  pitch: number;
  pointerLocked: boolean;
}

/** First-person camera with pointer-lock, drag, and touch look controls. */
export class CameraManager {
  readonly camera = new PerspectiveCamera(68, 1, 0.06, 80);
  private yaw = 0;
  private pitch = -0.035;
  private activePointerId: number | null = null;
  private previousPointerX = 0;
  private previousPointerY = 0;
  private dragDistance = 0;
  private ignoreNextLockedMove = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.camera.rotation.order = 'YXZ';
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  getYaw(): number {
    return this.yaw;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(playerPosition: Vector3): void {
    this.camera.position.set(playerPosition.x, EYE_HEIGHT, playerPosition.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  getDiagnostics(): CameraDiagnostics {
    return {
      eyeHeight: EYE_HEIGHT,
      yaw: this.yaw,
      pitch: this.pitch,
      pointerLocked: document.pointerLockElement === this.canvas,
    };
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    if (document.pointerLockElement === this.canvas) void document.exitPointerLock();
  }

  private applyLook(deltaX: number, deltaY: number, sensitivity: number): void {
    this.yaw -= deltaX * sensitivity;
    this.pitch = MathUtils.clamp(
      this.pitch - deltaY * sensitivity,
      -LOOK_LIMIT,
      LOOK_LIMIT,
    );
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0 || this.activePointerId !== null) return;
    this.activePointerId = event.pointerId;
    this.previousPointerX = event.clientX;
    this.previousPointerY = event.clientY;
    this.dragDistance = 0;
    this.canvas.focus({ preventScroll: true });
    this.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (
      event.pointerId !== this.activePointerId ||
      document.pointerLockElement === this.canvas
    ) {
      return;
    }

    const deltaX = event.clientX - this.previousPointerX;
    const deltaY = event.clientY - this.previousPointerY;
    this.previousPointerX = event.clientX;
    this.previousPointerY = event.clientY;
    this.dragDistance += Math.hypot(deltaX, deltaY);
    this.applyLook(deltaX, deltaY, event.pointerType === 'touch' ? 0.0045 : 0.0035);
    event.preventDefault();
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    if (
      event.pointerType === 'mouse' &&
      this.dragDistance < 4 &&
      document.pointerLockElement !== this.canvas
    ) {
      this.ignoreNextLockedMove = true;
      void this.canvas.requestPointerLock();
    }
    event.preventDefault();
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (document.pointerLockElement !== this.canvas) return;
    if (this.ignoreNextLockedMove) {
      this.ignoreNextLockedMove = false;
      return;
    }
    this.applyLook(event.movementX, event.movementY, 0.0021);
  };
}
