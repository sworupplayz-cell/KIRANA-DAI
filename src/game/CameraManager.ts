import { PerspectiveCamera, TOUCH } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraManager {
  readonly camera = new PerspectiveCamera(55, 1, 0.1, 100);
  private readonly controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.camera.position.set(5.5, 4.5, 7.5);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 0.65, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 14;
    this.controls.minPolarAngle = Math.PI * 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.touches.ONE = TOUCH.ROTATE;
    this.controls.touches.TWO = TOUCH.DOLLY_ROTATE;
    this.controls.update();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(deltaSeconds: number): void {
    this.controls.update(deltaSeconds);
  }

  dispose(): void {
    this.controls.dispose();
  }
}
