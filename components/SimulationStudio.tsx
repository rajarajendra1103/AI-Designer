
import React, { useState } from 'react';
import { Project, SimulationType, SimulationResult } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { runSimulation } from '../services/geminiService';
import { SimulationIcon } from '../constants';
import { Activity, Wind, AlertTriangle, Droplet, Layers, Waves } from 'lucide-react';
import ProjectList from './ProjectList';

interface SimulationStudioProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

const SimulationStudio: React.FC<SimulationStudioProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
      return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                    <SimulationIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Simulation Studio</h1>
                    <p className="text-xs text-gray-500">Select a project to run simulations</p>
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

  const [activeSimType, setActiveSimType] = useState<SimulationType>('FEA_STRUCTURAL');
  const [params, setParams] = useState<string>('Load: 1000N along Y-axis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(
      project.simulationData?.find(s => s.type === activeSimType) || null
  );

  const handleSimTypeChange = (type: SimulationType) => {
      setActiveSimType(type);
      setCurrentResult(project.simulationData?.find(s => s.type === type) || null);
      // Set default params based on type
      switch(type) {
          case 'FEA_STRUCTURAL': setParams('Load: 1000N, Fixed Base'); break;
          case 'FEA_THERMAL': setParams('Ambient: 25C, Heat Source: 150C'); break;
          case 'CFD': setParams('Air Velocity: 20 m/s'); break;
          case 'DROP_TEST': setParams('Height: 1.5m, Surface: Concrete'); break;
          case 'TOPOLOGY_OPT': setParams('Target Mass Reduction: 30%'); break;
          case 'MODAL': setParams('Freq Range: 0-2000Hz, Modes: 10'); break;
          case 'INJECTION_MOLDING': setParams('Material: ABS, Injection Pressure: 100MPa'); break;
      }
  };

  const handleRunSimulation = async () => {
    setIsProcessing(true);
    try {
        const result = await runSimulation(project, activeSimType, params);
        
        // Update project with new result
        const existingData = project.simulationData || [];
        // Remove old result of same type
        const filteredData = existingData.filter(d => d.type !== activeSimType);
        const updatedProject = {
            ...project,
            simulationData: [...filteredData, result]
        };
        
        onUpdate(updatedProject);
        setCurrentResult(result);
    } catch (error) {
        alert("Failed to run simulation. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const getIconForType = (type: SimulationType) => {
      switch(type) {
          case 'FEA_STRUCTURAL': return <Activity className="w-5 h-5" />;
          case 'FEA_THERMAL': return <AlertTriangle className="w-5 h-5" />;
          case 'CFD': return <Wind className="w-5 h-5" />;
          case 'DROP_TEST': return <Droplet className="w-5 h-5" />; // Approx
          case 'TOPOLOGY_OPT': return <Layers className="w-5 h-5" />;
          case 'MODAL': return <Waves className="w-5 h-5" />;
          case 'INJECTION_MOLDING': return <Droplet className="w-5 h-5 text-cyan-600" />;
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
            <SimulationIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Simulation Studio</h1>
            <p className="text-xs text-gray-500">Advanced CAE Analysis</p>
          </div>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Change Project
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Analysis Type</h3>
                <div className="space-y-2">
                    {(['FEA_STRUCTURAL', 'FEA_THERMAL', 'CFD', 'MODAL', 'INJECTION_MOLDING', 'DROP_TEST', 'TOPOLOGY_OPT'] as SimulationType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => handleSimTypeChange(type)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeSimType === type 
                                ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {getIconForType(type)}
                            {type.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Simulation Parameters</label>
                     <textarea
                        value={params}
                        onChange={(e) => setParams(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border h-24"
                        placeholder="Define load, temperature, speed..."
                     />
                 </div>

                 <button 
                    onClick={handleRunSimulation}
                    disabled={isProcessing}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                 >
                    {isProcessing ? 'Simulating...' : 'Run Simulation'}
                 </button>

                 {currentResult && (
                     <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                         <h4 className="font-semibold text-gray-900">Results Summary</h4>
                         <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200 italic">
                             "{currentResult.summary}"
                         </p>
                         
                         <div className="space-y-2">
                             {currentResult.stats.map((stat, idx) => (
                                 <div key={idx} className="flex justify-between items-center text-sm">
                                     <span className="text-gray-500">{stat.label}</span>
                                     <span className="font-medium text-gray-900">{stat.value} <span className="text-xs text-gray-400">{stat.unit}</span></span>
                                 </div>
                             ))}
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
                    simulationResult={currentResult}
                />
                
                {/* Legend Overlay */}
                {currentResult && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                         <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                             <div className="text-xs font-bold text-gray-500 uppercase">{currentResult.type.replace('_', ' ')}</div>
                             <div className="text-sm font-semibold text-gray-900 mt-1">{currentResult.timestamp.split('T')[0]}</div>
                         </div>
                         
                         {currentResult.type !== 'CFD' && (
                            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border border-gray-200">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Critical Zones
                            </div>
                         )}
                         {currentResult.type === 'CFD' && (
                             <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border border-gray-200">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div> Airflow
                            </div>
                         )}
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default SimulationStudio;
