import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type CameraPreset = 'intro' | 'palace' | 'peacock' | 'rangoli' | 'gift' | 'sky';

interface PalaceScene3DProps {
  cameraPreset: CameraPreset;
  giftOpened: boolean;
  onSelectPreset?: (preset: CameraPreset) => void;
  onGiftClickFrom3D?: () => void;
}

const CAMERA_TARGETS: Record<
  CameraPreset,
  { pos: [number, number, number]; look: [number, number, number] }
> = {
  intro: { pos: [0, 4.5, 16.0], look: [0, 3.6, -1.5] },
  palace: { pos: [0, 4.6, 16.2], look: [0, 3.7, -1.6] },
  peacock: { pos: [0, 2.5, 9.2], look: [0, 1.65, 1.5] },
  rangoli: { pos: [0, 6.6, 7.4], look: [0, 0.4, 2.3] },
  gift: { pos: [2.2, 2.6, 6.6], look: [1.6, 0.9, 2.4] },
  sky: { pos: [0, 3.8, 17.5], look: [0, 6.2, -3.5] },
};

/**
 * Builds an ultra-detailed Jeweled Kundan & Meenakari Filigree Diya (`THREE.Group`):
 * 1. Peacock-Teal Meenakari Enamel & Gold Lathe Bowl
 * 2. 12 Sculpted 3D Relief Lotus Petals around the bowl exterior
 * 3. 12 Kundan Ruby-Pink & Emerald Gemstone Studs along the rim
 * 4. Sculpted Wick Nozzle Beak & Warm Ghee Pool
 * 5. 3-Layer Luminous Flame (White core, Saffron-Lime mid, Golden-Teal outer aura)
 * 6. Soft Radial Contact Shadow Disc
 */
function createCompositeDiya(
  meenakariTealMat: THREE.MeshPhysicalMaterial,
  goldMat: THREE.MeshPhysicalMaterial,
  rubyGemMat: THREE.MeshPhysicalMaterial,
  emeraldGemMat: THREE.MeshPhysicalMaterial,
  oilMat: THREE.MeshStandardMaterial,
  flameCoreMat: THREE.MeshBasicMaterial,
  flameMidMat: THREE.MeshBasicMaterial,
  flameAuraMat: THREE.MeshBasicMaterial,
  shadowDiscMat: THREE.MeshBasicMaterial,
  scale = 1,
  isHero = false
): { group: THREE.Group; flameMesh: THREE.Group } {
  const group = new THREE.Group();

  // 1. High-resolution Lathe Bowl
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.24, 0.0),
    new THREE.Vector2(0.38, 0.13),
    new THREE.Vector2(0.45, 0.29),
    new THREE.Vector2(0.37, 0.34),
    new THREE.Vector2(0.30, 0.20),
    new THREE.Vector2(0.0, 0.16),
  ];
  const bowlGeo = new THREE.LatheGeometry(points, isHero ? 32 : 20);
  const bowlMesh = new THREE.Mesh(bowlGeo, meenakariTealMat);
  bowlMesh.castShadow = true;
  bowlMesh.receiveShadow = true;
  group.add(bowlMesh);

  // 2. Brushed Gold Upper Rim Ring & Foot Base Ring
  const rimGeo = new THREE.TorusGeometry(0.40, 0.036, 12, isHero ? 32 : 20);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, goldMat);
  rimMesh.position.y = 0.31;
  group.add(rimMesh);

  const footGeo = new THREE.TorusGeometry(0.23, 0.028, 10, 20);
  footGeo.rotateX(Math.PI / 2);
  const footMesh = new THREE.Mesh(footGeo, goldMat);
  footMesh.position.y = 0.025;
  group.add(footMesh);

  // 3. Sculpted Lotus Relief Petals & Kundan Jewels (Hero & Foreground Diyas)
  const petalCount = isHero ? 12 : 8;
  const reliefGeo = new THREE.ConeGeometry(0.085, 0.24, 6);
  const gemGeo = new THREE.OctahedronGeometry(0.036, 0);

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const rx = Math.cos(angle) * 0.39;
    const rz = Math.sin(angle) * 0.39;

    const petal = new THREE.Mesh(reliefGeo, goldMat);
    petal.position.set(rx * 0.92, 0.17, rz * 0.92);
    petal.rotation.y = -angle;
    petal.rotation.z = Math.sin(angle) * 0.38;
    petal.rotation.x = -Math.cos(angle) * 0.38;
    group.add(petal);

    const gem = new THREE.Mesh(
      gemGeo,
      i % 2 === 0 ? rubyGemMat : emeraldGemMat
    );
    gem.position.set(rx * 1.02, 0.31, rz * 1.02);
    group.add(gem);
  }

  // 4. Ornate Spout Beak (Nozzle for Wick)
  const beakGeo = new THREE.ConeGeometry(0.12, 0.28, 14);
  beakGeo.rotateX(Math.PI / 2);
  const beakMesh = new THREE.Mesh(beakGeo, goldMat);
  beakMesh.position.set(0, 0.29, 0.43);
  group.add(beakMesh);

  // 5. Warm Ghee/Oil Pool
  const oilGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.04, 20);
  const oilMesh = new THREE.Mesh(oilGeo, oilMat);
  oilMesh.position.y = 0.25;
  group.add(oilMesh);

  // 6. 3-Layer Teardrop Flame Group at the beak tip
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0, 0.34, 0.48);

  const coreGeo = new THREE.ConeGeometry(0.065, 0.28, 14);
  coreGeo.translate(0, 0.14, 0);
  const coreMesh = new THREE.Mesh(coreGeo, flameCoreMat);
  flameGroup.add(coreMesh);

  const midGeo = new THREE.ConeGeometry(0.105, 0.36, 14);
  midGeo.translate(0, 0.16, 0);
  const midMesh = new THREE.Mesh(midGeo, flameMidMat);
  flameGroup.add(midMesh);

  const auraGeo = new THREE.SphereGeometry(0.15, 14, 14);
  auraGeo.scale(1, 1.9, 1);
  auraGeo.translate(0, 0.16, 0);
  const auraMesh = new THREE.Mesh(auraGeo, flameAuraMat);
  flameGroup.add(auraMesh);

  group.add(flameGroup);

  // 7. Soft Contact Shadow Disc on Ground
  const shadowGeo = new THREE.CircleGeometry(0.52, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowDiscMat);
  shadowMesh.position.y = 0.015;
  group.add(shadowMesh);

  group.scale.setScalar(scale);
  return { group, flameMesh: flameGroup };
}

