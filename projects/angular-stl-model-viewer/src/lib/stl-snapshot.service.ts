import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const MATERIAL_0 = (color = 0xffffff) =>
  new THREE.MeshPhongMaterial({
    color,
    flatShading: true,
    side: THREE.DoubleSide,
    wireframe: false,
  });
const LIGHT_0 = new THREE.AmbientLight(0xffffff, 0.3);
const LIGHT_1 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_1.position.set(-100, -100, 100);
LIGHT_1.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_2 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_2.position.set(100, -100, -100);
LIGHT_2.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_3 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_3.position.set(-100, 100, -100);
LIGHT_3.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_5 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_5.position.set(-100, 100, 100);
LIGHT_5.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_6 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_6.position.set(100, -100, 100);
LIGHT_6.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_7 = new THREE.DirectionalLight(0xffffff, 0.15);
LIGHT_7.position.set(100, 100, -100);
LIGHT_7.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_4 = new THREE.DirectionalLight(0xffffff, 0.4);
LIGHT_4.position.set(50, 50, 0);
LIGHT_4.lookAt(new THREE.Vector3(-100, 0, 0));

export type SnapShotResult = {
  images: string[];
  sideLength: number;
  ppmm: number;
};

export class StlSnapshotService {
  canvas: HTMLCanvasElement = document.createElement('canvas');
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  stlLoader: STLLoader = new STLLoader();
  scene: THREE.Scene = new THREE.Scene();
  objects = new THREE.Group();
  lights = new THREE.Group();
  geometry: BufferGeometry;
  sideLength = 0;
  distance = 10;
  center: THREE.Vector3;
  constructor(private file: File | ArrayBuffer, private ppmm: number) {}
  async read(): Promise<ArrayBuffer> {
    if (this.file instanceof File) {
      this.file = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this.file as File);
      });
    }
    return this.file as ArrayBuffer;
  }
  async snapshot(fileSave?: (data: string) => void): Promise<SnapShotResult> {
    this.init(await this.read());
    return await this.shot(fileSave);
  }
  private init(data: ArrayBuffer) {
    this.geometry = this.stlLoader.parse(data);
    this.geometry.computeBoundingBox();
    this.geometry.center();
    this.geometry.computeBoundingSphere();
    const { x, y, z } = this.geometry.boundingBox.max;
    this.distance = Math.max(x, y, z) * 10;
    const { center, radius } = this.geometry.boundingSphere;
    this.center = center;
    this.sideLength = radius * 2;
    this.canvas.height = this.canvas.width = this.sideLength * this.ppmm;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: this.canvas,
    });
    this.camera = new THREE.PerspectiveCamera(15, 1);
    this.camera.position.set(0, this.distance, 0);
    this.camera.lookAt(center);
    this.lights.add(
      LIGHT_0,
      LIGHT_1,
      LIGHT_2,
      LIGHT_3,
      LIGHT_5,
      LIGHT_6,
      LIGHT_7
    );
    this.camera.add(LIGHT_4);
    const mesh = new THREE.Mesh(this.geometry, MATERIAL_0(0xffffff));
    mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    this.objects.add(mesh);
    this.scene.add(this.camera, this.objects, this.lights);
    this.renderer.render(this.scene, this.camera);
  }
  private async shot(fileSave?: (data: string) => void) {
    const images = [];
    const positions = [
      [0, this.distance, 0],
      [0, -this.distance, 0],
      [this.distance, 0, 0],
      [-this.distance, 0, 0],
      [0, 0, this.distance],
      [0, 0, -this.distance],
    ];

    for (const p of positions) {
      this.camera.position.set(p[0], p[1], p[2]);
      this.camera.lookAt(this.center);
      this.camera.up.set(0, 0, p.some((x) => x > 0) ? -1 : 1);
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      await new Promise((resolve, reject) => setTimeout(resolve));
      const dataURL = this.canvas.toDataURL('image/png');
      images.push(dataURL);
      if (fileSave) {
        fileSave(dataURL.replace(/^data:image\/\w+;base64,/, ''));
      }
    }
    return {
      images,
      sideLength: this.sideLength,
      ppmm: this.ppmm,
    };
  }
}
