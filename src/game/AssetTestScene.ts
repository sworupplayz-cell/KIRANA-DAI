import {
  AnimationMixer,
  Box3,
  Group,
  Mesh,
  Texture,
  Vector3,
  type AnimationAction,
  type AnimationClip,
  type BufferGeometry,
  type Material,
  type Object3D,
  type Scene,
} from 'three';
import type { AssetManager, ModelInstance } from './AssetManager';

interface TestAssetDefinition {
  label: string;
  url: string;
  position: readonly [number, number];
  scale: number;
  baseY?: number;
  rotationY?: number;
  character?: boolean;
}

interface CharacterProbe {
  root: Object3D;
  mixer: AnimationMixer;
  idle: AnimationAction;
  walk: AnimationAction;
  active: AnimationAction;
  elapsed: number;
}

export interface AssetTestProgress {
  loaded: number;
  failed: number;
  total: number;
  currentLabel: string;
}

export interface AssetTestStats {
  loaded: number;
  failed: number;
  meshes: number;
  geometries: number;
  materials: number;
  textures: number;
  triangles: number;
  animatedCharacters: number;
  errors: string[];
}

const PRODUCT_SURFACE_Y = 0.68;

const TEST_ASSETS: readonly TestAssetDefinition[] = [
  // Mini Market: two shelf instances intentionally test cache + cloning.
  { label: 'Mini Market wall', url: '/assets/shop/mini-market/wall.glb', position: [-5.3, -4.7], scale: 2 },
  { label: 'Mini Market corner', url: '/assets/shop/mini-market/wall-corner.glb', position: [-6.7, -4.25], scale: 2 },
  { label: 'Mini Market floor', url: '/assets/shop/mini-market/floor.glb', position: [-5.3, -3.5], scale: 2 },
  { label: 'Shelf boxes A', url: '/assets/shop/mini-market/shelf-boxes.glb', position: [-5.35, -2.55], scale: 2 },
  { label: 'Shelf boxes clone', url: '/assets/shop/mini-market/shelf-boxes.glb', position: [-3.6, -2.55], scale: 2 },
  { label: 'Cash register', url: '/assets/shop/mini-market/cash-register.glb', position: [-2.8, -0.65], scale: 0.9, baseY: 0.91 },

  // Furniture: only a small representative selection.
  { label: 'Open bookcase', url: '/assets/shop/furniture/bookcaseOpen.glb', position: [-7.1, -1.45], scale: 2 },
  { label: 'Counter candidate', url: '/assets/shop/furniture/kitchenBar.glb', position: [-2.8, -0.65], scale: 2.2 },
  { label: 'Product test table', url: '/assets/shop/furniture/table.glb', position: [0, 0.45], scale: 2 },
  { label: 'Chair', url: '/assets/shop/furniture/chair.glb', position: [-1.55, 0.6], scale: 2 },
  { label: 'Cardboard box', url: '/assets/shop/furniture/cardboardBoxClosed.glb', position: [-5.8, 0.25], scale: 2 },

  // Grocery candidates, placed on the real table asset rather than floating.
  { label: 'Can', url: '/assets/products/food-kit/can.glb', position: [-0.58, 0.28], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Small can', url: '/assets/products/food-kit/can-small.glb', position: [-0.2, 0.28], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Carton', url: '/assets/products/food-kit/carton.glb', position: [0.2, 0.28], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Oil bottle', url: '/assets/products/food-kit/bottle-oil.glb', position: [0.58, 0.28], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Ketchup bottle', url: '/assets/products/food-kit/bottle-ketchup.glb', position: [-0.58, 0.65], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Candy bar', url: '/assets/products/food-kit/candy-bar.glb', position: [-0.2, 0.65], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Chocolate', url: '/assets/products/food-kit/chocolate.glb', position: [0.2, 0.65], scale: 0.4, baseY: PRODUCT_SURFACE_Y },
  { label: 'Honey jar', url: '/assets/products/food-kit/honey.glb', position: [0.58, 0.65], scale: 0.4, baseY: PRODUCT_SURFACE_Y },

  // One male and one female, both with idle/walk animation probes.
  { label: 'Male casual character', url: '/assets/characters/male/Casual%20Character.glb', position: [-1.35, 3.4], scale: 1, rotationY: Math.PI, character: true },
  { label: 'Animated woman character', url: '/assets/characters/female/Animated%20Woman.glb', position: [1.25, 3.4], scale: 1, rotationY: Math.PI, character: true },

  // Three modular road samples and two buildings. These root-relative,
  // case-correct URLs are also exercised by the production preview audit.
  { label: 'Straight road', url: '/assets/environment/roads/road-straight.glb', position: [4.7, -0.5], scale: 3.5, baseY: 0.01 },
  { label: 'Road with sidewalk', url: '/assets/environment/roads/road-bend-sidewalk.glb', position: [4.7, -4], scale: 3.5, baseY: 0.01 },
  { label: 'Road crossroad', url: '/assets/environment/roads/road-crossroad.glb', position: [4.7, -7.5], scale: 3.5, baseY: 0.01 },
  { label: 'Building type A', url: '/assets/environment/buildings/building-type-a.glb', position: [8.4, -5.5], scale: 3.5 },
  { label: 'Building type H', url: '/assets/environment/buildings/building-type-h.glb', position: [8.4, -0.8], scale: 3.5 },
];

