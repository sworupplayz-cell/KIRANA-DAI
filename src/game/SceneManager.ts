import {
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from 'three';
import { disposeObject3D } from '../utils/disposeObject3D';

const FOUNDATION_SIZE = 36;

/** Owns the shared scene, restrained indoor lighting, and store foundation. */
export class SceneManager {
  readonly scene = new Scene();
  private readonly content = new Group();

  constructor() {
    this.scene.background = new Color(0x34393d);
    this.scene.fog = new Fog(0x34393d, 24, 48);
    this.scene.add(this.content);

    const hemisphere = new HemisphereLight(0xe8eef0, 0x6b604e, 1.85);
    hemisphere.name = 'Ambient Mega Mart light';
    this.content.add(hemisphere);

    const sun = new DirectionalLight(0xfff0d8, 2.1);
    sun.name = 'Efficient indoor directional fill';
    sun.position.set(9, 15, 11);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 46;
    sun.shadow.bias = -0.0008;
    this.content.add(sun, sun.target);

    const foundation = new Mesh(
      new PlaneGeometry(FOUNDATION_SIZE, FOUNDATION_SIZE),
      new MeshStandardMaterial({ color: 0x4b4a45, roughness: 1 }),
    );
    foundation.name = 'Mega Mart foundation';
    foundation.rotation.x = -Math.PI / 2;
    foundation.position.y = -0.055;
    foundation.receiveShadow = true;
    this.content.add(foundation);
  }

  dispose(): void {
    disposeObject3D(this.content);
    this.scene.clear();
  }
}