/**
 * Builds a 12-Part 3D Royal Indian Peacock (Mayur) Sculpture (`THREE.Group`):
 * - Carved Octagonal Gold & Teal Pedestal
 * - Iridescent Sapphire-Teal Sculpted Body
 * - Graceful S-Curved Neck (`TubeGeometry`)
 * - Head, Golden Beak & 3-Plume Royal Crown Crest (Kalagi)
 * - Magnificent Fanned Array of 11 Iridescent Tail Feathers with Multi-Ring Peacock Eye Ocelli
 */
function createRoyalPeacock3D(
  peacockBodyMat: THREE.MeshPhysicalMaterial,
  peacockPlumeMat: THREE.MeshPhysicalMaterial,
  goldMat: THREE.MeshPhysicalMaterial,
  rubyGemMat: THREE.MeshPhysicalMaterial,
  sapphireMat: THREE.MeshPhysicalMaterial,
  facingSign: 1 | -1
): { group: THREE.Group; tailFan: THREE.Group } {
  const group = new THREE.Group();

  // 1. Carved Royal Pedestal
  const pedBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.78, 0.24, 8),
    goldMat
  );
  pedBase.position.y = 0.12;
  group.add(pedBase);

  const pedMid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.62, 0.32, 16),
    peacockPlumeMat
  );
  pedMid.position.y = 0.40;
  group.add(pedMid);

  const pedTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.50, 0.16, 16),
    goldMat
  );
  pedTop.position.y = 0.64;
  group.add(pedTop);

  // 2. Peacock Body Torso
  const bodyGeo = new THREE.SphereGeometry(0.42, 20, 16);
  bodyGeo.scale(0.88, 1.05, 1.38);
  const bodyMesh = new THREE.Mesh(bodyGeo, peacockBodyMat);
  bodyMesh.position.set(0, 1.06, 0.08);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Golden Wing Trim Accents
  [-0.34, 0.34].forEach((wx) => {
    const wing = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 12),
      goldMat
    );
    wing.scale.set(0.35, 0.75, 1.25);
    wing.position.set(wx, 1.08, 0.06);
    group.add(wing);
  });

  // 3. Graceful S-Curved Neck via TubeGeometry
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.18, 0.36),
    new THREE.Vector3(0, 1.48, 0.48),
    new THREE.Vector3(0, 1.78, 0.34),
    new THREE.Vector3(0, 2.04, 0.40),
  ]);
  const neckGeo = new THREE.TubeGeometry(neckCurve, 20, 0.12, 14, false);
  const neckMesh = new THREE.Mesh(neckGeo, peacockBodyMat);
  group.add(neckMesh);

  // 4. Sculpted Head & Golden Beak
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 14),
    peacockBodyMat
  );
  headMesh.scale.set(0.9, 0.95, 1.18);
  headMesh.position.set(0, 2.10, 0.44);
  group.add(headMesh);

  const beakMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.055, 0.22, 10),
    goldMat
  );
  beakMesh.rotation.x = Math.PI / 2 + 0.15;
  beakMesh.position.set(0, 2.08, 0.64);
  group.add(beakMesh);

  // 5. 3-Plume Royal Crown Crest (Kalagi)
  [-0.18, 0, 0.18].forEach((angleOffset) => {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6),
      goldMat
    );
    stem.position.set(Math.sin(angleOffset) * 0.06, 2.30, 0.38);
    stem.rotation.z = -angleOffset;
    group.add(stem);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 8, 8),
      goldMat
    );
    tip.position.set(Math.sin(angleOffset) * 0.10, 2.41, 0.38);
    group.add(tip);
  });

  // 6. Magnificent Fanned Array of 11 Iridescent Tail Feathers (Mayur Pankh)
  const tailFan = new THREE.Group();
  tailFan.position.set(0, 1.22, -0.32);
  group.add(tailFan);

  const featherCount = 11;
  for (let i = 0; i < featherCount; i++) {
    const t = (i / (featherCount - 1)) * 2 - 1; // -1 to +1
    const angle = t * (Math.PI * 0.46);
    const length = 1.65 - Math.abs(t) * 0.22;

    const featherGroup = new THREE.Group();
    featherGroup.rotation.z = angle;
    featherGroup.rotation.x = -0.14 + Math.abs(t) * 0.06;

    // Feather Spine & Emerald Plume Blade
    const bladeGeo = new THREE.CylinderGeometry(0.14, 0.03, length, 10);
    bladeGeo.scale(1, 1, 0.18);
    bladeGeo.translate(0, length / 2, 0);
    const bladeMesh = new THREE.Mesh(bladeGeo, peacockPlumeMat);
    featherGroup.add(bladeMesh);

    // Multi-Ring Peacock-Eye Ocellus near the tip
    const ocellusY = length - 0.12;
    const goldRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.03, 16),
      goldMat
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.set(0, ocellusY, 0.02);
    featherGroup.add(goldRing);

    const rubyRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.036, 16),
      rubyGemMat
    );
    rubyRing.rotation.x = Math.PI / 2;
    rubyRing.position.set(0, ocellusY + 0.02, 0.025);
    featherGroup.add(rubyRing);

    const sapphireEye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.042, 14),
      sapphireMat
    );
    sapphireEye.rotation.x = Math.PI / 2;
    sapphireEye.position.set(0, ocellusY + 0.03, 0.03);
    featherGroup.add(sapphireEye);

    tailFan.add(featherGroup);
  }

  // Rotate inward slightly toward the central Diya & Rangoli
  group.rotation.y = facingSign * 0.42;
  return { group, tailFan };
}

