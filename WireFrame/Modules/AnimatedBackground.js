/*
    Brain Background
    author: tomikjetu
*/

// 🔧 Settings🔧

const BRAIN_MODEL = "WireFrame/Assets/brain.gltf";
const POINTS_SPRITE = 'WireFrame/Assets/point.png';

const SCALE = 0.017; // DEPENDS ON THE MODEL YOU LOAD.
const POSITION_X = 0;
const POSITION_Y = 0.6; // DEPENDS ON THE MODEL YOU LOAD.
const POSITION_Z = 0;

const ENABLE_LINES = false;
const ENABLE_POINTS = true;

// Change the backgroud color in Canvas.css
const LINES_COLOR = 0x5CF8FF; // Hexadecimal number 
const POINTS_COLOR = 0x5CF8FF;

const LINE_WIDTH = 0.4;
const POINTS_SIZE = 4;

const ROTATION_SPEED = 25;
const RING_SPEED = 40;

// ⚠️ Only touch the code below if you know what you're doing ⚠️

import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { LineMaterial } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/LineSegmentsGeometry.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";

var Scene = new THREE.Scene();
var Camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.01, 10);
Camera.position.set(0, 1, 2);

var SceneCanvas = document.createElement("canvas");
SceneCanvas.id = "AnimatedBackground";
document.body.append(SceneCanvas);

//CREATE RENDERER
var Renderer = new THREE.WebGLRenderer({ antialias: true, canvas: SceneCanvas, alpha: true });
Renderer.outputEncoding = THREE.sRGBEncoding;
Renderer.setSize(window.innerWidth, window.innerHeight);
Renderer.setPixelRatio(window.devicePixelRatio);
Renderer.setClearColor(0x000000, 0.0);

const sprite = new THREE.TextureLoader().load(POINTS_SPRITE);
const lineMaterial = new LineMaterial({ color: LINES_COLOR, linewidth: LINE_WIDTH });
const brainMaterial = new THREE.PointsMaterial({
    color: POINTS_COLOR,
    size: POINTS_SIZE,
    sizeAttenuation: false,
    map: sprite,
    alphaTest: 0.5,
    transparent: true
});
const ringMaterial = new THREE.PointsMaterial({
    color: POINTS_COLOR,
    size: POINTS_SIZE / 100,
    map: sprite,
    alphaTest: 0.5,
    transparent: true
})
brainMaterial.color.setHex(POINTS_COLOR)
const loader = new GLTFLoader();

var Brain;
loader.load(BRAIN_MODEL, function (gltf) {
    Brain = gltf.scene;
    Scene.add(Brain);
    Brain.scale.set(SCALE, SCALE, SCALE);
    Brain.position.set(POSITION_X, POSITION_Y, POSITION_Z);
    Brain.traverse(function (child) {
        if (child.isMesh) {
            if (ENABLE_LINES) {
                const edges = new THREE.EdgesGeometry(child.geometry);
                const lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(edges);
                const edgesLines = new LineSegments2(lineGeometry, lineMaterial);
                Brain.add(edgesLines);
            }
            if (ENABLE_POINTS) {
                const particles = new THREE.Points(child.geometry, brainMaterial)
                Brain.add(particles)
            }
        }
    });
}, undefined, function (error) {
    console.error(error);
});

const geometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];
var maps = [];

const color = new THREE.Color();
color.setHex(POINTS_COLOR);
let points;

for (let i = 0; i < 400; i++) {
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 2 - 0.5;
    const z = Math.random() * 10 - 5;

    positions.push(x, y, z);

    colors.push(color.r, color.g, color.b);
    maps.push(POINTS_SPRITE);
}


geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry.computeBoundingSphere();
points = new THREE.Points(geometry, ringMaterial);
Scene.add(points);

function UpdateRing() {
    for (var i = 0; i < positions.length; i += 3) {
        var x = positions[i + 0];
        var y = positions[i + 2];
        var radius = Math.sqrt(x * x + y * y);

        var dy = x - 0;
        var dx = y - 0;
        var theta = Math.atan2(dy, dx);
        theta += RING_SPEED / 20000;

        x = radius * Math.sin(theta)
        y = radius * Math.cos(theta)
        positions[i + 0] = x;
        positions[i + 2] = y;
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    points = new THREE.Points(geometry, ringMaterial);
}


Renderer.setAnimationLoop(() => {
    lineMaterial.resolution.set(innerWidth, innerHeight);
    if (Brain) Brain.rotation.y += ROTATION_SPEED / 20000;
    UpdateRing();
    Renderer.render(Scene, Camera);
})

OnWindowResize(); addEventListener("resize", OnWindowResize);

function OnWindowResize() {
    Renderer.setSize(window.innerWidth, window.innerHeight);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = Camera.top - Camera.bottom;
    Camera.aspect = window.innerWidth / window.innerHeight;
    Camera.left = - frustumHeight * aspect / 2;
    Camera.right = frustumHeight * aspect / 2;


    Camera.updateProjectionMatrix();
}
