
import React from 'react';
import { Sparkles, Loader2 } from "lucide-react";

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<BaseProps> = ({ className = '', children }) => (
  <div className={`shadow-2xl border-none bg-white/80 backdrop-blur-sm rounded-2xl ${className}`.trim()}>{children}</div>
);
const CardHeader: React.FC<BaseProps> = ({ className = '', children }) => (
  <div className={`p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl ${className}`.trim()}>{children}</div>
);
const CardTitle: React.FC<BaseProps> = ({ className = '', children }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`.trim()}>{children}</h2>
);
const CardContent: React.FC<BaseProps> = ({ className = '', children }) => (
  <div className={`p-8 ${className}`.trim()}>{children}</div>
);
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className || ''}`}>
    <div 
      className="bg-brand-primary h-2 rounded-full" 
      style={{ width: `${value}%`, transition: 'width 0.5s ease' }}
    />
  </div>
);

interface GenerationProgressProps {
  progress: number;
  currentStep: string;
}

export default function GenerationProgress({ progress, currentStep }: GenerationProgressProps) {
  // Radius calculation:
  // Width/Height = 128px (w-32)
  // Center = 64
  // Stroke = 8
  // Radius = 64 - (8/2) = 60
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
          Generating Your Design
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            {/* Main Circular Progress Container */}
            <div className="relative w-32 h-32">
              
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Sparkles className="w-14 h-14 text-brand-primary animate-pulse" />
              </div>

              {/* SVG Ring */}
              <svg 
                className="w-full h-full transform -rotate-90" 
                viewBox="0 0 128 128"
              >
                {/* Background Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-indigo-50"
                />
                
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-brand-primary transition-all duration-500 ease-out"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-3xl font-bold text-gray-900">{Math.round(progress)}%</p>
            <p className="text-gray-600 font-medium animate-pulse">{currentStep}</p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 text-center">
              AI is analyzing your description and creating a detailed 3D model. This may take 30-60 seconds.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
