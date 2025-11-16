import React, { useState, useEffect } from 'react';
import { incidentsAPI } from '../api/incidents';
import type { Incident, UpdateIncidentRequest } from '../types';
import { handleApiError } from '../utils/helpers';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/constants';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

interface UpdateIncidentFormProps {
  incident: Incident;
  onUpdate: (updatedIncident: Incident) => void;
  onCancel: () => void;
}

export const UpdateIncidentForm: React.FC<UpdateIncidentFormProps> = ({ incident, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<UpdateIncidentRequest>({
    title: incident.title,
    description: incident.description,
    location: incident.location,
    priority: incident.priority,
    status: incident.status,
    assignedTo: incident.assignedTo || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are changes
    const changes = 
      formData.title !== incident.title ||
      formData.description !== incident.description ||
      formData.location !== incident.location ||
      formData.priority !== incident.priority ||
      formData.status !== incident.status ||
      formData.assignedTo !== (incident.assignedTo || '');
    
    setHasChanges(changes);
  }, [formData, incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Only send changed fields
      const updateData: UpdateIncidentRequest = {};
      
      if (formData.title !== incident.title) updateData.title = formData.title;
      if (formData.description !== incident.description) updateData.description = formData.description;
      if (formData.location !== incident.location) updateData.location = formData.location;
      if (formData.priority !== incident.priority) updateData.priority = formData.priority;
      if (formData.status !== incident.status) updateData.status = formData.status;
      if (formData.assignedTo !== (incident.assignedTo || '')) updateData.assignedTo = formData.assignedTo;
      
      console.log('🔄 Updating incident with changes:', updateData);
      
      const updatedIncident = await incidentsAPI.updateIncident(incident.id, updateData);
      onUpdate(updatedIncident);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateIncidentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <RefreshCw className="w-6 h-6 mr-2 text-blue-600" />
            Actualizar Incidente
          </h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority || ''}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignado a (opcional)
              </label>
              <input
                type="text"
                value={formData.assignedTo || ''}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Email del usuario asignado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Changes Summary */}
            {hasChanges && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Cambios detectados:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {formData.title !== incident.title && (
                    <li>• Título: "{incident.title}" → "{formData.title}"</li>
                  )}
                  {formData.description !== incident.description && (
                    <li>• Descripción modificada</li>
                  )}
                  {formData.location !== incident.location && (
                    <li>• Ubicación: "{incident.location}" → "{formData.location}"</li>
                  )}
                  {formData.priority !== incident.priority && (
                    <li>• Prioridad: {PRIORITY_LABELS[incident.priority]} → {PRIORITY_LABELS[formData.priority!]}</li>
                  )}
                  {formData.status !== incident.status && (
                    <li>• Estado: {STATUS_LABELS[incident.status]} → {STATUS_LABELS[formData.status!]}</li>
                  )}
                  {formData.assignedTo !== (incident.assignedTo || '') && (
                    <li>• Asignado: "{incident.assignedTo || 'Sin asignar'}" → "{formData.assignedTo || 'Sin asignar'}"</li>
                  )}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
