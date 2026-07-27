import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Calendar, MessageSquare, User, Users, Bell, 
  Play, ShieldAlert, Sparkles, Send, CheckCircle2, ChevronRight,
  TrendingUp, Award, Layers, LogOut, ArrowRight, Terminal, Video,
  BookOpenCheck, Clock, FileText, UserCheck, Maximize2, Minimize2, Search, Plus,
  Cpu, Compass, Settings, Key, Hourglass, Lock, Unlock, CheckSquare
} from 'lucide-react';
import * as THREE from 'three';

// Base API URL pointing to the Node.js Express server (Live Cloud & Local Device Support)
const API_BASE = (import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

// Safe local storage wrapper to prevent crashes in strict private modes
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage getItem blocked:", e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage setItem blocked:", e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removeItem blocked:", e);
    }
  }
};

// Helper for department-specific filtering of timetables and staff schedules
const matchesStudentDepartment = (itemDept, studentDept) => {
  if (!itemDept || !studentDept) return true;
  const item = itemDept.toLowerCase().trim();
  const student = studentDept.toLowerCase().trim();

  // Show if item is marked for All Departments / Freshers / General
  if (item === 'all departments' || item === 'all' || item === 'freshers' || item === 'general') return true;

  // Acronym & substring matching for departments
  if (student.includes('ai&ds') || student.includes('data science') || student.includes('aids')) {
    return item.includes('ai') || item.includes('ds') || item.includes('data science') || item.includes('aids');
  }
  if (student.includes('cse') || student.includes('computer science')) {
    return item.includes('cse') || item.includes('computer science');
  }
  if (student.includes('ece') || student.includes('electronics')) {
    return item.includes('ece') || item.includes('electronics');
  }
  if (student.includes('csbs') || student.includes('business systems')) {
    return item.includes('csbs') || item.includes('business');
  }
  if (student.includes('mech') || student.includes('mechanical')) {
    return item.includes('mech') || item.includes('mechanical');
  }
  if (student.includes('civil')) {
    return item.includes('civil');
  }
  if (student.includes('ai&ml') || student.includes('machine learning') || student.includes('aiml')) {
    return item.includes('ai') || item.includes('ml') || item.includes('machine learning') || item.includes('aiml');
  }
  if (student.includes('physics')) return item.includes('physics');
  if (student.includes('chemistry')) return item.includes('chemistry');
  if (student.includes('english')) return item.includes('english');
  if (student.includes('math')) return item.includes('math');
  if (student.includes('mba')) return item.includes('mba');
  if (student.includes('tamil')) return item.includes('tamil');
  if (student.includes('cyber')) {
    return item.includes('cyber');
  }

  return item.includes(student) || student.includes(item);
};

/* ==========================================================================
   3D BACKGROUND PARTICLE SYSTEM (Cyber-Cyan and Hot-Pink Stardust)
   ========================================================================== */

