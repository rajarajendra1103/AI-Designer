import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Project, PrimitiveType } from '../types';
import GenerationProgress from "./GenerationProgress";
import { Sparkles, Loader2, Lightbulb, ArrowRight } from "lucide-react";
import { generateDesign } from "../services/geminiService";

// --- Helper UI Components ---
// FIX: Added default empty string for className prop to prevent type errors.
const Card = ({ className = '', children }) => <div className={`border-none ${className}`.trim()}>{children}</div>;
// FIX: Added default empty string for className prop to prevent type errors.
const CardContent = ({ className = '', children }) => <div className={className}>{children}</div>;
// FIX: Added default empty string for className prop to prevent type errors.
const CardHeader = ({ className = '', children }) => <div className={className}>{children}</div>;
// FIX: Added default empty string for className prop to prevent type errors.
const CardTitle = ({ className = '', children }) => <h3 className={className}>{children}</h3>;
// FIX: Added default empty string for className prop to prevent type errors.
const Label = ({ htmlFor, className = '', children }) => <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 ${className}`.trim()}>{children}</label>;
const Input = (props) => <input {...props} className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${props.className || ''}`.trim()} />;
const Textarea = (props) => <textarea {...props} className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${props.className || ''}`.trim()} />;
const Button = ({ className = '', children, ...props }) => <button {...props} className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`.trim()}>{children}</button>;
const Alert = ({ className = '', children }) => <div className={`p-4 rounded-md ${className}`.trim()}>{children}</div>;
const AlertDescription = ({ className = '', children }) => <div className={`text-sm ${className}`.trim()}>{children}</div>;
const Select = ({ value, onValueChange, children }) => <select value={value} onChange={e => onValueChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md">{children}</select>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

// --- Sub-components for AIGenerator ---

const examples = [
  {
    name: "Industrial Warehouse",
    description: "A large industrial warehouse building with steel frame construction. Dimensions: 50m length, 30m width, 12m height. Include loading docks, overhead crane system, and skylights for natural lighting. Concrete foundation with metal siding.",
    category: "industrial"
  },
  {
    name: "Ergonomic Office Desk",
    description: "Modern adjustable standing desk with electric height control. Dimensions: 160cm width, 80cm depth, adjustable height 70-120cm. Include cable management tray, solid oak wood top, and steel frame in matte black finish.",
    category: "furniture"
  },
  {
    name: "Gear Assembly",
    description: "Mechanical gear assembly with 5 interlocking gears. Main drive gear: 200mm diameter with 40 teeth. Four smaller gears: 100mm diameter with 20 teeth each. Made of stainless steel with 20mm shaft diameter. Include mounting plate.",
    category: "mechanical"
  }
];

function ExamplePrompts({ onExampleClick }) {
  return (
    <Card className="mb-6 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-gray-900">Example Prompts</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example)}
              className="text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-brand-primary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <p className="font-semibold text-gray-900 mb-2">{example.name}</p>
              <p className="text-sm text-gray-600 line-clamp-3">{example.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DescriptionInput({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description" className="text-base font-semibold">
        Design Description
      </Label>
      <Textarea
        id="description"
        placeholder="Describe your design in detail. For example: 'A modern ergonomic office chair with adjustable height, lumbar support, and breathable mesh back...'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px]"
        rows={8}
      />
      <p className="text-sm text-gray-500 text-right">
        {value.length} characters
      </p>
    </div>
  );
}

// --- Main AIGenerator Component ---

export default function AIGenerator({ onGenerationComplete }) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("product");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!projectName || !description) return;

    setIsGenerating(true);
    setProgress(10);
    setCurrentStep("Analyzing description...");
    setError(null);

    try {
      setProgress(50);
      setCurrentStep("Generating 3D model...");
      const newProject = await generateDesign(description, projectName, category, []);
      
      if (!newProject.modelData || !Array.isArray(newProject.modelData.primitives) || newProject.modelData.primitives.length === 0) {
        throw new Error("Invalid 3D model data generated. Please try again with a more detailed prompt.");
      }

      setProgress(90);
      setCurrentStep("Finalizing project...");
      
      setProgress(100);
      setCurrentStep("Complete!");
      
      setTimeout(() => {
        onGenerationComplete(newProject);
      }, 500);

    } catch (e) {
      setIsGenerating(false);
      setError(e.message || "An error occurred during generation. Please try again with a more detailed description including specific dimensions.");
      console.error("Generation error:", e);
    }
  };

  const handleExampleClick = (example) => {
    setProjectName(example.name);
    setDescription(example.description);
    setCategory(example.category);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">AI Design Generator</h1>
              <p className="text-gray-600 mt-1">Describe your design and watch AI create it</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-100 border-red-400 text-red-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isGenerating ? (
          <>
            <ExamplePrompts onExampleClick={handleExampleClick} />
            <Card className="shadow-2xl border-none bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 font-bold text-xl text-gray-800">
                  <Lightbulb className="w-5 h-5 text-brand-primary" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Modern Office Chair"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectItem value="architecture">Architecture</SelectItem>
                      <SelectItem value="product">Product Design</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </Select>
                  </div>
                </div>

                <DescriptionInput 
                  value={description}
                  onChange={setDescription}
                />

                <Alert className="bg-blue-50 border-blue-200">
                  <div className="flex items-start">
                    <Sparkles className="h-4 w-4 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <AlertDescription className="text-blue-900">
                      <strong>Pro tip:</strong> Include specific numeric dimensions (e.g., "5 meters long, 3 meters wide, 2.5 meters tall"), materials, and detailed features for the best results!
                    </AlertDescription>
                  </div>
                </Alert>

                <Button
                  className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary hover:brightness-110 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={handleGenerate}
                  disabled={!projectName || !description}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Design with AI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <GenerationProgress progress={progress} currentStep={currentStep} />
        )}
      </div>
    </div>
  );
}