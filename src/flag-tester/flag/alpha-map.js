import * as THREE from 'three';

const SILK_W = 475;
const SILK_H = 376;
const SVG_PATH = 'M0 300.046V0.228508C20.6951 -0.683218 94.7064 0.649305 225.191 13.2732C355.675 25.8971 442.454 61.5947 469.533 77.8655C476.057 208.944 476.478 290.578 469.533 376C455.222 363.236 403.5 341 306.007 319.878C210.324 299.148 63.5 300.046 0 300.046Z';

export function createAlphaMap() {
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = SILK_W * scale;
  canvas.height = SILK_H * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, SILK_W, SILK_H);

  const path = new Path2D(SVG_PATH);
  ctx.fillStyle = 'white';
  ctx.fill(path);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.NoColorSpace;

  return texture;
}
