import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Project, Primitive } from '../types';

interface ThumbnailViewerProps {
  project: Project;
}

const ThumbnailViewer: React.FC<ThumbnailViewerProps> = ({ project }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 5000);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 150, 100);
    scene.add(directionalLight);

    // Object Container
    const objectContainer = new THREE.Group();
    scene.add(objectContainer);

    if (project.modelData && project.modelData.primitives) {
        project.modelData.primitives.forEach((p: Primitive) => {
            let primitiveGeom: THREE.BufferGeometry;
            const dims = p.dimensions || [];
            switch (p.type) {
                case 'cylinder':
                    primitiveGeom = new THREE.CylinderGeometry(dims[0] || 5, dims[0] || 5, dims[1] || 10, 16);
                    break;
                case 'sphere':
                    primitiveGeom = new THREE.SphereGeometry(dims[0] || 5, 16, 8);
                    break;
                case 'box':
                default:
                    primitiveGeom = new THREE.BoxGeometry(dims[0] || 10, dims[1] || 10, dims[2] || 10);
                    break;
            }
            const primitiveMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color || '#cccccc') });
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

    const boundingBox = new THREE.Box3().setFromObject(objectContainer);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Adjust camera position to frame the object
    const cameraDistance = maxDim * 1.5;
    camera.position.x = center.x + cameraDistance;
    camera.position.y = center.y + cameraDistance * 0.75;
    camera.position.z = center.z + cameraDistance;
    camera.lookAt(center);
    
    // Animate once
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [project]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default ThumbnailViewer;
