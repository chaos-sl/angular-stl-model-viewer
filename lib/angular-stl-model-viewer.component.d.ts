import { ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
export declare enum RotateDirection {
    up = 0,
    right = 1,
    down = 2,
    left = 3,
    none = 4
}
export declare enum ZoomDirection {
    in = 0,
    out = 1
}
export interface MeshOptions {
    castShadow?: boolean;
    position?: THREE.Vector3;
    receiveShadow?: boolean;
    scale?: THREE.Vector3;
    up?: THREE.Vector3;
    userData?: {
        [key: string]: any;
    };
    visible?: boolean;
}
export declare class StlModelViewerComponent implements OnInit, OnDestroy {
    private cdr;
    private eleRef;
    private ngZone;
    private _models;
    set stlModels(models: string[]);
    get stlModels(): string[];
    hasControls: boolean;
    camera: THREE.PerspectiveCamera;
    cameraTarget: THREE.Vector3;
    light: THREE.Light;
    material: THREE.Material;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    controls: any | null;
    meshOptions: MeshOptions[];
    rendered: EventEmitter<void>;
    xzAngle: number;
    yzAngle: number;
    distance: number;
    zoomFactor: number;
    texture: THREE.CubeTexture;
    hasWebGL: boolean;
    meshGroup: THREE.Object3D;
    isRendered: boolean;
    showStlModel: boolean;
    stlLoader: STLLoader;
    lightProbe: THREE.LightProbe;
    constructor(cdr: ChangeDetectorRef, eleRef: ElementRef, ngZone: NgZone);
    private genCubeUrls;
    ngOnInit(): void;
    ngOnDestroy(): void;
    zoom(direction: ZoomDirection, stepCount?: number): void;
    rotate(direction: RotateDirection, stepCount?: number): void;
    private init;
    refreshMeshGroup(): Promise<void>;
    createMesh(path: string, meshOptions?: MeshOptions): Promise<THREE.Mesh>;
    render: () => void;
    setSizes(): void;
    onWindowResize: () => void;
}
