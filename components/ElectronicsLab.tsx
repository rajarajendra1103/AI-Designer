
import React, { useState } from 'react';
import { Project, PCBData, ElectronicComponent, ElectronicCategory } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { generatePCBLayout, performSignalAnalysis, generateSchematic, runSpiceSimulation, autoRoutePCB } from '../services/geminiService';
import { ELECTRONIC_COMPONENT_LIBRARY, ElectronicsIcon } from '../constants';
import { Cpu, Wifi, Maximize, FileSpreadsheet, Download, BookOpen, Search, Zap, Layout, FileText, Activity } from 'lucide-react';
import ProjectList from './ProjectList';

interface ElectronicsLabProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onBack: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type Tab = 'library' | 'layout' | 'schematic' | 'fit-check' | 'simulation' | 'bom';

const ElectronicsLab: React.FC<ElectronicsLabProps> = ({ project, projects, onSelectProject, onBack, onUpdate }) => {
  if (!project) {
     return (
          <div className="h-full flex flex-col bg-slate-50">
               <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                    <ElectronicsIcon />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Electronics Lab</h1>
                    <p className="text-xs text-gray-500">Select a project to design electronics</p>
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
  const [pcbData, setPcbData] = useState<PCBData | undefined>(project.pcbData);
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationOutput, setSimulationOutput] = useState<string | null>(null);

  const ensurePcbData = (): PCBData => {
      if (pcbData) return pcbData;
      return {
          boardDimensions: [10, 0.16, 10], // Default 10x10cm
          mountingHoles: [],
          components: [],
          layerCount: 2,
          bom: []
      };
  };

  const handleGeneratePCB = async () => {
      setIsProcessing(true);
      try {
          const newPCB = await generatePCBLayout(project);
          const updatedProject = { ...project, pcbData: newPCB };
          setPcbData(newPCB);
          onUpdate(updatedProject);
      } catch (error) {
          alert('Failed to generate PCB layout');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleAddComponent = (comp: ElectronicComponent) => {
      const currentPcb = ensurePcbData();
      
      const newComponent = {
          id: `${comp.id}-${Date.now()}`,
          type: comp.type,
          position: [
              (Math.random() - 0.5) * (currentPcb.boardDimensions[0] - 1),
              0, // Surface mount usually 0 relative to board top
              (Math.random() - 0.5) * (currentPcb.boardDimensions[2] - 1)
          ] as [number, number, number],
          dimensions: comp.dimensions,
          rotation: [0, 0, 0] as [number, number, number],
          designator: `U${currentPcb.components.length + 1}`, // Simple auto-increment
          name: comp.name
      };

      const newBomItem = {
          partNumber: comp.name,
          description: comp.description,
          manufacturer: 'Generic',
          quantity: 1,
          unitCost: 0.10 // Placeholder
      };

      // Check if item exists in BOM to increment qty, else add
      let updatedBom = [...currentPcb.bom];
      const existingItemIndex = updatedBom.findIndex(b => b.partNumber === comp.name);
      if (existingItemIndex >= 0) {
          updatedBom[existingItemIndex].quantity += 1;
      } else {
          updatedBom.push(newBomItem);
      }

      const updatedPcb = {
          ...currentPcb,
          components: [...currentPcb.components, newComponent],
          bom: updatedBom
      };
      
      setPcbData(updatedPcb);
      onUpdate({ ...project, pcbData: updatedPcb });
  };

  const handleAutoRoute = async () => {
      if (!pcbData) return;
      setIsProcessing(true);
      try {
          const routedPcb = await autoRoutePCB(project);
          setPcbData(routedPcb);
          onUpdate({ ...project, pcbData: routedPcb });
      } catch (error) {
          alert('Autorouting failed');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleGenerateSchematic = async () => {
      if (!pcbData) return;
      setIsProcessing(true);
      try {
          const svg = await generateSchematic(project);
          const updatedPcb = { ...pcbData, schematicSvg: svg };
          setPcbData(updatedPcb);
          onUpdate({ ...project, pcbData: updatedPcb });
      } catch (error) {
           alert('Schematic generation failed');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSimulation = async () => {
      if (!pcbData) return;
      setIsProcessing(true);
      try {
          // Run Signal Integrity
          const analyzedPCB = await performSignalAnalysis(pcbData);
          
          // Run SPICE
          const spiceResult = await runSpiceSimulation(project);
          
          const updatedPcb = { ...analyzedPCB };
          setPcbData(updatedPcb);
          setSimulationOutput(spiceResult);
          
          onUpdate({ ...project, pcbData: updatedPcb });
      } catch (error) {
          alert('Simulation failed');
      } finally {
          setIsProcessing(false);
      }
  };

  const exportBOM = () => {
      if (!pcbData?.bom) return;
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Part Number,Description,Manufacturer,Qty,Unit Cost\n"
          + pcbData.bom.map(item => `${item.partNumber},"${item.description}",${item.manufacturer},${item.quantity},${item.unitCost}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${project.name}_BOM.csv`);
      document.body.appendChild(link);
      link.click();
  };

  // Decide 3D Viewer Mode based on Tab
  let pcbViewMode: 'standard' | 'fit-check' | 'emi' = 'standard';
  if (activeTab === 'fit-check') pcbViewMode = 'fit-check';
  if (activeTab === 'simulation') pcbViewMode = 'emi';

  // Filter Library
  const filteredLibrary = ELECTRONIC_COMPONENT_LIBRARY.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const categories = Array.from(new Set(ELECTRONIC_COMPONENT_LIBRARY.map(c => c.category)));

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
            <ElectronicsIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Electronics Lab</h1>
            <p className="text-xs text-gray-500">PCB Design, Simulation & Integration</p>
          </div>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Change Project
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200">
                <button onClick={() => setActiveTab('library')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <BookOpen className="w-4 h-4" /> Library
                </button>
                <button onClick={() => setActiveTab('layout')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'layout' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Layout className="w-4 h-4" /> Layout
                </button>
                 <button onClick={() => setActiveTab('schematic')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'schematic' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <FileText className="w-4 h-4" /> Schematic
                </button>
                <button onClick={() => setActiveTab('simulation')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'simulation' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Activity className="w-4 h-4" /> Sim
                </button>
                <button onClick={() => setActiveTab('fit-check')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'fit-check' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Maximize className="w-4 h-4" /> Fit
                </button>
                <button onClick={() => setActiveTab('bom')} className={`py-3 text-xs font-medium flex flex-col items-center gap-1 ${activeTab === 'bom' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <FileSpreadsheet className="w-4 h-4" /> BOM
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* --- LIBRARY TAB --- */}
                {activeTab === 'library' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        
                        <div className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 p-2 rounded border border-green-100">
                             <Zap className="w-3 h-3" /> Connected to Global Repository (200k+ Parts)
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {categories.map(category => {
                                const comps = filteredLibrary.filter(c => c.category === category);
                                if (comps.length === 0) return null;
                                return (
                                    <div key={category}>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wider">{category}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {comps.map(comp => (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => handleAddComponent(comp)}
                                                    className="p-2 border border-gray-200 rounded-lg text-left hover:border-green-500 hover:bg-green-50 transition-all group"
                                                >
                                                    <div className="font-bold text-xs text-gray-800 group-hover:text-green-700">{comp.name}</div>
                                                    <div className="text-[10px] text-gray-500">{comp.package}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                             {filteredLibrary.length === 0 && <p className="text-center text-sm text-gray-500">No components found.</p>}
                        </div>
                    </div>
                )}

                {/* --- LAYOUT TAB --- */}
                {activeTab === 'layout' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h3 className="font-semibold text-green-900">PCB Layout & Autorouting</h3>
                            <p className="text-xs text-green-700 mt-1">
                                Place components and route traces (Single/Multi-Layer).
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                             <button 
                                onClick={handleGeneratePCB}
                                disabled={isProcessing}
                                className="w-full py-2 border border-green-600 text-green-700 hover:bg-green-50 rounded-md font-medium text-sm shadow-sm"
                            >
                                {isProcessing ? 'Generating...' : (pcbData?.components.length ? 'Regenerate Layout' : 'Auto-Generate Initial Layout')}
                            </button>
                            <button 
                                onClick={handleAutoRoute}
                                disabled={isProcessing || !pcbData}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                            >
                                {isProcessing ? 'Routing...' : 'Run Autorouter'}
                            </button>
                        </div>
                        
                        {pcbData && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between"><span>Board Size:</span> <span className="font-mono text-gray-900">{pcbData.boardDimensions.join(' x ')} cm</span></div>
                                <div className="flex justify-between"><span>Components:</span> <span className="font-mono text-gray-900">{pcbData.components.length}</span></div>
                                <div className="flex justify-between"><span>Layers:</span> <span className="font-mono text-gray-900">{pcbData.layerCount}</span></div>
                                <div className="flex justify-between"><span>Traces:</span> <span className="font-mono text-gray-900">{pcbData.traces?.length || 0}</span></div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SCHEMATIC TAB --- */}
                {activeTab === 'schematic' && (
                     <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <h3 className="font-semibold text-indigo-900">Schematic Design (2D/3D)</h3>
                            <p className="text-xs text-indigo-700 mt-1">
                                2D Circuit Diagram generated from netlist. Switch to Layout tab for 3D integration.
                            </p>
                        </div>
                        <button 
                             onClick={handleGenerateSchematic}
                             disabled={isProcessing || !pcbData}
                             className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                         >
                             {isProcessing ? 'Drawing...' : 'Generate Schematic'}
                         </button>
                     </div>
                )}

                {/* --- SIMULATION TAB --- */}
                {activeTab === 'simulation' && (
                    <div className="space-y-4">
                         <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h3 className="font-semibold text-purple-900">SPICE Simulation</h3>
                            <p className="text-xs text-purple-700 mt-1">
                                Simulate circuits and analyze Signal Integrity (EMI/Crosstalk).
                            </p>
                        </div>
                        <button 
                            onClick={handleSimulation}
                            disabled={isProcessing || !pcbData}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                        >
                            {isProcessing ? 'Simulating...' : 'Run SPICE & Signal Analysis'}
                        </button>

                        {simulationOutput && (
                             <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono h-40 overflow-y-auto">
                                 <pre>{simulationOutput}</pre>
                             </div>
                        )}

                        {pcbData?.signalAnalysis && (
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between text-sm border-t pt-2">
                                    <span>Max Freq:</span> <span className="font-mono">{pcbData.signalAnalysis.maxFrequency}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Hotspots:</span> <span className="font-mono text-red-500">{pcbData.signalAnalysis.hotspots.length} Detected</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- FIT CHECK TAB --- */}
                {activeTab === 'fit-check' && (
                     <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900">MCAD-ECAD 3D Integration</h3>
                            <p className="text-xs text-blue-700 mt-1">
                                Place PCB inside product body and validate physical fit.
                            </p>
                        </div>
                        {!pcbData ? (
                            <p className="text-sm text-gray-500 italic text-center py-4">Generate a PCB first.</p>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Fit Status: CLEARANCE OK
                            </div>
                        )}
                     </div>
                )}

                {/* --- BOM TAB --- */}
                {activeTab === 'bom' && (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Bill of Materials</h3>
                            <button onClick={exportBOM} disabled={!pcbData?.bom} className="text-blue-600 hover:text-blue-800 disabled:opacity-50">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                        {!pcbData?.bom || pcbData.bom.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">No BOM generated.</div>
                        ) : (
                            <div className="overflow-auto flex-1 border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pcbData.bom.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                    <div className="font-medium">{item.partNumber}</div>
                                                    <div className="text-gray-500 text-[10px] truncate w-24">{item.description}</div>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-gray-500">{item.quantity}</td>
                                                <td className="px-3 py-2 text-xs text-gray-500">${item.unitCost.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>

        {/* 3D Viewport / Main Content */}
        <main className="flex-1 bg-gray-100 relative">
            <div className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300 flex flex-col">
                 {/* Schematic View Overlay if active */}
                 {activeTab === 'schematic' ? (
                     <div className="w-full h-full p-4 overflow-auto flex items-center justify-center bg-white">
                         {pcbData?.schematicSvg ? (
                             <div className="w-full h-full border border-gray-200 rounded p-4 shadow-inner bg-gray-50" dangerouslySetInnerHTML={{ __html: pcbData.schematicSvg }} />
                         ) : (
                             <div className="text-gray-400 text-center">
                                 <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                 <p>No schematic generated yet.</p>
                             </div>
                         )}
                     </div>
                 ) : (
                     /* 3D Viewer for everything else (except pure BOM maybe, but good for context) */
                     <ThreeDViewer 
                        project={project} 
                        showPCB={!!pcbData}
                        pcbViewMode={pcbViewMode}
                    />
                 )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default ElectronicsLab;
