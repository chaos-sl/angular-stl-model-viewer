import { __awaiter } from "tslib";
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
const MATERIAL_0 = (color = 0xffffff) => new THREE.MeshPhongMaterial({
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
export class StlSnapshotService {
    constructor(file, ppmm) {
        this.file = file;
        this.ppmm = ppmm;
        this.canvas = document.createElement('canvas');
        this.stlLoader = new STLLoader();
        this.scene = new THREE.Scene();
        this.objects = new THREE.Group();
        this.lights = new THREE.Group();
        this.sideLength = 0;
        this.distance = 10;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.file instanceof File) {
                this.file = yield new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsArrayBuffer(this.file);
                });
            }
            return this.file;
        });
    }
    snapshot(fileSave) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init(yield this.read());
            return yield this.shot(fileSave);
        });
    }
    init(data) {
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
        this.lights.add(LIGHT_0, LIGHT_1, LIGHT_2, LIGHT_3, LIGHT_5, LIGHT_6, LIGHT_7);
        this.camera.add(LIGHT_4);
        const mesh = new THREE.Mesh(this.geometry, MATERIAL_0(0xffffff));
        mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        this.objects.add(mesh);
        this.scene.add(this.camera, this.objects, this.lights);
        this.renderer.render(this.scene, this.camera);
    }
    shot(fileSave) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield new Promise((resolve, reject) => setTimeout(resolve));
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
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RsLXNuYXBzaG90LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLXN0bC1tb2RlbC12aWV3ZXIvc3JjL2xpYi9zdGwtc25hcHNob3Quc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRWpFLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsRUFBRSxFQUFFLENBQ3RDLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0lBQzFCLEtBQUs7SUFDTCxXQUFXLEVBQUUsSUFBSTtJQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLFVBQVU7SUFDdEIsU0FBUyxFQUFFLEtBQUs7Q0FDakIsQ0FBQyxDQUFDO0FBQ0wsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0RCxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRCxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNELE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDMUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQVE5QyxNQUFNLE9BQU8sa0JBQWtCO0lBWTdCLFlBQW9CLElBQXdCLEVBQVUsSUFBWTtRQUE5QyxTQUFJLEdBQUosSUFBSSxDQUFvQjtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFYbEUsV0FBTSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRzdELGNBQVMsR0FBYyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ3ZDLFVBQUssR0FBZ0IsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsWUFBTyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLFdBQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsYUFBUSxHQUFHLEVBQUUsQ0FBQztJQUV1RCxDQUFDO0lBQ2hFLElBQUk7O1lBQ1IsSUFBSSxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksRUFBRTtnQkFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO29CQUNoQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBcUIsQ0FBQyxDQUFDO29CQUM1RCxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQVksQ0FBQyxDQUFDO2dCQUM5QyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBbUIsQ0FBQztRQUNsQyxDQUFDO0tBQUE7SUFDSyxRQUFRLENBQUMsUUFBaUM7O1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM3QixPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQUE7SUFDTyxJQUFJLENBQUMsSUFBaUI7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDdEMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDdEMsS0FBSyxFQUFFLElBQUk7WUFDWCxTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtTQUNwQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ2IsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxDQUNSLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNhLElBQUksQ0FBQyxRQUFpQzs7WUFDbEQsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sU0FBUyxHQUFHO2dCQUNoQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNyQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ3ZCLENBQUM7WUFFRixLQUFLLE1BQU0sQ0FBQyxJQUFJLFNBQVMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksUUFBUSxFQUFFO29CQUNaLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzNEO2FBQ0Y7WUFDRCxPQUFPO2dCQUNMLE1BQU07Z0JBQ04sVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDaEIsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xyXG5pbXBvcnQgeyBCdWZmZXJHZW9tZXRyeSB9IGZyb20gJ3RocmVlJztcclxuaW1wb3J0IHsgU1RMTG9hZGVyIH0gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL2xvYWRlcnMvU1RMTG9hZGVyJztcclxuXHJcbmNvbnN0IE1BVEVSSUFMXzAgPSAoY29sb3IgPSAweGZmZmZmZikgPT5cclxuICBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgY29sb3IsXHJcbiAgICBmbGF0U2hhZGluZzogdHJ1ZSxcclxuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICB3aXJlZnJhbWU6IGZhbHNlLFxyXG4gIH0pO1xyXG5jb25zdCBMSUdIVF8wID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZiwgMC4zKTtcclxuY29uc3QgTElHSFRfMSA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjE1KTtcclxuTElHSFRfMS5wb3NpdGlvbi5zZXQoLTEwMCwgLTEwMCwgMTAwKTtcclxuTElHSFRfMS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG5jb25zdCBMSUdIVF8yID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuMTUpO1xyXG5MSUdIVF8yLnBvc2l0aW9uLnNldCgxMDAsIC0xMDAsIC0xMDApO1xyXG5MSUdIVF8yLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbmNvbnN0IExJR0hUXzMgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC4xNSk7XHJcbkxJR0hUXzMucG9zaXRpb24uc2V0KC0xMDAsIDEwMCwgLTEwMCk7XHJcbkxJR0hUXzMubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuY29uc3QgTElHSFRfNSA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjE1KTtcclxuTElHSFRfNS5wb3NpdGlvbi5zZXQoLTEwMCwgMTAwLCAxMDApO1xyXG5MSUdIVF81Lmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbmNvbnN0IExJR0hUXzYgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC4xNSk7XHJcbkxJR0hUXzYucG9zaXRpb24uc2V0KDEwMCwgLTEwMCwgMTAwKTtcclxuTElHSFRfNi5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG5jb25zdCBMSUdIVF83ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuMTUpO1xyXG5MSUdIVF83LnBvc2l0aW9uLnNldCgxMDAsIDEwMCwgLTEwMCk7XHJcbkxJR0hUXzcubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuY29uc3QgTElHSFRfNCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjQpO1xyXG5MSUdIVF80LnBvc2l0aW9uLnNldCg1MCwgNTAsIDApO1xyXG5MSUdIVF80Lmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygtMTAwLCAwLCAwKSk7XHJcblxyXG5leHBvcnQgdHlwZSBTbmFwU2hvdFJlc3VsdCA9IHtcclxuICBpbWFnZXM6IHN0cmluZ1tdO1xyXG4gIHNpZGVMZW5ndGg6IG51bWJlcjtcclxuICBwcG1tOiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgU3RsU25hcHNob3RTZXJ2aWNlIHtcclxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgcmVuZGVyZXI6IFRIUkVFLldlYkdMUmVuZGVyZXI7XHJcbiAgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYTtcclxuICBzdGxMb2FkZXI6IFNUTExvYWRlciA9IG5ldyBTVExMb2FkZXIoKTtcclxuICBzY2VuZTogVEhSRUUuU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICBvYmplY3RzID0gbmV3IFRIUkVFLkdyb3VwKCk7XHJcbiAgbGlnaHRzID0gbmV3IFRIUkVFLkdyb3VwKCk7XHJcbiAgZ2VvbWV0cnk6IEJ1ZmZlckdlb21ldHJ5O1xyXG4gIHNpZGVMZW5ndGggPSAwO1xyXG4gIGRpc3RhbmNlID0gMTA7XHJcbiAgY2VudGVyOiBUSFJFRS5WZWN0b3IzO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZTogRmlsZSB8IEFycmF5QnVmZmVyLCBwcml2YXRlIHBwbW06IG51bWJlcikge31cclxuICBhc3luYyByZWFkKCk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcclxuICAgIGlmICh0aGlzLmZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XHJcbiAgICAgIHRoaXMuZmlsZSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQgYXMgQXJyYXlCdWZmZXIpO1xyXG4gICAgICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcih0aGlzLmZpbGUgYXMgRmlsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZmlsZSBhcyBBcnJheUJ1ZmZlcjtcclxuICB9XHJcbiAgYXN5bmMgc25hcHNob3QoZmlsZVNhdmU/OiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxTbmFwU2hvdFJlc3VsdD4ge1xyXG4gICAgdGhpcy5pbml0KGF3YWl0IHRoaXMucmVhZCgpKTtcclxuICAgIHJldHVybiBhd2FpdCB0aGlzLnNob3QoZmlsZVNhdmUpO1xyXG4gIH1cclxuICBwcml2YXRlIGluaXQoZGF0YTogQXJyYXlCdWZmZXIpIHtcclxuICAgIHRoaXMuZ2VvbWV0cnkgPSB0aGlzLnN0bExvYWRlci5wYXJzZShkYXRhKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmNlbnRlcigpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcclxuICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcy5nZW9tZXRyeS5ib3VuZGluZ0JveC5tYXg7XHJcbiAgICB0aGlzLmRpc3RhbmNlID0gTWF0aC5tYXgoeCwgeSwgeikgKiAxMDtcclxuICAgIGNvbnN0IHsgY2VudGVyLCByYWRpdXMgfSA9IHRoaXMuZ2VvbWV0cnkuYm91bmRpbmdTcGhlcmU7XHJcbiAgICB0aGlzLmNlbnRlciA9IGNlbnRlcjtcclxuICAgIHRoaXMuc2lkZUxlbmd0aCA9IHJhZGl1cyAqIDI7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuc2lkZUxlbmd0aCAqIHRoaXMucHBtbTtcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XHJcbiAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICBhbnRpYWxpYXM6IHRydWUsXHJcbiAgICAgIGNhbnZhczogdGhpcy5jYW52YXMsXHJcbiAgICB9KTtcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDE1LCAxKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnNldCgwLCB0aGlzLmRpc3RhbmNlLCAwKTtcclxuICAgIHRoaXMuY2FtZXJhLmxvb2tBdChjZW50ZXIpO1xyXG4gICAgdGhpcy5saWdodHMuYWRkKFxyXG4gICAgICBMSUdIVF8wLFxyXG4gICAgICBMSUdIVF8xLFxyXG4gICAgICBMSUdIVF8yLFxyXG4gICAgICBMSUdIVF8zLFxyXG4gICAgICBMSUdIVF81LFxyXG4gICAgICBMSUdIVF82LFxyXG4gICAgICBMSUdIVF83XHJcbiAgICApO1xyXG4gICAgdGhpcy5jYW1lcmEuYWRkKExJR0hUXzQpO1xyXG4gICAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIE1BVEVSSUFMXzAoMHhmZmZmZmYpKTtcclxuICAgIG1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCksIC1NYXRoLlBJIC8gMik7XHJcbiAgICB0aGlzLm9iamVjdHMuYWRkKG1lc2gpO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5jYW1lcmEsIHRoaXMub2JqZWN0cywgdGhpcy5saWdodHMpO1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gIH1cclxuICBwcml2YXRlIGFzeW5jIHNob3QoZmlsZVNhdmU/OiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICBjb25zdCBpbWFnZXMgPSBbXTtcclxuICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtcclxuICAgICAgWzAsIHRoaXMuZGlzdGFuY2UsIDBdLFxyXG4gICAgICBbMCwgLXRoaXMuZGlzdGFuY2UsIDBdLFxyXG4gICAgICBbdGhpcy5kaXN0YW5jZSwgMCwgMF0sXHJcbiAgICAgIFstdGhpcy5kaXN0YW5jZSwgMCwgMF0sXHJcbiAgICAgIFswLCAwLCB0aGlzLmRpc3RhbmNlXSxcclxuICAgICAgWzAsIDAsIC10aGlzLmRpc3RhbmNlXSxcclxuICAgIF07XHJcblxyXG4gICAgZm9yIChjb25zdCBwIG9mIHBvc2l0aW9ucykge1xyXG4gICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQocFswXSwgcFsxXSwgcFsyXSk7XHJcbiAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLmNlbnRlcik7XHJcbiAgICAgIHRoaXMuY2FtZXJhLnVwLnNldCgwLCAwLCBwLnNvbWUoKHgpID0+IHggPiAwKSA/IC0xIDogMSk7XHJcbiAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBzZXRUaW1lb3V0KHJlc29sdmUpKTtcclxuICAgICAgY29uc3QgZGF0YVVSTCA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XHJcbiAgICAgIGltYWdlcy5wdXNoKGRhdGFVUkwpO1xyXG4gICAgICBpZiAoZmlsZVNhdmUpIHtcclxuICAgICAgICBmaWxlU2F2ZShkYXRhVVJMLnJlcGxhY2UoL15kYXRhOmltYWdlXFwvXFx3KztiYXNlNjQsLywgJycpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBzaWRlTGVuZ3RoOiB0aGlzLnNpZGVMZW5ndGgsXHJcbiAgICAgIHBwbW06IHRoaXMucHBtbSxcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==