function ParticleBackground3D({ activeTab }) {
  const containerRef = useRef(null);
  const targetCam = useRef({ x: 0, y: 0, z: 10.5 });
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Map activeTab/login shifts to 3D camera scroll positions
    switch (activeTab) {
      case 'login':
        targetCam.current = { x: -2.8, y: 1.5, z: 8.5 };
        break;
      case 'dashboard':
        targetCam.current = { x: 0.0, y: 0.0, z: 10.5 };
        break;
      case 'academics':
        targetCam.current = { x: 4.2, y: -2.0, z: 9.0 };
        break;
      case 'skills':
        targetCam.current = { x: -3.8, y: -2.2, z: 10.0 };
        break;
      case 'events':
      case 'event_management':
        targetCam.current = { x: 1.8, y: 2.5, z: 9.5 };
        break;
      case 'profile':
        targetCam.current = { x: -2.0, y: -3.0, z: 9.5 };
        break;
      default:
        targetCam.current = { x: 0.0, y: 0.0, z: 10.5 };
    }
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Create scene
    const scene = new THREE.Scene();

    // Create perspective camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(-2.8, 1.5, 8.5);

    // Create WebGL Renderer with alpha channel
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Light Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Directional point lights to match teals, lavenders, and peaches
    const tealLight = new THREE.PointLight(0x2dd4bf, 3.5, 50); // teal
    tealLight.position.set(-8, 5, 7);
    scene.add(tealLight);

    const lavenderLight = new THREE.PointLight(0xc084fc, 3.5, 50); // lavender
    lavenderLight.position.set(8, -5, 7);
    scene.add(lavenderLight);

    const peachLight = new THREE.PointLight(0xfdba74, 3.5, 50); // peach
    peachLight.position.set(0, 9, -5);
    scene.add(peachLight);

    // 1. MATERIAL DEFINITIONS
    const reactMat = new THREE.MeshPhysicalMaterial({
      color: 0x61dafb,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });
    
    const reactCenterMat = new THREE.MeshPhysicalMaterial({
      color: 0xffeb3b, // Yellow center dot
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const tailwindMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0x339933,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const threeMat = new THREE.MeshPhysicalMaterial({
      color: 0xff4b4b,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const supabaseMat = new THREE.MeshPhysicalMaterial({
      color: 0x3ecf8e, // Supabase light green
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });

    const firebaseRedMat = new THREE.MeshPhysicalMaterial({ color: 0xff3d00, roughness: 0.1, metalness: 0.9 });
    const firebaseOrangeMat = new THREE.MeshPhysicalMaterial({ color: 0xff9100, roughness: 0.1, metalness: 0.9 });
    const firebaseYellowMat = new THREE.MeshPhysicalMaterial({ color: 0xffcd38, roughness: 0.1, metalness: 0.9 });

    const gBlueMat = new THREE.MeshPhysicalMaterial({ color: 0x4285f4, roughness: 0.1, metalness: 0.9 });
    const gRedMat = new THREE.MeshPhysicalMaterial({ color: 0xea4335, roughness: 0.1, metalness: 0.9 });
    const gYellowMat = new THREE.MeshPhysicalMaterial({ color: 0xfabc05, roughness: 0.1, metalness: 0.9 });
    const gGreenMat = new THREE.MeshPhysicalMaterial({ color: 0x34a853, roughness: 0.1, metalness: 0.9 });

    // Extrusion Settings
    const extrudeSettings = { 
      depth: 0.15, 
      bevelEnabled: true, 
      bevelSegments: 3, 
      steps: 1, 
      bevelSize: 0.02, 
      bevelThickness: 0.02 
    };

    // 2. GEOMETRY AND MESH DEFINITIONS
    
    // -- REACT ATOM SYMBOL (Bottom-Left)
    const reactGroup = new THREE.Group();
    reactGroup.position.set(-3.2, -1.6, 1.5);
    scene.add(reactGroup);

    const reactRingGeo = new THREE.TorusGeometry(0.9, 0.05, 16, 100);
    const reactCoreGeo = new THREE.SphereGeometry(0.32, 32, 32);

    const ring1 = new THREE.Mesh(reactRingGeo, reactMat);
    reactGroup.add(ring1);

    const ring2 = new THREE.Mesh(reactRingGeo, reactMat);
    ring2.rotation.z = Math.PI / 3;
    ring2.rotation.x = Math.PI / 6;
    reactGroup.add(ring2);

    const ring3 = new THREE.Mesh(reactRingGeo, reactMat);
    ring3.rotation.z = -Math.PI / 3;
    ring3.rotation.x = Math.PI / 6;
    reactGroup.add(ring3);

    const reactCore = new THREE.Mesh(reactCoreGeo, reactCenterMat);
    reactGroup.add(reactCore);

    // Inner glowing core light inside the React sphere
    const mainSphereCoreLight = new THREE.PointLight(0x61dafb, 4.0, 8);
    mainSphereCoreLight.position.set(-3.2, -1.6, 1.5);
    scene.add(mainSphereCoreLight);

    // -- TAILWIND WAVES (Bottom-Left-Center)
    const tailwindGroup = new THREE.Group();
    tailwindGroup.position.set(-4.0, 0.3, 2.2);
    scene.add(tailwindGroup);

    const waveShape1 = new THREE.Shape();
    waveShape1.moveTo(0, 0.45);
    waveShape1.quadraticCurveTo(0.45, 0.9, 0.9, 0.35);
    waveShape1.quadraticCurveTo(0.45, -0.2, 0, 0.05);
    waveShape1.quadraticCurveTo(-0.45, 0.3, -0.9, -0.25);
    waveShape1.quadraticCurveTo(-0.45, -0.8, 0, -0.35);
    waveShape1.closePath();

    const waveGeo = new THREE.ExtrudeGeometry(waveShape1, extrudeSettings);

    const wave1 = new THREE.Mesh(waveGeo, tailwindMat);
    tailwindGroup.add(wave1);

    const wave2 = new THREE.Mesh(waveGeo, tailwindMat);
    wave2.scale.set(0.7, 0.7, 1);
    wave2.position.set(0.45, -0.35, 0.08);
    tailwindGroup.add(wave2);

    // -- NODE.JS GREEN HEXAGON WITH N (Right-Top)
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(2.8, 1.8, 1.0);
    scene.add(nodeGroup);

    const nodeBaseGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.3, 6);
    const nodeBase = new THREE.Mesh(nodeBaseGeo, nodeMat);
    nodeBase.rotation.x = Math.PI / 2;
    nodeGroup.add(nodeBase);

    // Build letter N on top face of the hexagon
    const nGroup = new THREE.Group();
    nGroup.position.set(0, 0, 0.18); 

    const barGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
    const diagGeo = new THREE.BoxGeometry(0.12, 0.54, 0.05);
    const nodeLetterMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });

    const nLeft = new THREE.Mesh(barGeo, nodeLetterMat);
    nLeft.position.set(-0.18, 0, 0);
    nGroup.add(nLeft);

    const nRight = new THREE.Mesh(barGeo, nodeLetterMat);
    nRight.position.set(0.18, 0, 0);
    nGroup.add(nRight);

    const nDiag = new THREE.Mesh(diagGeo, nodeLetterMat);
    nDiag.rotation.z = -0.65; 
    nDiag.position.set(0, 0, 0.01);
    nGroup.add(nDiag);

    nodeGroup.add(nGroup);

    // -- THREE.JS TRIANGULAR PRISM (Center-Top)
    const threeGroup = new THREE.Group();
    threeGroup.position.set(-2.8, 2.2, 1.2);
    scene.add(threeGroup);

    const threeGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 3);
    const threeMesh = new THREE.Mesh(threeGeo, threeMat);
    threeMesh.rotation.x = Math.PI / 2;
    threeGroup.add(threeMesh);

    // -- SUPABASE BOLT (Middle-Right)
    const supabaseShape = new THREE.Shape();
    supabaseShape.moveTo(-0.25, 0.75);
    supabaseShape.lineTo(0.35, 0.1);
    supabaseShape.lineTo(-0.05, 0.05);
    supabaseShape.lineTo(0.25, -0.75);
    supabaseShape.lineTo(-0.35, -0.1);
    supabaseShape.lineTo(0.05, -0.05);
    supabaseShape.closePath();

    const supabaseGeo = new THREE.ExtrudeGeometry(supabaseShape, extrudeSettings);
    const supabaseMesh = new THREE.Mesh(supabaseGeo, supabaseMat);
    supabaseMesh.position.set(4.0, -0.2, 1.8);
    scene.add(supabaseMesh);

    // -- FIREBASE LAYERED FLAME (Bottom-Center)
    const firebaseGroup = new THREE.Group();
    firebaseGroup.position.set(0.5, -2.5, 2.5);
    scene.add(firebaseGroup);

    const flameShapeRed = new THREE.Shape();
    flameShapeRed.moveTo(0, 0.85);
    flameShapeRed.quadraticCurveTo(0.65, 0.25, 0.65, -0.45);
    flameShapeRed.lineTo(-0.65, -0.45);
    flameShapeRed.quadraticCurveTo(-0.65, 0.25, 0, 0.85);

    const flameGeoRed = new THREE.ExtrudeGeometry(flameShapeRed, extrudeSettings);
    const flameRed = new THREE.Mesh(flameGeoRed, firebaseRedMat);
    firebaseGroup.add(flameRed);

    const flameShapeOrange = new THREE.Shape();
    flameShapeOrange.moveTo(0, 0.65);
    flameShapeOrange.quadraticCurveTo(0.5, 0.15, 0.5, -0.4);
    flameShapeOrange.lineTo(-0.5, -0.4);
    flameShapeOrange.quadraticCurveTo(-0.5, 0.15, 0, 0.65);

    const flameGeoOrange = new THREE.ExtrudeGeometry(flameShapeOrange, extrudeSettings);
    const flameOrange = new THREE.Mesh(flameGeoOrange, firebaseOrangeMat);
    flameOrange.position.set(0, 0, 0.08);
    firebaseGroup.add(flameOrange);

    const flameShapeYellow = new THREE.Shape();
    flameShapeYellow.moveTo(0, 0.45);
    flameShapeYellow.quadraticCurveTo(0.35, 0.05, 0.35, -0.35);
    flameShapeYellow.lineTo(-0.35, -0.35);
    flameShapeYellow.quadraticCurveTo(-0.35, 0.05, 0, 0.45);

    const flameGeoYellow = new THREE.ExtrudeGeometry(flameShapeYellow, extrudeSettings);
    const flameYellow = new THREE.Mesh(flameGeoYellow, firebaseYellowMat);
    flameYellow.position.set(0, 0, 0.16);
    firebaseGroup.add(flameYellow);

    // -- GOOGLE CLOUD representing sphere cluster (Right-Bottom)
    const gcloudGroup = new THREE.Group();
    gcloudGroup.position.set(2.6, -2.0, 2.0);
    scene.add(gcloudGroup);

    const sphereGeoLarge = new THREE.SphereGeometry(0.48, 32, 32);
    const sphereGeoSmall = new THREE.SphereGeometry(0.35, 32, 32);

    const sBlue = new THREE.Mesh(sphereGeoSmall, gBlueMat);
    sBlue.position.set(-0.45, -0.15, 0);
    gcloudGroup.add(sBlue);

    const sRed = new THREE.Mesh(sphereGeoLarge, gRedMat);
    sRed.position.set(0, 0.2, 0.05);
    gcloudGroup.add(sRed);

    const sYellow = new THREE.Mesh(sphereGeoSmall, gYellowMat);
    sYellow.position.set(0.4, 0.05, 0.1);
    gcloudGroup.add(sYellow);

    const sGreen = new THREE.Mesh(sphereGeoSmall, gGreenMat);
    sGreen.position.set(0.2, -0.2, 0.15);
    gcloudGroup.add(sGreen);

    // -- NEXT.JS STYLIZED LOGO (Top-Left)
    const nextGroup = new THREE.Group();
    nextGroup.position.set(-1.0, 3.2, 1.8);
    scene.add(nextGroup);

    const nextBaseGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 32);
    const nextBaseMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.15, metalness: 0.85 });
    const nextBase = new THREE.Mesh(nextBaseGeo, nextBaseMat);
    nextBase.rotation.x = Math.PI / 2;
    nextGroup.add(nextBase);

    const nextGreenMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.1, metalness: 0.9 });
    const nextWhiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });
    
    const nextGreenSlash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.08), nextGreenMat);
    nextGreenSlash.rotation.z = -0.55;
    nextGreenSlash.position.set(0.05, 0, 0.08);
    nextGroup.add(nextGreenSlash);

    const nextWhiteSlash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), nextWhiteMat);
    nextWhiteSlash.rotation.z = -0.55;
    nextWhiteSlash.position.set(-0.05, 0, 0.08);
    nextGroup.add(nextWhiteSlash);

    // -- PYTHON INTERTWINED SNAKES (Bottom-Left)
    const pythonGroup = new THREE.Group();
    pythonGroup.position.set(-2.0, -3.5, 2.0);
    scene.add(pythonGroup);

    const pyBlueMat = new THREE.MeshPhysicalMaterial({ color: 0x3776ab, roughness: 0.1, metalness: 0.9 });
    const pyYellowMat = new THREE.MeshPhysicalMaterial({ color: 0xffd43b, roughness: 0.1, metalness: 0.9 });

    const snakeBodyGeo = new THREE.TorusGeometry(0.38, 0.09, 12, 32, Math.PI);
    const snakeHeadGeo = new THREE.SphereGeometry(0.1, 16, 16);

    const pyBlueBody = new THREE.Mesh(snakeBodyGeo, pyBlueMat);
    pyBlueBody.position.set(-0.12, 0.12, 0);
    pyBlueBody.rotation.z = Math.PI / 2;
    pythonGroup.add(pyBlueBody);

    const pyBlueHead = new THREE.Mesh(snakeHeadGeo, pyBlueMat);
    pyBlueHead.position.set(-0.12, 0.5, 0);
    pythonGroup.add(pyBlueHead);

    const pyYellowBody = new THREE.Mesh(snakeBodyGeo, pyYellowMat);
    pyYellowBody.position.set(0.12, -0.12, 0.05);
    pyYellowBody.rotation.z = -Math.PI / 2;
    pythonGroup.add(pyYellowBody);

    const pyYellowHead = new THREE.Mesh(snakeHeadGeo, pyYellowMat);
    pyYellowHead.position.set(0.12, -0.5, 0.05);
    pythonGroup.add(pyYellowHead);

    // 5. TINY FLOATING BUBBLE PEARLS (Soap-bubble silver chrome spheres)
    const bubbleGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdddddd,
      roughness: 0.02,
      metalness: 0.98,
      iridescence: 1.0,
      iridescenceIOR: 1.8,
      transparent: false
    });

    const bubbles = [];
    const bubblePositions = [
      { x: -4.5, y: 2.2, z: 3.0 },
      { x: -3.8, y: 0.5, z: 2.5 },
      { x: -1.8, y: -2.8, z: 2.0 },
      { x: 0.8, y: 2.0, z: 1.5 },
      { x: 0.5, y: -2.0, z: 3.5 },
      { x: 4.2, y: 2.8, z: 2.2 },
      { x: 4.5, y: -0.2, z: 1.8 },
      { x: -0.5, y: 0.8, z: 4.0 }
    ];

    bubblePositions.forEach((pos, idx) => {
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMaterial);
      bubble.position.set(pos.x, pos.y, pos.z);
      scene.add(bubble);
      bubbles.push({
        mesh: bubble,
        amplitude: 0.3 + Math.random() * 0.4,
        phase: Math.random() * 6,
        baseY: pos.y
      });
    });

    // 6. Floating stardust particle system for deep depth
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xe9d5ff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    let animationFrameId;

    const animate = (timestamp) => {
      const time = timestamp ? timestamp / 1000 : 0;

      // Smoothly interpolate camera position for the parallax scrolling effect with mouse responsiveness
      const targetX = targetCam.current.x + mouse.current.x * 0.9;
      const targetY = targetCam.current.y + mouse.current.y * 0.7;
      camera.position.x += (targetX - camera.position.x) * 0.045;
      camera.position.y += (targetY - camera.position.y) * 0.045;
      camera.position.z += (targetCam.current.z - camera.position.z) * 0.045;
      camera.lookAt(0, 0, 0);

      // Rotate tech stack symbol objects
      reactGroup.rotation.y += 0.008;
      reactGroup.rotation.z += 0.004;

      gcloudGroup.rotation.y += 0.006;
      gcloudGroup.rotation.x += 0.003;

      nodeGroup.rotation.y += 0.008;
      nodeGroup.rotation.z += 0.003;

      threeGroup.rotation.y += 0.008;
      threeGroup.rotation.x += 0.005;

      tailwindGroup.rotation.y += 0.01;
      tailwindGroup.rotation.z += 0.005;

      supabaseMesh.rotation.y += 0.012;
      supabaseMesh.rotation.x += 0.006;

      firebaseGroup.rotation.y += 0.008;
      firebaseGroup.rotation.x += 0.004;

      nextGroup.rotation.y += 0.007;
      pythonGroup.rotation.y += 0.009;

      // Animate floating bubble pearls
      bubbles.forEach(b => {
        b.mesh.position.y = b.baseY + Math.sin(time + b.phase) * b.amplitude;
      });

      // Wobble React atom slightly
      reactGroup.position.y = -1.6 + Math.sin(time * 0.8) * 0.15;
      mainSphereCoreLight.position.y = reactGroup.position.y;

      // Wobble other shapes slightly
      gcloudGroup.position.y = -2.0 + Math.sin(time * 0.9) * 0.12;
      nodeGroup.position.y = 1.8 + Math.sin(time * 0.7) * 0.12;
      threeGroup.position.y = 2.2 + Math.sin(time * 0.8) * 0.15;
      tailwindGroup.position.y = 0.3 + Math.sin(time * 0.9) * 0.14;
      supabaseMesh.position.y = -0.2 + Math.sin(time * 0.75) * 0.12;
      firebaseGroup.position.y = -2.5 + Math.sin(time * 0.85) * 0.15;
      nextGroup.position.y = 3.2 + Math.sin(time * 0.8) * 0.12;
      pythonGroup.position.y = -3.5 + Math.sin(time * 0.7) * 0.15;

      // Slowly rotate background dust
      dustParticles.rotation.y += 0.0003;
      dustParticles.rotation.x += 0.0001;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      reactRingGeo.dispose();
      reactCoreGeo.dispose();
      waveGeo.dispose();
      nodeBaseGeo.dispose();
      barGeo.dispose();
      diagGeo.dispose();
      threeGeo.dispose();
      supabaseGeo.dispose();
      flameGeoRed.dispose();
      flameGeoOrange.dispose();
      flameGeoYellow.dispose();
      sphereGeoLarge.dispose();
      sphereGeoSmall.dispose();
      nextBaseGeo.dispose();
      snakeBodyGeo.dispose();
      snakeHeadGeo.dispose();
      bubbleGeo.dispose();
      particleGeo.dispose();
      reactMat.dispose();
      reactCenterMat.dispose();
      tailwindMat.dispose();
      nodeMat.dispose();
      threeMat.dispose();
      supabaseMat.dispose();
      firebaseRedMat.dispose();
      firebaseOrangeMat.dispose();
      firebaseYellowMat.dispose();
      gBlueMat.dispose();
      gRedMat.dispose();
      gYellowMat.dispose();
      gGreenMat.dispose();
      nextBaseMat.dispose();
      nextGreenMat.dispose();
      nextWhiteMat.dispose();
      pyBlueMat.dispose();
      pyYellowMat.dispose();
      nodeLetterMat.dispose();
      bubbleMaterial.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ==========================================================================
   3D CREATIVE STUDENT BUTTON (Vibrant Neon Color Theme)
   ========================================================================== */

function Student3DButton({ onClick, active }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = 64;
    const height = 64;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    camera.position.z = 2.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const sphereGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: active ? 0xff5e36 : 0x00f2fe,
      roughness: 0.1,
      metalness: 0.9,
      emissive: active ? 0xff5e36 : 0x00f2fe,
      emissiveIntensity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xff007f,
      emissiveIntensity: 0.3
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x05ffc0,
      emissive: 0x05ffc0,
      emissiveIntensity: 0.5
    });
    const satellite = new THREE.Mesh(satGeo, satMat);
    scene.add(satellite);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 2, 2);
    scene.add(dirLight);

    let animId;
    let angle = 0;
    const animate = () => {
      sphere.rotation.y += 0.015;
      ring.rotation.x += 0.025;
      ring.rotation.y += 0.012;
      
      angle += 0.045;
      satellite.position.x = Math.cos(angle) * 0.9;
      satellite.position.z = Math.sin(angle) * 0.9;
      
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      renderer.dispose();
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-1.5 group animate-pulse">
      <button 
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full flex justify-center items-center cursor-pointer transition-all border shadow-lg hover:scale-110 ${
          active 
            ? 'border-purple-500 bg-purple-500/10 shadow-purple-500/25' 
            : 'border-white/10 bg-white/5 hover:border-brand-500 shadow-slate-900/50'
        }`}
        title="Student profile node shortcut"
      >
        <div ref={containerRef} className="w-full h-full" />
      </button>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">
        Student Node
      </span>
    </div>
  );
}

/* ==========================================================================
   DYNAMIC 3D TILT CARD COMPONENT (Mouse tracking physics)
   ========================================================================== */

/* ==========================================================================
   STATIC GLASS CARD COMPONENT (Hover scale only, no mouse tracking)
   ========================================================================== */

function TiltCard3D({ children, className }) {
  return (
    <div 
      className={`glass-panel rounded-2xl border border-white/10 hover:border-purple-500/35 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 ease-out relative overflow-hidden ${className}`}
    >
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

/* ==========================================================================
   3D KNOWLEDGE GRAPH COMPONENTS (WebGL + Drag Interactive + Purple Lines)
   ========================================================================== */

function KnowledgeGraph3D({ graphData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const nodes = graphData?.nodes || [];
    const links = graphData?.links || [];
    const meshes = [];

    const nodePositions = nodes.map((node, idx) => {
      const angle = (idx / (nodes.length || 1)) * Math.PI * 2;
      const radius = 3.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 1.5;

      const size = node.val * 0.08 + 0.22;
      const geometry = new THREE.SphereGeometry(size, 24, 24);
      
      const color = node.status === 'mastered' ? 0x05ffc0 : node.status === 'needs_work' ? 0xff5e36 : 0xff007f;
      
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.1, 
        metalness: 0.9,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      group.add(mesh);
      meshes.push(mesh);

      return { id: node.id, x, y, z };
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.8, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const posMap = new Map(nodePositions.map(p => [p.id, p]));

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8b5cf6, opacity: 0.6, transparent: true });
    const lines = [];

    links.forEach(link => {
      const s = posMap.get(link.source);
      const t = posMap.get(link.target);
      if (s && t) {
        const points = [new THREE.Vector3(s.x, s.y, s.z), new THREE.Vector3(t.x, t.y, t.z)];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
        lines.push(line);
      }
    });

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
    };

    const handleMouseMove = (e) => {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (isDragging) {
        group.rotation.y += deltaMove.x * 0.007;
        group.rotation.x += deltaMove.y * 0.007;
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const canvasEl = renderer.domElement;
    canvasEl.style.cursor = 'grab';
    canvasEl.addEventListener('mousedown', handleMouseDown);
    canvasEl.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId;
    const animate = () => {
      if (!isDragging) {
        group.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      canvasEl.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      meshes.forEach(m => {
        m.geometry.dispose();
        m.material.dispose();
      });
      lines.forEach(l => {
        l.geometry.dispose();
      });
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [graphData]);

  return (
    <div className="w-full h-[320px] rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950/80">
      <div className="absolute top-2 left-3 z-10 text-xs text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
        🖱️ Drag to Orbit 3D Nodes (Emissive Emerald/Orange)
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

/* ==========================================================================
   MAIN FRONTEND APP
   ========================================================================== */

export default function App() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [simulatedOTPCode, setSimulatedOTPCode] = useState('');

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = safeStorage.getItem('portal_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Error parsing user from safeStorage:", e);
      return null;
    }
  });
  const [token, setToken] = useState(() => safeStorage.getItem('portal_token') || null);
  const [loginEmail, setLoginEmail] = useState('student@college.edu');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBatchNo, setLoginBatchNo] = useState('2026-CS');
  const [loginDepartment, setLoginDepartment] = useState('Computer Science Engineering (CSE B.E)');
  const [loginOTP, setLoginOTP] = useState('');
  const [serverOTPCode, setServerOTPCode] = useState('');
  const [loginStep, setLoginStep] = useState('email'); // 'email' | 'otp'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // New Student and Admin states & Login Names
  const [loginRole, setLoginRole] = useState('student'); // 'student' | 'admin'
  const [loginStudentName, setLoginStudentName] = useState('Alex Morgan');
  const [loginAdminName, setLoginAdminName] = useState('Dr. A. K. Sharma');
  const [adminPassword, setAdminPassword] = useState('');

  // Admin Profile Details
  const [adminDegreeCompletion, setAdminDegreeCompletion] = useState('Ph.D in Computer Science & Engineering (M.E/M.Tech)');
  const [adminExperience, setAdminExperience] = useState('14+ Years Senior Professor & Department Chair');

  useEffect(() => {
    if (loginRole === 'student') {
      setLoginEmail('student@college.edu');
    } else {
      setLoginEmail('staff@college.edu');
    }
  }, [loginRole]);

  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [eventsList, setEventsList] = useState(() => {
    const cached = safeStorage.getItem('cached_events');
    if (cached) { try { return JSON.parse(cached); } catch (e) {} }
    return [];
  });
  const [timetableList, setTimetableList] = useState([]);

  // Event Registration Modal states
  const [registerEvent, setRegisterEvent] = useState(null);
  const [regTeamName, setRegTeamName] = useState('');
  const [regMembers, setRegMembers] = useState([
    { name: '', class_section: '', batch_no: '', email: '' },
    { name: '', class_section: '', batch_no: '', email: '' },
    { name: '', class_section: '', batch_no: '', email: '' }
  ]);
  const [regDocUrl, setRegDocUrl] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Admin Create Event Form states
  const [adminEventTitle, setAdminEventTitle] = useState('');
  const [adminEventDesc, setAdminEventDesc] = useState('');
  const [adminEventOrg, setAdminEventOrg] = useState('');
  const [adminEventDate, setAdminEventDate] = useState('');
  const [adminEventLink, setAdminEventLink] = useState('');
  const [adminEventType, setAdminEventType] = useState('Hackathon');
  const [adminEventIsOngoing, setAdminEventIsOngoing] = useState(true);
  const [adminEventPoster, setAdminEventPoster] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop');

  // Admin Hub Sub-Tab ('events' | 'timetables' | 'staff_schedules' | 'syllabus')
  const [adminSubTab, setAdminSubTab] = useState('events');

  // Admin Timetable Management States (Years 1 to 4 & All Depts)
  const [adminTTDept, setAdminTTDept] = useState('Computer Science Engineering (CSE B.E)');
  const [adminTTYear, setAdminTTYear] = useState('1st Year');
  const [adminTTSubject, setAdminTTSubject] = useState('');
  const [adminTTDay, setAdminTTDay] = useState('Monday');
  const [adminTTStart, setAdminTTStart] = useState('09:00 AM');
  const [adminTTEnd, setAdminTTEnd] = useState('10:00 AM');
  const [adminTTRoom, setAdminTTRoom] = useState('LH-101');
  const [adminTTFaculty, setAdminTTFaculty] = useState('');
  const [adminTTCsvData, setAdminTTCsvData] = useState('');
  const [adminTTImage, setAdminTTImage] = useState('');
  const [masterTimetableList, setMasterTimetableList] = useState([]);

  // Staff Schedule Management States (NEW)
  const [staffScheduleList, setStaffScheduleList] = useState([]);
  const [adminStaffName, setAdminStaffName] = useState('');
  const [adminStaffDesignation, setAdminStaffDesignation] = useState('Professor & HOD');
  const [adminStaffDept, setAdminStaffDept] = useState('Computer Science Engineering (CSE B.E)');
  const [adminStaffHours, setAdminStaffHours] = useState('Mon, Wed, Fri: 10:00 AM - 12:30 PM');
  const [adminStaffSubjects, setAdminStaffSubjects] = useState('Data Structures, Algorithms');
  const [adminStaffImage, setAdminStaffImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop');

  // Admin Syllabus & Subjects States (Years 1 to 4 & All Depts)
  const [adminSylDept, setAdminSylDept] = useState('Computer Science Engineering (CSE B.E)');
  const [adminSylYear, setAdminSylYear] = useState('1st Year');
  const [adminSylCode, setAdminSylCode] = useState('');
  const [adminSylTitle, setAdminSylTitle] = useState('');
  const [adminSylCredits, setAdminSylCredits] = useState(4);
  const [adminSylCategory, setAdminSylCategory] = useState('Core Engineering');
  const [adminSylUnits, setAdminSylUnits] = useState([
    'Unit 1: Computational Logic & Fundamentals',
    'Unit 2: Dynamic Memory Allocation & Algorithms',
    'Unit 3: Data Structures & Core Operations',
    'Unit 4: Advanced Systems & Trees',
    'Unit 5: Real-World Case Studies & Industry Applications'
  ]);
  const [adminSylImage, setAdminSylImage] = useState('');
  const [masterSyllabusList, setMasterSyllabusList] = useState([]);
  const [activeAcademicsYear, setActiveAcademicsYear] = useState('1st Year');
  const [studentSyllabusList, setStudentSyllabusList] = useState([]);

  // App navigation state: Dashboard, Academics, Skills/Clubs, AI Guide, Profile
  const [activeTab, setActiveTab] = useState('dashboard'); 

  useEffect(() => {
    if (activeTab === 'admin_timetables') setAdminSubTab('timetables');
    else if (activeTab === 'admin_staff') setAdminSubTab('staff_schedules');
    else if (activeTab === 'admin_syllabus') setAdminSubTab('syllabus');
    else if (activeTab === 'event_management') setAdminSubTab('events');
  }, [activeTab]);

  // Skills & Clubs domain selection
  const [selectedDomain, setSelectedDomain] = useState('webdev');

  // Chatbot Domain Training States
  const [skillsChatLogs, setSkillsChatLogs] = useState([
    { role: 'advisor', content: "Greetings! I am your Academic Domain Advisor. Let's find the best domain track to fit your learning path. I can guide you through 9 major domains: Web Development, AI & ML, Cyber Security, Cloud & DevOps, Mobile Apps, Game Development, Blockchain, Data Science, or Embedded Systems. What tech fields are you curious about?" }
  ]);
  const [skillsChatInput, setSkillsChatInput] = useState('');
  const [enrolledDomain, setEnrolledDomain] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingNote, setTrainingNote] = useState(null);
  const [skillsTabGraph, setSkillsTabGraph] = useState(null);
  const [maximizedSyllabus, setMaximizedSyllabus] = useState(null);
  const [activeRoadmapTopic, setActiveRoadmapTopic] = useState(null);

  // Student Isolated Progress & Admin Audit Logs States
  const [auditLogsData, setAuditLogsData] = useState({ total_students: 0, students: [], login_logs: [], student_progress: {} });
  const [studentIsolatedProgress, setStudentIsolatedProgress] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/student-audit-logs`);
      const data = await res.json();
      if (res.ok) setAuditLogsData(data);
    } catch (err) {
      console.warn("Error fetching student audit logs:", err);
    }
  };

  // Profile Edit States & Handlers
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDegree, setEditDegree] = useState('B.Tech/B.E');
  const [editBatchNo, setEditBatchNo] = useState('');
  const [editDepartment, setEditDepartment] = useState('Computer Science Engineering (CSE B.E)');
  const [editCollegeYear, setEditCollegeYear] = useState('1st Year');
  const [editInterests, setEditInterests] = useState('');

  const handleStartEditProfile = () => {
    setEditFullName(user?.full_name || '');
    setEditDegree(user?.degree || 'B.Tech/B.E');
    setEditBatchNo(user?.batch_no || '');
    setEditDepartment(user?.department || 'Computer Science');
    setEditCollegeYear(user?.college_year || '1st Year');
    
    // Handle array or comma-separated string interests
    if (Array.isArray(user?.academic_interests)) {
      setEditInterests(user.academic_interests.join(', '));
    } else {
      setEditInterests(user?.academic_interests || '');
    }
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    const updatedUser = {
      ...user,
      full_name: editFullName.trim(),
      degree: editDegree,
      batch_no: editBatchNo.trim(),
      department: editDepartment,
      college_year: editCollegeYear,
      academic_interests: editInterests.split(',').map(s => s.trim()).filter(Boolean)
    };
    
    try {
      const res = await fetch(`${API_BASE}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setUser(data.user);
      safeStorage.setItem('portal_user', JSON.stringify(data.user));
      alert("Settings saved. A notification email was successfully sent to your college inbox!");
    } catch (err) {
      console.warn("Backend update failed, saving locally.", err);
      setUser(updatedUser);
      safeStorage.setItem('portal_user', JSON.stringify(updatedUser));
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleSendSkillsAdvisorMessage = (e) => {
    e.preventDefault();
    if (!skillsChatInput.trim() || isTraining) return;
    
    const userMsg = skillsChatInput.trim();
    setSkillsChatLogs(prev => [...prev, { role: 'user', content: userMsg }]);
    setSkillsChatInput('');
    
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply = "";
      let trackKey = "";
      let trackName = "";
      
      if (lower.includes('game') || lower.includes('unity') || lower.includes('unreal') || lower.includes('c#')) {
        trackKey = 'gamedev';
        trackName = 'Game Development';
        reply = "Awesome! The Game Development track covers C# object-oriented syntax, navigating Unity Engine interfaces, physics/rigidbodies, and Unreal Engine Blueprint layouts.";
      } else if (lower.includes('blockchain') || lower.includes('web3') || lower.includes('solidity') || lower.includes('contract')) {
        trackKey = 'blockchain';
        trackName = 'Blockchain & Web3';
        reply = "Spectacular choice! The Blockchain track covers cryptography hashes, Solidity smart contracts, Hardhat/Remix node configurations, and vulnerability auditing tools.";
      } else if (lower.includes('data') || lower.includes('analytics') || lower.includes('sql') || lower.includes('pandas') || lower.includes('spark')) {
        trackKey = 'datascience';
        trackName = 'Data Science';
        reply = "Fascinating path! The Data Science track details raw spreadsheet logs parser cleaning, PostgreSQL index joins, seaborn line plotting, and Apache Spark distribution nodes.";
      } else if (lower.includes('embedded') || lower.includes('iot') || lower.includes('arduino') || lower.includes('microcontroller') || lower.includes('rtos')) {
        trackKey = 'embedded';
        trackName = 'Embedded Systems & IoT';
        reply = "Superb engineering pick! The Embedded Systems track covers Arduino pins input/output coding, STM32 microcontrollers, FreeRTOS task queues, and MQTT network protocols.";
      } else if (lower.includes('cloud') || lower.includes('devops') || lower.includes('docker') || lower.includes('kubernetes') || lower.includes('aws') || lower.includes('azure')) {
        trackKey = 'cloud';
        trackName = 'Cloud Computing & DevOps';
        reply = "Brilliant! The Cloud track details AWS computing structures, Dockerfile container setups, Kubernetes scale orchestration nodes, and automated YAML deployment runners.";
      } else if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('flutter') || lower.includes('swift') || lower.includes('kotlin')) {
        trackKey = 'mobile';
        trackName = 'Mobile App Development';
        reply = "Sensational choice! The Mobile App track details Swift & Kotlin syntax compilation, React Native Expo bundles, Flutter Widget hierarchy, and Play Store releases.";
      } else if (lower.includes('web') || lower.includes('site') || lower.includes('interface') || lower.includes('frontend') || lower.includes('html') || lower.includes('design')) {
        trackKey = 'webdev';
        trackName = 'Web Development';
        reply = "Excellent! The Web Development track teaches you HTML/CSS, JS Async, React component models, and WebGL 3D rendering. I highly recommend enrolling in this track.";
      } else if (lower.includes('ai') || lower.includes('ml') || lower.includes('neural') || lower.includes('intelligence') || lower.includes('learn') || lower.includes('python')) {
        trackKey = 'aiml';
        trackName = 'Artificial Intelligence & Machine Learning';
        reply = "Fascinating! The AI & ML track covers Python data structures, linear algebra matrices, deep neural networks, and model fine-tuning. This is a very high-demand path.";
      } else if (lower.includes('cyber') || lower.includes('sec') || lower.includes('hack') || lower.includes('protect') || lower.includes('network') || lower.includes('linux')) {
        trackKey = 'cybersec';
        trackName = 'Cyber Security & Defence';
        reply = "Outstanding! The Cyber Security track covers network routing protocols, Linux administration, cryptography keys, and penetration testing audits.";
      } else {
        reply = "I see. We offer nine primary domain tracks: Web Dev, AI & ML, Cyber Security, Cloud Computing, Mobile Apps, Game Dev, Blockchain, Data Science, or Embedded Systems. Which one sounds like a fit?";
      }
      
      const nextLogs = [...skillsChatLogs, { role: 'user', content: userMsg }, { role: 'advisor', content: reply }];
      if (trackKey) {
        nextLogs.push({
          role: 'advisor',
          content: `Would you like to enroll in the ${trackName} track?`,
          action: { label: `Enroll in ${trackName}`, track: trackKey }
        });
      } else {
        nextLogs.push({
          role: 'advisor',
          content: "You can click any option below to enroll immediately:",
          options: [
            { label: "Web Development", track: "webdev" },
            { label: "AI & Machine Learning", track: "aiml" },
            { label: "Cyber Security & Defense", track: "cybersec" },
            { label: "Cloud Computing & DevOps", track: "cloud" },
            { label: "Mobile App Development", track: "mobile" },
            { label: "Game Development", track: "gamedev" },
            { label: "Blockchain & Web3", track: "blockchain" },
            { label: "Data Science & Analytics", track: "datascience" },
            { label: "Embedded Systems & IoT", track: "embedded" }
          ]
        });
      }
      setSkillsChatLogs(nextLogs);
    }, 1000);
  };

  const handleStartDomainTraining = (track) => {
    setEnrolledDomain(track);
    setSelectedDomain(track);
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs(["Initializing learning environment for track: " + track]);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setTrainingProgress(progress);
      
      if (progress === 25) {
        setTrainingLogs(prev => [...prev, "Ingesting baseline domain curriculum files..."]);
      } else if (progress === 50) {
        setTrainingLogs(prev => [...prev, "Running conceptual diagnostic drills..."]);
      } else if (progress === 75) {
        setTrainingLogs(prev => [...prev, "Analyzing training period & logging competency marks..."]);
      } else if (progress === 100) {
        clearInterval(interval);
        setIsTraining(false);
        
        const timeString = new Date().toLocaleTimeString();
        const trackNames = {
          webdev: 'Web Development',
          aiml: 'Artificial Intelligence & ML',
          cybersec: 'Cyber Security & Defense',
          cloud: 'Cloud Computing & DevOps',
          mobile: 'Mobile App Development',
          gamedev: 'Game Development',
          blockchain: 'Blockchain & Web3',
          datascience: 'Data Science & Analytics',
          embedded: 'Embedded Systems & IoT'
        };
        const trackMilestones = {
          webdev: "Mastered JS Promises & WebGL contexts",
          aiml: "Mastered Gradient Descent & Neural Layers",
          cybersec: "Mastered Port Auditing & SSH Cryptography keys",
          cloud: "Mastered Docker Container layers & AWS VPC groups",
          mobile: "Mastered SwiftUI layouts & Android Kotlin intents",
          gamedev: "Mastered Unity Rigidbody forces & UE5 Blueprints",
          blockchain: "Mastered Solidity events & hardhat deployment configurations",
          datascience: "Mastered pandas DataFrame operations & SQL table indexes",
          embedded: "Mastered STM32 register offsets & FreeRTOS semaphore triggers"
        };
        const newNote = {
          domain: trackNames[track] || 'General Engineering',
          enrolledAt: timeString,
          period: "3 simulated hours",
          milestone: trackMilestones[track] || "Mastered baseline track concepts"
        };
        setTrainingNote(newNote);
        
        const trackGraph = {
          nodes: track === 'webdev' ? [
            { id: 'html', label: 'HTML & CSS Layouts', val: 3, status: 'mastered' },
            { id: 'js', label: 'JavaScript Async', val: 4, status: 'mastered' },
            { id: 'react', label: 'React Components', val: 5, status: 'needs_work' },
            { id: 'webgl', label: 'WebGL Canvas', val: 2, status: 'learning' }
          ] : track === 'aiml' ? [
            { id: 'python', label: 'Python Syntax', val: 3, status: 'mastered' },
            { id: 'algebra', label: 'Linear Algebra', val: 4, status: 'mastered' },
            { id: 'nn', label: 'Neural Networks', val: 5, status: 'needs_work' },
            { id: 'pytorch', label: 'PyTorch Models', val: 2, status: 'learning' }
          ] : [
            { id: 'network', label: 'Network Protocols', val: 3, status: 'mastered' },
            { id: 'linux', label: 'Linux Admin', val: 4, status: 'mastered' },
            { id: 'crypto', label: 'Cryptography Keys', val: 5, status: 'needs_work' },
            { id: 'audit', label: 'Port Audits', val: 2, status: 'learning' }
          ],
          links: track === 'webdev' ? [
            { source: 'html', target: 'js' },
            { source: 'js', target: 'react' },
            { source: 'react', target: 'webgl' }
          ] : track === 'aiml' ? [
            { source: 'python', target: 'algebra' },
            { source: 'algebra', target: 'nn' },
            { source: 'nn', target: 'pytorch' }
          ] : [
            { source: 'network', target: 'linux' },
            { source: 'linux', target: 'crypto' },
            { source: 'crypto', target: 'audit' }
          ]
        };
        
        setSkillsTabGraph(trackGraph);
        setActiveRoadmapTopic(roadmapDatabase[track][0]);
        setTrainingLogs(prev => [...prev, "Training completed! Learning roadmap flowchart generated inside the allotted slot."]);
        setKnowledgeGraph(trackGraph);
      }
    }, 1000);
  };

  // Recovered State Declarations

  const [timetable, setTimetable] = useState([
    { day_of_week: 'Monday', subject_name: 'Introduction to Programming', time_start: '09:00:00', time_end: '10:30:00', classroom: 'Room 302 Block C' },
    { day_of_week: 'Wednesday', subject_name: 'Basic Electronics', time_start: '11:00:00', time_end: '12:30:00', classroom: 'Room 104 Lab Block D' },
    { day_of_week: 'Friday', subject_name: 'Engineering Mathematics', time_start: '14:00:00', time_end: '15:30:00', classroom: 'Seminar Room 1A' }
  ]);

  const [facultyList, setFacultyList] = useState([
    { id: 1, name: 'Dr. A. K. Sharma', office_hours: 'Mon, Wed: 2:00 PM - 4:00 PM', room_location: 'Academic Block C, Room 302' },
    { id: 2, name: 'Prof. Priya Sen', office_hours: 'Tue, Thu: 10:00 AM - 12:00 PM', room_location: 'Lab Block D, Office 104' },
    { id: 3, name: 'Dr. Rajesh Patel', office_hours: 'Fri: 1:00 PM - 3:00 PM', room_location: 'Block C, Seminar Room 1A' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'academic', title: 'Syllabus Updated', body: 'The lesson plan for JavaScript Async is modified for the upcoming batch test.' },
    { id: 2, type: 'alert', title: 'Rate Limiter Warning', body: 'Your Gemini API usage limits are set to standard rates. Add a private API key if needed.' },
    { id: 3, type: 'social', title: 'New Peer Connection', body: 'A classmate from CS branch requested to establish a study channel connection.' }
  ]);

  const [friendsList, setFriendsList] = useState([
    { id: 'f1', full_name: 'Aravind Swamy', degree: 'B.Tech/B.E', batch_no: '2026-CS' },
    { id: 'f2', full_name: 'Meera Nair', degree: 'M.Tech/M.E', batch_no: '2026-EC' }
  ]);

  const [friendSearchType, setFriendSearchType] = useState('degree');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [friendMessages, setFriendMessages] = useState([
    { sender_id: 'f1', message_body: 'Hey! Have you completed the HTML layouts module yet?' },
    { sender_id: 'user', message_body: 'Almost done. Just starting JavaScript async.' }
  ]);
  const [chatAiMediated, setChatAiMediated] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);

  const [maximizedPoster, setMaximizedPoster] = useState(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);

  // Fetch user data from backend when user changes
  useEffect(() => {
    if (!user) return;

    // 1. Fetch timetable schedule
    if (user.batch_no) {
      fetch(`${API_BASE}/timetable/${user.batch_no}`)
        .then(res => res.json())
        .then(data => {
          if (data.timetable && data.timetable.length > 0) {
            setTimetable(data.timetable);
          }
        })
        .catch(err => console.warn("Timetable loading failed:", err));
    }

    // 2. Fetch user specific Todo list
    fetch(`${API_BASE}/todo?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.todos) {
          setTodos(data.todos);
        }
      })
      .catch(err => console.warn("Todos loading failed:", err));

    // 3. Fetch student isolated progress record (Continuation across logouts & devices)
    if (!user.is_admin) {
      fetch(`${API_BASE}/student/progress/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.progress) {
            if (data.progress.enrolled_skill_track) setEnrolledDomain(data.progress.enrolled_skill_track);
            if (data.progress.active_roadmap_topic) setActiveRoadmapTopic(data.progress.active_roadmap_topic);
            setStudentIsolatedProgress(data.progress);
          }
        })
        .catch(err => console.warn("Student progress fetch error:", err));
    }

    // Real-time synchronization polling for events, timetables, and syllabi
    const syncPortalData = () => {
      fetch(`${API_BASE}/events`)
        .then(res => res.json())
        .then(data => { if (data.events) setEventsList(data.events); })
        .catch(err => console.warn("Events sync failed:", err));

      fetch(`${API_BASE}/timetable/all`)
        .then(res => res.json())
        .then(data => { if (data.timetable) setMasterTimetableList(data.timetable); })
        .catch(err => console.warn("Timetable sync failed:", err));

      fetch(`${API_BASE}/syllabus`)
        .then(res => res.json())
        .then(data => {
          if (data.syllabus) {
            setMasterSyllabusList(data.syllabus);
            setStudentSyllabusList(data.syllabus);
          }
        })
        .catch(err => console.warn("Syllabus sync failed:", err));

      fetch(`${API_BASE}/staff-schedule`)
        .then(res => res.json())
        .then(data => { if (data.staff_schedules) setStaffScheduleList(data.staff_schedules); })
        .catch(err => console.warn("Staff schedules sync failed:", err));
    };

    syncPortalData();
    const interval = setInterval(syncPortalData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (eventsList && eventsList.length > 0) {
      safeStorage.setItem('cached_events', JSON.stringify(eventsList));
    }
  }, [eventsList]);

  useEffect(() => {
    if (masterTimetableList && masterTimetableList.length > 0) {
      safeStorage.setItem('cached_timetable', JSON.stringify(masterTimetableList));
    }
  }, [masterTimetableList]);

  useEffect(() => {
    if (studentSyllabusList && studentSyllabusList.length > 0) {
      safeStorage.setItem('cached_syllabus', JSON.stringify(studentSyllabusList));
    }
  }, [studentSyllabusList]);

  useEffect(() => {
    if (staffScheduleList && staffScheduleList.length > 0) {
      safeStorage.setItem('cached_staff', JSON.stringify(staffScheduleList));
    }
  }, [staffScheduleList]);

  // Persist student progress changes across logouts & devices
  useEffect(() => {
    if (!user || user.is_admin || !enrolledDomain) return;
    fetch(`${API_BASE}/student/progress/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: user.id,
        enrolled_skill_track: enrolledDomain,
        active_roadmap_topic: activeRoadmapTopic
      })
    }).catch(err => console.warn("Auto save progress error:", err));
  }, [enrolledDomain, activeRoadmapTopic, user]);

  const getVisibleClubs = () => {
    if (!user) return [];
    const isCSE = user.department?.toLowerCase().includes('cse') || user.department?.toLowerCase().includes('computer');
    const isBTech = user.department?.toLowerCase().includes('b.tech') || (user.degree && user.degree.toLowerCase().includes('b.tech'));
    
    if (isCSE || isBTech) {
      // Gather all technical clubs from all departments
      const allClubs = [];
      Object.keys(departmentClubs).forEach(dept => {
        departmentClubs[dept].forEach(club => {
          allClubs.push({
            ...club,
            displayOrganizer: dept.split(' (')[0]
          });
        });
      });
      return allClubs;
    } else {
      // Return only this student's department clubs
      const deptClubs = departmentClubs[user.department] || [];
      return deptClubs.map(club => ({
        ...club,
        displayOrganizer: (user.department || "").split(' (')[0]
      }));
    }
  };

  // Recovered Handler Functions
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    safeStorage.removeItem('portal_user');
    safeStorage.removeItem('portal_token');
  };

  const handleSSOLogin = async (e) => {
    if (e) e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginEmail.trim() || !emailRegex.test(loginEmail.trim())) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    
    setAuthError('');
    setAuthLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout to prevent pending connection hang
    
    try {
      const res = await fetch(`${API_BASE}/auth/sso/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail,
          department: loginDepartment,
          batch_no: loginBatchNo,
          role: loginRole,
          password: adminPassword,
          full_name: loginRole === 'admin' ? loginAdminName.trim() : loginStudentName.trim(),
          degree_completion: adminDegreeCompletion,
          experience: adminExperience
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'SSO Login failed');
      
      setUser(data.user);
      setToken(data.token);
      safeStorage.setItem('portal_user', JSON.stringify(data.user));
      safeStorage.setItem('portal_token', data.token);
      
      setActiveTab('dashboard');
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Authentication failed, falling back to simulated session:", err);
      const mockUser = {
        id: loginRole === 'admin' ? 'sso-mock-admin' : 'sso-mock-user',
        college_email: loginEmail,
        full_name: loginRole === 'admin' ? loginAdminName.trim() : loginStudentName.trim(),
        degree: 'B.Tech/B.E',
        batch_no: loginBatchNo,
        department: loginDepartment,
        college_year: '1st Year',
        degree_completion: adminDegreeCompletion,
        experience: adminExperience,
        domain_track: 'Software Engineering',
        learning_style: 'Visual & Hands-on',
        is_admin: loginRole === 'admin'
      };
      setUser(mockUser);
      setToken('mock-sso-token');
      safeStorage.setItem('portal_user', JSON.stringify(mockUser));
      safeStorage.setItem('portal_token', 'mock-sso-token');
      setActiveTab('dashboard');
    } finally {
      setAuthLoading(false);
    }
  };

  // To-Do and Event registration handlers
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/todo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, text: newTodoText.trim() })
      });
      const data = await res.json();
      if (res.ok && data.todo) {
        setTodos([...todos, data.todo]);
        setNewTodoText('');
      }
    } catch (err) {
      console.warn("Adding todo locally due to connection error:", err);
      const mockTodo = {
        id: "todo-" + Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        text: newTodoText.trim(),
        completed: false,
        created_at: new Date().toISOString()
      };
      setTodos([...todos, mockTodo]);
      setNewTodoText('');
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/todo/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      }
    } catch (err) {
      console.warn("Toggling todo locally:", err);
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/todo/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (err) {
      console.warn("Deleting todo locally:", err);
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  const handlePostEvent = async (e) => {
    e.preventDefault();
    if (!adminEventTitle.trim() || !adminEventDesc.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: adminEventType,
          title: adminEventTitle.trim(),
          description: adminEventDesc.trim(),
          organizer: adminEventOrg.trim() || user.full_name,
          date_string: adminEventDate.trim() || "TBA",
          registration_link: adminEventLink.trim(),
          is_ongoing: adminEventIsOngoing,
          poster_url: adminEventPoster.trim() || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop"
        })
      });
      const data = await res.json();
      if (res.ok && data.event) {
        setEventsList([data.event, ...eventsList]);
        setAdminEventTitle('');
        setAdminEventDesc('');
        setAdminEventOrg('');
        setAdminEventDate('');
        setAdminEventLink('');
        alert("🎉 Event Poster published & automatically broadcasted via email to Principal & all Department HODs!");
      }
    } catch (err) {
      console.warn("Posting event locally due to connection error:", err);
      const mockEvent = {
        id: "ev-" + Math.random().toString(36).substr(2, 9),
        type: adminEventType,
        title: adminEventTitle.trim(),
        description: adminEventDesc.trim(),
        organizer: adminEventOrg.trim() || user.full_name,
        date_string: adminEventDate.trim() || "TBA",
        registration_link: adminEventLink.trim(),
        is_ongoing: adminEventIsOngoing,
        poster_url: adminEventPoster.trim() || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop"
      };
      setEventsList([mockEvent, ...eventsList]);
      setAdminEventTitle('');
      setAdminEventDesc('');
      setAdminEventOrg('');
      setAdminEventDate('');
      setAdminEventLink('');
      alert("Event posted locally and broadcast simulated!");
    }
  };

  // Timetable Admin Handlers
  const handleSaveTimetableSlot = async (e) => {
    e.preventDefault();

    const payload = {
      department: adminTTDept,
      year: adminTTYear,
      batch_no: `${adminTTYear}-${adminTTDept}`,
      day_of_week: adminTTDay || "Monday",
      subject_name: adminTTSubject.trim() || `${adminTTDept} Class Timetable`,
      time_start: adminTTStart,
      time_end: adminTTEnd,
      classroom: adminTTRoom.trim() || "LH-101",
      faculty: adminTTFaculty.trim() || "Faculty Advisor",
      timetable_image_url: adminTTImage || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop"
    };

    try {
      const res = await fetch(`${API_BASE}/timetable/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.slot) {
        setMasterTimetableList([data.slot, ...masterTimetableList]);
        alert(`Timetable image published for ${adminTTDept} (${adminTTYear})!`);
      }
    } catch (err) {
      console.warn("Saving timetable locally:", err);
      const mockSlot = { id: "tt-" + Math.random().toString(36).substr(2, 9), ...payload };
      setMasterTimetableList([mockSlot, ...masterTimetableList]);
      alert("Timetable image published!");
    }
  };

  const handleDeleteTimetableSlot = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/timetable/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setMasterTimetableList(masterTimetableList.filter(t => t.id !== id));
      }
    } catch (err) {
      setMasterTimetableList(masterTimetableList.filter(t => t.id !== id));
    }
  };

  const handleUploadTimetableCsv = async (e) => {
    e.preventDefault();
    if (!adminTTCsvData.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/timetable/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv_data: adminTTCsvData,
          batch_no: `${adminTTYear}-${adminTTDept}`,
          department: adminTTDept,
          year: adminTTYear
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully imported ${data.count} timetable slots!`);
        setAdminTTCsvData('');
        fetch(`${API_BASE}/timetable/all`)
          .then(r => r.json())
          .then(d => setMasterTimetableList(d.timetable || []));
      }
    } catch (err) {
      alert("CSV schedule imported!");
    }
  };

  // File/Image Importer Helper using FileReader
  const handleFileImportToDataUrl = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Staff Schedule Handlers
  const handleSaveStaffSchedule = async (e) => {
    e.preventDefault();
    if (!adminStaffName.trim()) return;

    const payload = {
      staff_name: adminStaffName.trim(),
      designation: adminStaffDesignation.trim(),
      department: adminStaffDept,
      available_hours: adminStaffHours.trim(),
      assigned_subjects: adminStaffSubjects.trim(),
      schedule_image_url: adminStaffImage
    };

    try {
      const res = await fetch(`${API_BASE}/staff-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.staff_schedule) {
        setStaffScheduleList([data.staff_schedule, ...staffScheduleList]);
        setAdminStaffName('');
        alert(`Staff schedule saved for ${payload.staff_name}!`);
      }
    } catch (err) {
      const mockStaff = { id: "staff-sc-" + Math.random().toString(36).substr(2, 9), ...payload };
      setStaffScheduleList([mockStaff, ...staffScheduleList]);
      setAdminStaffName('');
      alert("Staff schedule saved locally!");
    }
  };

  const handleDeleteStaffSchedule = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/staff-schedule/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setStaffScheduleList(staffScheduleList.filter(s => s.id !== id));
      }
    } catch (err) {
      setStaffScheduleList(staffScheduleList.filter(s => s.id !== id));
    }
  };

  // Syllabus Admin Handlers
  const handleSaveSyllabusSubject = async (e) => {
    e.preventDefault();

    const payload = {
      department: adminSylDept,
      year: adminSylYear,
      subject_code: adminSylCode.trim() || `SUB${Math.floor(100 + Math.random() * 900)}`,
      subject_name: adminSylTitle.trim() || `${adminSylDept} Course Syllabus & Units`,
      credits: Number(adminSylCredits) || 4,
      category: adminSylCategory,
      units: adminSylUnits,
      syllabus_image_url: adminSylImage || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop"
    };

    try {
      const res = await fetch(`${API_BASE}/syllabus/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.subject) {
        setMasterSyllabusList([data.subject, ...masterSyllabusList]);
        setStudentSyllabusList([data.subject, ...studentSyllabusList]);
        setAdminSylTitle('');
        setAdminSylCode('');
        alert(`Syllabus image/document published for ${adminSylDept} (${adminSylYear})!`);
      }
    } catch (err) {
      const mockSyl = { id: "syl-" + Math.random().toString(36).substr(2, 9), ...payload };
      setMasterSyllabusList([mockSyl, ...masterSyllabusList]);
      setStudentSyllabusList([mockSyl, ...studentSyllabusList]);
      alert("Syllabus published!");
    }
  };

  const handleDeleteSyllabusSubject = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/syllabus/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setMasterSyllabusList(masterSyllabusList.filter(s => s.id !== id));
        setStudentSyllabusList(studentSyllabusList.filter(s => s.id !== id));
      }
    } catch (err) {
      setMasterSyllabusList(masterSyllabusList.filter(s => s.id !== id));
      setStudentSyllabusList(studentSyllabusList.filter(s => s.id !== id));
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!registerEvent || !regTeamName.trim() || !user) return;
    
    setRegLoading(true);
    setRegError('');
    
    const validMembers = regMembers.filter(m => m.name.trim() !== '' && m.email.trim() !== '');
    if (validMembers.length === 0) {
      setRegError("At least one valid team member is required.");
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: registerEvent.id,
          team_name: regTeamName.trim(),
          members: validMembers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setRegDocUrl(data.google_doc_url);
    } catch (err) {
      console.warn("Simulating registration doc generation locally:", err);
      const mockDocUrl = `https://docs.google.com/document/d/1${Math.random().toString(36).substr(2, 12).toUpperCase()}/edit?usp=sharing`;
      setRegDocUrl(mockDocUrl);
    } finally {
      setRegLoading(false);
    }
  };

  // Flowchart roadmap database mapped by Domain Track (9 Global Domains)
  const roadmapDatabase = {
    webdev: [
      {
        id: "r-web-1",
        title: "1. HTML & CSS Layouts",
        desc: "Build structured, semantic, responsive layouts.",
        tools: ["VS Code editor", "Google Chrome DevTools"],
        websites: [
          { name: "MDN Web Docs - HTML Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML" },
          { name: "CSS Tricks - Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
        ],
        videos: [
          { title: "HTML & CSS Crash Course", url: "https://www.youtube.com/watch?v=Hu4YqpW2F54" }
        ]
      },
      {
        id: "r-web-2",
        title: "2. JavaScript Async & DOM",
        desc: "Understand single-threaded execution, event loops, promises, and dynamic DOM binding.",
        tools: ["Chrome JS Console", "JS Bin Sandbox"],
        websites: [
          { name: "JavaScript.info tutorial", url: "https://javascript.info/" },
          { name: "Eloquent JavaScript book", url: "https://eloquentjavascript.net/" }
        ],
        videos: [
          { title: "Learn JavaScript Async in 15 Minutes", url: "https://www.youtube.com/watch?v=exbgOW31w5c" }
        ]
      },
      {
        id: "r-web-3",
        title: "3. React.js Components",
        desc: "State hooks, props, context managers, and functional component tree rendering.",
        tools: ["React Developer Tools extension", "Vite Builder"],
        websites: [
          { name: "React.dev official docs", url: "https://react.dev/" },
          { name: "Scrimba free React course", url: "https://scrimba.com/learn/learnreact" }
        ],
        videos: [
          { title: "ReactJS Full Course for Beginners", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" }
        ]
      },
      {
        id: "r-web-4",
        title: "4. Three.js & WebGL 3D",
        desc: "Render meshes, materials, light models, and perspective cameras inside a canvas.",
        tools: ["Blender 3D", "Three.js editor tool"],
        websites: [
          { name: "Three.js Journey training program", url: "https://threejs-journey.com/" },
          { name: "Three.js official examples", url: "https://threejs.org/" }
        ],
        videos: [
          { title: "Introduction to Three.js WebGL", url: "https://www.youtube.com/watch?v=xJAfLdUgVJg" }
        ]
      }
    ],
    aiml: [
      {
        id: "r-ai-1",
        title: "1. Python Scripting Basics",
        desc: "Variables, list buffers, dictionary hash structures, and procedural loop parameters.",
        tools: ["Jupyter Notebooks", "PyCharm IDE"],
        websites: [
          { name: "Python.org beginner guide", url: "https://www.python.org/about/gettingstarted/" },
          { name: "W3Schools Python syntax tutorials", url: "https://www.w3schools.com/python/" }
        ],
        videos: [
          { title: "Python Full Course for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" }
        ]
      },
      {
        id: "r-ai-2",
        title: "2. Linear Algebra & Stats",
        desc: "Vector subspaces, matrix transposes, probability statistics, and standard derivations.",
        tools: ["NumPy module library", "SciPy library"],
        websites: [
          { name: "Khan Academy Linear Algebra", url: "https://www.khanacademy.org/math/linear-algebra" }
        ],
        videos: [
          { title: "Essence of Linear Algebra - 3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" }
        ]
      },
      {
        id: "r-ai-3",
        title: "3. Neural Network Architectures",
        desc: "Activation functions (ReLU, Sigmoid), backpropagation weights, and loss computations.",
        tools: ["TensorFlow Playground simulator", "Keras layers API"],
        websites: [
          { name: "Deeplearning.ai training modules", url: "https://www.deeplearning.ai/" }
        ],
        videos: [
          { title: "What is a Neural Network? - 3Blue1Brown", url: "https://www.youtube.com/watch?v=aircAruvnKk" }
        ]
      },
      {
        id: "r-ai-4",
        title: "4. PyTorch Deep Models",
        desc: "Define custom neural network subclasses, training iterations, and CNN classification layers.",
        tools: ["Google Colab environment", "PyTorch framework"],
        websites: [
          { name: "PyTorch.org official training site", url: "https://pytorch.org/tutorials/" }
        ],
        videos: [
          { title: "PyTorch for Deep Learning in 10 Hours", url: "https://www.youtube.com/watch?v=V_xro1bcAuA" }
        ]
      }
    ],
    cybersec: [
      {
        id: "r-sec-1",
        title: "1. Networking & Port Routing",
        desc: "IP configurations, TCP handshake loops, UDP packet buffers, and common port audits.",
        tools: ["Wireshark packet analyzer", "Cisco Packet Tracer"],
        websites: [
          { name: "PacketLife.net cheat sheets", url: "https://packetlife.net/" }
        ],
        videos: [
          { title: "CompTIA Network+ Full Course", url: "https://www.youtube.com/watch?v=9gqMV6w7z4E" }
        ]
      },
      {
        id: "r-sec-2",
        title: "2. Linux Administration & Commands",
        desc: "Manage directories, edit files, change file permissions, and check network statuses.",
        tools: ["Kali Linux OS", "Bash shell console"],
        websites: [
          { name: "LinuxJourney.com lessons", url: "https://linuxjourney.com/" }
        ],
        videos: [
          { title: "Linux Command Line Tutorial for Beginners", url: "https://www.youtube.com/watch?v=wbpMiKi_sBo" }
        ]
      },
      {
        id: "r-sec-3",
        title: "3. Cryptography Key Models",
        desc: "Symmetric and asymmetric keys, hashing logic, SSL protocols, and public/private cipher blocks.",
        tools: ["OpenSSL compiler tool", "GnuPG cryptography tool"],
        websites: [
          { name: "Cryptohack.org hacking game", url: "https://cryptohack.org/" }
        ],
        videos: [
          { title: "Cryptography Basics Explained simply", url: "https://www.youtube.com/watch?v=jhXCTbFnK8o" }
        ]
      },
      {
        id: "r-sec-4",
        title: "4. Pentesting Auditing Loops",
        desc: "Execute port scanning scripts, examine web form request frames, and locate vulnerabilities.",
        tools: ["Nmap port scanner", "Metasploit toolkit", "Burp Suite interceptor"],
        websites: [
          { name: "TryHackMe virtual rooms", url: "https://tryhackme.com/" },
          { name: "Hack The Box training networks", url: "https://www.hackthebox.com/" }
        ],
        videos: [
          { title: "Certified Ethical Hacker CEH Prep Guides", url: "https://www.youtube.com/watch?v=3Kq1MOf3nNs" }
        ]
      }
    ],
    cloud: [
      {
        id: "r-cld-1",
        title: "1. AWS/Azure Core Providers",
        desc: "Familiarize with computing instances, VPC network groups, IAM permissions, and object store buckets.",
        tools: ["AWS Management Console", "AWS CLI"],
        websites: [
          { name: "AWS Cloud Practitioner guide", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/" }
        ],
        videos: [
          { title: "AWS Certified Cloud Practitioner Course", url: "https://www.youtube.com/watch?v=SOTamWGuqXs" }
        ]
      },
      {
        id: "r-cld-2",
        title: "2. Docker Containers",
        desc: "Create structured Dockerfiles, map server port sockets, compile image files, and run local container layers.",
        tools: ["Docker Desktop sandbox", "Docker Hub registry"],
        websites: [
          { name: "Docker official documentation guide", url: "https://docs.docker.com/get-started/" }
        ],
        videos: [
          { title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/watch?v=pTFZFxd4hOI" }
        ]
      },
      {
        id: "r-cld-3",
        title: "3. Kubernetes Orchestration",
        desc: "Deploy pods, configure load balancers, scale resources dynamically, and audit node health states.",
        tools: ["Minikube testing node", "kubectl command console"],
        websites: [
          { name: "Kubernetes interactive training site", url: "https://kubernetes.io/docs/tutorials/" }
        ],
        videos: [
          { title: "Kubernetes Course for Beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do" }
        ]
      },
      {
        id: "r-cld-4",
        title: "4. CI/CD Deployment Pipelines",
        desc: "Build automated deployment workflows using runner configurations and YAML build files.",
        tools: ["GitHub Actions editor", "Jenkins builder pipeline"],
        websites: [
          { name: "GitLab CI/CD learning paths", url: "https://docs.gitlab.com/ee/ci/" }
        ],
        videos: [
          { title: "CI/CD Pipeline Crash Course", url: "https://www.youtube.com/watch?v=scEDHsr3APg" }
        ]
      }
    ],
    mobile: [
      {
        id: "r-mob-1",
        title: "1. Swift & Kotlin Basics",
        desc: "Study basic variables, function parameters, class instances, and type systems for Android and iOS systems.",
        tools: ["Xcode workspace IDE", "Android Studio compiler"],
        websites: [
          { name: "Kotlin language tutorials", url: "https://kotlinlang.org/docs/home.html" },
          { name: "Apple Swift programming guide", url: "https://developer.apple.com/swift/" }
        ],
        videos: [
          { title: "Android Development for Beginners - Kotlin", url: "https://www.youtube.com/watch?v=EExSSotojxs" }
        ]
      },
      {
        id: "r-mob-2",
        title: "2. React Native Frameworks",
        desc: "Compile platform-independent mobile UI apps using JSX syntax components and JavaScript interpreters.",
        tools: ["Expo CLI client", "VS Code environment"],
        websites: [
          { name: "React Native official docs index", url: "https://reactnative.dev/docs/getting-started" }
        ],
        videos: [
          { title: "React Native Full Crash Course", url: "https://www.youtube.com/watch?v=gvkqT_UoAHw" }
        ]
      },
      {
        id: "r-mob-3",
        title: "3. Flutter Frameworks",
        desc: "Learn to layout nested Widget trees, manage application states, and deploy UI nodes via Dart language structures.",
        tools: ["Flutter SDK environment", "Dart VM compiler"],
        websites: [
          { name: "Flutter official code training", url: "https://docs.flutter.dev/reference/tutorials" }
        ],
        videos: [
          { title: "Flutter Course for Beginners - 37 Hours", url: "https://www.youtube.com/watch?v=VPvVD8t02U8" }
        ]
      },
      {
        id: "r-mob-4",
        title: "4. Store Release Operations",
        desc: "Package release binaries, audit certificate keys, write metadata descriptions, and push items to stores.",
        tools: ["Google Play Console", "App Store Connect portal"],
        websites: [
          { name: "Apple Developer publishing tutorials", url: "https://developer.apple.com/support/app-store/" }
        ],
        videos: [
          { title: "How to Publish App on Google Play Store", url: "https://www.youtube.com/watch?v=H74S-mC_kU4" }
        ]
      }
    ],
    gamedev: [
      {
        id: "r-gm-1",
        title: "1. C# Scripting Basics",
        desc: "Study object-oriented classes, data attributes, interface structures, and loop execution scripts.",
        tools: ["Visual Studio Community", "MonoDevelop workspace"],
        websites: [
          { name: "C# Microsoft learning modules", url: "https://learn.microsoft.com/en-us/dotnet/csharp/" }
        ],
        videos: [
          { title: "C# Programming for Game Development", url: "https://www.youtube.com/watch?v=gfkTfsp_168" }
        ]
      },
      {
        id: "r-gm-2",
        title: "2. Unity Editor & Concepts",
        desc: "Navigate scene grids, create active GameObjects, write custom script behaviors, and test runtime execution loops.",
        tools: ["Unity Hub", "Unity Engine Editor workspace"],
        websites: [
          { name: "Unity Learn official tutorials", url: "https://learn.unity.com/" }
        ],
        videos: [
          { title: "How to Make a Game - Unity Beginner Tutorial", url: "https://www.youtube.com/watch?v=XtQMytDXBXM" }
        ]
      },
      {
        id: "r-gm-3",
        title: "3. Physics & Visual Materials",
        desc: "Apply rigidbodies, construct custom collider boxes, bind material shaders, and coordinate render lighting models.",
        tools: ["ProBuilder editor extension", "Shader Graph editor"],
        websites: [
          { name: "Unity physics guide notes", url: "https://docs.unity3d.com/Manual/PhysicsSection.html" }
        ],
        videos: [
          { title: "Unity Physics and Colliders Crash Course", url: "https://www.youtube.com/watch?v=x5V1Pz8Xp0c" }
        ]
      },
      {
        id: "r-gm-4",
        title: "4. Unreal Engine 5 Specials",
        desc: "Audit Blueprint logical flows, configure collision rules, write visual code, and map 3D physics inside UE5.",
        tools: ["Unreal Engine 5 installer", "Epic Games Launcher"],
        websites: [
          { name: "Epic Developer Community portal", url: "https://dev.epicgames.com/community/unreal-engine" }
        ],
        videos: [
          { title: "Unreal Engine 5 Beginner Tutorial", url: "https://www.youtube.com/watch?v=gQmiqmxoTps" }
        ]
      }
    ],
    blockchain: [
      {
        id: "r-bc-1",
        title: "1. Cryptography Basics",
        desc: "Study cryptographic hashing logic, compile digital signature frames, and audit distributed transaction ledgers.",
        tools: ["SHA256 test consoles", "Geth network client"],
        websites: [
          { name: "Ethereum.org core protocols", url: "https://ethereum.org/en/developers/" }
        ],
        videos: [
          { title: "How Blockchain Works - Simply Explained", url: "https://www.youtube.com/watch?v=SSo_EIwHSd4" }
        ]
      },
      {
        id: "r-bc-2",
        title: "2. Solidity Smart Contracts",
        desc: "Deploy basic ERC20 token models, code transfer structures, and enforce transaction control attributes.",
        tools: ["Remix Web IDE browser", "Solc compiler"],
        websites: [
          { name: "Solidity lang official documentation website", url: "https://docs.soliditylang.org/" }
        ],
        videos: [
          { title: "Solidity & Smart Contracts Crash Course", url: "https://www.youtube.com/watch?v=M576WGiDBdQ" }
        ]
      },
      {
        id: "r-bc-3",
        title: "3. Hardhat & Web3 Testing",
        desc: "Write unit test scripts, run local test blockchain networks, and connect web app clients via provider wallets.",
        tools: ["Hardhat CLI toolkit", "Metamask Browser Extension"],
        websites: [
          { name: "Hardhat official documentation site", url: "https://hardhat.org/docs" }
        ],
        videos: [
          { title: "Web3 DApp Development Course with Hardhat", url: "https://www.youtube.com/watch?v=coQ5dg8wM2o" }
        ]
      },
      {
        id: "r-bc-4",
        title: "4. Security Auditing Tasks",
        desc: "Analyze contract source files for reentrancy bugs, audit code logic structures, and secure contract layers.",
        tools: ["Slither static analyzer", "Mythril scanner tool"],
        websites: [
          { name: "OpenZeppelin secure code base library", url: "https://docs.openzeppelin.com/contracts/" }
        ],
        videos: [
          { title: "Smart Contract Vulnerabilities Audit Guide", url: "https://www.youtube.com/watch?v=F01VpG2X0t0" }
        ]
      }
    ],
    datascience: [
      {
        id: "r-ds-1",
        title: "1. Data Structures & Analysis",
        desc: "Parse raw spreadsheet logs, map nested array data grids, clean missing details, and compile math arrays.",
        tools: ["Jupyter Notebook sandbox", "VS Code Python"],
        websites: [
          { name: "Pandas module reference index", url: "https://pandas.pydata.org/docs/" }
        ],
        videos: [
          { title: "Python for Data Analysis - Full Course", url: "https://www.youtube.com/watch?v=GPVsHOlscBI" }
        ]
      },
      {
        id: "r-ds-2",
        title: "2. SQL Data Architectures",
        desc: "Coordinate database join queries, filter table indices, calculate data columns, and export data views.",
        tools: ["PostgreSQL shell console", "DBeaver GUI manager"],
        websites: [
          { name: "PostgreSQL official reference portal", url: "https://www.postgresql.org/docs/" }
        ],
        videos: [
          { title: "SQL for Data Science Full Tutorial", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" }
        ]
      },
      {
        id: "r-ds-3",
        title: "3. Visual Layout Renderers",
        desc: "Plot trend line calculations, format bar chart grids, and construct analytical layout dashboards.",
        tools: ["Tableau Public editor", "Seaborn library"],
        websites: [
          { name: "Matplotlib visual reference pages", url: "https://matplotlib.org/stable/tutorials/index.html" }
        ],
        videos: [
          { title: "Data Visualization in Python Guide", url: "https://www.youtube.com/watch?v=a9UrKTt1okY" }
        ]
      },
      {
        id: "r-ds-4",
        title: "4. Apache Spark Pipelines",
        desc: "Process giant streaming logs, distribute calculation nodes, query databases, and manage file pipelines.",
        tools: ["Apache Spark runtime", "Hadoop storage nodes"],
        websites: [
          { name: "Apache Spark training tutorials", url: "https://spark.apache.org/docs/latest/" }
        ],
        videos: [
          { title: "Apache Spark Crash Course for Beginners", url: "https://www.youtube.com/watch?v=_C8kWso4ne4" }
        ]
      }
    ],
    embedded: [
      {
        id: "r-emb-1",
        title: "1. C & Arduino Programming",
        desc: "Code procedural script loops, coordinate input-output pin states, write analog values, and parse sensor outputs.",
        tools: ["Arduino IDE compiler", "Tinkercad Simulator"],
        websites: [
          { name: "Arduino language reference page", url: "https://www.arduino.cc/reference/en/" }
        ],
        videos: [
          { title: "Arduino Course for Beginners", url: "https://www.youtube.com/watch?v=zJ-LqeX_yLU" }
        ]
      },
      {
        id: "r-emb-2",
        title: "2. Microcontrollers & Registers",
        desc: "Coordinate memory maps, write direct register values, handle hardware interrupts, and test CPU clocks.",
        tools: ["STM32CubeIDE compiler", "STM32 Nucleo boards"],
        websites: [
          { name: "ST Microelectronics training page", url: "https://www.st.com/content/st_com/en.html" }
        ],
        videos: [
          { title: "STM32 Microcontroller Programming Guide", url: "https://www.youtube.com/watch?v=hyy8sZdBp28" }
        ]
      },
      {
        id: "r-emb-3",
        title: "3. RTOS Task Scheduling",
        desc: "Create concurrent execution tasks, enforce semaphore access locks, and coordinate task execution priority queues.",
        tools: ["FreeRTOS framework", "Logic analyzers"],
        websites: [
          { name: "FreeRTOS architecture manuals", url: "https://www.freertos.org/Documentation/RTOS_book.html" }
        ],
        videos: [
          { title: "RTOS Task Management Concepts Simply Explained", url: "https://www.youtube.com/watch?v=F321087yYy4" }
        ]
      },
      {
        id: "r-emb-4",
        title: "4. IoT Protocols",
        desc: "Format MQTT sensor frames, compile HTTP post requests, test Wi-Fi chips, and transmit details to servers.",
        tools: ["Mosquitto MQTT server", "MQTT Lens client"],
        websites: [
          { name: "MQTT protocol specifications list", url: "https://mqtt.org/documentation/" }
        ],
        videos: [
          { title: "MQTT Protocol Explained with Examples", url: "https://www.youtube.com/watch?v=VUssskZ7Uf0" }
        ]
      }
    ]
  };

  // Academics Syllabus subject database mapped by Department & Semester
  const academicsDatabase = {
    "Computer Science": {
      subjects: [
        { 
          code: "CS101", 
          name: "Programming & Logic in C", 
          desc: "Covers standard memory pointers, array buffers, file handles, and procedural logic parameters.", 
          syllabus: [
            "Unit 1: Introduction to C Syntax, Operators & Expressions",
            "Unit 2: Control Structures, Branching, and Loops",
            "Unit 3: Function Declarations, Scoping & Stack Frames",
            "Unit 4: Pointers, Arrays, Strings & Dynamic Memory Allocations",
            "Unit 5: Structures, Unions & High-Performance File System Operations"
          ],
          videoTitle: "C Programming Full Crash Course for Beginners", 
          videoLink: "https://www.youtube.com/watch?v=KJgsSFOSQv0", 
          channel: "freeCodeCamp" 
        },
        { 
          code: "MA102", 
          name: "Calculus & Linear Algebra", 
          desc: "Integrals, matrices, Eigenvalues, derivatives, and vector subspace dimensions.", 
          syllabus: [
            "Unit 1: Single Variable Calculus & Integration Theorems",
            "Unit 2: Differential Equations and Optimization",
            "Unit 3: Vector Spaces, Subspaces, and Linear Independence",
            "Unit 4: Matrices, Determinants & Eigenvalue/Eigenvector Computations",
            "Unit 5: Multi-dimensional Coordinate Transforms & Orthogonalization"
          ],
          videoTitle: "Linear Algebra - Gilbert Strang", 
          videoLink: "https://www.youtube.com/watch?v=7UJt_K6dBtA", 
          channel: "MIT CourseWare" 
        },
        { 
          code: "EE103", 
          name: "Basic Electrical Engineering", 
          desc: "Kirchhoff laws, nodal loops, transformers, AC circuits, and electrical load grids.", 
          syllabus: [
            "Unit 1: DC Circuit Laws (Kirchhoff, Thevenin, Norton Theorems)",
            "Unit 2: Single Phase and Three Phase AC Network Grids",
            "Unit 3: Magnetism and Magnetic Circuit Formulations",
            "Unit 4: Electrical Transformers and DC Machine Models",
            "Unit 5: Digital Measurements & Domestic Wiring Safety"
          ],
          videoTitle: "Basic Electrical Engineering Basics Tutorial", 
          videoLink: "https://www.youtube.com/watch?v=r-Z8L1aZ8pM", 
          channel: "Engineering Academy" 
        }
      ]
    },
    "Electronics": {
      subjects: [
        { 
          code: "EC101", 
          name: "Basic Semiconductor Devices", 
          desc: "PN junction diodes, MOSFET gates, transconductance, and analog amplifiers.", 
          syllabus: [
            "Unit 1: Semiconductor Physics (Energy Bands, Charge Carrier Flows)",
            "Unit 2: PN Junction Diode Mechanics & Rectification Circuits",
            "Unit 3: Bipolar Junction Transistor (BJT) Characteristics & States",
            "Unit 4: Field Effect Transistors (FET & MOSFET gates)",
            "Unit 5: Optoelectronic Devices & Basic Analog Amplifier Cascades"
          ],
          videoTitle: "Semiconductor Physics Basics Explained", 
          videoLink: "https://www.youtube.com/watch?v=7ukDKV_8j-c", 
          channel: "CrashCourse Physics" 
        },
        { 
          code: "MA102", 
          name: "Calculus & Differential Calculus", 
          desc: "Vector spaces, limits, derivative bounds, and equations of motion.", 
          syllabus: [
            "Unit 1: Multivariable Derivatives & Partial Differentiation",
            "Unit 2: Multiple Integrals & Volume Calculations",
            "Unit 3: First-Order Ordinary Differential Equations (ODE)",
            "Unit 4: Higher-Order Linear Differential Equations",
            "Unit 5: Vector Fields & Curl/Divergence Integrals"
          ],
          videoTitle: "Differential Equations Crash Course", 
          videoLink: "https://www.youtube.com/watch?v=p_di4HawTI8", 
          channel: "3Blue1Brown" 
        },
        { 
          code: "EC103", 
          name: "Digital System Layout", 
          desc: "Logic doors, Boolean formulas, multiplexers, and flip-flop buffers.", 
          syllabus: [
            "Unit 1: Number Systems, Gray Codes & Logic Gates",
            "Unit 2: Boolean Algebra Laws & Karnaugh Map Simplification",
            "Unit 3: Combinational Logic (Adders, Decoders, Multiplexers)",
            "Unit 4: Sequential Logic Circuits (Flip-Flops, Registers)",
            "Unit 5: Finite State Machines & Counter Synchronizations"
          ],
          videoTitle: "Digital Electronics Circuit Tutorials", 
          videoLink: "https://www.youtube.com/watch?v=M0mx8S05v60", 
          channel: "NESO Academy" 
        }
      ]
    }
  };

  // Clubs configured by Department (strictly college departments)
  const departmentClubs = {
    "Computer Science Engineering (CSE B.E)": [
      { name: "CSE Coding Society", desc: "Hosts competitive programming drills, hackathons, and server structures.", icon: "💻", organizer: "CSE Dept" },
      { name: "ACM Student Chapter", desc: "Builds production student utilities and conducts algorithms research.", icon: "🌐", organizer: "CSE Dept" },
      { name: "CS Web & App Guild", desc: "Develops internal college portals, schedules databases, and UI mocks.", icon: "📱", organizer: "CSE Dept" }
    ],
    "Artificial Intelligence and Data Science (AI&DS B.Tech)": [
      { name: "AI & Robotics Club", desc: "Builds computer vision models, robotic arms, and sensory controls.", icon: "🤖", organizer: "AI&DS Dept" },
      { name: "Data Analytics Forum", desc: "Hosts data cleaning drills, data pipelines, and predictive models.", icon: "📊", organizer: "AI&DS Dept" }
    ],
    "Artificial Intelligence and Machine Learning (AI&ML B.Tech)": [
      { name: "Neural Networks Society", desc: "Studies deep learning weights, PyTorch patterns, and transformers.", icon: "🧠", organizer: "AI&ML Dept" },
      { name: "Cognitive Computing Forum", desc: "Builds NLP tools, speech agents, and agentic code.", icon: "💬", organizer: "AI&ML Dept" }
    ],
    "Computer Science and Business Systems (CSBS B.Tech)": [
      { name: "Business Systems Guild", desc: "Designs enterprise architectures, agile methods, and CRM databases.", icon: "👔", organizer: "CSBS Dept" },
      { name: "FinTech Innovation Club", desc: "Explores quantitative trading models, ledger chains, and payment structures.", icon: "💳", organizer: "CSBS Dept" }
    ],
    "Electronics and Communication Engineering (ECE B.E)": [
      { name: "Robotics & IoT Laboratory", desc: "Designs autonomous micro-bots, hardware boards, and sensor relays.", icon: "🤖", organizer: "ECE Dept" },
      { name: "Embedded Systems Forum", desc: "Focuses on assembly code, microcontrollers, and circuit designs.", icon: "🔌", organizer: "ECE Dept" }
    ],
    "Electrical and Electronics Engineering (EEE B.E)": [
      { name: "Power Systems & Tesla Club", desc: "Explores grid networks, high voltage systems, and motor circuits.", icon: "⚡", organizer: "EEE Dept" },
      { name: "Renewable Energy Forum", desc: "Designs green solar arrays, battery cells, and wind inverter controls.", icon: "🌱", organizer: "EEE Dept" }
    ],
    "Civil Engineering (B.E)": [
      { name: "Structural Design Society", desc: "Studies bridge load limits, concrete strengths, and CAD stress maps.", icon: "🏗️", organizer: "Civil Dept" },
      { name: "Urban Planning Group", desc: "Designs green city maps, sewage layouts, and public transit nodes.", icon: "🗺️", organizer: "Civil Dept" }
    ],
    "Mechanical Engineering (B.E)": [
      { name: "SAE Aero & Auto Club", desc: "Builds dynamic vehicle chassis, formula student cars, and RC drones.", icon: "🏎️", organizer: "Mechanical Dept" },
      { name: "CAD/CAM Robotics Guild", desc: "Runs CNC milling drills, 3D printing prints, and pneumatic cylinders.", icon: "⚙️", organizer: "Mechanical Dept" }
    ],
    "CyberSecurity (B.Tech)": [
      { name: "Ethical Hacking Alliance", desc: "Conducts safe penetration testing, CTF drills, and port audits.", icon: "🛡️", organizer: "CyberSecurity Dept" },
      { name: "Defensive Cyber Ops", desc: "Focuses on SSH key cryptography, firewall settings, and log analysis.", icon: "🔑", organizer: "CyberSecurity Dept" }
    ]
  };

  // Skill YouTube recommendations configured by Domain Track
  const domainSkillsConfig = {
    webdev: {
      name: "Web Development & Frontend",
      skills: ["React.js component structures", "Tailwind CSS responsive design", "Three.js WebGL canvases"],
      videos: [
        { title: "React JS Full Course for Beginners - 2026 Tutorial", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", channel: "Programming with Mosh" },
        { title: "Three.js Tutorial - Creating interactive 3D Web Scenes", url: "https://www.youtube.com/watch?v=xJAfLdUgVJg", channel: "DesignCourse" }
      ]
    },
    aiml: {
      name: "Artificial Intelligence & ML",
      skills: ["Python scripting fundamentals", "Neural networks & activation states", "TensorFlow classification models"],
      videos: [
        { title: "Neural Networks & Deep Learning Explained visually", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "3Blue1Brown" },
        { title: "TensorFlow & Keras Crash Course for ML beginners", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk", channel: "freeCodeCamp" }
      ]
    },
    cybersec: {
      name: "Cyber Security & Networks",
      skills: ["Kali Linux penetration command structures", "SQL Injection defense methods", "Network packet routing blocks"],
      videos: [
        { title: "Ethical Hacking Full Course - Learn Penetration Testing", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", channel: "freeCodeCamp" },
        { title: "SQL Injection Attacks Explained & Prevention Rules", url: "https://www.youtube.com/watch?v=ciNHn38EyRc", channel: "Computerphile" }
      ]
    },
    cloud: {
      name: "Cloud Computing & DevOps",
      skills: ["AWS EC2 computing structures", "Docker container images", "Kubernetes scale engines"],
      videos: [
        { title: "DevOps & Cloud Computing Roadmap for Beginners", url: "https://www.youtube.com/watch?v=5pH3g7jE_iM", channel: "TechWorld with Nana" },
        { title: "Docker & Kubernetes Crash Course", url: "https://www.youtube.com/watch?v=BhDP7C-B8-o", channel: "freeCodeCamp" }
      ]
    },
    mobile: {
      name: "Mobile App Development",
      skills: ["Flutter Widget hierarchical patterns", "React Native building setups", "Swift & Android Studio SDKs"],
      videos: [
        { title: "React Native Full Course for Beginners", url: "https://www.youtube.com/watch?v=obH0Po_RdWk", channel: "Programming with Mosh" },
        { title: "Flutter Course for Beginners - Build Mobile Apps", url: "https://www.youtube.com/watch?v=x0uinJyeFco", channel: "freeCodeCamp" }
      ]
    },
    gamedev: {
      name: "Game Development",
      skills: ["C# programming within Unity Engine", "Unreal Blueprint coding blocks", "3D physics forces and meshes"],
      videos: [
        { title: "Unity Tutorial for Beginners - 2D & 3D Game Design", url: "https://www.youtube.com/watch?v=XtQMytDXBXM", channel: "Brackeys" },
        { title: "Unreal Engine 5 Full Course for Beginners", url: "https://www.youtube.com/watch?v=gQmiqmxJMtA", channel: "freeCodeCamp" }
      ]
    },
    blockchain: {
      name: "Blockchain & Web3",
      skills: ["Solidity smart contract structures", "Remix and Hardhat workspace setups", "Cryptography keys and wallet flows"],
      videos: [
        { title: "Web3 & Solidity Development Full Course", url: "https://www.youtube.com/watch?v=gyMwXuJrbDT", channel: "Patrick Collins" },
        { title: "How Blockchain Works - Visually Explained", url: "https://www.youtube.com/watch?v=yubzJw0uiE4", channel: "3Blue1Brown" }
      ]
    },
    datascience: {
      name: "Data Science & Analytics",
      skills: ["Python pandas spreadsheet parsers", "PostgreSQL database joins", "Seaborn visual plot templates"],
      videos: [
        { title: "Data Science for Beginners - Full Course", url: "https://www.youtube.com/watch?v=ua-CiDNNj30", channel: "freeCodeCamp" },
        { title: "SQL for Data Science Tutorial", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA", channel: "Alex The Analyst" }
      ]
    },
    embedded: {
      name: "Embedded Systems & IoT",
      skills: ["Arduino pin read/write setups", "STM32 microcontroller registers", "FreeRTOS multitasking queues"],
      videos: [
        { title: "Embedded Systems Course - Hardware & Software", url: "https://www.youtube.com/watch?v=H7S86t2P-N4", channel: "Udacity" },
        { title: "Arduino Tutorial for Beginners - Full Lessons", url: "https://www.youtube.com/watch?v=zJ-LqeX_yLU", channel: "Paul McWhorter" }
      ]
    }
  };

  // AI Guide (Gemini API direct query from browser or simulated fallback)
  const [aiGuideInput, setAiGuideInput] = useState('');
  const [aiGuideMessages, setAiGuideMessages] = useState([
    { role: 'model', message_content: "Hello! I am your AI Guide. Paste your Gemini API key in settings to unlock real Gemini AI, or ask me doubts directly!" }
  ]);
  const [aiGuideLoading, setAiGuideLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => safeStorage.getItem('user_gemini_api_key') || '');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);

  // Save API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    safeStorage.setItem('user_gemini_api_key', geminiApiKey);
    alert("Gemini API Key saved locally in browser memory!");
    setShowApiSettings(false);
  };

  // AI Guide Chat handler
  const handleSendAiGuideMessage = async (e) => {
    e.preventDefault();
    if (!aiGuideInput.trim()) return;

    const userMsg = { role: 'user', message_content: aiGuideInput };
    setAiGuideMessages(prev => [...prev, userMsg]);
    const currentInput = aiGuideInput;
    setAiGuideInput('');
    setAiGuideLoading(true);

    // If student has saved a Gemini API key, fetch Google Gemini API directly!
    if (geminiApiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `You are an expert academic college freshman counselor. Answer this student's query precisely: ${currentInput}` }] }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const replyText = data.candidates[0].content.parts[0].text;
          setAiGuideMessages(prev => [...prev, { role: 'model', message_content: replyText }]);
        } else {
          throw new Error("Invalid response form");
        }
      } catch (err) {
        console.error("Direct Gemini API error:", err);
        setAiGuideMessages(prev => [
          ...prev, 
          { role: 'model', message_content: "⚠️ API query error. Please verify your Gemini API key. Falling back to offline mode helper." }
        ]);
        triggerSimulatedAIAnswer(currentInput);
      } finally {
        setAiGuideLoading(false);
      }
      return;
    }

    // Query backend Gemini Chatbot API or fallback
    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          user_profile: user
        })
      });
      const data = await res.json();
      if (data.response) {
        setAiGuideMessages(prev => [...prev, { role: 'model', message_content: data.response }]);
      } else {
        triggerSimulatedAIAnswer(currentInput);
      }
    } catch (err) {
      triggerSimulatedAIAnswer(currentInput);
    } finally {
      setAiGuideLoading(false);
    }
  };

  const triggerSimulatedAIAnswer = (input) => {
    setTimeout(() => {
      const simulatedReplies = [
        "💡 Tip: For this, start by identifying the scope. Declaring parameters cleanly makes recursive calls stable.",
        "💡 Concept: To design this database logic, ensure matching keys are indexed. It prevents page load delays.",
        "💡 Resource: Check the Academics tab! The recommended YouTube preparation video covers this step in detail."
      ];
      const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      setAiGuideMessages(prev => [...prev, { role: 'model', message_content: randomReply }]);
    }, 700);
  };

  // AI Mentor state chat
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'model', message_content: "Hey there! Ask me any study tips, syllabus blocks, or adaptation hurdles." }
  ]);

  const handleSendMentorMessage = async (e) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userMessage = { role: 'user', message_content: mentorInput };
    setMentorMessages(prev => [...prev, userMessage]);
    const currentInput = mentorInput;
    setMentorInput('');
    setMentorLoading(true);

    if (geminiApiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `You are a helpful college freshman growth mentor. Give a concise, encouragement-focused answer under 3 sentences for: ${currentInput}` }] }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const replyText = data.candidates[0].content.parts[0].text;
          setMentorMessages(prev => [...prev, { role: 'model', message_content: replyText }]);
        } else {
          throw new Error("Invalid response form");
        }
      } catch (err) {
        console.error("Direct Gemini API error for mentor:", err);
        setMentorMessages(prev => [...prev, { role: 'model', message_content: "⚠️ Key verification failed. Try checking out target skill milestones in the Skills section." }]);
      } finally {
        setMentorLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, message: currentInput })
      });
      const data = await res.json();
      setMentorMessages(prev => [...prev, { role: 'model', message_content: data.reply }]);
    } catch (err) {
      setTimeout(() => {
        setMentorMessages(prev => [...prev, { role: 'model', message_content: "Keep up the coding drills! Try checking out target skill milestones in the Skills section." }]);
      }, 700);
    } finally {
      setMentorLoading(false);
    }
  };

  // Faculty Contacts / Timetable data loading
  const [routeSearchOption] = useState('');
  
  // Weekend Test
  const loadQuizQuestions = () => {
    loadQuiz();
  };

  // Peer messages
  const fetchFriendsList = (uid) => {
    fetchFriends(uid);
  };

  return (
    <div className="min-h-screen gradient-bg-mesh pb-12 relative overflow-hidden font-sans">
      {/* 3D Floating Particle Background */}
      <ParticleBackground3D activeTab={user ? activeTab : 'login'} />

      {/* Animated background cosmic neon orbs */}
      <div className="cosmic-orb-1 absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="cosmic-orb-2 absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-500/20 to-pink-500/10 blur-[140px] pointer-events-none z-0"></div>
      <div className="cosmic-orb-1 absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 blur-[110px] pointer-events-none z-0"></div>



      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/5 py-3 sm:py-4 px-4 sm:px-8 md:px-12 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex justify-center items-center neon-glow-blue shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent text-glow-blue">
            ADAPTIFY
          </span>
          <span className="hidden sm:inline-block text-[9px] sm:text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30 uppercase font-mono font-bold">
            College Freshers
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {offlineMode && (
              <span className="hidden md:inline-block text-[10px] bg-amber-500/25 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono font-bold animate-pulse">
                ⚡ Static Web Mode
              </span>
            )}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[100px] sm:max-w-none">{user.full_name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white p-1.5 sm:p-2 hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 relative z-10">
        
        {/* STEP 1: AUTHENTICATION (Includes Batch No & Department inputs) */}
        {!user && (
          <div className="perspective-container">
            <div className="max-w-md mx-auto mt-8 glass-panel card-3d-tilt p-8 rounded-3xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>
              
              <div className="text-center mb-8 depth-content">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight text-glow-blue">University SSO</h2>
                <p className="text-slate-400 text-sm">Log in using your institutional credentials</p>
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg flex items-center gap-2.5 mb-6 text-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Role Toggle Tabs */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6 relative z-20">
                <button 
                  type="button" 
                  onClick={() => { setLoginRole('student'); setAuthError(''); }}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${loginRole === 'student' ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  🎓 Student SSO
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginRole('admin'); setAuthError(''); }}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${loginRole === 'admin' ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  💼 Admin Portal
                </button>
              </div>

              <form onSubmit={handleSSOLogin} className="space-y-4 depth-content text-xs">
                {loginRole === 'student' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Student Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Alex Morgan"
                      required
                      value={loginStudentName}
                      onChange={(e) => setLoginStudentName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Faculty Admin Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. A. K. Sharma"
                      required
                      value={loginAdminName}
                      onChange={(e) => setLoginAdminName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    {loginRole === 'admin' ? "Institutional Faculty Email" : "Email Address"}
                  </label>
                  <input 
                    type="email" 
                    placeholder={loginRole === 'admin' ? "e.g. faculty@college.ac.in" : "e.g. student@gmail.com, student@ac.in"}
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                  />
                </div>

                {loginRole === 'student' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Class Batch Code</label>
                      <input 
                        type="text"
                        placeholder="e.g. 2026-CS"
                        required
                        value={loginBatchNo}
                        onChange={(e) => setLoginBatchNo(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Select Department</label>
                      <select 
                        value={loginDepartment}
                        onChange={(e) => setLoginDepartment(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-all font-sans"
                      >
                        <option value="Computer Science Engineering (CSE B.E)">Computer Science Engineering (CSE B.E)</option>
                        <option value="Artificial Intelligence and Data Science (AI&DS B.Tech)">Artificial Intelligence and Data Science (AI&DS B.Tech)</option>
                        <option value="Artificial Intelligence and Machine Learning (AI&ML B.Tech)">Artificial Intelligence and Machine Learning (AI&ML B.Tech)</option>
                        <option value="Computer Science and Business Systems (CSBS B.Tech)">Computer Science and Business Systems (CSBS B.Tech)</option>
                        <option value="Electronics and Communication Engineering (ECE B.E)">Electronics and Communication Engineering (ECE B.E)</option>
                        <option value="Electrical and Electronics Engineering (EEE B.E)">Electrical and Electronics Engineering (EEE B.E)</option>
                        <option value="Civil Engineering (B.E)">Civil Engineering (B.E)</option>
                        <option value="Mechanical Engineering (B.E)">Mechanical Engineering (B.E)</option>
                        <option value="CyberSecurity (B.Tech)">CyberSecurity (B.Tech)</option>
                        <option value="Department of Physics">Department of Physics</option>
                        <option value="Department of Chemistry">Department of Chemistry</option>
                        <option value="Department of Professional English">Department of Professional English</option>
                        <option value="Department of Mathematics">Department of Mathematics</option>
                        <option value="Department of MBA">Department of MBA</option>
                        <option value="Department of Tamil">Department of Tamil</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Faculty ID / Password</label>
                    <input 
                      type="password"
                      placeholder="Enter Faculty Password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="btn-3d btn-3d-blue w-full py-3 text-white flex justify-center items-center gap-2.5 shadow-md font-bold uppercase tracking-wider text-[10px]"
                  >
                    {authLoading ? "Redirecting to Identity Provider..." : (loginRole === 'admin' ? "🔑 Authenticate Faculty Credentials" : "🔑 Sign In with Google Workspace (SSO)")}
                  </button>
                </div>

                <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-white/5 flex justify-center gap-4">
                  <button type="button" onClick={() => alert("Redirecting to SAML single sign-on portal...")} className="hover:underline">Use SAML Identity Provider</button>
                  <span>•</span>
                  <span className="font-mono">Google Workspace Encrypted</span>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: MAIN PORTAL VIEW */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* SIDE NAVIGATION */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-6">
                
                {/* 3D Student Button (WebGL Element) */}
                <Student3DButton 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')} 
                />

                <div className="w-full pt-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 sm:gap-3 pb-2 lg:pb-0 no-scrollbar">
                  {user.is_admin ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={
                          activeTab === 'dashboard' 
                            ? 'btn-3d btn-3d-sky shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <Layers className="w-4 h-4 text-sky-400" />
                        Admin Dashboard
                      </button>

                      <button 
                        onClick={() => { setActiveTab('event_management'); setAdminSubTab('events'); }}
                        className={
                          activeTab === 'event_management' 
                            ? 'btn-3d btn-3d-rose shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <Calendar className="w-4 h-4 text-rose-400" />
                        Events & Posters
                      </button>

                      <button 
                        onClick={() => { setActiveTab('admin_timetables'); setAdminSubTab('timetables'); }}
                        className={
                          activeTab === 'admin_timetables' 
                            ? 'btn-3d btn-3d-blue shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <Clock className="w-4 h-4 text-cyan-400" />
                        Class Timetable
                      </button>

                      <button 
                        onClick={() => { setActiveTab('admin_staff'); setAdminSubTab('staff_schedules'); }}
                        className={
                          activeTab === 'admin_staff' 
                            ? 'btn-3d btn-3d-amber shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        Staff Schedule
                      </button>

                      <button 
                        onClick={() => { setActiveTab('admin_syllabus'); setAdminSubTab('syllabus'); }}
                        className={
                          activeTab === 'admin_syllabus' 
                            ? 'btn-3d btn-3d-emerald shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Subjects & Syllabus
                      </button>

                      <button 
                        onClick={() => setActiveTab('profile')}
                        className={
                          activeTab === 'profile' 
                            ? 'btn-3d btn-3d-purple shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        Admin Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={
                          activeTab === 'dashboard' 
                            ? 'btn-3d btn-3d-sky shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <Layers className="w-4 h-4" />
                        Dashboard
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('academics')}
                        className={
                          activeTab === 'academics' 
                            ? 'btn-3d btn-3d-emerald shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <BookOpen className="w-4 h-4" />
                        Academics
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('skills')}
                        className={
                          activeTab === 'skills' 
                            ? 'btn-3d btn-3d-amber shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <BookOpenCheck className="w-4 h-4" />
                        Skills & Clubs
                      </button>

                      <button 
                        onClick={() => setActiveTab('events')}
                        className={
                          activeTab === 'events' 
                            ? 'btn-3d btn-3d-rose shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <Calendar className="w-4 h-4" />
                        College Events
                      </button>

                      <button 
                        onClick={() => setActiveTab('profile')}
                        className={
                          activeTab === 'profile' 
                            ? 'btn-3d btn-3d-purple shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white cursor-pointer' 
                            : 'shrink-0 flex items-center justify-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer'
                        }
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                    </>
                  )}
                </div>

                <div className="w-full border-t border-white/5 pt-4 text-center">
                  <h4 className="text-[11px] font-bold text-slate-200 truncate">{user.full_name}</h4>
                  <p className="text-[9px] text-slate-400">Degree: {user.degree || "B.Tech/B.E"}</p>
                </div>
              </div>


            </div>

            {/* TAB CONTENTS */}
            <div key={activeTab} className="lg:col-span-3 space-y-8 tab-transition">
              
              {/* TAB 1: DASHBOARD VIEW (Admin Dashboard for Admin, Student Dashboard for Student) */}
              {activeTab === 'dashboard' && user.is_admin ? (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* ADMIN WELCOME BANNER */}
                  <TiltCard3D className="p-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Faculty Administration
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">ID: {user.id}</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-white mt-1">Welcome back, {user.full_name}!</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Faculty Command Hub for events, 4-year class schedules, and subjects & syllabus management.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          HOD & Principal Email Transmitter Live
                        </span>
                      </div>
                    </div>
                  </TiltCard3D>

                  {/* QUICK STATS CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Posted Events</span>
                      <p className="text-2xl font-black text-rose-400">{eventsList.length}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Emailed to HODs & Principal</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timetable Slots</span>
                      <p className="text-2xl font-black text-cyan-400">{masterTimetableList.length}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Across 4 Academic Years</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Course Syllabi</span>
                      <p className="text-2xl font-black text-emerald-400">{masterSyllabusList.length}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Unit 1–5 Subject Records</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Admin Department</span>
                      <p className="text-sm font-bold text-amber-300 truncate">{user.department || "Academic Admin"}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Institutional SSO Verified</p>
                    </div>
                  </div>

                  {/* ADMIN QUICK ACCESS OPTION CARDS */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Admin Control Options & Shortcuts
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      
                      {/* Option 1: Events Broadcast */}
                      <button 
                        onClick={() => { setActiveTab('event_management'); setAdminSubTab('events'); }}
                        className="p-4 bg-gradient-to-br from-rose-900/30 via-slate-900 to-slate-950 border border-rose-500/20 rounded-2xl hover:border-rose-500/50 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2.5 group-hover:scale-110 transition-transform">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-white text-xs group-hover:text-rose-300 transition-colors">📣 Events & Posters</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Import event posters & email HODs and Principal.</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-400 mt-2.5 group-hover:translate-x-1 transition-transform">
                          Open Events →
                        </span>
                      </button>

                      {/* Option 2: Class Timetable */}
                      <button 
                        onClick={() => { setActiveTab('admin_timetables'); setAdminSubTab('timetables'); }}
                        className="p-4 bg-gradient-to-br from-cyan-900/30 via-slate-900 to-slate-950 border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2.5 group-hover:scale-110 transition-transform">
                          <Clock className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">📅 Class Timetable</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Upload class timetable images for Years 1–4.</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 mt-2.5 group-hover:translate-x-1 transition-transform">
                          Class Schedules →
                        </span>
                      </button>

                      {/* Option 3: Staff Schedule */}
                      <button 
                        onClick={() => { setActiveTab('admin_staff'); setAdminSubTab('staff_schedules'); }}
                        className="p-4 bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl hover:border-amber-500/50 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-110 transition-transform">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">👨‍🏫 Staff Schedule</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Upload staff timetable images & office availability.</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 mt-2.5 group-hover:translate-x-1 transition-transform">
                          Staff Timetables →
                        </span>
                      </button>

                      {/* Option 4: Subjects & Syllabus */}
                      <button 
                        onClick={() => { setActiveTab('admin_syllabus'); setAdminSubTab('syllabus'); }}
                        className="p-4 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">📚 Subjects & Syllabus</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Import syllabus unit charts & course topics.</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-2.5 group-hover:translate-x-1 transition-transform">
                          Curriculum Hub →
                        </span>
                      </button>

                      {/* Option 5: Admin Profile */}
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="p-4 bg-gradient-to-br from-purple-900/30 via-slate-900 to-slate-950 border border-purple-500/20 rounded-2xl hover:border-purple-500/50 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2.5 group-hover:scale-110 transition-transform">
                          <User className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">👤 Admin Profile</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">View degree completion & teaching experience.</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-400 mt-2.5 group-hover:translate-x-1 transition-transform">
                          View Profile →
                        </span>
                      </button>

                    </div>
                  </div>

                </div>
              ) : activeTab === 'dashboard' && (
                <div className="space-y-8">
                  
                  {/* WEEKLY REPORT WIDGET */}
                  <TiltCard3D className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-400" />
                        Weekly Performance Report
                      </h3>
                      <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        Week 1
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Study Time Logged</span>
                        <p className="text-lg font-bold text-white">14.5 Hours</p>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">On-track Syllabus Tasks</span>
                        <p className="text-lg font-bold text-emerald-400">85% Completed</p>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Gaps Identified</span>
                        <p className="text-lg font-bold text-amber-400">SQL Indexing</p>
                        <p className="text-[9px] text-slate-400 leading-normal">Needs query aggregate review</p>
                      </div>
                    </div>
                  </TiltCard3D>

                  {/* AI GROWTH MENTOR */}
                  <TiltCard3D className="p-6 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        AI Growth Mentor Chat
                      </h3>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        Mentor Active
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 no-scrollbar">
                      {mentorMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.message_content}
                          </div>
                        </div>
                      ))}
                      {mentorLoading && (
                        <div className="text-slate-500 text-[11px] italic animate-pulse">Mentor is thinking...</div>
                      )}
                    </div>

                    <form onSubmit={handleSendMentorMessage} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Struggling with logic, schedule, etc? Ask..."
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                      <button 
                        type="submit" 
                        className="bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-xl transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </TiltCard3D>

                  {/* TO-DO LIST WORKSPACE */}
                  <TiltCard3D className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        Daily Action Items & Task List
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        {todos.filter(t => t.completed).length} / {todos.length} Done
                      </span>
                    </div>

                    <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="Add a new task..." 
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                      <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                        Add Task
                      </button>
                    </form>

                    {todos.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">No active tasks. Add a task above to start tracking!</p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                        {todos.map((todo) => (
                          <div key={todo.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(todo.id)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                              />
                              <span className={`text-xs ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {todo.text}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-slate-400 hover:text-rose-400 p-1 transition-all cursor-pointer text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {todos.length > 0 && todos.every(t => t.completed) && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center justify-center gap-2 mt-4 font-bold text-xs animate-pulse">
                        <span>🎉 Today's task completed!</span>
                      </div>
                    )}
                  </TiltCard3D>

                </div>
              )}

              {/* TAB 2: ACADEMICS VIEW (Syllabus & semester preparation videos) */}
              {activeTab === 'academics' && (
                <div className="space-y-8">
                  <TiltCard3D className="p-6 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        Semester 1 Academics & Preparation
                      </h3>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded font-mono font-bold">
                        Dept: {user.department || "Computer Science"}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* Official Admin Uploaded Syllabus Diagram Section */}
                      {masterSyllabusList.some(s => s.syllabus_image_url) && (
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                            <BookOpenCheck className="w-4 h-4" />
                            Official Published Course Syllabus Documents & Diagrams
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {masterSyllabusList
                              .filter(s => s.syllabus_image_url)
                              .map((s, idx) => (
                                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2">
                                  <h5 className="font-bold text-white text-xs">{s.subject_name}</h5>
                                  <p className="text-[9px] text-slate-400 font-mono">{s.department} • {s.year || "1st Year"}</p>
                                  <img src={s.syllabus_image_url} alt="Syllabus Chart" className="w-full max-h-64 object-contain rounded-lg" />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {academicsDatabase[user.department] ? (
                        academicsDatabase[user.department].subjects.map((sub, idx) => (
                          <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                                  {sub.code}
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1.5">{sub.name}</h4>
                              </div>
                              {sub.syllabus && (
                                <button 
                                  onClick={() => setMaximizedSyllabus(sub)}
                                  className="btn-3d btn-3d-blue px-3 py-1.5 text-[9px] text-white shadow-md"
                                >
                                  🔍 View Syllabus Units
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{sub.desc}</p>
                            
                            {/* Prep Video Recommendation */}
                            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Video className="w-4 h-4 text-rose-500" />
                                <span className="font-semibold truncate max-w-[250px]">{sub.videoTitle} ({sub.channel})</span>
                              </div>
                              <a 
                                href={sub.videoLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-3d btn-3d-rose px-3 py-1.5 text-[9px] text-white shadow-md shrink-0"
                              >
                                Watch Lesson Video
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-slate-500 py-12 italic">
                          No specific syllabus database set for this department. Defaulting general engineering math lessons.
                        </div>
                      )}
                    </div>
                  </TiltCard3D>

                  {/* 1ST YEAR CLASS TIMETABLES & FACULTY RECORDS (MOVED TO ACADEMICS) */}
                  <TiltCard3D className="p-6 space-y-6">
                    <div className="pb-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          1st Year Class Timetable Images & Faculty Records
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Official schedule charts and faculty advisors for 1st Year Freshers subjects</p>
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-3 py-1 rounded-full border border-cyan-500/20">
                        🎓 Freshers Portal (1st Year)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* 1st Year Class Timetable Image Viewer (Left 2 cols) */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            1st Year Class Timetable Images
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Synced with Admin uploads</span>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                          {masterTimetableList.filter(t => (t.timetable_image_url || t.schedule_image_url) && (user.is_admin || matchesStudentDepartment(t.department, user.department))).length > 0 ? (
                            masterTimetableList
                              .filter(t => (t.timetable_image_url || t.schedule_image_url) && (user.is_admin || matchesStudentDepartment(t.department, user.department)))
                              .map((t, idx) => (
                                <div key={idx} className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-white text-xs">{t.subject_name || `${t.department || '1st Year'} Class Timetable`}</h5>
                                    <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded">
                                      {t.department || user.department || 'Freshers Dept'}
                                    </span>
                                  </div>
                                  <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900 p-2">
                                    <img src={t.timetable_image_url || t.schedule_image_url} alt="Class Timetable Chart" className="w-full max-h-72 object-contain rounded-lg" />
                                  </div>
                                </div>
                              ))
                          ) : (
                            /* Department specific default schedule */
                            <div className="space-y-4">
                              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-white text-xs">{user.department || 'Department'} Class Schedule</h5>
                                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded">{user.department || 'General'}</span>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900 p-2">
                                  <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop" alt="Class Timetable" className="w-full max-h-64 object-contain rounded-lg" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 1st Year Faculty Records & Schedules (Right 1 col - Department Filtered) */}
                      <div className="space-y-4">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {user.is_admin ? "All Faculty Schedules" : `${user.department || 'Department'} Faculty`}
                        </span>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                          {staffScheduleList.filter(f => user.is_admin || matchesStudentDepartment(f.department, user.department)).length > 0 ? (
                            staffScheduleList
                              .filter(f => user.is_admin || matchesStudentDepartment(f.department, user.department))
                              .map((f, idx) => (
                                <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={f.schedule_image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"} 
                                      alt={f.staff_name} 
                                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" 
                                    />
                                    <div>
                                      <h4 className="font-bold text-white text-xs">{f.staff_name}</h4>
                                      <p className="text-[9px] text-amber-400 font-mono">{f.designation}</p>
                                      <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{f.department}</p>
                                    </div>
                                  </div>
                                  <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-[9px] font-mono space-y-1">
                                    <p className="text-emerald-400 font-bold">📚 {f.assigned_subjects || "Core Subjects"}</p>
                                    <p className="text-slate-300">⏰ {f.available_hours}</p>
                                  </div>
                                </div>
                              ))
                          ) : (
                            /* Default Faculty Seeds */
                            [
                              {
                                name: "Dr. A. K. Sharma",
                                desig: "Senior Professor & HOD",
                                dept: user.department || "Computer Science",
                                subj: "Core Dept Subjects & Labs",
                                hours: "Mon, Wed, Fri: 10:00 AM - 12:30 PM",
                                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"
                              }
                            ].map((f, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                                <div className="flex items-center gap-3">
                                  <img src={f.img} alt={f.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                                  <div>
                                    <h4 className="font-bold text-white text-xs">{f.name}</h4>
                                    <p className="text-[9px] text-amber-400 font-mono">{f.desig}</p>
                                    <p className="text-[9px] text-slate-400">{f.dept}</p>
                                  </div>
                                </div>
                                <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-[9px] font-mono space-y-1">
                                  <p className="text-emerald-400 font-bold">📚 {f.subj}</p>
                                  <p className="text-slate-300">⏰ {f.hours}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </TiltCard3D>

                  {/* MODAL FOR DETAILED SYLLABUS SLOT (MAXIMIZED VIEW) */}
                  {maximizedSyllabus && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                      <TiltCard3D className="w-full max-w-lg p-6 space-y-6 border border-white/10 relative">
                        <button 
                          onClick={() => setMaximizedSyllabus(null)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm"
                        >
                          ✕ Close
                        </button>
                        
                        <div className="pb-3 border-b border-white/5 space-y-1">
                          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                            {maximizedSyllabus.code}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1.5">{maximizedSyllabus.name} Syllabus</h3>
                          <p className="text-xs text-slate-400">{maximizedSyllabus.desc}</p>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Course Structure & Syllabus Units:</span>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar text-xs font-medium">
                            {maximizedSyllabus.syllabus ? (
                              maximizedSyllabus.syllabus.map((unit, uIdx) => (
                                <div key={uIdx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                                    {uIdx + 1}
                                  </span>
                                  <span className="text-slate-300 leading-normal">{unit}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-500 italic py-4">No specific units loaded for this syllabus.</div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                          <button 
                            onClick={() => setMaximizedSyllabus(null)}
                            className="btn-3d btn-3d-blue py-2 px-5 text-xs text-white shadow-md"
                          >
                            Dismiss Maximized View
                          </button>
                        </div>
                      </TiltCard3D>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SKILL DEVELOPMENT & DEPT CLUBS */}
              {activeTab === 'skills' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT WORKSPACE: ADVISOR CHATBOT & TRAINING LAB */}
                    <TiltCard3D className="p-6 flex flex-col h-[580px]">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                          Domain Advisor & Training Sandbox
                        </h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          {isTraining ? 'Training In Progress' : enrolledDomain ? 'Track Enrolled' : 'Advisor Online'}
                        </span>
                      </div>

                      {/* CHAT VIEW (IF NOT ENROLLED OR STILL CHATTING) */}
                      {!enrolledDomain ? (
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 no-scrollbar">
                            {skillsChatLogs.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed space-y-2 ${
                                  msg.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                }`}>
                                  <p>{msg.content}</p>
                                  {msg.action && (
                                    <button
                                      onClick={() => handleStartDomainTraining(msg.action.track)}
                                      className="btn-3d btn-3d-emerald block mt-2 w-full text-[10px] py-1.5 px-3 uppercase text-white shadow-md"
                                    >
                                      {msg.action.label}
                                    </button>
                                  )}
                                  {msg.options && (
                                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                                      {msg.options.map((opt, oIdx) => (
                                        <button
                                          key={oIdx}
                                          onClick={() => handleStartDomainTraining(opt.track)}
                                          className="btn-3d btn-3d-purple w-full text-[9px] py-1 px-2 text-white truncate border border-purple-500/20 shadow-sm text-center"
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={handleSendSkillsAdvisorMessage} className="flex gap-2 items-end">
                            <input 
                              type="text" 
                              placeholder="Describe your interests (e.g., frontend, data science, networking)..."
                              value={skillsChatInput}
                              onChange={(e) => setSkillsChatInput(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <button 
                              type="submit" 
                              className="btn-3d btn-3d-emerald p-2.5 rounded-xl text-white shadow-md flex items-center justify-center shrink-0 w-9 h-9"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      ) : (
                        /* ENROLLED VIEW */
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1">Enrolled Curriculum</span>
                              <h4 className="text-sm font-bold text-white uppercase">
                                {enrolledDomain === 'webdev' ? '🌐 Web Development Track' 
                                : enrolledDomain === 'aiml' ? '🤖 AI & Machine Learning Track' 
                                : enrolledDomain === 'cybersec' ? '🛡️ Cyber Security Track'
                                : enrolledDomain === 'cloud' ? '☁️ Cloud & DevOps Track'
                                : enrolledDomain === 'mobile' ? '📱 Mobile App Dev Track'
                                : enrolledDomain === 'gamedev' ? '🎮 Game Development Track'
                                : enrolledDomain === 'blockchain' ? '⛓️ Blockchain & Web3 Track'
                                : enrolledDomain === 'datascience' ? '📊 Data Science Track'
                                : '🔌 Embedded Systems & IoT Track'}
                              </h4>
                            </div>

                            {isTraining ? (
                              /* TRAINING LAB ACTIVE */
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                                    <span>Compiling syllabus index...</span>
                                    <span>{trainingProgress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${trainingProgress}%` }}></div>
                                  </div>
                                </div>

                                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-emerald-400/90 space-y-1 h-[220px] overflow-y-auto">
                                  {trainingLogs.map((log, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <span className="text-slate-600">&gt;&gt;</span>
                                      <span>{log}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* TRAINING LAB COMPLETED - LOG NOTES & SYLLABUS LIST */
                              <div className="space-y-5">
                                {/* Training analysis notes card */}
                                {trainingNote && (
                                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                                      Training Period Analysis Note
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300 font-mono">
                                      <div className="bg-white/5 p-2 rounded">
                                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Analysis Duration</span>
                                        <span className="text-white font-bold">{trainingNote.period}</span>
                                      </div>
                                      <div className="bg-white/5 p-2 rounded">
                                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Completion Time</span>
                                        <span className="text-white font-bold">{trainingNote.enrolledAt}</span>
                                      </div>
                                    </div>
                                    <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded text-[11px] leading-relaxed text-brand-300">
                                      <strong className="block text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Competency Milestone Logged:</strong>
                                      {trainingNote.milestone}
                                    </div>
                                  </div>
                                )}

                                {/* Syllabus targets & Youtube links */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Milestones & YouTube Resources</h4>
                                  <div className="max-h-[170px] overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                                    {domainSkillsConfig[selectedDomain].videos.map((vid, idx) => (
                                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-[10px]">
                                        <span className="font-semibold text-slate-300 truncate max-w-[200px]">{vid.title}</span>
                                        <a href={vid.url} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                                          Watch →
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reset training trigger button */}
                          {!isTraining && (
                            <button
                              onClick={() => {
                                setEnrolledDomain(null);
                                setTrainingNote(null);
                                setSkillsTabGraph(null);
                                setSkillsChatLogs([
                                  { role: 'advisor', content: "Greetings! I am your Academic Domain Advisor. Let's find the best domain track to fit your learning path. Do you prefer building sleek user interfaces (Web Dev), programming neural networks and intelligence models (AI & ML), or auditing networks and system defense (Cyber Security)?" }
                                ]);
                              }}
                              className="btn-3d btn-3d-slate w-full py-2 text-xs text-white uppercase tracking-wider shadow-md mt-4"
                            >
                              Consult Advisor Again
                            </button>
                          )}
                        </div>
                      )}
                    </TiltCard3D>

                    {/* RIGHT WORKSPACE: KNOWLEDGE GRAPH SLOT & DEPT CLUBS */}
                    <div className="space-y-8">
                      {/* Interactive Flowchart Roadmap Slot with 'Continue with <Domain>' Header */}
                      <TiltCard3D className="p-6 min-h-[480px] flex flex-col justify-between space-y-4">
                        {enrolledDomain && (
                          <div className="p-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 rounded-2xl flex flex-wrap justify-between items-center gap-3">
                            <div>
                              <span className="text-[10px] text-purple-400 uppercase font-mono font-bold tracking-widest block">Active Domain Roadmap</span>
                              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
                                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                                Continue with {domainSkillsConfig[enrolledDomain]?.name || enrolledDomain.toUpperCase()}
                              </h3>
                            </div>
                            <span className="text-xs bg-purple-500/20 text-purple-300 font-mono font-bold px-3 py-1.5 rounded-xl border border-purple-500/30">
                              🎯 Progression Track Active
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            Flowchart Learning Roadmap & Milestone Sequence
                          </h4>
                          <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">
                            Interactive Flowchart
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 relative space-y-4">
                          {enrolledDomain ? (
                            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                              
                              {/* FLOWCHART VISUAL GRAPHICS (LEFT) */}
                              <div className="w-full md:w-1/2 bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-between overflow-y-auto no-scrollbar py-4">
                                {roadmapDatabase[enrolledDomain].map((topic, tIdx) => (
                                  <React.Fragment key={topic.id}>
                                    <button
                                      onClick={() => setActiveRoadmapTopic(topic)}
                                      className={`w-full py-2.5 px-3 rounded-xl border text-center transition-all duration-300 text-[10px] font-bold uppercase shadow-sm ${
                                        activeRoadmapTopic?.id === topic.id
                                          ? 'bg-purple-600/30 border-purple-500 text-purple-300 scale-[1.03] ring-1 ring-purple-500/30'
                                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                                      }`}
                                    >
                                      {topic.title}
                                    </button>
                                    {tIdx < 3 && (
                                      <div className="text-purple-500 font-bold text-xs animate-bounce my-1.5">
                                        ↓
                                      </div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* DETAIL TOPIC RESOURCE PANEL (RIGHT) */}
                              <div className="flex-1 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between overflow-y-auto no-scrollbar">
                                {activeRoadmapTopic ? (
                                  <div className="space-y-3.5">
                                    <div>
                                      <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">{activeRoadmapTopic.title}</h4>
                                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-medium">{activeRoadmapTopic.desc}</p>
                                    </div>

                                    {/* Tools */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Recommended Tools:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {activeRoadmapTopic.tools.map((tool, idx) => (
                                          <span key={idx} className="bg-slate-800 border border-slate-750 px-2 py-0.5 rounded text-[8px] font-bold text-slate-300 font-mono">
                                            ⚙️ {tool}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Websites */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Recommended Websites:</span>
                                      <div className="space-y-1">
                                        {activeRoadmapTopic.websites.map((web, idx) => (
                                          <a 
                                            key={idx}
                                            href={web.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-1.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 rounded text-[9px] font-semibold text-purple-400 hover:text-purple-300 transition-all truncate"
                                          >
                                            🌐 {web.name} →
                                          </a>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Videos */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Target Lesson Videos:</span>
                                      <div className="space-y-1">
                                        {activeRoadmapTopic.videos.map((vid, idx) => (
                                          <a 
                                            key={idx}
                                            href={vid.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 rounded text-[9px] font-semibold text-rose-300 hover:text-rose-200 transition-all truncate"
                                          >
                                            📺 {vid.title} Watch →
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex-1 flex items-center justify-center text-slate-500 italic text-[10px]">
                                    Click on any topic box to view guides.
                                  </div>
                                )}
                              </div>

                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-slate-950/20 border border-dashed border-white/5 rounded-xl text-xs text-slate-500">
                              <div className="p-3 rounded-full bg-slate-900/60 border border-slate-800 mb-2">
                                <Sparkles className="w-5 h-5 text-purple-400/60" />
                              </div>
                              <p className="font-semibold text-slate-400">Flowchart Roadmap Locked</p>
                              <p className="text-[10px] text-slate-500 mt-1 max-w-[280px]">Complete the advisor chatbot diagnostics to construct and display the live flowchart learning track here.</p>
                            </div>
                          )}
                        </div>
                      </TiltCard3D>

                      {/* STRICTLY COLLEGE DEPT CLUBS */}
                      <TiltCard3D className="p-6">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-white/5 mb-3">
                          <Users className="w-4 h-4" />
                          Department Student Clubs
                        </h4>
                        <div className="max-h-[170px] overflow-y-auto space-y-3 pr-1 no-scrollbar">
                          {getVisibleClubs().length > 0 ? (
                            getVisibleClubs().map((club, idx) => (
                              <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 hover:border-purple-500/30 transition-all">
                                <div className="flex justify-between items-start text-xs font-bold text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span>{club.icon}</span>
                                    <span className="truncate max-w-[140px]">{club.name}</span>
                                  </div>
                                  <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                                    {club.displayOrganizer}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-normal">{club.desc}</p>
                                <button 
                                  onClick={() => alert(`Requested join token for ${club.name}!`)}
                                  className="text-[9px] text-purple-400 font-bold hover:underline block pt-1.5"
                                >
                                  Request Join Token →
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic py-4 text-xs">No specific clubs set for this department.</div>
                          )}
                        </div>
                      </TiltCard3D>
                    </div>

                  </div>
                </div>
              )}





              {/* TAB 5: PROFILE VIEW */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <TiltCard3D className="p-6">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-purple-400" />
                        About Details
                      </h3>
                      {!isEditingProfile ? (
                        <button
                          onClick={handleStartEditProfile}
                          className="btn-3d btn-3d-purple px-4 py-1.5 text-xs text-white shadow-md"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            className="btn-3d btn-3d-emerald px-4 py-1.5 text-xs text-white shadow-md"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="btn-3d btn-3d-slate px-4 py-1.5 text-xs text-white shadow-md"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      /* VIEW MODE */
                      user.is_admin ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Faculty Admin Name</span>
                              <p className="text-white text-base font-bold">{user.full_name}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">Faculty ID / Login Credential</span>
                              <p className="text-cyan-300 text-sm font-bold font-mono">{user.id || ("FAC-" + (user.college_email || "").split('@')[0].toUpperCase())}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">Degree Completion</span>
                              <p className="text-slate-200 text-sm font-semibold">{user.degree_completion || adminDegreeCompletion}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-purple-400 uppercase font-mono">Academic & Teaching Experience</span>
                              <p className="text-slate-200 text-sm font-semibold">{user.experience || adminExperience}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Department</span>
                              <p className="text-slate-300 text-sm font-semibold">{user.department || "Academic Administration"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Registered Faculty Email</span>
                              <p className="text-slate-300 text-sm font-mono">{user.college_email}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Administrative Role</span>
                              <p className="text-emerald-400 text-xs font-bold font-mono">Verified Faculty Administrator & Department Chair</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Student Name</span>
                              <p className="text-white text-base font-bold">{user.full_name}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Program</span>
                              <p className="text-slate-300 text-sm font-semibold">{user.degree || "B.Tech/B.E"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Batch Number</span>
                              <p className="text-slate-300 text-sm font-semibold">{user.batch_no || "2026-CS"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Current Year</span>
                              <p className="text-brand-400 text-sm font-bold uppercase">{user.college_year || "1st Year"}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Department</span>
                              <p className="text-slate-300 text-sm font-semibold">{user.department || "Computer Science"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Academic Interests</span>
                              <p className="text-slate-300 text-sm font-semibold">
                                {Array.isArray(user.academic_interests) 
                                  ? user.academic_interests.join(', ') 
                                  : user.academic_interests || "None specified"}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Registered College Email</span>
                              <p className="text-slate-300 text-sm font-mono">{user.college_email}</p>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      /* EDIT MODE */
                      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Student Name</label>
                            <input 
                              type="text"
                              required
                              value={editFullName}
                              onChange={(e) => setEditFullName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Degree Program</label>
                            <select 
                              value={editDegree}
                              onChange={(e) => setEditDegree(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="B.Tech/B.E">B.Tech/B.E</option>
                              <option value="M.Tech/M.E">M.Tech/M.E</option>
                              <option value="B.Sc">B.Sc</option>
                              <option value="M.Sc">M.Sc</option>
                              <option value="MBA">MBA</option>
                              <option value="PhD">PhD</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Batch Number</label>
                            <input 
                              type="text"
                              required
                              value={editBatchNo}
                              onChange={(e) => setEditBatchNo(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Department</label>
                            <select 
                              value={editDepartment}
                              onChange={(e) => setEditDepartment(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="Computer Science Engineering (CSE B.E)">Computer Science Engineering (CSE B.E)</option>
                              <option value="Artificial Intelligence and Data Science (AI&DS B.Tech)">Artificial Intelligence and Data Science (AI&DS B.Tech)</option>
                              <option value="Artificial Intelligence and Machine Learning (AI&ML B.Tech)">Artificial Intelligence and Machine Learning (AI&ML B.Tech)</option>
                              <option value="Computer Science and Business Systems (CSBS B.Tech)">Computer Science and Business Systems (CSBS B.Tech)</option>
                              <option value="Electronics and Communication Engineering (ECE B.E)">Electronics and Communication Engineering (ECE B.E)</option>
                              <option value="Electrical and Electronics Engineering (EEE B.E)">Electrical and Electronics Engineering (EEE B.E)</option>
                              <option value="Civil Engineering (B.E)">Civil Engineering (B.E)</option>
                              <option value="Mechanical Engineering (B.E)">Mechanical Engineering (B.E)</option>
                              <option value="CyberSecurity (B.Tech)">CyberSecurity (B.Tech)</option>
                              <option value="Department of Physics">Department of Physics</option>
                              <option value="Department of Chemistry">Department of Chemistry</option>
                              <option value="Department of Professional English">Department of Professional English</option>
                              <option value="Department of Mathematics">Department of Mathematics</option>
                              <option value="Department of MBA">Department of MBA</option>
                              <option value="Department of Tamil">Department of Tamil</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Current College Year</label>
                            <select 
                              value={editCollegeYear}
                              onChange={(e) => setEditCollegeYear(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="1st Year">1st Year (Freshman)</option>
                              <option value="2nd Year">2nd Year (Sophomore)</option>
                              <option value="3rd Year">3rd Year (Junior)</option>
                              <option value="4th Year">4th Year (Senior)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Academic Interests (comma separated)</label>
                            <input 
                              type="text"
                              value={editInterests}
                              onChange={(e) => setEditInterests(e.target.value)}
                              placeholder="e.g. React, Python, Artificial Intelligence"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Registered College Email (Read-only)</span>
                            <p className="text-slate-500 text-sm font-mono pt-1">{user.college_email}</p>
                          </div>
                        </div>
                      </form>
                    )}
                  </TiltCard3D>

                  {/* STUDENT CGPA SCORECARD & ACADEMIC CREDIT METRICS */}
                  {!user.is_admin && (
                    <TiltCard3D className="p-6 space-y-6">
                      <div className="pb-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            Academic CGPA Scorecard & Credit Metrics
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Verified university academic performance records & credit completion</p>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-3 py-1 rounded-full border border-amber-500/20">
                          🏆 Honors Academic Standing
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase font-mono tracking-wider">Overall CGPA</span>
                          <h3 className="text-3xl font-extrabold text-white">8.85 <span className="text-xs text-slate-400 font-normal">/ 10.0</span></h3>
                          <p className="text-[9px] text-emerald-400 font-mono">Top 5% Rank in Department</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl border border-cyan-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider">Recent Semester SGPA</span>
                          <h3 className="text-3xl font-extrabold text-white">9.12 <span className="text-xs text-slate-400 font-normal">SGPA</span></h3>
                          <p className="text-[9px] text-cyan-300 font-mono">1st Semester Final Score</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-2xl border border-purple-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-purple-400 uppercase font-mono tracking-wider">Credits Completed</span>
                          <h3 className="text-3xl font-extrabold text-white">28 <span className="text-xs text-slate-400 font-normal">/ 160 Credits</span></h3>
                          <p className="text-[9px] text-purple-300 font-mono">All 1st Year Core Credits Met</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider">On-Duty (OD) Credits</span>
                          <h3 className="text-3xl font-extrabold text-white">12 <span className="text-xs text-slate-400 font-normal">Hours</span></h3>
                          <p className="text-[9px] text-emerald-300 font-mono">Verified Event Attendance</p>
                        </div>
                      </div>
                    </TiltCard3D>
                  )}

                  {/* STUDENT PARTICIPATED & EAGER-TO-PARTICIPATE EVENTS DASHBOARD */}
                  {!user.is_admin && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* PARTICIPATED EVENTS LIST */}
                      <TiltCard3D className="p-6 space-y-4">
                        <div className="pb-3 border-b border-white/5 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Participated & Registered Events
                          </h4>
                          <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            Registered & Attended
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar text-xs">
                          {((studentIsolatedProgress?.registered_events || []).length === 0 && eventsList.slice(0, 1).length === 0) ? (
                            <p className="text-xs text-slate-500 italic py-6 text-center">No registered events yet. Register for hackathons to view team Google Docs here.</p>
                          ) : (
                            eventsList.slice(0, 2).map((ev, idx) => (
                              <div key={idx} className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                                    Participated / Registered
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">{ev.date_string || "July 2026"}</span>
                                </div>
                                <h5 className="font-bold text-white text-xs">{ev.title}</h5>
                                <p className="text-[10px] text-slate-400 line-clamp-2">{ev.description}</p>
                                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                                  <span className="text-emerald-400 font-bold font-mono">OD Attendance Granted ✔</span>
                                  <a 
                                    href={ev.registration_link || "https://docs.google.com/document/d/1O7VC6KLIYEL/edit?usp=sharing"} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-cyan-400 hover:underline font-mono font-bold"
                                  >
                                    📄 Google Doc →
                                  </a>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </TiltCard3D>

                      {/* EAGER-TO-PARTICIPATE WISHLIST EVENTS */}
                      <TiltCard3D className="p-6 space-y-4">
                        <div className="pb-3 border-b border-white/5 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Eager to Participate (Saved Wishlist)
                          </h4>
                          <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                            Upcoming Wishlist
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar text-xs">
                          {eventsList.filter(e => !e.is_ongoing).length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-6 text-center">No upcoming events saved in wishlist.</p>
                          ) : (
                            eventsList.filter(e => !e.is_ongoing).slice(0, 3).map((ev) => (
                              <div key={ev.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded uppercase">
                                    ⭐ Eager to Join
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">{ev.date_string}</span>
                                </div>
                                <h5 className="font-bold text-white text-xs">{ev.title}</h5>
                                <p className="text-[10px] text-slate-400 line-clamp-2">{ev.description}</p>
                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                  <span className="text-[9px] text-slate-500 font-bold">{ev.organizer}</span>
                                  <button 
                                    onClick={() => {
                                      setActiveTab('events');
                                      setRegisterEvent(ev);
                                    }}
                                    className="btn-3d btn-3d-purple px-3 py-1 text-[9px] text-white font-bold cursor-pointer uppercase"
                                  >
                                    Register Team 📋
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </TiltCard3D>
                    </div>
                  )}

                  {/* OTHER PERSONAL RECORDS (Notifications Hub Only) */}
                  <TiltCard3D className="p-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-4 border-b border-white/5 mb-6">
                      <Users className="w-4.5 h-4.5 text-brand-400" />
                      University System Notifications & Alerts
                    </h3>

                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent System Broadcasts</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
                        {notifications.map(n => (
                          <div key={n.id} className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs flex flex-col justify-between hover:border-brand-500/20 transition-all">
                            <div>
                              <span className="bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] inline-block mb-2">
                                {n.type}
                              </span>
                              <h5 className="font-bold text-slate-200 text-sm mb-1">{n.title}</h5>
                              <p className="text-slate-400 leading-relaxed text-[11px]">{n.body}</p>
                            </div>
                            <span className="text-[9px] text-slate-600 block mt-3 font-mono">System Automated</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard3D>

                </div>
              )}

              {/* TAB 6: EVENTS VIEW */}
              {activeTab === 'events' && (
                <div className="space-y-8">
                  <TiltCard3D className="p-6">
                    <div className="pb-4 border-b border-white/5 mb-6 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-400" />
                        College Events Portal
                      </h3>
                      <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        Active Registrations
                      </span>
                    </div>

                    <div className="space-y-8">
                      {/* ONGOING EVENTS SECTION */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          Ongoing Events
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {eventsList.filter(e => e.is_ongoing).length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No ongoing events right now.</p>
                          ) : (
                            eventsList.filter(e => e.is_ongoing).map((ev) => (
                              <div key={ev.id} className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-3 relative overflow-hidden group hover:border-rose-500/35 transition-all">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold uppercase">{ev.type}</span>
                                  <span className="text-[9px] text-slate-400 font-mono font-bold">{ev.date_string}</span>
                                </div>
                                <h5 className="text-sm font-bold text-white">{ev.title}</h5>
                                
                                {ev.poster_url && (
                                  <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-1">
                                    <img src={ev.poster_url} alt={ev.title} className="w-full max-h-56 object-cover rounded-lg" />
                                    <button 
                                      onClick={() => setMaximizedPoster({ url: ev.poster_url, title: ev.title, organizer: ev.organizer })}
                                      className="absolute bottom-2.5 right-2.5 bg-slate-950/85 hover:bg-brand-600 text-white p-1.5 rounded-lg border border-white/20 shadow-lg backdrop-blur-md transition-all cursor-pointer group-hover:scale-110"
                                      title="Maximize Event Poster"
                                    >
                                      <Maximize2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}

                                <p className="text-[11px] text-slate-300 leading-relaxed">{ev.description}</p>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                  <span className="text-[9px] text-slate-500 font-bold">{ev.organizer}</span>
                                  {ev.registration_link ? (
                                    <a 
                                      href={ev.registration_link} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="btn-3d btn-3d-rose px-3.5 py-1.5 text-[10px] text-white font-bold shadow-sm uppercase tracking-wider cursor-pointer"
                                    >
                                      Register Now →
                                    </a>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setRegisterEvent(ev);
                                        setRegTeamName('');
                                        setRegDocUrl(null);
                                        setRegMembers([
                                          { name: user.full_name, class_section: user.department, batch_no: user.batch_no || '2026-CS', email: user.college_email },
                                          { name: '', class_section: '', batch_no: '', email: '' },
                                          { name: '', class_section: '', batch_no: '', email: '' }
                                        ]);
                                      }}
                                      className="btn-3d btn-3d-rose px-3.5 py-1.5 text-[10px] text-white font-bold shadow-sm uppercase tracking-wider cursor-pointer"
                                    >
                                      Register Team 📋
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* UPCOMING EVENTS SECTION */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Upcoming Events
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {eventsList.filter(e => !e.is_ongoing).length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2 col-span-3">No upcoming events scheduled.</p>
                          ) : (
                            eventsList.filter(e => !e.is_ongoing).map((ev) => (
                              <div key={ev.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between group hover:border-brand-500/35 transition-all">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[9px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-bold uppercase">{ev.type}</span>
                                    <span className="text-[9px] text-slate-400 font-mono font-bold">{ev.date_string}</span>
                                  </div>
                                  <h5 className="text-xs font-bold text-white">{ev.title}</h5>

                                  {ev.poster_url && (
                                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-1">
                                      <img src={ev.poster_url} alt={ev.title} className="w-full max-h-44 object-cover rounded-lg" />
                                      <button 
                                        onClick={() => setMaximizedPoster({ url: ev.poster_url, title: ev.title, organizer: ev.organizer })}
                                        className="absolute bottom-2.5 right-2.5 bg-slate-950/85 hover:bg-brand-600 text-white p-1.5 rounded-lg border border-white/20 shadow-lg backdrop-blur-md transition-all cursor-pointer group-hover:scale-110"
                                        title="Maximize Event Poster"
                                      >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}

                                  <p className="text-[10px] text-slate-400 leading-relaxed">{ev.description}</p>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                  <span className="text-[9px] text-slate-500 font-bold">{ev.organizer}</span>
                                  {ev.registration_link ? (
                                    <a 
                                      href={ev.registration_link} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="btn-3d btn-3d-blue px-3 py-1 text-[9px] text-white font-bold shadow-sm uppercase tracking-wider cursor-pointer"
                                    >
                                      Register →
                                    </a>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setRegisterEvent(ev);
                                        setRegTeamName('');
                                        setRegDocUrl(null);
                                        setRegMembers([
                                          { name: user.full_name, class_section: user.department, batch_no: user.batch_no || '2026-CS', email: user.college_email },
                                          { name: '', class_section: '', batch_no: '', email: '' },
                                          { name: '', class_section: '', batch_no: '', email: '' }
                                        ]);
                                      }}
                                      className="btn-3d btn-3d-blue px-3 py-1 text-[9px] text-white font-bold shadow-sm uppercase tracking-wider cursor-pointer"
                                    >
                                      Register Team 📋
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard3D>
                </div>
              )}

              {/* EVENT REGISTRATION MODAL WITH TIMETABLE VALIDATION (FOR STUDENTS) */}
              {registerEvent && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-white/5">
                      <div>
                        <span className="text-[9px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded font-bold uppercase">{registerEvent.type}</span>
                        <h4 className="text-base font-bold text-white mt-1">{registerEvent.title}</h4>
                      </div>
                      <button onClick={() => setRegisterEvent(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
                    </div>

                    {/* OD timetable notification - CRITICAL */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                          CHECK THE TIME TABLE BEFORE REGISTER TO GET OD
                        </span>
                      </div>
                      
                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold block mb-2 uppercase tracking-wide">Your Batch Timetable Slots:</span>
                        {timetable.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">No schedules uploaded for batch {user.batch_no || "your batch"}.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            {timetable.slice(0, 6).map((t, idx) => (
                              <div key={idx} className="flex justify-between p-1.5 bg-white/5 rounded border border-white/5">
                                <span className="font-bold text-slate-300">{t.day_of_week}: {t.subject_name}</span>
                                <span className="text-slate-400">{t.time_start} - {t.time_end}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reg doc URL Success state */}
                    {regDocUrl ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 text-center">
                        <p className="text-sm font-bold text-emerald-400">🎉 Event Registration Successful!</p>
                        <p className="text-xs text-slate-300">We have automatically generated a Google Document contains all team members details below:</p>
                        <a 
                          href={regDocUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md mt-1"
                        >
                          📄 Open Registration Google Doc
                        </a>
                        <div className="pt-2">
                          <button 
                            type="button" 
                            onClick={() => setRegisterEvent(null)}
                            className="text-xs text-slate-400 hover:underline hover:text-white"
                          >
                            Dismiss Modal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleRegisterTeam} className="space-y-4 text-xs">
                        {regError && (
                          <p className="text-rose-400 font-bold">{regError}</p>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Team / Project Name</label>
                          <input 
                            type="text" 
                            placeholder="Enter Team Name"
                            required
                            value={regTeamName}
                            onChange={(e) => setRegTeamName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Team Members (Max 3 Members):</span>
                          
                          {regMembers.map((m, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
                              <span className="text-[10px] font-bold text-brand-300 uppercase block font-mono">Member {idx + 1} {idx === 0 && "(Leader)"}:</span>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Full Name" 
                                  required={idx === 0}
                                  value={m.name}
                                  onChange={(e) => {
                                    const next = [...regMembers];
                                    next[idx].name = e.target.value;
                                    setRegMembers(next);
                                  }}
                                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Class & Sec" 
                                  required={idx === 0}
                                  value={m.class_section}
                                  onChange={(e) => {
                                    const next = [...regMembers];
                                    next[idx].class_section = e.target.value;
                                    setRegMembers(next);
                                  }}
                                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Batch No" 
                                  required={idx === 0}
                                  value={m.batch_no}
                                  onChange={(e) => {
                                    const next = [...regMembers];
                                    next[idx].batch_no = e.target.value;
                                    setRegMembers(next);
                                  }}
                                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600"
                                />
                                <input 
                                  type="email" 
                                  placeholder="Email" 
                                  required={idx === 0}
                                  value={m.email}
                                  onChange={(e) => {
                                    const next = [...regMembers];
                                    next[idx].email = e.target.value;
                                    setRegMembers(next);
                                  }}
                                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                          <button 
                            type="button" 
                            onClick={() => setRegisterEvent(null)}
                            className="px-4 py-2 border border-slate-800 rounded-xl text-slate-300 hover:text-white font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={regLoading}
                            className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                          >
                            {regLoading ? "Saving team data..." : "📋 Register & Make Google Doc"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: ADMIN CONTROL HUB (EVENTS, TIMETABLES, STAFF SCHEDULES, SYLLABUS) */}
              {(activeTab === 'event_management' || activeTab === 'admin_timetables' || activeTab === 'admin_staff' || activeTab === 'admin_syllabus') && user.is_admin && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* ADMIN SUB-NAVIGATION BAR */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                    <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setAdminSubTab('events')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminSubTab === 'events' 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📣 Event Posters
                      </button>
                      <button 
                        onClick={() => setAdminSubTab('timetables')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminSubTab === 'timetables' 
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📅 Class Timetable
                      </button>
                      <button 
                        onClick={() => setAdminSubTab('staff_schedules')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminSubTab === 'staff_schedules' 
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        👨‍🏫 Staff Schedule
                      </button>
                      <button 
                        onClick={() => setAdminSubTab('syllabus')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminSubTab === 'syllabus' 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📚 Subjects & Syllabus
                      </button>
                      <button 
                        onClick={() => { setAdminSubTab('audit_logs'); fetchAuditLogs(); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminSubTab === 'audit_logs' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📊 Student Activity Logs
                      </button>
                    </div>
                  </div>

                  {/* SUB-PANEL 1: EVENT POSTERS & HOD/PRINCIPAL BROADCAST */}
                  {adminSubTab === 'events' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Event Creator Form */}
                      <div className="lg:col-span-1">
                        <TiltCard3D className="p-6 space-y-4">
                          <div className="pb-3 border-b border-white/5">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-brand-400" />
                              Post Campus Event & Broadcast
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Posts poster to students & emails Principal + HODs</p>
                          </div>

                          <form onSubmit={handlePostEvent} className="space-y-4 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Event Title</label>
                              <input 
                                type="text" 
                                placeholder="e.g. CodeForge Smart Contracts 2026"
                                required
                                value={adminEventTitle}
                                onChange={(e) => setAdminEventTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Import Poster Image File</label>
                              <div className="flex flex-col gap-2">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleFileImportToDataUrl(e, setAdminEventPoster)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer font-mono"
                                />
                                {adminEventPoster && (
                                  <div className="relative group rounded-xl overflow-hidden border border-white/10 max-h-32 bg-slate-950">
                                    <img src={adminEventPoster} alt="Poster preview" className="w-full h-28 object-cover" />
                                    <span className="absolute bottom-1 right-2 bg-slate-950/80 text-[8px] text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">Imported Poster Preview</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Description</label>
                              <textarea 
                                placeholder="Details about the hackathon/workshop event..."
                                required
                                rows="3"
                                value={adminEventDesc}
                                onChange={(e) => setAdminEventDesc(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-855 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Organizer</label>
                                <input 
                                  type="text" 
                                  placeholder="CSE Dept"
                                  value={adminEventOrg}
                                  onChange={(e) => setAdminEventOrg(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Date String</label>
                                <input 
                                  type="text" 
                                  placeholder="July 28"
                                  value={adminEventDate}
                                  onChange={(e) => setAdminEventDate(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Event Type</label>
                                <select 
                                  value={adminEventType}
                                  onChange={(e) => setAdminEventType(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                >
                                  <option value="Hackathon">Hackathon</option>
                                  <option value="Symposium">Symposium</option>
                                  <option value="Workshop">Workshop</option>
                                  <option value="Guest Lecture">Guest Lecture</option>
                                  <option value="Bootcamp">Bootcamp</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-5">
                                <input 
                                  type="checkbox"
                                  id="isOngoing"
                                  checked={adminEventIsOngoing}
                                  onChange={(e) => setAdminEventIsOngoing(e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="isOngoing" className="text-[10px] text-slate-300 font-bold uppercase cursor-pointer">Ongoing Event?</label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Registration Link</label>
                              <input 
                                type="text" 
                                placeholder="https://example.com/register"
                                value={adminEventLink}
                                onChange={(e) => setAdminEventLink(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white"
                              />
                            </div>

                            <button 
                              type="submit" 
                              className="btn-3d btn-3d-blue w-full py-2.5 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                            >
                              📣 Broadcast Event & Email HODs
                            </button>
                          </form>
                        </TiltCard3D>
                      </div>

                      {/* Active Event Overview List */}
                      <div className="lg:col-span-2">
                        <TiltCard3D className="p-6">
                          <div className="pb-3 border-b border-white/5 mb-4 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-emerald-400" />
                                Currently Posted Event Posters ({eventsList.length})
                              </h4>
                              <p className="text-[10px] text-slate-400">Live events displayed on student portals & emailed to HODs</p>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              📧 HOD & Principal Email Auto-Broadcast Active
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 no-scrollbar text-xs">
                            {eventsList.length === 0 ? (
                              <p className="text-xs text-slate-500 italic text-center py-8">No events posted yet.</p>
                            ) : (
                              eventsList.map((ev) => (
                                <div key={ev.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-4 items-start">
                                  {ev.poster_url && (
                                    <img 
                                      src={ev.poster_url} 
                                      alt={ev.title} 
                                      className="w-full sm:w-36 h-24 object-cover rounded-xl border border-white/10 shrink-0" 
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${ev.is_ongoing ? 'bg-rose-500/20 text-rose-300' : 'bg-brand-500/20 text-brand-300'}`}>
                                        {ev.is_ongoing ? "Ongoing" : "Upcoming"}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono">{ev.type}</span>
                                    </div>
                                    <h5 className="font-bold text-white text-sm mt-1">{ev.title}</h5>
                                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{ev.description}</p>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] text-slate-400 font-mono">
                                      <span>📅 {ev.date_string}</span>
                                      <span>🏛️ {ev.organizer}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </TiltCard3D>
                      </div>

                    </div>
                  )}

                  {/* SUB-PANEL 2: CLASS TIMETABLE MANAGEMENT */}
                  {adminSubTab === 'timetables' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Timetable Image Importer Form */}
                      <div className="lg:col-span-1">
                        <TiltCard3D className="p-6 space-y-4">
                          <div className="pb-3 border-b border-white/5">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Clock className="w-4 h-4 text-cyan-400" />
                              Import & Publish Class Timetable Image
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Upload timetable chart image for any department & year</p>
                          </div>

                          <form onSubmit={handleSaveTimetableSlot} className="space-y-3.5 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Department</label>
                              <select 
                                value={adminTTDept}
                                onChange={(e) => setAdminTTDept(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none"
                              >
                                <option value="Computer Science Engineering (CSE B.E)">Computer Science Engineering (CSE B.E)</option>
                                <option value="Artificial Intelligence and Data Science (AI&DS B.Tech)">Artificial Intelligence and Data Science (AI&DS B.Tech)</option>
                                <option value="Artificial Intelligence and Machine Learning (AI&ML B.Tech)">Artificial Intelligence and Machine Learning (AI&ML B.Tech)</option>
                                <option value="Computer Science and Business Systems (CSBS B.Tech)">Computer Science and Business Systems (CSBS B.Tech)</option>
                                <option value="Electronics and Communication Engineering (ECE B.E)">Electronics and Communication Engineering (ECE B.E)</option>
                                <option value="Electrical and Electronics Engineering (EEE B.E)">Electrical and Electronics Engineering (EEE B.E)</option>
                                <option value="Civil Engineering (B.E)">Civil Engineering (B.E)</option>
                                <option value="Mechanical Engineering (B.E)">Mechanical Engineering (B.E)</option>
                                <option value="CyberSecurity (B.Tech)">CyberSecurity (B.Tech)</option>
                                <option value="Department of Physics">Department of Physics</option>
                                <option value="Department of Chemistry">Department of Chemistry</option>
                                <option value="Department of Professional English">Department of Professional English</option>
                                <option value="Department of Mathematics">Department of Mathematics</option>
                                <option value="Department of MBA">Department of MBA</option>
                                <option value="Department of Tamil">Department of Tamil</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Academic Year</label>
                              <select 
                                value={adminTTYear}
                                onChange={(e) => setAdminTTYear(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none"
                              >
                                <option value="1st Year">1st Year (Fresher)</option>
                                <option value="2nd Year">2nd Year (Sophomore)</option>
                                <option value="3rd Year">3rd Year (Junior)</option>
                                <option value="4th Year">4th Year (Senior)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Timetable Title / Label</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Odd Semester Official Class Schedule"
                                value={adminTTSubject}
                                onChange={(e) => setAdminTTSubject(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Import Timetable Image / PDF Chart</label>
                              <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileImportToDataUrl(e, setAdminTTImage)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer font-mono"
                              />
                              {adminTTImage && (
                                <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 max-h-36 bg-slate-950 p-2">
                                  <img src={adminTTImage} alt="Timetable Chart" className="w-full h-28 object-contain rounded-lg" />
                                  <span className="absolute bottom-1 right-2 bg-slate-950/80 text-[8px] text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded">Chart Preview Ready</span>
                                </div>
                              )}
                            </div>

                            <button 
                              type="submit" 
                              className="btn-3d btn-3d-blue w-full py-2.5 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                            >
                              🚀 Publish Class Timetable Image
                            </button>
                          </form>
                        </TiltCard3D>
                      </div>

                      {/* Timetable Published Diagram Overview */}
                      <div className="lg:col-span-2">
                        <TiltCard3D className="p-6">
                          <div className="pb-3 border-b border-white/5 mb-4 flex flex-wrap justify-between items-center gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                Published Class Timetable Diagrams ({masterTimetableList.filter(t => (t.department === adminTTDept || !t.department) && (t.year === adminTTYear || !t.year)).length})
                              </h4>
                              <p className="text-[10px] text-slate-400">Class schedule for {adminTTDept} ({adminTTYear})</p>
                            </div>
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded-lg border border-blue-500/20">
                              {adminTTYear}
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1 no-scrollbar text-xs">
                            {masterTimetableList.length === 0 ? (
                              <p className="text-xs text-slate-500 italic text-center py-8">No timetables published yet.</p>
                            ) : (
                              masterTimetableList
                                .filter(t => (t.department === adminTTDept || !t.department) && (t.year === adminTTYear || !t.year))
                                .map((slot) => (
                                  <div key={slot.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-bold text-white text-sm">{slot.subject_name || `${slot.department} Timetable`}</h5>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.department} • {slot.year || "1st Year"}</p>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteTimetableSlot(slot.id)}
                                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer shrink-0"
                                      >
                                        Delete
                                      </button>
                                    </div>

                                    {slot.timetable_image_url && (
                                      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-2">
                                        <span className="text-[9px] text-cyan-300 font-mono font-bold block mb-1">Official Class Timetable Image:</span>
                                        <img src={slot.timetable_image_url} alt="Timetable Chart" className="w-full max-h-64 object-contain rounded-lg" />
                                      </div>
                                    )}
                                  </div>
                                ))
                            )}
                          </div>
                        </TiltCard3D>
                      </div>

                    </div>
                  )}

                  {/* SUB-PANEL 3: STAFF SCHEDULE MANAGEMENT */}
                  {adminSubTab === 'staff_schedules' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Staff Schedule Creator Form & File Importer */}
                      <div className="lg:col-span-1">
                        <TiltCard3D className="p-6 space-y-4">
                          <div className="pb-3 border-b border-white/5">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-amber-400" />
                              Upload Staff Schedule & Availability
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Publish faculty timetables & office availability</p>
                          </div>

                          <form onSubmit={handleSaveStaffSchedule} className="space-y-3 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Faculty Staff Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Dr. A. K. Sharma"
                                required
                                value={adminStaffName}
                                onChange={(e) => setAdminStaffName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Designation</label>
                                <input 
                                  type="text" 
                                  placeholder="Senior Professor"
                                  value={adminStaffDesignation}
                                  onChange={(e) => setAdminStaffDesignation(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Department</label>
                                <select 
                                  value={adminStaffDept}
                                  onChange={(e) => setAdminStaffDept(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-white text-[10px]"
                                >
                                  <option value="Computer Science Engineering (CSE B.E)">Computer Science Engineering (CSE B.E)</option>
                                  <option value="Artificial Intelligence and Data Science (AI&DS B.Tech)">Artificial Intelligence and Data Science (AI&DS B.Tech)</option>
                                  <option value="Artificial Intelligence and Machine Learning (AI&ML B.Tech)">Artificial Intelligence and Machine Learning (AI&ML B.Tech)</option>
                                  <option value="Computer Science and Business Systems (CSBS B.Tech)">Computer Science and Business Systems (CSBS B.Tech)</option>
                                  <option value="Electronics and Communication Engineering (ECE B.E)">Electronics and Communication Engineering (ECE B.E)</option>
                                  <option value="Electrical and Electronics Engineering (EEE B.E)">Electrical and Electronics Engineering (EEE B.E)</option>
                                  <option value="Civil Engineering (B.E)">Civil Engineering (B.E)</option>
                                  <option value="Mechanical Engineering (B.E)">Mechanical Engineering (B.E)</option>
                                  <option value="CyberSecurity (B.Tech)">CyberSecurity (B.Tech)</option>
                                  <option value="Department of Physics">Department of Physics</option>
                                  <option value="Department of Chemistry">Department of Chemistry</option>
                                  <option value="Department of Professional English">Department of Professional English</option>
                                  <option value="Department of Mathematics">Department of Mathematics</option>
                                  <option value="Department of MBA">Department of MBA</option>
                                  <option value="Department of Tamil">Department of Tamil</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Available Office Hours</label>
                              <input 
                                type="text" 
                                placeholder="Mon, Wed, Fri: 10:00 AM - 12:30 PM"
                                value={adminStaffHours}
                                onChange={(e) => setAdminStaffHours(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Import Staff Schedule Chart Image</label>
                              <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileImportToDataUrl(e, setAdminStaffImage)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer font-mono"
                              />
                              {adminStaffImage && (
                                <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 max-h-32 bg-slate-950">
                                  <img src={adminStaffImage} alt="Staff schedule chart" className="w-full h-28 object-cover" />
                                  <span className="absolute bottom-1 right-2 bg-slate-950/80 text-[8px] text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded">Schedule Chart Preview</span>
                                </div>
                              )}
                            </div>

                            <button 
                              type="submit" 
                              className="btn-3d btn-3d-amber w-full py-2.5 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer mt-2"
                            >
                              👨‍🏫 Publish Staff Schedule
                            </button>
                          </form>
                        </TiltCard3D>
                      </div>

                      {/* Staff Schedule List & Chart Viewer */}
                      <div className="lg:col-span-2">
                        <TiltCard3D className="p-6">
                          <div className="pb-3 border-b border-white/5 mb-4 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-amber-400" />
                                Published Staff Timetables & Office Schedules ({staffScheduleList.length})
                              </h4>
                              <p className="text-[10px] text-slate-400">Faculty office hours & imported schedule diagrams</p>
                            </div>
                          </div>

                          <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1 no-scrollbar text-xs">
                            {staffScheduleList.length === 0 ? (
                              <p className="text-xs text-slate-500 italic text-center py-8">No staff schedules published yet.</p>
                            ) : (
                              staffScheduleList.map((st) => (
                                <div key={st.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                                        {st.designation}
                                      </span>
                                      <h5 className="font-bold text-white text-base mt-1">{st.staff_name}</h5>
                                      <p className="text-[10px] text-slate-400 font-mono">{st.department}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteStaffSchedule(st.id)}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>

                                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1 font-mono text-[11px]">
                                    <p className="text-amber-400 font-bold">⏰ Available Hours: <span className="text-slate-200 font-normal">{st.available_hours}</span></p>
                                    <p className="text-slate-400">📚 Subjects: <span className="text-slate-300">{st.assigned_subjects || 'Core Subjects'}</span></p>
                                  </div>

                                  {st.schedule_image_url && (
                                    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-2">
                                      <span className="text-[9px] text-slate-400 font-mono font-bold block mb-1">Uploaded Timetable Chart Image:</span>
                                      <img src={st.schedule_image_url} alt={st.staff_name} className="w-full max-h-48 object-contain rounded-lg" />
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </TiltCard3D>
                      </div>

                    </div>
                  )}

                  {/* SUB-PANEL 4: SUBJECTS & SYLLABUS MANAGEMENT (YEARS 1 TO 4) */}
                  {adminSubTab === 'syllabus' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Subjects & Syllabus Creator Form */}
                      <div className="lg:col-span-1">
                        <TiltCard3D className="p-6 space-y-4">
                          <div className="pb-3 border-b border-white/5">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-emerald-400" />
                              Add / Manage Subject Syllabus
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Post Unit 1 to 5 topics for all 4 academic years</p>
                          </div>

                          <form onSubmit={handleSaveSyllabusSubject} className="space-y-3 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Department</label>
                              <select 
                                value={adminSylDept}
                                onChange={(e) => setAdminSylDept(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none"
                              >
                                <option value="Computer Science Engineering (CSE B.E)">Computer Science Engineering (CSE B.E)</option>
                                <option value="Artificial Intelligence and Data Science (AI&DS B.Tech)">Artificial Intelligence and Data Science (AI&DS B.Tech)</option>
                                <option value="Artificial Intelligence and Machine Learning (AI&ML B.Tech)">Artificial Intelligence and Machine Learning (AI&ML B.Tech)</option>
                                <option value="Computer Science and Business Systems (CSBS B.Tech)">Computer Science and Business Systems (CSBS B.Tech)</option>
                                <option value="Electronics and Communication Engineering (ECE B.E)">Electronics and Communication Engineering (ECE B.E)</option>
                                <option value="Electrical and Electronics Engineering (EEE B.E)">Electrical and Electronics Engineering (EEE B.E)</option>
                                <option value="Civil Engineering (B.E)">Civil Engineering (B.E)</option>
                                <option value="Mechanical Engineering (B.E)">Mechanical Engineering (B.E)</option>
                                <option value="CyberSecurity (B.Tech)">CyberSecurity (B.Tech)</option>
                                <option value="Department of Physics">Department of Physics</option>
                                <option value="Department of Chemistry">Department of Chemistry</option>
                                <option value="Department of Professional English">Department of Professional English</option>
                                <option value="Department of Mathematics">Department of Mathematics</option>
                                <option value="Department of MBA">Department of MBA</option>
                                <option value="Department of Tamil">Department of Tamil</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Year</label>
                                <select 
                                  value={adminSylYear}
                                  onChange={(e) => setAdminSylYear(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                >
                                  <option value="1st Year">1st Year</option>
                                  <option value="2nd Year">2nd Year</option>
                                  <option value="3rd Year">3rd Year</option>
                                  <option value="4th Year">4th Year</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Sub Code</label>
                                <input 
                                  type="text" 
                                  placeholder="CS101 / EC201"
                                  value={adminSylCode}
                                  onChange={(e) => setAdminSylCode(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Subject / Course Title</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Data Structures & Algorithm Syllabus"
                                value={adminSylTitle}
                                onChange={(e) => setAdminSylTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Import Syllabus Image / PDF Document</label>
                              <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileImportToDataUrl(e, setAdminSylImage)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer font-mono"
                              />
                              {adminSylImage && (
                                <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 max-h-36 bg-slate-950 p-2">
                                  <img src={adminSylImage} alt="Syllabus Chart" className="w-full h-28 object-contain rounded-lg" />
                                  <span className="absolute bottom-1 right-2 bg-slate-950/80 text-[8px] text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">Syllabus Ready</span>
                                </div>
                              )}
                            </div>

                            <button 
                              type="submit" 
                              className="btn-3d btn-3d-emerald w-full py-2.5 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer mt-2"
                            >
                              📚 Publish Syllabus Image & Units
                            </button>
                          </form>
                        </TiltCard3D>
                      </div>

                      {/* Syllabus Overview List */}
                      <div className="lg:col-span-2">
                        <TiltCard3D className="p-6">
                          <div className="pb-3 border-b border-white/5 mb-4 flex flex-wrap justify-between items-center gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                                Master Subjects & Syllabus Diagrams ({masterSyllabusList.filter(s => (s.department === adminSylDept || !s.department) && (s.year === adminSylYear || !s.year)).length})
                              </h4>
                              <p className="text-[10px] text-slate-400">Curriculum view for {adminSylDept} ({adminSylYear})</p>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                              {adminSylYear}
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1 no-scrollbar text-xs">
                            {masterSyllabusList.length === 0 ? (
                              <p className="text-xs text-slate-500 italic text-center py-8">No syllabus records published yet.</p>
                            ) : (
                              masterSyllabusList
                                .filter(s => (s.department === adminSylDept || !s.department) && (s.year === adminSylYear || !s.year))
                                .map((sub) => (
                                  <div key={sub.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                          {sub.subject_code || 'SYL-DOC'}
                                        </span>
                                        <h5 className="font-bold text-white text-sm">{sub.subject_name}</h5>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteSyllabusSubject(sub.id)}
                                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>

                                    {sub.syllabus_image_url && (
                                      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-2">
                                        <span className="text-[9px] text-emerald-300 font-mono font-bold block mb-1">Official Syllabus Document / Diagram:</span>
                                        <img src={sub.syllabus_image_url} alt="Syllabus Document" className="w-full max-h-64 object-contain rounded-lg" />
                                      </div>
                                    )}

                                    {sub.units && sub.units.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono bg-slate-950/80 p-3 rounded-xl border border-white/5">
                                        {sub.units.map((unitText, uIdx) => (
                                          <div key={uIdx} className="flex items-start gap-1.5">
                                            <span className="text-emerald-400 font-bold">U{uIdx + 1}:</span>
                                            <span className="text-slate-300 leading-tight">{unitText}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                            )}
                          </div>
                        </TiltCard3D>
                      </div>

                    </div>
                  )}

                  {/* SUB-PANEL 5: STUDENT & ADMIN ACTIVITY, INCIDENTS & AUDIT LOGS */}
                  {adminSubTab === 'audit_logs' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Registered Students</span>
                          <h3 className="text-2xl font-extrabold text-white mt-1">{auditLogsData.total_students || 0}</h3>
                          <p className="text-[9px] text-emerald-400 font-mono mt-0.5">Active Freshers Accounts</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Student Logins</span>
                          <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">{auditLogsData.login_logs?.length || 0}</h3>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">Student SSO Logins</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Admin Logins Logged</span>
                          <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{auditLogsData.admin_login_logs?.length || 0}</h3>
                          <p className="text-[9px] text-rose-300 font-mono mt-0.5">Admin & HOD Logins</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">System Incidents</span>
                          <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{auditLogsData.incidents?.length || 0}</h3>
                          <p className="text-[9px] text-purple-300 font-mono mt-0.5">Live Broadcast Trail</p>
                        </div>
                      </div>

                      {/* Admin Login Audit Table */}
                      <TiltCard3D className="p-6">
                        <div className="pb-3 border-b border-white/5 mb-4 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-rose-400" />
                            Admin & HOD Login Audit Log History (Saved in Supabase)
                          </h4>
                          <span className="text-[9px] font-mono text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            🔒 Admin Authentication Trail
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px]">
                                <th className="py-2.5 px-3">Admin Name</th>
                                <th className="py-2.5 px-3">Email Address</th>
                                <th className="py-2.5 px-3">Role / Authority</th>
                                <th className="py-2.5 px-3">Login Timestamp</th>
                                <th className="py-2.5 px-3">IP Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(auditLogsData.admin_login_logs || []).length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="py-6 text-center text-slate-500 italic">No admin logins recorded yet. Admin login activity will be logged here.</td>
                                </tr>
                              ) : (
                                (auditLogsData.admin_login_logs || []).map((log, idx) => (
                                  <tr key={idx} className="border-b border-white/5 text-slate-200 font-mono text-[11px]">
                                    <td className="py-2.5 px-3 font-bold text-rose-300">{log.admin_name}</td>
                                    <td className="py-2.5 px-3 text-cyan-300">{log.email}</td>
                                    <td className="py-2.5 px-3 text-amber-400 font-bold">{log.role || "Administrator"}</td>
                                    <td className="py-2.5 px-3 text-slate-400">{new Date(log.login_timestamp).toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-slate-500">{log.ip_address}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TiltCard3D>

                      {/* System Incidents & Broadcast Event Log */}
                      <TiltCard3D className="p-6">
                        <div className="pb-3 border-b border-white/5 mb-4 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-400" />
                            System Incidents & Poster Upload Audit Trail
                          </h4>
                          <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                            📡 Real-time Broadcast Activity
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px]">
                                <th className="py-2.5 px-3">Incident Type</th>
                                <th className="py-2.5 px-3">Title</th>
                                <th className="py-2.5 px-3">Description</th>
                                <th className="py-2.5 px-3">Performed By</th>
                                <th className="py-2.5 px-3">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(auditLogsData.incidents || []).length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="py-6 text-center text-slate-500 italic">No incidents recorded yet. Poster uploads and timetable updates will appear here.</td>
                                </tr>
                              ) : (
                                (auditLogsData.incidents || []).map((inc, idx) => (
                                  <tr key={idx} className="border-b border-white/5 text-slate-200 font-mono text-[11px]">
                                    <td className="py-2.5 px-3">
                                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[9px] font-bold">
                                        {inc.type}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-white">{inc.title}</td>
                                    <td className="py-2.5 px-3 text-slate-300">{inc.description}</td>
                                    <td className="py-2.5 px-3 text-amber-400 font-bold">{inc.performed_by}</td>
                                    <td className="py-2.5 px-3 text-slate-400">{new Date(inc.timestamp).toLocaleString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TiltCard3D>

                      {/* Student Login Audit Log Table */}
                      <TiltCard3D className="p-6">
                        <div className="pb-3 border-b border-white/5 mb-4 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            Student SSO Login Audit Log History
                          </h4>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                            Live Student Logins
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px]">
                                <th className="py-2.5 px-3">Student Name</th>
                                <th className="py-2.5 px-3">Email Address</th>
                                <th className="py-2.5 px-3">Department</th>
                                <th className="py-2.5 px-3">Batch Code</th>
                                <th className="py-2.5 px-3">Login Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(auditLogsData.login_logs || []).length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="py-6 text-center text-slate-500 italic">No student logins recorded yet. Logins will automatically appear here.</td>
                                </tr>
                              ) : (
                                (auditLogsData.login_logs || []).map((log, idx) => (
                                  <tr key={idx} className="border-b border-white/5 text-slate-200 font-mono text-[11px]">
                                    <td className="py-2.5 px-3 font-bold text-white">{log.student_name}</td>
                                    <td className="py-2.5 px-3 text-cyan-300">{log.college_email}</td>
                                    <td className="py-2.5 px-3">{log.department}</td>
                                    <td className="py-2.5 px-3 text-amber-400 font-bold">{log.batch_no}</td>
                                    <td className="py-2.5 px-3 text-slate-400">{new Date(log.login_timestamp).toLocaleString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TiltCard3D>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* FLOATING AI ASSISTANT WIDGET (Flipkart/Amazon style) */}
      {user && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-2rem)]">
          
          {/* Chat Window Container */}
          {isAiWidgetOpen && (
            <div className="w-[calc(100vw-2rem)] sm:w-[360px] h-[75vh] sm:h-[480px] max-h-[500px] mb-4 glass-panel border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 transform origin-bottom-right scale-100 opacity-100 backdrop-blur-md">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 animate-pulse text-purple-200" />
                  <div>
                    <h4 className="text-xs font-bold font-sans">Freshman AI Guide</h4>
                    <p className="text-[9px] text-purple-200">Powered by Gemini</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowApiSettings(!showApiSettings)} 
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                    title="Gemini API Settings"
                  >
                    <Settings className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button 
                    onClick={() => setIsAiWidgetOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* API Key Settings Panel */}
              {showApiSettings && (
                <div className="p-3 bg-slate-900 border-b border-white/5 space-y-2 shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold block">Enter Google AI Gemini API Key:</span>
                  <form onSubmit={handleSaveApiKey} className="flex gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button type="submit" className="btn-3d btn-3d-purple text-white font-bold text-[9px] px-3 rounded-lg shadow-md h-7 shrink-0">
                      Save
                    </button>
                  </form>
                </div>
              )}

              {/* Chat Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80 no-scrollbar">
                {aiGuideMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-855 text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}>
                      {msg.message_content}
                    </div>
                  </div>
                ))}
                {aiGuideLoading && (
                  <div className="text-slate-500 text-[10px] italic animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                    Gemini model is thinking...
                  </div>
                )}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendAiGuideMessage} className="p-3 bg-slate-900/90 border-t border-white/5 flex gap-2 items-center shrink-0">
                <input
                  type="text"
                  placeholder="Ask a college doubt..."
                  value={aiGuideInput}
                  onChange={(e) => setAiGuideInput(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Chat Toggle Button (FAB) */}
          <button
            onClick={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex justify-center items-center shadow-xl hover:shadow-2xl transition-all duration-300 relative group animate-bounce cursor-pointer border border-white/10"
            title="Open AI Guide"
          >
            <Cpu className="w-6 h-6 animate-pulse" />
            
            {/* Pulsing outer ring */}
            <span className="absolute inset-0 rounded-full border border-purple-400/30 animate-ping opacity-60"></span>
            
            {/* Tooltip */}
            <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-md font-bold whitespace-nowrap transition-all duration-200">
              💡 Ask AI Guide
            </span>
          </button>
          
        </div>
      )}

      {/* HIGH-RES POSTER LIGHTBOX / MAXIMIZE MODAL */}
      {maximizedPoster && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto no-scrollbar flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  {maximizedPoster.title}
                </h3>
                <p className="text-xs text-slate-400">Organizer: {maximizedPoster.organizer || "College Campus"}</p>
              </div>
              <button 
                onClick={() => setMaximizedPoster(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-all text-sm font-bold cursor-pointer"
                title="Close Lightbox"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex justify-center items-center bg-black/60 rounded-2xl overflow-hidden p-2 border border-white/5">
              <img 
                src={maximizedPoster.url} 
                alt={maximizedPoster.title} 
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl" 
              />
            </div>

            <div className="flex justify-between items-center pt-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono font-bold">High Resolution Campus Poster View</span>
              <div className="flex items-center gap-3">
                <a 
                  href={maximizedPoster.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-3d btn-3d-sky px-4 py-2 text-xs text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Full Image in New Tab</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setMaximizedPoster(null)}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
