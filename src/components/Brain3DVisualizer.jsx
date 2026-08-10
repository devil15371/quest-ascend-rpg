import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles, Eye, Info, Target, Layers, Shield } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_REGIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

// Global Texture Cache Map
const textureCache = new Map();

function getOrCreateTextSprite(text, textColor = '#06b6d4', bgColor = 'rgba(2, 6, 23, 0.9)') {
  const cacheKey = `${text}_${textColor}_${bgColor}`;
  if (textureCache.has(cacheKey)) {
    const cachedTexture = textureCache.get(cacheKey);
    const spriteMat = new THREE.SpriteMaterial({ map: cachedTexture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(50, 12, 1);
    return sprite;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (!ctx) return new THREE.Group();

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
    ctx.shadowBlur = 8;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    textureCache.set(cacheKey, texture);

    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(50, 12, 1);
    return sprite;
  } catch (e) {
    return new THREE.Group();
  }
}

export default function Brain3DVisualizer({ userData, onOpenPurgeState, onOpenFeynman }) {
  const mountRef = useRef(null);
  const [activeHoverNode, setActiveHoverNode] = useState(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData?.activityLogs || []);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene, camera, renderer, controls, animId;

    try {
      const width = mountRef.current.clientWidth || 600;
      const height = mountRef.current.clientHeight || 480;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
      camera.position.set(0, 70, 440);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.maxDistance = 900;
      controls.minDistance = 50;

      const brainGroup = new THREE.Group();
      scene.add(brainGroup);

      const brainMeshGeo = new THREE.IcosahedronGeometry(160, 3);
      const brainMeshMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      const brainMesh = new THREE.Mesh(brainMeshGeo, brainMeshMat);
      brainMesh.scale.set(0.95, 1.0, 1.3);
      brainGroup.add(brainMesh);

      // Low-Poly Emissive Semaphore Sword of Concurrency
      const swordGroup = new THREE.Group();
      
      const bladeGeo = new THREE.ConeGeometry(5, 45, 4);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.y = 22;
      swordGroup.add(bladeMesh);

      const guardGeo = new THREE.BoxGeometry(20, 3.5, 5);
      const guardMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const guardMesh = new THREE.Mesh(guardGeo, guardMat);
      swordGroup.add(guardMesh);

      const hiltGeo = new THREE.CylinderGeometry(2, 2, 12, 8);
      const hiltMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      const hiltMesh = new THREE.Mesh(hiltGeo, hiltMat);
      hiltMesh.position.y = -7;
      swordGroup.add(hiltMesh);

      swordGroup.position.set(190, 0, 0);
      brainGroup.add(swordGroup);

      const allGraphNodes = [];
      const allBezierConnections = [];
      const actionPotentialPulses = [];
      const heartDemonNodes = [];

      const clusterColors = ['#06b6d4', '#a855f7', '#10b981', '#f97316', '#ec4899'];

      subjects.forEach((subject, subjectIdx) => {
        const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4', syllabusTree: [] };
        const region = BRAIN_REGIONS[subjectIdx % BRAIN_REGIONS.length];
        
        // 3-State Synapse Logic:
        // 1. Dormant (never studied / completedLectures == 0): Dark Slate Grey #475569
        // 2. Mastered (studied & retention >= 50%): Bright Cyan/Purple
        // 3. Heart Demon (studied, then neglected, retention < 50%): Dark Red #ef4444
        const hasBeenStudied = subject.completedLectures > 0;
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

        const hubRadius = 14;
        const hubGeo = new THREE.SphereGeometry(hubRadius, 24, 24);
        const hubMat = new THREE.MeshBasicMaterial({ 
          color: new THREE.Color(themeColor), 
          transparent: true, 
          opacity: isDormant ? 0.35 : isCorrupted ? 1.0 : 0.95 
        });
        const hubMesh = new THREE.Mesh(hubGeo, hubMat);
        hubMesh.position.copy(hubPos);

        const hubLabelText = isDormant 
          ? `⚪ ${subject.name} (Dormant)` 
          : isCorrupted 
            ? `🖤 DEMON: ${subject.name}` 
            : `🧠 ${subject.name}`;

        const hubTextSprite = getOrCreateTextSprite(hubLabelText, themeColor);
        hubTextSprite.position.set(0, hubRadius + 14, 0);
        hubTextSprite.visible = true; // Subject hubs remain visible
        hubMesh.add(hubTextSprite);

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

          const topicRadius = 8;
          const topicGeo = new THREE.SphereGeometry(topicRadius, 16, 16);
          const topicMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(themeColor), transparent: true, opacity: isDormant ? 0.25 : 0.85 });
          const topicMesh = new THREE.Mesh(topicGeo, topicMat);
          topicMesh.position.copy(topicPos);

          const topicTextSprite = getOrCreateTextSprite(`⚡ ${topicObj.topicName}`, themeColor);
          topicTextSprite.scale.set(42, 10, 1);
          topicTextSprite.position.set(0, topicRadius + 9, 0);
          topicTextSprite.visible = false; // Hidden by default, reveals ONLY on hover/tap!
          topicMesh.add(topicTextSprite);

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
          const lineMat1 = new THREE.LineBasicMaterial({ color: new THREE.Color(themeColor), transparent: true, opacity: isDormant ? 0.15 : 0.45 });
          const line1 = new THREE.Line(lineGeo1, lineMat1);
          line1.userData = { nodeA: hubMesh, nodeB: topicMesh, defaultOpacity: isDormant ? 0.15 : 0.45 };
          brainGroup.add(line1);
          allBezierConnections.push(line1);

          hubMesh.userData.connections.push(topicMesh);
          topicMesh.userData.connections.push(hubMesh);

          if (!isDormant) {
            const pulseGeo1 = new THREE.SphereGeometry(2.2, 8, 8);
            const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const pulse1 = new THREE.Mesh(pulseGeo1, pulseMat1);
            brainGroup.add(pulse1);

            actionPotentialPulses.push({ mesh: pulse1, curve: curve1, progress: Math.random() });
          }
        });
      });

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onPointerMove = (e) => {
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
                if (node.userData.sprite) node.userData.sprite.visible = true; // Reveal label on hover
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
            node.material.opacity = node.userData.isDormant ? 0.35 : 0.9;
            if (node.userData.sprite && node.userData.level > 1) node.userData.sprite.visible = false; // Hide sub-topic labels
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
      domElement.addEventListener('pointermove', onPointerMove);
      domElement.addEventListener('click', onClickNode);

      let swordAngle = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (brainGroup) brainGroup.rotation.y += 0.0012;

        // Smooth Orbiting Semaphore Sword
        swordAngle += 0.015;
        swordGroup.position.x = Math.cos(swordAngle) * 210;
        swordGroup.position.z = Math.sin(swordAngle) * 210;
        swordGroup.rotation.y += 0.03;

        // Pulse Heart Demon Red Shaders
        heartDemonNodes.forEach(mesh => {
          mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.15);
        });

        actionPotentialPulses.forEach(pulse => {
          pulse.progress += 0.006;
          if (pulse.progress > 1) pulse.progress = 0;
          const pt = pulse.curve.getPoint(pulse.progress);
          pulse.mesh.position.copy(pt);
        });

        if (renderer && scene && camera) renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (animId) cancelAnimationFrame(animId);
        if (domElement) {
          domElement.removeEventListener('pointermove', onPointerMove);
          domElement.removeEventListener('click', onClickNode);
        }
        if (mountRef.current) mountRef.current.innerHTML = '';
        if (controls) controls.dispose();
        if (brainMeshGeo) brainMeshGeo.dispose();
        if (brainMeshMat) brainMeshMat.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.warn("Brain3DVisualizer fallback mode:", err);
    }
  }, [userData]);

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
        </div>

      </div>

    </div>
  );
}
