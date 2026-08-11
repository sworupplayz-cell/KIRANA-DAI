import {
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AssetManager } from '../game/AssetManager';

interface VerificationAsset {
  name: string;
  url: string;
}

interface AssetMetrics {
  name: string;
  url: string;
  dimensions: readonly [number, number, number];
  displayScale: number;
  meshes: number;
  materials: number;
  textures: number;
  triangles: number;
}

interface VerificationDiagnostics {
  loaded: number;
  failed: number;
  assets: AssetMetrics[];
  errors: string[];
  render: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  canvas: {
    clientWidth: number;
    clientHeight: number;
    bufferWidth: number;
    bufferHeight: number;
  };
}

const ASSET_BATCHES: Record<string, VerificationAsset[]> = {
  representative: [
    { name: 'Cashier', url: '/assets/supermarket/retail/cashier.glb' },
    { name: 'Shopping cart', url: '/assets/supermarket/retail/shopping-cart.glb' },
    { name: 'Shelf marker', url: '/assets/supermarket/retail/shelf-marker.glb' },
    { name: 'Freezer', url: '/assets/supermarket/refrigeration/freezer.glb' },
    { name: 'Door', url: '/assets/supermarket/structure/door.glb' },
    { name: 'Apple', url: '/assets/products/supermarket-pack/apple.glb' },
    { name: 'Bread', url: '/assets/products/supermarket-pack/bread.glb' },
    { name: 'Milk', url: '/assets/products/supermarket-pack/milk.glb' },
  ],
  'infrastructure-extra': [
    { name: 'Freezer 2', url: '/assets/supermarket/refrigeration/freezer-2.glb' },
    { name: 'Shelf marker 2', url: '/assets/supermarket/retail/shelf-marker-2.glb' },
    { name: 'Shelf marker 3', url: '/assets/supermarket/retail/shelf-marker-3.glb' },
    { name: 'Shelf marker 4', url: '/assets/supermarket/retail/shelf-marker-4.glb' },
  ],
  'products-a': [
    { name: 'Banana', url: '/assets/products/supermarket-pack/banana.glb' },
    { name: 'Cheese', url: '/assets/products/supermarket-pack/cheese.glb' },
    { name: 'Chicken leg', url: '/assets/products/supermarket-pack/chicken-leg.glb' },
    { name: 'Chocolate', url: '/assets/products/supermarket-pack/chocolate.glb' },
    { name: 'Coffee', url: '/assets/products/supermarket-pack/coffee.glb' },
    { name: 'Eggs', url: '/assets/products/supermarket-pack/eggs.glb' },
  ],
  'products-b': [
    { name: 'Fish', url: '/assets/products/supermarket-pack/fish.glb' },
    { name: 'Fish 2', url: '/assets/products/supermarket-pack/fish-2.glb' },
    { name: 'Grapes', url: '/assets/products/supermarket-pack/grapes.glb' },
    { name: 'Ice cream', url: '/assets/products/supermarket-pack/ice-cream.glb' },
    { name: 'Juice', url: '/assets/products/supermarket-pack/juice.glb' },
    { name: 'Lettuce', url: '/assets/products/supermarket-pack/lettuce.glb' },
  ],
  'products-c': [
    { name: 'Meat', url: '/assets/products/supermarket-pack/meat.glb' },
    { name: 'Pasta', url: '/assets/products/supermarket-pack/pasta.glb' },
    { name: 'Soap', url: '/assets/products/supermarket-pack/soap.glb' },
    { name: 'Toaster', url: '/assets/products/supermarket-pack/toaster.glb' },
    { name: 'Tomato', url: '/assets/products/supermarket-pack/tomato.glb' },
  ],
};

const requestedBatch = new URLSearchParams(window.location.search).get('batch') ?? 'representative';
const verificationAssets = ASSET_BATCHES[requestedBatch] ?? ASSET_BATCHES.representative;

const hostElement = document.querySelector<HTMLElement>('#verification-app');
if (!hostElement) throw new Error('Missing #verification-app host.');
const host: HTMLElement = hostElement;

const panel = document.createElement('aside');
panel.className = 'verification-panel';
panel.innerHTML = `
  <h1>Supermercado conversion verification</h1>
  <p class="verification-status">Loading representative GLBs through AssetManager…</p>
  <p>Drag to orbit · wheel/pinch to zoom · display scaling is uniform and reported below.</p>
  <div class="asset-grid"></div>
`;
host.append(panel);
const statusElement = panel.querySelector<HTMLElement>('.verification-status');
const assetGridElement = panel.querySelector<HTMLElement>('.asset-grid');
if (!statusElement || !assetGridElement) throw new Error('Unable to create verification UI.');
const status: HTMLElement = statusElement;
const assetGrid: HTMLElement = assetGridElement;

