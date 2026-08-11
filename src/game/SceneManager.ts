import {
  BoxGeometry,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector2,
} from 'three';
import { disposeObject3D } from '../utils/disposeObject3D';

const GROUND_SIZE = 14;
const MARKER_LIMIT = GROUND_SIZE * 0.43;

export class SceneManager {
  readonly scene = new Scene();
  private readonly content = new Group();
  private readonly developmentMarker: Mesh<BoxGeometry, MeshStandardMaterial>;

  constructor() {
    this.scene.background = new Color(0x101814);
    this.scene.add(this.content);

    const hemisphere = new HemisphereLight(0xddeeff, 0x384238, 1.7);
    this.content.add(hemisphere);

    const sun = new DirectionalLight(0xfff0d5, 2.2);
    sun.position.set(4, 7, 3);
    sun.castShadow = false;
    this.content.add(sun);

    const ground = new Mesh(
      new PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
      new MeshStandardMaterial({ color: 0x546c59, roughness: 0.95 }),
    );
    ground.name = 'Foundation test ground';
    ground.rotation.x = -Math.PI / 2;
    this.content.add(ground);

    const grid = new GridHelper(GROUND_SIZE, 14, 0x9eb6a2, 0x718577);
    grid.position.y = 0.004;
    this.content.add(grid);

    this.developmentMarker = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshStandardMaterial({ color: 0xe19a3b, roughness: 0.55 }),
    );
    this.developmentMarker.name = 'Movable development marker';
    this.developmentMarker.position.y = 0.5;
    this.content.add(this.developmentMarker);
  }

  update(deltaSeconds: number, movement: Vector2): void {
    this.developmentMarker.rotation.y += deltaSeconds * 0.65;

    if (movement.lengthSq() === 0) return;

    const movementSpeed = 3.25;
    this.developmentMarker.position.x = MathUtils.clamp(
      this.developmentMarker.position.x + movement.x * movementSpeed * deltaSeconds,
      -MARKER_LIMIT,
      MARKER_LIMIT,
    );
    this.developmentMarker.position.z = MathUtils.clamp(
      this.developmentMarker.position.z - movement.y * movementSpeed * deltaSeconds,
      -MARKER_LIMIT,
      MARKER_LIMIT,
    );
  }

  dispose(): void {
    disposeObject3D(this.content);
    this.scene.clear();
  }
}
