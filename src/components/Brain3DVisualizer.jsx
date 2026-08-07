import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, AlertTriangle, Brain, Cpu, Flame, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { calculateGlobalBrainMetrics, BRAIN_LOBE_POSITIONS } from '../utils/neuroEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function Brain3DVisualizer({ userData }) {
  const mountRef = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const activeCampaign = userData.campaigns.find(c => c.id === userData.activeCampaignId) || userData.campaigns[0];
  const subjects = activeCampaign?.subjects || [];
  const brainMetrics = calculateGlobalBrainMetrics(subjects, userData.activityLogs);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mountRef.current.clientWidth / mountRef.current.clientHeight, 1, 2000);
    camera.position.set(0, 50, 380);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. 3D Anatomical Wireframe Brain Shell
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Outer Hemisphere Wireframes
    const hemisphereGeo = new THREE.IcosahedronGeometry(130, 3);
    const hemisphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const leftBrainMesh = new THREE.Mesh(hemisphereGeo, hemisphereMat);
    leftBrainMesh.scale.set(0.85, 1, 1.2);
    brainGroup.add(leftBrainMesh);

    // 3. Create Neural Cluster Nodes & Axon Connections
    const lobesList = Object.values(BRAIN_LOBE_POSITIONS);
    const nodeMeshes = [];
    const connectionLines = [];
    const actionPulses = [];

    subjects.forEach((subject, idx) => {
      const state = brainMetrics.subjectStates.find(s => s.subjectId === subject.id) || { retentionPercent: 80, statusColor: '#06b6d4' };
      const lobePos = lobesList[idx % lobesList.length];

      // Node Mesh Geometry
      const nodeGeo = new THREE.SphereGeometry(12, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.statusColor),
        transparent: true,
        opacity: 0.9
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(lobePos.x + (Math.random() - 0.5) * 40, lobePos.y + (Math.random() - 0.5) * 40, lobePos.z + (Math.random() - 0.5) * 40);
      nodeMesh.userData = { subject, state };
      brainGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);

      // Glowing Node Pulse Halo
      const haloGeo = new THREE.SphereGeometry(18, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.statusColor),
        transparent: true,
        opacity: 0.25,
        wireframe: true
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeMesh.add(haloMesh);
    });

    // Create Inter-Subject Axon Connection Pathways
    for (let i = 0; i < nodeMeshes.length; i++) {
      for (let j = i + 1; j < nodeMeshes.length; j++) {
        const nodeA = nodeMeshes[i];
        const nodeB = nodeMeshes[j];
        const distance = nodeA.position.distanceTo(nodeB.position);

        if (distance < 280) {
          const points = [nodeA.position, nodeB.position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          
          // Line color based on average retention
          const avgRetention = (nodeA.userData.state.retentionPercent + nodeB.userData.state.retentionPercent) / 2;
          const lineColor = avgRetention <= 40 ? 0xef4444 : avgRetention <= 70 ? 0xeab308 : 0x06b6d4;

          const lineMat = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: avgRetention <= 40 ? 0.2 : 0.45
          });
          const line = new THREE.Line(lineGeo, lineMat);
          brainGroup.add(line);

          // Action Potential Glowing Electrical Pulse Particle
          const pulseGeo = new THREE.SphereGeometry(3, 8, 8);
          const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
          brainGroup.add(pulseMesh);

          actionPulses.push({
            mesh: pulseMesh,
            startPos: nodeA.position,
            endPos: nodeB.position,
            progress: Math.random()
          });
        }
      }
    }

    // 4. Mouse Rotation Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      brainGroup.rotation.y += deltaX * 0.008;
      brainGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => { isDragging = false; };

    const domElement = mountRef.current;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 5. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        brainGroup.rotation.y += 0.003;
      }

      // Animate Action Potential electrical pulses along axons
      actionPulses.forEach(pulse => {
        pulse.progress += 0.008;
        if (pulse.progress > 1) pulse.progress = 0;
        pulse.mesh.position.lerpVectors(pulse.startPos, pulse.endPos, pulse.progress);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (mountRef.current) mountRef.current.innerHTML = '';
      hemisphereGeo.dispose();
      hemisphereMat.dispose();
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
              NEURAL SYNAPTIC BRAIN MATRIX
            </h2>
            <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              EBBINGHAUS & LTP MODEL
            </span>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Real-time neuroscience visualizer tracking memory stability, Long-Term Potentiation (LTP), and Synaptic Pruning decay.
          </p>
        </div>

        {/* Global Retention Index */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-orbitron font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{brainMetrics.averageRetention}% RETENTION</span>
          </div>
        </div>
      </div>

      {/* Main 3D Brain Canvas + Diagnostics Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Interactive WebGL Brain Viewport */}
        <div className="lg:col-span-2 cyber-panel rounded-2xl border border-cyan-500/40 bg-slate-950/90 cyber-hud-brackets relative h-[420px] sm:h-[480px] overflow-hidden flex flex-col justify-between p-4">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-400 bg-slate-950/80 px-3 py-1 rounded border border-cyan-500/40">
              3D WebGL Synaptic Hemisphere (Drag to Rotate)
            </span>
          </div>

          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-orbitron bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
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

        {/* Neuroscience Diagnostics Sidebar */}
        <div className="space-y-4">
          
          {/* Key Metrics */}
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
                <span className="text-slate-400 block text-[10px]">MEMORY HALF-LIFE</span>
                <span className="text-base font-black text-purple-300">{brainMetrics.averageHalfLife} Days</span>
              </div>
            </div>
          </div>

          {/* Pruning Warnings (Forgetting Curve Alerts) */}
          {brainMetrics.pruningRiskCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs font-rajdhani space-y-2">
              <div className="flex items-center gap-2 font-orbitron font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                SYNAPTIC PRUNING WARNING ({brainMetrics.pruningRiskCount})
              </div>
              <p className="text-rose-200/80 leading-relaxed">
                The following subject(s) are decaying due to elapsed time. Complete a revision round today to prevent axon line breakdown!
              </p>
            </div>
          )}

          {/* Subject Synaptic Health List */}
          <div className="cyber-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/80 max-h-64 overflow-y-auto space-y-2.5">
            <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase">Subject Synapse Matrix</h4>
            {brainMetrics.subjectStates.map(state => (
              <div 
                key={state.subjectId}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs font-rajdhani"
              >
                <div>
                  <span className="font-bold text-white block font-orbitron text-xs">{state.subjectName}</span>
                  <span className="text-[11px] text-slate-400">Last Active: {state.elapsedDays}d ago</span>
                </div>
                <div className="text-right font-orbitron font-bold">
                  <span style={{ color: state.statusColor }}>{state.retentionPercent}%</span>
                  <span className="text-[10px] text-slate-500 block">S: {state.stabilityDays}d</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
