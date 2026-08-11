import type { WebGLRenderer } from 'three';

const UPDATE_INTERVAL_SECONDS = 0.5;

export class DebugOverlay {
  private readonly element: HTMLElement;
  private readonly statusElement: HTMLElement;
  private readonly metricsElement: HTMLElement;
  private elapsed = 0;
  private frames = 0;

  constructor(host: HTMLElement) {
    this.element = document.createElement('aside');
    this.element.className = 'debug-overlay';
    this.element.setAttribute('aria-live', 'polite');

    const title = document.createElement('strong');
    title.textContent = 'FOUNDATION TEST';

    this.statusElement = document.createElement('span');
    this.statusElement.textContent = 'Renderer starting…';

    this.metricsElement = document.createElement('span');
    this.metricsElement.textContent = 'FPS -- · calls -- · tris --';

    const controls = document.createElement('span');
    controls.className = 'control-hint';
    controls.textContent = 'WASD move · drag orbit · wheel/pinch zoom';

    this.element.append(title, this.statusElement, this.metricsElement, controls);
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

  dispose(): void {
    this.element.remove();
  }
}
