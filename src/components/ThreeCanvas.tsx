import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  pulseTrigger?: number; // increments when task completes
  isCyberMode?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ pulseTrigger = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(pulseTrigger);
  pulseRef.current = pulseTrigger;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b09, 0.032);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Emerald Core (Icosahedron + Wireframe cage)
    const coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Emerald
      emissive: 0x047857,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.15,
      transmission: 0.65,
      ior: 1.5,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Outer wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(3.9, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x34d399, // Mint
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mainGroup.add(wireMesh);

    // 2. Glowing Rings (Warm Gold & Mint)
    const ringGeo = new THREE.TorusGeometry(5.2, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Warm Gold
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    mainGroup.add(ringMesh1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.x = -Math.PI / 5;
    mainGroup.add(ringMesh2);

    // 3. Floating satellite task nodes
    const nodeCount = 5;
    const nodeGroup = new THREE.Group();
    const nodeGeos = [
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9),
      new THREE.DodecahedronGeometry(0.7),
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(0.75),
    ];
    const nodeColors = [0x34d399, 0xf59e0b, 0x10b981, 0xfbbf24, 0x6ee7b7];

    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(nodeGeos[i % nodeGeos.length], mat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 7 + (i % 2) * 1.5;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.sin(i * 1.7) * 2),
        Math.sin(angle) * radius * 0.5
      );
      mesh.userData = {
        angle,
        speed: 0.008 + (i % 3) * 0.004,
        radius,
        rotSpeedX: 0.015 * (i % 2 === 0 ? 1 : -1),
        rotSpeedY: 0.02 * (i % 2 === 0 ? -1 : 1),
      };
      nodes.push(mesh);
      nodeGroup.add(mesh);
    }
    mainGroup.add(nodeGroup);

    // 4. Background Starfield / Particle Cloud (Emerald & Mint)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x10b981);
    const accentColor = new THREE.Color(0x34d399);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 40;
      positions[i3 + 2] = (Math.random() - 0.5) * 50 - 5;

      const mixRatio = Math.random();
      const mixedColor = baseColor.clone().lerp(accentColor, mixRatio);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 3.5, 30);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x34d399, 3, 30);
    pointLight2.position.set(-10, -8, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf59e0b, 2.5, 25);
    pointLight3.position.set(0, 12, -8);
    scene.add(pointLight3);

    // Mouse movement interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.45;
      targetMouseY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handling
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation variables
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let pulseEnergy = 0;
    let lastSeenTrigger = pulseRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Check if task completed pulse was fired
      if (pulseRef.current !== lastSeenTrigger) {
        lastSeenTrigger = pulseRef.current;
        pulseEnergy = 1.0;
      }

      if (pulseEnergy > 0.005) {
        pulseEnergy *= 0.94;
      } else {
        pulseEnergy = 0;
      }

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      mainGroup.rotation.y = currentMouseX + time * 0.15 + pulseEnergy * 1.5;
      mainGroup.rotation.x = currentMouseY + Math.sin(time * 0.4) * 0.08;

      // Pulse effects on core
      const pulseScale = 1 + Math.sin(time * 2) * 0.03 + pulseEnergy * 0.25;
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);
      wireMesh.scale.set(pulseScale, pulseScale, pulseScale);

      coreMesh.rotation.y += 0.008 + pulseEnergy * 0.05;
      coreMesh.rotation.x += 0.005;

      wireMesh.rotation.y -= 0.006;
      wireMesh.rotation.z += 0.004;

      ringMesh1.rotation.z += 0.008;
      ringMesh2.rotation.z -= 0.007;

      // Orbit satellite nodes
      nodes.forEach((node) => {
        const u = node.userData;
        u.angle += u.speed * (1 + pulseEnergy * 3);
        node.position.x = Math.cos(u.angle) * u.radius;
        node.position.z = Math.sin(u.angle) * u.radius;
        node.position.y += Math.sin(time * 2 + u.angle) * 0.008;
        node.rotation.x += u.rotSpeedX;
        node.rotation.y += u.rotSpeedY;
      });

      // Subtle particle rotation
      particles.rotation.y = time * 0.02;
      particles.rotation.x = time * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
      aria-hidden="true" 
    />
  );
};
