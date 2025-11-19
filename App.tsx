import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIGenerator from './components/AIGenerator';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import EditProject from './components/EditProject';
import ManualEditor from './components/ManualEditor';
import { Page, Project } from './types';
import { INITIAL_PROJECTS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [projects, setProjects] = useState<Project[]>([...INITIAL_PROJECTS]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setError(null);
  };

  const handleNavigateAndCloseSidebar = (page: Page) => {
    handleNavigate(page);
    setIsSidebarOpen(false);
  };

  const handleGenerationComplete = useCallback((newProject: Project) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setCurrentProject(newProject);
    setCurrentPage('view_project');
  }, []);

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentPage('view_project');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setCurrentPage('view_project'); // Go back to view page after saving
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    // If the deleted project was the one being viewed, go back to the list
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      setCurrentPage('projects');
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard projects={projects} onNavigate={handleNavigate} />;
      case 'generator':
        return <AIGenerator onGenerationComplete={handleGenerationComplete} />;
      case 'projects':
        return <ProjectList 
                  projects={projects} 
                  onSelectProject={handleSelectProject} 
                  onDeleteProject={handleDeleteProject}
                />;
      case 'view_project':
        if (currentProject) {
          return <ProjectView 
                    project={currentProject} 
                    onBack={() => handleNavigate('projects')} 
                    onEdit={() => handleNavigate('edit_project')}
                    onManualEdit={() => handleNavigate('manual_editor')}
                    onDelete={handleDeleteProject}
                 />;
        }
        return null;
      case 'edit_project':
        if (currentProject) {
            return <EditProject project={currentProject} onBack={() => handleNavigate('view_project')} onSave={handleUpdateProject} />;
        }
        return null;
      case 'manual_editor':
        if (currentProject) {
            return <ManualEditor project={currentProject} onBack={() => handleNavigate('view_project')} onSave={handleUpdateProject} />;
        }
        return null;
      default:
        return <Dashboard projects={projects} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-background font-sans">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigateAndCloseSidebar} isOpen={isSidebarOpen} />
       {isSidebarOpen && (
            <div 
                onClick={() => setIsSidebarOpen(false)} 
                className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                aria-hidden="true"
            ></div>
        )}
      <main className="flex-1 md:ml-64 overflow-y-auto">
         <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-20 border-b p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-brand-secondary to-brand-primary p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h1 className="text-md font-bold text-brand-text">AI-Designer</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2" aria-label="Open menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </header>
        {error && (
            <div className="m-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
