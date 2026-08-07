import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles, Eye, Info, Layers, Maximize2, Minimize2, ChevronRight, Target } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_REGIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

/**
 * Creates high-definition 2D Canvas Text Billboard Sprite
 */
function create3DTextSprite(text, textColor = '#06b6d4', bgColor = 'rgba(2, 6, 23, 0.85)') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background Rounded Box
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;

  const radius = 16;
  ctx.beginPath();
  ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, radius);
  ctx.fill();
  ctx.stroke();

  // Text Styling
  ctx.font = 'bold 30px "Orbitron", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text Shadow Glow
  ctx.shadowColor = textColor;
  ctx.shadowBlur = 10;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(55, 14, 1);
  return sprite;
}

export default function Brain3DVisualizer({ userData }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [activeHoverNode, setActiveHoverNode] = useState(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const activeCampaign = userData.campaigns.find(c => c.id === userData.activeCampaignId) || userData.campaigns[0];
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData.activityLogs);

  // Target Camera Smooth Lerp Position
  const targetCamPos = useRef(new THREE.Vector3(0, 80, 480));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const resetCameraView = () => {
    audio.playClick();
    triggerHapticFeedback('light');
    setSelectedNodeDetails(null);
    setIsZoomedIn(false);
    targetCamPos.current.set(0, 80, 480);
    targetLookAt.current.set(0, 0, 0);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Three.js Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3500);
    camera.position.set(0, 80, 480);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.maxDistance = 1200;
    controls.minDistance = 60;
    controlsRef.current = controls;

    // 3. Realistic 3D Holographic Glass Brain Structure
    const brainHullGroup = new THREE.Group();
    scene.add(brainHullGroup);

    // Outer Glass Hemisphere Mesh
    const glassBrainGeo = new THREE.IcosahedronGeometry(175, 4);
    const glassBrainMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.09
    });
    const outerGlassMesh = new THREE.Mesh(glassBrainGeo, glassBrainMat);
    outerGlassMesh.scale.set(0.95, 1.0, 1.35);
    brainHullGroup.add(outerGlassMesh);

    // Inner Axon Fiber Core Matrix
    const fiberGeo = new THREE.BufferGeometry();
    const fiberPoints = [];
    for (let i = 0; i < 400; i++) {
      const p1 = new THREE.Vector3(
        (Math.random() - 0.5) * 220,
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 260
      );
      const p2 = p1.clone().add(new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40));
      fiberPoints.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    fiberGeo.setAttribute('position', new THREE.Float32BufferAttribute(fiberPoints, 3));
    const fiberMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 });
    const fiberMesh = new THREE.LineSegments(fiberGeo, fiberMat);
    brainHullGroup.add(fiberMesh);

    // 4. Constellation Clusters & 3D Bezier Axon Pathways
    const allGraphNodes = [];
    const allBezierConnections = [];
    const actionPotentialPulses = [];

    const clusterColors = ['#f97316', '#a855f7', '#06b6d4', '#10b981', '#ec4899']; // Orange, Purple, Cyan, Green, Pink

    subjects.forEach((subject, subjectIdx) => {
      const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4' };
      const region = BRAIN_REGIONS[subjectIdx % BRAIN_REGIONS.length];
      const themeColor = clusterColors[subjectIdx % clusterColors.length];

      // Level 1 Hub Node
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
        opacity: 0.95
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(hubPos);

      // 3D Text Label
      const hubTextSprite = create3DTextSprite(`🧠 ${subject.name}`, themeColor);
      hubTextSprite.position.set(0, hubRadius + 14, 0);
      hubMesh.add(hubTextSprite);

      hubMesh.userData = {
        name: subject.name,
        level: 1,
        type: 'SUBJECT',
        subject,
        state,
        region: region.name,
        themeColor,
        radius: hubRadius,
        connections: [],
        sprite: hubTextSprite
      };
      brainHullGroup.add(hubMesh);
      allGraphNodes.push(hubMesh);

      // Level 2 Topic Nodes
      state.syllabusTree.forEach((topicObj, topicIdx) => {
        const topicPos = new THREE.Vector3(
          hubPos.x + (Math.random() - 0.5) * 95,
          hubPos.y + (Math.random() - 0.5) * 95,
          hubPos.z + (Math.random() - 0.5) * 95
        );

        const topicRadius = 9;
        const topicGeo = new THREE.SphereGeometry(topicRadius, 16, 16);
        const topicMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(themeColor),
          transparent: true,
          opacity: 0.85
        });
        const topicMesh = new THREE.Mesh(topicGeo, topicMat);
        topicMesh.position.copy(topicPos);

        const topicTextSprite = create3DTextSprite(`⚡ ${topicObj.topicName}`, themeColor);
        topicTextSprite.scale.set(48, 12, 1);
        topicTextSprite.position.set(0, topicRadius + 10, 0);
        topicMesh.add(topicTextSprite);

        topicMesh.userData = {
          name: topicObj.topicName,
          level: 2,
          type: 'TOPIC',
          subject,
          state,
          region: region.name,
          themeColor,
          radius: topicRadius,
          connections: [],
          sprite: topicTextSprite
        };
        brainHullGroup.add(topicMesh);
        allGraphNodes.push(topicMesh);

        // Bezier Pathway Level 1 ➔ Level 2
        const controlPt1 = new THREE.Vector3().addVectors(hubPos, topicPos).multiplyScalar(0.5);
        controlPt1.y += (Math.random() - 0.5) * 20;

        const curve1 = new THREE.CubicBezierCurve3(hubPos, controlPt1, controlPt1, topicPos);
        const pts1 = curve1.getPoints(24);
        const lineGeo1 = new THREE.BufferGeometry().setFromPoints(pts1);
        const lineMat1 = new THREE.LineBasicMaterial({
          color: new THREE.Color(themeColor),
          transparent: true,
          opacity: 0.55
        });
        const line1 = new THREE.Line(lineGeo1, lineMat1);
        line1.userData = { nodeA: hubMesh, nodeB: topicMesh, defaultOpacity: 0.55, color: themeColor };
        brainHullGroup.add(line1);
        allBezierConnections.push(line1);

        hubMesh.userData.connections.push(topicMesh);
        topicMesh.userData.connections.push(hubMesh);

        // Action Potential Pulse
        const pulseGeo1 = new THREE.SphereGeometry(2.5, 8, 8);
        const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pulse1 = new THREE.Mesh(pulseGeo1, pulseMat1);
        brainHullGroup.add(pulse1);

        actionPotentialPulses.push({ mesh: pulse1, curve: curve1, progress: Math.random() });

        // Level 3 Sub-Topics
        topicObj.subTopics.forEach((subName) => {
          const subPos = new THREE.Vector3(
            topicPos.x + (Math.random() - 0.5) * 65,
            topicPos.y + (Math.random() - 0.5) * 65,
            topicPos.z + (Math.random() - 0.5) * 65
          );

          const subRadius = 5.5;
          const subGeo = new THREE.SphereGeometry(subRadius, 12, 12);
          const subMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(themeColor),
            transparent: true,
            opacity: 0.8
          });
          const subMesh = new THREE.Mesh(subGeo, subMat);
          subMesh.position.copy(subPos);

          const subTextSprite = create3DTextSprite(`🔹 ${subName}`, themeColor);
          subTextSprite.scale.set(40, 10, 1);
          subTextSprite.position.set(0, subRadius + 8, 0);
          subMesh.add(subTextSprite);

          subMesh.userData = {
            name: subName,
            level: 3,
            type: 'SUBTOPIC',
            subject,
            state,
            region: region.name,
            themeColor,
            radius: subRadius,
            connections: [],
            sprite: subTextSprite
          };
          brainHullGroup.add(subMesh);
          allGraphNodes.push(subMesh);

          // Bezier Pathway Level 2 ➔ Level 3
          const controlPt2 = new THREE.Vector3().addVectors(topicPos, subPos).multiplyScalar(0.5);
          const curve2 = new THREE.CubicBezierCurve3(topicPos, controlPt2, controlPt2, subPos);
          const pts2 = curve2.getPoints(16);
          const lineGeo2 = new THREE.BufferGeometry().setFromPoints(pts2);
          const lineMat2 = new THREE.LineBasicMaterial({
            color: new THREE.Color(themeColor),
            transparent: true,
            opacity: 0.45
          });
          const line2 = new THREE.Line(lineGeo2, lineMat2);
          line2.userData = { nodeA: topicMesh, nodeB: subMesh, defaultOpacity: 0.45, color: themeColor };
          brainHullGroup.add(line2);
          allBezierConnections.push(line2);

          topicMesh.userData.connections.push(subMesh);
          subMesh.userData.connections.push(topicMesh);
        });
      });
    });

    // 5. Raycaster Node Click Zoom Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
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
              node.userData.sprite.material.opacity = 1.0;
              node.scale.set(1.3, 1.3, 1.3);
            } else {
              node.material.opacity = 0.12;
              node.userData.sprite.material.opacity = 0.12;
              node.scale.set(0.85, 0.85, 0.85);
            }
          });

          allBezierConnections.forEach(line => {
            if (connectedSet.has(line.userData.nodeA) && connectedSet.has(line.userData.nodeB)) {
              line.material.opacity = 1.0;
            } else {
              line.material.opacity = 0.04;
            }
          });
        }
      } else if (activeHoverNode) {
        setActiveHoverNode(null);
        allGraphNodes.forEach(node => {
          node.material.opacity = 0.9;
          node.userData.sprite.material.opacity = 1.0;
          node.scale.set(1, 1, 1);
        });
        allBezierConnections.forEach(line => {
          line.material.opacity = line.userData.defaultOpacity;
        });
      }
    };

    const onClickNode = (e) => {
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
        setIsZoomedIn(true);

        // Smooth Camera Lerp Zoom Target directly to the clicked node in 3D!
        const nodeWorldPos = clickedMesh.position.clone();
        targetLookAt.current.copy(nodeWorldPos);

        const offsetDir = camera.position.clone().sub(controls.target).normalize();
        targetCamPos.current.copy(nodeWorldPos).add(offsetDir.multiplyScalar(130));
      }
    };

    const domElement = mountRef.current;
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('click', onClickNode);

    // 6. Animation Loop with Camera Position Lerp Interpolation
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth Camera Lerp Target Animation
      camera.position.lerp(targetCamPos.current, 0.08);
      controls.target.lerp(targetLookAt.current, 0.08);
      controls.update();

      if (!isZoomedIn) {
        brainHullGroup.rotation.y += 0.001;
      }

      // Animate Action Potential electrical pulses along 3D Bezier curves
      actionPotentialPulses.forEach(pulse => {
        pulse.progress += 0.007;
        if (pulse.progress > 1) pulse.progress = 0;
        const pt = pulse.curve.getPoint(pulse.progress);
        pulse.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('click', onClickNode);
      if (mountRef.current) mountRef.current.innerHTML = '';
      controls.dispose();
    };
  }, [userData, isZoomedIn]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/80 cyber-hud-brackets flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-orbitron font-black text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              REALISTIC 3D HOLOGRAPHIC CONSTELLATION BRAIN
            </h2>
            <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              CLICK NODE TO ZOOM
            </span>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Holographic Glass Brain: Click any node to smoothly zoom in 3D space & trace every connection route!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isZoomedIn && (
            <button
              onClick={resetCameraView}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 uppercase"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Center Brain View</span>
            </button>
          )}

          <div className="px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-orbitron font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{brainMetrics.averageRetention}% RETENTION</span>
          </div>
        </div>
      </div>

      {/* Main 3D Graph Canvas & Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D WebGL Glass Brain Viewport */}
        <div className="lg:col-span-2 cyber-panel rounded-2xl border border-cyan-500/40 bg-slate-950/90 cyber-hud-brackets relative h-[500px] sm:h-[580px] overflow-hidden flex flex-col justify-between p-4">
          
          {/* Top Info overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-400 bg-slate-950/90 px-3 py-1 rounded border border-cyan-500/40 shadow">
              {isZoomedIn ? '🔎 Zoomed Inspection Mode' : '🌌 Orbit Mode (Click Node to Zoom Direct)'}
            </span>
          </div>

          {/* Sci-Fi Floating HUD Card on Node Click */}
          {selectedNodeDetails && (
            <div className="absolute top-4 right-4 z-20 bg-slate-950/95 border-2 border-cyan-400 p-4 rounded-2xl shadow-2xl max-w-xs animate-fade-in font-orbitron cyber-hud-brackets backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-cyan-400" /> Zoomed Inspection
                </span>
                <button onClick={() => setSelectedNodeDetails(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
              </div>

              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                Level {selectedNodeDetails.level} {selectedNodeDetails.type}
              </span>

              <h3 className="text-base font-black text-white mt-1.5 mb-1">{selectedNodeDetails.name}</h3>

              <div className="text-xs font-rajdhani text-slate-300 space-y-1.5 my-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Parent Subject:</span>
                  <span className="font-bold text-cyan-300">{selectedNodeDetails.subject.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory Retention:</span>
                  <span style={{ color: selectedNodeDetails.state.statusColor }} className="font-bold">
                    {selectedNodeDetails.state.retentionPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stability Half-Life:</span>
                  <span className="font-bold text-purple-300">{selectedNodeDetails.state.halfLifeDays} Days</span>
                </div>
              </div>

              <button
                onClick={resetCameraView}
                className="w-full py-2 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-cyan-950 text-cyan-300 font-orbitron font-bold text-[11px] uppercase transition flex items-center justify-center gap-1"
              >
                <span>Reset View</span>
              </button>
            </div>
          )}

          {/* WebGL Canvas Target */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-orbitron bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              <span className="text-slate-300">Core CS Hubs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              <span className="text-slate-300">Exam Practice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/50" />
              <span className="text-slate-300">Math & Systems</span>
            </div>
          </div>
        </div>

        {/* Diagnostics & Node Inspector Sidebar */}
        <div className="space-y-4">
          
          <div className="cyber-panel p-5 rounded-2xl border border-purple-500/40 bg-slate-950/80 cyber-hud-brackets space-y-3">
            <h3 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Neuro-Diagnostics
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-orbitron">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ACTIVE SYNAPSES</span>
                <span className="text-base font-black text-cyan-300">{brainMetrics.totalSynapses}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">HALF-LIFE</span>
                <span className="text-base font-black text-purple-300">{brainMetrics.averageHalfLife} Days</span>
              </div>
            </div>
          </div>

          {/* Subject Synaptic Health List */}
          <div className="cyber-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/80 max-h-80 overflow-y-auto space-y-2.5">
            <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase">Multi-Tier Syllabus Matrix</h4>
            {brainMetrics.subjectStates.map(state => (
              <div key={state.subjectId} className="space-y-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-rajdhani font-bold text-white">
                  <span>🧠 {state.subjectName}</span>
                  <span style={{ color: state.statusColor }} className="font-mono">{state.retentionPercent}%</span>
                </div>
                <div className="pl-3 space-y-1 border-l border-cyan-500/30">
                  {state.syllabusTree.map((topic, tIdx) => (
                    <div key={tIdx} className="text-[11px] font-rajdhani text-slate-400">
                      <span className="text-purple-400 font-bold">⚡ {topic.topicName}</span>
                      <div className="pl-2 text-[10px] text-slate-500">
                        {topic.subTopics.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
