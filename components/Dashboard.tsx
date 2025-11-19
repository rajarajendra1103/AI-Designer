
import React from 'react';
import { Project, Page } from '../types';
import { GeneratorIcon } from '../constants';

interface DashboardProps {
  projects: Project[];
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onNavigate }) => {
  const totalProjects = projects.length + 5; // Simulating more projects for display
  const generatedThisMonth = 5;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text">Design Command Center</h1>
        <p className="text-brand-subtext mt-1">Transform ideas into intelligent CAD models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('generator')} 
          className="bg-gradient-to-br from-brand-secondary to-brand-primary text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="text-4xl mb-4">
            <GeneratorIcon />
          </div>
          <h3 className="text-xl font-bold">New Design</h3>
          <p className="text-sm opacity-80">Generate with AI</p>
        </div>
        
        <div 
          onClick={() => onNavigate('projects')} 
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="text-green-500 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
          </div>
          <h3 className="text-xl font-bold text-brand-text">Browse Projects</h3>
          <p className="text-sm text-brand-subtext">View all designs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="text-blue-500 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3 className="text-xl font-bold text-brand-text">Import CAD</h3>
          <p className="text-sm text-brand-subtext">Upload existing files</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm text-brand-subtext">Total Projects</p>
            <p className="text-3xl font-bold text-brand-text">{totalProjects}</p>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              +12% this month
            </p>
          </div>
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm text-brand-subtext">Generated This Month</p>
            <p className="text-3xl font-bold text-brand-text">{generatedThisMonth}</p>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              AI-powered
            </p>
          </div>
          <div className="bg-brand-light text-brand-primary p-4 rounded-full">
            <GeneratorIcon />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;