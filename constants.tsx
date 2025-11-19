import React from 'react';
import { Page, Project, ReusableComponent } from './types';

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
export const NAV_ITEMS: { name: string; page: Page; icon: React.ReactNode }[] = [
  { name: 'Dashboard', page: 'dashboard', icon: <DashboardIcon /> },
  { name: 'AI Generator', page: 'generator', icon: <GeneratorIcon /> },
  { name: 'Projects', page: 'projects', icon: <ProjectsIcon /> },
];

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
export const FEATURE_ITEMS: { name: string; icon: React.ReactNode }[] = [
    { name: 'AI Design Generation', icon: <GeneratorIcon /> },
    { name: 'Manual Editing', icon: <EditIcon /> },
    { name: '3D Visualization', icon: <ThreeDIcon /> },
];

export const EXAMPLE_PROMPTS = [
    { title: 'Industrial Warehouse', description: 'A large industrial warehouse building with steel framing...' },
    { title: 'Ergonomic Office Desk', description: 'Modern adjustable standing desk with electric height...' },
    { title: 'Gear Assembly', description: 'Mechanical gear assembly with 5 interlocking gear...' },
];

export const REUSABLE_COMPONENTS: ReusableComponent[] = [
    { id: 'comp-screw', name: 'M5 Hex Bolt', description: 'Standard M5 metric hex bolt for fastening.', icon: <ScrewIcon /> },
    { id: 'comp-bracket', name: 'L-Bracket', description: 'A 90-degree metal bracket for structural support.', icon: <BracketIcon /> },
    { id: 'comp-actuator', name: 'Linear Actuator', description: 'Provides linear motion, 100mm stroke.', icon: <ActuatorIcon /> },
    { id: 'comp-servo', name: '9g Servo Motor', description: 'A small servo motor for controlled rotational movement.', icon: <ServoIcon /> },
];


// FIX: Explicitly type INITIAL_PROJECTS as Project[] to fix type inference issue where primitive types were being inferred as string instead of the specific 'box' | 'cylinder' | 'sphere' union type. This resolves the assignment error in App.tsx.
export const INITIAL_PROJECTS: Project[] = [
    {
      id: 'proj-1',
      name: 'Ergonomic Office Chair',
      category: 'furniture',
      description: 'A modern, ergonomic office chair with adjustable lumbar support, armrests, and a mesh back for breathability. It features a five-star base with casters for mobility.',
      materials: ['Aluminum', 'Mesh Fabric', 'High-density Foam'],
      components: [
        { name: 'Base', description: 'Five-star aluminum base with casters' },
        { name: 'Seat', description: 'Contoured seat with high-density foam' },
        { name: 'Backrest', description: 'Breathable mesh back with lumbar support' },
        { name: 'Armrests', description: '4D adjustable armrests' }
      ],
      status: 'refined',
      created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      modelData: {
        primitives: [
          // Base
          { type: 'cylinder', position: [0, 5, 0], dimensions: [3, 10], rotation: [0, 0, 0], color: '#64748b' }, // stem
          // Legs
          { type: 'box', position: [20, 1, 0], dimensions: [40, 2, 4], rotation: [0, 15, 0], color: '#475569' },
          { type: 'box', position: [-20, 1, 0], dimensions: [40, 2, 4], rotation: [0, -15, 0], color: '#475569' },
          { type: 'box', position: [0, 1, 20], dimensions: [4, 2, 40], rotation: [0, 75, 0], color: '#475569' },
          { type: 'box', position: [0, 1, -20], dimensions: [4, 2, 40], rotation: [0, -75, 0], color: '#475569' },
           // Seat
          { type: 'box', position: [0, 12, 0], dimensions: [45, 4, 45], rotation: [0, 0, 0], color: '#1e293b' },
          // Backrest
          { type: 'box', position: [0, 45, -20], dimensions: [45, 60, 5], rotation: [10, 0, 0], color: '#334155' },
        ]
      }
    },
    {
      id: 'proj-2',
      name: 'Bookshelf',
      category: 'furniture',
      description: 'A simple wooden bookshelf with 4 shelves.',
      materials: ['Oak Wood', 'Varnish'],
      components: [
        { name: 'Side Panels', description: 'Two vertical side panels' },
        { name: 'Shelves', description: 'Four horizontal shelves' },
        { name: 'Back Panel', description: 'Thin back panel for stability' }
      ],
      status: 'generated',
      created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      modelData: {
        primitives: [
          // Side panels
          { type: 'box', position: [-39, 90, 0], dimensions: [2, 180, 30], rotation: [0, 0, 0], color: '#b45309' },
          { type: 'box', position: [39, 90, 0], dimensions: [2, 180, 30], rotation: [0, 0, 0], color: '#b45309' },
          // Shelves
          { type: 'box', position: [0, 1, 0], dimensions: [76, 2, 30], rotation: [0, 0, 0], color: '#d97706' },
          { type: 'box', position: [0, 60, 0], dimensions: [76, 2, 30], rotation: [0, 0, 0], color: '#d97706' },
          { type: 'box', position: [0, 120, 0], dimensions: [76, 2, 30], rotation: [0, 0, 0], color: '#d97706' },
          { type: 'box', position: [0, 179, 0], dimensions: [76, 2, 30], rotation: [0, 0, 0], color: '#d97706' },
          // Back panel
          { type: 'box', position: [0, 90, -14.5], dimensions: [80, 180, 1], rotation: [0, 0, 0], color: '#f59e0b' },
        ]
      }
    }
];


export function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 3.63a2.12 2.12 0 1 1 3 3L12 16l-4 1 1-4Z"/></svg>
  );
}

export function GeneratorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  );
}

export function ProjectsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
  );
}

export function EditIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    );
}

export function ThreeDIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4-4-4 4"/><path d="m17 20 4-4"/><path d="m21 8-4-4-4 4"/><path d="m17 4 4 4"/><path d="M3 12v-2c0-1.1.9-2 2-2h2"/><path d="M3 18v-2"/><path d="M5 20h2c1.1 0 2-.9 2-2v-2"/><path d="M11 4h2"/><path d="M9 4h2c1.1 0 2 .9 2 2v2"/><path d="M3 8v2"/></svg>
    );
}

// Icons for Reusable Components
export function ScrewIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2"/><path d="m7 13 5 5 5-5"/><path d="M18 6H6"/></svg>;
}
export function BracketIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H4v4"/><path d="M4 16v4h4"/><path d="M16 3h4v4"/><path d="M20 16v4h-4"/><path d="M4 8h16"/></svg>;
}
export function ActuatorIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"/><path d="M6 14h12"/><path d="M12 14v6"/><path d="M10 20h4"/></svg>;
}
export function ServoIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="10" rx="2"/><path d="M7 10V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><path d="M12 10V4h2"/><path d="m10 4-2 3"/><path d="m14 4 2 3"/></svg>;
}