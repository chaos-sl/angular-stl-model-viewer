import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
export declare type SnapShotResult = {
    images: string[];
    sideLength: number;
    ppmm: number;
};
export declare class StlSnapshotService {
    private file;
    private ppmm;
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    stlLoader: STLLoader;
    scene: THREE.Scene;
    objects: THREE.Group;
    lights: THREE.Group;
    geometry: BufferGeometry;
    sideLength: number;
    constructor(file: File | ArrayBuffer, ppmm: number);
    read(): Promise<ArrayBuffer>;
    snapshot(fileSave?: (data: string) => void): Promise<SnapShotResult>;
    private init;
    private shot;
}
