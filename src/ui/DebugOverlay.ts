import type { WebGLRenderer } from 'three';

const UPDATE_INTERVAL_SECONDS = 0.5;

export class DebugOverlay {
  private readonly element: HTMLElement;
  private readonly statusElement: HTMLElement;
  private readonly metricsElement: HTMLElement;
  private readonly assetStatusElement: HTMLElement;
  private elapsed = 0;
  private frames = 0;

  constructor(host: HTMLElement) {
    this.element = document.createElement('aside');
    this.element.className = 'debug-overlay';
    this.element.setAttribute('aria-live', 'polite');

    const title = document.createElement('strong');
    title.textContent = 'PHASE 2B.0 · CASHIER WORKSTATION FOUNDATION';

    this.statusElement = document.createElement('span');
    this.statusElement.textContent = 'Renderer starting…';

    this.metricsElement = document.createElement('span');
    this.metricsElement.textContent = 'FPS -- · calls -- · tris --';

    this.assetStatusElement = document.createElement('span');
    this.assetStatusElement.className = 'asset-status';
    this.assetStatusElement.textContent = 'Mega Mart assets loading…';

    const controls = document.createElement('span');
    controls.className = 'control-hint';
    controls.textContent = 'Click store to focus · WASD walk · drag/click to look';

    this.element.append(
      title,
      this.statusElement,
      this.metricsElement,
      this.assetStatusElement,
      controls,
    );
    host.append(this.element);
  }

  update(deltaSeconds: number, renderer: WebGLRenderer): void {
    this.elapsed += deltaSeconds;
    this.frames += 1;
    if (this.elapsed < UPDATE_INTERVAL_SECONDS) return;

    const fps = Math.round(this.frames / this.elapsed);
    const { calls, triangles } = renderer.info.render;
    this.metricsElement.textContent = `FPS ${fps} · calls ${calls} · tris ${triangles}`;
    this.statusElement.textContent = 'Renderer active';
    this.elapsed = 0;
    this.frames = 0;
  }

  setStatus(message: string): void {
    this.statusElement.textContent = message;
  }

  setAssetStatus(message: string, hasError = false): void {
    this.assetStatusElement.textContent = message;
    this.assetStatusElement.classList.toggle('has-error', hasError);
  }

  dispose(): void {
    this.element.remove();
  }
}
