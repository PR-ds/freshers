import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D Spherical Node Component
function GraphNode({ id, label, status, position, onClick, details }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Pulse animation for identified gap nodes to draw attention
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const pulseScalar = status === 'gap' ? Math.sin(time * 6) * 0.04 : 0;
      meshRef.current.scale.setScalar(1 + pulseScalar + (hovered ? 0.25 : 0));
    }
  });

  // Tailored high-tech glow colors (Emerald for Mastered, DodgerBlue for Learning, Crimson for Gap)
  const nodeColor = status === 'mastered' ? '#10B981' : (status === 'learning' ? '#3B82F6' : '#EF4444');

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick({ id, label, status, details });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={nodeColor} 
          roughness={0.2} 
          metalness={0.8} 
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
      
      {/* Interactive labels that face the camera */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.16}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/outfit/v6/QGYuzg5SSD86X7028kIXOJKOWSg5.woff" // Fallback web font
      >
        {label}
      </Text>
    </group>
  );
}

// 3D Connection Line Component
function GraphEdge({ start, end }) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#ffffff" opacity={0.2} transparent linewidth={1.5} />
    </line>
  );
}

export default function ThreeGraph({ nodes = [], edges = [], onNodeClick }) {
  // Distribute nodes in 3D coordinate space dynamically if positions are not set
  const positionedNodes = useMemo(() => {
    return nodes.map((node, index) => {
      if (node.position) return node;
      
      // Calculate coordinates on a spiral configuration to look futuristic
      const phi = Math.acos(-1 + (2 * index) / Math.max(1, nodes.length));
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      const radius = 2.0;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      return {
        ...node,
        position: [x, y, z]
      };
    });
  }, [nodes]);

  // Find start and end position of each connecting line
  const graphEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = positionedNodes.find(n => n.id === edge.source);
      const targetNode = positionedNodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        return {
          id: `${edge.source}-${edge.target}`,
          start: sourceNode.position,
          end: targetNode.position
        };
      }
      return null;
    }).filter(Boolean);
  }, [edges, positionedNodes]);

  return (
    <div className="w-full h-full relative min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        
        {/* Connection Edges */}
        {graphEdges.map(edge => (
          <GraphEdge key={edge.id} start={edge.start} end={edge.end} />
        ))}

        {/* Nodes */}
        {positionedNodes.map(node => (
          <GraphNode
            key={node.id}
            id={node.id}
            label={node.label}
            status={node.status}
            position={node.position}
            details={node.details}
            onClick={onNodeClick}
          />
        ))}

        <OrbitControls 
          enableZoom={true} 
          maxDistance={8} 
          minDistance={2} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* 3D Legend indicator */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-md shadow-emerald-500/20" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-md shadow-blue-500/20" />
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 block shadow-md shadow-red-500/20" />
          <span>Gap / Target</span>
        </div>
      </div>
    </div>
  );
}
