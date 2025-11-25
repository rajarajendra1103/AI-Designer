
import React from 'react';

// FIX: Removed self-import of 'Page' which conflicts with the local declaration.

export type Page = 'dashboard' | 'generator' | 'projects' | 'view_project' | 'edit_project' | 'manual_editor' | 'manufacturing' | 'simulation' | 'electronics' | 'assembly' | 'aec' | 'media' | 'features';

export interface ProjectComponent {
  name: string;
  description: string;
}

export type PrimitiveType = 'box' | 'cylinder' | 'sphere';

export interface Primitive {
  type: PrimitiveType;
  position: [number, number, number]; // [x, y, z] in cm
  dimensions: number[]; // [width, height, depth] for box, [radius, height] for cylinder, [radius] for sphere (all in cm)
  rotation: [number, number, number]; // [x, y, z] in degrees
  color: string; // hex color string e.g. "#FF5733"
  name?: string; // Optional name for identification in assembly
}

export interface MachineProfile {
    id: string;
    name: string;
    type: '3-Axis' | '4-Axis' | '5-Axis';
    maxSpindleSpeed: number; // RPM
    rapidFeedRate: number; // mm/min
    description: string;
}

export interface CNCData {
    selectedMachineId: string | null;
    toolpath: { x: number; y: number; z: number }[] | null;
    gcode: string | null;
    fixtures: Primitive[];
    stats: {
        estimatedTime: string;
        materialRemovalRate: string;
        toolLifeScore: string;
    } | null;
}

export type SimulationType = 'CFD' | 'FEA_STRUCTURAL' | 'FEA_THERMAL' | 'DROP_TEST' | 'TOPOLOGY_OPT' | 'MODAL' | 'INJECTION_MOLDING';

export interface SimulationResult {
    id: string;
    type: SimulationType;
    timestamp: string;
    params: string; // e.g., "Load: 500N"
    summary: string;
    stats: { label: string; value: string; unit?: string }[];
    hotspots: { position: [number, number, number]; intensity: number; description: string }[];
    criticalPrimitiveIndices: number[]; // Indices of primitives that are under high stress/heat
}

// --- Electronics / PCB Types ---

export interface BOMItem {
    partNumber: string;
    description: string;
    manufacturer: string;
    quantity: number;
    unitCost: number;
}

export type PCBComponentType = 'ic' | 'connector' | 'capacitor' | 'resistor' | 'inductor' | 'transistor' | 'diode' | 'switch' | 'sensor' | 'led' | 'battery' | 'display' | 'motor' | 'relay' | 'other';

export interface PCBComponent {
    id: string;
    type: PCBComponentType;
    position: [number, number, number]; // Relative to board center
    dimensions: [number, number, number];
    rotation: [number, number, number];
    designator: string; // e.g., U1, C4
    name?: string;
}

export interface PCBTrace {
    path: [number, number, number][]; // Series of 3D points
    width: number;
    layer: 'top' | 'bottom' | 'inner';
}

export interface PCBData {
    boardDimensions: [number, number, number]; // [width, thickness, depth]
    mountingHoles: [number, number, number][]; // Positions
    layerCount: number;
    components: PCBComponent[];
    bom: BOMItem[];
    traces?: PCBTrace[];
    schematicSvg?: string;
    signalAnalysis?: {
        summary: string;
        maxFrequency: string;
        hotspots: { position: [number, number, number]; radius: number; intensity: number; type: string }[];
    };
}

// --- Assembly Types ---

export interface Joint {
    id: string;
    name: string;
    type: 'REVOLUTE' | 'PRISMATIC' | 'FIXED';
    partIndex: number; // Index in modelData.primitives
    axis: [number, number, number]; // Vector
    limits: [number, number]; // [min, max] (degrees or cm)
    currentValue: number;
    speed: number; // for animation
}

export interface DesignParameter {
    id: string;
    name: string;
    value: number;
    unit: string;
    affectedPrimitives: number[]; // Indices of primitives that scale with this param
}

export interface AssemblyData {
    joints: Joint[];
    parameters: DesignParameter[];
    configurations: { id: string; name: string; parameters: Record<string, number> }[];
    scannedMesh?: boolean; // Flag to show a ghost mesh for reverse engineering
}

// ---

export interface Project {
  id: string;
  name: string;
  category: string; // 'architecture' | 'product' | 'mechanical' | ...
  description: string;
  materials: string[];
  components: ProjectComponent[];
  status: 'draft' | 'generated' | 'refined' | 'finalized';
  created_date: string;
  modelData: {
    primitives: Primitive[];
  };
  cncData?: CNCData;
  simulationData?: SimulationResult[];
  pcbData?: PCBData;
  assemblyData?: AssemblyData;
}

export interface ReusableComponent {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export interface StandardPart {
    id: string;
    name: string;
    category: string;
    primitive: Primitive;
}

export interface ElectronicComponent {
    id: string;
    name: string;
    category: ElectronicCategory;
    description: string;
    package: string;
    dimensions: [number, number, number];
    color: string;
    type: PCBComponentType;
}

export type ElectronicCategory = 'Passive' | 'Active' | 'Relay & Switching' | 'Input' | 'Output' | 'Power' | 'Connectors';
