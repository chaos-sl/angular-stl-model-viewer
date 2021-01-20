import { __awaiter } from 'tslib';
import { EventEmitter, Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, NgZone, Input, Output, NgModule } from '@angular/core';
import { Vector3, PerspectiveCamera, DirectionalLight, MeshPhongMaterial, Scene, WebGLRenderer, Object3D, LightProbe, Color, CubeTextureLoader, sRGBEncoding, MeshStandardMaterial, Mesh, DoubleSide, AmbientLight, Group, OrthographicCamera } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';

var RotateDirection;
(function (RotateDirection) {
    RotateDirection[RotateDirection["up"] = 0] = "up";
    RotateDirection[RotateDirection["right"] = 1] = "right";
    RotateDirection[RotateDirection["down"] = 2] = "down";
    RotateDirection[RotateDirection["left"] = 3] = "left";
    RotateDirection[RotateDirection["none"] = 4] = "none";
})(RotateDirection || (RotateDirection = {}));
var ZoomDirection;
(function (ZoomDirection) {
    ZoomDirection[ZoomDirection["in"] = 0] = "in";
    ZoomDirection[ZoomDirection["out"] = 1] = "out";
})(ZoomDirection || (ZoomDirection = {}));
const defaultMeshOptions = {
    castShadow: true,
    position: new Vector3(0, 0, 0),
    receiveShadow: true,
    scale: new Vector3(1, 1, 1),
};
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }
    catch (e) {
        return false;
    }
}
class StlModelViewerComponent {
    constructor(cdr, eleRef, ngZone) {
        this.cdr = cdr;
        this.eleRef = eleRef;
        this.ngZone = ngZone;
        this._models = [];
        this.hasControls = true;
        this.camera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight);
        this.cameraTarget = new Vector3(0, 0, 0);
        this.light = new DirectionalLight(0xffffff, 1);
        this.material = new MeshPhongMaterial({
            color: 0xc4c4c4,
            shininess: 100,
            specular: 0x111111,
        });
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({
            antialias: true,
        });
        this.controls = null;
        this.meshOptions = [];
        this.rendered = new EventEmitter();
        this.xzAngle = 0; // Azimuthal angle
        this.yzAngle = 0; // Polar angle
        this.distance = 10; // PerspectiveCamera distance
        this.zoomFactor = 0; // OrthographicCamera zoom
        this.hasWebGL = isWebGLAvailable();
        this.meshGroup = new Object3D();
        this.isRendered = false;
        this.showStlModel = true;
        this.stlLoader = new STLLoader();
        this.lightProbe = new LightProbe(undefined, 1);
        this.render = () => {
            this.renderer.render(this.scene, this.camera);
        };
        this.onWindowResize = () => {
            this.setSizes();
            this.render();
        };
        this.cdr.detach();
        // default light position
        this.light.position.set(10, 10, 10);
        // default camera position
        this.camera.position.set(0, this.distance, 0);
        this.camera.lookAt(0, 0, 0);
        // default scene background
        this.scene.background = new Color(0xdcdcdc);
        new CubeTextureLoader().load(this.genCubeUrls('assets/', '.png'), (cubeTexture) => {
            cubeTexture.encoding = sRGBEncoding;
            this.lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));
            // this.scene.background = cubeTexture;
            this.texture = cubeTexture;
            this.material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.4,
                roughness: 0.2,
                envMap: cubeTexture,
                envMapIntensity: 1,
            });
        });
        // default renderer options
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
    }
    set stlModels(models) {
        this._models = models;
        this.refreshMeshGroup();
    }
    get stlModels() {
        return this._models;
    }
    // envmap
    genCubeUrls(prefix, postfix) {
        return [
            prefix + 'bg' + postfix,
            prefix + 'bg' + postfix,
            prefix + 'bg' + postfix,
            prefix + 'bg' + postfix,
            prefix + 'bg' + postfix,
            prefix + 'bg' + postfix,
        ];
    }
    ngOnInit() {
        if (!this.hasWebGL) {
            console.error('stl-model-viewer: Seems like your system does not support webgl.');
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
    zoom(direction, stepCount = 1) {
        if (this.camera instanceof PerspectiveCamera) {
            switch (direction) {
                case ZoomDirection.in:
                    this.distance += stepCount;
                    break;
                case ZoomDirection.out:
                    this.distance -= stepCount;
                    break;
            }
            this.distance = this.distance < 0 ? 0 : this.distance;
        }
        this.rotate(RotateDirection.none);
    }
    rotate(direction, stepCount = 1) {
        let step = 0;
        switch (direction) {
            case RotateDirection.up:
                step = 0.1;
                break;
            case RotateDirection.right:
                this.xzAngle += 0.1;
                break;
            case RotateDirection.down:
                step = -0.1;
                break;
            case RotateDirection.left:
                this.xzAngle -= 0.1;
                break;
            default:
                break;
        }
        if (Math.abs(this.yzAngle + step * stepCount) < Math.PI / 2) {
            this.yzAngle += step;
        }
        else {
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.add(this.lightProbe);
            this.camera.add(this.light);
            this.scene.add(this.camera);
            // use default controls
            if (this.hasControls && !this.controls) {
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableZoom = true;
                this.controls.addEventListener('change', this.render);
            }
            window.addEventListener('resize', this.onWindowResize, false);
            yield this.refreshMeshGroup();
            this.scene.add(this.meshGroup);
            this.eleRef.nativeElement.appendChild(this.renderer.domElement);
            this.setSizes();
            this.render();
            this.ngZone.run(() => {
                this.isRendered = true;
                this.rendered.emit();
                this.cdr.detectChanges();
            });
        });
    }
    refreshMeshGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.meshGroup.remove(...this.meshGroup.children);
            const meshCreations = this.stlModels.map((modelPath, index) => {
                return this.createMesh(modelPath, this.meshOptions[index]);
            });
            const meshes = yield Promise.all(meshCreations);
            meshes.map((mesh) => this.meshGroup.add(mesh));
            this.rotate(RotateDirection.none);
        });
    }
    createMesh(path, meshOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = yield this.stlLoader.loadAsync(path);
            geometry.computeBoundingBox();
            geometry.center();
            const { x, y, z } = geometry.boundingBox.max;
            this.distance = Math.max(x, y, z) * 10;
            const mesh = new Mesh(geometry, this.material);
            mesh.rotateOnWorldAxis(new Vector3(0, 1, 0), -Math.PI / 2);
            const vectorOptions = ['position', 'scale', 'up'];
            const options = Object.assign({}, defaultMeshOptions, meshOptions);
            Object.getOwnPropertyNames(options).forEach((option) => {
                if (vectorOptions.indexOf(option) > -1) {
                    const vector = options[option];
                    const meshVectorOption = mesh[option];
                    meshVectorOption.set(vector.x, vector.y, vector.z);
                }
                else {
                    mesh[option] = options[option];
                }
            });
            return mesh;
        });
    }
    setSizes() {
        const width = this.eleRef.nativeElement.offsetWidth;
        const height = this.eleRef.nativeElement.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
StlModelViewerComponent.decorators = [
    { type: Component, args: [{
                changeDetection: ChangeDetectionStrategy.OnPush,
                selector: 'stl-model-viewer',
                template: '',
                styles: [`
      :host {
        width: 100%
        height: 100%
        display: block
      }
    `]
            },] }
];
StlModelViewerComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: NgZone }
];
StlModelViewerComponent.propDecorators = {
    stlModels: [{ type: Input }],
    hasControls: [{ type: Input }],
    camera: [{ type: Input }],
    cameraTarget: [{ type: Input }],
    light: [{ type: Input }],
    material: [{ type: Input }],
    scene: [{ type: Input }],
    renderer: [{ type: Input }],
    controls: [{ type: Input }],
    meshOptions: [{ type: Input }],
    rendered: [{ type: Output }]
};

