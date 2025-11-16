import React, { useState } from 'react';
import type { Incident } from '../types';
import { formatRelativeTime } from '../utils/date';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  MoreVertical,
  Image as ImageIcon,
  AlertTriangle,
  Activity,
  MapPin
} from 'lucide-react';

interface SocialIncidentCardProps {
  incident: Incident;
  onView: () => void;
  onEdit: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'OPEN':
      return <AlertCircle className="h-4 w-4" />;
    case 'RESOLVED':
      return <CheckCircle className="h-4 w-4" />;
    case 'CLOSED':
      return <XCircle className="h-4 w-4" />;
    case 'IN_PROGRESS':
      return <Activity className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getPriorityIcon = (priority: string) => {
  if (priority === 'HIGH') {
    return <AlertTriangle className="h-4 w-4" />;
  }
  return null;
};

export const SocialIncidentCard: React.FC<SocialIncidentCardProps> = ({
  incident,
  onView,
  onEdit,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Extract images from attachments
  const images = incident.attachments?.filter(att => 
    att.contentType.startsWith('image/') || att.isImage
  ) || [];

  const hasImages = images.length > 0;
  const firstImage = images[0];

  return (
    <article 
      onClick={onView}
      className="card hover:border-gray-300/80 transition-all duration-300 cursor-pointer group overflow-hidden p-0"
    >
      {/* Header - User info */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 ring-2 ring-primary-500/20">
              <User className="h-5 w-5 text-white" />
            </div>
            
            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {incident.createdBy}
                </h3>
                <span className="text-xs text-gray-700">•</span>
                <time className="text-xs text-gray-800 font-medium" dateTime={incident.createdAt}>
                  {formatRelativeTime(incident.createdAt)}
                </time>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-800 font-medium">ID: {incident.id.substring(0, 8)}</span>
                {incident.assignedTo && (
                  <>
                    <span className="text-xs text-gray-700">→</span>
                    <span className="text-xs text-emerald-700 font-semibold">Asignado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Más opciones"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {/* Title */}
        <h2 className="text-base font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
          {incident.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-900 leading-relaxed line-clamp-3 mb-3 font-medium">
          {incident.description}
        </p>

        {/* Location & Category - Prominent Display */}
        <div className="mb-3 space-y-2">
          {incident.location && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl shadow-sm">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" strokeWidth={2.5} />
              <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
                📍 {incident.location}
              </span>
            </div>
          )}
          {incident.category && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl shadow-sm">
              <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
                🏷️ {CATEGORY_LABELS[incident.category]}
              </span>
            </div>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[incident.status]} ring-2 ring-inset`}>
            {getStatusIcon(incident.status)}
            {STATUS_LABELS[incident.status]}
          </span>
          
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${PRIORITY_COLORS[incident.priority]} ring-1 ring-inset`}>
            {getPriorityIcon(incident.priority)}
            {PRIORITY_LABELS[incident.priority]}
          </span>
        </div>
      </div>

      {/* Image(s) - if present */}
      {hasImages && (
        <div 
          className="relative bg-slate-950/60 border-y border-gray-200/50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsImageExpanded(!isImageExpanded);
          }}
        >
          {images.length === 1 ? (
            // Single image
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {!imageError ? (
                <img
                  src={firstImage.url}
                  alt={firstImage.filename}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-white/50">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-700">Imagen no disponible</p>
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-800 border border-gray-300/50">
                  +{images.length - 1} más
                </div>
              )}
            </div>
          ) : (
            // Multiple images grid
            <div className="grid grid-cols-2 gap-1 p-1">
              {images.slice(0, 4).map((img, idx) => (
                <div 
                  key={img.id} 
                  className="relative bg-white/50"
                  style={{ aspectRatio: '1' }}
                >
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded">
                      <span className="text-2xl font-bold text-gray-800">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Image indicator overlay */}
          <div className="absolute bottom-3 left-3 bg-white backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-bold text-gray-900 border-2 border-gray-400 flex items-center gap-1.5 shadow-lg">
            <ImageIcon className="h-3 w-3" />
            <span>{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}</span>
          </div>
        </div>
      )}

      {/* Footer - Comments indicator */}
      <div className="px-4 py-3 border-t-2 border-gray-200">
        <div className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold">
          <MessageSquare className="h-4 w-4" />
          <span>{incident.commentsCount ?? 0} {incident.commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
        </div>
      </div>
    </article>
  );
};