/** Development-only compatibility gallery for the uploaded real assets. */
export class AssetTestScene {
  private readonly root = new Group();
  private readonly characterProbes: CharacterProbe[] = [];
  private disposed = false;

  constructor(
    scene: Scene,
    private readonly assets: AssetManager,
    private readonly onProgress?: (progress: AssetTestProgress) => void,
  ) {
    this.root.name = 'Phase 1 asset compatibility test';
    scene.add(this.root);
  }

  async load(): Promise<AssetTestStats> {
    let loaded = 0;
    let failed = 0;
    const errors: string[] = [];

    await Promise.all(
      TEST_ASSETS.map(async (definition) => {
        try {
          const instance = await this.assets.createInstance(definition.url);
          if (this.disposed) return;
          this.addInstance(instance, definition);
          loaded += 1;
        } catch (error) {
          failed += 1;
          errors.push(
            `${definition.label}: ${error instanceof Error ? error.message : String(error)}`,
          );
        } finally {
          this.onProgress?.({
            loaded,
            failed,
            total: TEST_ASSETS.length,
            currentLabel: definition.label,
          });
        }
      }),
    );

    return this.collectStats(loaded, failed, errors);
  }

  update(deltaSeconds: number): void {
    for (const probe of this.characterProbes) {
      probe.mixer.update(deltaSeconds);
      probe.elapsed += deltaSeconds;
      if (probe.elapsed < 4) continue;

      probe.elapsed = 0;
      const next = probe.active === probe.idle ? probe.walk : probe.idle;
      probe.active.fadeOut(0.25);
      next.reset().fadeIn(0.25).play();
      probe.active = next;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    for (const probe of this.characterProbes) {
      probe.mixer.stopAllAction();
      probe.mixer.uncacheRoot(probe.root);
    }
    this.characterProbes.length = 0;
    this.root.removeFromParent();
    this.root.clear();
  }

  private addInstance(instance: ModelInstance, definition: TestAssetDefinition): void {
    const model = instance.scene;
    model.name = definition.label;
    model.scale.setScalar(definition.scale);
    model.rotation.y = definition.rotationY ?? 0;
    model.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    model.position.x += definition.position[0] - center.x;
    model.position.y += (definition.baseY ?? 0) - bounds.min.y;
    model.position.z += definition.position[1] - center.z;
    model.updateMatrixWorld(true);
    this.root.add(model);

    if (definition.character) {
      this.addCharacterProbe(model, instance.animations);
    }
  }

  private addCharacterProbe(root: Object3D, clips: readonly AnimationClip[]): void {
    const idleClip = clips.find((clip) => /\|Idle$/i.test(clip.name));
    const walkClip = clips.find((clip) => /\|Walk$/i.test(clip.name));
    if (!idleClip || !walkClip) return;

    const mixer = new AnimationMixer(root);
    const idle = mixer.clipAction(idleClip);
    const walk = mixer.clipAction(walkClip);
    idle.play();
    this.characterProbes.push({ root, mixer, idle, walk, active: idle, elapsed: 0 });
  }

  private collectStats(
    loaded: number,
    failed: number,
    errors: string[],
  ): AssetTestStats {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    let meshes = 0;
    let triangles = 0;

    this.root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      meshes += 1;
      geometries.add(object.geometry);

      const objectMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of objectMaterials) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof Texture) textures.add(value);
        }
      }

      const indexCount = object.geometry.index?.count;
      const positionCount = object.geometry.getAttribute('position')?.count ?? 0;
      triangles += Math.floor((indexCount ?? positionCount) / 3);
    });

    return {
      loaded,
      failed,
      meshes,
      geometries: geometries.size,
      materials: materials.size,
      textures: textures.size,
      triangles,
      animatedCharacters: this.characterProbes.length,
      errors,
    };
  }
}
