
import React from 'react';
import { 
  GeneratorIcon, 
  EditIcon, 
  ThreeDIcon, 
  ManufacturingIcon, 
  SimulationIcon, 
  ElectronicsIcon, 
  AssemblyIcon,
  MediaIcon
} from '../constants';
import { Layers, Box, Grid, PenTool, FileCode, Activity, Waves, Thermometer, Cpu, Droplet, Link, Expand, GitBranch, Users, Zap, Building, Ruler, CheckCircle, FileText, Video, Film, Wand2, MonitorPlay } from 'lucide-react';

interface FeatureItemProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const FeatureListItem: React.FC<FeatureItemProps> = ({ title, description, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col md:flex-row items-start gap-6 group">
        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${color}`}>
             <div className="w-8 h-8">
                {icon}
             </div>
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors">{title}</h3>
            <p className="text-brand-subtext text-base leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);

const CAPABILITIES_DATA = [
    {
        category: 'Solid Modeling',
        icon: <Box className="w-5 h-5 text-blue-600" />,
        features: ['Extrude', 'Fillet', 'Chamfer', 'Revolve', 'Loft', 'Sweep', 'Shell']
    },
    {
        category: 'Surface Modeling',
        icon: <Layers className="w-5 h-5 text-purple-600" />,
        features: ['Patch', 'Stitch', 'Untrim', 'Extend surfaces', 'Sculpt complex shapes']
    },
    {
        category: 'Mesh Modeling',
        icon: <Grid className="w-5 h-5 text-green-600" />,
        features: ['Convert mesh → solid', 'Clean mesh data', 'Sculpt organic shapes']
    },
    {
        category: 'Freestyle & Form',
        icon: <PenTool className="w-5 h-5 text-pink-600" />,
        features: ['Subdivision modeling (T-Splines)', 'Organic surface design']
    },
    {
        category: 'Parametric Modeling',
        icon: <FileCode className="w-5 h-5 text-orange-600" />,
        features: ['Timeline history', 'Driving dimensions', 'Parametric constraints']
    }
];

const CAM_CAPABILITIES_DATA = [
    { feature: '2.5/3/4/5-Axis Milling', description: 'CNC toolpath generation' },
    { feature: 'Turning', description: 'Lathe manufacturing setup' },
    { feature: 'Additive Manufacturing', description: 'Metal/Resin 3D printing setup' },
    { feature: 'Tool Library', description: 'Standard tools from Haas, Fanuc, Siemens, Mazak' }
];

const ELECTRONICS_CAPABILITIES_DATA = [
    { feature: 'Schematic Design', description: 'Electrical circuit creation' },
    { feature: 'PCB Layout', description: 'Layered board design, footprints, traces' },
    { feature: '3D PCB Integration', description: 'Automatic PCB → 3D model sync' },
    { feature: 'Component Library', description: '200k+ auto-downloadable components' }
];

const SIMULATION_CAPABILITIES_DATA = [
    { type: 'Static Stress', capability: 'Part/assembly load & deformation analysis', icon: <Activity className="w-5 h-5 text-blue-600" /> },
    { type: 'Modal Analysis', capability: 'Vibration-frequency testing', icon: <Waves className="w-5 h-5 text-purple-600" /> },
    { type: 'Thermal Analysis', capability: 'Heat transfer behavior', icon: <Thermometer className="w-5 h-5 text-red-600" /> },
    { type: 'Generative Design', capability: 'AI-powered optimized geometry for strength & weight', icon: <Cpu className="w-5 h-5 text-orange-600" /> },
    { type: 'Injection Molding', capability: 'Mold flow simulation for plastic designs', icon: <Droplet className="w-5 h-5 text-cyan-600" /> }
];

const ASSEMBLY_CAPABILITIES_DATA = [
    { feature: 'Assembly Constraints', description: 'Joint types: rigid, slider, hinge, ball, motion link', icon: <Link className="w-5 h-5 text-indigo-600" /> },
    { feature: 'Exploded Views', description: 'Presentation & animation of product assembly', icon: <Expand className="w-5 h-5 text-green-600" /> },
    { feature: 'Version Control', description: 'Cloud history, design comparison, rollback', icon: <GitBranch className="w-5 h-5 text-gray-600" /> },
    { feature: 'Team Collaboration', description: 'Real-time cloud collaborative edits, comments, view-only sharing', icon: <Users className="w-5 h-5 text-pink-600" /> }
];

const AEC_CAPABILITIES_DATA = [
    { 
        category: 'Architectural Drafting (AutoCAD)', 
        icon: <Ruler className="w-5 h-5 text-blue-700" />,
        features: [
            '2D drafting (floor plans, structure, elevation)',
            '3D modeling for architectural visualization',
            'Layer management & DWG universal support',
            'Industry templates (MEP, Civil, Architecture)'
        ],
        aiFeatures: [
            'AI Text-to-Floorplan: Generate layouts from descriptions',
            'Smart Layering: Auto-sort entities into correct layers'
        ]
    },
    { 
        category: 'BIM & Construction (Revit)', 
        icon: <Building className="w-5 h-5 text-cyan-700" />,
        features: [
            'Design by Discipline (Arch, Struct, MEP)',
            'Parametric Elements (Intelligent walls, doors)',
            'Schedule & Cost Estimation (Quantity takeoffs)',
            'BIM Collaboration (Cloud coordination)'
        ],
        aiFeatures: [
            'Predictive Clash Resolution: AI suggests fixes for conflicts',
            'AI Scan-to-BIM: Convert point clouds to 3D models',
            'Auto-Code Compliance: Check designs against building codes'
        ]
    }
];

const MEDIA_CAPABILITIES_DATA = [
    {
        software: 'Autodesk Maya',
        useCase: '3D animation, rigging, simulation, VFX',
        icon: <Video className="w-5 h-5 text-purple-600" />,
        aiFeatures: ['AI Auto-Rigging (Instant skeletal structure)', 'Motion Synthesis (Text-to-Animation)', 'Neural Cloth Simulation']
    },
    {
        software: '3ds Max',
        useCase: 'Modeling, environment design, animation',
        icon: <Box className="w-5 h-5 text-blue-600" />,
        aiFeatures: ['AI Texture Generation (Text-to-Material)', 'Smart Retopology (Mesh optimization)', 'Procedural City Generation']
    },
    {
        software: 'MotionBuilder',
        useCase: 'Motion capture animation',
        icon: <Activity className="w-5 h-5 text-green-600" />,
        aiFeatures: ['Clean MoCap Data', 'Retarget motion to new characters']
    },
    {
        software: 'Flame',
        useCase: 'Video editing, color grading, visual effects',
        icon: <Film className="w-5 h-5 text-red-600" />,
        aiFeatures: ['AI Rotoscoping (Auto-masking)', 'Generative Background Inpainting', 'Face Aging/De-aging']
    }
];

const Features: React.FC = () => {
  const features = [
    {
        title: 'AI Design Generation',
        description: 'Transform your ideas into reality. Describe any object, structure, or product in natural language, and our advanced AI instantly generates a detailed 3D CAD model composed of geometric primitives.',
        icon: <GeneratorIcon />,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        title: 'Intelligent Manual Editor',
        description: 'Iterate with precision. Use the AI-powered refinement tool to request changes like "make it wider" or "add supports," or manually adjust parameters with a full history undo/redo system.',
        icon: <EditIcon />,
        color: 'bg-purple-100 text-purple-600'
    },
    {
        title: '3D Visualization',
        description: 'Inspect every angle. Our high-performance Three.js viewer supports orbiting, zooming, and panning, allowing you to visualize complex assemblies, wireframes, and transparent fit-checks.',
        icon: <ThreeDIcon />,
        color: 'bg-gray-100 text-gray-700'
    },
    {
        title: 'Assembly & Motion Studio',
        description: 'Bring designs to life. Automatically detect kinematic joints (hinges, sliders) within your geometry. Define constraints, simulate mechanical motion, and analyze dynamic assemblies.',
        icon: <AssemblyIcon />,
        color: 'bg-indigo-100 text-indigo-600'
    },
    {
        title: 'CNC Manufacturing Hub',
        description: 'Prepare for production. Select from a library of CNC machines (3-axis to 5-axis), generate optimized toolpaths, simulate machining operations, and export G-code.',
        icon: <ManufacturingIcon />,
        color: 'bg-red-100 text-red-600'
    },
    {
        title: 'Advanced CAE Simulation',
        description: 'Engineer with confidence. Run multi-physics simulations including Structural FEA, Thermal analysis, CFD (airflow), and Drop Tests to identify failure points before prototyping.',
        icon: <SimulationIcon />,
        color: 'bg-orange-100 text-orange-600'
    },
    {
        title: 'Electronics Lab',
        description: 'Integrate intelligence. Design PCBs that fit perfectly inside your mechanical enclosures. Place components, auto-route traces, and simulate signal integrity and EMI.',
        icon: <ElectronicsIcon />,
        color: 'bg-green-100 text-green-600'
    },
    {
        title: 'Media & VFX Studio',
        description: 'Create immersive worlds. Access tools inspired by Maya and 3ds Max for rigging, animation, and visual effects, enhanced with AI for auto-rigging and texture generation.',
        icon: <MediaIcon />,
        color: 'bg-pink-100 text-pink-600'
    }
  ];

  return (
    <div className="p-8 min-h-full bg-brand-background">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-brand-text mb-4">Platform Capabilities</h1>
            <p className="text-lg text-brand-subtext max-w-2xl mx-auto">
                A comprehensive suite of AI-powered tools designed to accelerate every stage of the engineering and design lifecycle.
            </p>
        </div>
        
        <div className="space-y-6 mb-16">
            {features.map((feature, index) => (
                <FeatureListItem 
                    key={index}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                />
            ))}
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold text-brand-text mb-8 text-center">Architecture & Construction (AEC)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {AEC_CAPABILITIES_DATA.map((aec, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-brand-primary transition-colors">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            {aec.icon}
                            <h3 className="font-bold text-gray-900 text-lg">{aec.category}</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Standard Features</h4>
                                <ul className="space-y-2">
                                    {aec.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> AI Enhancements
                                </h4>
                                <ul className="space-y-2">
                                    {aec.aiFeatures.map((aiFeat, aiIndex) => (
                                        <li key={aiIndex} className="flex items-start gap-2 text-sm text-indigo-900 font-medium">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                            {aiFeat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

         <div className="mb-16">
            <h2 className="text-2xl font-bold text-brand-text mb-8 text-center">Autodesk Media & VFX</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MEDIA_CAPABILITIES_DATA.map((media, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-pink-500 transition-colors">
                         <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            <div className="p-2 bg-gray-50 rounded-lg">{media.icon}</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{media.software}</h3>
                                <p className="text-xs text-gray-500">{media.useCase}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                                <h4 className="text-xs font-bold text-pink-700 uppercase mb-2 flex items-center gap-1">
                                    <Wand2 className="w-3 h-3" /> AI Features
                                </h4>
                                <ul className="space-y-1">
                                    {media.aiFeatures.map((feat, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-pink-900">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0"></span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold text-brand-text mb-8 text-center">Design & Modeling Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CAPABILITIES_DATA.map((cap, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-brand-primary transition-colors">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            {cap.icon}
                            <h3 className="font-bold text-gray-900">{cap.category}</h3>
                        </div>
                        <ul className="space-y-2">
                            {cap.features.map((feature, fIndex) => (
                                <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-brand-secondary rounded-full flex-shrink-0"></span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold text-brand-text mb-8 text-center">Manufacturing (CAM)</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {CAM_CAPABILITIES_DATA.map((cam, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                <ManufacturingIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{cam.feature}</h3>
                                <p className="text-gray-600 mt-1">{cam.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold text-brand-text mb-8 text-center">Electronics & PCB Design</h2>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {ELECTRONICS_CAPABILITIES_DATA.map((ecad, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <ElectronicsIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{ecad.feature}</h3>
                                <p className="text-gray-600 mt-1">{ecad.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Simulation & Analysis */}
            <div>
                <h2 className="text-2xl font-bold text-brand-text mb-6 text-center lg:text-left">Simulation & Analysis</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {SIMULATION_CAPABILITIES_DATA.map((sim, index) => (
                        <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                {sim.icon}
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900">{sim.type}</h3>
                                 <p className="text-sm text-gray-600">{sim.capability}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assembly & Collaboration */}
            <div>
                 <h2 className="text-2xl font-bold text-brand-text mb-6 text-center lg:text-left">Assembly & Collaboration</h2>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {ASSEMBLY_CAPABILITIES_DATA.map((asm, index) => (
                        <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                {asm.icon}
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900">{asm.feature}</h3>
                                 <p className="text-sm text-gray-600">{asm.description}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-brand-secondary to-brand-primary rounded-2xl p-10 text-white text-center shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to start designing?</h2>
            <p className="text-brand-light mb-8 text-lg">Experience the future of CAD automation today.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-white text-brand-primary font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
                Launch AI Generator
            </button>
        </div>
      </div>
    </div>
  );
};

export default Features;
