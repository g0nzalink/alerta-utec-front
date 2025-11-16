import React from 'react';
import type { Incident } from '../types';
import { formatDate } from '../utils/date';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { Eye, Edit, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onView: () => void;
  onEdit: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open':
      return <AlertCircle className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'closed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onView,
  onEdit,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:shadow-xl hover:shadow-primary-500/10 cursor-pointer" onClick={onView}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header with ID and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 ring-1 ring-primary-500/20">
              <span className="text-xs font-semibold text-primary-400">#{incident.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatDate(incident.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
              title="Editar incidente"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 transition-colors hover:bg-primary-500/20 hover:text-primary-300"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3 group-hover:text-white transition-colors">
            {incident.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[incident.status]} ring-2 ring-inset`}>
            {getStatusIcon(incident.status)}
            {STATUS_LABELS[incident.status]}
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${PRIORITY_COLORS[incident.priority]} ring-2 ring-inset`}>
            {PRIORITY_LABELS[incident.priority]}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-900 ring-2 ring-gray-300">
            {CATEGORY_LABELS[incident.category]}
          </div>
        </div>

        {/* Footer with Assignment Info */}
        {incident.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-800 pt-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700">
              <User className="h-3 w-3" />
            </div>
            <span>Asignado a un usuario</span>
          </div>
        )}
      </div>
    </div>
  );
};
