import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BasePlate, BoltConfiguration, ConcreteData, SteelProfile, AnchorChair } from '../types';

interface ThreeViewProps {
  plate: BasePlate;
  bolts: BoltConfiguration;
  concrete: ConcreteData;
  columnProfile: SteelProfile;
  anchorChair: AnchorChair;
  stressData?: number;
}

export const ThreeView: React.FC<ThreeViewProps> = ({ plate, bolts, concrete, columnProfile, anchorChair, stressData = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF1F5F9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 5000);
    camera.position.set(600, 600, 600);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(300, 500, 400);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      // Dispose all geometries and materials in scene
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    
    while(group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      // Dispose geometries and materials
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // Plate Material (Dark Steel)
    const color = new THREE.Color(0x334155).lerp(new THREE.Color(0xef4444), stressData);
    const plateMaterial = new THREE.MeshPhongMaterial({ 
      color: color, 
      shininess: 80,
      specular: 0x444444
    });
    const plateGeom = new THREE.BoxGeometry(plate.width, plate.thickness, plate.height);
    const plateMesh = new THREE.Mesh(plateGeom, plateMaterial);
    plateMesh.position.y = plate.thickness / 2;
    group.add(plateMesh);

    // Concrete
    const concreteMaterial = new THREE.MeshPhongMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.4 });
    const concreteGeom = new THREE.BoxGeometry(concrete.width, concrete.depth, concrete.height);
    const concreteMesh = new THREE.Mesh(concreteGeom, concreteMaterial);
    concreteMesh.position.y = -concrete.depth / 2;
    group.add(concreteMesh);

    // Bolts
    const boltMaterial = new THREE.MeshPhongMaterial({ color: 0x475569 });
    
    // Bolt length depends on anchor chair
    const boltTopExposed = anchorChair.enabled ? anchorChair.height + 40 : 40;
    const totalBoltLength = bolts.embedment + boltTopExposed;
    const boltGeom = new THREE.CylinderGeometry(bolts.diameter / 2, bolts.diameter / 2, totalBoltLength, 16);
    
    const startX = -(bolts.spacingX * (bolts.countX - 1)) / 2 + bolts.offsetX;
    const startY = -(bolts.spacingY * (bolts.countY - 1)) / 2 + bolts.offsetY;

    for (let i = 0; i < bolts.countX; i++) {
      for (let j = 0; j < bolts.countY; j++) {
        const bx = startX + i * bolts.spacingX;
        const bz = startY + j * bolts.spacingY;
        
        const bolt = new THREE.Mesh(boltGeom, boltMaterial);
        // Positioned relative to plate top
        const boltY = (-bolts.embedment + boltTopExposed) / 2 + plate.thickness;
        bolt.position.set(bx, boltY, bz);
        group.add(bolt);
        
        const headGeom = new THREE.CylinderGeometry(bolts.diameter, bolts.diameter, 15, 6);
        const head = new THREE.Mesh(headGeom, boltMaterial);
        const headY = anchorChair.enabled ? (plate.thickness + anchorChair.height + 12) : (plate.thickness + 10);
        head.position.set(bx, headY, bz);
        group.add(head);
      }
    }

    // Column Section (Blue Transparent)
    const colMat = new THREE.MeshPhongMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6,
      shininess: 50 
    });
    const colHeight = 800;
    
    // Web
    const webGeom = new THREE.BoxGeometry(columnProfile.tw, colHeight, columnProfile.h - 2 * columnProfile.tf);
    const web = new THREE.Mesh(webGeom, colMat);
    web.position.y = colHeight / 2 + plate.thickness;
    group.add(web);

    // Flanges
    const flangeGeom = new THREE.BoxGeometry(columnProfile.b, colHeight, columnProfile.tf);
    const f1 = new THREE.Mesh(flangeGeom, colMat);
    f1.position.set(0, colHeight / 2 + plate.thickness, (columnProfile.h - columnProfile.tf) / 2);
    group.add(f1);
    const f2 = new THREE.Mesh(flangeGeom, colMat);
    f2.position.set(0, colHeight / 2 + plate.thickness, -(columnProfile.h - columnProfile.tf) / 2);
    group.add(f2);

    // Anchor Chair
    if (anchorChair.enabled) {
      const chairMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 100 });
      const topPlateMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 120 });
      
      const chairPositions: { x: number, z: number }[] = [];
      for (let i = 0; i < bolts.countX; i++) {
        for (let j = 0; j < bolts.countY; j++) {
           const bx = startX + i * bolts.spacingX;
           const bz = startY + j * bolts.spacingY;
           
           let include = false;
           const chairPos = anchorChair.position;
           const isOutsideWeb = Math.abs(bz) > (columnProfile.h / 2 - columnProfile.tf);
           
           if (chairPos === "FULL") include = true;
           else if (chairPos === "WING_FACES" && isOutsideWeb) include = true;
           else if (chairPos === "INTERIOR" && !isOutsideWeb) include = true;
           
           if (include) chairPositions.push({ x: bx, z: bz });
        }
      }

      chairPositions.forEach(pos => {
        const stiffW = anchorChair.width;
        const stiffT = anchorChair.thickness;
        const stiffH = anchorChair.height;
        
        // Two side stiffeners for the chair
        const stiffGeom = new THREE.BoxGeometry(stiffT, stiffH, stiffW);
        const offset = bolts.diameter * 1.5;
        
        const s1 = new THREE.Mesh(stiffGeom, chairMat);
        s1.position.set(pos.x - offset, stiffH/2 + plate.thickness, pos.z);
        group.add(s1);

        const s2 = new THREE.Mesh(stiffGeom, chairMat);
        s2.position.set(pos.x + offset, stiffH/2 + plate.thickness, pos.z);
        group.add(s2);

        // Top Seat Plate (Should be visible now, with higher contrast)
        const topW = offset * 2.5;
        const topGeom = new THREE.BoxGeometry(topW, stiffT, stiffW);
        const top = new THREE.Mesh(topGeom, topPlateMat);
        top.position.set(pos.x, anchorChair.height + plate.thickness + stiffT/2, pos.z);
        group.add(top);
      });
    }

  }, [plate, bolts, concrete, columnProfile, anchorChair, stressData]);

  return (
    <div ref={containerRef} className="w-full h-full relative rounded-xl overflow-hidden bg-[#EDF1F5]">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button className="p-2 px-3 bg-white/80 backdrop-blur rounded shadow-sm text-[10px] font-bold text-gray-500 hover:bg-white uppercase tracking-wider">2D</button>
        <button className="p-2 px-3 bg-blue-600 text-white rounded shadow-sm text-[10px] font-bold uppercase tracking-wider">3D</button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <div className="px-5 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-100 flex items-center gap-6 text-[10px] font-bold text-gray-500 tracking-tighter">
          <span className="uppercase tracking-widest">Tensión Von Mises (MPa)</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          </div>
          <span className="text-gray-800 font-mono">{(stressData * 355).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
