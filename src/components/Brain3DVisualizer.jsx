import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles, Eye, Info, Target, Layers, Shield } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_REGIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

// Global Texture Cache Map to prevent memory leaks from duplicate canvas generation
const textureCache = new Map();

function getOrCreateTextSprite(text, textColor = '#06b6d4', bgColor = 'rgba(2, 6, 23, 0.92)') {
  const cacheKey = `txt_${text}_${textColor}_${bgColor}`;
  if (textureCache.has(cacheKey)) {
    const cachedTexture = textureCache.get(cacheKey);
    const spriteMat = new THREE.SpriteMaterial({ map: cachedTexture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(52, 13, 1);
    return { sprite, material: spriteMat };
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      const g = new THREE.Group();
      return { sprite: g, material: null };
    }

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;

    const radius = 16;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, radius);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 28px "Orbitron", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = textColor;
    ctx.shadowBlur = 10;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    textureCache.set(cacheKey, texture);

    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(52, 13, 1);
    return { sprite, material: spriteMat };
  } catch (e) {
    const g = new THREE.Group();
    return { sprite: g, material: null };
  }
}

// Zero-GPU-cost Radial Glow Halo Sprite
function getOrCreateGlowSprite(colorHex = '#06b6d4') {
  const cacheKey = `glow_${colorHex}`;
  if (textureCache.has(cacheKey)) {
    const cachedTexture = textureCache.get(cacheKey);
    const mat = new THREE.SpriteMaterial({ 
      map: cachedTexture, 
      transparent: true, 
      blending: THREE.AdditiveBlending, 
      opacity: 0.65, 
      depthWrite: false 
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(70, 70, 1);
    return { sprite, material: mat };
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (!ctx) return { sprite: new THREE.Group(), material: null };

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(0.35, colorHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    textureCache.set(cacheKey, texture);

    const mat = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true, 
      blending: THREE.AdditiveBlending, 
      opacity: 0.65, 
      depthWrite: false 
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(70, 70, 1);
    return { sprite, material: mat };
  } catch (e) {
    return { sprite: new THREE.Group(), material: null };
  }
}

export default function Brain3DVisualizer({ userData, onOpenPurgeState, onOpenFeynman }) {
  const mountRef = useRef(null);
  const userDataRef = useRef(userData);
  const [activeHoverNode, setActiveHoverNode] = useState(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData?.activityLogs || []);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene, camera, renderer, controls, animId;
    const disposables = [];

    try {
      const width = mountRef.current.clientWidth || 600;
      const height = mountRef.current.clientHeight || 480;

      // 1. Scene & Crisp Sci-Fi Atmospheric Fog
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.0006); // Crisp low-density fog preserving vibrant colors

      camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
      camera.position.set(0, 50, 370); // Tightened camera position to fill frame with high-impact visuals

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // ACES Filmic Tone Mapping for bloom & emissive glow
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.maxDistance = 900;
      controls.minDistance = 60;

      // 2. High-Impact Cinematic Multi-Point Lighting Rig
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 3.2);
      cyanRimLight.position.set(200, 300, 200);
      scene.add(cyanRimLight);

      const purpleCoreLight = new THREE.PointLight(0xa855f7, 4.0, 400);
      purpleCoreLight.position.set(0, 0, 0);
      scene.add(purpleCoreLight);

      const pinkAccentLight = new THREE.PointLight(0xec4899, 2.5, 300);
      pinkAccentLight.position.set(-150, -100, 100);
      scene.add(pinkAccentLight);

      const brainGroup = new THREE.Group();
      scene.add(brainGroup);

      // 3. Dual-Layer Holographic Brain Wireframe Shell
      // Outer Cyan Shell
      const outerBrainGeo = new THREE.IcosahedronGeometry(160, 3);
      const outerBrainMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.45,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
        roughness: 0.2,
        metalness: 0.8
      });
      const outerBrainMesh = new THREE.Mesh(outerBrainGeo, outerBrainMat);
      outerBrainMesh.scale.set(0.95, 1.0, 1.3);
      brainGroup.add(outerBrainMesh);
      disposables.push(outerBrainGeo, outerBrainMat);

      // Inner Purple Shell for multi-dimensional depth
      const innerBrainGeo = new THREE.IcosahedronGeometry(120, 2);
      const innerBrainMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xa855f7,
        emissiveIntensity: 0.35,
        wireframe: true,
        transparent: true,
        opacity: 0.09,
        roughness: 0.3,
        metalness: 0.8
      });
      const innerBrainMesh = new THREE.Mesh(innerBrainGeo, innerBrainMat);
      innerBrainMesh.scale.set(0.95, 1.0, 1.3);
      brainGroup.add(innerBrainMesh);
      disposables.push(innerBrainGeo, innerBrainMat);

      // 4. The "Dao Core" (Pulsing Nascent Soul Energy Reactor)
      const daoCoreGeo = new THREE.SphereGeometry(22, 32, 32);
      const daoCoreMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xa855f7,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
      });
      const daoCoreMesh = new THREE.Mesh(daoCoreGeo, daoCoreMat);
      brainGroup.add(daoCoreMesh);
      disposables.push(daoCoreGeo, daoCoreMat);

      // Dao Core Halo
      const { sprite: coreHalo, material: coreHaloMat } = getOrCreateGlowSprite('#a855f7');
      coreHalo.scale.set(110, 110, 1);
      brainGroup.add(coreHalo);
      if (coreHaloMat) disposables.push(coreHaloMat);

      // 5. 300 Ambient Floating Qi Particles (Fills black void with living energy)
      const particleCount = 300;
      const partGeo = new THREE.BufferGeometry();
      const partPositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        partPositions[i] = (Math.random() - 0.5) * 650;
        partPositions[i + 1] = (Math.random() - 0.5) * 550;
        partPositions[i + 2] = (Math.random() - 0.5) * 650;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
      const partMat = new THREE.PointsMaterial({
        size: 3.5,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const qiParticleField = new THREE.Points(partGeo, partMat);
      brainGroup.add(qiParticleField);
      disposables.push(partGeo, partMat);

      // 6. Radiant Emissive Semaphore Sword with Attached Sweeping Light
      const swordGroup = new THREE.Group();
      
      const bladeGeo = new THREE.ConeGeometry(5.5, 48, 4);
      const bladeMat = new THREE.MeshStandardMaterial({ 
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.3,
        metalness: 0.1,
        roughness: 0.2
      });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.y = 24;
      swordGroup.add(bladeMesh);
      disposables.push(bladeGeo, bladeMat);

      const guardGeo = new THREE.BoxGeometry(22, 3.5, 5.5);
      const guardMat = new THREE.MeshStandardMaterial({ 
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.0,
        metalness: 0.2,
        roughness: 0.3
      });
      const guardMesh = new THREE.Mesh(guardGeo, guardMat);
      swordGroup.add(guardMesh);
      disposables.push(guardGeo, guardMat);

      const hiltGeo = new THREE.CylinderGeometry(2.2, 2.2, 14, 8);
      const hiltMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a,
        roughness: 0.5,
        metalness: 0.3
      });
      const hiltMesh = new THREE.Mesh(hiltGeo, hiltMat);
      hiltMesh.position.y = -7;
      swordGroup.add(hiltMesh);
      disposables.push(hiltGeo, hiltMat);

      // Sweeping dynamic light attached to the sword blade
      const swordLight = new THREE.PointLight(0x06b6d4, 3.5, 200);
      swordLight.position.set(0, 20, 0);
      swordGroup.add(swordLight);

      swordGroup.position.set(200, 0, 0);
      brainGroup.add(swordGroup);

      const allGraphNodes = [];
      const actionPotentialPulses = [];
      const heartDemonNodes = [];

      const clusterColors = ['#06b6d4', '#a855f7', '#10b981', '#f97316', '#ec4899'];

      subjects.forEach((subject, subjectIdx) => {
        const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4', syllabusTree: [] };
        const region = BRAIN_REGIONS[subjectIdx % BRAIN_REGIONS.length];
        
        const hasBeenStudied = (subject.completedLectures || 0) > 0;
        const isCorrupted = hasBeenStudied && state.retentionPercent < 50;
        const isDormant = !hasBeenStudied;

        let themeColor = clusterColors[subjectIdx % clusterColors.length];
        if (isCorrupted) themeColor = '#ef4444';
        if (isDormant) themeColor = '#475569';

        const hubPos = new THREE.Vector3(
          region.basePos.x + (Math.random() - 0.5) * 30,
          region.basePos.y + (Math.random() - 0.5) * 30,
          region.basePos.z + (Math.random() - 0.5) * 30
        );

        // Increased Hub Radius from 14 -> 18 for instant readability
        const hubRadius = 18;
        const hubGeo = new THREE.SphereGeometry(hubRadius, 24, 24);
        const hubMat = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(themeColor),
          emissive: new THREE.Color(themeColor),
          emissiveIntensity: isDormant ? 0.15 : isCorrupted ? 1.2 : 0.85,
          metalness: 0.3,
          roughness: 0.2,
          transparent: true, 
          opacity: isDormant ? 0.4 : isCorrupted ? 1.0 : 0.95 
        });
        const hubMesh = new THREE.Mesh(hubGeo, hubMat);
        hubMesh.position.copy(hubPos);
        disposables.push(hubGeo, hubMat);

        // Add Radiant Bloom Glow Halo behind the hub
        if (!isDormant) {
          const { sprite: hubGlow, material: hubGlowMat } = getOrCreateGlowSprite(themeColor);
          hubGlow.scale.set(75, 75, 1);
          hubMesh.add(hubGlow);
          if (hubGlowMat) disposables.push(hubGlowMat);
        }

        const hubLabelText = isDormant 
          ? `⚪ ${subject.name} (Dormant)` 
          : isCorrupted 
            ? `🖤 DEMON: ${subject.name}` 
            : `🧠 ${subject.name}`;

        const { sprite: hubTextSprite, material: hubSpriteMat } = getOrCreateTextSprite(hubLabelText, themeColor);
        hubTextSprite.position.set(0, hubRadius + 15, 0);
        hubTextSprite.visible = true;
        hubMesh.add(hubTextSprite);
        if (hubSpriteMat) disposables.push(hubSpriteMat);

        hubMesh.userData = {
          name: subject.name,
          level: 1,
          type: 'SUBJECT',
          subject,
          state,
          isCorrupted,
          isDormant,
          region: region.name,
          themeColor,
          connections: [],
          sprite: hubTextSprite
        };
        brainGroup.add(hubMesh);
        allGraphNodes.push(hubMesh);
        if (isCorrupted) heartDemonNodes.push(hubMesh);

        (state.syllabusTree || []).forEach((topicObj) => {
          const topicPos = new THREE.Vector3(
            hubPos.x + (Math.random() - 0.5) * 90,
            hubPos.y + (Math.random() - 0.5) * 90,
            hubPos.z + (Math.random() - 0.5) * 90
          );

          const topicRadius = 9;
          const topicGeo = new THREE.SphereGeometry(topicRadius, 16, 16);
          const topicMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(themeColor),
            emissive: new THREE.Color(themeColor),
            emissiveIntensity: isDormant ? 0.1 : 0.6,
            metalness: 0.3,
            roughness: 0.3,
            transparent: true, 
            opacity: isDormant ? 0.3 : 0.9 
          });
          const topicMesh = new THREE.Mesh(topicGeo, topicMat);
          topicMesh.position.copy(topicPos);
          disposables.push(topicGeo, topicMat);

          const { sprite: topicTextSprite, material: topicSpriteMat } = getOrCreateTextSprite(`⚡ ${topicObj.topicName}`, themeColor);
          topicTextSprite.scale.set(44, 11, 1);
          topicTextSprite.position.set(0, topicRadius + 10, 0);
          topicTextSprite.visible = false;
          topicMesh.add(topicTextSprite);
          if (topicSpriteMat) disposables.push(topicSpriteMat);

          topicMesh.userData = {
            name: topicObj.topicName,
            level: 2,
            type: 'TOPIC',
            subject,
            state,
            region: region.name,
            themeColor,
            connections: [],
            sprite: topicTextSprite
          };
          brainGroup.add(topicMesh);
          allGraphNodes.push(topicMesh);

          const controlPt1 = new THREE.Vector3().addVectors(hubPos, topicPos).multiplyScalar(0.5);
          controlPt1.y += (Math.random() - 0.5) * 20;

          const curve1 = new THREE.CubicBezierCurve3(hubPos, controlPt1, controlPt1, topicPos);
          const pts1 = curve1.getPoints(20);
          const lineGeo1 = new THREE.BufferGeometry().setFromPoints(pts1);
          const lineMat1 = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(themeColor), 
            transparent: true, 
            opacity: isDormant ? 0.18 : 0.6 
          });
          const line1 = new THREE.Line(lineGeo1, lineMat1);
          line1.userData = { nodeA: hubMesh, nodeB: topicMesh, defaultOpacity: isDormant ? 0.18 : 0.6 };
          brainGroup.add(line1);
          disposables.push(lineGeo1, lineMat1);

          hubMesh.userData.connections.push(topicMesh);
          topicMesh.userData.connections.push(hubMesh);

          if (!isDormant) {
            const pulseGeo1 = new THREE.SphereGeometry(2.6, 8, 8);
            const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const pulse1 = new THREE.Mesh(pulseGeo1, pulseMat1);
            brainGroup.add(pulse1);
            disposables.push(pulseGeo1, pulseMat1);

            actionPotentialPulses.push({ mesh: pulse1, curve: curve1, progress: Math.random() });
          }
        });
      });

      // 7. Throttled Raycaster for smooth 60 FPS interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let lastRaycastTime = 0;

      const onPointerMove = (e) => {
        const now = performance.now();
        if (now - lastRaycastTime < 45) return;
        lastRaycastTime = now;

        if (!renderer || !mountRef.current) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(allGraphNodes);

        if (intersects.length > 0) {
          const hoveredMesh = intersects[0].object;
          if (hoveredMesh !== activeHoverNode) {
            audio.playHoverSound();
            triggerHapticFeedback('light');
            setActiveHoverNode(hoveredMesh.userData);

            const connectedSet = new Set(hoveredMesh.userData.connections);
            connectedSet.add(hoveredMesh);

            allGraphNodes.forEach(node => {
              if (connectedSet.has(node)) {
                node.material.opacity = 1.0;
                if (node.userData.sprite) node.userData.sprite.visible = true;
                node.scale.set(1.3, 1.3, 1.3);
              } else {
                node.material.opacity = 0.12;
                if (node.userData.sprite && node.userData.level > 1) node.userData.sprite.visible = false;
                node.scale.set(0.85, 0.85, 0.85);
              }
            });
          }
        } else if (activeHoverNode) {
          setActiveHoverNode(null);
          allGraphNodes.forEach(node => {
            node.material.opacity = node.userData.isDormant ? 0.4 : 0.95;
            if (node.userData.sprite && node.userData.level > 1) node.userData.sprite.visible = false;
            node.scale.set(1, 1, 1);
          });
        }
      };

      const onClickNode = (e) => {
        if (!renderer || !mountRef.current) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(allGraphNodes);

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object;
          audio.playClick();
          triggerHapticFeedback('medium');
          setSelectedNodeDetails(clickedMesh.userData);
        }
      };

      const domElement = mountRef.current;
      domElement.addEventListener('pointermove', onPointerMove, { passive: true });
      domElement.addEventListener('click', onClickNode);

      let swordAngle = 0;

      // 8. 60FPS Ambient Animation Loop
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (brainGroup) brainGroup.rotation.y += 0.0012;

        // Pulsing Dao Core & Halo
        const corePulse = 1 + Math.sin(Date.now() * 0.003) * 0.08;
        daoCoreMesh.scale.set(corePulse, corePulse, corePulse);
        coreHalo.scale.set(110 * corePulse, 110 * corePulse, 1);

        // Orbiting Semaphore Sword with Sweeping Light
        swordAngle += 0.015;
        swordGroup.position.x = Math.cos(swordAngle) * 210;
        swordGroup.position.z = Math.sin(swordAngle) * 210;
        swordGroup.rotation.y += 0.03;

        // Subtle slow rotation of Qi particle field
        qiParticleField.rotation.y += 0.0004;

        // Pulse Heart Demon Corrupted Nodes
        heartDemonNodes.forEach(mesh => {
          mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.15);
        });

        // Travel Action Potential Photons along Bézier curves
        actionPotentialPulses.forEach(pulse => {
          pulse.progress += 0.006;
          if (pulse.progress > 1) pulse.progress = 0;
          const pt = pulse.curve.getPoint(pulse.progress);
          pulse.mesh.position.copy(pt);
        });

        if (renderer && scene && camera) renderer.render(scene, camera);
      };

      animate();

      // 9. Zero-Memory-Leak Teardown
      return () => {
        if (animId) cancelAnimationFrame(animId);
        if (domElement) {
          domElement.removeEventListener('pointermove', onPointerMove);
          domElement.removeEventListener('click', onClickNode);
        }
        if (mountRef.current) mountRef.current.innerHTML = '';
        if (controls) controls.dispose();
        
        disposables.forEach(d => {
          if (d && typeof d.dispose === 'function') d.dispose();
        });

        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.warn("Brain3DVisualizer fallback mode:", err);
    }
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/80 cyber-hud-brackets flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-orbitron">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              OBSIDIAN 3D BRAIN MATRIX
            </h2>
            <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              🗡️ SEMAPHORE SWORD FORGED
            </span>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Hover or tap any node to reveal sub-topic labels. Dormant nodes activate as you complete lectures!
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFeynman}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <span>🎓 Feynman Disciple</span>
          </button>
          <button
            onClick={onOpenPurgeState}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>🖤 Purge Heart Demons</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 cyber-panel rounded-2xl border border-cyan-500/40 bg-slate-950/90 cyber-hud-brackets relative h-[480px] sm:h-[540px] overflow-hidden flex flex-col justify-between p-4 font-orbitron">
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-slate-950/90 px-3 py-1 rounded border border-cyan-500/40 shadow">
              Obsidian 3D Physics Graph (Hover / Tap to Reveal Topic Labels)
            </span>
          </div>

          {/* WebGL Canvas Target */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-slate-400">⚪ Dormant (Unstudied)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
              <span className="text-slate-300">🔵 Mastered Synapse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-bold">🔴 Heart Demon (&lt;50%)</span>
            </div>
          </div>
        </div>

        {/* Diagnostics Sidebar */}
        <div className="space-y-4 font-orbitron">
          <div className="cyber-panel p-5 rounded-2xl border border-amber-500/40 bg-slate-950/80 cyber-hud-brackets space-y-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Forged Divine Artifacts
            </h3>

            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1">
              <span className="text-xs font-bold text-amber-300 block">🗡️ The Semaphore Sword of Concurrency</span>
              <p className="text-[11px] font-rajdhani text-slate-300">
                Passive Shield: Slows Ebbinghaus memory decay for Operating Systems by 15%.
              </p>
            </div>
          </div>

          <div className="cyber-panel p-5 rounded-2xl border border-purple-500/40 bg-slate-950/80 cyber-hud-brackets space-y-3">
            <h3 className="text-sm font-bold text-purple-300 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Dao Core Memory Matrix
            </h3>

            <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Average Retention:</span>
                <span className="text-purple-300 font-bold font-mono">{brainMetrics.averageRetention}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Synapses:</span>
                <span className="text-cyan-300 font-bold font-mono">{brainMetrics.totalSynapses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Memory Half-Life:</span>
                <span className="text-emerald-300 font-bold font-mono">~{brainMetrics.averageHalfLife} Days</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
