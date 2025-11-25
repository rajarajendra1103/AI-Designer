
import React, { useState } from 'react';
import { Project, AssemblyData, StandardPart, DesignParameter } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { generateAssemblyAnalysis, reverseEngineerMesh } from '../services/geminiService';
import { AssemblyIcon, STANDARD_PART_LIBRARY } from '../constants';
import { Play, Square, Plus, Settings, RefreshCw, Box, ScanLine, Clock, Hash, Search, Trash2, Save, X, Expand } from 'lucide-react';
import ProjectList from './ProjectList';

interface AssemblyStudioProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type Tab = 'library' | 'motion' | 'params' | 'reverse';

const AssemblyStudio: React.FC<AssemblyStudioProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
      return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <AssemblyIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Assembly Studio</h1>
                    <p className="text-xs text-gray-500">Select a project to manage assembly</p>
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

  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [scannedDesc, setScannedDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Parameter Creation State
  const [isAddingParam, setIsAddingParam] = useState(false);
  const [newParam, setNewParam] = useState<{name: string, value: number, unit: string, targetIndex: number}>({ 
      name: 'New Parameter', 
      value: 10, 
      unit: 'cm', 
      targetIndex: 0 
  });
  
  // Simulation Parameters
  const [simDuration, setSimDuration] = useState(10); // Seconds
  const [simSteps, setSimSteps] = useState(100); // Steps
  const [simProgress, setSimProgress] = useState(0);

  // Helper to ensure assemblyData exists
  const ensureAssemblyData = () => {
      if (!project.assemblyData) {
          return {
              joints: [],
              parameters: [],
              configurations: [],
              scannedMesh: false
          };
      }
      return project.assemblyData;
  };

  const handleAnalyzeAssembly = async () => {
      setIsProcessing(true);
      try {
          const assemblyData = await generateAssemblyAnalysis(project);
          onUpdate({ ...project, assemblyData });
      } catch (error) {
          alert("Analysis failed.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleAddPart = (part: StandardPart) => {
      // Add standard part to model primitives
      const newPrimitive = { ...part.primitive };
      // Offset slightly to avoid exact overlap
      newPrimitive.position = [
          newPrimitive.position[0] + Math.random() * 5,
          newPrimitive.position[1] + 10,
          newPrimitive.position[2] + Math.random() * 5
      ];
      
      const updatedProject = {
          ...project,
          modelData: {
              ...project.modelData,
              primitives: [...project.modelData.primitives, newPrimitive]
          }
      };
      onUpdate(updatedProject);
  };

  const handleImportScan = () => {
      // Simulate importing a scan by enabling the ghost mesh
      const assemblyData = ensureAssemblyData();
      onUpdate({
          ...project,
          assemblyData: { ...assemblyData, scannedMesh: true }
      });
  };

  const handleReconstruct = async () => {
      if (!scannedDesc) return;
      setIsProcessing(true);
      try {
          const newPrimitives = await reverseEngineerMesh(scannedDesc);
          // Append new primitives to existing model
          onUpdate({
              ...project,
              modelData: {
                  ...project.modelData,
                  primitives: [...project.modelData.primitives, ...newPrimitives]
              },
              assemblyData: { ...ensureAssemblyData(), scannedMesh: false } // Hide ghost mesh
          });
          setScannedDesc('');
      } catch (error) {
          alert("Reconstruction failed.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleRunSimulation = () => {
      if (isAnimating) {
          setIsAnimating(false);
          setSimProgress(0);
          return;
      }

      setIsAnimating(true);
      setIsExploded(false); // Reset explosion when animating
      setSimProgress(0);

      const startTime = Date.now();
      const interval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min((elapsed / simDuration) * 100, 100);
          setSimProgress(progress);

          if (elapsed >= simDuration) {
              clearInterval(interval);
              setIsAnimating(false);
              setSimProgress(100);
          }
      }, 100);
  };

  // --- Parameter Logic ---

  const handleParamChange = (id: string, newValue: number) => {
      const assemblyData = ensureAssemblyData();
      const paramIndex = assemblyData.parameters.findIndex(p => p.id === id);
      if (paramIndex === -1) return;
      
      const param = assemblyData.parameters[paramIndex];
      const oldValue = param.value;
      if (oldValue === 0) return; // prevent div by zero
      
      const ratio = newValue / oldValue;
      
      // Clone data to avoid direct mutation
      const newParams = [...assemblyData.parameters];
      newParams[paramIndex] = { ...param, value: newValue };
      
      const newPrimitives = [...project.modelData.primitives];
      
      param.affectedPrimitives.forEach(idx => {
          if (newPrimitives[idx]) {
             const p = { ...newPrimitives[idx] };
             // Uniform scale for simplicity. In a real CAD app, this would be constrained to specific axes.
             p.dimensions = p.dimensions.map(d => d * ratio);
             newPrimitives[idx] = p;
          }
      });
      
      onUpdate({
          ...project,
          modelData: { ...project.modelData, primitives: newPrimitives },
          assemblyData: { ...assemblyData, parameters: newParams }
      });
  };

  const handleAddParameter = () => {
      const assemblyData = ensureAssemblyData();
      const newId = `param-${Date.now()}`;
      const newP: DesignParameter = {
          id: newId,
          name: newParam.name,
          value: newParam.value,
          unit: newParam.unit,
          affectedPrimitives: [newParam.targetIndex]
      };
      
      const updatedProject = {
          ...project,
          assemblyData: {
              ...assemblyData,
              parameters: [...assemblyData.parameters, newP]
          }
      };
      onUpdate(updatedProject);
      setIsAddingParam(false);
      setNewParam({ name: 'New Parameter', value: 10, unit: 'cm', targetIndex: 0 });
  };

  const handleDeleteParameter = (id: string) => {
       const assemblyData = ensureAssemblyData();
       const updatedParams = assemblyData.parameters.filter(p => p.id !== id);
       onUpdate({
           ...project,
           assemblyData: { ...assemblyData, parameters: updatedParams }
       });
  };

  const assemblyData = ensureAssemblyData();

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <AssemblyIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assembly Studio</h1>
            <p className="text-xs text-gray-500">Advanced CAD & Motion</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => { setIsExploded(!isExploded); setIsAnimating(false); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isExploded ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Expand className="w-4 h-4" /> {isExploded ? 'Collapse View' : 'Explode View'}
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Change Project
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
             <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('library')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <Box className="w-4 h-4" /> Library
                </button>
                <button onClick={() => setActiveTab('motion')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'motion' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <RefreshCw className="w-4 h-4" /> Motion
                </button>
                <button onClick={() => setActiveTab('params')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'params' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <Settings className="w-4 h-4" /> Params
                </button>
                <button onClick={() => setActiveTab('reverse')} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'reverse' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <ScanLine className="w-4 h-4" /> Scan
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* PART LIBRARY */}
                {activeTab === 'library' && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Standard Parts</h3>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                            {STANDARD_PART_LIBRARY
                                .filter(part => 
                                    part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    part.category.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(part => (
                                <button 
                                    key={part.id}
                                    onClick={() => handleAddPart(part)}
                                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="text-xs font-bold text-gray-800 group-hover:text-blue-700">{part.name}</div>
                                    <div className="text-[10px] text-gray-500">{part.category}</div>
                                </button>
                            ))}
                             {STANDARD_PART_LIBRARY.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="col-span-2 text-center text-sm text-gray-500 py-4">
                                    No parts found.
                                </div>
                             )}
                        </div>
                    </div>
                )}

                {/* MOTION ANALYSIS */}
                {activeTab === 'motion' && (
                    <div className="space-y-6">
                         {!project.assemblyData ? (
                             <button 
                                onClick={handleAnalyzeAssembly}
                                disabled={isProcessing}
                                className="w-full py-2 bg-blue-600 text-white rounded-md font-medium shadow-sm"
                            >
                                {isProcessing ? 'Analyzing...' : 'Detect Joints with AI'}
                            </button>
                         ) : (
                             <>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">Simulation Config</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" /> Duration (s)
                                            </label>
                                            <input 
                                                type="number" 
                                                value={simDuration}
                                                onChange={(e) => setSimDuration(Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                min="1"
                                                max="60"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                                                <Hash className="w-3 h-3" /> Step Count
                                            </label>
                                            <input 
                                                type="number" 
                                                value={simSteps}
                                                onChange={(e) => setSimSteps(Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                min="10"
                                                max="1000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-900">Active Joints</h3>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{assemblyData.joints.length}</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                        {assemblyData.joints.map((joint, idx) => (
                                            <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                                <div className="font-medium text-gray-800">{joint.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{joint.type} • Limits: [{joint.limits.join(', ')}]</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 space-y-3">
                                    {isAnimating && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-100 ease-linear" 
                                                style={{ width: `${simProgress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleRunSimulation}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold shadow-sm text-white transition-all ${isAnimating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {isAnimating ? <><Square className="w-4 h-4 fill-current" /> Stop Simulation</> : <><Play className="w-4 h-4 fill-current" /> Run Simulation</>}
                                    </button>
                                </div>
                             </>
                         )}
                    </div>
                )}
                
                {/* PARAMETERS */}
                {activeTab === 'params' && (
                    <div className="space-y-4">
                         {!project.assemblyData ? (
                             <div className="text-center text-gray-500 text-sm py-4">
                                 <p className="mb-2">No parameters defined.</p>
                                 <button 
                                    onClick={() => setActiveTab('motion')}
                                    className="text-blue-600 hover:underline"
                                 >
                                     Run analysis to detect automatically
                                 </button>
                                 <span className="mx-1">or</span>
                                 <button 
                                    onClick={() => setIsAddingParam(true)}
                                    className="text-blue-600 hover:underline"
                                 >
                                     add manually
                                 </button>.
                             </div>
                         ) : (
                             <div className="space-y-6">
                                 {/* Param List */}
                                 <div className="space-y-4">
                                     {assemblyData.parameters.map(param => (
                                         <div key={param.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                             <div className="flex justify-between items-center mb-2">
                                                 <label className="block text-xs font-bold text-gray-700">{param.name}</label>
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-xs text-gray-500 bg-white px-1 rounded border">{param.value.toFixed(1)} {param.unit}</span>
                                                     <button onClick={() => handleDeleteParameter(param.id)} className="text-gray-400 hover:text-red-500">
                                                         <Trash2 className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <input 
                                                     type="range" 
                                                     min={param.value > 0 ? param.value * 0.1 : 0}
                                                     max={param.value > 0 ? param.value * 3 : 100} 
                                                     step={param.value > 0 ? param.value * 0.05 : 1}
                                                     value={param.value}
                                                     onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                                                     className="flex-1 accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                 />
                                             </div>
                                             <div className="mt-1 text-[10px] text-gray-400">
                                                 Affects: {param.affectedPrimitives.map(idx => `Part #${idx + 1}`).join(', ')}
                                             </div>
                                         </div>
                                     ))}
                                 </div>

                                 {/* Add New Param Form */}
                                 {isAddingParam ? (
                                     <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3 animate-in slide-in-from-top-2">
                                         <div className="flex justify-between items-center">
                                             <h4 className="text-xs font-bold text-blue-800">New Parameter</h4>
                                             <button onClick={() => setIsAddingParam(false)} className="text-blue-400 hover:text-blue-600"><X className="w-3 h-3"/></button>
                                         </div>
                                         <input 
                                            type="text" 
                                            placeholder="Name (e.g., Length)" 
                                            className="w-full text-xs p-2 border rounded"
                                            value={newParam.name}
                                            onChange={e => setNewParam({...newParam, name: e.target.value})}
                                         />
                                         <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                placeholder="Value" 
                                                className="w-1/2 text-xs p-2 border rounded"
                                                value={newParam.value}
                                                onChange={e => setNewParam({...newParam, value: parseFloat(e.target.value)})}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Unit" 
                                                className="w-1/2 text-xs p-2 border rounded"
                                                value={newParam.unit}
                                                onChange={e => setNewParam({...newParam, unit: e.target.value})}
                                            />
                                         </div>
                                         <div>
                                             <label className="text-[10px] font-bold text-gray-500">Target Part</label>
                                             <select 
                                                className="w-full text-xs p-2 border rounded mt-1"
                                                value={newParam.targetIndex}
                                                onChange={e => setNewParam({...newParam, targetIndex: parseInt(e.target.value)})}
                                             >
                                                 {project.modelData.primitives.map((_, idx) => (
                                                     <option key={idx} value={idx}>Part #{idx + 1}</option>
                                                 ))}
                                             </select>
                                         </div>
                                         <button onClick={handleAddParameter} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">
                                             Create Parameter
                                         </button>
                                     </div>
                                 ) : (
                                    <button 
                                        onClick={() => setIsAddingParam(true)}
                                        className="w-full py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600"
                                    >
                                        <Plus className="w-4 h-4" /> Add Parameter
                                    </button>
                                 )}
                             </div>
                         )}
                    </div>
                )}

                {/* REVERSE ENGINEERING */}
                {activeTab === 'reverse' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-dashed border-gray-300">
                             <ScanLine className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                             <button onClick={handleImportScan} className="text-sm text-blue-600 font-medium hover:underline">Import Mesh/Scan File</button>
                        </div>
                        {assemblyData.scannedMesh && (
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700">AI Reconstruction</label>
                                <textarea 
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md" 
                                    rows={3}
                                    placeholder="Describe what this scanned object is (e.g., 'A vintage car door handle')..."
                                    value={scannedDesc}
                                    onChange={(e) => setScannedDesc(e.target.value)}
                                />
                                <button 
                                    onClick={handleReconstruct}
                                    disabled={!scannedDesc || isProcessing}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                    {isProcessing ? 'Reconstructing...' : 'Convert to CAD'}
                                </button>
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
                    animateAssembly={isAnimating}
                    explodedView={isExploded}
                />
            </div>
        </main>
      </div>
    </div>
  );
};

export default AssemblyStudio;
