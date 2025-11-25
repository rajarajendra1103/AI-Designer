
import React from 'react';
import { Page, Project, ReusableComponent, MachineProfile, StandardPart, ElectronicComponent } from './types';

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
export const NAV_ITEMS: { name: string; page: Page; icon: React.ReactNode }[] = [
  { name: 'Dashboard', page: 'dashboard', icon: <DashboardIcon /> },
  { name: 'AI Generator', page: 'generator', icon: <GeneratorIcon /> },
  { name: 'Projects', page: 'projects', icon: <ProjectsIcon /> },
  { name: 'Architecture', page: 'aec', icon: <ArchitectureIcon /> },
  { name: 'Media & VFX', page: 'media', icon: <MediaIcon /> },
  { name: 'Assembly', page: 'assembly', icon: <AssemblyIcon /> },
  { name: 'Electronics', page: 'electronics', icon: <ElectronicsIcon /> },
  { name: 'Simulation', page: 'simulation', icon: <SimulationIcon /> },
  { name: 'Manufacturing', page: 'manufacturing', icon: <ManufacturingIcon /> },
  { name: 'Features', page: 'features', icon: <FeaturesIcon /> },
];

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
export const FEATURE_ITEMS: { name: string; icon: React.ReactNode }[] = [
    { name: 'AI Design Generation', icon: <GeneratorIcon /> },
    { name: 'Manual Editing', icon: <EditIcon /> },
    { name: '3D Visualization', icon: <ThreeDIcon /> },
    { name: 'Assembly & Motion', icon: <AssemblyIcon /> },
    { name: 'CNC Simulation', icon: <ManufacturingIcon /> },
    { name: 'CAE Analysis', icon: <SimulationIcon /> },
    { name: 'Electronics Lab', icon: <ElectronicsIcon /> },
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

export const STANDARD_PART_LIBRARY: StandardPart[] = [
    // Mechanical
    { 
        id: 'std-bearing-608', name: '608 Ball Bearing', category: 'Bearings',
        primitive: { type: 'cylinder', dimensions: [2.2, 0.7], position: [0,0,0], rotation: [90,0,0], color: '#A0A0A0' }
    },
    { 
        id: 'std-bolt-m6', name: 'M6x20 Bolt', category: 'Fasteners',
        primitive: { type: 'cylinder', dimensions: [0.6, 2], position: [0,0,0], rotation: [0,0,0], color: '#333333' }
    },
    { 
        id: 'std-gear-20t', name: 'Spur Gear 20T', category: 'Gears',
        primitive: { type: 'cylinder', dimensions: [4, 1], position: [0,0,0], rotation: [90,0,0], color: '#B8860B' }
    },
    { 
        id: 'std-motor-nema17', name: 'NEMA 17 Stepper', category: 'Motors',
        primitive: { type: 'box', dimensions: [4.2, 4.2, 3.4], position: [0,0,0], rotation: [0,0,0], color: '#222222' }
    },
    
    // Civil / Structural / Architecture
    {
        id: 'civ-beam-i', name: 'I-Beam (Steel)', category: 'Structural',
        primitive: { type: 'box', dimensions: [20, 20, 200], position: [0,0,0], rotation: [0,0,0], color: '#475569' } // Using box to approx I-beam for now
    },
    {
        id: 'civ-col-conc', name: 'Concrete Column', category: 'Civil',
        primitive: { type: 'cylinder', dimensions: [15, 300], position: [0,0,0], rotation: [0,0,0], color: '#d1d5db' }
    },
    {
        id: 'civ-truss-steel', name: 'Steel Truss Segment', category: 'Structural',
        primitive: { type: 'box', dimensions: [100, 5, 5], position: [0,0,0], rotation: [0,0,0], color: '#94a3b8' }
    },
    {
        id: 'arch-wall-panel', name: 'Prefab Wall Panel', category: 'Architecture',
        primitive: { type: 'box', dimensions: [120, 240, 10], position: [0,0,0], rotation: [0,0,0], color: '#f3f4f6' }
    },
    {
        id: 'arch-wood-joint', name: 'Wood Box Joint', category: 'Architecture',
        primitive: { type: 'box', dimensions: [10, 10, 10], position: [0,0,0], rotation: [0,0,0], color: '#d97706' }
    }
];

export const ELECTRONIC_COMPONENT_LIBRARY: ElectronicComponent[] = [
    // Passive
    { id: 'ec-res-1k', name: 'Resistor 1kΩ', category: 'Passive', description: '1k Ohm 1/4W Resistor', package: '0805', dimensions: [0.2, 0.05, 0.12], color: '#3b82f6', type: 'resistor' },
    { id: 'ec-cap-10uf', name: 'Capacitor 10µF', category: 'Passive', description: '10uF Ceramic Capacitor', package: '0805', dimensions: [0.2, 0.05, 0.12], color: '#d4d4d8', type: 'capacitor' },
    { id: 'ec-ind-10uh', name: 'Inductor 10µH', category: 'Passive', description: 'Power Inductor', package: 'SMD', dimensions: [0.5, 0.3, 0.5], color: '#4b5563', type: 'inductor' },
    
    // Active
    { id: 'ec-ic-555', name: 'NE555 Timer', category: 'Active', description: 'Precision Timer IC', package: 'DIP-8', dimensions: [0.9, 0.3, 0.6], color: '#111111', type: 'ic' },
    { id: 'ec-ic-atmega', name: 'ATmega328P', category: 'Active', description: '8-bit Microcontroller', package: 'TQFP-32', dimensions: [0.7, 0.1, 0.7], color: '#111111', type: 'ic' },
    { id: 'ec-tr-2n2222', name: '2N2222 Transistor', category: 'Active', description: 'NPN Transistor', package: 'TO-92', dimensions: [0.4, 0.5, 0.3], color: '#1f2937', type: 'transistor' },
    { id: 'ec-diode-1n4007', name: '1N4007 Diode', category: 'Active', description: 'General Purpose Rectifier', package: 'DO-41', dimensions: [0.5, 0.2, 0.2], color: '#b91c1c', type: 'diode' },
    { id: 'ec-mosfet-irfz44n', name: 'IRFZ44N MOSFET', category: 'Active', description: 'N-Channel Power MOSFET', package: 'TO-220', dimensions: [1.0, 1.5, 0.4], color: '#111111', type: 'transistor' },
    
    // Relay & Switching
    { id: 'ec-sw-tact', name: 'Tactile Switch', category: 'Relay & Switching', description: 'SPST Momentary Button', package: 'THT', dimensions: [0.6, 0.3, 0.6], color: '#9ca3af', type: 'switch' },
    { id: 'ec-sw-push', name: 'Push Button', category: 'Relay & Switching', description: 'Panel Mount Push Button', package: 'THT', dimensions: [1.2, 1.2, 1.2], color: '#ef4444', type: 'switch' },
    { id: 'ec-relay-5v', name: '5V Relay', category: 'Relay & Switching', description: 'Electromechanical Relay', package: 'Module', dimensions: [1.5, 1.0, 1.2], color: '#3b82f6', type: 'relay' },
    { id: 'ec-relay-contactor', name: 'Power Contactor', category: 'Relay & Switching', description: '3-Phase AC Contactor', package: 'Module', dimensions: [4.5, 7.5, 4.5], color: '#1e3a8a', type: 'relay' },
    
    // Input
    { id: 'ec-sens-dht11', name: 'DHT11', category: 'Input', description: 'Temp & Humidity Sensor', package: 'Module', dimensions: [1.2, 0.5, 1.5], color: '#60a5fa', type: 'sensor' },
    { id: 'ec-sens-ldr', name: 'LDR', category: 'Input', description: 'Light Dependent Resistor', package: 'THT', dimensions: [0.4, 0.1, 0.4], color: '#f87171', type: 'sensor' },
    { id: 'ec-sens-ir', name: 'IR Receiver', category: 'Input', description: 'Infrared Receiver Diode', package: 'THT', dimensions: [0.5, 0.6, 0.3], color: '#111111', type: 'sensor' },
    { id: 'ec-sens-pir', name: 'PIR Sensor', category: 'Input', description: 'Motion Sensor Module', package: 'Module', dimensions: [3.2, 2.4, 2.5], color: '#f3f4f6', type: 'sensor' },
    
    // Output
    { id: 'ec-out-led-r', name: 'LED Red', category: 'Output', description: '5mm Red LED', package: '5mm', dimensions: [0.5, 0.8, 0.5], color: '#ef4444', type: 'led' },
    { id: 'ec-out-buzzer', name: 'Piezo Buzzer', category: 'Output', description: 'Active Buzzer 5V', package: 'THT', dimensions: [1.2, 0.8, 1.2], color: '#111111', type: 'other' },
    { id: 'ec-out-oled', name: 'OLED Display', category: 'Output', description: '0.96" I2C OLED Screen', package: 'Module', dimensions: [2.7, 0.4, 2.7], color: '#111827', type: 'display' },
    { id: 'ec-out-motor', name: 'Vibration Motor', category: 'Output', description: 'Micro Flat Vibration Motor', package: 'SMD', dimensions: [1.0, 0.3, 1.0], color: '#94a3b8', type: 'motor' },
    { id: 'ec-out-solenoid', name: 'Mini Solenoid', category: 'Output', description: '5V Push-Pull Solenoid', package: 'THT', dimensions: [2.0, 1.0, 1.0], color: '#374151', type: 'other' },
    
    // Power
    { id: 'ec-pwr-cr2032', name: 'CR2032 Holder', category: 'Power', description: 'Coin Cell Battery Holder', package: 'SMD', dimensions: [2.0, 0.5, 2.0], color: '#d1d5db', type: 'battery' },
    { id: 'ec-pwr-usb', name: 'USB-C Port', category: 'Power', description: 'USB Type-C Connector', package: 'SMD', dimensions: [0.9, 0.3, 0.7], color: '#9ca3af', type: 'connector' },
    { id: 'ec-pwr-dcjack', name: 'DC Jack', category: 'Power', description: '2.1mm Barrel Jack', package: 'THT', dimensions: [1.4, 0.9, 1.1], color: '#111111', type: 'connector' },
    { id: 'ec-pwr-reg-7805', name: 'LM7805 Regulator', category: 'Power', description: '5V Linear Regulator', package: 'TO-220', dimensions: [1.0, 1.5, 0.4], color: '#111111', type: 'ic' },
    
    // Connectors
    { id: 'ec-conn-term', name: 'Terminal Block', category: 'Connectors', description: '2-Pin Screw Terminal', package: 'THT', dimensions: [1.0, 1.0, 0.8], color: '#10b981', type: 'connector' },
    { id: 'ec-conn-head', name: 'Pin Header', category: 'Connectors', description: '1x4 Pin Header', package: 'THT', dimensions: [1.0, 1.2, 0.2], color: '#1f2937', type: 'connector' },
    { id: 'ec-conn-hdmi', name: 'HDMI Port', category: 'Connectors', description: 'HDMI Type A Receptacle', package: 'SMD', dimensions: [1.5, 0.5, 1.0], color: '#9ca3af', type: 'connector' },
    { id: 'ec-conn-jst', name: 'JST-PH 2-Pin', category: 'Connectors', description: 'Battery Connector', package: 'THT', dimensions: [0.6, 0.6, 0.5], color: '#f3f4f6', type: 'connector' },
];

export const MACHINE_LIBRARY: MachineProfile[] = [
    { 
        id: 'haas-vf2', 
        name: 'Haas VF-2', 
        type: '3-Axis', 
        maxSpindleSpeed: 8100, 
        rapidFeedRate: 25400, 
        description: 'Standard workhorse 3-axis VMC for general purpose machining.' 
    },
    { 
        id: 'dmg-mori-dmu50', 
        name: 'DMG Mori DMU 50', 
        type: '5-Axis', 
        maxSpindleSpeed: 14000, 
        rapidFeedRate: 42000, 
        description: 'Compact 5-axis universal milling machine for complex geometries.' 
    },
    { 
        id: 'mazak-integrex', 
        name: 'Mazak Integrex i-200', 
        type: '5-Axis', 
        maxSpindleSpeed: 12000, 
        rapidFeedRate: 38000, 
        description: 'Multi-tasking machining center combining turning and milling.' 
    }
];


// FIX: Explicitly type INITIAL_PROJECTS as Project[] to fix type inference issue.
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

export function FeaturesIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
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

export function ManufacturingIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}

export function SimulationIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h20" />
            <path d="M5 12v6a2 2 0 0 0 2 2h2" />
            <path d="M19 12v6a2 2 0 0 1-2 2h-2" />
            <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />
            <circle cx="12" cy="12" r="2" />
            <path d="m9 4 2-2" />
            <path d="m15 4-2-2" />
        </svg>
    );
}

export function ElectronicsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
            <path d="M9 15h.01" />
            <path d="M15 15h.01" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
        </svg>
    );
}

export function AssemblyIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 21v-8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8l2 2h4l2-2Z"/>
            <path d="M22 21v-8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8l2 2h4l2-2Z"/>
            <path d="M10 9V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5l2 2h4l2-2Z"/>
            <path d="M12 9V5a3 3 0 0 1 6 0v4"/>
        </svg>
    );
}

export function ArchitectureIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="9" y1="22" x2="9" y2="2" />
            <line x1="15" y1="22" x2="15" y2="2" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="10" x2="20" y2="10" />
            <line x1="4" y1="14" x2="20" y2="14" />
            <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
    );
}

export function MediaIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
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