class StlModelViewerModule {
}
StlModelViewerModule.decorators = [
    { type: NgModule, args: [{
                declarations: [StlModelViewerComponent],
                exports: [StlModelViewerComponent],
                imports: [],
            },] }
];

const MATERIAL_0 = (color = 0xffffff) => new MeshPhongMaterial({
    color,
    flatShading: true,
    side: DoubleSide,
    wireframe: false,
});
const ɵ0 = MATERIAL_0;
const LIGHT_0 = new AmbientLight(0xffffff, 0.3);
const LIGHT_1 = new DirectionalLight(0xffffff, 0.2);
LIGHT_1.position.set(-100, -100, 100);
LIGHT_1.lookAt(new Vector3(0, 0, 0));
const LIGHT_2 = new DirectionalLight(0xffffff, 0.2);
LIGHT_2.position.set(100, 0, 0);
LIGHT_2.lookAt(new Vector3(0, 0, 0));
const LIGHT_3 = new DirectionalLight(0xffffff, 0.2);
LIGHT_3.position.set(-20, 100, 0);
LIGHT_3.lookAt(new Vector3(0, 0, 0));
const LIGHT_4 = new DirectionalLight(0xffffff, 0.4);
LIGHT_4.position.set(50, 50, 0);
LIGHT_4.lookAt(new Vector3(-100, 0, 0));
class StlSnapshotService {
    constructor(file, ppmm) {
        this.file = file;
        this.ppmm = ppmm;
        this.canvas = document.createElement('canvas');
        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: this.canvas,
        });
        this.stlLoader = new STLLoader();
        this.scene = new Scene();
        this.objects = new Group();
        this.lights = new Group();
        this.sideLength = 0;
    }
    snapshot(fileSave) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(this.file);
        }).then((data) => {
            this.init(data);
            return this.shot(fileSave);
        });
    }
    init(data) {
        this.geometry = this.stlLoader.parse(data);
        this.geometry.computeBoundingBox();
        this.geometry.center();
        this.geometry.computeBoundingSphere();
        const { max, min } = this.geometry.boundingBox;
        this.sideLength = Math.ceil(Math.max(max.x - min.x, max.y - min.y, max.z - min.z));
        this.canvas.height = this.canvas.width = this.sideLength;
        this.camera = new OrthographicCamera(-this.sideLength / 2, this.sideLength / 2, this.sideLength / 2, -this.sideLength / 2, 1, 1000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.lights.add(LIGHT_0, LIGHT_1, LIGHT_2, LIGHT_3);
        this.camera.add(LIGHT_4);
        this.objects.add(new Mesh(this.geometry, MATERIAL_0(0xffffff)));
        this.scene.add(this.camera, this.objects, this.lights);
    }
    shot(fileSave) {
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
            this.camera.lookAt(new Vector3(0, 0, 0));
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

/*
 * Public API Surface of angular-stl-model-viewer
 */

/**
 * Generated bundle index. Do not edit.
 */

export { RotateDirection, StlModelViewerComponent, StlModelViewerModule, StlSnapshotService, ZoomDirection, ɵ0 };
//# sourceMappingURL=angular-stl-model-viewer.js.map
