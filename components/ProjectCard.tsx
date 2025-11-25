
import React from 'react';
import { Project } from '../types';
import { Eye, Calendar, Tag, Trash2 } from 'lucide-react';
import ThumbnailViewer from './ThumbnailViewer';

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<BaseProps> = ({ className = '', children }) => <div className={`border rounded-xl ${className}`.trim()}>{children}</div>;
const CardContent: React.FC<BaseProps> = ({ className = '', children }) => <div className={className}>{children}</div>;
const Badge: React.FC<BaseProps> = ({ className = '', children }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`.trim()}>{children}</span>;

const categoryColors: Record<string, string> = {
  architecture: "bg-blue-100 text-blue-800 border-blue-200",
  product: "bg-purple-100 text-purple-800 border-purple-200",
  industrial: "bg-green-100 text-green-800 border-green-200",
  mechanical: "bg-orange-100 text-orange-800 border-orange-200",
  furniture: "bg-pink-100 text-pink-800 border-pink-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  generated: "bg-blue-100 text-blue-700",
  refined: "bg-purple-100 text-purple-700",
  finalized: "bg-green-100 text-green-700"
};

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onSelectProject: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectCard({ project, viewMode, onSelectProject, onDelete }: ProjectCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete(project.id);
    }
  };

  if (viewMode === "list") {
    return (
      <div className="group relative">
        <div onClick={() => onSelectProject(project)} className="cursor-pointer">
          <Card className="hover:shadow-lg transition-all duration-300 border-transparent hover:border-brand-primary bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg overflow-hidden">
                <ThumbnailViewer project={project} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                  <Badge className={statusColors[project.status] || statusColors.draft}>
                    {project.status}
                  </Badge>
                  <Badge className={categoryColors[project.category] || categoryColors.other}>
                    <Tag className="w-3 h-3 mr-1" />
                    {project.category}
                  </Badge>
                </div>
                <p className="text-gray-600 line-clamp-2">{project.description}</p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(project.created_date)}
                  </p>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/50 text-gray-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Grid view
  return (
     <div className="group relative">
        <div onClick={() => onSelectProject(project)} className="cursor-pointer h-full">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-transparent hover:border-brand-primary bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
                <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                    <ThumbnailViewer project={project} />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                            {project.name}
                            </h3>
                            <Badge className={statusColors[project.status] || statusColors.draft}>
                            {project.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {project.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <Badge className={categoryColors[project.category] || categoryColors.other}>
                        {project.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDateShort(project.created_date)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/50 text-gray-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
    </div>
  );
}
