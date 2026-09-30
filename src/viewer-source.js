import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

(async () => {
const MODEL_BASE64 = '__GLB_BASE64__';
const stage = document.querySelector('#stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
camera.position.set(0, 0, 238);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
stage.appendChild(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1;

scene.add(new THREE.HemisphereLight('#fff7e8', '#601807', 1.45));
const key = new THREE.DirectionalLight('#ffffff', 1.7);
key.position.set(-70, 80, 100);
scene.add(key);
const fill = new THREE.DirectionalLight('#ffb263', 0.5);
fill.position.set(70, -10, 70);
scene.add(fill);
const rim = new THREE.DirectionalLight('#ffffff', 0.75);
rim.position.set(-40, 20, -80);
scene.add(rim);

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const chars = atob(MODEL_BASE64);
const bytes = new Uint8Array(chars.length);
for (let i = 0; i < chars.length; i++) bytes[i] = chars.charCodeAt(i);
const model = await new GLTFLoader().parseAsync(bytes.buffer, '');
const icon = model.scene;
scene.add(icon);

let pointerX = 0;
let pointerY = 0;
window.addEventListener('pointermove', (e) => {
  pointerX = THREE.MathUtils.clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
  pointerY = THREE.MathUtils.clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
});
window.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
renderer.setAnimationLoop(() => {
  const tx = reducedMotion.matches ? 0.12 : 0.12 - pointerY * 0.20;
  const ty = reducedMotion.matches ? -0.26 : -0.26 + pointerX * 0.38;
  const tz = reducedMotion.matches ? 0.04 : 0.04 - pointerX * 0.045;
  icon.rotation.x = THREE.MathUtils.lerp(icon.rotation.x, tx, 0.085);
  icon.rotation.y = THREE.MathUtils.lerp(icon.rotation.y, ty, 0.085);
  icon.rotation.z = THREE.MathUtils.lerp(icon.rotation.z, tz, 0.085);
  renderer.render(scene, camera);
});
document.body.dataset.ready = 'true';
})();
