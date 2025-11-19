import React, { useState, useEffect } from 'react';
import { Project, ProjectComponent } from '../types';
import { optimizeDesign } from '../services/geminiService';
import ThreeDViewer from './ThreeDViewer';

interface EditProjectProps {
  project: Project;
  onBack: () => void;
  onSave: (updatedProject: Project) => void;
}

const TABS: ('Materials' | 'Components')[] = ['Materials', 'Components'];

const EditProject: React.FC<EditProjectProps> = ({ project, onBack, onSave }) => {
  const [formData, setFormData] = useState<Project>(project);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index: number, field: keyof ProjectComponent, value: string) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData(prev => ({ ...prev, components: newComponents }));
  };

  const handleAddComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, { name: '', description: '' }],
    }));
  };
  
  const handleRemoveComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleAiOptimize = async () => {
    setIsOptimizing(true);
    setError(null);
    try {
        const optimizedProject = await optimizeDesign(formData);
        setFormData(optimizedProject);
    } catch (err: any) {
        setError(err.message || 'An unknown optimization error occurred.');
    } finally {
        setIsOptimizing(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };
  
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
           <button onClick={onBack} className="text-brand-primary hover:text-brand-secondary flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to View
          </button>
          <div className="flex items-center gap-3">
             <span className="text-brand-primary"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 3.63a2.12 2.12 0 1 1 3 3L12 16l-4 1 1-4Z"/></svg></span>
            <div>
              <h1 className="text-3xl font-bold text-brand-text">Edit: {project.name}</h1>
              <p className="text-brand-subtext mt-1">Refine project properties</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={handleAiOptimize}
                disabled={isOptimizing}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-brand-text font-semibold py-2 px-6 rounded-lg shadow-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Save Changes
            </button>
        </div>
      </header>

       {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                <strong className="font-bold">Optimization Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-subtext">Project Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-brand-subtext">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-1 px-4" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            activeTab === tab
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                        >
                        {tab}
                        </button>
                    ))}
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'Materials' && (
                        <div>
                            <label htmlFor="materials" className="block text-sm font-medium text-brand-subtext">Materials (comma-separated)</label>
                            <input type="text" name="materials" id="materials" value={formData.materials.join(', ')} onChange={(e) => setFormData(prev => ({...prev, materials: e.target.value.split(',').map(m => m.trim())}))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    )}
                    {activeTab === 'Components' && (
                        <div className="space-y-4">
                            {formData.components.map((comp, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                                    <div className="md:col-span-5">
                                        <input type="text" placeholder="Component Name" value={comp.name} onChange={(e) => handleComponentChange(index, 'name', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div className="md:col-span-6">
                                        <input type="text" placeholder="Component Description" value={comp.description} onChange={(e) => handleComponentChange(index, 'description', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div className="md:col-span-1 flex items-center">
                                        <button onClick={() => handleRemoveComponent(index)} className="text-red-500 hover:text-red-700 p-2 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                             <button onClick={handleAddComponent} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md">Add Component</button>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md sticky top-8">
                <h3 className="p-4 text-lg font-semibold text-brand-text border-b border-gray-200">Live Preview</h3>
                <div className="p-2 min-h-[450px]">
                    {formData && <ThreeDViewer project={formData} />}
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EditProject;