/**
 * Builds a composite multi-part carved Indian Palace Pillar (`THREE.Group`)
 */
function createPalacePillar(
  sandstoneMat: THREE.MeshPhysicalMaterial,
  goldMat: THREE.MeshPhysicalMaterial,
  rubyMat: THREE.MeshPhysicalMaterial,
  meenakariTealMat: THREE.MeshPhysicalMaterial,
  height = 5.4
): THREE.Group {
  const pillar = new THREE.Group();

  // 1. Stepped Plinth Base
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.32, 0.98), sandstoneMat);
  base1.position.y = 0.16;
  pillar.add(base1);

  const base2 = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.28, 0.80), goldMat);
  base2.position.y = 0.46;
  pillar.add(base2);

  // 2. Purnaghata / Kalash Molding
  const kalashBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.43, 0.46, 20),
    meenakariTealMat
  );
  kalashBase.position.y = 0.83;
  pillar.add(kalashBase);

  // 3. Fluted 12-Sided Shaft
  const shaftHeight = height - 1.9;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, shaftHeight, 12),
    sandstoneMat
  );
  shaft.position.y = 1.05 + shaftHeight / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  pillar.add(shaft);

  // 4. Ornate Gold, Ruby & Meenakari Bands along the shaft
  [0.28, 0.54, 0.78, 0.92].forEach((ratio, idx) => {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20),
      idx === 1 ? rubyMat : idx === 2 ? meenakariTealMat : goldMat
    );
    band.position.y = 1.0 + shaftHeight * ratio;
    pillar.add(band);
  });

  // 5. Lotus Capital & Corbel Brackets
  const capital = new THREE.Mesh(
    new THREE.CylinderGeometry(0.50, 0.29, 0.44, 20),
    goldMat
  );
  capital.position.y = height - 0.65;
  pillar.add(capital);

  const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.26, 0.96), meenakariTealMat);
  abacus.position.y = height - 0.31;
  pillar.add(abacus);

  const bracket = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.20, 0.54), goldMat);
  bracket.position.y = height - 0.09;
  pillar.add(bracket);

  return pillar;
}

/**
 * Builds a Hanging Festive Kandil Lantern (`THREE.Group`)
 */
function createHangingLantern(
  goldMat: THREE.MeshPhysicalMaterial,
  lanternGlowMat: THREE.MeshStandardMaterial,
  rubyMat: THREE.MeshPhysicalMaterial
): THREE.Group {
  const lantern = new THREE.Group();

  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 8), goldMat);
  chain.position.y = -0.65;
  lantern.add(chain);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 12), goldMat);
  cap.position.y = -1.35;
  lantern.add(cap);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.23, 0.58, 12), lanternGlowMat);
  body.position.y = -1.72;
  lantern.add(body);

  const bottomRim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.12, 0.18, 12), rubyMat);
  bottomRim.position.y = -2.06;
  lantern.add(bottomRim);

  const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.38, 10), goldMat);
  tassel.rotation.x = Math.PI;
  tassel.position.y = -2.28;
  lantern.add(tassel);

  return lantern;
}

export const PalaceScene3D: React.FC<PalaceScene3DProps> = ({
  cameraPreset,
  giftOpened,
  onSelectPreset,
  onGiftClickFrom3D,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  const cameraPresetRef = useRef<CameraPreset>(cameraPreset);
  const giftOpenedRef = useRef<boolean>(giftOpened);
  const onSelectPresetRef = useRef(onSelectPreset);
  const onGiftClickRef = useRef(onGiftClickFrom3D);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    giftOpenedRef.current = giftOpened;
  }, [giftOpened]);

  useEffect(() => {
    onSelectPresetRef.current = onSelectPreset;
  }, [onSelectPreset]);

  useEffect(() => {
    onGiftClickRef.current = onGiftClickFrom3D;
  }, [onGiftClickFrom3D]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const probeCanvas = document.createElement('canvas');
    const glProbe =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!glProbe) {
      setWebglAvailable(false);
      return;
    }

    const isSoftwareGl = (() => {
      const ext = glProbe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : glProbe.RENDERER;
      const gpu = String(glProbe.getParameter(param));
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x05101a);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x05101a, 0.022);

    // Studio Environment Reflection (RoomEnvironment) for 4K Metallic Gold & Iridescent Enamel
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 95);
    const getPortraitScale = () => {
      const asp = camera.aspect || 1;
      return asp < 1 ? Math.min(1.55, 0.92 / Math.max(asp, 0.45)) : 1;
    };

    const initialTarget = CAMERA_TARGETS[cameraPresetRef.current];
    const pScaleInit = getPortraitScale();
    camera.position.set(
      initialTarget.pos[0],
      initialTarget.pos[1] * (1 + (pScaleInit - 1) * 0.25),
      initialTarget.pos[2] * pScaleInit
    );
    const currentLookAt = new THREE.Vector3(...initialTarget.look);
    camera.lookAt(currentLookAt);

    // --- LIGHTING RIG (Warm Golden Key + Peacock-Teal Hemisphere + Sanctum Point Lights) ---
    const hemiLight = new THREE.HemisphereLight(0x0d9488, 0x78350f, 1.05);
    hemiLight.position.set(0, 18, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.35);
    keyLight.position.set(6, 15, 11);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      const d = 12;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 35;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const sanctumLight = new THREE.PointLight(0xffb703, 7.0, 20, 1.5);
    sanctumLight.position.set(0, 4.2, -2.0);
    scene.add(sanctumLight);

    const courtyardDiyaLight = new THREE.PointLight(0xf59e0b, 5.4, 13, 1.5);
    courtyardDiyaLight.position.set(0, 1.7, 2.8);
    scene.add(courtyardDiyaLight);

    const leftPeacockLight = new THREE.PointLight(0x2dd4bf, 4.2, 11, 1.5);
    leftPeacockLight.position.set(-4.2, 2.8, 1.8);
    scene.add(leftPeacockLight);

    const rightPeacockLight = new THREE.PointLight(0x2dd4bf, 4.2, 11, 1.5);
    rightPeacockLight.position.set(4.2, 2.8, 1.8);
    scene.add(rightPeacockLight);

    // --- 4K-STYLE HIGH-RES PROCEDURAL PIETRA DURA MARBLE FLOOR TEXTURE ---
    const createMarbleTileTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#071c26';
      ctx.fillRect(0, 0, 512, 512);

      const rad = ctx.createRadialGradient(256, 256, 20, 256, 256, 320);
      rad.addColorStop(0, '#0a2e3d');
      rad.addColorStop(1, '#05131c');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 496, 496);

      ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, 464, 464);

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.32)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(256, 24);
      ctx.lineTo(488, 256);
      ctx.lineTo(256, 488);
      ctx.lineTo(24, 256);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(256, 256, 88, 0, Math.PI * 2);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(14, 14);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    const floorTexture = createMarbleTileTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTexture,
      roughness: 0.22,
      metalness: 0.25,
    });

    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xffcf40,
      roughness: 0.16,
      metalness: 0.94,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    });

    const sandstoneMat = new THREE.MeshPhysicalMaterial({
      color: 0xe08244,
      roughness: 0.45,
      metalness: 0.22,
      clearcoat: 0.2,
    });

    const meenakariTealMat = new THREE.MeshPhysicalMaterial({
      color: 0x065f73,
      roughness: 0.18,
      metalness: 0.65,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const peacockBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.72,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.4,
    });

    const peacockPlumeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488,
      roughness: 0.24,
      metalness: 0.68,
      clearcoat: 0.9,
      iridescence: 0.9,
    });

    const rubyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.18,
      metalness: 0.45,
      clearcoat: 1.0,
    });

    const emeraldGemMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.15,
      metalness: 0.5,
      clearcoat: 1.0,
    });

    const sapphireMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      roughness: 0.15,
      metalness: 0.8,
      clearcoat: 1.0,
    });

    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.35,
    });

    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const flameMidMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
    });

    const flameAuraMat = new THREE.MeshBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    const lanternGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf97316,
      emissiveIntensity: 1.65,
      roughness: 0.28,
    });

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.68)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.62,
    });

    // --- 1. COURTYARD FLOOR & STEPPED PALACE PLINTH ---
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), floorMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const palaceGroup = new THREE.Group();
    palaceGroup.position.set(0, 0, -2.4);
    scene.add(palaceGroup);

    for (let s = 0; s < 3; s++) {
      const stepW = 15.8 - s * 0.7;
      const stepD = 6.8 - s * 0.5;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, 0.26, stepD),
        s === 1 ? goldMat : s === 2 ? meenakariTealMat : sandstoneMat
      );
      stepMesh.position.set(0, 0.13 + s * 0.26, 0.2 - s * 0.22);
      stepMesh.receiveShadow = true;
      palaceGroup.add(stepMesh);
    }

    const platformY = 0.78;

    // --- 2. PALACE COLUMNS & SCALLOPED CUSPED ARCHES ---
    const pillarXPositions = [-6.0, -3.2, -1.35, 1.35, 3.2, 6.0];
    pillarXPositions.forEach((px) => {
      const frontPillar = createPalacePillar(
        sandstoneMat,
        goldMat,
        rubyMat,
        meenakariTealMat,
        5.4
      );
      frontPillar.position.set(px, platformY, 1.6);
      palaceGroup.add(frontPillar);

      const backPillar = createPalacePillar(
        sandstoneMat,
        goldMat,
        rubyMat,
        meenakariTealMat,
        5.4
      );
      backPillar.position.set(px, platformY, -1.6);
      palaceGroup.add(backPillar);
    });

    const createArchBeam = (spanWidth: number) => {
      const archGroup = new THREE.Group();
      const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(spanWidth, 0.50, 0.58),
        goldMat
      );
      topBeam.position.y = 5.25;
      archGroup.add(topBeam);

      const cuspCount = 8;
      for (let i = 0; i <= cuspCount; i++) {
        const t = (i / cuspCount) * Math.PI;
        const x = Math.cos(t) * (spanWidth * 0.45);
        const y = 4.18 + Math.sin(t) * 0.88;
        const cusp = new THREE.Mesh(
          new THREE.SphereGeometry(0.21, 14, 14),
          i % 2 === 0 ? goldMat : rubyMat
        );
        cusp.position.set(x, y, 0);
        archGroup.add(cusp);
      }
      return archGroup;
    };

    const centerArch = createArchBeam(2.7);
    centerArch.position.set(0, platformY, 1.6);
    palaceGroup.add(centerArch);

    const leftArch = createArchBeam(1.85);
    leftArch.position.set(-2.275, platformY, 1.6);
    palaceGroup.add(leftArch);

    const rightArch = createArchBeam(1.85);
    rightArch.position.set(2.275, platformY, 1.6);
    palaceGroup.add(rightArch);

    const farLeftArch = createArchBeam(2.8);
    farLeftArch.position.set(-4.6, platformY, 1.6);
    palaceGroup.add(farLeftArch);

    const farRightArch = createArchBeam(2.8);
    farRightArch.position.set(4.6, platformY, 1.6);
    palaceGroup.add(farRightArch);

    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(15.0, 0.55, 5.0),
      meenakariTealMat
    );
    roofSlab.position.set(0, platformY + 5.65, 0);
    palaceGroup.add(roofSlab);

    const goldCornice = new THREE.Mesh(
      new THREE.BoxGeometry(15.5, 0.26, 5.4),
      goldMat
    );
    goldCornice.position.set(0, platformY + 6.02, 0);
    palaceGroup.add(goldCornice);

    // --- 3. CENTRAL SHIKHARA DOME & SIDE CHHATRIS ---
    const createDomeTower = (scale = 1) => {
      const domeGroup = new THREE.Group();
      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(1.48, 1.64, 0.92, 24),
        meenakariTealMat
      );
      drum.position.y = 0.46;
      domeGroup.add(drum);

      const onionPts = [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(1.48, 0.0),
        new THREE.Vector2(1.66, 0.56),
        new THREE.Vector2(1.28, 1.38),
        new THREE.Vector2(0.46, 2.08),
        new THREE.Vector2(0.08, 2.48),
        new THREE.Vector2(0.0, 2.64),
      ];
      const domeGeo = new THREE.LatheGeometry(onionPts, 32);
      const domeMesh = new THREE.Mesh(domeGeo, goldMat);
      domeMesh.position.y = 0.92;
      domeGroup.add(domeMesh);

      const finial = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        rubyMat
      );
      finial.position.y = 3.64;
      domeGroup.add(finial);

      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.095, 0.68, 12),
        goldMat
      );
      spire.position.y = 4.06;
      domeGroup.add(spire);

      domeGroup.scale.setScalar(scale);
      return domeGroup;
    };

    const mainDome = createDomeTower(1.18);
    mainDome.position.set(0, platformY + 6.1, 0);
    palaceGroup.add(mainDome);

    const leftChhatri = createDomeTower(0.74);
    leftChhatri.position.set(-4.5, platformY + 6.1, 0);
    palaceGroup.add(leftChhatri);

    const rightChhatri = createDomeTower(0.74);
    rightChhatri.position.set(4.5, platformY + 6.1, 0);
    palaceGroup.add(rightChhatri);

    // Royal Peacock-Teal & Gold Mandala Backdrop inside the Palace Sanctum
    const sanctumCanvas = document.createElement('canvas');
    sanctumCanvas.width = 1024;
    sanctumCanvas.height = 512;
    const scCtx = sanctumCanvas.getContext('2d')!;
    const scGrad = scCtx.createRadialGradient(512, 260, 20, 512, 260, 480);
    scGrad.addColorStop(0, '#0f766e');
    scGrad.addColorStop(0.42, '#064e5f');
    scGrad.addColorStop(0.78, '#042f3d');
    scGrad.addColorStop(1, '#04151f');
    scCtx.fillStyle = scGrad;
    scCtx.fillRect(0, 0, 1024, 512);

    scCtx.strokeStyle = 'rgba(253, 224, 71, 0.42)';
    scCtx.lineWidth = 3.5;
    for (let r = 45; r <= 260; r += 42) {
      scCtx.beginPath();
      scCtx.arc(512, 260, r, 0, Math.PI * 2);
      scCtx.stroke();
    }
    const sanctumTex = new THREE.CanvasTexture(sanctumCanvas);
    sanctumTex.colorSpace = THREE.SRGBColorSpace;

    const sanctumBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(12.6, 5.4),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: sanctumTex,
        emissive: 0x0d9488,
        emissiveMap: sanctumTex,
        emissiveIntensity: 0.55,
        roughness: 0.5,
      })
    );
    sanctumBackdrop.position.set(0, platformY + 2.7, -2.1);
    palaceGroup.add(sanctumBackdrop);

    // --- 4. TWIN 3D ROYAL PEACOCK (MAYUR) SCULPTURES FLANKING THE ENTRANCE ---
    const leftPeacock = createRoyalPeacock3D(
      peacockBodyMat,
      peacockPlumeMat,
      goldMat,
      rubyMat,
      sapphireMat,
      1
    );
    leftPeacock.group.position.set(-3.1, 0.02, 1.85);
    scene.add(leftPeacock.group);

    const rightPeacock = createRoyalPeacock3D(
      peacockBodyMat,
      peacockPlumeMat,
      goldMat,
      rubyMat,
      sapphireMat,
      -1
    );
    rightPeacock.group.position.set(3.1, 0.02, 1.85);
    scene.add(rightPeacock.group);

    // --- 5. ANIMATED HANGING KANDIL LANTERNS ---
    const lanterns: THREE.Group[] = [];
    const lanternX = [-4.6, -2.275, 0, 2.275, 4.6];
    lanternX.forEach((lx) => {
      const lantern = createHangingLantern(goldMat, lanternGlowMat, rubyMat);
      lantern.position.set(lx, platformY + 5.15, 1.6);
      palaceGroup.add(lantern);
      lanterns.push(lantern);
    });

    // --- 6. GRAND 3D COURTYARD RANGOLI & JEWELED HERO DIYA ---
    const rangoliGroup = new THREE.Group();
    rangoliGroup.position.set(0, 0.025, 2.5);
    scene.add(rangoliGroup);

    const outerRangoliDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.38, 2.44, 0.03, 36),
      meenakariTealMat
    );
    outerRangoliDisc.position.y = 0.015;
    rangoliGroup.add(outerRangoliDisc);

    const midRangoliDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.78, 1.84, 0.03, 32),
      goldMat
    );
    midRangoliDisc.position.y = 0.04;
    rangoliGroup.add(midRangoliDisc);

    const petalGeo = new THREE.ConeGeometry(0.30, 0.98, 10);
    petalGeo.rotateX(Math.PI / 2);
    for (let p = 0; p < 16; p++) {
      const angle = (p / 16) * Math.PI * 2;
      const petal = new THREE.Mesh(
        petalGeo,
        p % 2 === 0 ? rubyMat : peacockPlumeMat
      );
      petal.position.set(Math.cos(angle) * 1.38, 0.07, Math.sin(angle) * 1.38);
      petal.rotation.y = -angle + Math.PI / 2;
      rangoliGroup.add(petal);
    }

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.76, 0.30, 24),
      goldMat
    );
    pedestal.position.y = 0.18;
    rangoliGroup.add(pedestal);

    const flameGroups: THREE.Group[] = [];

    const heroDiya = createCompositeDiya(
      meenakariTealMat,
      goldMat,
      rubyMat,
      emeraldGemMat,
      oilMat,
      flameCoreMat,
      flameMidMat,
      flameAuraMat,
      shadowDiscMat,
      1.72,
      true
    );
    heroDiya.group.position.set(0, 0.34, 0);
    rangoliGroup.add(heroDiya.group);
    flameGroups.push(heroDiya.flameMesh);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = Math.cos(angle) * 2.16;
      const rz = Math.sin(angle) * 2.16;
      const d = createCompositeDiya(
        meenakariTealMat,
        goldMat,
        rubyMat,
        emeraldGemMat,
        oilMat,
        flameCoreMat,
        flameMidMat,
        flameAuraMat,
        shadowDiscMat,
        0.78,
        false
      );
      d.group.position.set(rx, 0.03, rz);
      d.group.rotation.y = -angle + Math.PI / 2;
      rangoliGroup.add(d.group);
      flameGroups.push(d.flameMesh);
    }

    [-4.8, -3.0, -1.5, 1.5, 3.0, 4.8].forEach((sx) => {
      const stepDiya = createCompositeDiya(
        meenakariTealMat,
        goldMat,
        rubyMat,
        emeraldGemMat,
        oilMat,
        flameCoreMat,
        flameMidMat,
        flameAuraMat,
        shadowDiscMat,
        0.82,
        false
      );
      stepDiya.group.position.set(sx, 0.52, -0.4);
      scene.add(stepDiya.group);
      flameGroups.push(stepDiya.flameMesh);
    });

    // --- 7. 3D SURPRISE GOLDEN GIFT BOX IN COURTYARD ---
    const giftGroup = new THREE.Group();
    giftGroup.position.set(2.9, 0.02, 3.4);
    giftGroup.rotation.y = -0.45;
    scene.add(giftGroup);

    const giftBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.72, 0.95),
      goldMat
    );
    giftBase.position.y = 0.36;
    giftBase.castShadow = true;
    giftGroup.add(giftBase);

    const ribbonV1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.74, 0.18),
      rubyMat
    );
    ribbonV1.position.y = 0.36;
    giftGroup.add(ribbonV1);

    const ribbonV2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.74, 0.98),
      rubyMat
    );
    ribbonV2.position.y = 0.36;
    giftGroup.add(ribbonV2);

    const giftLidGroup = new THREE.Group();
    giftLidGroup.position.set(0, 0.74, -0.46);
    giftGroup.add(giftLidGroup);

    const lidBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 0.18, 1.04),
      goldMat
    );
    lidBox.position.set(0, 0.09, 0.46);
    giftLidGroup.add(lidBox);

    const bowKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.14, 0.045, 32, 8),
      rubyMat
    );
    bowKnot.position.set(0, 0.26, 0.46);
    giftLidGroup.add(bowKnot);

    const innerOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      flameCoreMat
    );
    innerOrb.position.set(0, 0.55, 0);
    giftGroup.add(innerOrb);

    // --- INTERACTIVE RAYCAST PROXIES & TOUCH/POINTER ORBIT ---
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const giftProxy = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), proxyMat);
    giftProxy.position.set(2.9, 0.6, 3.4);
    giftProxy.userData.action = 'gift';
    scene.add(giftProxy);

    const leftPeacockProxy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 1.8), proxyMat);
    leftPeacockProxy.position.set(-3.1, 1.4, 1.85);
    leftPeacockProxy.userData.action = 'peacock';
    scene.add(leftPeacockProxy);

    const rightPeacockProxy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 1.8), proxyMat);
    rightPeacockProxy.position.set(3.1, 1.4, 1.85);
    rightPeacockProxy.userData.action = 'peacock';
    scene.add(rightPeacockProxy);

    const rangoliProxy = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.2, 16), proxyMat);
    rangoliProxy.position.set(0, 0.5, 2.5);
    rangoliProxy.userData.action = 'rangoli';
    scene.add(rangoliProxy);

    const interactables: THREE.Object3D[] = [
      giftProxy,
      leftPeacockProxy,
      rightPeacockProxy,
      rangoliProxy,
    ];
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let dragOrbitX = 0;
    let dragOrbitY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - pointerDownX) / Math.max(window.innerWidth, 320);
      const dy = (e.clientY - pointerDownY) / Math.max(window.innerHeight, 320);
      dragOrbitX = THREE.MathUtils.clamp(dx * 3.5, -2.2, 2.2);
      dragOrbitY = THREE.MathUtils.clamp(dy * 2.0, -1.0, 1.2);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (moveDist < 10) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(interactables, false);
        if (hits.length > 0) {
          const act = hits[0].object.userData.action;
          if (act === 'gift') {
            onGiftClickRef.current?.();
          } else if (act === 'peacock' || act === 'rangoli') {
            onSelectPresetRef.current?.(act);
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // --- 8. INSTANCED FLOATING LOTUS/MARIGOLD PETALS & GOLDEN BOKEH DUST ---
    const petalCount = 96;
    const marigoldGeo = new THREE.ConeGeometry(0.08, 0.18, 6);
    marigoldGeo.scale(1, 0.25, 1);
    const marigoldMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.15,
    });
    const petalInstanced = new THREE.InstancedMesh(
      marigoldGeo,
      marigoldMat,
      petalCount
    );
    petalInstanced.frustumCulled = false;

    const petalData: {
      x: number;
      y: number;
      z: number;
      speedY: number;
      phase: number;
      scale: number;
    }[] = [];
    const dummyMat4 = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyEuler = new THREE.Euler();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3();
    const dummyColor = new THREE.Color();

    for (let i = 0; i < petalCount; i++) {
      const px = (Math.random() - 0.5) * 18;
      const py = Math.random() * 9 + 0.3;
      const pz = (Math.random() - 0.5) * 14;
      const sc = 0.85 + Math.random() * 0.35;
      petalData.push({
        x: px,
        y: py,
        z: pz,
        speedY: 0.25 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        scale: sc,
      });
      dummyColor.setHex(
        i % 3 === 0 ? 0xfb7185 : i % 2 === 0 ? 0xfde047 : 0x2dd4bf
      );
      petalInstanced.setColorAt(i, dummyColor);
    }
    if (petalInstanced.instanceColor) {
      petalInstanced.instanceColor.needsUpdate = true;
    }
    scene.add(petalInstanced);

    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 32;
    dotCanvas.height = 32;
    const dCtx = dotCanvas.getContext('2d')!;
    const dGrad = dCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
    dGrad.addColorStop(0, 'rgba(255, 251, 235, 1)');
    dGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.85)');
    dGrad.addColorStop(1, 'rgba(20, 184, 166, 0)');
    dCtx.fillStyle = dGrad;
    dCtx.fillRect(0, 0, 32, 32);
    const dotTex = new THREE.CanvasTexture(dotCanvas);
    dotTex.colorSpace = THREE.SRGBColorSpace;

    const dustCount = 950;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 26;
      dustPositions[i * 3 + 1] = Math.random() * 12 + 0.2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      map: dotTex,
      size: 0.23,
      transparent: true,
      alphaTest: 0.05,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // --- ANIMATION LOOP WITH SOFTWARE-WEBGL FENCE SYNC GUARD ---
    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;
    let frameId = 0;
    let isDisposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const tick = () => {
      if (isDisposed) return;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - prevTimeMs) / 1000, 0.1);
      prevTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;

      if (!isDragging) {
        dragOrbitX = THREE.MathUtils.damp(dragOrbitX, 0, 2.5, dt);
        dragOrbitY = THREE.MathUtils.damp(dragOrbitY, 0, 2.5, dt);
      }

      const preset = CAMERA_TARGETS[cameraPresetRef.current];
      const pScale = getPortraitScale();
      const swayX = Math.sin(elapsed * 0.35) * 0.24 + dragOrbitX;
      const swayY = Math.cos(elapsed * 0.28) * 0.10 + dragOrbitY;

      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        preset.pos[0] + swayX,
        3.2,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        preset.pos[1] * (1 + (pScale - 1) * 0.22) + swayY,
        3.2,
        dt
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        preset.pos[2] * pScale,
        3.2,
        dt
      );

      currentLookAt.x = THREE.MathUtils.damp(
        currentLookAt.x,
        preset.look[0],
        3.8,
        dt
      );
      currentLookAt.y = THREE.MathUtils.damp(
        currentLookAt.y,
        preset.look[1],
        3.8,
        dt
      );
      currentLookAt.z = THREE.MathUtils.damp(
        currentLookAt.z,
        preset.look[2],
        3.8,
        dt
      );
      camera.lookAt(currentLookAt);

      // Animate Diya flames flickering warmly
      for (let i = 0; i < flameGroups.length; i++) {
        const fg = flameGroups[i];
        const s = 0.92 + Math.sin(elapsed * 7.5 + i * 1.3) * 0.14;
        fg.scale.set(1, s, 1);
      }

      // Gently shimmer & breathe the Twin Peacocks' tail feather fans
      const fanPulse = 1 + Math.sin(elapsed * 1.6) * 0.035;
      leftPeacock.tailFan.scale.set(fanPulse, fanPulse, 1);
      rightPeacock.tailFan.scale.set(fanPulse, fanPulse, 1);

      // Gently sway hanging Kandil lanterns
      for (let i = 0; i < lanterns.length; i++) {
        lanterns[i].rotation.z = Math.sin(elapsed * 1.4 + i * 0.9) * 0.065;
      }

      // Animate 3D Gift Box lid
      const targetLidRot = giftOpenedRef.current ? -1.85 : 0;
      giftLidGroup.rotation.x = THREE.MathUtils.damp(
        giftLidGroup.rotation.x,
        targetLidRot,
        4.5,
        dt
      );
      const targetOrbY = giftOpenedRef.current
        ? 1.45 + Math.sin(elapsed * 2.5) * 0.12
        : 0.45;
      innerOrb.position.y = THREE.MathUtils.damp(
        innerOrb.position.y,
        targetOrbY,
        4.0,
        dt
      );

      // Update Instanced Lotus & Marigold Petals
      for (let i = 0; i < petalCount; i++) {
        const p = petalData[i];
        p.y -= p.speedY * dt;
        if (p.y < 0.1) p.y = 8.8;
        const px = p.x + Math.sin(elapsed * 0.9 + p.phase) * 0.35;
        const pz = p.z + Math.cos(elapsed * 0.8 + p.phase) * 0.35;
        dummyPos.set(px, p.y, pz);
        dummyEuler.set(
          elapsed * 0.8 + p.phase,
          elapsed * 0.6 + p.phase,
          elapsed * 0.4
        );
        dummyQuat.setFromEuler(dummyEuler);
        dummyScale.setScalar(p.scale);
        dummyMat4.compose(dummyPos, dummyQuat, dummyScale);
        petalInstanced.setMatrixAt(i, dummyMat4);
      }
      petalInstanced.instanceMatrix.needsUpdate = true;

      dustPoints.rotation.y = elapsed * 0.035;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  if (!webglAvailable) {
    return (
      <div
        data-testid="webgl-fallback"
        className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#062c38] via-[#051824] to-[#040d14]"
      >
        <div className="text-center p-6 max-w-md space-y-2">
          <p className="text-2xl font-hindi-display text-gold-metallic">
            ॥ शुभ दीपावली · राजसी मयूर महल दर्शन ॥
          </p>
          <p className="text-sm text-amber-200/80">
            स्वर्णिम कुंदन दीपों, राजसी मयूर एवं रंगोली से सुसज्जित भव्य भारतीय उत्सव प्रांगण
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasMountRef}
      data-testid="palace-3d-canvas"
      aria-label="भव्य 3D भारतीय महल, राजसी मयूर, रत्नजड़ित कुंदन दीप, झूलते कंदील और रंगोली का दृश्य"
      className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
    />
  );
};
