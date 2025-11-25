
import React from 'react';
import * as THREE from 'three';
import { Project, Primitive } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { EditIcon, ManufacturingIcon, SimulationIcon, ElectronicsIcon, AssemblyIcon, ArchitectureIcon, MediaIcon } from '../constants';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onManualEdit: () => void;
  onManufacturing: () => void;
  onSimulation: () => void;
  onElectronics: () => void;
  onAssembly: () => void;
  onAEC: () => void;
  onMedia: () => void;
  onDelete: (projectId: string) => void;
}

// Utility to calculate the overall dimensions of the model
const calculateBoundingBox = (project: Project): { length: number; width: number; height: number } => {
    if (!project.modelData?.primitives?.length) {
        return { length: 0, width: 0, height: 0 };
    }

    const group = new THREE.Group();
    project.modelData.primitives.forEach((p: Primitive) => {
        let geom: THREE.BufferGeometry;
        const dims = p.dimensions || [];
        switch (p.type) {
            case 'cylinder':
                geom = new THREE.CylinderGeometry(dims[0] || 5, dims[0] || 5, dims[1] || 10, 8);
                break;
            case 'sphere':
                geom = new THREE.SphereGeometry(dims[0] || 5, 8, 8);
                break;
            case 'box':
            default:
                geom = new THREE.BoxGeometry(dims[0] || 10, dims[1] || 10, dims[2] || 10);
                break;
        }
        const mesh = new THREE.Mesh(geom);
        mesh.position.set(p.position[0], p.position[1], p.position[2]);
        mesh.rotation.set(
            THREE.MathUtils.degToRad(p.rotation[0]),
            THREE.MathUtils.degToRad(p.rotation[1]),
            THREE.MathUtils.degToRad(p.rotation[2])
        );
        group.add(mesh);
    });

    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());

    return {
        length: Math.round(size.z),
        width: Math.round(size.x),
        height: Math.round(size.y),
    };
};


const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack, onEdit, onManualEdit, onManufacturing, onSimulation, onElectronics, onAssembly, onAEC, onMedia, onDelete }) => {
  const overallDimensions = calculateBoundingBox(project);

  const handleExport = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${project.name.replace(/ /g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        onDelete(project.id);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <button onClick={onBack} className="text-brand-primary hover:text-brand-secondary flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-brand-text">{project.name}</h1>
          <p className="text-brand-subtext mt-1 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
              onClick={handleExport}
              className="bg-white border border-gray-300 text-brand-text font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
          </button>

          <button
            onClick={onEdit}
            className="bg-white border border-gray-300 text-brand-text font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 3.63a2.12 2.12 0 1 1 3 3L12 16l-4 1 1-4Z"/></svg>
            Edit
          </button>
           <button
            onClick={onManualEdit}
            className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-brand-secondary transition-all duration-300 flex items-center gap-2"
          >
            <EditIcon />
            Editor
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
             
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                3D Visualization
            </h3>
            <div className="w-full h-[450px]">
              <ThreeDViewer project={project} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Components</h3>
            <ul className="divide-y divide-gray-200">
              {project.components.map((component, index) => (
                <li key={index} className="py-3">
                  <h4 className="font-semibold text-brand-text">{component.name}</h4>
                  <p className="text-sm text-brand-subtext">{component.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-subtext">Category:</span>
                <span className="font-medium text-brand-text">{project.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-subtext">Overall Dim (cm):</span>
                <span className="font-medium text-brand-text">{`${overallDimensions.length} L x ${overallDimensions.width} W x ${overallDimensions.height} H`}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-brand-subtext">Status:</span>
                <span className="font-medium text-brand-text capitalize">{project.status}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Materials</h3>
            <div className="flex flex-wrap gap-2">
              {project.materials.map((material, index) => (
                <span key={index} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {material}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-cyan-50 border border-cyan-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-cyan-900 mb-2 flex items-center gap-2">
               <ArchitectureIcon /> Architecture
              </h3>
              <p className="text-sm text-cyan-700 mb-3">BIM Modeling, Floorplans & Compliance.</p>
              <button onClick={onAEC} className="text-cyan-700 font-semibold text-sm hover:underline">
                  Open Architecture Studio &rarr;
              </button>
          </div>
          
           <div className="bg-pink-50 border border-pink-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-pink-900 mb-2 flex items-center gap-2">
               <MediaIcon /> Media & VFX
              </h3>
              <p className="text-sm text-pink-700 mb-3">Animation, Rigging & Visual Effects.</p>
              <button onClick={onMedia} className="text-pink-700 font-semibold text-sm hover:underline">
                  Open Media Studio &rarr;
              </button>
          </div>

          {project.assemblyData && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                   <AssemblyIcon /> Assembly Ready
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">{project.assemblyData.joints.length} joints defined. Motion analysis available.</p>
                  <button onClick={onAssembly} className="text-blue-700 font-semibold text-sm hover:underline">
                      Open Assembly Studio &rarr;
                  </button>
              </div>
          )}

          {project.pcbData && (
              <div className="bg-green-50 border border-green-100 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                   <ElectronicsIcon /> Electronics Ready
                  </h3>
                  <p className="text-sm text-green-700 mb-3">{project.pcbData.components.length} components placed. BOM generated.</p>
                  <button onClick={onElectronics} className="text-green-700 font-semibold text-sm hover:underline">
                      Open Electronics Lab &rarr;
                  </button>
              </div>
          )}

          {project.simulationData && project.simulationData.length > 0 && (
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2 flex items-center gap-2">
                   <SimulationIcon /> Analysis Ready
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">{project.simulationData.length} simulation reports available.</p>
                  <button onClick={onSimulation} className="text-orange-700 font-semibold text-sm hover:underline">
                      Open Simulation Studio &rarr;
                  </button>
              </div>
          )}
          
           {project.cncData && (
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                   <ManufacturingIcon /> CNC Ready
                </h3>
                <p className="text-sm text-indigo-700 mb-3">Toolpaths generated for {project.cncData.selectedMachineId}</p>
                <button 
                    onClick={onManufacturing}
                    className="text-indigo-600 text-sm font-semibold hover:underline"
                >
                    View Manufacturing Hub &rarr;
                </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
