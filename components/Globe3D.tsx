import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

interface MarkerData {
    name: string;
    lat: number;
    lng: number;
    img: string;
}

const GLOBE_RADIUS = 2.8;

// Convert Lat/Lng to 3D Vector
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    // Swapping Y and Z because in Three.js default Sphere, Y is Up.
    // Standard Math: x = r sin(phi) cos(theta), y = r sin(phi) sin(theta), z = r cos(phi)
    // Three.js Sphere: poles are on Y axis.
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
  
    return new THREE.Vector3(x, y, z);
}

const Marker: React.FC<{ data: MarkerData; radius: number }> = ({ data, radius }) => {
    const [hovered, setHovered] = useState(false);
    const position = useMemo(() => latLongToVector3(data.lat, data.lng, radius), [data, radius]);

    return (
        <group position={position}>
            <mesh 
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={(e) => setHovered(false)}
            >
                <sphereGeometry args={[hovered ? 0.08 : 0.04, 16, 16]} />
                <meshStandardMaterial 
                    color={hovered ? "#60a5fa" : "#ffffff"} 
                    emissive={hovered ? "#3b82f6" : "#ffffff"}
                    emissiveIntensity={hovered ? 2 : 0.5}
                />
            </mesh>
            {/* Glow ring */}
            <mesh>
                 <ringGeometry args={[0.06, 0.07, 32]} />
                 <meshBasicMaterial color="#60a5fa" side={THREE.DoubleSide} transparent opacity={0.4} />
                 <mesh lookAt={() => new THREE.Vector3(0,0,0)} /> 
            </mesh>
            
            {hovered && (
                <Html distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-xl w-48 pointer-events-none transform -translate-y-14 -translate-x-1/2 animate-fade-in-up">
                        <img src={data.img} alt={data.name} className="w-full h-24 object-cover rounded-md mb-2" />
                        <p className="text-white text-xs font-bold text-center">{data.name}</p>
                    </div>
                </Html>
            )}
        </group>
    );
};

const Earth = () => {
  return (
    <group>
        {/* Wireframe Surface */}
        <Sphere args={[GLOBE_RADIUS, 64, 64]}>
            <meshStandardMaterial
                color="#1e3a8a"
                emissive="#172554"
                emissiveIntensity={0.2}
                roughness={0.5}
                metalness={0.8}
                wireframe={true}
                transparent
                opacity={0.8}
            />
        </Sphere>
        
        {/* Inner Solid Core (Black) to occlude backface lines/markers */}
        <Sphere args={[GLOBE_RADIUS - 0.02, 64, 64]}>
            <meshBasicMaterial color="#020617" />
        </Sphere>
    </group>
  );
};

const Atmosphere = () => {
    return (
        <Sphere args={[GLOBE_RADIUS - 0.1, 64, 64]}>
            <meshStandardMaterial 
                color="#3b82f6"
                transparent
                opacity={0.1}
                side={THREE.BackSide}
            />
        </Sphere>
    )
}

const GlobeInner: React.FC<{ markers: MarkerData[] }> = ({ markers }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
             // Subtle floating/breathing animation
             groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <Earth />
            {markers.map((m, i) => <Marker key={i} data={m} radius={GLOBE_RADIUS} />)}
            <Atmosphere />
        </group>
    );
};

interface GlobeProps {
    markers?: MarkerData[];
}

const Globe3D: React.FC<GlobeProps> = ({ markers = [] }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#c084fc" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <GlobeInner markers={markers} />

        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
            rotateSpeed={0.5}
        />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-transparent to-[#0f172a] pointer-events-none" />
    </div>
  );
};

export default Globe3D;