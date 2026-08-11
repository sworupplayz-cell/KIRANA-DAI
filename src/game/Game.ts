import {
  ACESFilmicToneMapping,
  ColorManagement,
  PCFShadowMap,
  SRGBColorSpace,
  Timer,
  Vector2,
  WebGLRenderer,
} from 'three';
import { PlayerController } from '../player/PlayerController';
import { DebugOverlay } from '../ui/DebugOverlay';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import {
  MegaMartScene,
  type MegaMartSceneStats,
} from '../world/MegaMartScene';
import { AssetManager } from './AssetManager';
import { CameraManager } from './CameraManager';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';

export interface GameDiagnostics {
  player: ReturnType<PlayerController['getDiagnostics']>;
  input: ReturnType<InputManager['getDiagnostics']>;
  camera: ReturnType<CameraManager['getDiagnostics']>;
  loopRunning: boolean;
  shop: MegaMartSceneStats | null;
  render: {
    calls: number;
    triangles: number;
    textures: number;
    geometries: number;
  };
  canvas: {
    clientWidth: number;
    clientHeight: number;
    bufferWidth: number;
    bufferHeight: number;
  };
}

export class Game {
  readonly assets: AssetManager;

  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly sceneManager: SceneManager;
  private readonly cameraManager: CameraManager;
  private readonly inputManager: InputManager;
  private readonly debugOverlay: DebugOverlay;
  private readonly virtualJoystick: VirtualJoystick;
  private readonly megaMartScene: MegaMartScene;
  private readonly player: PlayerController;
  private readonly timer = new Timer();
  private readonly movement = new Vector2();
  private readonly resizeObserver: ResizeObserver;
  private megaMartStats: MegaMartSceneStats | null = null;
  private isRunning = false;
  private resumeAfterContextRestore = false;
  private disposed = false;

  constructor(private readonly host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('aria-label', 'Walkable Nepali Mega Mart environment');
    this.host.replaceChildren(this.canvas);
    this.timer.connect(document);

    this.renderer = this.createRenderer(this.canvas);
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(this.canvas);
    this.inputManager = new InputManager();
    this.assets = new AssetManager({
      onError: (error) => console.error(error),
    });
    this.debugOverlay = new DebugOverlay(this.host);
    this.virtualJoystick = new VirtualJoystick(this.host, this.inputManager);
    this.megaMartScene = new MegaMartScene(
      this.sceneManager.scene,
      this.assets,
      ({ loaded, failed, total, currentLabel }) => {
        this.debugOverlay.setAssetStatus(
          `Mega Mart ${loaded + failed}/${total} · loading ${currentLabel}`,
          failed > 0,
        );
      },
    );
    this.player = new PlayerController(this.megaMartScene.collisionWorld);
    this.cameraManager.update(this.player.position);
    void this.loadMegaMart();

    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  start(): void {
    if (this.isRunning || this.disposed) return;
    this.isRunning = true;
    this.timer.reset();
    this.renderer.setAnimationLoop(this.tick);
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
  }

  getDiagnostics(): GameDiagnostics {
    return {
      player: this.player.getDiagnostics(),
      input: this.inputManager.getDiagnostics(),
      camera: this.cameraManager.getDiagnostics(),
      loopRunning: this.isRunning,
      shop: this.megaMartStats,
      render: {
        calls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        textures: this.renderer.info.memory.textures,
        geometries: this.renderer.info.memory.geometries,
      },
      canvas: {
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        bufferWidth: this.canvas.width,
        bufferHeight: this.canvas.height,
      },
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.megaMartScene.dispose();
    this.virtualJoystick.dispose();
    this.debugOverlay.dispose();
    this.inputManager.dispose();
    this.cameraManager.dispose();
    this.assets.disposeAll();
    this.sceneManager.dispose();
    this.timer.dispose();
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }

  private async loadMegaMart(): Promise<void> {
    const stats = await this.megaMartScene.load();
    if (this.disposed) return;
    this.megaMartStats = stats;

    const summary = [
      `Mega Mart ${stats.loaded}/${stats.loaded + stats.failed}`,
      `${stats.departments} zones`,
      `${stats.modelPlacements} placed`,
      `${stats.meshes} meshes`,
      `${stats.textures} textures`,
      `${stats.triangles.toLocaleString()} tris`,
      `${stats.activeMixers} mixers`,
    ].join(' · ');
    this.debugOverlay.setAssetStatus(summary, stats.failed > 0);

    if (stats.errors.length > 0) {
      console.warn('Mega Mart completed with asset failures.', stats.errors);
    }
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
    // Keep one restrained shadow pass on desktop; mobile retains the same lighting
    // without the duplicate shadow draw cost.
    renderer.shadowMap.enabled = !isTouchFirst;
    renderer.shadowMap.type = PCFShadowMap;
    return renderer;
  }

  private readonly tick = (time: number): void => {
    this.timer.update(time);
    const deltaSeconds = Math.min(this.timer.getDelta(), 0.1);
    this.inputManager.getMovement(this.movement);
    this.player.update(deltaSeconds, this.movement, this.cameraManager.getYaw());
    this.cameraManager.update(this.player.position);
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
