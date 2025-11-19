import React, { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
                <h1 className="text-3xl font-bold text-brand-text">Projects</h1>
                <p className="text-brand-subtext mt-1">Browse and manage your generated designs.</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-brand-primary shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    aria-label="List view"
                >
                    List
                </button>
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-brand-primary shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    aria-label="Grid view"
                >
                    Grid
                </button>
            </div>
        </div>
        <div className="relative">
            <input
                type="text"
                placeholder="Search projects by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
        </div>
      </header>

      {filteredProjects.length > 0 ? (
        <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
        }>
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              viewMode={viewMode}
              onSelectProject={onSelectProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-brand-subtext bg-white rounded-xl shadow-md">
            <p className="font-semibold text-lg">{projects.length > 0 ? 'No projects match your search.' : 'No projects yet.'}</p>
            <p>Try the AI Generator to create your first design!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
