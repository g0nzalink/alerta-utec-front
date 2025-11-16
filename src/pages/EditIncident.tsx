import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Incident, UpdateIncidentRequest } from '../types';
import { incidentsAPI } from '../api/incidents';
import { handleApiError } from '../utils/helpers';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/constants';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../components/Toast';

export const EditIncident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateIncidentRequest>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN'
  });

  useEffect(() => {
    if (id) {
      loadIncident();
    }
  }, [id]);

  const loadIncident = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const incidentData = await incidentsAPI.getIncident(id);
      setIncident(incidentData);
      setFormData({
        title: incidentData.title,
        description: incidentData.description,
        priority: incidentData.priority,
        status: incidentData.status
      });
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData.title?.trim() || !formData.description?.trim()) {
      setError('Título y descripción son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await incidentsAPI.updateIncident(id, formData);
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Incidente actualizado',
        message: 'Los cambios se han guardado correctamente',
        duration: 4000
      });
      
      navigate(`/incidents/${id}?updated=true`);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/incidents/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-100/80 loading-skeleton" />
          <div className="h-5 w-40 rounded-full loading-skeleton" />
        </div>
        <div className="card space-y-4">
          <div className="h-7 w-1/2 rounded-full loading-skeleton" />
          <div className="h-10 rounded-xl loading-skeleton" />
          <div className="h-32 rounded-xl loading-skeleton" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-10 rounded-xl loading-skeleton" />
            <div className="h-10 rounded-xl loading-skeleton" />
            <div className="h-10 rounded-xl loading-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>

        <div className="card border-2 border-red-400 bg-red-50 text-center">
          <h2 className="mb-2 text-xl font-black text-gray-900">Error al cargar el incidente</h2>
          <p className="text-sm text-gray-900 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Editar Incidente
            </h1>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              Actualice la información del incidente y su estado.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 border-2 border-blue-300">
              <Save className="h-4 w-4 text-gray-900" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Información del Incidente</h2>
              <p className="text-xs text-gray-900 font-semibold">Modifique los campos necesarios para actualizar el incidente.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-black text-gray-900">
                Título *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Actualice el título del incidente"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-black text-gray-900">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="input-field resize-none"
                placeholder="Actualice la descripción detallada del incidente"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-black text-gray-900">
                  Estado *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-black text-gray-900">
                  Prioridad *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-900 flex items-center gap-2">
                  📍 Ubicación (solo lectura)
                </label>
                <div className="input-field bg-gray-50 text-gray-600 cursor-not-allowed border-2">
                  {incident?.location || 'UTEC'}
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  La ubicación no se puede modificar
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-900 flex items-center gap-2">
                  🏷️ Categoría (solo lectura)
                </label>
                <div className="input-field bg-gray-50 text-gray-600 cursor-not-allowed border-2">
                  {incident?.category || 'OTROS'}
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  La categoría no se puede modificar
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="card border-2 border-red-400 bg-red-50 text-sm text-gray-900 font-bold">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="loading-spinner" />}
            <Save className="h-4 w-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
