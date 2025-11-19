
import React from 'react';
import { Page } from '../types';
import { NAV_ITEMS, FEATURE_ITEMS } from '../constants';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen }) => {
  return (
    <aside className={`w-64 bg-white text-brand-text flex flex-col h-screen fixed shadow-md z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <div className="bg-gradient-to-br from-brand-secondary to-brand-primary p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <div>
          <h1 className="text-lg font-bold">AI-Designer</h1>
          <p className="text-xs text-brand-subtext">AI CAD Automation</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-6">
        <div>
          <h2 className="px-2 text-xs font-semibold text-brand-subtext uppercase tracking-wider">Navigation</h2>
          <ul className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate(item.page); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? 'bg-brand-light text-brand-primary'
                      : 'text-brand-subtext hover:bg-gray-100 hover:text-brand-text'
                  }`}
                >
                  <span className="w-5 h-5">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
         <div>
          <h2 className="px-2 text-xs font-semibold text-brand-subtext uppercase tracking-wider">Features</h2>
          <ul className="mt-2 space-y-1">
            {FEATURE_ITEMS.map((item) => (
              <li key={item.name} className="flex items-center gap-3 px-3 py-2 text-sm text-brand-subtext">
                 <span className="w-5 h-5 text-gray-400">{item.icon}</span>
                 {item.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                    RL
                </div>
                <div>
                    <p className="text-sm font-semibold">Rajendra Le09</p>
                    <p className="text-xs text-brand-subtext">admin</p>
                </div>
            </div>
            <button className="text-brand-subtext hover:text-brand-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;