
import React, { useState } from 'react';
import { Project, MachineProfile, CNCData } from '../types';
import { MACHINE_LIBRARY, ManufacturingIcon } from '../constants';
import ThreeDViewer from './ThreeDViewer';
import { generateCNCToolpath, generateFixtureDesign } from '../services/geminiService';
import { Play, Square, Settings, Database, Activity, Cpu, AlertTriangle, Layers } from 'lucide-react';
import ProjectList from './ProjectList';

interface ManufacturingViewProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

const ManufacturingView: React.FC<ManufacturingViewProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
      return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <ManufacturingIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Manufacturing Hub</h1>
                    <p className="text-xs text-gray-500">Select a project to start CNC manufacturing</p>
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

  const [selectedMachine, setSelectedMachine] = useState<MachineProfile>(
    MACHINE_LIBRARY.find(m => m.id === project.cncData?.selectedMachineId) || MACHINE_LIBRARY[0]
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'machine' | 'code' | 'stats' | 'simulation'>('machine');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [collisionLog, setCollisionLog] = useState<{time: string, msg: string}[]>([]);

  const handleGenerateToolpath = async () => {
    setIsProcessing(true);
    try {
        const result = await generateCNCToolpath(project, selectedMachine);
        const updatedProject = {
            ...project,
            cncData: {
                ...project.cncData,
                ...result,
                selectedMachineId: selectedMachine.id
            }
        };
        onUpdate(updatedProject);
        setActiveTab('simulation'); // Switch to simulation to show result
    } catch (error) {
        alert("Failed to generate toolpath");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleGenerateFixtures = async () => {
      setIsProcessing(true);
      try {
          const fixtures = await generateFixtureDesign(project);
          const updatedProject = {
              ...project,
              cncData: {
                  ...project.cncData!, // Assume toolpath might exist or init empty
                  selectedMachineId: selectedMachine.id,
                  toolpath: project.cncData?.toolpath || null,
                  gcode: project.cncData?.gcode || null,
                  stats: project.cncData?.stats || null,
                  fixtures: fixtures
              }
          };
          onUpdate(updatedProject);
      } catch (error) {
          alert("Failed to generate fixtures");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleToolCollision = (fixtureIndex: number) => {
      const timestamp = new Date().toLocaleTimeString();
      setCollisionLog(prev => {
          // Prevent spamming the same collision
          if (prev.length > 0 && prev[0].msg.includes(`Fixture #${fixtureIndex + 1}`)) return prev;
          return [{ time: timestamp, msg: `Collision detected with Fixture #${fixtureIndex + 1}` }, ...prev].slice(0, 50);
      });
  };

  const hasToolpath = !!project.cncData?.toolpath;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <ManufacturingIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manufacturing Hub</h1>
            <p className="text-xs text-gray-500">CNC Simulation & Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Change Project
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-mono">{selectedMachine.name}</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar / Controls */}
        <aside className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('machine')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'machine' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Setup
                </button>
                <button 
                    onClick={() => setActiveTab('simulation')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'simulation' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Simulation
                </button>
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'stats' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Stats
                </button>
                <button 
                    onClick={() => setActiveTab('code')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'code' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    G-Code
                </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
                {activeTab === 'machine' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Database className="w-4 h-4" /> Machine Library
                            </label>
                            <select 
                                value={selectedMachine.id} 
                                onChange={(e) => setSelectedMachine(MACHINE_LIBRARY.find(m => m.id === e.target.value) || MACHINE_LIBRARY[0])}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                {MACHINE_LIBRARY.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100">
                                {selectedMachine.description} <br/>
                                <span className="font-semibold mt-1 block">Max RPM: {selectedMachine.maxSpindleSpeed.toLocaleString()}</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Fixture Design
                            </h3>
                            <button 
                                onClick={handleGenerateFixtures}
                                disabled={isProcessing}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Auto-Design Jigs & Fixtures'}
                            </button>
                            <p className="text-xs text-gray-500">
                                AI will generate clamps or baseplates to hold the part based on geometry.
                            </p>
                        </div>

                         <div className="space-y-3 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Toolpath Generation
                            </h3>
                            <button 
                                onClick={handleGenerateToolpath}
                                disabled={isProcessing}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isProcessing ? 'Calculating...' : 'Generate Optimized Toolpath'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'simulation' && (
                    <div className="space-y-6">
                        {!hasToolpath ? (
                            <div className="text-center text-gray-500 py-8">
                                Please generate a toolpath first.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-gray-700">Playback Control</h3>
                                     <div className="flex items-center gap-2">
                                         <button 
                                             onClick={() => setIsSimulating(!isSimulating)}
                                             className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-white shadow-sm transition-all ${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                                         >
                                             {isSimulating ? <><Square className="w-4 h-4 fill-current"/> Stop</> : <><Play className="w-4 h-4 fill-current" /> Run Simulation</>}
                                         </button>
                                     </div>
                                     <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Speed</span>
                                            <span>{simulationSpeed}x</span>
                                        </div>
                                        <input 
                                            type="range" min="0.5" max="5" step="0.5" 
                                            value={simulationSpeed} 
                                            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                                            className="w-full accent-indigo-600"
                                        />
                                     </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 flex-1 flex flex-col min-h-0">
                                     <div className="flex justify-between items-center mb-2">
                                         <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" /> Collision Log
                                         </h3>
                                         <button onClick={() => setCollisionLog([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                                     </div>
                                     <div className="bg-gray-100 rounded-md p-3 h-48 overflow-y-auto text-xs font-mono space-y-1 border border-gray-200 shadow-inner">
                                         {collisionLog.length === 0 ? (
                                             <span className="text-gray-400">No events recorded.</span>
                                         ) : (
                                             collisionLog.map((log, i) => (
                                                 <div key={i} className="flex gap-2">
                                                     <span className="text-gray-400">[{log.time}]</span>
                                                     <span className="text-red-600 font-medium">{log.msg}</span>
                                                 </div>
                                             ))
                                         )}
                                     </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                     <div className="space-y-6">
                         {!project.cncData?.stats ? (
                             <div className="text-center text-gray-500 py-8">
                                 Generate a toolpath to view optimization stats.
                             </div>
                         ) : (
                             <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="text-xs text-gray-500">Est. Cycle Time</div>
                                        <div className="text-lg font-bold text-gray-900">{project.cncData.stats.estimatedTime}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="text-xs text-gray-500">Tool Life Score</div>
                                        <div className="text-lg font-bold text-green-600">{project.cncData.stats.toolLifeScore}</div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Material Removal Rate</div>
                                    <div className="text-xl font-bold text-gray-900">{project.cncData.stats.materialRemovalRate}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" /> AI Optimization
                                    </h4>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Feed rates adjusted for {selectedMachine.name} specific rigidity. Step-over optimized for surface finish.
                                    </p>
                                </div>
                             </>
                         )}
                     </div>
                )}

                {activeTab === 'code' && (
                    <div className="h-full flex flex-col">
                         {!project.cncData?.gcode ? (
                             <div className="text-center text-gray-500 py-8">
                                 Generate a toolpath to view G-Code.
                             </div>
                         ) : (
                            <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-md overflow-y-auto h-full shadow-inner">
                                <pre className="whitespace-pre-wrap">{project.cncData.gcode}</pre>
                            </div>
                         )}
                    </div>
                )}
            </div>
            
        </aside>

        {/* 3D Viewport */}
        <main className="flex-1 bg-gray-200 relative">
            <div className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
                <ThreeDViewer 
                    project={project} 
                    showToolpath={true}
                    simulateToolpath={isSimulating}
                    simulationSpeed={simulationSpeed}
                    onToolCollision={handleToolCollision}
                />
                
                {/* Overlay Legend */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border border-gray-200">
                        <div className="w-3 h-3 rounded-full bg-cyan-400"></div> Toolpath
                    </div>
                    {project.cncData?.fixtures && project.cncData.fixtures.length > 0 && (
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div> Fixtures
                        </div>
                    )}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ManufacturingView;
