import {
  ACESFilmicToneMapping,
  ColorManagement,
  PCFShadowMap,
  SRGBColorSpace,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { PlayerController } from '../player/PlayerController';
import {
  CashierInteractionUI,
  type CashierInteractionState,
} from '../ui/CashierInteractionUI';
import { DebugOverlay } from '../ui/DebugOverlay';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { CashierAssetTestScene } from '../world/CashierAssetTestScene';
import type { CashierInteractionTarget } from '../world/CashierInteractionTarget';
import {
  MegaMartScene,
  type MegaMartSceneStats,
} from '../world/MegaMartScene';
import { AssetManager } from './AssetManager';
import { CameraManager } from './CameraManager';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';

const CASHIER_TRANSITION_SECONDS = 0.7;

export interface GameOptions {
  sceneMode?: 'mega-mart' | 'cashier-test';
}

export interface GameDiagnostics {
  player: ReturnType<PlayerController['getDiagnostics']>;
  input: ReturnType<InputManager['getDiagnostics']>;
  camera: ReturnType<CameraManager['getDiagnostics']>;
  loopRunning: boolean;
  shop: MegaMartSceneStats | null;
  interaction: {
    state: CashierInteractionState;
    promptVisible: boolean;
    distanceToRegister: number;
    transitionProgress: number;
  };
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
  private readonly cashierInteractionUi: CashierInteractionUI;
  private readonly worldScene: MegaMartScene | CashierAssetTestScene;
  private readonly cashierTarget: CashierInteractionTarget;
  private readonly player: PlayerController;
  private readonly timer = new Timer();
  private readonly movement = new Vector2();
  private readonly interactionStartPosition = new Vector3();
  private readonly savedPlayerPosition = new Vector3();
  private readonly cashierPosition = new Vector3();
  private readonly transitionPosition = new Vector3();
  private readonly resizeObserver: ResizeObserver;
  private megaMartStats: MegaMartSceneStats | null = null;
  private interactionState: CashierInteractionState = 'idle';
  private interactionProgress = 0;
  private distanceToRegister = Number.POSITIVE_INFINITY;
  private transitionStartYaw = 0;
  private transitionStartPitch = 0;
  private savedYaw = 0;
  private savedPitch = 0;
  private isRunning = false;
  private resumeAfterContextRestore = false;
  private disposed = false;

  constructor(private readonly host: HTMLElement, options: GameOptions = {}) {
    const sceneMode = options.sceneMode ?? 'mega-mart';
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
    const onProgress = ({ loaded, failed, total, currentLabel }: {
      loaded: number;
      failed: number;
      total: number;
      currentLabel: string;
    }): void => {
      this.debugOverlay.setAssetStatus(
        `${sceneMode === 'cashier-test' ? 'Cashier test' : 'Mega Mart'} ${loaded + failed}/${total} · loading ${currentLabel}`,
        failed > 0,
      );
    };
    this.worldScene = sceneMode === 'cashier-test'
      ? new CashierAssetTestScene(this.sceneManager.scene, this.assets, onProgress)
      : new MegaMartScene(this.sceneManager.scene, this.assets, onProgress);
    this.player = new PlayerController(
      this.worldScene.collisionWorld,
      sceneMode === 'cashier-test' ? [0, 0, 4.6] : undefined,
    );
    this.cashierTarget = this.worldScene.getCashierInteractionTarget();
    this.cashierPosition.fromArray(this.cashierTarget.playerPosition);
    this.cashierInteractionUi = new CashierInteractionUI(
      this.host,
      this.beginCashierInteraction,
      this.exitCashierInteraction,
    );
    this.cameraManager.update(this.player.position);
    void this.loadWorld(sceneMode);

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
      interaction: {
        state: this.interactionState,
        promptVisible: this.cashierInteractionUi.getDiagnostics().promptVisible,
        distanceToRegister: this.distanceToRegister,
        transitionProgress: this.interactionProgress,
      },
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
    this.worldScene.dispose();
    this.cashierInteractionUi.dispose();
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

  private async loadWorld(sceneMode: NonNullable<GameOptions['sceneMode']>): Promise<void> {
    const stats = await this.worldScene.load();
    if (this.disposed) return;
    this.megaMartStats = stats;

    const summary = [
      `${sceneMode === 'cashier-test' ? 'Cashier test' : 'Mega Mart'} ${stats.loaded}/${stats.loaded + stats.failed}`,
      `${stats.departments} zones`,
      `${stats.modelPlacements} placed`,
      `${stats.meshes} meshes`,
      `${stats.textures} textures`,
      `${stats.triangles.toLocaleString()} tris`,
      `${stats.activeMixers} mixers`,
    ].join(' · ');
    this.debugOverlay.setAssetStatus(summary, stats.failed > 0);

    if (stats.errors.length > 0) {
      console.warn(`${sceneMode === 'cashier-test' ? 'Cashier test' : 'Mega Mart'} completed with asset failures.`, stats.errors);
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

    if (this.interactionState === 'idle') {
      this.inputManager.getMovement(this.movement);
      this.player.update(deltaSeconds, this.movement, this.cameraManager.getYaw());
      this.cameraManager.update(this.player.position);
      this.updateInteractionAvailability();
    } else {
      this.updateCashierTransition(deltaSeconds);
    }

    this.renderer.render(this.sceneManager.scene, this.cameraManager.camera);
    this.debugOverlay.update(deltaSeconds, this.renderer);
  };

  private readonly beginCashierInteraction = (): void => {
    if (
      this.interactionState !== 'idle' ||
      this.megaMartStats === null ||
      this.distanceToRegister > this.cashierTarget.activationRadius
    ) {
      return;
    }

    this.interactionState = 'entering';
    this.interactionProgress = 0;
    this.savedPlayerPosition.copy(this.player.position);
    this.interactionStartPosition.copy(this.player.position);
    this.savedYaw = this.cameraManager.getYaw();
    this.savedPitch = this.cameraManager.getPitch();
    this.transitionStartYaw = this.savedYaw;
    this.transitionStartPitch = this.savedPitch;
    this.player.stop();
    this.inputManager.clearMovement();
    this.cameraManager.setLookEnabled(false);
    this.cashierInteractionUi.setState('entering', false);
  };

  private readonly exitCashierInteraction = (): void => {
    if (this.interactionState !== 'entering' && this.interactionState !== 'active') return;
    this.interactionState = 'exiting';
    this.interactionProgress = 0;
    this.interactionStartPosition.copy(this.player.position);
    this.transitionStartYaw = this.cameraManager.getYaw();
    this.transitionStartPitch = this.cameraManager.getPitch();
    this.player.stop();
    this.inputManager.clearMovement();
    this.cashierInteractionUi.setState('exiting', false);
  };

  private updateInteractionAvailability(): void {
    this.distanceToRegister = this.player.position.distanceTo(this.cashierPosition);
    const promptVisible =
      this.megaMartStats !== null &&
      this.distanceToRegister <= this.cashierTarget.activationRadius;
    this.cashierInteractionUi.setState('idle', promptVisible);
  }

  private updateCashierTransition(deltaSeconds: number): void {
    if (this.interactionState === 'active') {
      this.player.setPosition(this.cashierPosition);
      this.cameraManager.setOrientation(this.cashierTarget.yaw, this.cashierTarget.pitch);
      this.cameraManager.update(this.player.position);
      this.distanceToRegister = 0;
      return;
    }

    this.interactionProgress = Math.min(
      1,
      this.interactionProgress + deltaSeconds / CASHIER_TRANSITION_SECONDS,
    );
    const eased = this.interactionProgress * this.interactionProgress * (3 - 2 * this.interactionProgress);
    const isEntering = this.interactionState === 'entering';
    const destination = isEntering ? this.cashierPosition : this.savedPlayerPosition;
    const destinationYaw = isEntering ? this.cashierTarget.yaw : this.savedYaw;
    const destinationPitch = isEntering ? this.cashierTarget.pitch : this.savedPitch;

    this.transitionPosition.lerpVectors(this.interactionStartPosition, destination, eased);
    this.player.setPosition(this.transitionPosition);
    this.cameraManager.setOrientation(
      this.lerpAngle(this.transitionStartYaw, destinationYaw, eased),
      this.transitionStartPitch + (destinationPitch - this.transitionStartPitch) * eased,
    );
    this.cameraManager.update(this.player.position);
    this.distanceToRegister = this.player.position.distanceTo(this.cashierPosition);

    if (this.interactionProgress < 1) return;
    if (isEntering) {
      this.interactionState = 'active';
      this.cashierInteractionUi.setState('active', false);
      return;
    }

    this.interactionState = 'idle';
    this.interactionProgress = 0;
    this.inputManager.clearMovement();
    this.cameraManager.setLookEnabled(true);
    this.updateInteractionAvailability();
  }

  private lerpAngle(start: number, end: number, amount: number): number {
    const difference = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return start + difference * amount;
  }

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
