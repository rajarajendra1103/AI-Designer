import React, { useState, useCallback } from 'react';
import { Project } from '../types';
import ThreeDViewer from './ThreeDViewer';
import { refineDesign } from '../services/geminiService';
import { EditIcon, GeneratorIcon } from '../constants';

// Custom hook for managing state history with undo/redo
const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentState = history[historyIndex];

  const setState = useCallback((action: T | ((prevState: T) => T)) => {
    const newState = typeof action === 'function' ? (action as (prevState: T) => T)(currentState) : action;
    
    // Don't add a new state if it's identical to the current one.
    if (JSON.stringify(newState) === JSON.stringify(currentState)) {
        return;
    }
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [currentState, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { state: currentState, setState, undo, redo, canUndo, canRedo };
};


interface ManualEditorProps {
  project: Project;
  onBack: () => void;
  onSave: (updatedProject: Project) => void;
}

const ManualEditor: React.FC<ManualEditorProps> = ({ project, onBack, onSave }) => {
  const { 
    state: editedProject, 
    setState: setEditedProject, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(project);
  
  const [prompt, setPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!prompt || isRefining) return;
    setIsRefining(true);
    setError(null);
    try {
      const refinedProject = await refineDesign(editedProject, prompt);
      setEditedProject(refinedProject);
      setPrompt(''); // Clear prompt on success
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during refinement.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = () => {
    onSave(editedProject);
  };
  
  return (
    <div className="p-8 h-full flex flex-col">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
          <div className="flex items-center gap-3">
             <span className="text-brand-primary"><EditIcon /></span>
            <div>
              <h1 className="text-3xl font-bold text-brand-text">Manual Editor: {project.name}</h1>
              <p className="text-brand-subtext mt-1">Use AI to make iterative refinements to your design.</p>
            </div>
          </div>
        <div className="flex items-center gap-2">
            <button
                onClick={undo}
                disabled={!canUndo}
                className="bg-white border border-gray-300 text-brand-text font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Undo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h12a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H7"/><path d="m7 15-4-4 4-4"/></svg>
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="bg-white border border-gray-300 text-brand-text font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Redo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9H9a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h8"/><path d="m17 15 4-4-4-4"/></svg>
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2"></div>
            <button onClick={onBack} className="bg-white border border-gray-300 text-brand-text font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50">
                Discard & Go Back
            </button>
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg">
                Save & Exit
            </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* 3D Viewer Column */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-md flex flex-col">
            <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Live Preview
            </h3>
            <div className="flex-1 min-h-[400px]">
                 <ThreeDViewer project={editedProject} />
            </div>
        </div>
        
        {/* AI Refinement Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col">
            <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
                <span className="text-brand-primary"><GeneratorIcon /></span>
                AI Refinements
            </h3>
            <p className="text-sm text-brand-subtext mb-4">
                Describe the changes you want to make. For example: "Make the walls thicker," "Add windows to the design," or "Change the material to brushed aluminum."
            </p>

            {error && (
                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    <strong className="font-bold">Refinement Error: </strong>
                    <span>{error}</span>
                </div>
            )}
            
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Make it twice as tall and use wood as the primary material..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                    disabled={isRefining}
                />
                <button
                  onClick={handleRefine}
                  disabled={!prompt || isRefining}
                  className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isRefining ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Refining...
                    </>
                  ) : (
                     'Refine with AI'
                  )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEditor;