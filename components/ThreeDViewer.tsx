import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Project, Primitive } from '../types';

interface ThreeDViewerProps {
  project: Project;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ project }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 5000);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
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

    if (project.modelData && project.modelData.primitives) {
        project.modelData.primitives.forEach((p: Primitive) => {
            let primitiveGeom: THREE.BufferGeometry;
            
            // Provide default dimensions to prevent crashes if data is malformed
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
            
            const primitiveMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(p.color || '#cccccc'),
                metalness: 0.2,
                roughness: 0.6,
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

    // --- Dynamic camera and grid setup based on object size ---
    const boundingBox = new THREE.Box3().setFromObject(objectContainer);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Position camera to fit the object in view
    camera.position.x = center.x + maxDim * 0.7;
    camera.position.y = center.y + maxDim * 0.7;
    camera.position.z = center.z + maxDim * 0.7;
    
    // Point controls to the center of the object
    controls.target.copy(center);

    // Grid Helper
    const gridSize = Math.ceil(Math.max(size.x, size.z) / 10) * 10 * 2;
    const gridHelper = new THREE.GridHelper(gridSize, 20, 0xcccccc, 0xcccccc);
    scene.add(gridHelper);
    
    // Axes helper
    const axesHelper = new THREE.AxesHelper(gridSize / 2);
    axesHelper.setColors(new THREE.Color(0xcccccc), new THREE.Color(0xcccccc), new THREE.Color(0x4F46E5)); 
    scene.add(axesHelper);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
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
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [project]);

  const handleToggleGrid = () => {
    // This is now controlled inside useEffect, this function could be removed or adapted if needed.
  };

  const handleFullscreen = () => {
    const elem = mountRef.current;
    if (!elem) return;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleResetView = () => {
    controlsRef.current?.reset();
  };

  return (
    <div className="w-full h-full min-h-[450px] bg-white rounded-lg relative overflow-hidden border border-gray-200">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md flex items-center gap-1 border border-gray-200">
        <button className="p-2 rounded-md bg-gray-800 text-white" title="Object Mode">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </button>
        <button
          onClick={handleToggleGrid}
          className={`p-2 rounded-md hover:bg-gray-100 ${isGridVisible ? 'text-brand-primary bg-gray-100' : 'text-gray-600'}`}
          title="Toggle Grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button onClick={handleFullscreen} className="p-2 rounded-md text-gray-600 hover:bg-gray-100" title="Fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        <button onClick={handleResetView} className="p-2 rounded-md text-gray-600 hover:bg-gray-100" title="Reset View">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ThreeDViewer;