import fs from 'node:fs/promises';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { DOMParser } from 'linkedom';

globalThis.DOMParser = DOMParser;
globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const out = new URL('../assets/233-icon-3d.glb', import.meta.url);
const svg = await fs.readFile(new URL('./logo.svg', import.meta.url), 'utf8');

function roundedRect(size, radius) {
  const h = size / 2;
  const r = radius;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false);
  s.lineTo(h, h - r);
  s.absarc(h - r, h - r, r, 0, Math.PI / 2, false);
  s.lineTo(-h + r, h);
  s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-h, -h + r);
  s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}

const root = new THREE.Group();
root.name = '233_icon';

const depth = 8.8;
const bevel = 0.8;
const bodyShape = roundedRect(70.4, 14.1);
const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
  depth,
  steps: 1,
  curveSegments: 24,
  bevelEnabled: true,
  bevelThickness: bevel,
  bevelSize: bevel,
  bevelSegments: 3,
});
bodyGeo.translate(0, 0, -depth / 2);
bodyGeo.computeVertexNormals();
const pos = bodyGeo.getAttribute('position');
const colors = new Float32Array(pos.count * 3);
const gradientStart = { x: -46.7802, y: -11.1316 };
const gradientEnd = { x: -7.2356, y: 60.0271 };
const gradientDx = gradientEnd.x - gradientStart.x;
const gradientDy = gradientEnd.y - gradientStart.y;
const gradientLengthSquared = gradientDx ** 2 + gradientDy ** 2;
for (let i = 0; i < pos.count; i++) {
  const svgX = pos.getX(i) + 36;
  const svgY = 36 - pos.getY(i);
  const t = THREE.MathUtils.clamp(
    ((svgX - gradientStart.x) * gradientDx + (svgY - gradientStart.y) * gradientDy) / gradientLengthSquared,
    0, 1,
  );
  const green = (170 * (1 - t) + 77 * t) / 255;
  const c = new THREE.Color().setRGB(1, green, 0, THREE.SRGBColorSpace);
  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;
}
bodyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const faceMaterial = new THREE.MeshBasicMaterial({
  color: '#ffffff', vertexColors: true,
});
const edgeMaterial = new THREE.MeshPhysicalMaterial({
  color: '#ffffff', vertexColors: true,
  metalness: 0.62, roughness: 0.30,
  clearcoat: 0.08, clearcoatRoughness: 0.28,
});
const body = new THREE.Mesh(bodyGeo, [faceMaterial, edgeMaterial]);
body.name = 'orange_rounded_body';
root.add(body);

const loaded = new SVGLoader().parse(svg);
const shapes = loaded.paths.flatMap(path => path.toShapes());
if (!shapes.length) throw new Error('The 233 SVG did not produce any shapes.');
const logoGeo = new THREE.ExtrudeGeometry(shapes, {
  depth: 0.34,
  steps: 1,
  curveSegments: 18,
  bevelEnabled: true,
  bevelSize: 0.06,
  bevelThickness: 0.06,
  bevelSegments: 2,
});
logoGeo.rotateX(Math.PI);
logoGeo.computeVertexNormals();
const bodyFront = depth / 2 + bevel;

const logo = new THREE.Mesh(logoGeo, [
  new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  new THREE.MeshPhysicalMaterial({ color: '#f9d8bc', roughness: 0.43, metalness: 0 }),
]);
logo.name = '233_exact_svg_lettering';
logo.position.set(-36, 36, bodyFront + 0.18);
root.add(logo);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(root, { binary: true, onlyVisible: true, maxTextureSize: 1024 });
await fs.writeFile(out, Buffer.from(result));
console.log(JSON.stringify({ out: out.pathname, bytes: result.byteLength, shapes: shapes.length,
  bodyVertices: bodyGeo.getAttribute('position').count,
  logoVertices: logoGeo.getAttribute('position').count }));
