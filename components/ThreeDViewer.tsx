
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Project, Primitive, SimulationResult, PCBData, PCBComponent, Joint } from '../types';

interface ThreeDViewerProps {
  project: Project;
  showToolpath?: boolean;
  simulateToolpath?: boolean;
  simulationResult?: SimulationResult | null;
  showPCB?: boolean;
  pcbViewMode?: 'standard' | 'fit-check' | 'emi';
  animateAssembly?: boolean;
  explodedView?: boolean;
  simulationSpeed?: number;
  onToolCollision?: (fixtureIndex: number) => void;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    project, 
    showToolpath = false, 
    simulateToolpath = false, 
    simulationResult = null,
    showPCB = false,
    pcbViewMode = 'standard',
    animateAssembly = false,
    explodedView = false,
    simulationSpeed = 1,
    onToolCollision
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const toolMeshRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const simulationFrameRef = useRef<number>(0);
  const assemblyStartTimeRef = useRef<number>(0);
  
  // Store references to primitive meshes for animation
  const primitiveMeshesRef = useRef<THREE.Mesh[]>([]);

  // Reset assembly start time when animation starts
  useEffect(() => {
    if (animateAssembly) {
        assemblyStartTimeRef.current = Date.now();
    }
  }, [animateAssembly]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 5000);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 75);
    scene.add(directionalLight);

    // Object Container
    const objectContainer = new THREE.Group();
    scene.add(objectContainer);
    primitiveMeshesRef.current = [];

    // 1. Render Mechanical Primitives
    // If in "Fit Check" mode, render mechanical parts transparently
    const isFitCheck = showPCB && pcbViewMode === 'fit-check';
    
    if (project.modelData && project.modelData.primitives) {
        project.modelData.primitives.forEach((p: Primitive, index: number) => {
            let primitiveGeom: THREE.BufferGeometry;
            const dims = p.dimensions || [];

            switch (p.type) {
                case 'cylinder':
                    primitiveGeom = new THREE.CylinderGeometry(dims[0] || 5, dims[0] || 5, dims[1] || 10, 32);
                    break;
                case 'sphere':
                    primitiveGeom = new THREE.SphereGeometry(dims[0] || 5, 32, 16);
                    break;
                case 'box':
                default:
                    primitiveGeom = new THREE.BoxGeometry(dims[0] || 10, dims[1] || 10, dims[2] || 10);
                    break;
            }
            
            // Check if this primitive is "Critical" in the simulation
            let color = new THREE.Color(p.color || '#cccccc');
            if (simulationResult?.criticalPrimitiveIndices?.includes(index)) {
                if (simulationResult.type !== 'CFD') {
                    color = new THREE.Color('#ef4444');
                }
            }

            const primitiveMat = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.2,
                roughness: 0.6,
                transparent: isFitCheck,
                opacity: isFitCheck ? 0.2 : 1.0,
                wireframe: isFitCheck 
            });

            const primitiveMesh = new THREE.Mesh(primitiveGeom, primitiveMat);
            
            // Store initial transforms as userData for reset/reference
            primitiveMesh.userData.initialPosition = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
            primitiveMesh.userData.initialRotation = new THREE.Euler(
                THREE.MathUtils.degToRad(p.rotation[0]),
                THREE.MathUtils.degToRad(p.rotation[1]),
                THREE.MathUtils.degToRad(p.rotation[2])
            );

            primitiveMesh.position.copy(primitiveMesh.userData.initialPosition);
            primitiveMesh.rotation.copy(primitiveMesh.userData.initialRotation);
            
            objectContainer.add(primitiveMesh);
            primitiveMeshesRef.current.push(primitiveMesh);
        });
    }

    // 1.5 Render Scanned Ghost Mesh (Reverse Engineering)
    if (project.assemblyData?.scannedMesh) {
         const ghostGeom = new THREE.TorusKnotGeometry(15, 4, 100, 16);
         const ghostMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.3 });
         const ghostMesh = new THREE.Mesh(ghostGeom, ghostMat);
         ghostMesh.position.set(0, 20, 0);
         scene.add(ghostMesh);
    }

    // 2. Render PCB & Components
    if (showPCB && project.pcbData) {
        const pcbGroup = new THREE.Group();
        const pcb = project.pcbData;
        
        // Board (FR4 Green)
        const boardGeom = new THREE.BoxGeometry(pcb.boardDimensions[0], pcb.boardDimensions[1], pcb.boardDimensions[2]);
        const boardMat = new THREE.MeshStandardMaterial({ color: '#10592f', roughness: 0.8 });
        const boardMesh = new THREE.Mesh(boardGeom, boardMat);
        pcbGroup.add(boardMesh);

        // Mounting Holes
        if (pcb.mountingHoles) {
             pcb.mountingHoles.forEach(holePos => {
                 const holeGeom = new THREE.CylinderGeometry(0.3, 0.3, pcb.boardDimensions[1] + 1, 8);
                 const holeMat = new THREE.MeshBasicMaterial({ color: '#000000' });
                 const hole = new THREE.Mesh(holeGeom, holeMat);
                 hole.position.set(holePos[0], holePos[1], holePos[2]);
                 // Subtract visually (simple overlay for now)
                 pcbGroup.add(hole);
             });
        }

        // Components
        if (pcb.components) {
            pcb.components.forEach((comp: PCBComponent) => {
                const compDims = comp.dimensions;
                const compGeom = new THREE.BoxGeometry(compDims[0], compDims[1], compDims[2]);
                
                let compColor = '#111111'; // Default Black (IC)
                switch(comp.type) {
                    case 'capacitor': compColor = '#d4d4d8'; break; // Silver/Grey
                    case 'resistor': compColor = '#3b82f6'; break; // Blue
                    case 'connector': compColor = '#9ca3af'; break; // Grey/Silver
                    case 'led': compColor = '#ef4444'; break; // Red
                    case 'sensor': compColor = '#f59e0b'; break; // Amber/Gold
                    case 'switch': compColor = '#6b7280'; break; // Grey
                    case 'battery': compColor = '#d1d5db'; break; // Silver
                    case 'inductor': compColor = '#4b5563'; break; // Dark Grey
                    case 'transistor': compColor = '#1f2937'; break; // Dark Blue/Grey
                    case 'diode': compColor = '#b91c1c'; break; // Dark Red
                    case 'display': compColor = '#000000'; break; // Black
                    case 'motor': compColor = '#64748b'; break; // Slate
                    case 'relay': compColor = '#1e40af'; break; // Blue
                    default: compColor = '#111111'; break;
                }

                const compMat = new THREE.MeshStandardMaterial({ color: compColor });
                const compMesh = new THREE.Mesh(compGeom, compMat);
                
                // Position relative to board center + board thickness/2
                compMesh.position.set(
                    comp.position[0],
                    comp.position[1] + (pcb.boardDimensions[1]/2 + compDims[1]/2), 
                    comp.position[2]
                );
                
                compMesh.rotation.set(
                    THREE.MathUtils.degToRad(comp.rotation[0]),
                    THREE.MathUtils.degToRad(comp.rotation[1]),
                    THREE.MathUtils.degToRad(comp.rotation[2])
                );
                
                pcbGroup.add(compMesh);
            });
        }
        
        // Render Traces (Autorouted)
        if (pcb.traces) {
            pcb.traces.forEach(trace => {
                const points = trace.path.map(p => new THREE.Vector3(p[0], p[1] + pcb.boardDimensions[1]/2 + 0.02, p[2]));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });
                const line = new THREE.Line(geometry, material);
                pcbGroup.add(line);
            });
        }

        objectContainer.add(pcbGroup);

        // 3. Render EMI Fields
        if (pcbViewMode === 'emi' && pcb.signalAnalysis?.hotspots) {
            pcb.signalAnalysis.hotspots.forEach(hotspot => {
                 const sphereGeom = new THREE.SphereGeometry(hotspot.radius, 16, 16);
                 const sphereMat = new THREE.MeshBasicMaterial({ 
                     color: hotspot.type === 'EMI' ? 0xff0000 : 0xffff00,
                     transparent: true,
                     opacity: hotspot.intensity * 0.5,
                     wireframe: true
                 });
                 const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                 // Relative to board
                 sphere.position.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
                 pcbGroup.add(sphere);
            });
        }
    }


    // Render Simulation Hotspots
    if (simulationResult && simulationResult.hotspots && simulationResult.type !== 'CFD') {
        simulationResult.hotspots.forEach(hotspot => {
             const geom = new THREE.SphereGeometry(2, 16, 16);
             const mat = new THREE.MeshBasicMaterial({ 
                 color: 0xff0000, 
                 transparent: true, 
                 opacity: 0.6 
             });
             const mesh = new THREE.Mesh(geom, mat);
             mesh.position.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
             scene.add(mesh);
        });
    }

    // Render Fixtures (if any)
    if (project.cncData?.fixtures) {
        project.cncData.fixtures.forEach((p: Primitive) => {
            let primitiveGeom: THREE.BufferGeometry;
            const dims = p.dimensions || [];
            switch (p.type) {
                case 'cylinder': primitiveGeom = new THREE.CylinderGeometry(dims[0]||5, dims[0]||5, dims[1]||10, 32); break;
                case 'sphere': primitiveGeom = new THREE.SphereGeometry(dims[0]||5, 32, 16); break;
                default: primitiveGeom = new THREE.BoxGeometry(dims[0]||10, dims[1] || 10, dims[2]||10); break;
            }
            const primitiveMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(p.color || '#ef4444'),
                metalness: 0.5,
                roughness: 0.4,
                transparent: true,
                opacity: 0.8
            });
            const primitiveMesh = new THREE.Mesh(primitiveGeom, primitiveMat);
            primitiveMesh.position.set(p.position[0], p.position[1], p.position[2]);
            primitiveMesh.rotation.set(
                THREE.MathUtils.degToRad(p.rotation[0]),
                THREE.MathUtils.degToRad(p.rotation[1]),
                THREE.MathUtils.degToRad(p.rotation[2])
            );
            objectContainer.add(primitiveMesh);
        });
    }

    // Render Toolpath
    if (showToolpath && project.cncData?.toolpath) {
        const points = project.cncData.toolpath.map(pt => new THREE.Vector3(pt.x, pt.y, pt.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);

        // Tool Mesh (Ghost Tool)
        const toolGroup = new THREE.Group();
        const shankGeom = new THREE.CylinderGeometry(1, 1, 10, 16);
        const shankMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const shank = new THREE.Mesh(shankGeom, shankMat);
        shank.position.y = 5;
        const fluteGeom = new THREE.CylinderGeometry(1, 0, 2, 16);
        const fluteMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const flute = new THREE.Mesh(fluteGeom, fluteMat);
        flute.position.y = -1;
        
        toolGroup.add(shank);
        toolGroup.add(flute);
        scene.add(toolGroup);
        toolMeshRef.current = toolGroup;
        
        // Hide tool if not simulating
        toolGroup.visible = simulateToolpath;
    }

    // CFD Particle System Setup
    if (simulationResult?.type === 'CFD') {
        const particleCount = 2000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities: {x:number, y:number, z:number}[] = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
            velocities.push({ x: 0, y: 0, z: 2 + Math.random() * 2 }); // Flow direction Z+
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMaterial = new THREE.PointsMaterial({ color: 0x00aaff, size: 0.8, transparent: true, opacity: 0.6 });
        const particleSystem = new THREE.Points(particles, pMaterial);
        scene.add(particleSystem);
        particleSystemRef.current = particleSystem;
        (particleSystem.userData as any).velocities = velocities;
    }


    // --- Dynamic camera and grid setup based on object size ---
    const boundingBox = new THREE.Box3().setFromObject(objectContainer);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 50;

    // Position camera to fit the object in view
    camera.position.x = center.x + maxDim * 0.7;
    camera.position.y = center.y + maxDim * 0.7;
    camera.position.z = center.z + maxDim * 0.7;
    
    // Point controls to the center of the object
    controls.target.copy(center);

    // Grid Helper
    const gridSize = Math.ceil(maxDim / 10) * 10 * 3;
    const gridHelper = new THREE.GridHelper(gridSize, 20, 0xcccccc, 0xcccccc);
    scene.add(gridHelper);
    
    // Axes helper
    const axesHelper = new THREE.AxesHelper(gridSize / 2);
    scene.add(axesHelper);

    // Animation loop
    let toolIndex = 0;
    
    const animate = () => {
      simulationFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      // Toolpath Simulation Logic
      if (simulateToolpath && toolMeshRef.current && project.cncData?.toolpath && project.cncData.toolpath.length > 0) {
         toolMeshRef.current.visible = true;
         const path = project.cncData.toolpath;
         
         const targetPoint = path[Math.floor(toolIndex)];
         if (targetPoint) {
             toolMeshRef.current.position.set(targetPoint.x, targetPoint.y, targetPoint.z);
         }
         
         // Collision Detection
         if (project.cncData.fixtures) {
             const toolPos = toolMeshRef.current.position;
             const toolTipY = toolPos.y - 2; // Approximate tip
             
             let collision = false;
             
             project.cncData.fixtures.forEach((fixture, idx) => {
                 // Simple bounding box approximation check for demo purposes
                 const halfW = (fixture.dimensions[0] || 10) / 2 + 1; // +1 buffer for tool width
                 const halfH = (fixture.dimensions[1] || 10) / 2 + 1;
                 const halfD = (fixture.dimensions[2] || 10) / 2 + 1;
                 
                 const dx = Math.abs(toolPos.x - fixture.position[0]);
                 const dy = Math.abs(toolTipY - fixture.position[1]); // Check vertically against tip
                 const dz = Math.abs(toolPos.z - fixture.position[2]);
                 
                 if (dx < halfW && dy < halfH && dz < halfD) {
                     collision = true;
                     if (onToolCollision) onToolCollision(idx);
                 }
             });

             // Visual indicator on the tool flute
             if (toolMeshRef.current.children[1]) {
                 (toolMeshRef.current.children[1] as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                     color: collision ? 0xff0000 : 0xffd700
                 });
             }
         }

         toolIndex += 0.2 * simulationSpeed; 
         if (toolIndex >= path.length) toolIndex = 0; 
      } else if (toolMeshRef.current) {
          toolMeshRef.current.visible = false;
      }

      // Drop Test Animation
      if (simulationResult?.type === 'DROP_TEST') {
          const time = Date.now() * 0.005;
          const bounceHeight = 10;
          objectContainer.position.y = Math.abs(Math.sin(time)) * bounceHeight;
      }

      // CFD Animation
      if (simulationResult?.type === 'CFD' && particleSystemRef.current) {
           const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
           const velocities = (particleSystemRef.current.userData as any).velocities;
           
           for(let i = 0; i < positions.length / 3; i++) {
               // Move along Z
               positions[i * 3 + 2] += velocities[i].z;
               
               // Reset if out of bounds (approximate box)
               if(positions[i * 3 + 2] > 100) {
                   positions[i * 3 + 2] = -100;
                   positions[i * 3] = (Math.random() - 0.5) * 100; 
                   positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
               }
           }
           particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Assembly Animation
      if (animateAssembly && project.assemblyData && project.assemblyData.joints) {
          const currentTime = Date.now();
          // Use elapsed time since start of animation to allow for clean restarting
          const elapsedTime = (currentTime - assemblyStartTimeRef.current) / 1000; // seconds
          
          project.assemblyData.joints.forEach((joint: Joint) => {
              const mesh = primitiveMeshesRef.current[joint.partIndex];
              if (mesh) {
                  const speed = joint.speed || 1;
                  // Use elapsed time instead of raw timestamp
                  const t = elapsedTime * speed;

                  if (joint.type === 'REVOLUTE') {
                      // Simple sine wave oscillation within limits
                      const range = joint.limits[1] - joint.limits[0];
                      const offset = joint.limits[0];
                      // Normalize sine to 0..1 then map to limit range
                      const angle = offset + (Math.sin(t) + 1) / 2 * range;
                      
                      // Apply rotation based on axis
                      if (joint.axis[0]) mesh.rotation.x = THREE.MathUtils.degToRad(angle);
                      if (joint.axis[1]) mesh.rotation.y = THREE.MathUtils.degToRad(angle);
                      if (joint.axis[2]) mesh.rotation.z = THREE.MathUtils.degToRad(angle);
                  } else if (joint.type === 'PRISMATIC') {
                      const range = joint.limits[1] - joint.limits[0];
                      const offset = joint.limits[0];
                      const val = offset + (Math.sin(t) + 1) / 2 * range;
                      
                      // Apply translation relative to initial pos
                      const initial = mesh.userData.initialPosition;
                      if (joint.axis[0]) mesh.position.x = initial.x + val;
                      if (joint.axis[1]) mesh.position.y = initial.y + val;
                      if (joint.axis[2]) mesh.position.z = initial.z + val;
                  }
              }
          });
      } else if (!animateAssembly && explodedView) {
           // Exploded View Logic (Active when not animating)
           primitiveMeshesRef.current.forEach((mesh, index) => {
               const initial = mesh.userData.initialPosition as THREE.Vector3;
               // Simple explode: Move away from center based on index or vector from origin
               // Here we use a simple scalar from origin for demo
               const target = initial.clone().multiplyScalar(1.5);
               mesh.position.lerp(target, 0.1);
               
               // Also reset rotation to initial
               mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, mesh.userData.initialRotation.x, 0.1);
               mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mesh.userData.initialRotation.y, 0.1);
               mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, mesh.userData.initialRotation.z, 0.1);
           });
      } else if (!animateAssembly && !explodedView) {
           // Return to neutral state
           primitiveMeshesRef.current.forEach(mesh => {
               mesh.position.lerp(mesh.userData.initialPosition, 0.1);
               mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, mesh.userData.initialRotation.x, 0.1);
               mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mesh.userData.initialRotation.y, 0.1);
               mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, mesh.userData.initialRotation.z, 0.1);
           });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(simulationFrameRef.current);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [project, showToolpath, simulateToolpath, simulationResult, showPCB, pcbViewMode, animateAssembly, explodedView, simulationSpeed]);

  return (
    <div className="w-full h-full min-h-[450px] bg-white rounded-lg relative overflow-hidden border border-gray-200">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default ThreeDViewer;
