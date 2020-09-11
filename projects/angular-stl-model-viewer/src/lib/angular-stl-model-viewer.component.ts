import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import * as THREE from 'three';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Vector3 } from 'three';

export enum RotateDirection {
  up,
  right,
  down,
  left,
  none,
}
export enum ZoomDirection {
  in,
  out,
}
export interface MeshOptions {
  castShadow?: boolean;
  position?: THREE.Vector3;
  receiveShadow?: boolean;
  scale?: THREE.Vector3;
  up?: THREE.Vector3;
  userData?: { [key: string]: any };
  visible?: boolean;
}

const defaultMeshOptions = {
  castShadow: true,
  position: new THREE.Vector3(0, 0, 0),
  receiveShadow: true,
  scale: new THREE.Vector3(0.03, 0.03, 0.03),
};

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stl-model-viewer',
  styles: [
    `
      :host {
        width: 100%
        height: 100%
        display: block
      }
    `,
  ],
  template: '',
})
export class StlModelViewerComponent implements OnInit, OnDestroy {
  private _models = [];
  @Input() set stlModels(models: string[]) {
    this._models = models;
    this.refreshMeshGroup();
  }
  get stlModels() {
    return this._models;
  }
  @Input() hasControls = true;
  @Input() camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    15
  );

  @Input() cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  @Input() light: THREE.Light = new THREE.PointLight(0xffffff);
  @Input() material: THREE.Material = new THREE.MeshPhongMaterial({
    color: 0xc4c4c4,
    shininess: 100,
    specular: 0x111111,
  });
  @Input() scene: THREE.Scene = new THREE.Scene();
  @Input() renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  @Input() controls: any | null = null;
  @Input() meshOptions: MeshOptions[] = [];

  @Output() rendered = new EventEmitter<void>();

  xzAngle = 0; // Azimuthal angle
  yzAngle = 0; // Polar angle
  distance = 0.15; // PerspectiveCamera distance
  zoomFactor = 0; // OrthographicCamera zoom

  hasWebGL = isWebGLAvailable();
  meshGroup = new THREE.Object3D();
  isRendered = false;
  showStlModel = true;
  stlLoader = new STLLoader();

  constructor(
    private cdr: ChangeDetectorRef,
    private eleRef: ElementRef,
    private ngZone: NgZone
  ) {
    this.cdr.detach();
    // default light position
    this.light.position.set(0, 0, 5);

    // default camera position
    this.camera.position.set(0, 0, this.distance);
    this.camera.lookAt(0, 0, 0);

    // default scene background
    this.scene.background = new THREE.Color(0xffffff);

    // default renderer options
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  ngOnInit() {
    if (!this.hasWebGL) {
      console.error(
        'stl-model-viewer: Seems like your system does not support webgl.'
      );
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.init();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);

    this.meshGroup.remove();

    if (this.renderer) {
      this.renderer.renderLists.dispose();
      this.renderer.dispose();
    }

    if (this.camera) {
      this.camera.remove();
    }

    if (this.light) {
      this.light.remove();
    }

    if (this.material) {
      this.material.dispose();
    }

    if (this.controls) {
      this.controls.removeEventListener('change', this.render);
      this.controls.dispose();
    }

    if (this.scene) {
      this.scene.children.forEach((child) => {
        this.scene.remove(child);
      });
      this.scene.dispose();
    }
  }

  zoom(direction: ZoomDirection, stepCount = 0.15) {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      switch (direction) {
        case ZoomDirection.in:
          this.distance -= stepCount;
          break;
        case ZoomDirection.out:
          this.distance += stepCount;
          break;
      }
      this.distance = this.distance < 0 ? 0 : this.distance;
    }
    this.rotate(RotateDirection.none);
  }
  rotate(direction: RotateDirection, stepCount = 0.1) {
    let step = 0;
    switch (direction) {
      case RotateDirection.up:
        step = 1;
        break;
      case RotateDirection.right:
        this.xzAngle += 1;
        break;
      case RotateDirection.down:
        step = -1;
        break;
      case RotateDirection.left:
        this.xzAngle -= 1;
        break;
      default:
        break;
    }

    if (Math.abs(this.yzAngle + step * stepCount) < Math.PI / 2) {
      this.yzAngle += step;
    } else {
      this.yzAngle = step > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    this.camera.position.x =
      this.distance * Math.cos(this.yzAngle) * Math.cos(this.xzAngle);
    this.camera.position.z =
      this.distance * Math.cos(this.yzAngle) * Math.sin(this.xzAngle);
    this.camera.position.y = this.distance * Math.sin(this.yzAngle);
    this.camera.lookAt(0, 0, 0);
    this.render();
  }

  private async init() {
    this.camera.add(this.light);
    this.scene.add(this.camera);

    // use default controls
    if (this.hasControls && !this.controls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableZoom = true;
      this.controls.minDistance = 1;
      this.controls.maxDistance = 10;

      this.controls.addEventListener('change', this.render);
    }

    window.addEventListener('resize', this.onWindowResize, false);

    await this.refreshMeshGroup();

    this.scene.add(this.meshGroup);
    this.eleRef.nativeElement.appendChild(this.renderer.domElement);
    this.setSizes();
    this.render();
    this.ngZone.run(() => {
      this.isRendered = true;
      this.rendered.emit();
      this.cdr.detectChanges();
    });
  }

  async refreshMeshGroup() {
    this.meshGroup.remove(...this.meshGroup.children);
    const meshCreations = this.stlModels.map((modelPath, index) => {
      return this.createMesh(modelPath, this.meshOptions[index]);
    });
    const meshes: THREE.Object3D[] = await Promise.all(meshCreations);

    meshes.map((mesh) => this.meshGroup.add(mesh));
    this.rotate(RotateDirection.none);
  }

  async createMesh(
    path: string,
    meshOptions: MeshOptions = {}
  ): Promise<THREE.Mesh> {
    const geometry: THREE.BufferGeometry = await this.stlLoader.loadAsync(path);
    geometry.computeBoundingBox();
    geometry.center();
    const { x, y, z } = geometry.boundingBox.max;
    this.distance = Math.max(x, y, z) * 0.2;
    const mesh = new THREE.Mesh(geometry, this.material);

    const vectorOptions = ['position', 'scale', 'up'];
    const options = Object.assign({}, defaultMeshOptions, meshOptions);

    Object.getOwnPropertyNames(options).forEach((option) => {
      if (vectorOptions.indexOf(option) > -1) {
        const vector = options[option] as Vector3;
        const meshVectorOption = mesh[option] as Vector3;
        meshVectorOption.set(vector.x, vector.y, vector.z);
      } else {
        mesh[option] = options[option];
      }
    });

    return mesh;
  }

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  setSizes() {
    const width = this.eleRef.nativeElement.offsetWidth;
    const height = this.eleRef.nativeElement.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  onWindowResize = () => {
    this.setSizes();
    this.render();
  };
}
