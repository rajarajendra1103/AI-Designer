
import React, { useState } from 'react';
import { Project } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { refineDesign } from '../services/geminiService';
import { MediaIcon } from '../constants';
import { Video, Film, Wand2, Box, Activity, Layers, Scissors, Move, User } from 'lucide-react';
import ProjectList from './ProjectList';

interface MediaViewProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type Tab = 'animation' | 'modeling' | 'vfx';

const MediaView: React.FC<MediaViewProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
      return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
                    <MediaIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Media & VFX Studio</h1>
                    <p className="text-xs text-gray-500">Select a project to start animation or VFX</p>
                  </div>
              </header>
              <div className="flex-1 overflow-y-auto">
                {projects && onSelectProject ? (
                    <ProjectList 
                        projects={projects} 
                        onSelectProject={onSelectProject} 
                        onDeleteProject={() => {}} 
                    />
                ) : (
                    <div className="p-8 text-center text-gray-500">No projects available.</div>
                )}
              </div>
          </div>
      );
  }

  const [activeTab, setActiveTab] = useState<Tab>('animation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');

  const performAIAction = async (actionPrompt: string, loadingMessage: string) => {
      setIsProcessing(true);
      try {
          // Guide the AI to perform Media/VFX related geometry changes
          const fullPrompt = `Media & VFX Modification: ${actionPrompt}. Enhance geometry for animation/rendering.`;
          const updatedProject = await refineDesign(project, fullPrompt);
          onUpdate(updatedProject);
      } catch (error) {
          alert(`Action failed: ${loadingMessage}`);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
            <MediaIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Media & VFX Studio</h1>
            <p className="text-xs text-gray-500">Maya, 3ds Max & Flame Tools</p>
          </div>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Change Project
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
             <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('animation')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'animation' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Video className="w-4 h-4" /> Animation
                </button>
                <button onClick={() => setActiveTab('modeling')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'modeling' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Box className="w-4 h-4" /> Modeling
                </button>
                <button onClick={() => setActiveTab('vfx')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'vfx' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Film className="w-4 h-4" /> VFX
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* --- ANIMATION TAB (Maya) --- */}
                {activeTab === 'animation' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h3 className="font-semibold text-purple-900 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Maya Tools
                            </h3>
                            <p className="text-xs text-purple-700 mt-1">
                                Rigging, skinning, and motion synthesis.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">AI Auto-Rigging</label>
                            <button 
                                onClick={() => performAIAction('Identify limbs and joints. Create a humanoid skeletal structure for animation.', 'Generating Rig...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-pink-500 hover:bg-pink-50 text-left transition-colors"
                            >
                                <User className="w-4 h-4 text-gray-500" />
                                <span>Generate Skeleton</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Motion Synthesis</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-24 p-2 border border-gray-300 rounded text-xs"
                                placeholder="Describe motion (e.g., 'Character jumping over a fence')..."
                            />
                            <button 
                                onClick={() => performAIAction(`Deform geometry to simulate this motion: ${prompt}`, 'Synthesizing Motion...')}
                                disabled={isProcessing || !prompt}
                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                            >
                                {isProcessing ? 'Generating...' : 'Generate Animation Pose'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- MODELING TAB (3ds Max) --- */}
                {activeTab === 'modeling' && (
                    <div className="space-y-6">
                         <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                                <Box className="w-4 h-4" /> 3ds Max Tools
                            </h3>
                            <p className="text-xs text-blue-700 mt-1">
                                High-poly modeling, retopology, and environment gen.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Environment & Mesh</label>
                            <button 
                                onClick={() => performAIAction('Generate a procedural city block around the central object', 'Building City...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                            >
                                <Layers className="w-4 h-4 text-gray-500" />
                                <span>Procedural City Gen</span>
                            </button>
                             <button 
                                onClick={() => performAIAction('Simplify geometry mesh topology while maintaining silhouette (Retopology)', 'Optimizing Mesh...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                            >
                                <Scissors className="w-4 h-4 text-gray-500" />
                                <span>Smart Retopology</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Texturing</label>
                            <button 
                                onClick={() => performAIAction('Apply realistic PBR materials with wear and tear', 'Generating Textures...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                            >
                                <Wand2 className="w-4 h-4 text-gray-500" />
                                <span>AI Text-to-Material</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- VFX TAB (Flame) --- */}
                {activeTab === 'vfx' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <h3 className="font-semibold text-red-900 text-sm flex items-center gap-2">
                                <Film className="w-4 h-4" /> Flame VFX
                            </h3>
                            <p className="text-xs text-red-700 mt-1">
                                Particle systems, simulations, and compositing prep.
                            </p>
                        </div>

                         <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Simulation</label>
                            <button 
                                onClick={() => performAIAction('Add a particle explosion effect emitting from the center', 'Simulating Particles...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-red-500 hover:bg-red-50 text-left transition-colors"
                            >
                                <Move className="w-4 h-4 text-gray-500" />
                                <span>Particle Explosion</span>
                            </button>
                            <button 
                                onClick={() => performAIAction('Add fluid simulation geometry flowing around the object', 'Simulating Fluid...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-red-500 hover:bg-red-50 text-left transition-colors"
                            >
                                <Activity className="w-4 h-4 text-gray-500" />
                                <span>Fluid Dynamics</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>

        {/* 3D Viewport */}
        <main className="flex-1 bg-gray-100 relative">
            <div className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
                <ThreeDViewer 
                    project={project} 
                />
            </div>
        </main>
      </div>
    </div>
  );
};

export default MediaView;
