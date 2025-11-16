import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateIncidentRequest } from '../types';
import { incidentsAPI } from '../api/incidents';
import { imagesAPI } from '../api/images';
import { handleApiError } from '../utils/helpers';
import { PRIORITY_LABELS, CATEGORY_LABELS } from '../utils/constants';
import { ArrowLeft, Save, Upload, X, FileText, Image, File, Loader2 } from 'lucide-react';

export const CreateIncident: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateIncidentRequest>({
    title: '',
    description: '',
    location: '',
    priority: 'MEDIUM',
    category: 'SOFTWARE'
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar tamaño de archivo (10MB máximo)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Crear URLs de vista previa para imágenes
    const newPreviewUrls: string[] = [];
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      } else {
        newPreviewUrls.push('');
      }
    });

    setAttachments(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError(null);
  };

  const removeAttachment = (index: number) => {
    // Liberar URL de vista previa si existe
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Título y descripción son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // 1. Crear el incidente primero
      const newIncident = await incidentsAPI.createIncident(formData);
      console.log('✅ Incident created:', newIncident.id);
      
      // 2. Subir imágenes a S3 si hay archivos adjuntos
      if (attachments.length > 0) {
        try {
          setUploadingImages(true);
          console.log(`📤 Uploading ${attachments.length} files...`);
          
          const imageFiles = attachments.filter(file => file.type.startsWith('image/'));
          
          if (imageFiles.length > 0) {
            // Subir cada imagen con monitoreo de progreso
            const uploadPromises = imageFiles.map(async (file, index) => {
              try {
                setUploadProgress(prev => ({ ...prev, [index]: 0 }));
                const s3Key = await imagesAPI.uploadImage(file);
                setUploadProgress(prev => ({ ...prev, [index]: 100 }));
                console.log(`✅ Uploaded ${file.name} → ${s3Key}`);
                return s3Key;
              } catch (error) {
                console.error(`❌ Failed to upload ${file.name}:`, error);
                setUploadProgress(prev => ({ ...prev, [index]: -1 }));
                return null;
              }
            });
            
            const s3Keys = await Promise.all(uploadPromises);
            const successfulUploads = s3Keys.filter(key => key !== null);
            
            console.log(`✅ Successfully uploaded ${successfulUploads.length}/${imageFiles.length} images`);
            
            // TODO: Asociar las claves S3 con el incidente en el backend
            // Esto requeriría un endpoint adicional como:
            // PUT /incidents/{id}/attachments con body: { s3Keys: [...] }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          // No bloqueamos la navegación si falla la subida de imágenes
          setError('Incidente creado, pero hubo un error al subir algunas imágenes');
        } finally {
          setUploadingImages(false);
        }
      }
      
      navigate(`/incidents/${newIncident.id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-gray-900" />;
    if (file.type.includes('text') || file.type.includes('application/json')) return <FileText className="h-5 w-5 text-gray-900" />;
    return <File className="h-5 w-5 text-gray-900" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Hero Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-utec-cyan/10 via-white to-blue-50 border-2 border-gray-200 p-8 shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-utec-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <button
            type="button"
            onClick={handleBack}
            className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg font-bold mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 border-2 border-blue-300 shadow-xl">
              <Save className="h-8 w-8 text-gray-900" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                Crear Nuevo Incidente
              </h1>
              <p className="text-base text-gray-900 font-semibold">
                Complete la información para registrar un nuevo incidente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Information */}
        <section className="card space-y-6 border-2 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-300 shadow-lg">
              <FileText className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Información del Incidente</h2>
              <p className="text-sm text-gray-900 font-semibold">Proporcione los detalles clave del incidente.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2 space-y-3">
              <label htmlFor="title" className="text-sm font-black text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-utec-cyan/20 text-utec-cyan text-xs font-bold">1</span>
                Título del Incidente *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-medium text-gray-900"
                placeholder="Describe brevemente el problema o incidente"
                required
              />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label htmlFor="description" className="text-sm font-black text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-utec-cyan/20 text-utec-cyan text-xs font-bold">2</span>
                Descripción Detallada *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="input-field resize-none text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-medium text-gray-900"
                placeholder="Proporcione una descripción detallada del incidente"
                required
              />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label htmlFor="location" className="text-sm font-black text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-utec-cyan/20 text-utec-cyan text-xs font-bold">3</span>
                Ubicación del Incidente *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-medium text-gray-900"
                placeholder="Ej: Edificio A - Aula 101, Laboratorio de Computación, Biblioteca"
                required
              />
              <p className="text-xs text-gray-900 font-semibold flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-utec-cyan"></span>
                Especifique el edificio, aula, laboratorio o área donde ocurrió el incidente
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="priority" className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-utec-cyan/20 text-utec-cyan text-xs font-bold">4</span>
                  Nivel de Prioridad *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-semibold text-gray-900"
                  required
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label htmlFor="category" className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-utec-cyan/20 text-utec-cyan text-xs font-bold">5</span>
                  Categoría del Incidente *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field text-base border-2 focus:border-utec-cyan focus:ring-2 focus:ring-utec-cyan/30 font-semibold text-gray-900"
                  required
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Attachments */}
        <section className="card space-y-6 border-2 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 border-2 border-purple-300 shadow-lg">
              <Upload className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Archivos Adjuntos</h3>
              <p className="text-sm text-gray-900 font-semibold">Agregue capturas de pantalla, logs o documentos relacionados.</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.log,.json"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-3 border-dashed border-gray-400 bg-gradient-to-br from-blue-50 to-purple-50 p-12 text-center transition-all hover:border-utec-cyan hover:bg-gradient-to-br hover:from-utec-cyan/10 hover:to-blue-100 hover:shadow-xl"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border-2 border-gray-300 shadow-xl">
                <Upload className="h-10 w-10 text-utec-cyan" />
              </div>
              <p className="text-lg font-black text-gray-900 mb-2">
                Arrastra tus archivos aquí
              </p>
              <p className="text-base text-gray-900 font-semibold mb-4">
                o haz <span className="font-black text-utec-cyan">clic para seleccionar</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold bg-white px-4 py-2 rounded-full border-2 border-gray-300 shadow-md">
                <Image className="h-5 w-5 text-utec-cyan" />
                <span>Imágenes, PDFs, documentos (máx. 10MB)</span>
              </div>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-200 border-2 border-green-400">
                  {uploadingImages ? (
                    <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-black text-gray-900">
                    {uploadingImages ? `Subiendo ${attachments.length} archivos...` : `Archivos seleccionados (${attachments.length})`}
                  </h4>
                  <p className="text-sm text-gray-900 font-semibold">
                    {uploadingImages ? 'Por favor espera...' : 'Listos para subir con el incidente'}
                  </p>
                </div>
              </div>
              
              {/* Vista previa de imágenes */}
              {attachments.some(f => f.type.startsWith('image/')) && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {attachments.map((file, index) => 
                    file.type.startsWith('image/') && previewUrls[index] ? (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-300/80 bg-white/60"
                      >
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        
                        {/* Barra de progreso de subida */}
                        {uploadProgress[index] !== undefined && uploadProgress[index] >= 0 && uploadProgress[index] < 100 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-3/4">
                              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-utec-cyan h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[index]}%` }}
                                />
                              </div>
                              <p className="text-white text-xs font-bold text-center mt-2">
                                {uploadProgress[index]}%
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Indicador de éxito */}
                        {uploadProgress[index] === 100 && (
                          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Indicador de error */}
                        {uploadProgress[index] === -1 && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                            <p className="text-white text-xs font-bold">Error</p>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate font-bold">{file.name}</p>
                          <p className="text-gray-300 font-semibold">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          disabled={uploadingImages}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-all hover:bg-red-600 hover:scale-110 group-hover:opacity-100 shadow-lg border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Lista de archivos no-imagen */}
              {attachments.some(f => !f.type.startsWith('image/')) && (
                <div className="space-y-2">
                  {attachments.map((file, index) => 
                    !file.type.startsWith('image/') ? (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 border-2 border-gray-300">
                            {getFileIcon(file)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-900 font-semibold">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 border-2 border-red-300 text-gray-900 transition-all hover:bg-red-200 hover:border-red-400 hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="card border-2 border-red-400 bg-red-50 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-200 border-2 border-red-400">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 mb-1">Error al crear incidente</h3>
                <p className="text-sm text-gray-900 font-bold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold bg-white text-gray-900 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-base shadow-xl hover:shadow-2xl disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="loading-spinner" />}
            <Save className="h-5 w-5" />
            <span className="font-black">Crear Incidente</span>
          </button>
        </div>
      </form>
    </div>
  );
};
