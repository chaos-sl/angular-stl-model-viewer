import { __awaiter } from "tslib";
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, } from '@angular/core';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';
import * as i0 from "@angular/core";
export var RotateDirection;
(function (RotateDirection) {
    RotateDirection[RotateDirection["up"] = 0] = "up";
    RotateDirection[RotateDirection["right"] = 1] = "right";
    RotateDirection[RotateDirection["down"] = 2] = "down";
    RotateDirection[RotateDirection["left"] = 3] = "left";
    RotateDirection[RotateDirection["none"] = 4] = "none";
})(RotateDirection || (RotateDirection = {}));
export var ZoomDirection;
(function (ZoomDirection) {
    ZoomDirection[ZoomDirection["in"] = 0] = "in";
    ZoomDirection[ZoomDirection["out"] = 1] = "out";
})(ZoomDirection || (ZoomDirection = {}));
const defaultMeshOptions = {
    castShadow: true,
    position: new THREE.Vector3(0, 0, 0),
    receiveShadow: true,
    scale: new THREE.Vector3(1, 1, 1),
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
export class StlModelViewerComponent {
    constructor(cdr, eleRef, ngZone) {
        this.cdr = cdr;
        this.eleRef = eleRef;
        this.ngZone = ngZone;
        this._models = [];
        this.hasControls = true;
        this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.material = new THREE.MeshPhongMaterial({
            color: 0xc4c4c4,
            shininess: 100,
            specular: 0x111111,
        });
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
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
        this.meshGroup = new THREE.Object3D();
        this.isRendered = false;
        this.showStlModel = true;
        this.stlLoader = new STLLoader();
        this.lightProbe = new THREE.LightProbe(undefined, 1);
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
        this.scene.background = new THREE.Color(0xdcdcdc);
        new THREE.CubeTextureLoader().load(this.genCubeUrls('assets/', '.png'), (cubeTexture) => {
            cubeTexture.encoding = THREE.sRGBEncoding;
            this.lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));
            // this.scene.background = cubeTexture;
            this.texture = cubeTexture;
            this.material = new THREE.MeshStandardMaterial({
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
        if (this.camera instanceof THREE.PerspectiveCamera) {
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
            const meshCreations = this.stlModels
                .filter((x) => x)
                .map((modelPath, index) => {
                return this.createMesh(modelPath, this.meshOptions[index]);
            });
            const meshes = yield Promise.all(meshCreations);
            meshes.map((mesh) => this.meshGroup.add(mesh));
            this.rotate(RotateDirection.none);
        });
    }
    createMesh(path, meshOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = typeof path === 'string'
                ? yield this.stlLoader.loadAsync(path)
                : yield this.stlLoader.parse(path);
            geometry.computeBoundingBox();
            geometry.center();
            const { x, y, z } = geometry.boundingBox.max;
            this.distance = Math.max(x, y, z) * 10;
            const mesh = new THREE.Mesh(geometry, this.material);
            mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
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
StlModelViewerComponent.ɵfac = function StlModelViewerComponent_Factory(t) { return new (t || StlModelViewerComponent)(i0.ɵɵdirectiveInject(i0.ChangeDetectorRef), i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.NgZone)); };
StlModelViewerComponent.ɵcmp = i0.ɵɵdefineComponent({ type: StlModelViewerComponent, selectors: [["stl-model-viewer"]], inputs: { stlModels: "stlModels", hasControls: "hasControls", camera: "camera", cameraTarget: "cameraTarget", light: "light", material: "material", scene: "scene", renderer: "renderer", controls: "controls", meshOptions: "meshOptions" }, outputs: { rendered: "rendered" }, decls: 0, vars: 0, template: function StlModelViewerComponent_Template(rf, ctx) { }, styles: ["[_nghost-%COMP%] {\n        width: 100%\n        height: 100%\n        display: block\n      }"], changeDetection: 0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(StlModelViewerComponent, [{
        type: Component,
        args: [{
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
            }]
    }], function () { return [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.NgZone }]; }, { stlModels: [{
            type: Input
        }], hasControls: [{
            type: Input
        }], camera: [{
            type: Input
        }], cameraTarget: [{
            type: Input
        }], light: [{
            type: Input
        }], material: [{
            type: Input
        }], scene: [{
            type: Input
        }], renderer: [{
            type: Input
        }], controls: [{
            type: Input
        }], meshOptions: [{
            type: Input
        }], rendered: [{
            type: Output
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zdGwtbW9kZWwtdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItc3RsLW1vZGVsLXZpZXdlci9zcmMvbGliL2FuZ3VsYXItc3RsLW1vZGVsLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsWUFBWSxFQUNaLEtBQUssRUFJTCxNQUFNLEVBQ04sdUJBQXVCLEdBRXhCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0RBQWtELENBQUM7O0FBR3ZGLE1BQU0sQ0FBTixJQUFZLGVBTVg7QUFORCxXQUFZLGVBQWU7SUFDekIsaURBQUUsQ0FBQTtJQUNGLHVEQUFLLENBQUE7SUFDTCxxREFBSSxDQUFBO0lBQ0oscURBQUksQ0FBQTtJQUNKLHFEQUFJLENBQUE7QUFDTixDQUFDLEVBTlcsZUFBZSxLQUFmLGVBQWUsUUFNMUI7QUFDRCxNQUFNLENBQU4sSUFBWSxhQUdYO0FBSEQsV0FBWSxhQUFhO0lBQ3ZCLDZDQUFFLENBQUE7SUFDRiwrQ0FBRyxDQUFBO0FBQ0wsQ0FBQyxFQUhXLGFBQWEsS0FBYixhQUFhLFFBR3hCO0FBV0QsTUFBTSxrQkFBa0IsR0FBRztJQUN6QixVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLGFBQWEsRUFBRSxJQUFJO0lBQ25CLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMs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dUJBQXVCOzREQUF2Qix1QkFBdUI7a0RBQXZCLHVCQUF1QjtjQWRuQyxTQUFTO2VBQUM7Z0JBQ1QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE1BQU0sRUFBRTtvQkFDTjs7Ozs7O0tBTUM7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFLEVBQUU7YUFDYjtrSEFHYyxTQUFTO2tCQUFyQixLQUFLO1lBT0csV0FBVztrQkFBbkIsS0FBSztZQUNHLE1BQU07a0JBQWQsS0FBSztZQUtHLFlBQVk7a0JBQXBCLEtBQUs7WUFDRyxLQUFLO2tCQUFiLEtBQUs7WUFDRyxRQUFRO2tCQUFoQixLQUFLO1lBS0csS0FBSztrQkFBYixLQUFLO1lBQ0csUUFBUTtrQkFBaEIsS0FBSztZQUdHLFFBQVE7a0JBQWhCLEtBQUs7WUFDRyxXQUFXO2tCQUFuQixLQUFLO1lBRUksUUFBUTtrQkFBakIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIElucHV0LFxyXG4gIE5nWm9uZSxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIE91dHB1dCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcclxuXHJcbmltcG9ydCB7IFNUTExvYWRlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL1NUTExvYWRlcic7XHJcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vY29udHJvbHMvT3JiaXRDb250cm9scyc7XHJcbmltcG9ydCB7IExpZ2h0UHJvYmVHZW5lcmF0b3IgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbGlnaHRzL0xpZ2h0UHJvYmVHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGVudW0gUm90YXRlRGlyZWN0aW9uIHtcclxuICB1cCxcclxuICByaWdodCxcclxuICBkb3duLFxyXG4gIGxlZnQsXHJcbiAgbm9uZSxcclxufVxyXG5leHBvcnQgZW51bSBab29tRGlyZWN0aW9uIHtcclxuICBpbixcclxuICBvdXQsXHJcbn1cclxuZXhwb3J0IGludGVyZmFjZSBNZXNoT3B0aW9ucyB7XHJcbiAgY2FzdFNoYWRvdz86IGJvb2xlYW47XHJcbiAgcG9zaXRpb24/OiBUSFJFRS5WZWN0b3IzO1xyXG4gIHJlY2VpdmVTaGFkb3c/OiBib29sZWFuO1xyXG4gIHNjYWxlPzogVEhSRUUuVmVjdG9yMztcclxuICB1cD86IFRIUkVFLlZlY3RvcjM7XHJcbiAgdXNlckRhdGE/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG4gIHZpc2libGU/OiBib29sZWFuO1xyXG59XHJcblxyXG5jb25zdCBkZWZhdWx0TWVzaE9wdGlvbnMgPSB7XHJcbiAgY2FzdFNoYWRvdzogdHJ1ZSxcclxuICBwb3NpdGlvbjogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXHJcbiAgcmVjZWl2ZVNoYWRvdzogdHJ1ZSxcclxuICBzY2FsZTogbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSksXHJcbn07XHJcblxyXG5mdW5jdGlvbiBpc1dlYkdMQXZhaWxhYmxlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHJldHVybiAhIShcclxuICAgICAgd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCAmJlxyXG4gICAgICAoY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJykgfHwgY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcpKVxyXG4gICAgKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICBzZWxlY3RvcjogJ3N0bC1tb2RlbC12aWV3ZXInLFxyXG4gIHN0eWxlczogW1xyXG4gICAgYFxyXG4gICAgICA6aG9zdCB7XHJcbiAgICAgICAgd2lkdGg6IDEwMCVcclxuICAgICAgICBoZWlnaHQ6IDEwMCVcclxuICAgICAgICBkaXNwbGF5OiBibG9ja1xyXG4gICAgICB9XHJcbiAgICBgLFxyXG4gIF0sXHJcbiAgdGVtcGxhdGU6ICcnLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgU3RsTW9kZWxWaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfbW9kZWxzID0gW107XHJcbiAgQElucHV0KCkgc2V0IHN0bE1vZGVscyhtb2RlbHM6IChzdHJpbmcgfCBBcnJheUJ1ZmZlcilbXSkge1xyXG4gICAgdGhpcy5fbW9kZWxzID0gbW9kZWxzO1xyXG4gICAgdGhpcy5yZWZyZXNoTWVzaEdyb3VwKCk7XHJcbiAgfVxyXG4gIGdldCBzdGxNb2RlbHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxzO1xyXG4gIH1cclxuICBASW5wdXQoKSBoYXNDb250cm9scyA9IHRydWU7XHJcbiAgQElucHV0KCkgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcclxuICAgIDE1LFxyXG4gICAgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICApO1xyXG5cclxuICBASW5wdXQoKSBjYW1lcmFUYXJnZXQ6IFRIUkVFLlZlY3RvcjMgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcclxuICBASW5wdXQoKSBsaWdodDogVEhSRUUuTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMSk7XHJcbiAgQElucHV0KCkgbWF0ZXJpYWw6IFRIUkVFLk1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgIGNvbG9yOiAweGM0YzRjNCxcclxuICAgIHNoaW5pbmVzczogMTAwLFxyXG4gICAgc3BlY3VsYXI6IDB4MTExMTExLFxyXG4gIH0pO1xyXG4gIEBJbnB1dCgpIHNjZW5lOiBUSFJFRS5TY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIEBJbnB1dCgpIHJlbmRlcmVyOiBUSFJFRS5XZWJHTFJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xyXG4gICAgYW50aWFsaWFzOiB0cnVlLFxyXG4gIH0pO1xyXG4gIEBJbnB1dCgpIGNvbnRyb2xzOiBhbnkgfCBudWxsID0gbnVsbDtcclxuICBASW5wdXQoKSBtZXNoT3B0aW9uczogTWVzaE9wdGlvbnNbXSA9IFtdO1xyXG5cclxuICBAT3V0cHV0KCkgcmVuZGVyZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gIHh6QW5nbGUgPSAwOyAvLyBBemltdXRoYWwgYW5nbGVcclxuICB5ekFuZ2xlID0gMDsgLy8gUG9sYXIgYW5nbGVcclxuICBkaXN0YW5jZSA9IDEwOyAvLyBQZXJzcGVjdGl2ZUNhbWVyYSBkaXN0YW5jZVxyXG4gIHpvb21GYWN0b3IgPSAwOyAvLyBPcnRob2dyYXBoaWNDYW1lcmEgem9vbVxyXG5cclxuICB0ZXh0dXJlOiBUSFJFRS5DdWJlVGV4dHVyZTtcclxuXHJcbiAgaGFzV2ViR0wgPSBpc1dlYkdMQXZhaWxhYmxlKCk7XHJcbiAgbWVzaEdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgaXNSZW5kZXJlZCA9IGZhbHNlO1xyXG4gIHNob3dTdGxNb2RlbCA9IHRydWU7XHJcbiAgc3RsTG9hZGVyID0gbmV3IFNUTExvYWRlcigpO1xyXG4gIGxpZ2h0UHJvYmUgPSBuZXcgVEhSRUUuTGlnaHRQcm9iZSh1bmRlZmluZWQsIDEpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgZWxlUmVmOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZVxyXG4gICkge1xyXG4gICAgdGhpcy5jZHIuZGV0YWNoKCk7XHJcbiAgICAvLyBkZWZhdWx0IGxpZ2h0IHBvc2l0aW9uXHJcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCgxMCwgMTAsIDEwKTtcclxuXHJcbiAgICAvLyBkZWZhdWx0IGNhbWVyYSBwb3NpdGlvblxyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIHRoaXMuZGlzdGFuY2UsIDApO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KDAsIDAsIDApO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgc2NlbmUgYmFja2dyb3VuZFxyXG4gICAgdGhpcy5zY2VuZS5iYWNrZ3JvdW5kID0gbmV3IFRIUkVFLkNvbG9yKDB4ZGNkY2RjKTtcclxuICAgIG5ldyBUSFJFRS5DdWJlVGV4dHVyZUxvYWRlcigpLmxvYWQoXHJcbiAgICAgIHRoaXMuZ2VuQ3ViZVVybHMoJ2Fzc2V0cy8nLCAnLnBuZycpLFxyXG4gICAgICAoY3ViZVRleHR1cmUpID0+IHtcclxuICAgICAgICBjdWJlVGV4dHVyZS5lbmNvZGluZyA9IFRIUkVFLnNSR0JFbmNvZGluZztcclxuICAgICAgICB0aGlzLmxpZ2h0UHJvYmUuY29weShMaWdodFByb2JlR2VuZXJhdG9yLmZyb21DdWJlVGV4dHVyZShjdWJlVGV4dHVyZSkpO1xyXG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYmFja2dyb3VuZCA9IGN1YmVUZXh0dXJlO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGN1YmVUZXh0dXJlO1xyXG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgY29sb3I6IDB4ZmZmZmZmLFxyXG4gICAgICAgICAgbWV0YWxuZXNzOiAwLjQsXHJcbiAgICAgICAgICByb3VnaG5lc3M6IDAuMixcclxuICAgICAgICAgIGVudk1hcDogY3ViZVRleHR1cmUsXHJcbiAgICAgICAgICBlbnZNYXBJbnRlbnNpdHk6IDEsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gZGVmYXVsdCByZW5kZXJlciBvcHRpb25zXHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xyXG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyBlbnZtYXBcclxuICBwcml2YXRlIGdlbkN1YmVVcmxzKHByZWZpeCwgcG9zdGZpeCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgcHJlZml4ICsgJ2JnJyArIHBvc3RmaXgsXHJcbiAgICAgIHByZWZpeCArICdiZycgKyBwb3N0Zml4LFxyXG4gICAgICBwcmVmaXggKyAnYmcnICsgcG9zdGZpeCxcclxuICAgICAgcHJlZml4ICsgJ2JnJyArIHBvc3RmaXgsXHJcbiAgICAgIHByZWZpeCArICdiZycgKyBwb3N0Zml4LFxyXG4gICAgICBwcmVmaXggKyAnYmcnICsgcG9zdGZpeCxcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIGlmICghdGhpcy5oYXNXZWJHTCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICdzdGwtbW9kZWwtdmlld2VyOiBTZWVtcyBsaWtlIHlvdXIgc3lzdGVtIGRvZXMgbm90IHN1cHBvcnQgd2ViZ2wuJ1xyXG4gICAgICApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICB0aGlzLmluaXQoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSwgZmFsc2UpO1xyXG5cclxuICAgIHRoaXMubWVzaEdyb3VwLnJlbW92ZSgpO1xyXG5cclxuICAgIGlmICh0aGlzLnJlbmRlcmVyKSB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyTGlzdHMuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jYW1lcmEpIHtcclxuICAgICAgdGhpcy5jYW1lcmEucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubGlnaHQpIHtcclxuICAgICAgdGhpcy5saWdodC5yZW1vdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5tYXRlcmlhbCkge1xyXG4gICAgICB0aGlzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb250cm9scykge1xyXG4gICAgICB0aGlzLmNvbnRyb2xzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMucmVuZGVyKTtcclxuICAgICAgdGhpcy5jb250cm9scy5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuc2NlbmUpIHtcclxuICAgICAgdGhpcy5zY2VuZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlKGNoaWxkKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc2NlbmUuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgem9vbShkaXJlY3Rpb246IFpvb21EaXJlY3Rpb24sIHN0ZXBDb3VudCA9IDEpIHtcclxuICAgIGlmICh0aGlzLmNhbWVyYSBpbnN0YW5jZW9mIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKSB7XHJcbiAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSBab29tRGlyZWN0aW9uLmluOlxyXG4gICAgICAgICAgdGhpcy5kaXN0YW5jZSArPSBzdGVwQ291bnQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFpvb21EaXJlY3Rpb24ub3V0OlxyXG4gICAgICAgICAgdGhpcy5kaXN0YW5jZSAtPSBzdGVwQ291bnQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRpc3RhbmNlID0gdGhpcy5kaXN0YW5jZSA8IDAgPyAwIDogdGhpcy5kaXN0YW5jZTtcclxuICAgIH1cclxuICAgIHRoaXMucm90YXRlKFJvdGF0ZURpcmVjdGlvbi5ub25lKTtcclxuICB9XHJcbiAgcm90YXRlKGRpcmVjdGlvbjogUm90YXRlRGlyZWN0aW9uLCBzdGVwQ291bnQgPSAxKSB7XHJcbiAgICBsZXQgc3RlcCA9IDA7XHJcbiAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICBjYXNlIFJvdGF0ZURpcmVjdGlvbi51cDpcclxuICAgICAgICBzdGVwID0gMC4xO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFJvdGF0ZURpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICB0aGlzLnh6QW5nbGUgKz0gMC4xO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFJvdGF0ZURpcmVjdGlvbi5kb3duOlxyXG4gICAgICAgIHN0ZXAgPSAtMC4xO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFJvdGF0ZURpcmVjdGlvbi5sZWZ0OlxyXG4gICAgICAgIHRoaXMueHpBbmdsZSAtPSAwLjE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKE1hdGguYWJzKHRoaXMueXpBbmdsZSArIHN0ZXAgKiBzdGVwQ291bnQpIDwgTWF0aC5QSSAvIDIpIHtcclxuICAgICAgdGhpcy55ekFuZ2xlICs9IHN0ZXA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnl6QW5nbGUgPSBzdGVwID4gMCA/IE1hdGguUEkgLyAyIDogLU1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9XHJcbiAgICAgIHRoaXMuZGlzdGFuY2UgKiBNYXRoLmNvcyh0aGlzLnl6QW5nbGUpICogTWF0aC5jb3ModGhpcy54ekFuZ2xlKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPVxyXG4gICAgICB0aGlzLmRpc3RhbmNlICogTWF0aC5jb3ModGhpcy55ekFuZ2xlKSAqIE1hdGguc2luKHRoaXMueHpBbmdsZSk7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gdGhpcy5kaXN0YW5jZSAqIE1hdGguc2luKHRoaXMueXpBbmdsZSk7XHJcbiAgICB0aGlzLmNhbWVyYS5sb29rQXQoMCwgMCwgMCk7XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBpbml0KCkge1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5saWdodFByb2JlKTtcclxuICAgIHRoaXMuY2FtZXJhLmFkZCh0aGlzLmxpZ2h0KTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuY2FtZXJhKTtcclxuXHJcbiAgICAvLyB1c2UgZGVmYXVsdCBjb250cm9sc1xyXG4gICAgaWYgKHRoaXMuaGFzQ29udHJvbHMgJiYgIXRoaXMuY29udHJvbHMpIHtcclxuICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG4gICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZVpvb20gPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5jb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLnJlbmRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25XaW5kb3dSZXNpemUsIGZhbHNlKTtcclxuXHJcbiAgICBhd2FpdCB0aGlzLnJlZnJlc2hNZXNoR3JvdXAoKTtcclxuXHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLm1lc2hHcm91cCk7XHJcbiAgICB0aGlzLmVsZVJlZi5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcbiAgICB0aGlzLnNldFNpemVzKCk7XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcclxuICAgICAgdGhpcy5pc1JlbmRlcmVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5yZW5kZXJlZC5lbWl0KCk7XHJcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVmcmVzaE1lc2hHcm91cCgpIHtcclxuICAgIHRoaXMubWVzaEdyb3VwLnJlbW92ZSguLi50aGlzLm1lc2hHcm91cC5jaGlsZHJlbik7XHJcbiAgICBjb25zdCBtZXNoQ3JlYXRpb25zID0gdGhpcy5zdGxNb2RlbHNcclxuICAgICAgLmZpbHRlcigoeCkgPT4geClcclxuICAgICAgLm1hcCgobW9kZWxQYXRoLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU1lc2gobW9kZWxQYXRoLCB0aGlzLm1lc2hPcHRpb25zW2luZGV4XSk7XHJcbiAgICAgIH0pO1xyXG4gICAgY29uc3QgbWVzaGVzOiBUSFJFRS5PYmplY3QzRFtdID0gYXdhaXQgUHJvbWlzZS5hbGwobWVzaENyZWF0aW9ucyk7XHJcblxyXG4gICAgbWVzaGVzLm1hcCgobWVzaCkgPT4gdGhpcy5tZXNoR3JvdXAuYWRkKG1lc2gpKTtcclxuICAgIHRoaXMucm90YXRlKFJvdGF0ZURpcmVjdGlvbi5ub25lKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNyZWF0ZU1lc2goXHJcbiAgICBwYXRoOiBzdHJpbmcgfCBBcnJheUJ1ZmZlcixcclxuICAgIG1lc2hPcHRpb25zOiBNZXNoT3B0aW9ucyA9IHt9XHJcbiAgKTogUHJvbWlzZTxUSFJFRS5NZXNoPiB7XHJcbiAgICBjb25zdCBnZW9tZXRyeTogVEhSRUUuQnVmZmVyR2VvbWV0cnkgPVxyXG4gICAgICB0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IGF3YWl0IHRoaXMuc3RsTG9hZGVyLmxvYWRBc3luYyhwYXRoKVxyXG4gICAgICAgIDogYXdhaXQgdGhpcy5zdGxMb2FkZXIucGFyc2UocGF0aCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICBnZW9tZXRyeS5jZW50ZXIoKTtcclxuICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gZ2VvbWV0cnkuYm91bmRpbmdCb3gubWF4O1xyXG4gICAgdGhpcy5kaXN0YW5jZSA9IE1hdGgubWF4KHgsIHksIHopICogMTA7XHJcblxyXG4gICAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAgIG1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCksIC1NYXRoLlBJIC8gMik7XHJcbiAgICBjb25zdCB2ZWN0b3JPcHRpb25zID0gWydwb3NpdGlvbicsICdzY2FsZScsICd1cCddO1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRNZXNoT3B0aW9ucywgbWVzaE9wdGlvbnMpO1xyXG5cclxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9wdGlvbnMpLmZvckVhY2goKG9wdGlvbikgPT4ge1xyXG4gICAgICBpZiAodmVjdG9yT3B0aW9ucy5pbmRleE9mKG9wdGlvbikgPiAtMSkge1xyXG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG9wdGlvbnNbb3B0aW9uXSBhcyBWZWN0b3IzO1xyXG4gICAgICAgIGNvbnN0IG1lc2hWZWN0b3JPcHRpb24gPSBtZXNoW29wdGlvbl0gYXMgVmVjdG9yMztcclxuICAgICAgICBtZXNoVmVjdG9yT3B0aW9uLnNldCh2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtZXNoW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBtZXNoO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyID0gKCkgPT4ge1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gIH07XHJcblxyXG4gIHNldFNpemVzKCkge1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmVsZVJlZi5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5lbGVSZWYubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2lkdGggLyBoZWlnaHQ7XHJcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gIH1cclxuXHJcbiAgb25XaW5kb3dSZXNpemUgPSAoKSA9PiB7XHJcbiAgICB0aGlzLnNldFNpemVzKCk7XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG4gIH07XHJcbn1cclxuIl19