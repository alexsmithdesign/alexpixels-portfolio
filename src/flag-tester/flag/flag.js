import { Flag3DScene } from './flag3d.js';

let scene3d = null;

const SILK_W = 475;
const SILK_H = 376;

const state = {
  playing: false,
  direction: 'ccw',
  imageSrc: new URL('../assets/default-silk.png', import.meta.url).href,
  placement: null,
  flagCount: 1,
  syncMode: 'unison',
};

function computeCoverPlacement(natW, natH) {
  const scale = Math.max(SILK_W / natW, SILK_H / natH);
  return {
    x: (SILK_W - natW * scale) / 2,
    y: (SILK_H - natH * scale) / 2,
    scale,
  };
}

export async function initFlag() {
  const stage = document.getElementById('flag-stage');
  scene3d = new Flag3DScene(stage, state);
  await scene3d.init();
}

export function setPlaying(playing) {
  state.playing = playing;
  scene3d.setPlaying(playing);
}

export function setDirection(dir) {
  state.direction = dir;
  scene3d.setDirection(dir);
}

export function setSilkImage(src) {
  state.imageSrc = src;
  state.placement = null;
  scene3d.setSilkImage(src);
}

export function getImageSrc() {
  return state.imageSrc;
}

export function setPlacement(x, y, scale) {
  state.placement = { x, y, scale };
  scene3d.setPlacement(x, y, scale);
}

export function getCoverPlacement(natW, natH) {
  return computeCoverPlacement(natW, natH);
}

export function getPlacement() {
  return state.placement ? { ...state.placement } : null;
}

export function setFlagCount(count) {
  if (count === state.flagCount) return;
  state.flagCount = count;
  scene3d.setFlagCount(count);
}

export function setSyncMode(mode) {
  state.syncMode = mode;
  scene3d.setSyncMode(mode);
}

export function getFlagCount() {
  return state.flagCount;
}

export function getSyncMode() {
  return state.syncMode;
}

export function setSpinDuration(ms) {
  scene3d.setSpinDuration(ms);
}

export function setZoom(level) {
  scene3d.setZoom(level);
}

export function setPoleColor(hex) {
  scene3d.setPoleColor(hex);
}
