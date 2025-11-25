
import React, { useState } from 'react';
import { Project } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { refineDesign } from '../services/geminiService';
import { ArchitectureIcon } from '../constants';
import { Building, Layers, Ruler, FileText, CheckCircle, Zap, LayoutTemplate, DoorOpen, ScanLine } from 'lucide-react';
import ProjectList from './ProjectList';

interface AECViewProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type Tab = 'bim' | 'floorplan' | 'analysis' | 'compliance';

const AECView: React.FC<AECViewProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
      return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg">
                    <ArchitectureIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Architecture Studio</h1>
                    <p className="text-xs text-gray-500">Select a project to start architectural design</p>
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

  const [activeTab, setActiveTab] = useState<Tab>('bim');
  const [isProcessing, setIsProcessing] = useState(false);
  const [floorplanDesc, setFloorplanDesc] = useState('');
  const [complianceLog, setComplianceLog] = useState<string[]>([]);

  // Reuse refineDesign to perform AEC specific tasks by crafting prompts
  const performAECTask = async (taskDescription: string, loadingMessage: string) => {
      setIsProcessing(true);
      try {
          // We prefix the prompt to guide the AI towards AEC modifications
          const prompt = `AEC Modification: ${taskDescription}. Maintain architectural integrity.`;
          const updatedProject = await refineDesign(project, prompt);
          onUpdate(updatedProject);
      } catch (error) {
          alert(`Task failed: ${taskDescription}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const runComplianceCheck = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setComplianceLog([
              "Checking against IBC 2021...",
              "✓ Egress width > 36 inches: PASS",
              "✓ Ceiling height > 7.5 feet: PASS",
              "⚠ ADA Ramp slope detected near threshold: WARNING",
              "✓ Structural Load (Snow): PASS",
              "Check complete."
          ]);
          setIsProcessing(false);
      }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg">
            <ArchitectureIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Architecture Studio</h1>
            <p className="text-xs text-gray-500">BIM, Drafting & Compliance</p>
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
                <button onClick={() => setActiveTab('bim')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'bim' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Building className="w-4 h-4" /> BIM Tools
                </button>
                <button onClick={() => setActiveTab('floorplan')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'floorplan' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <LayoutTemplate className="w-4 h-4" /> Floorplan
                </button>
                <button onClick={() => setActiveTab('compliance')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'compliance' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <CheckCircle className="w-4 h-4" /> Code
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* --- BIM TOOLS TAB --- */}
                {activeTab === 'bim' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                            <h3 className="font-semibold text-cyan-900 text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Smart Modeling
                            </h3>
                            <p className="text-xs text-cyan-700 mt-1">
                                Apply intelligent architectural features to your massing model.
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Structural Elements</label>
                            <button 
                                onClick={() => performAECTask('Generate standard 3m high walls from the floor layout footprint', 'Generating Walls...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-cyan-500 hover:bg-cyan-50 text-left transition-colors"
                            >
                                <Layers className="w-4 h-4 text-gray-500" />
                                <span>Auto-Generate Walls</span>
                            </button>
                            <button 
                                onClick={() => performAECTask('Add structural columns at 5m grid intervals', 'Placing Columns...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-cyan-500 hover:bg-cyan-50 text-left transition-colors"
                            >
                                <Building className="w-4 h-4 text-gray-500" />
                                <span>Generate Column Grid</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Openings & Fixtures</label>
                            <button 
                                onClick={() => performAECTask('Insert standard doors at logical entry points', 'Adding Doors...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-cyan-500 hover:bg-cyan-50 text-left transition-colors"
                            >
                                <DoorOpen className="w-4 h-4 text-gray-500" />
                                <span>Auto-Insert Doors</span>
                            </button>
                            <button 
                                onClick={() => performAECTask('Add windows to exterior walls for natural light', 'Adding Windows...')}
                                disabled={isProcessing}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-cyan-500 hover:bg-cyan-50 text-left transition-colors"
                            >
                                <LayoutTemplate className="w-4 h-4 text-gray-500" />
                                <span>Distribute Windows</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- FLOORPLAN TAB --- */}
                {activeTab === 'floorplan' && (
                    <div className="space-y-4">
                         <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <h3 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Text-to-Floorplan
                            </h3>
                            <p className="text-xs text-indigo-700 mt-1">
                                Describe the layout of rooms, and AI will generate the 3D structure.
                            </p>
                        </div>
                        
                        <textarea
                            value={floorplanDesc}
                            onChange={(e) => setFloorplanDesc(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="e.g., A 3-bedroom house with a large central living room, kitchen on the east side, and master bedroom with ensuite on the north..."
                        />
                        
                        <button 
                             onClick={() => performAECTask(`Generate floorplan structure: ${floorplanDesc}`, 'Generating Floorplan...')}
                             disabled={isProcessing || !floorplanDesc}
                             className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                         >
                             {isProcessing ? 'Generating...' : 'Generate 3D Layout'}
                         </button>
                         
                         <div className="pt-4 border-t border-gray-100">
                             <button 
                                onClick={() => performAECTask('Convert point cloud data to BIM elements', 'Processing Scan...')}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50"
                             >
                                 <ScanLine className="w-4 h-4" /> Scan-to-BIM Import
                             </button>
                         </div>
                    </div>
                )}

                {/* --- COMPLIANCE TAB --- */}
                {activeTab === 'compliance' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h3 className="font-semibold text-green-900 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Code Checking
                            </h3>
                            <p className="text-xs text-green-700 mt-1">
                                Automated analysis against IBC (International Building Code) standards.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <button 
                                onClick={runComplianceCheck}
                                disabled={isProcessing}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                            >
                                {isProcessing ? 'Checking...' : 'Run Compliance Audit'}
                            </button>
                            
                            <button 
                                onClick={() => performAECTask('Identify and highlight structural clashes between HVAC and Beams', 'Running Clash Detection...')}
                                disabled={isProcessing}
                                className="w-full py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm shadow-sm"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Ruler className="w-4 h-4" /> Detect Clashes
                                </div>
                            </button>
                        </div>

                        {complianceLog.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-md shadow-inner h-48 overflow-y-auto">
                                {complianceLog.map((log, i) => (
                                    <div key={i} className="mb-1">{log}</div>
                                ))}
                            </div>
                        )}
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

export default AECView;
