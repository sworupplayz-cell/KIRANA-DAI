import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Texture,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
  type Scene,
} from 'three';
import type { AssetManager } from '../game/AssetManager';
import { CollisionWorld } from '../systems/CollisionWorld';
import type { CashierInteractionScene, CashierInteractionTarget } from './CashierInteractionTarget';
import type { MegaMartLoadProgress, MegaMartSceneStats } from './MegaMartScene';

interface TestPlacement {
  label: string;
  url: string;
  position: readonly [number, number, number];
  scale: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}

const TEST_PLACEMENTS: readonly TestPlacement[] = [
  {
    label: 'Imported checkout counter',
    url: '/assets/supermarket/cashier/checkout-counter.glb',
    position: [0, 0, 0],
    scale: [0.76, 0.76, 0.76],
    rotation: [0, Math.PI / 2, 0],
  },
  {
    label: 'Imported cash register',
    url: '/assets/supermarket/cashier/cash-register.glb',
    position: [-0.12, 1.025, 0.31],
    scale: [0.46, 0.46, 0.46],
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    label: 'Imported shopping basket',
    url: '/assets/supermarket/retail/shopping-basket.glb',
    position: [1.45, 0, 0.55],
    scale: [0.82, 0.82, 0.82],
    rotation: [0, 0, 0],
  },
];

/** Isolated first-person scale/collision arrangement for the polished cashier imports. */
export class CashierAssetTestScene implements CashierInteractionScene {
  readonly collisionWorld = new CollisionWorld({ minX: -5.7, maxX: 5.7, minZ: -5.7, maxZ: 5.7 });

  private readonly root = new Group();
  private readonly ownedGeometries = new Set<BufferGeometry>();
  private readonly ownedMaterials = new Set<Material>();
  private disposed = false;
  private modelPlacements = 0;

  constructor(
    scene: Scene,
    private readonly assets: AssetManager,
    private readonly onProgress?: (progress: MegaMartLoadProgress) => void,
  ) {
    this.root.name = 'Phase 2B.1 isolated cashier asset test';
    scene.add(this.root);

    const floorGeometry = new BoxGeometry(12, 0.1, 12);
    const floorMaterial = new MeshStandardMaterial({ color: 0x9aa3a4, roughness: 0.95, metalness: 0 });
    this.ownedGeometries.add(floorGeometry);
    this.ownedMaterials.add(floorMaterial);
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.name = 'Cashier test floor';
    floor.position.y = -0.055;
    floor.receiveShadow = true;
    this.root.add(floor);

    this.collisionWorld.add({
      label: 'Imported checkout counter',
      minX: -0.34,
      maxX: 0.34,
      minZ: -0.87,
      maxZ: 0.87,
    });
  }

  async load(): Promise<MegaMartSceneStats> {
    let loaded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const placement of TEST_PLACEMENTS) {
      try {
        const instance = await this.assets.createInstance(placement.url);
        if (this.disposed) break;
        this.place(instance.scene, placement);
        loaded += 1;
        this.modelPlacements += 1;
      } catch (error) {
        failed += 1;
        errors.push(`${placement.label}: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        this.onProgress?.({
          loaded,
          failed,
          total: TEST_PLACEMENTS.length,
          currentLabel: placement.label,
        });
      }
    }

    return this.collectStats(loaded, failed, errors);
  }

  getCashierInteractionTarget(): CashierInteractionTarget {
    return {
      playerPosition: [-1.02, 0, 0.31],
      yaw: -Math.PI / 2,
      pitch: -0.31,
      activationRadius: 1.25,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.root.removeFromParent();
    this.root.clear();
    for (const geometry of this.ownedGeometries) geometry.dispose();
    for (const material of this.ownedMaterials) material.dispose();
    this.ownedGeometries.clear();
    this.ownedMaterials.clear();
  }

  private place(model: Object3D, placement: TestPlacement): void {
    model.name = placement.label;
    model.scale.fromArray(placement.scale);
    const [rotationX, rotationY, rotationZ] = placement.rotation ?? [0, 0, 0];
    model.rotation.set(rotationX, rotationY, rotationZ);
    model.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    model.position.add(new Vector3(
      placement.position[0] - center.x,
      placement.position[1] - bounds.min.y,
      placement.position[2] - center.z,
    ));
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    model.updateMatrixWorld(true);
    this.root.add(model);
  }

  private collectStats(loaded: number, failed: number, errors: string[]): MegaMartSceneStats {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    let meshes = 0;
    let triangles = 0;

    this.root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      meshes += 1;
      geometries.add(object.geometry);
      const indexCount = object.geometry.index?.count;
      const positionCount = object.geometry.getAttribute('position')?.count ?? 0;
      triangles += Math.floor((indexCount ?? positionCount) / 3);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of objectMaterials) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof Texture) textures.add(value);
        }
      }
    });

    return {
      loaded,
      failed,
      meshes,
      geometries: geometries.size,
      materials: materials.size,
      textures: textures.size,
      triangles,
      modelPlacements: this.modelPlacements,
      activeMixers: 0,
      colliders: this.collisionWorld.getColliderCount(),
      departments: 1,
      errors,
    };
  }
}
