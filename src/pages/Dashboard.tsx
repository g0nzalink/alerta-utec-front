import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Incident, PaginatedResponse } from '../types';
import { incidentsAPI } from '../api/incidents';
import { SocialIncidentCard } from '../components/SocialIncidentCard';
import { Pagination } from '../components/Pagination';
import { handleApiError } from '../utils/helpers';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from '../utils/constants';
import { Plus, Search, Filter, RefreshCw, TrendingUp, FileText, AlertTriangle, Zap, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<PaginatedResponse<Incident>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1
  });

  const loadIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await incidentsAPI.getIncidents({
        ...filters,
        pageSize: 10
      });
      
      setIncidents(response);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewIncident = (id: string) => {
    navigate(`/incidents/${id}`);
  };

  const handleEditIncident = (id: string) => {
    navigate(`/incidents/${id}/edit`);
  };

  const handleCreateIncident = () => {
    navigate('/incidents/new');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <section className="card space-y-6 border-2">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden bg-white rounded-2xl border-2 border-blue-200 p-6 transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">Total de Incidentes</p>
              <p className="text-4xl font-black text-gray-900 mb-2">{incidents.total}</p>
              <p className="text-sm text-gray-900 font-semibold">+{Math.floor(incidents.total * 0.1)} este mes</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white rounded-2xl border-2 border-red-200 p-6 transition-all duration-300 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">Abiertos</p>
              <p className="text-4xl font-black text-gray-900 mb-2">
                {incidents.items.filter(i => i.status === 'OPEN').length}
              </p>
              <p className="text-sm text-gray-900 font-semibold">Requieren atención</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white rounded-2xl border-2 border-yellow-200 p-6 transition-all duration-300 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">En Progreso</p>
              <p className="text-4xl font-black text-gray-900 mb-2">
                {incidents.items.filter(i => i.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-900 font-semibold">Siendo resueltos</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white rounded-2xl border-2 border-green-200 p-6 transition-all duration-300 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">Resueltos</p>
              <p className="text-4xl font-black text-gray-900 mb-2">
                {incidents.items.filter(i => i.status === 'RESOLVED').length}
              </p>
              <p className="text-sm text-gray-900 font-semibold">Completados hoy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="card space-y-5 border-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-base font-bold text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-300 shadow-md">
              <Filter className="h-5 w-5 text-gray-900" strokeWidth={2.5} />
            </div>
            <span>Filtros de Búsqueda</span>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={loadIncidents}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold bg-white text-gray-900 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utec-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 gap-2 transform hover:scale-105 shadow-md"
          >
            <RefreshCw className={`h-4 w-4 text-gray-900 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
        <div className="space-y-5">
          {/* Search */}
          <div>
            <label className="mb-3 block text-sm font-bold text-gray-900">Búsqueda</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-900" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-12 text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 text-gray-900"
              />
            </div>
          </div>

          {/* Filters grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-medium"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-semibold text-gray-900"
              >
                <option value="">Todas</option>
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-semibold text-gray-900"
              >
                <option value="">Todas</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 flex items-start gap-3 shadow-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden animate-pulse border-2">
                {/* Header skeleton */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36 mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
                
                {/* Content skeleton */}
                <div className="px-5 pb-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                    <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                  </div>
                </div>
                
                {/* Image skeleton */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                
                {/* Footer skeleton */}
                <div className="p-4 border-t-2 border-gray-200">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : incidents.items.length === 0 ? (
            <div className="col-span-full">
              <div className="card text-center py-20 border-2 col-span-full">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 border-2 border-blue-300 mb-6 shadow-xl">
                  <TrendingUp className="h-10 w-10 text-gray-900" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">No hay incidentes</h3>
                <p className="text-gray-900 text-lg mb-8 max-w-md mx-auto font-semibold">
                  No se encontraron incidentes que coincidan con los filtros aplicados.
                </p>
                <button
                  onClick={handleCreateIncident}
                  className="btn-primary py-4 px-6 text-base shadow-xl shadow-utec-cyan/30 hover:shadow-2xl hover:shadow-utec-cyan/40 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
                  <span className="font-bold">Crear primer incidente</span>
                </button>
              </div>
            </div>
          ) : (
            incidents.items.map((incident) => (
              <SocialIncidentCard
                key={incident.id}
                incident={incident}
                onView={() => handleViewIncident(incident.id)}
                onEdit={() => handleEditIncident(incident.id)}
              />
            ))
          )}
      </div>

      {/* Pagination */}
      {incidents.totalPages > 1 && (
        <Pagination
          currentPage={incidents.page}
          totalPages={incidents.totalPages}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </div>
  );
};
