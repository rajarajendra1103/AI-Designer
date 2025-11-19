import React from 'react';
import { Sparkles, Loader2 } from "lucide-react";

// FIX: Added default empty string for className prop to prevent type errors.
const Card = ({ className = '', children }) => (
  <div className={`shadow-2xl border-none bg-white/80 backdrop-blur-sm rounded-2xl ${className}`.trim()}>{children}</div>
);
// FIX: Added default empty string for className prop to prevent type errors.
const CardHeader = ({ className = '', children }) => (
  <div className={`p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl ${className}`.trim()}>{children}</div>
);
// FIX: Added default empty string for className prop to prevent type errors.
const CardTitle = ({ className = '', children }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`.trim()}>{children}</h2>
);
// FIX: Added default empty string for className prop to prevent type errors.
const CardContent = ({ className = '', children }) => (
  <div className={`p-8 ${className}`.trim()}>{children}</div>
);
const Progress = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
    <div 
      className="bg-brand-primary h-2 rounded-full" 
      style={{ width: `${value}%`, transition: 'width 0.5s ease' }}
    />
  </div>
);


export default function GenerationProgress({ progress, currentStep }) {
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
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-brand-primary animate-pulse" />
              </div>
              <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-brand-primary"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-gray-900">{progress}%</p>
            <p className="text-gray-600 h-5">{currentStep}</p>
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