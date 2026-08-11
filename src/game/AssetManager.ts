import { LoadingManager, type AnimationClip, type Group } from 'three';
import type { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { disposeObject3D } from '../utils/disposeObject3D';

export interface AssetLoadProgress {
  url: string;
  loaded: number;
  total: number;
}

export interface AssetManagerOptions {
  onProgress?: (progress: AssetLoadProgress) => void;
  onError?: (error: AssetLoadError) => void;
}

export interface ModelInstance {
  scene: Group;
  animations: AnimationClip[];
}

export class AssetLoadError extends Error {
  readonly url: string;

  constructor(url: string, cause: unknown) {
    super(`Unable to load 3D asset: ${url}`, { cause });
    this.name = 'AssetLoadError';
    this.url = url;
  }
}

/**
 * Central GLB/GLTF loader and cache.
 *
 * Cloned instances share geometry, materials, and textures with the cached
 * source where possible. That keeps repeated products inexpensive and leaves
 * a clear path to InstancedMesh when product counts justify it.
 */
export class AssetManager {
  private readonly loadingManager = new LoadingManager();
  private loaderPromise: Promise<GLTFLoader> | undefined;
  private readonly requests = new Map<string, Promise<GLTF>>();
  private readonly loadedAssets = new Map<string, GLTF>();
  private generation = 0;

  constructor(private readonly options: AssetManagerOptions = {}) {
    this.loadingManager.onProgress = (url, loaded, total) => {
      this.options.onProgress?.({ url, loaded, total });
    };
  }

  /** Loads once and returns the cached source GLTF on subsequent calls. */
  load(url: string): Promise<GLTF> {
    const assetUrl = url.trim();
    if (!assetUrl) {
      return Promise.reject(new AssetLoadError(url, new Error('Asset URL is empty.')));
    }

    const cached = this.requests.get(assetUrl);
    if (cached) return cached;

    const requestGeneration = this.generation;
    let request!: Promise<GLTF>;

    request = this.getLoader()
      .then((loader) => loader.loadAsync(assetUrl))
      .then((asset) => {
        if (
          this.generation === requestGeneration &&
          this.requests.get(assetUrl) === request
        ) {
          this.loadedAssets.set(assetUrl, asset);
        }
        return asset;
      })
      .catch((cause: unknown) => {
        if (this.requests.get(assetUrl) === request) {
          this.requests.delete(assetUrl);
        }
        const error = new AssetLoadError(assetUrl, cause);
        this.options.onError?.(error);
        throw error;
      });

    this.requests.set(assetUrl, request);
    return request;
  }

  /** Warms the cache without creating scene instances. */
  async preload(urls: readonly string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.load(url)));
  }

  /**
   * Creates a safe hierarchy clone, including skinned meshes, and cloned clips.
   * Consumers own transforms and mixers, but shared GPU assets remain managed
   * by this AssetManager.
   */
  async createInstance(url: string): Promise<ModelInstance> {
    const [asset, { clone }] = await Promise.all([
      this.load(url),
      import('three/addons/utils/SkeletonUtils.js'),
    ]);
    return {
      scene: clone(asset.scene) as Group,
      animations: asset.animations.map((animation) => animation.clone()),
    };
  }

  isCached(url: string): boolean {
    return this.requests.has(url.trim());
  }

  disposeAsset(url: string): void {
    const assetUrl = url.trim();
    this.requests.delete(assetUrl);

    const asset = this.loadedAssets.get(assetUrl);
    if (!asset) return;

    this.loadedAssets.delete(assetUrl);
    this.disposeGltf(asset);
  }

  /** Releases all manager-owned shared GPU resources. */
  disposeAll(): void {
    this.generation += 1;
    this.requests.clear();

    const assets = new Set(this.loadedAssets.values());
    this.loadedAssets.clear();
    for (const asset of assets) this.disposeGltf(asset);
  }

  private getLoader(): Promise<GLTFLoader> {
    this.loaderPromise ??= import('three/addons/loaders/GLTFLoader.js').then(
      ({ GLTFLoader }) => new GLTFLoader(this.loadingManager),
    );
    return this.loaderPromise;
  }

  private disposeGltf(asset: GLTF): void {
    const scenes = asset.scenes.length > 0 ? asset.scenes : [asset.scene];
    for (const scene of scenes) disposeObject3D(scene);
  }
}
