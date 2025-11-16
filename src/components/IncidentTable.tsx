import React from 'react';
import type { Incident } from '../types';
import { formatDate } from '../utils/date';
import { PRIORITY_LABELS, STATUS_LABELS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { Eye, Edit } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  isLoading: boolean;
  onViewIncident: (id: string) => void;
  onEditIncident: (id: string) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  isLoading,
  onViewIncident,
  onEditIncident,
}) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="loading-spinner"></div>
            <span className="text-gray-400">Cargando incidentes...</span>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 loading-skeleton rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-100 mb-2">No hay incidentes</h3>
        <p className="text-gray-400">No se encontraron incidentes que coincidan con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Incidente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Detalles
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-all duration-200 group">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <span className="text-xs font-mono text-blue-300">#{incident.id.split('-')[1]}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                        {incident.title}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {incident.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <span className={`status-dot ${incident.status.toLowerCase().replace('_', '-')}`}></span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[incident.status]} ring-2 ring-inset`}>
                      {STATUS_LABELS[incident.status]}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${PRIORITY_COLORS[incident.priority]} ring-2 ring-inset`}>
                    {PRIORITY_LABELS[incident.priority]}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-300">
                    <p className="font-medium">Creado: {formatDate(incident.createdAt)}</p>
                    {incident.updatedAt !== incident.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Actualizado: {formatDate(incident.updatedAt)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewIncident(incident.id)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditIncident(incident.id)}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-all duration-200"
                      title="Editar incidente"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
