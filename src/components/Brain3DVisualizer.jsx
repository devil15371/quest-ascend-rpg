import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles, Eye, Info } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_REGIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

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
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2500);
    camera.position.set(0, 70, 420);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Smooth Orbit Controls (Obsidian Graph Controls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.maxDistance = 800;
    controls.minDistance = 150;

    // 3. Anatomical Brain Shell Mesh Wireframe
    const brainHullGroup = new THREE.Group();
    scene.add(brainHullGroup);

    const brainMeshGeo = new THREE.IcosahedronGeometry(150, 3);
    const brainMeshMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const brainMesh = new THREE.Mesh(brainMeshGeo, brainMeshMat);
    brainMesh.scale.set(0.9, 1.0, 1.25);
    brainHullGroup.add(brainMesh);

    // 4. Build Obsidian 3D Neural Nodes & 3D Bezier Axon Connections
    const allGraphNodes = [];
    const allBezierConnections = [];
    const actionPotentialPulses = [];

    subjects.forEach((subject, subjectIdx) => {
      const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4' };
      const region = BRAIN_REGIONS[subjectIdx % BRAIN_REGIONS.length];

      // Primary Hub Node (Major Subject Node)
      const hubPos = new THREE.Vector3(
        region.basePos.x + (Math.random() - 0.5) * 40,
        region.basePos.y + (Math.random() - 0.5) * 40,
        region.basePos.z + (Math.random() - 0.5) * 40
      );

      const hubRadius = Math.max(10, Math.min(22, 12 + (subject.completedLectures || 0) * 0.35));
      const hubGeo = new THREE.SphereGeometry(hubRadius, 24, 24);
      const hubMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.statusColor),
        transparent: true,
        opacity: 0.95
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(hubPos);
      hubMesh.userData = {
        name: subject.name,
        type: 'HUB',
        subject,
        state,
        region: region.name,
        radius: hubRadius,
        connections: []
      };
      brainHullGroup.add(hubMesh);
      allGraphNodes.push(hubMesh);

      // Glowing Halo Ring around Hub Node
      const haloGeo = new THREE.SphereGeometry(hubRadius * 1.4, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.statusColor),
        transparent: true,
        opacity: 0.25,
        wireframe: true
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      hubMesh.add(haloMesh);

      // Create Secondary Sub-Concept Nodes connected to Hub
      state.subNodes.forEach((sub, subIdx) => {
        const subPos = new THREE.Vector3(
          hubPos.x + (Math.random() - 0.5) * 75,
          hubPos.y + (Math.random() - 0.5) * 75,
          hubPos.z + (Math.random() - 0.5) * 75
        );

        const subRadius = Math.max(5, Math.min(12, sub.size));
        const subGeo = new THREE.SphereGeometry(subRadius, 16, 16);
        const subMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(state.statusColor),
          transparent: true,
          opacity: 0.85
        });
        const subMesh = new THREE.Mesh(subGeo, subMat);
        subMesh.position.copy(subPos);
        subMesh.userData = {
          name: sub.name,
          type: sub.type,
          subject,
          state,
          region: region.name,
          radius: subRadius,
          connections: []
        };
        brainHullGroup.add(subMesh);
        allGraphNodes.push(subMesh);

        // 3D Bezier Curve Pathway connecting Sub-Node to Primary Hub Node
        const controlPoint = new THREE.Vector3().addVectors(hubPos, subPos).multiplyScalar(0.5);
        controlPoint.y += (Math.random() - 0.5) * 30;

        const curve = new THREE.CubicBezierCurve3(hubPos, controlPoint, controlPoint, subPos);
        const points = curve.getPoints(24);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(state.statusColor),
          transparent: true,
          opacity: state.retentionPercent <= 35 ? 0.2 : 0.5
        });
        const bezierLine = new THREE.Line(curveGeo, lineMat);
        bezierLine.userData = { nodeA: hubMesh, nodeB: subMesh, defaultOpacity: lineMat.opacity };
        brainHullGroup.add(bezierLine);
        allBezierConnections.push(bezierLine);

        hubMesh.userData.connections.push(subMesh);
        subMesh.userData.connections.push(hubMesh);

        // Action Potential Pulse particle
        const pulseGeo = new THREE.SphereGeometry(2.5, 8, 8);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        brainHullGroup.add(pulseMesh);

        actionPotentialPulses.push({
          mesh: pulseMesh,
          curve,
          progress: Math.random()
        });
      });
    });

    // Inter-Subject Synaptic Connections (Hebbian Associative Pathways)
    for (let i = 0; i < allGraphNodes.length; i++) {
      for (let j = i + 1; j < allGraphNodes.length; j++) {
        const nodeA = allGraphNodes[i];
        const nodeB = allGraphNodes[j];

        if (nodeA.userData.type === 'HUB' && nodeB.userData.type === 'HUB') {
          const dist = nodeA.position.distanceTo(nodeB.position);
          if (dist < 260) {
            const controlPoint = new THREE.Vector3().addVectors(nodeA.position, nodeB.position).multiplyScalar(0.5);
            controlPoint.x += (Math.random() - 0.5) * 40;

            const curve = new THREE.CubicBezierCurve3(nodeA.position, controlPoint, controlPoint, nodeB.position);
            const points = curve.getPoints(30);
            const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

            const avgRetention = (nodeA.userData.state.retentionPercent + nodeB.userData.state.retentionPercent) / 2;
            const lineColor = avgRetention <= 35 ? 0xef4444 : 0x06b6d4;

            const lineMat = new THREE.LineBasicMaterial({
              color: lineColor,
              transparent: true,
              opacity: avgRetention <= 35 ? 0.15 : 0.4
            });
            const bezierLine = new THREE.Line(curveGeo, lineMat);
            bezierLine.userData = { nodeA, nodeB, defaultOpacity: lineMat.opacity };
            brainHullGroup.add(bezierLine);
            allBezierConnections.push(bezierLine);

            nodeA.userData.connections.push(nodeB);
            nodeB.userData.connections.push(nodeA);
          }
        }
      }
    }

    // 5. Obsidian Graph Raycaster Hover Focus Interaction
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

          // Obsidian Graph Focus Effect: Highlight connected nodes & lines, dim unrelated
          const connectedSet = new Set(hoveredMesh.userData.connections);
          connectedSet.add(hoveredMesh);

          allGraphNodes.forEach(node => {
            if (connectedSet.has(node)) {
              node.material.opacity = 1.0;
              node.scale.set(1.25, 1.25, 1.25);
            } else {
              node.material.opacity = 0.15;
              node.scale.set(0.85, 0.85, 0.85);
            }
          });

          allBezierConnections.forEach(line => {
            if (connectedSet.has(line.userData.nodeA) && connectedSet.has(line.userData.nodeB)) {
              line.material.opacity = 0.9;
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

      // Slow organic rotation
      brainHullGroup.rotation.y += 0.0015;

      // Animate Action Potential electrical pulses along 3D Bezier curves
      actionPotentialPulses.forEach(pulse => {
        pulse.progress += 0.006;
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
              OBSIDIAN 3D NEURAL KNOWLEDGE GRAPH
            </h2>
            <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              BEZIER AXON MATRIX
            </span>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Interactive 3D Knowledge Graph: Hover nodes to highlight connected dendrites & memory stability pathways.
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

      {/* Main 3D Obsidian Graph Canvas & Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D WebGL Obsidian Graph Viewport */}
        <div className="lg:col-span-2 cyber-panel rounded-2xl border border-cyan-500/40 bg-slate-950/90 cyber-hud-brackets relative h-[440px] sm:h-[520px] overflow-hidden flex flex-col justify-between p-4">
          
          {/* Top Info overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-400 bg-slate-950/90 px-3 py-1 rounded border border-cyan-500/40 shadow">
              Obsidian 3D Physics Graph (Rotate / Zoom / Click Nodes)
            </span>
          </div>

          {/* Hovered Node Tooltip Overlay */}
          {activeHoverNode && (
            <div className="absolute top-4 right-4 z-10 bg-slate-950/95 border border-cyan-400 p-3 rounded-xl shadow-2xl max-w-xs animate-fade-in font-orbitron">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">{activeHoverNode.region}</span>
              <h4 className="text-sm font-bold text-white mb-0.5">{activeHoverNode.name}</h4>
              <div className="flex items-center gap-2 text-xs mt-1 font-rajdhani">
                <span className="text-slate-300">Retention:</span>
                <span style={{ color: activeHoverNode.state.statusColor }} className="font-bold font-mono">
                  {activeHoverNode.state.retentionPercent}%
                </span>
                <span className="text-slate-400">• Half-Life: {activeHoverNode.state.halfLifeDays}d</span>
              </div>
            </div>
          )}

          {/* WebGL Canvas Target */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Graph Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-orbitron bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
              <span className="text-slate-300">Myelinated (&gt;75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
              <span className="text-slate-300">Consolidating (50-75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-slate-300">Pruning Risk (&le;50%)</span>
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
                  Node Diagnostics Inspector
                </span>
                <button 
                  onClick={() => setSelectedNodeDetails(null)} 
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <h3 className="text-lg font-orbitron font-bold text-white">{selectedNodeDetails.name}</h3>
              <div className="text-xs font-rajdhani text-slate-400 space-y-1">
                <div>Region: <span className="text-cyan-300 font-bold">{selectedNodeDetails.region}</span></div>
                <div>Memory Retention: <span style={{ color: selectedNodeDetails.state.statusColor }} className="font-bold">{selectedNodeDetails.state.retentionPercent}%</span></div>
                <div>Ebbinghaus Half-Life: <span className="text-purple-300 font-bold">{selectedNodeDetails.state.halfLifeDays} Days</span></div>
                <div>Synapses Built: <span className="text-emerald-300 font-bold">{selectedNodeDetails.state.synapsesCount}</span></div>
              </div>
            </div>
          ) : (
            <div className="cyber-panel p-5 rounded-2xl border border-purple-500/40 bg-slate-950/80 cyber-hud-brackets space-y-3">
              <h3 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> Neuro-Diagnostics
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-orbitron">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">TOTAL SYNAPSES</span>
                  <span className="text-base font-black text-cyan-300">{brainMetrics.totalSynapses}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">STABILITY HALF-LIFE</span>
                  <span className="text-base font-black text-purple-300">{brainMetrics.averageHalfLife} Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Pruning Warnings */}
          {brainMetrics.pruningRiskCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs font-rajdhani space-y-2">
              <div className="flex items-center gap-2 font-orbitron font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                SYNAPTIC PRUNING ALERT ({brainMetrics.pruningRiskCount})
              </div>
              <p className="text-rose-200/80 leading-relaxed">
                Memory retention in neglected subjects has dropped below 35%. Complete a revision or practice session today to prevent axon line breakdown!
              </p>
            </div>
          )}

          {/* Subject Synaptic Health List */}
          <div className="cyber-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/80 max-h-64 overflow-y-auto space-y-2.5">
            <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase">Subject Synapse Matrix</h4>
            {brainMetrics.subjectStates.map(state => (
              <div 
                key={state.subjectId}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs font-rajdhani hover:border-cyan-500/40 transition cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white block font-orbitron text-xs">{state.subjectName}</span>
                  <span className="text-[11px] text-slate-400">Last Active: {state.elapsedDays}d ago</span>
                </div>
                <div className="text-right font-orbitron font-bold">
                  <span style={{ color: state.statusColor }}>{state.retentionPercent}%</span>
                  <span className="text-[10px] text-slate-500 block">Half-Life: {state.halfLifeDays}d</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
