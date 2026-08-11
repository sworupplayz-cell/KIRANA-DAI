import {
  Box3,
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Quaternion,
  SRGBColorSpace,
  Texture,
  Vector3,
  type BufferGeometry,
  type Material,
  type Scene,
} from 'three';
import type { AssetManager } from '../game/AssetManager';
import { CollisionWorld } from '../systems/CollisionWorld';

interface AssetPlacement {
  position: readonly [number, number, number];
  scale: readonly [number, number, number];
  rotationY?: number;
}

interface AssetTask {
  label: string;
  url: string;
  placements: AssetPlacement[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

interface SignDefinition {
  title: string;
  nepali: string;
  accent: string;
  position: readonly [number, number, number];
  width?: number;
}

export interface MegaMartLoadProgress {
  loaded: number;
  failed: number;
  total: number;
  currentLabel: string;
}

export interface MegaMartSceneStats {
  loaded: number;
  failed: number;
  meshes: number;
  geometries: number;
  materials: number;
  textures: number;
  triangles: number;
  modelPlacements: number;
  activeMixers: number;
  colliders: number;
  departments: number;
  errors: string[];
}

const STORE_WIDTH = 24;
const STORE_DEPTH = 30;
const SHELF_LEVELS = [0.365, 0.94, 1.515] as const;
const PRODUCT_SCALE: readonly [number, number, number] = [0.52, 0.52, 0.52];
const TALL_SHELF_SCALE: readonly [number, number, number] = [2.75, 2.4, 2];

const PRODUCT_DEFINITIONS = [
  ['Provision bags', '/assets/products/food-kit/bag.glb'],
  ['Cans', '/assets/products/food-kit/can.glb'],
  ['Small cans', '/assets/products/food-kit/can-small.glb'],
  ['Cartons', '/assets/products/food-kit/carton.glb'],
  ['Small cartons', '/assets/products/food-kit/carton-small.glb'],
  ['Oil bottles', '/assets/products/food-kit/bottle-oil.glb'],
  ['Honey jars', '/assets/products/food-kit/honey.glb'],
  ['Sauce bottles', '/assets/products/food-kit/bottle-ketchup.glb'],
  ['Candy bars', '/assets/products/food-kit/candy-bar.glb'],
  ['Chocolate', '/assets/products/food-kit/chocolate.glb'],
  ['Cookies', '/assets/products/food-kit/cookie-chocolate.glb'],
  ['Bread', '/assets/products/food-kit/bread.glb'],
  ['Tea cups', '/assets/products/food-kit/cup-tea.glb'],
] as const;

const DEPARTMENT_SIGNS: SignDefinition[] = [
  {
    title: 'HIMAL MEGA MART',
    nepali: 'हिमाल मेगा मार्ट  •  NEPAL',
    accent: '#d29a35',
    position: [0, 3.04, 10.25],
    width: 5.4,
  },
  {
    title: 'KHADYANNA  /  GROCERIES',
    nepali: 'खाद्यान्न',
    accent: '#4f8b5b',
    position: [-7, 2.78, 7.75],
  },
  {
    title: 'PEYA & KHAJA',
    nepali: 'पेय तथा खाजा  /  DRINKS & SNACKS',
    accent: '#327b9d',
    position: [6.5, 2.78, 7.75],
  },
  {
    title: 'GHARAYASI SAMAN',
    nepali: 'घरायसी सामान  /  HOME & DAILY',
    accent: '#ba713b',
    position: [-7, 2.78, -0.45],
  },
  {
    title: 'PUSTAK & STATIONERY',
    nepali: 'पुस्तक तथा स्टेशनरी',
    accent: '#9c4e58',
    position: [3.85, 2.78, -0.45],
  },
  {
    title: 'ELECTRONICS',
    nepali: 'इलेक्ट्रोनिक्स',
    accent: '#596d9d',
    position: [8.55, 2.78, -0.45],
  },
  {
    title: 'BHUKTANI  /  CHECKOUT',
    nepali: 'भुक्तानी',
    accent: '#a04b44',
    position: [6.6, 2.65, 12.65],
  },
  {
    title: 'SEWA KAKSHA',
    nepali: 'सेवा कक्ष  /  CUSTOMER SERVICE',
    accent: '#76508d',
    position: [-8.15, 2.65, 12.65],
  },
  {
    title: 'GODAM  /  WAREHOUSE',
    nepali: 'गोदाम',
    accent: '#4d6f63',
    position: [0, 2.7, -8.66],
  },
  {
    title: 'KARMACHARI  /  STAFF',
    nepali: 'कर्मचारी',
    accent: '#6e665c',
    position: [7.8, 2.7, -8.66],
  },
];

/** The Phase 2 persistent indoor Nepali Mega Mart environment. */
export class MegaMartScene {
  readonly collisionWorld = new CollisionWorld({
    minX: -11.42,
    maxX: 11.42,
    minZ: -14.42,
    maxZ: 14.42,
  });

  private readonly root = new Group();
  private readonly ownedGeometries = new Set<BufferGeometry>();
  private readonly ownedMaterials = new Set<Material>();
  private readonly ownedTextures = new Set<Texture>();
  private disposed = false;
  private modelPlacements = 0;

  constructor(
    scene: Scene,
    private readonly assets: AssetManager,
    private readonly onProgress?: (progress: MegaMartLoadProgress) => void,
  ) {
    this.root.name = 'Phase 2 Nepali Mega Mart';
    scene.add(this.root);
    this.addArchitecture();
    this.addCollisionLayout();
  }

  async load(): Promise<MegaMartSceneStats> {
    const tasks = this.createAssetTasks().filter((task) => task.placements.length > 0);
    let loaded = 0;
    let failed = 0;
    const errors: string[] = [];

    await Promise.all(
      tasks.map(async (task) => {
        try {
          await this.addInstancedAsset(task);
          if (!this.disposed) {
            loaded += 1;
            this.modelPlacements += task.placements.length;
          }
        } catch (error) {
          failed += 1;
          errors.push(
            `${task.label}: ${error instanceof Error ? error.message : String(error)}`,
          );
        } finally {
          this.onProgress?.({
            loaded,
            failed,
            total: tasks.length,
            currentLabel: task.label,
          });
        }
      }),
    );

    return this.collectStats(loaded, failed, errors);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.root.removeFromParent();
    this.root.clear();
    for (const texture of this.ownedTextures) texture.dispose();
    for (const material of this.ownedMaterials) material.dispose();
    for (const geometry of this.ownedGeometries) geometry.dispose();
    this.ownedTextures.clear();
    this.ownedMaterials.clear();
    this.ownedGeometries.clear();
  }

  private createAssetTasks(): AssetTask[] {
    const floorPlacements: AssetPlacement[] = [];
    for (let x = -11; x <= 11; x += 2) {
      for (let z = -14; z <= 14; z += 2) {
        floorPlacements.push({ position: [x, 0, z], scale: [2, 2, 2] });
      }
    }

    const wallPlacements: AssetPlacement[] = [];
    for (let x = -11; x <= 11; x += 2) {
      wallPlacements.push(
        { position: [x, 0, -14.7], scale: [2, 3.55, 1] },
        { position: [x, 0, 14.7], scale: [2, 3.55, 1], rotationY: Math.PI },
      );
    }
    for (let z = -14; z <= 14; z += 2) {
      wallPlacements.push(
        {
          position: [-11.7, 0, z],
          scale: [2, 3.55, 1],
          rotationY: Math.PI / 2,
        },
        {
          position: [11.7, 0, z],
          scale: [2, 3.55, 1],
          rotationY: -Math.PI / 2,
        },
      );
    }

    const cornerPlacements: AssetPlacement[] = [
      { position: [-11.7, 0, -14.7], scale: [1, 3.55, 1] },
      { position: [11.7, 0, -14.7], scale: [1, 3.55, 1], rotationY: -Math.PI / 2 },
      { position: [-11.7, 0, 14.7], scale: [1, 3.55, 1], rotationY: Math.PI / 2 },
      { position: [11.7, 0, 14.7], scale: [1, 3.55, 1], rotationY: Math.PI },
    ];

    const tallShelves: AssetPlacement[] = [];
    for (const aisleX of [-9, -6, -3]) {
      for (const z of [2.15, 3.4, 4.65, 5.9]) {
        tallShelves.push(
          {
            position: [aisleX - 0.28, 0.05, z],
            scale: TALL_SHELF_SCALE,
            rotationY: -Math.PI / 2,
          },
          {
            position: [aisleX + 0.28, 0.05, z],
            scale: TALL_SHELF_SCALE,
            rotationY: Math.PI / 2,
          },
        );
      }
    }
    for (const aisleX of [3.55, 6.35]) {
      for (const z of [2.2, 3.5, 4.8, 6.1]) {
        tallShelves.push(
          {
            position: [aisleX - 0.28, 0.05, z],
            scale: TALL_SHELF_SCALE,
            rotationY: -Math.PI / 2,
          },
          {
            position: [aisleX + 0.28, 0.05, z],
            scale: TALL_SHELF_SCALE,
            rotationY: Math.PI / 2,
          },
        );
      }
    }

    for (const x of [2.75, 4, 5.25]) {
      tallShelves.push({ position: [x, 0.05, -6.85], scale: TALL_SHELF_SCALE });
    }

    for (const x of [-9, -5.8, -2.6, 2.6]) {
      for (const z of [-11.05, -13.2]) {
        tallShelves.push({
          position: [x, 0.05, z],
          scale: [5.6, 2.65, 2],
          rotationY: 0,
        });
      }
    }

    const lowShelves: AssetPlacement[] = [];
    for (const x of [-9, -5.8, -2.6]) {
      for (const z of [-3.1, -6.05]) {
        lowShelves.push({ position: [x, 0.05, z], scale: [5, 2.4, 2] });
      }
    }
    lowShelves.push(
      { position: [3.05, 0.05, -3.05], scale: [5, 2.4, 2] },
      { position: [4.95, 0.05, -3.05], scale: [5, 2.4, 2] },
    );

    const checkoutCounters: AssetPlacement[] = [];
    for (const x of [3, 5.3, 7.6, 9.9]) {
      checkoutCounters.push(
        {
          position: [x, 0.05, 10.25],
          scale: [2.4, 2.4, 2.4],
          rotationY: Math.PI / 2,
        },
        {
          position: [x, 0.05, 11.28],
          scale: [2.4, 2.4, 2.4],
          rotationY: Math.PI / 2,
        },
      );
    }
    for (const x of [-9.25, -8.23, -7.21]) {
      checkoutCounters.push({ position: [x, 0.05, 11.45], scale: [2.4, 2.4, 2.4] });
    }

    const registerPlacements: AssetPlacement[] = [3, 5.3, 7.6, 9.9].map((x) => ({
      position: [x, 1.07, 10.45] as const,
      scale: [0.54, 0.54, 0.54] as const,
      rotationY: Math.PI,
    }));
    registerPlacements.push({
      position: [-8.2, 1.07, 11.42],
      scale: [0.54, 0.54, 0.54],
      rotationY: Math.PI,
    });

    const productPlacements = this.createProductPlacements();
    const productTasks: AssetTask[] = PRODUCT_DEFINITIONS.map(([label, url]) => ({
      label,
      url,
      placements: productPlacements.get(url) ?? [],
      castShadow: false,
    }));

    const homePositions = lowShelves.slice(0, 6).map((placement) => placement.position);
    const blenderPlacements: AssetPlacement[] = [];
    const toasterPlacements: AssetPlacement[] = [];
    const cuttingBoardPlacements: AssetPlacement[] = [];
    const knifeBlockPlacements: AssetPlacement[] = [];
    homePositions.forEach(([x, , z], index) => {
      blenderPlacements.push({ position: [x - 0.48, 1.02, z], scale: [1.45, 1.45, 1.45] });
      toasterPlacements.push({ position: [x + 0.44, 1.02, z], scale: [1.4, 1.4, 1.4] });
      if (index % 2 === 0) {
        cuttingBoardPlacements.push({
          position: [x - 0.5, 0.39, z + 0.25],
          scale: [0.65, 0.65, 0.65],
          rotationY: Math.PI / 2,
        });
        knifeBlockPlacements.push({ position: [x + 0.45, 0.39, z + 0.25], scale: [0.52, 0.52, 0.52] });
      }
    });

    const bookPlacements: AssetPlacement[] = [];
    for (const shelfX of [2.75, 4, 5.25]) {
      SHELF_LEVELS.forEach((y, levelIndex) => {
        for (const offset of [-0.22, 0.22]) {
          bookPlacements.push({
            position: [shelfX + offset, y, -6.56],
            scale: [0.72, 0.72, 0.72],
            rotationY: levelIndex % 2 === 0 ? 0 : 0.08,
          });
        }
      });
    }
    for (const x of [2.55, 3.5, 4.5, 5.45]) {
      bookPlacements.push({ position: [x, 1.02, -3.05], scale: [0.82, 0.82, 0.82] });
    }

    const tablePlacements: AssetPlacement[] = [
      { position: [7.3, 0.05, -2.8], scale: [2.35, 2.35, 2.35] },
      { position: [9.55, 0.05, -4.7], scale: [2.35, 2.35, 2.35] },
      { position: [7.3, 0.05, -6.5], scale: [2.35, 2.35, 2.35] },
    ];

    const closedBoxes: AssetPlacement[] = [];
    const openBoxes: AssetPlacement[] = [];
    const cartonStackZ = [-10.35, -11.25, -12.15, -13.05] as const;
    cartonStackZ.forEach((z, index) => {
      closedBoxes.push(
        {
          position: [4.78, 0.05, z],
          scale: [2.05, 2.05, 2.05],
          rotationY: index % 2 === 0 ? 0.08 : -0.06,
        },
        {
          position: [5.38, 0.05, z],
          scale: [2.05, 2.05, 2.05],
          rotationY: index % 2 === 0 ? -0.06 : 0.08,
        },
        {
          position: [5.08, 0.63, z],
          scale: [2.05, 2.05, 2.05],
          rotationY: index % 2 === 0 ? 0.04 : -0.04,
        },
      );
    });
    for (const shelfX of [-9, -5.8, -2.6, 2.6]) {
      for (const offset of [-0.5, 0.5]) {
        closedBoxes.push({
          position: [shelfX + offset, 0.37, -10.72],
          scale: [1.5, 1.5, 1.5],
        });
      }
    }
    openBoxes.push(
      { position: [4.7, 0.05, -9.75], scale: [2, 2, 2], rotationY: 0.15 },
      { position: [5.4, 0.05, -9.75], scale: [2, 2, 2], rotationY: -0.12 },
      { position: [-10.6, 0.05, -13.7], scale: [2, 2, 2] },
    );

    return [
      {
        label: 'Mega Mart floor tiles',
        url: '/assets/shop/mini-market/floor.glb',
        placements: floorPlacements,
        receiveShadow: true,
      },
      {
        label: 'Mega Mart exterior walls',
        url: '/assets/shop/mini-market/wall.glb',
        placements: wallPlacements,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Mega Mart wall corners',
        url: '/assets/shop/mini-market/wall-corner.glb',
        placements: cornerPlacements,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Tall department shelving',
        url: '/assets/shop/furniture/bookcaseOpen.glb',
        placements: tallShelves,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Low home and book displays',
        url: '/assets/shop/furniture/bookcaseOpenLow.glb',
        placements: lowShelves,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Checkout and service counters',
        url: '/assets/shop/furniture/kitchenBar.glb',
        placements: checkoutCounters,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Cash registers',
        url: '/assets/shop/mini-market/cash-register.glb',
        placements: registerPlacements,
        castShadow: true,
      },
      ...productTasks,
      {
        label: 'Standing drink freezers',
        url: '/assets/shop/mini-market/freezers-standing.glb',
        placements: [2.1, 4.5, 6.9].map((z) => ({
          position: [10.75, 0.05, z] as const,
          scale: [2, 2, 2] as const,
          rotationY: -Math.PI / 2,
        })),
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Chest freezers',
        url: '/assets/shop/mini-market/freezer.glb',
        placements: [
          { position: [8.85, 0.05, 2.1], scale: [2, 2, 2] },
          { position: [8.85, 0.05, 4.2], scale: [2, 2, 2] },
        ],
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Fresh fruit display',
        url: '/assets/shop/mini-market/display-fruit.glb',
        placements: [{ position: [8.8, 0.05, 6.55], scale: [2, 2, 2], rotationY: Math.PI }],
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Bread display',
        url: '/assets/shop/mini-market/display-bread.glb',
        placements: [{ position: [8.75, 0.05, 8.05], scale: [2, 2, 2], rotationY: Math.PI }],
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Shopping carts',
        url: '/assets/shop/mini-market/shopping-cart.glb',
        placements: [
          { position: [-10.15, 0.05, 12.95], scale: [2, 2, 2], rotationY: Math.PI / 2 },
          { position: [-9.35, 0.05, 12.95], scale: [2, 2, 2], rotationY: Math.PI / 2 },
          { position: [-10.15, 0.05, 11.9], scale: [2, 2, 2], rotationY: Math.PI / 2 },
        ],
        castShadow: true,
      },
      {
        label: 'Shopping baskets',
        url: '/assets/shop/mini-market/shopping-basket.glb',
        placements: [
          { position: [-6.45, 0.05, 10.65], scale: [1.5, 1.5, 1.5] },
          { position: [-6.45, 0.38, 10.65], scale: [1.5, 1.5, 1.5], rotationY: 0.12 },
          { position: [-6.45, 0.71, 10.65], scale: [1.5, 1.5, 1.5], rotationY: -0.08 },
        ],
        castShadow: true,
      },
      {
        label: 'Home blenders',
        url: '/assets/shop/furniture/kitchenBlender.glb',
        placements: blenderPlacements,
        castShadow: true,
      },
      {
        label: 'Home toasters',
        url: '/assets/shop/furniture/toaster.glb',
        placements: toasterPlacements,
        castShadow: true,
      },
      {
        label: 'Cutting boards',
        url: '/assets/products/food-kit/cutting-board.glb',
        placements: cuttingBoardPlacements,
      },
      {
        label: 'Knife blocks',
        url: '/assets/products/food-kit/knife-block.glb',
        placements: knifeBlockPlacements,
      },
      {
        label: 'Book stock',
        url: '/assets/shop/furniture/books.glb',
        placements: bookPlacements,
        castShadow: true,
      },
      {
        label: 'Electronics display tables',
        url: '/assets/shop/furniture/table.glb',
        placements: tablePlacements,
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Laptop display',
        url: '/assets/shop/furniture/laptop.glb',
        placements: [{ position: [7.3, 0.84, -2.8], scale: [1.45, 1.45, 1.45], rotationY: Math.PI }],
        castShadow: true,
      },
      {
        label: 'Computer display',
        url: '/assets/shop/furniture/computerScreen.glb',
        placements: [
          { position: [9.55, 0.84, -4.7], scale: [1.65, 1.65, 1.65], rotationY: Math.PI },
          { position: [9.55, 0.89, -12.2], scale: [1.5, 1.5, 1.5], rotationY: Math.PI },
        ],
        castShadow: true,
      },
      {
        label: 'Radio display',
        url: '/assets/shop/furniture/radio.glb',
        placements: [{ position: [7.3, 0.84, -6.5], scale: [1.7, 1.7, 1.7], rotationY: Math.PI }],
        castShadow: true,
      },
      {
        label: 'Speaker display',
        url: '/assets/shop/furniture/speakerSmall.glb',
        placements: [
          { position: [6.85, 0.84, -6.5], scale: [1.5, 1.5, 1.5] },
          { position: [7.75, 0.84, -6.5], scale: [1.5, 1.5, 1.5] },
        ],
        castShadow: true,
      },
      {
        label: 'Warehouse closed cartons',
        url: '/assets/shop/furniture/cardboardBoxClosed.glb',
        placements: closedBoxes,
        castShadow: true,
      },
      {
        label: 'Warehouse open cartons',
        url: '/assets/shop/furniture/cardboardBoxOpen.glb',
        placements: openBoxes,
        castShadow: true,
      },
      {
        label: 'Staff desk',
        url: '/assets/shop/furniture/desk.glb',
        placements: [{ position: [9.55, 0.05, -12.2], scale: [2.2, 2.2, 2.2], rotationY: Math.PI }],
        castShadow: true,
        receiveShadow: true,
      },
      {
        label: 'Staff chair',
        url: '/assets/shop/furniture/chairDesk.glb',
        placements: [{ position: [9.55, 0.05, -11.15], scale: [2, 2, 2], rotationY: Math.PI }],
        castShadow: true,
      },
      {
        label: 'Staff waste bin',
        url: '/assets/shop/furniture/trashcan.glb',
        placements: [{ position: [10.75, 0.05, -13.55], scale: [2, 2, 2] }],
        castShadow: true,
      },
    ];
  }

  private createProductPlacements(): Map<string, AssetPlacement[]> {
    const placements = new Map<string, AssetPlacement[]>();
    for (const [, url] of PRODUCT_DEFINITIONS) placements.set(url, []);

    const addPair = (
      productIndex: number,
      x: number,
      z: number,
      y: number,
      rotationY: number,
    ): void => {
      const url = PRODUCT_DEFINITIONS[productIndex % PRODUCT_DEFINITIONS.length][1];
      const target = placements.get(url);
      if (!target) return;
      for (const zOffset of [-0.22, 0.22]) {
        target.push({
          position: [x, y, z + zOffset],
          scale: PRODUCT_SCALE,
          rotationY,
        });
      }
    };

    [-9, -6, -3].forEach((aisleX, aisleIndex) => {
      [2.15, 3.4, 4.65, 5.9].forEach((z, shelfIndex) => {
        SHELF_LEVELS.forEach((y, levelIndex) => {
          const product = aisleIndex * 5 + shelfIndex * 2 + levelIndex;
          addPair(product % 7, aisleX - 0.57, z, y, -Math.PI / 2);
          addPair((product + 3) % 7, aisleX + 0.57, z, y, Math.PI / 2);
        });
      });
    });

    [3.55, 6.35].forEach((aisleX, aisleIndex) => {
      [2.2, 3.5, 4.8, 6.1].forEach((z, shelfIndex) => {
        SHELF_LEVELS.forEach((y, levelIndex) => {
          const product = 7 + ((aisleIndex * 4 + shelfIndex + levelIndex) % 6);
          addPair(product, aisleX - 0.57, z, y, -Math.PI / 2);
          addPair(7 + ((product - 6) % 6), aisleX + 0.57, z, y, Math.PI / 2);
        });
      });
    });

    return placements;
  }

  private async addInstancedAsset(task: AssetTask): Promise<void> {
    const asset = await this.assets.load(task.url);
    if (this.disposed) return;

    asset.scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(asset.scene);
    const center = bounds.getCenter(new Vector3());
    const normalize = new Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z);
    const translation = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const yAxis = new Vector3(0, 1, 0);
    const placementMatrix = new Matrix4();
    const normalizedSource = new Matrix4();
    const finalMatrix = new Matrix4();

    asset.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const instances = new InstancedMesh(
        object.geometry,
        object.material,
        task.placements.length,
      );
      instances.name = task.label;
      instances.castShadow = task.castShadow ?? false;
      instances.receiveShadow = task.receiveShadow ?? false;
      normalizedSource.multiplyMatrices(normalize, object.matrixWorld);

      task.placements.forEach((placement, index) => {
        translation.fromArray(placement.position);
        scale.fromArray(placement.scale);
        rotation.setFromAxisAngle(yAxis, placement.rotationY ?? 0);
        placementMatrix.compose(translation, rotation, scale);
        finalMatrix.multiplyMatrices(placementMatrix, normalizedSource);
        instances.setMatrixAt(index, finalMatrix);
      });

      instances.instanceMatrix.needsUpdate = true;
      instances.computeBoundingBox();
      instances.computeBoundingSphere();
      this.root.add(instances);
    });
  }

  private addArchitecture(): void {
    const ceiling = new MeshStandardMaterial({
      color: 0xe5dfd1,
      roughness: 0.92,
      metalness: 0,
    });
    const partition = new MeshStandardMaterial({
      color: 0x435f5d,
      roughness: 0.88,
      metalness: 0,
    });
    const staffPartition = new MeshStandardMaterial({
      color: 0x6e6255,
      roughness: 0.9,
      metalness: 0,
    });
    const route = new MeshStandardMaterial({
      color: 0xd3b35f,
      roughness: 0.82,
      metalness: 0,
    });
    const lightPanel = new MeshStandardMaterial({
      color: 0xfff7db,
      emissive: 0xffe9ad,
      emissiveIntensity: 1.5,
      roughness: 0.45,
      metalness: 0,
    });
    this.ownedMaterials.add(ceiling).add(partition).add(staffPartition).add(route).add(lightPanel);

    this.addBox(
      'Mega Mart ceiling',
      [STORE_WIDTH + 0.6, 0.14, STORE_DEPTH + 0.6],
      [0, 3.62, 0],
      ceiling,
      false,
      true,
    );
    this.addBox('Warehouse wall west', [10.7, 3.15, 0.16], [-6.65, 1.58, -8.75], partition, true, true);
    this.addBox('Warehouse wall east', [5.5, 3.15, 0.16], [4.05, 1.58, -8.75], partition, true, true);
    this.addBox('Staff front wall', [3.2, 3.15, 0.16], [10.4, 1.58, -8.75], staffPartition, true, true);
    this.addBox('Warehouse staff divider', [0.16, 3.15, 6.05], [6.2, 1.58, -11.77], staffPartition, true, true);

    this.addBox('Central circulation marker', [0.09, 0.018, 20.8], [0, 0.065, 2], route, false, true);
    for (const z of [8.55, 0, -7.8]) {
      this.addBox(`Cross aisle marker ${z}`, [20.6, 0.018, 0.09], [0, 0.066, z], route, false, true);
    }

    const lightGeometry = new BoxGeometry(3.8, 0.035, 0.5);
    this.ownedGeometries.add(lightGeometry);
    const lightPositions: Array<readonly [number, number, number]> = [];
    for (const x of [-7.5, 0, 7.5]) {
      for (const z of [-12, -7, -2, 3, 8, 13]) {
        lightPositions.push([x, 3.51, z]);
      }
    }
    const lights = new InstancedMesh(lightGeometry, lightPanel, lightPositions.length);
    lights.name = 'Efficient ceiling light panels';
    const matrix = new Matrix4();
    lightPositions.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      lights.setMatrixAt(index, matrix);
    });
    lights.instanceMatrix.needsUpdate = true;
    lights.computeBoundingBox();
    lights.computeBoundingSphere();
    this.root.add(lights);

    for (const [x, z] of [
      [0, 9],
      [0, 1],
      [-4, -11.6],
      [8.8, -11.6],
    ] as const) {
      const light = new PointLight(0xffe7bd, 5.2, 15, 1.8);
      light.name = 'Low-cost Mega Mart fill light';
      light.position.set(x, 3.25, z);
      light.castShadow = false;
      this.root.add(light);
    }

    this.addSignAtlas();
  }

  private addSignAtlas(): void {
    const columns = 3;
    const rows = 4;
    const cellWidth = 512;
    const cellHeight = 256;
    const canvas = document.createElement('canvas');
    canvas.width = cellWidth * columns;
    canvas.height = cellHeight * rows;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    DEPARTMENT_SIGNS.forEach((sign, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = column * cellWidth;
      const y = row * cellHeight;
      context.fillStyle = '#252d31';
      context.fillRect(x, y, cellWidth, cellHeight);
      context.fillStyle = sign.accent;
      context.fillRect(x, y, cellWidth, 30);
      context.strokeStyle = '#eee2c5';
      context.lineWidth = 5;
      context.strokeRect(x + 9, y + 9, cellWidth - 18, cellHeight - 18);
      context.fillStyle = '#fff8e9';
      context.font = index === 0 ? '800 44px system-ui, sans-serif' : '800 32px system-ui, sans-serif';
      context.fillText(sign.title, x + cellWidth / 2, y + 103, cellWidth - 38);
      context.fillStyle = '#e8d5a8';
      context.font = '650 27px "Noto Sans Devanagari", Mangal, system-ui, sans-serif';
      context.fillText(sign.nepali, x + cellWidth / 2, y + 171, cellWidth - 38);
      context.fillStyle = sign.accent;
      context.fillRect(x + 42, y + 218, cellWidth - 84, 8);
    });

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 2;
    this.ownedTextures.add(texture);
    const material = new MeshBasicMaterial({ color: new Color(0xffffff), map: texture });
    this.ownedMaterials.add(material);

    DEPARTMENT_SIGNS.forEach((sign, index) => {
      const geometry = new PlaneGeometry(sign.width ?? 3.65, 0.74);
      const uv = geometry.getAttribute('uv');
      const column = index % columns;
      const row = Math.floor(index / columns);
      const minU = column / columns;
      const maxU = (column + 1) / columns;
      const minV = 1 - (row + 1) / rows;
      const maxV = 1 - row / rows;
      for (let vertex = 0; vertex < uv.count; vertex += 1) {
        uv.setXY(
          vertex,
          minU + uv.getX(vertex) * (maxU - minU),
          minV + uv.getY(vertex) * (maxV - minV),
        );
      }
      uv.needsUpdate = true;
      this.ownedGeometries.add(geometry);
      const mesh = new Mesh(geometry, material);
      mesh.name = `Original sign: ${sign.title}`;
      mesh.position.fromArray(sign.position);
      this.root.add(mesh);
    });
  }

  private addBox(
    name: string,
    size: readonly [number, number, number],
    position: readonly [number, number, number],
    material: Material,
    castShadow: boolean,
    receiveShadow: boolean,
  ): void {
    const geometry = new BoxGeometry(...size);
    this.ownedGeometries.add(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.position.fromArray(position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    this.root.add(mesh);
  }

  private addCollisionLayout(): void {
    const add = (
      label: string,
      minX: number,
      maxX: number,
      minZ: number,
      maxZ: number,
    ): void => this.collisionWorld.add({ label, minX, maxX, minZ, maxZ });

    add('Front store wall', -12, 12, 14.4, 15);
    add('Back store wall', -12, 12, -15, -14.4);
    add('Left store wall', -12, -11.4, -15, 15);
    add('Right store wall', 11.4, 12, -15, 15);

    for (const [index, aisleX] of [-9, -6, -3].entries()) {
      add(`Grocery aisle ${index + 1}`, aisleX - 0.7, aisleX + 0.7, 1.52, 6.53);
    }
    for (const [index, aisleX] of [3.55, 6.35].entries()) {
      add(`Drinks aisle ${index + 1}`, aisleX - 0.7, aisleX + 0.7, 1.55, 6.76);
    }
    add('Standing freezer bank', 10.05, 11.38, 1.25, 7.75);
    add('Chest freezer 1', 8.15, 9.55, 1.45, 2.78);
    add('Chest freezer 2', 8.15, 9.55, 3.55, 4.88);
    add('Fresh display', 8.05, 9.55, 5.88, 7.2);
    add('Bread display', 8.05, 9.55, 7.35, 8.65);

    for (const x of [-9, -5.8, -2.6]) {
      for (const z of [-3.1, -6.05]) {
        add(`Home display ${x}:${z}`, x - 1.08, x + 1.08, z - 0.38, z + 0.38);
      }
    }
    add('Book display island', 2.15, 5.85, -3.45, -2.66);
    add('Book wall shelving', 2.05, 5.95, -7.18, -6.48);

    add('Electronics table 1', 6.25, 8.35, -3.35, -2.25);
    add('Electronics table 2', 8.5, 10.6, -5.25, -4.15);
    add('Electronics table 3', 6.25, 8.35, -7.05, -5.95);

    for (const [index, x] of [3, 5.3, 7.6, 9.9].entries()) {
      add(`Checkout lane ${index + 1}`, x - 0.38, x + 0.38, 9.66, 11.89);
    }
    add('Customer service counter', -9.8, -6.68, 11.04, 11.88);
    add('Shopping carts', -10.78, -8.75, 11.35, 13.65);
    add('Basket stack', -6.82, -6.08, 10.28, 11.02);

    add('Warehouse wall west', -12, -1.3, -8.86, -8.64);
    add('Warehouse wall east', 1.3, 6.8, -8.86, -8.64);
    add('Staff front wall', 8.8, 12, -8.86, -8.64);
    add('Warehouse staff divider', 6.1, 6.3, -15, -8.64);

    for (const x of [-9, -5.8, -2.6, 2.6]) {
      for (const z of [-11.05, -13.2]) {
        add(`Warehouse rack ${x}:${z}`, x - 1.23, x + 1.23, z - 0.37, z + 0.37);
      }
    }
    add('Warehouse cartons', 4.15, 5.95, -13.75, -9.34);
    add('Staff desk', 8.45, 10.65, -12.76, -11.62);
    add('Staff chair', 9.15, 9.95, -11.53, -10.75);
  }

  private collectStats(
    loaded: number,
    failed: number,
    errors: string[],
  ): MegaMartSceneStats {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    let meshes = 0;
    let triangles = 0;

    this.root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      meshes += 1;
      geometries.add(object.geometry);
      const instanceCount = object instanceof InstancedMesh ? object.count : 1;
      const indexCount = object.geometry.index?.count;
      const positionCount = object.geometry.getAttribute('position')?.count ?? 0;
      triangles += Math.floor((indexCount ?? positionCount) / 3) * instanceCount;

      const objectMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
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
      departments: 9,
      errors,
    };
  }
}
