import {
  ACESFilmicToneMapping,
  Clock,
  ColorManagement,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { DebugOverlay } from '../ui/DebugOverlay';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { AssetManager } from './AssetManager';
import { CameraManager } from './CameraManager';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';

export class Game {
  readonly assets: AssetManager;

  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly sceneManager: SceneManager;
  private readonly cameraManager: CameraManager;
  private readonly inputManager: InputManager;
  private readonly debugOverlay: DebugOverlay;
  private readonly virtualJoystick: VirtualJoystick;
  private readonly clock = new Clock(false);
  private readonly movement = new Vector2();
  private readonly resizeObserver: ResizeObserver;
  private isRunning = false;
  private resumeAfterContextRestore = false;
  private disposed = false;

  constructor(private readonly host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    this.canvas.setAttribute('aria-label', 'Kirana Dai 3D test scene');
    this.host.replaceChildren(this.canvas);

    this.renderer = this.createRenderer(this.canvas);
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(this.canvas);
    this.inputManager = new InputManager();
    this.assets = new AssetManager({
      onError: (error) => console.error(error),
    });
    this.debugOverlay = new DebugOverlay(this.host);
    this.virtualJoystick = new VirtualJoystick(this.host, this.inputManager);

    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  start(): void {
    if (this.isRunning || this.disposed) return;
    this.isRunning = true;
    this.clock.start();
    this.renderer.setAnimationLoop(this.tick);
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
    this.clock.stop();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.virtualJoystick.dispose();
    this.debugOverlay.dispose();
    this.inputManager.dispose();
    this.cameraManager.dispose();
    this.assets.disposeAll();
    this.sceneManager.dispose();
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }

  private createRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
    const isTouchFirst = window.matchMedia('(pointer: coarse)').matches;
    ColorManagement.enabled = true;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: !isTouchFirst,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
    });

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = false;
    return renderer;
  }

  private readonly tick = (): void => {
    const deltaSeconds = Math.min(this.clock.getDelta(), 0.1);
    this.inputManager.getMovement(this.movement);
    this.sceneManager.update(deltaSeconds, this.movement);
    this.cameraManager.update(deltaSeconds);
    this.renderer.render(this.sceneManager.scene, this.cameraManager.camera);
    this.debugOverlay.update(deltaSeconds, this.renderer);
  };

  private readonly resize = (): void => {
    if (this.disposed) return;

    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    const isTouchFirst = window.matchMedia('(pointer: coarse)').matches;
    const pixelRatioLimit = isTouchFirst ? 1.5 : 2;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, pixelRatioLimit),
    );
    this.renderer.setSize(width, height, false);
    this.cameraManager.resize(width, height);
  };

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault();
    this.resumeAfterContextRestore = this.isRunning;
    this.stop();
    this.debugOverlay.setStatus('WebGL context lost — waiting to restore');
  };

  private readonly onContextRestored = (): void => {
    this.debugOverlay.setStatus('WebGL context restored');
    if (this.resumeAfterContextRestore) this.start();
    this.resumeAfterContextRestore = false;
  };
}
