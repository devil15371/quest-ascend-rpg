import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles, Eye, Info, Layers } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_REGIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

/**
 * Creates a high-definition 2D Canvas Text Billboard Sprite in 3D space
 */
function create3DTextSprite(text, textColor = '#06b6d4', bgColor = 'rgba(2, 6, 23, 0.85)') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background Box with Rounded Corners
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;

  const radius = 16;
  ctx.beginPath();
  ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, radius);
  ctx.fill();
  ctx.stroke();

  // Text Styling
  ctx.font = 'bold 32px "Orbitron", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text Shadow Glow Effect
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
  sprite.scale.set(60, 15, 1);
  return sprite;
}

export default function Brain3DVisualizer({ userData }) {
  const mountRef = useRef(null);
  const [activeHoverNode, setActiveHoverNode] = useState(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  const activeCampaign = userData.campaigns.find(c => c.id === userData.activeCampaignId) || userData.campaigns[0];
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData.activityLogs);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Three.js Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    camera.position.set(0, 80, 480);

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
    controls.zoomSpeed = 1.0;
    controls.maxDistance = 1000;
    controls.minDistance = 150;

    // 3. Anatomical Brain Shell Mesh Wireframe
    const brainHullGroup = new THREE.Group();
    scene.add(brainHullGroup);

    const brainMeshGeo = new THREE.IcosahedronGeometry(165, 3);
    const brainMeshMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.07
    });
    const brainMesh = new THREE.Mesh(brainMeshGeo, brainMeshMat);
    brainMesh.scale.set(0.95, 1.0, 1.3);
    brainHullGroup.add(brainMesh);

    // 4. Build Multi-Tier 3D Neural Network with Floating Text Labels
    const allGraphNodes = [];
    const allBezierConnections = [];
    const actionPotentialPulses = [];

    subjects.forEach((subject, subjectIdx) => {
      const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4' };
      const region = BRAIN_REGIONS[subjectIdx % BRAIN_REGIONS.length];

      // Level 1: Primary Subject Hub Node
      const hubPos = new THREE.Vector3(
        region.basePos.x + (Math.random() - 0.5) * 30,
        region.basePos.y + (Math.random() - 0.5) * 30,
        region.basePos.z + (Math.random() - 0.5) * 30
      );

      const hubRadius = 14;
      const hubGeo = new THREE.SphereGeometry(hubRadius, 24, 24);
      const hubMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.statusColor),
        transparent: true,
        opacity: 0.95
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(hubPos);

      // Level 1 3D Text Label
      const hubTextSprite = create3DTextSprite(`🧠 ${subject.name} [${state.retentionPercent}%]`, state.statusColor);
      hubTextSprite.position.set(0, hubRadius + 14, 0);
      hubMesh.add(hubTextSprite);

      hubMesh.userData = {
        name: subject.name,
        level: 1,
        type: 'SUBJECT',
        subject,
        state,
        region: region.name,
        radius: hubRadius,
        connections: [],
        sprite: hubTextSprite
      };
      brainHullGroup.add(hubMesh);
      allGraphNodes.push(hubMesh);

      // Level 2: Topic Nodes
      state.syllabusTree.forEach((topicObj, topicIdx) => {
        const topicPos = new THREE.Vector3(
          hubPos.x + (Math.random() - 0.5) * 90,
          hubPos.y + (Math.random() - 0.5) * 90,
          hubPos.z + (Math.random() - 0.5) * 90
        );

        const topicRadius = 9;
        const topicGeo = new THREE.SphereGeometry(topicRadius, 16, 16);
        const topicMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#a855f7'), // Purple Topic Node
          transparent: true,
          opacity: 0.85
        });
        const topicMesh = new THREE.Mesh(topicGeo, topicMat);
        topicMesh.position.copy(topicPos);

        // Level 2 3D Text Label
        const topicTextSprite = create3DTextSprite(`⚡ ${topicObj.topicName}`, '#a855f7');
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
          radius: topicRadius,
          connections: [],
          sprite: topicTextSprite
        };
        brainHullGroup.add(topicMesh);
        allGraphNodes.push(topicMesh);

        // Bezier Pathway connecting Level 1 Hub ➔ Level 2 Topic Node
        const controlPt1 = new THREE.Vector3().addVectors(hubPos, topicPos).multiplyScalar(0.5);
        controlPt1.y += (Math.random() - 0.5) * 20;

        const curve1 = new THREE.CubicBezierCurve3(hubPos, controlPt1, controlPt1, topicPos);
        const pts1 = curve1.getPoints(20);
        const lineGeo1 = new THREE.BufferGeometry().setFromPoints(pts1);
        const lineMat1 = new THREE.LineBasicMaterial({
          color: new THREE.Color('#a855f7'),
          transparent: true,
          opacity: 0.55
        });
        const line1 = new THREE.Line(lineGeo1, lineMat1);
        line1.userData = { nodeA: hubMesh, nodeB: topicMesh, defaultOpacity: 0.55 };
        brainHullGroup.add(line1);
        allBezierConnections.push(line1);

        hubMesh.userData.connections.push(topicMesh);
        topicMesh.userData.connections.push(hubMesh);

        // Action Potential Pulse
        const pulseGeo1 = new THREE.SphereGeometry(2.5, 8, 8);
        const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0xc084fc });
        const pulse1 = new THREE.Mesh(pulseGeo1, pulseMat1);
        brainHullGroup.add(pulse1);

        actionPotentialPulses.push({ mesh: pulse1, curve: curve1, progress: Math.random() });

        // Level 3: Sub-Topic Nodes
        topicObj.subTopics.forEach((subName, subIdx) => {
          const subPos = new THREE.Vector3(
            topicPos.x + (Math.random() - 0.5) * 60,
            topicPos.y + (Math.random() - 0.5) * 60,
            topicPos.z + (Math.random() - 0.5) * 60
          );

          const subRadius = 5.5;
          const subGeo = new THREE.SphereGeometry(subRadius, 12, 12);
          const subMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#ec4899'), // Pink Subtopic Node
            transparent: true,
            opacity: 0.8
          });
          const subMesh = new THREE.Mesh(subGeo, subMat);
          subMesh.position.copy(subPos);

          // Level 3 3D Text Label
          const subTextSprite = create3DTextSprite(`🔹 ${subName}`, '#f472b6');
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
            radius: subRadius,
            connections: [],
            sprite: subTextSprite
          };
          brainHullGroup.add(subMesh);
          allGraphNodes.push(subMesh);

          // Bezier Pathway connecting Level 2 Topic ➔ Level 3 Sub-Topic Node
          const controlPt2 = new THREE.Vector3().addVectors(topicPos, subPos).multiplyScalar(0.5);
          const curve2 = new THREE.CubicBezierCurve3(topicPos, controlPt2, controlPt2, subPos);
          const pts2 = curve2.getPoints(16);
          const lineGeo2 = new THREE.BufferGeometry().setFromPoints(pts2);
          const lineMat2 = new THREE.LineBasicMaterial({
            color: new THREE.Color('#ec4899'),
            transparent: true,
            opacity: 0.45
          });
          const line2 = new THREE.Line(lineGeo2, lineMat2);
          line2.userData = { nodeA: topicMesh, nodeB: subMesh, defaultOpacity: 0.45 };
          brainHullGroup.add(line2);
          allBezierConnections.push(line2);

          topicMesh.userData.connections.push(subMesh);
          subMesh.userData.connections.push(topicMesh);
        });
      });
    });

    // 5. Raycaster Hover Focus Interaction
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

          // Highlight Tree Branch Lineage
          const connectedSet = new Set(hoveredMesh.userData.connections);
          connectedSet.add(hoveredMesh);

          allGraphNodes.forEach(node => {
            if (connectedSet.has(node)) {
              node.material.opacity = 1.0;
              node.userData.sprite.material.opacity = 1.0;
              node.scale.set(1.25, 1.25, 1.25);
            } else {
              node.material.opacity = 0.15;
              node.userData.sprite.material.opacity = 0.15;
              node.scale.set(0.85, 0.85, 0.85);
            }
          });

          allBezierConnections.forEach(line => {
            if (connectedSet.has(line.userData.nodeA) && connectedSet.has(line.userData.nodeB)) {
              line.material.opacity = 0.95;
            } else {
              line.material.opacity = 0.05;
            }
          });
        }
      } else if (activeHoverNode) {
        setActiveHoverNode(null);
        // Reset all opacity
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
        audio.playClick();
        triggerHapticFeedback('medium');
        setSelectedNodeDetails(intersects[0].object.userData);
      }
    };

    const domElement = mountRef.current;
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('click', onClickNode);

    // 6. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      controls.update();

      // Organic Rotation
      brainHullGroup.rotation.y += 0.0012;

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
  }, [userData]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/80 cyber-hud-brackets flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-orbitron font-black text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              MULTI-TIER 3D BRAIN NEURAL NETWORK
            </h2>
            <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              3D FLOATING LABELS
            </span>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Real 3D Neural Matrix: Subject Hubs ➔ Topics ➔ Sub-Topics with floating 3D text labels & Bezier synapses.
          </p>
        </div>

        {/* Global Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-orbitron font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{brainMetrics.averageRetention}% RETENTION</span>
          </div>
        </div>
      </div>

      {/* Main 3D Graph Canvas & Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D WebGL Graph Viewport */}
        <div className="lg:col-span-2 cyber-panel rounded-2xl border border-cyan-500/40 bg-slate-950/90 cyber-hud-brackets relative h-[480px] sm:h-[560px] overflow-hidden flex flex-col justify-between p-4">
          
          {/* Top Info overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-400 bg-slate-950/90 px-3 py-1 rounded border border-cyan-500/40 shadow">
              3D Neural Space (Rotate / Zoom / Hover & Click Node Labels)
            </span>
          </div>

          {/* Hovered Node Tooltip Overlay */}
          {activeHoverNode && (
            <div className="absolute top-4 right-4 z-10 bg-slate-950/95 border border-cyan-400 p-3 rounded-xl shadow-2xl max-w-xs animate-fade-in font-orbitron">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">{activeHoverNode.region}</span>
              <h4 className="text-sm font-bold text-white mb-0.5">{activeHoverNode.name}</h4>
              <div className="flex items-center gap-2 text-xs mt-1 font-rajdhani">
                <span className="text-slate-300">Level {activeHoverNode.level} Node</span>
                <span style={{ color: activeHoverNode.state.statusColor }} className="font-bold font-mono">
                  {activeHoverNode.state.retentionPercent}% Retention
                </span>
              </div>
            </div>
          )}

          {/* WebGL Canvas Target */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Hierarchy Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-orbitron bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/50" />
              <span className="text-slate-300">Level 1: Subject Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm shadow-purple-500/50" />
              <span className="text-slate-300">Level 2: Syllabus Topic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-400 shadow-sm shadow-pink-500/50" />
              <span className="text-slate-300">Level 3: Sub-Topic</span>
            </div>
          </div>
        </div>

        {/* Diagnostics & Node Inspector Sidebar */}
        <div className="space-y-4">
          
          {/* Selected Node Details Inspector */}
          {selectedNodeDetails ? (
            <div className="cyber-panel p-5 rounded-2xl border border-cyan-500/50 bg-slate-950/90 cyber-hud-brackets space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase">
                  Level {selectedNodeDetails.level} Topic Node Inspector
                </span>
                <button 
                  onClick={() => setSelectedNodeDetails(null)} 
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <h3 className="text-base font-orbitron font-bold text-white">{selectedNodeDetails.name}</h3>
              <div className="text-xs font-rajdhani text-slate-400 space-y-1">
                <div>Parent Subject: <span className="text-cyan-300 font-bold">{selectedNodeDetails.subject.name}</span></div>
                <div>Anatomical Region: <span className="text-purple-300 font-bold">{selectedNodeDetails.region}</span></div>
                <div>Retention Index: <span style={{ color: selectedNodeDetails.state.statusColor }} className="font-bold">{selectedNodeDetails.state.retentionPercent}%</span></div>
                <div>Memory Half-Life: <span className="text-emerald-300 font-bold">{selectedNodeDetails.state.halfLifeDays} Days</span></div>
              </div>
            </div>
          ) : (
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
          )}

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
