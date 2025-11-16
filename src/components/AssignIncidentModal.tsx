import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { usersAPI } from '../api/users';
import type { User } from '../types';

interface AssignIncidentModalProps {
  incidentId: string;
  currentAssignee?: string;
  onAssign: (userId: string) => Promise<void>;
  onClose: () => void;
}

export const AssignIncidentModal: React.FC<AssignIncidentModalProps> = ({
  incidentId,
  currentAssignee,
  onAssign,
  onClose,
}) => {
  const [userId, setUserId] = useState(currentAssignee || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Cargar lista de usuarios disponibles al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await usersAPI.getAssignableUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('El ID del usuario es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAssign(userId.trim());
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al asignar el incidente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl border-2 border-gray-300 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-300 shadow-lg">
              <UserPlus className="h-6 w-6 text-gray-900" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Asignar Incidente</h2>
              <p className="text-sm text-gray-900 font-semibold">ID: {incidentId.substring(0, 8)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-900 transition-colors border-2 border-transparent hover:border-gray-300"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label htmlFor="userId" className="text-sm font-black text-gray-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-utec-cyan" strokeWidth={2.5} />
              Seleccionar Usuario *
            </label>
            
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-utec-cyan animate-spin" />
                <span className="ml-3 text-sm text-gray-600 font-semibold">Cargando usuarios...</span>
              </div>
            ) : availableUsers.length > 0 ? (
              <select
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-semibold text-gray-900"
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccione un usuario...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role === 'staff' ? 'Personal' : 'Autoridad'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl bg-yellow-50 border-2 border-yellow-300 p-4">
                <p className="text-sm text-gray-900 font-bold">
                  ⚠️ No hay usuarios disponibles para asignar
                </p>
                <p className="text-xs text-gray-700 font-semibold mt-2">
                  Ingrese manualmente el ID del usuario:
                </p>
                <input
                  id="userId-manual"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-medium text-gray-900 mt-2"
                  placeholder="ID del usuario"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            <p className="text-xs text-gray-900 font-semibold flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-utec-cyan"></span>
              Seleccione el personal al que desea asignar este incidente
            </p>
          </div>

          {currentAssignee && (
            <div className="rounded-xl bg-blue-50 border-2 border-blue-300 p-4">
              <p className="text-sm text-gray-900 font-bold">
                ℹ️ <strong>Asignación actual:</strong> {currentAssignee}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-400 p-4">
              <p className="text-sm text-red-800 font-bold">
                ❌ {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 btn-secondary py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-3"
            >
              {isSubmitting && <span className="loading-spinner" />}
              <UserPlus className="h-4 w-4" strokeWidth={2.5} />
              <span>Asignar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