const canvas = document.createElement('canvas');
host.prepend(canvas);
const touchFirst = window.matchMedia('(pointer: coarse)').matches;
const renderer = new WebGLRenderer({
  canvas,
  antialias: !touchFirst,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.outputColorSpace = SRGBColorSpace;

const scene = new Scene();
scene.background = new Color(0x182229);
const camera = new PerspectiveCamera(46, 1, 0.01, 80);
camera.position.set(8.8, 7.4, 11.8);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.minDistance = 4;
controls.maxDistance = 24;
controls.maxPolarAngle = Math.PI * 0.48;
controls.update();

scene.add(new HemisphereLight(0xddebf0, 0x384047, 2.4));
const keyLight = new DirectionalLight(0xffe6bb, 3.1);
keyLight.position.set(6, 10, 7);
scene.add(keyLight);
const grid = new GridHelper(16, 16, 0x6d8190, 0x35444d);
grid.position.y = -0.01;
scene.add(grid);

const pedestalGeometry = new BoxGeometry(2.45, 0.08, 2.25);
const pedestalMaterial = new MeshStandardMaterial({ color: 0x31434d, roughness: 0.9 });
for (const x of [-4.5, -1.5, 1.5, 4.5]) {
  for (const z of [-1.65, 1.65]) {
    const pedestal = new Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(x, 0.03, z);
    scene.add(pedestal);
  }
}

const diagnostics: VerificationDiagnostics = {
  loaded: 0,
  failed: 0,
  assets: [],
  errors: [],
  render: { calls: 0, triangles: 0, geometries: 0, textures: 0 },
  canvas: { clientWidth: 0, clientHeight: 0, bufferWidth: 0, bufferHeight: 0 },
};

const debugWindow = window as Window & {
  __SUPERMARKET_ASSET_DEBUG__?: { getState: () => VerificationDiagnostics };
};
debugWindow.__SUPERMARKET_ASSET_DEBUG__ = { getState: () => structuredClone(diagnostics) };

const assetManager = new AssetManager({
  onError: (error) => console.error(error),
});

function collectMetrics(name: string, url: string, root: Object3D): AssetMetrics {
  const bounds = new Box3().setFromObject(root);
  const dimensions = bounds.getSize(new Vector3());
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  let meshes = 0;
  let triangles = 0;

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    meshes += 1;
    const indexCount = object.geometry.index?.count;
    const positionCount = object.geometry.getAttribute('position')?.count ?? 0;
    triangles += Math.floor((indexCount ?? positionCount) / 3);
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof Texture) textures.add(value);
      }
    }
  });

  return {
    name,
    url,
    dimensions: [dimensions.x, dimensions.y, dimensions.z],
    displayScale: 1,
    meshes,
    materials: materials.size,
    textures: textures.size,
    triangles,
  };
}

async function loadRepresentativeAssets(): Promise<void> {
  await Promise.all(
    verificationAssets.map(async (definition, index) => {
      try {
        const instance = await assetManager.createInstance(definition.url);
        instance.scene.updateMatrixWorld(true);
        const metrics = collectMetrics(definition.name, definition.url, instance.scene);
        const dimensions = new Vector3(...metrics.dimensions);
        const largestHorizontal = Math.max(dimensions.x, dimensions.z, 0.001);
        const scale = Math.min(2.05 / largestHorizontal, 1.72 / Math.max(dimensions.y, 0.001));
        metrics.displayScale = scale;

        instance.scene.scale.setScalar(scale);
        instance.scene.updateMatrixWorld(true);
        const displayBounds = new Box3().setFromObject(instance.scene);
        const displayCenter = displayBounds.getCenter(new Vector3());
        const x = [-4.5, -1.5, 1.5, 4.5][index % 4];
        const z = [-1.65, 1.65][Math.floor(index / 4)];
        instance.scene.position.add(
          new Vector3(x - displayCenter.x, 0.08 - displayBounds.min.y, z - displayCenter.z),
        );
        scene.add(instance.scene);
        diagnostics.assets.push(metrics);
        diagnostics.loaded += 1;
      } catch (error) {
        diagnostics.failed += 1;
        diagnostics.errors.push(
          `${definition.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),
  );

  diagnostics.assets.sort(
    (a, b) => verificationAssets.findIndex((asset) => asset.url === a.url) - verificationAssets.findIndex((asset) => asset.url === b.url),
  );
  status.textContent = `${diagnostics.loaded}/${verificationAssets.length} assets loaded from ${requestedBatch}`;
  status.classList.toggle('has-error', diagnostics.failed > 0);
  assetGrid.replaceChildren(
    ...diagnostics.assets.map((asset) => {
      const item = document.createElement('span');
      const size = asset.dimensions.map((value) => value.toFixed(3)).join('×');
      item.textContent = `${asset.name}: ${asset.triangles.toLocaleString()} tris · ${asset.meshes} mesh · ${asset.materials} mat · ${size} m · display ×${asset.displayScale.toFixed(2)}`;
      return item;
    }),
  );
}

function resize(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchFirst ? 1.5 : 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

let lastTime = performance.now();
let frames = 0;
let elapsed = 0;
function render(time: number): void {
  const delta = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;
  frames += 1;
  elapsed += delta;
  controls.update(delta);
  renderer.render(scene, camera);

  diagnostics.render = {
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
  };
  diagnostics.canvas = {
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
    bufferWidth: canvas.width,
    bufferHeight: canvas.height,
  };
  if (elapsed >= 0.75 && diagnostics.loaded + diagnostics.failed === verificationAssets.length) {
    const fps = Math.round(frames / elapsed);
    status.textContent = `${diagnostics.loaded}/${verificationAssets.length} loaded · FPS ${fps} · calls ${diagnostics.render.calls} · tris ${diagnostics.render.triangles.toLocaleString()}`;
    frames = 0;
    elapsed = 0;
  }
  requestAnimationFrame(render);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(host);
resize();
void loadRepresentativeAssets();
requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(render);
});

window.addEventListener(
  'beforeunload',
  () => {
    resizeObserver.disconnect();
    controls.dispose();
    assetManager.disposeAll();
    pedestalGeometry.dispose();
    pedestalMaterial.dispose();
    renderer.dispose();
    delete debugWindow.__SUPERMARKET_ASSET_DEBUG__;
  },
  { once: true },
);
