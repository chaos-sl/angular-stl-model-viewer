(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('three'), require('three/examples/jsm/loaders/STLLoader'), require('three/examples/jsm/controls/OrbitControls'), require('three/examples/jsm/lights/LightProbeGenerator.js')) :
    typeof define === 'function' && define.amd ? define('angular-stl-model-viewer', ['exports', '@angular/core', 'three', 'three/examples/jsm/loaders/STLLoader', 'three/examples/jsm/controls/OrbitControls', 'three/examples/jsm/lights/LightProbeGenerator.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['angular-stl-model-viewer'] = {}, global.ng.core, global.THREE, global.STLLoader, global.OrbitControls, global.LightProbeGenerator_js));
}(this, (function (exports, core, THREE, STLLoader, OrbitControls, LightProbeGenerator_js) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    (function (RotateDirection) {
        RotateDirection[RotateDirection["up"] = 0] = "up";
        RotateDirection[RotateDirection["right"] = 1] = "right";
        RotateDirection[RotateDirection["down"] = 2] = "down";
        RotateDirection[RotateDirection["left"] = 3] = "left";
        RotateDirection[RotateDirection["none"] = 4] = "none";
    })(exports.RotateDirection || (exports.RotateDirection = {}));
    (function (ZoomDirection) {
        ZoomDirection[ZoomDirection["in"] = 0] = "in";
        ZoomDirection[ZoomDirection["out"] = 1] = "out";
    })(exports.ZoomDirection || (exports.ZoomDirection = {}));
    var defaultMeshOptions = {
        castShadow: true,
        position: new THREE.Vector3(0, 0, 0),
        receiveShadow: true,
        scale: new THREE.Vector3(1, 1, 1),
    };
    function isWebGLAvailable() {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        }
        catch (e) {
            return false;
        }
    }
    var StlModelViewerComponent = /** @class */ (function () {
        function StlModelViewerComponent(cdr, eleRef, ngZone) {
            var _this = this;
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
            this.rendered = new core.EventEmitter();
            this.xzAngle = 0; // Azimuthal angle
            this.yzAngle = 0; // Polar angle
            this.distance = 10; // PerspectiveCamera distance
            this.zoomFactor = 0; // OrthographicCamera zoom
            this.hasWebGL = isWebGLAvailable();
            this.meshGroup = new THREE.Object3D();
            this.isRendered = false;
            this.showStlModel = true;
            this.stlLoader = new STLLoader.STLLoader();
            this.lightProbe = new THREE.LightProbe(undefined, 1);
            this.render = function () {
                _this.renderer.render(_this.scene, _this.camera);
            };
            this.onWindowResize = function () {
                _this.setSizes();
                _this.render();
            };
            this.cdr.detach();
            // default light position
            this.light.position.set(10, 10, 10);
            // default camera position
            this.camera.position.set(0, this.distance, 0);
            this.camera.lookAt(0, 0, 0);
            // default scene background
            this.scene.background = new THREE.Color(0xdcdcdc);
            new THREE.CubeTextureLoader().load(this.genCubeUrls('assets/', '.png'), function (cubeTexture) {
                cubeTexture.encoding = THREE.sRGBEncoding;
                _this.lightProbe.copy(LightProbeGenerator_js.LightProbeGenerator.fromCubeTexture(cubeTexture));
                // this.scene.background = cubeTexture;
                _this.texture = cubeTexture;
                _this.material = new THREE.MeshStandardMaterial({
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
        Object.defineProperty(StlModelViewerComponent.prototype, "stlModels", {
            get: function () {
                return this._models;
            },
            set: function (models) {
                this._models = models;
                this.refreshMeshGroup();
            },
            enumerable: false,
            configurable: true
        });
        // envmap
        StlModelViewerComponent.prototype.genCubeUrls = function (prefix, postfix) {
            return [
                prefix + 'bg' + postfix,
                prefix + 'bg' + postfix,
                prefix + 'bg' + postfix,
                prefix + 'bg' + postfix,
                prefix + 'bg' + postfix,
                prefix + 'bg' + postfix,
            ];
        };
        StlModelViewerComponent.prototype.ngOnInit = function () {
            var _this = this;
            if (!this.hasWebGL) {
                console.error('stl-model-viewer: Seems like your system does not support webgl.');
                return;
            }
            this.ngZone.runOutsideAngular(function () {
                _this.init();
            });
        };
        StlModelViewerComponent.prototype.ngOnDestroy = function () {
            var _this = this;
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
                this.scene.children.forEach(function (child) {
                    _this.scene.remove(child);
                });
                this.scene.dispose();
            }
        };
        StlModelViewerComponent.prototype.zoom = function (direction, stepCount) {
            if (stepCount === void 0) { stepCount = 1; }
            if (this.camera instanceof THREE.PerspectiveCamera) {
                switch (direction) {
                    case exports.ZoomDirection.in:
                        this.distance += stepCount;
                        break;
                    case exports.ZoomDirection.out:
                        this.distance -= stepCount;
                        break;
                }
                this.distance = this.distance < 0 ? 0 : this.distance;
            }
            this.rotate(exports.RotateDirection.none);
        };
        StlModelViewerComponent.prototype.rotate = function (direction, stepCount) {
            if (stepCount === void 0) { stepCount = 1; }
            var step = 0;
            switch (direction) {
                case exports.RotateDirection.up:
                    step = 0.1;
                    break;
                case exports.RotateDirection.right:
                    this.xzAngle += 0.1;
                    break;
                case exports.RotateDirection.down:
                    step = -0.1;
                    break;
                case exports.RotateDirection.left:
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
        };
        StlModelViewerComponent.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.scene.add(this.lightProbe);
                            this.camera.add(this.light);
                            this.scene.add(this.camera);
                            // use default controls
                            if (this.hasControls && !this.controls) {
                                this.controls = new OrbitControls.OrbitControls(this.camera, this.renderer.domElement);
                                this.controls.enableZoom = true;
                                this.controls.addEventListener('change', this.render);
                            }
                            window.addEventListener('resize', this.onWindowResize, false);
                            return [4 /*yield*/, this.refreshMeshGroup()];
                        case 1:
                            _a.sent();
                            this.scene.add(this.meshGroup);
                            this.eleRef.nativeElement.appendChild(this.renderer.domElement);
                            this.setSizes();
                            this.render();
                            this.ngZone.run(function () {
                                _this.isRendered = true;
                                _this.rendered.emit();
                                _this.cdr.detectChanges();
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        StlModelViewerComponent.prototype.refreshMeshGroup = function () {
            return __awaiter(this, void 0, void 0, function () {
                var meshCreations, meshes;
                var _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            (_a = this.meshGroup).remove.apply(_a, __spread(this.meshGroup.children));
                            meshCreations = this.stlModels.map(function (modelPath, index) {
                                return _this.createMesh(modelPath, _this.meshOptions[index]);
                            });
                            return [4 /*yield*/, Promise.all(meshCreations)];
                        case 1:
                            meshes = _b.sent();
                            meshes.map(function (mesh) { return _this.meshGroup.add(mesh); });
                            this.rotate(exports.RotateDirection.none);
                            return [2 /*return*/];
                    }
                });
            });
        };
        StlModelViewerComponent.prototype.createMesh = function (path, meshOptions) {
            if (meshOptions === void 0) { meshOptions = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var geometry, _a, x, y, z, mesh, vectorOptions, options;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.stlLoader.loadAsync(path)];
                        case 1:
                            geometry = _b.sent();
                            geometry.computeBoundingBox();
                            geometry.center();
                            _a = geometry.boundingBox.max, x = _a.x, y = _a.y, z = _a.z;
                            this.distance = Math.max(x, y, z) * 10;
                            mesh = new THREE.Mesh(geometry, this.material);
                            mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
                            vectorOptions = ['position', 'scale', 'up'];
                            options = Object.assign({}, defaultMeshOptions, meshOptions);
                            Object.getOwnPropertyNames(options).forEach(function (option) {
                                if (vectorOptions.indexOf(option) > -1) {
                                    var vector = options[option];
                                    var meshVectorOption = mesh[option];
                                    meshVectorOption.set(vector.x, vector.y, vector.z);
                                }
                                else {
                                    mesh[option] = options[option];
                                }
                            });
                            return [2 /*return*/, mesh];
                    }
                });
            });
        };
        StlModelViewerComponent.prototype.setSizes = function () {
            var width = this.eleRef.nativeElement.offsetWidth;
            var height = this.eleRef.nativeElement.offsetHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        };
        return StlModelViewerComponent;
    }());
    StlModelViewerComponent.decorators = [
        { type: core.Component, args: [{
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    selector: 'stl-model-viewer',
                    template: '',
                    styles: ["\n      :host {\n        width: 100%\n        height: 100%\n        display: block\n      }\n    "]
                },] }
    ];
    StlModelViewerComponent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: core.ElementRef },
        { type: core.NgZone }
    ]; };
    StlModelViewerComponent.propDecorators = {
        stlModels: [{ type: core.Input }],
        hasControls: [{ type: core.Input }],
        camera: [{ type: core.Input }],
        cameraTarget: [{ type: core.Input }],
        light: [{ type: core.Input }],
        material: [{ type: core.Input }],
        scene: [{ type: core.Input }],
        renderer: [{ type: core.Input }],
        controls: [{ type: core.Input }],
        meshOptions: [{ type: core.Input }],
        rendered: [{ type: core.Output }]
    };

    var StlModelViewerModule = /** @class */ (function () {
        function StlModelViewerModule() {
        }
        return StlModelViewerModule;
    }());
    StlModelViewerModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [StlModelViewerComponent],
                    exports: [StlModelViewerComponent],
                    imports: [],
                },] }
    ];

    var MATERIAL_0 = function (color) {
        if (color === void 0) { color = 0xffffff; }
        return new THREE.MeshPhongMaterial({
            color: color,
            flatShading: true,
            side: THREE.DoubleSide,
            wireframe: false,
        });
    };
    var ɵ0 = MATERIAL_0;
    var LIGHT_0 = new THREE.AmbientLight(0xffffff, 0.3);
    var LIGHT_1 = new THREE.DirectionalLight(0xffffff, 0.2);
    LIGHT_1.position.set(-100, -100, 100);
    LIGHT_1.lookAt(new THREE.Vector3(0, 0, 0));
    var LIGHT_2 = new THREE.DirectionalLight(0xffffff, 0.2);
    LIGHT_2.position.set(100, 0, 0);
    LIGHT_2.lookAt(new THREE.Vector3(0, 0, 0));
    var LIGHT_3 = new THREE.DirectionalLight(0xffffff, 0.2);
    LIGHT_3.position.set(-20, 100, 0);
    LIGHT_3.lookAt(new THREE.Vector3(0, 0, 0));
    var LIGHT_4 = new THREE.DirectionalLight(0xffffff, 0.4);
    LIGHT_4.position.set(50, 50, 0);
    LIGHT_4.lookAt(new THREE.Vector3(-100, 0, 0));
    var StlSnapshotService = /** @class */ (function () {
        function StlSnapshotService(file, ppmm) {
            this.file = file;
            this.ppmm = ppmm;
            this.canvas = document.createElement('canvas');
            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                canvas: this.canvas,
            });
            this.stlLoader = new STLLoader.STLLoader();
            this.scene = new THREE.Scene();
            this.objects = new THREE.Group();
            this.lights = new THREE.Group();
            this.sideLength = 0;
        }
        StlSnapshotService.prototype.snapshot = function (fileSave) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onload = function () { return resolve(reader.result); };
                reader.readAsArrayBuffer(_this.file);
            }).then(function (data) {
                _this.init(data);
                return _this.shot(fileSave);
            });
        };
        StlSnapshotService.prototype.init = function (data) {
            this.geometry = this.stlLoader.parse(data);
            this.geometry.computeBoundingBox();
            this.geometry.center();
            this.geometry.computeBoundingSphere();
            var _a = this.geometry.boundingBox, max = _a.max, min = _a.min;
            this.sideLength = Math.ceil(Math.max(max.x - min.x, max.y - min.y, max.z - min.z));
            this.canvas.height = this.canvas.width = this.sideLength;
            this.camera = new THREE.OrthographicCamera(-this.sideLength / 2, this.sideLength / 2, this.sideLength / 2, -this.sideLength / 2, 1, 1000);
            this.camera.position.set(0, 0, 100);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.lights.add(LIGHT_0, LIGHT_1, LIGHT_2, LIGHT_3);
            this.camera.add(LIGHT_4);
            this.objects.add(new THREE.Mesh(this.geometry, MATERIAL_0(0xffffff)));
            this.scene.add(this.camera, this.objects, this.lights);
        };
        StlSnapshotService.prototype.shot = function (fileSave) {
            var e_1, _a;
            var images = [];
            var positions = [
                [0, 0, 100, -1, 0, 0],
                [0, 0, -100, 1, 0, 0],
                [0, 100, 50, 0, 0, -1],
                [100, 0, 50, 0, 0, -1],
                [0, 100, -50, 0, 0, 1],
                [100, 0, -50, 0, 0, 1],
            ];
            try {
                for (var positions_1 = __values(positions), positions_1_1 = positions_1.next(); !positions_1_1.done; positions_1_1 = positions_1.next()) {
                    var p = positions_1_1.value;
                    this.camera.position.set(p[0], p[1], p[2]);
                    this.camera.up.set(p[3], p[4], p[5]);
                    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                    this.camera.updateProjectionMatrix();
                    this.renderer.render(this.scene, this.camera);
                    var dataURL = this.canvas.toDataURL('image/png');
                    images.push(dataURL);
                    if (fileSave) {
                        fileSave(dataURL.replace(/^data:image\/\w+;base64,/, ''));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (positions_1_1 && !positions_1_1.done && (_a = positions_1.return)) _a.call(positions_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return {
                images: images,
                sideLength: this.sideLength,
                ppmm: this.ppmm,
            };
        };
        return StlSnapshotService;
    }());

    /*
     * Public API Surface of angular-stl-model-viewer
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.StlModelViewerComponent = StlModelViewerComponent;
    exports.StlModelViewerModule = StlModelViewerModule;
    exports.StlSnapshotService = StlSnapshotService;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-stl-model-viewer.umd.js.map
