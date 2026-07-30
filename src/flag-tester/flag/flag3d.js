import * as THREE from 'three';
import { createAlphaMap } from './alpha-map.js';
import waveShaderSnippet from './shaders/silk-wave.glsl?raw';

const SILK_W = 475;
const SILK_H = 376;
const FLAG_W = 475;
const FLAG_H = 612;
const PIVOT_Y = 312;
const ENSEMBLE_SCALE = 0.3;
const ENSEMBLE_GAP = 20;

export class Flag3DScene {
  constructor(stageEl, state) {
    this.stageEl = stageEl;
    this.state = state;
    this.flags = [];
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.poleMaterial = null;
    this.alphaMap = null;
    this.silkTexture = null;
    this.imageNatW = 1;
    this.imageNatH = 1;
    this.poleAngle = 0;
    this.zoomLevel = 100;
    this.spinDurationMs = 1000;
    this.lastTime = 0;
    this.animating = false;
    this.animId = null;
    this.resizeObserver = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  async init() {
    const canvasArea = this.stageEl.closest('.canvas-area');

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const { width, height } = canvasArea.getBoundingClientRect();
    this.renderer.setSize(width, height);
    this.stageEl.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    this.updateCamera();

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(200, 300, 500);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-100, 0, -300);
    this.scene.add(rimLight);

    this.poleMaterial = new THREE.MeshStandardMaterial({
      color: 0xB0B0B0,
      metalness: 0.7,
      roughness: 0.3,
    });

    this.alphaMap = createAlphaMap();

    await this.loadTexture(this.state.imageSrc);

    if (!this.state.placement) {
      const scale = Math.max(SILK_W / this.imageNatW, SILK_H / this.imageNatH);
      this.state.placement = {
        x: (SILK_W - this.imageNatW * scale) / 2,
        y: (SILK_H - this.imageNatH * scale) / 2,
        scale,
      };
    }

    this.buildSolo();

    this.renderer.render(this.scene, this.camera);

    this.resizeObserver = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (w === 0 || h === 0) return;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      if (!this.animating) this.renderer.render(this.scene, this.camera);
    });
    this.resizeObserver.observe(canvasArea);
  }

  async loadTexture(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (this.silkTexture) this.silkTexture.dispose();
        this.silkTexture = new THREE.Texture(img);
        this.silkTexture.needsUpdate = true;
        this.silkTexture.colorSpace = THREE.SRGBColorSpace;
        this.silkTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.silkTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.silkTexture.minFilter = THREE.LinearFilter;
        this.imageNatW = img.naturalWidth;
        this.imageNatH = img.naturalHeight;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  createFlagGroup(index) {
    const group = new THREE.Group();

    const rodGeo = new THREE.CylinderGeometry(5, 5, 600, 16);
    const rodMesh = new THREE.Mesh(rodGeo, this.poleMaterial);
    rodMesh.position.set(0, 0, 0);
    group.add(rodMesh);

    const tipGeo = new THREE.CylinderGeometry(4, 6, 14, 16);
    const tipMesh = new THREE.Mesh(tipGeo, this.poleMaterial);
    tipMesh.position.set(0, 305, 0);
    group.add(tipMesh);

    const bottomTipGeo = new THREE.CylinderGeometry(6, 4, 14, 16);
    const bottomTipMesh = new THREE.Mesh(bottomTipGeo, this.poleMaterial);
    bottomTipMesh.position.set(0, -305, 0);
    group.add(bottomTipMesh);

    const silkGeo = new THREE.PlaneGeometry(SILK_W, SILK_H, 64, 50);

    const silkTexture = this.silkTexture.clone();
    silkTexture.needsUpdate = true;
    this.applyTextureUV(silkTexture);

    const silkMat = new THREE.MeshStandardMaterial({
      map: silkTexture,
      alphaMap: this.alphaMap,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.45,
      metalness: 0.0,
    });

    let shaderRef = null;
    if (!this.reducedMotion) {
      silkMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uSpinSpeed = { value: this.getSpinSpeedNorm() };
        shader.uniforms.uWaveAmplitude = { value: 15.0 };

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
uniform float uTime;
uniform float uSpinSpeed;
uniform float uWaveAmplitude;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
${waveShaderSnippet}`
        );

        shaderRef = shader;
      };
    }

    const silkMesh = new THREE.Mesh(silkGeo, silkMat);

    const silkCenterX = -5 + SILK_W / 2;
    const silkTopY = PIVOT_Y - 12;
    const silkCenterY = silkTopY - SILK_H / 2;
    silkMesh.position.set(silkCenterX, silkCenterY, 1);
    group.add(silkMesh);

    if (this.state.direction === 'cw') group.scale.x = -1;

    return {
      group,
      silkMaterial: silkMat,
      silkTexture,
      silkMesh,
      shaderRef: null,
      getShaderRef: () => shaderRef,
      phaseOffset: 0,
      index,
    };
  }

  getSpinSpeedNorm() {
    return 60000 / (this.spinDurationMs * 60);
  }

  applyTextureUV(texture) {
    const p = this.state.placement;
    if (!p) return;

    const imgW = this.imageNatW * p.scale;
    const imgH = this.imageNatH * p.scale;

    texture.repeat.set(SILK_W / imgW, SILK_H / imgH);
    texture.offset.set(-p.x / imgW, 1 - (SILK_H / imgH) + p.y / imgH);
  }

  buildSolo() {
    this.clearFlags();
    const flag = this.createFlagGroup(0);
    this.flags.push(flag);
    this.scene.add(flag.group);
    this.updateCamera();
  }

  buildEnsemble() {
    this.clearFlags();

    const sW = FLAG_W * ENSEMBLE_SCALE;
    const sH = FLAG_H * ENSEMBLE_SCALE;
    const colPitch = sW + ENSEMBLE_GAP;
    const rowPitch = sH + ENSEMBLE_GAP;
    const rowOffset = colPitch / 2;

    const totalW = colPitch * 4 - ENSEMBLE_GAP + rowOffset;
    const totalH = rowPitch * 3 - ENSEMBLE_GAP;

    for (let i = 0; i < 12; i++) {
      const flag = this.createFlagGroup(i);

      const row = Math.floor(i / 4);
      const col = i % 4;
      let x = col * colPitch;
      let y = row * rowPitch;
      if (row === 1) x += rowOffset;

      const pivotX = x + 5 * ENSEMBLE_SCALE;
      const pivotY = y + PIVOT_Y * ENSEMBLE_SCALE;

      const worldX = pivotX - totalW / 2;
      const worldY = -(pivotY - totalH / 2);

      flag.group.position.set(worldX, worldY, 0);
      flag.group.scale.multiplyScalar(ENSEMBLE_SCALE);

      this.scene.add(flag.group);
      this.flags.push(flag);
    }

    this.updatePhaseOffsets();
    this.updateCamera();
  }

  clearFlags() {
    for (const f of this.flags) {
      this.scene.remove(f.group);
      f.silkMesh.geometry.dispose();
      f.silkMaterial.dispose();
      f.silkTexture.dispose();
    }
    this.flags.length = 0;
  }

  updateCamera() {
    const isEnsemble = this.state.flagCount > 1;
    const visibleH = isEnsemble ? 900 : 700;
    const dist = visibleH / (2 * Math.tan(THREE.MathUtils.degToRad(25)));
    this.camera.position.set(0, 0, dist / (this.zoomLevel / 100));
    this.camera.lookAt(0, 0, 0);
  }

  updatePhaseOffsets() {
    for (const f of this.flags) {
      f.phaseOffset = this.state.syncMode === 'alternate'
        ? (f.index / 12) * 360
        : 0;
    }
  }

  // --- Animation ---

  setPlaying(playing) {
    if (playing) this.startAnim();
    else this.stopAnim();
  }

  startAnim() {
    this.animating = true;
    this.lastTime = 0;
    this.poleAngle = 0;
    for (const f of this.flags) f.phaseOffset = this.state.syncMode === 'alternate' ? (f.index / 12) * 360 : 0;
    this.animId = requestAnimationFrame((t) => this.animate(t));
  }

  stopAnim() {
    this.animating = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    for (const f of this.flags) {
      f.group.rotation.z = 0;
    }
    this.poleAngle = 0;
    this.renderer.render(this.scene, this.camera);
  }

  animate(time) {
    if (!this.animating) return;

    if (this.lastTime === 0) this.lastTime = time;
    const dt = Math.min(time - this.lastTime, 50);
    this.lastTime = time;

    const degPerMs = 360 / this.spinDurationMs;
    const sign = this.state.direction === 'cw' ? -1 : 1;
    this.poleAngle += sign * degPerMs * dt;

    for (const f of this.flags) {
      const angle = this.poleAngle + f.phaseOffset;
      f.group.rotation.z = THREE.MathUtils.degToRad(angle);

      const ref = f.getShaderRef();
      if (ref) {
        ref.uniforms.uTime.value = time * 0.001;
        ref.uniforms.uSpinSpeed.value = this.getSpinSpeedNorm();
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame((t) => this.animate(t));
  }

  // --- Public setters ---

  setDirection() {
    const dirSign = this.state.direction === 'cw' ? -1 : 1;
    for (const f of this.flags) {
      f.group.scale.x = Math.abs(f.group.scale.x) * dirSign;
    }
    if (!this.animating) this.renderer.render(this.scene, this.camera);
  }

  setSpinDuration(ms) {
    this.spinDurationMs = ms;
  }

  async setSilkImage(src) {
    await this.loadTexture(src);

    if (!this.state.placement) {
      const scale = Math.max(SILK_W / this.imageNatW, SILK_H / this.imageNatH);
      this.state.placement = {
        x: (SILK_W - this.imageNatW * scale) / 2,
        y: (SILK_H - this.imageNatH * scale) / 2,
        scale,
      };
    }

    for (const f of this.flags) {
      f.silkTexture.dispose();
      const newTex = this.silkTexture.clone();
      newTex.needsUpdate = true;
      this.applyTextureUV(newTex);
      f.silkTexture = newTex;
      f.silkMaterial.map = newTex;
      f.silkMaterial.needsUpdate = true;
    }
    if (!this.animating) this.renderer.render(this.scene, this.camera);
  }

  setPlacement(x, y, scale) {
    for (const f of this.flags) {
      this.applyTextureUV(f.silkTexture);
      f.silkTexture.needsUpdate = true;
    }
    if (!this.animating) this.renderer.render(this.scene, this.camera);
  }

  setZoom(level) {
    this.zoomLevel = level;
    this.updateCamera();
    if (!this.animating) this.renderer.render(this.scene, this.camera);
  }

  setPoleColor(hex) {
    this.poleMaterial.color.set(hex);
    if (!this.animating) this.renderer.render(this.scene, this.camera);
  }

  setFlagCount(count) {
    const wasAnimating = this.animating;
    if (wasAnimating) this.stopAnim();

    if (count === 1) this.buildSolo();
    else this.buildEnsemble();

    if (wasAnimating) {
      this.state.playing = true;
      this.startAnim();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setSyncMode(mode) {
    this.updatePhaseOffsets();
  }
}
