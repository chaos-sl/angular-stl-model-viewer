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
const LIGHT_1 = new THREE.DirectionalLight(0xffffff, 0.2);
LIGHT_1.position.set(-100, -100, 100);
LIGHT_1.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_2 = new THREE.DirectionalLight(0xffffff, 0.2);
LIGHT_2.position.set(100, 0, 0);
LIGHT_2.lookAt(new THREE.Vector3(0, 0, 0));
const LIGHT_3 = new THREE.DirectionalLight(0xffffff, 0.2);
LIGHT_3.position.set(-20, 100, 0);
LIGHT_3.lookAt(new THREE.Vector3(0, 0, 0));
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
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: this.canvas,
  });
  camera: THREE.OrthographicCamera;
  stlLoader: STLLoader = new STLLoader();
  scene: THREE.Scene = new THREE.Scene();
  objects = new THREE.Group();
  lights = new THREE.Group();
  geometry: BufferGeometry;
  sideLength = 0;
  constructor(private file: File, private ppmm: number) {}
  snapshot(fileSave?: (data: string) => void): Promise<SnapShotResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(this.file);
    }).then((data: ArrayBuffer) => {
      this.init(data);
      return this.shot(fileSave);
    });
  }
  private init(data: ArrayBuffer) {
    this.geometry = this.stlLoader.parse(data);
    this.geometry.computeBoundingBox();
    this.geometry.center();
    this.geometry.computeBoundingSphere();
    const { max, min } = this.geometry.boundingBox;
    this.sideLength = Math.ceil(
      Math.max(max.x - min.x, max.y - min.y, max.z - min.z)
    );
    this.canvas.height = this.canvas.width = this.sideLength;
    this.camera = new THREE.OrthographicCamera(
      -this.sideLength / 2,
      this.sideLength / 2,
      this.sideLength / 2,
      -this.sideLength / 2,
      1,
      1000
    );
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.lights.add(LIGHT_0, LIGHT_1, LIGHT_2, LIGHT_3);
    this.camera.add(LIGHT_4);
    this.objects.add(new THREE.Mesh(this.geometry, MATERIAL_0(0xffffff)));
    this.scene.add(this.camera, this.objects, this.lights);
  }
  private shot(fileSave?: (data: string) => void) {
    const images = [];
    const positions = [
      [0, 0, 100, -1, 0, 0],
      [0, 0, -100, 1, 0, 0],
      [0, 100, 50, 0, 0, -1],
      [100, 0, 50, 0, 0, -1],
      [0, 100, -50, 0, 0, 1],
      [100, 0, -50, 0, 0, 1],
    ];

    for (const p of positions) {
      this.camera.position.set(p[0], p[1], p[2]);
      this.camera.up.set(p[3], p[4], p[5]);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
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
