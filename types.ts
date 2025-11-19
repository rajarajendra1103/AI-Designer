// FIX: Removed self-import of 'Page' which conflicts with the local declaration.

export type Page = 'dashboard' | 'generator' | 'projects' | 'view_project' | 'edit_project' | 'manual_editor';

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
}

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  components: ProjectComponent[];
  modelData: {
    primitives: Primitive[];
  };
  status: 'draft' | 'generated' | 'refined' | 'finalized';
  created_date: string; // ISO string
}

export interface ReusableComponent {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}