import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Incident, Comment } from '../types';
import { incidentsAPI } from '../api/incidents';
import { commentsAPI } from '../api/comments';
import { CommentList } from '../components/CommentList';
import { AssignIncidentModal } from '../components/AssignIncidentModal';
import { handleApiError } from '../utils/helpers';
import { useToast } from '../components/Toast';
import { formatDate } from '../utils/date';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { Edit, Clock, User, AlertTriangle, FileText, MessageSquare, Activity, Calendar, Image as ImageIcon, Download, X, ChevronLeft, ChevronRight, MapPin, UserPlus } from 'lucide-react';
import { S3ImageGallery } from '../components/S3Image';
import { ImageLightbox } from '../components/ImageLightbox';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadIncident = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const incidentData = await incidentsAPI.getIncident(id);
      setIncident(incidentData);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    
    try {
      setIsLoadingComments(true);
      const commentsData = await commentsAPI.getComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };



  useEffect(() => {
    loadIncident();
    loadComments();
    
    // Check if returning from edit with success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('updated') === 'true') {
      // Show success message
      showToast({
        type: 'success',
        title: 'Incidente actualizado',
        message: 'Los cambios se aplicaron correctamente',
        duration: 3000
      });
      
      // Force refresh the data to show updated values
      setTimeout(() => {
        loadIncident();
      }, 500);
      
      // Clean the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [id]);

  const handleAddComment = async (content: string): Promise<void> => {
    if (!id) return;
    
    const newComment = await commentsAPI.createComment(id, content);
    setComments(prev => [...prev, newComment]);
  };

  const handleEdit = () => {
    navigate(`/incidents/${id}/edit`);
  };

  const handleAssign = async (userId: string) => {
    if (!id) return;
    
    try {
      const updatedIncident = await incidentsAPI.assignIncident(id, userId);
      setIncident(updatedIncident);
      
      showToast({
        type: 'success',
        title: 'Incidente asignado',
        message: `El incidente ha sido asignado a ${userId}`,
        duration: 4000
      });
    } catch (error) {
      const apiError = handleApiError(error);
      showToast({
        type: 'error',
        title: 'Error al asignar',
        message: apiError.message,
        duration: 4000
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-800/50 rounded-xl animate-pulse"></div>
              <div className="h-6 bg-gray-800/50 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-800/50 rounded-xl w-32 animate-pulse"></div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-8 animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3 mb-6"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-800 rounded-full w-20"></div>
                  <div className="h-8 bg-gray-800 rounded-full w-20"></div>
                  <div className="h-8 bg-gray-800 rounded-full w-24"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6 animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="rounded-2xl border-2 border-red-400 bg-red-50 backdrop-blur-sm p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-red-400">
              <AlertTriangle className="h-8 w-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Error al cargar el incidente</h2>
            <p className="text-gray-900 font-bold max-w-md mx-auto">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="rounded-2xl border-2 border-gray-300 bg-white backdrop-blur-sm p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-900" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Incidente no encontrado</h2>
            <p className="text-gray-900 font-bold max-w-md mx-auto">El incidente que buscas no existe o ha sido eliminado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-utec-cyan/10 via-white to-utec-cyan/5 border-2 border-gray-200 p-8 shadow-xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-utec-cyan/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-utec-cyan/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Title with ID */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-900 rounded-lg font-mono font-black text-sm border-2 border-gray-300 shadow-md">
              #{incident.id}
            </span>
            <h1 className="text-4xl font-black text-gray-900 leading-tight">{incident.title}</h1>
          </div>

          {/* Location & Category Badges - Very Prominent */}
          <div className="mb-4 flex flex-wrap gap-3">
            {incident.location && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all">
                <div className="flex h-10 w-10 items-center justify-center bg-white rounded-full shadow-lg">
                  <MapPin className="h-5 w-5 text-blue-600" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Ubicación</p>
                  <p className="text-lg font-black text-white">📍 {incident.location}</p>
                </div>
              </div>
            )}
            {incident.category && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-all">
                <div className="flex h-10 w-10 items-center justify-center bg-white rounded-full shadow-lg">
                  <span className="text-xl">🏷️</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Categoría</p>
                  <p className="text-lg font-black text-white">{CATEGORY_LABELS[incident.category]}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${STATUS_COLORS[incident.status]} ring-2 shadow-lg`}>
              <Activity className="h-4 w-4" />
              {STATUS_LABELS[incident.status]}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${PRIORITY_COLORS[incident.priority]} ring-2 shadow-lg`}>
              <AlertTriangle className="h-4 w-4" />
              {PRIORITY_LABELS[incident.priority]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="card border-2 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 border-2 border-gray-300 shadow-lg">
                <FileText className="h-5 w-5 text-gray-900" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Descripción</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap font-medium text-base">{incident.description}</p>
            </div>
          </div>

          {/* Attachments Card */}
          {incident.attachments && incident.attachments.length > 0 && (
            <div className="card border-2 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-300 shadow-lg">
                  <ImageIcon className="h-5 w-5 text-gray-900" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Archivos Adjuntos</h2>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-black border-2 border-blue-300">
                  {incident.attachments.length}
                </span>
              </div>
              
              {/* Image Grid con S3ImageGallery */}
              {incident.attachments.some(att => att.contentType.startsWith('image/') || att.isImage) && (() => {
                const imageAttachments = incident.attachments!.filter(att => 
                  att.contentType.startsWith('image/') || att.isImage
                );
                const s3Keys = imageAttachments
                  .map(att => att.s3Key)
                  .filter(key => key !== undefined) as string[];
                
                // Si hay claves S3, usar el componente S3ImageGallery
                if (s3Keys.length > 0) {
                  return (
                    <S3ImageGallery
                      s3Keys={s3Keys}
                      onImageClick={(index) => {
                        setCurrentImageIndex(index);
                        setLightboxOpen(true);
                      }}
                      className="mb-4"
                    />
                  );
                }
                
                // Fallback: usar URLs directas si no hay s3Keys
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {imageAttachments.map((attachment, index) => (
                      <div
                        key={attachment.id}
                        className="group relative aspect-video overflow-hidden rounded-xl border-2 border-gray-300 bg-gray-100 cursor-pointer transition-all hover:border-utec-cyan hover:shadow-xl hover:shadow-utec-cyan/20"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F3F4F6" width="400" height="300"/%3E%3Ctext fill="%236B7280" font-family="system-ui" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-xs text-white font-bold truncate drop-shadow-lg">{attachment.filename}</p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="bg-utec-cyan backdrop-blur-sm rounded-full p-2 shadow-lg">
                            <ImageIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Other Files List */}
              {incident.attachments.some(att => !att.contentType.startsWith('image/') && !att.isImage) && (
                <div className="space-y-2 border-t-2 border-gray-200 pt-4">
                  <h4 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Otros archivos</h4>
                  {incident.attachments
                    .filter(att => !att.contentType.startsWith('image/') && !att.isImage)
                    .map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all hover:border-utec-cyan hover:bg-utec-cyan/5 hover:shadow-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 group-hover:bg-utec-cyan/20 transition-colors">
                            <FileText className="h-5 w-5 text-gray-900 group-hover:text-utec-cyan" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{attachment.filename}</p>
                            <p className="text-xs text-gray-900 font-bold">
                              {(attachment.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Download className="h-5 w-5 text-gray-900 group-hover:text-utec-cyan transition-colors" />
                      </a>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="card border-2 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border-2 border-purple-300 shadow-lg">
                <MessageSquare className="h-5 w-5 text-gray-900" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Comentarios</h2>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-black border-2 border-purple-300">
                {comments.length}
              </span>
            </div>
            <CommentList
              comments={comments}
              isLoading={isLoadingComments}
              onAddComment={handleAddComment}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="card border-2 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 border-2 border-gray-300 shadow-lg">
                <Activity className="h-5 w-5 text-gray-900" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Información</h2>
            </div>
            
            <div className="space-y-4">
              {/* Location Info */}
              {incident.location && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg">
                  <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                    Ubicación del Incidente
                  </dt>
                  <dd className="text-base text-gray-900 font-black flex items-center space-x-2">
                    <span className="text-2xl">📍</span>
                    <span>{incident.location}</span>
                  </dd>
                </div>
              )}

              {/* Category Info */}
              {incident.category && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
                  <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <span className="text-sm">🏷️</span>
                    Categoría
                  </dt>
                  <dd className="text-base text-gray-900 font-black">
                    {CATEGORY_LABELS[incident.category]}
                  </dd>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
                <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Creado por</dt>
                <dd className="text-sm text-gray-900 flex items-center space-x-2 font-bold">
                  <div className="w-8 h-8 bg-utec-cyan/20 border-2 border-utec-cyan rounded-full flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-gray-900" strokeWidth={2.5} />
                  </div>
                  <span>{incident.createdBy}</span>
                </dd>
              </div>
              
              {incident.assignedTo && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                  <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Asignado a</dt>
                  <dd className="text-sm text-gray-900 flex items-center space-x-2 font-bold">
                    <div className="w-8 h-8 bg-green-200 border-2 border-green-400 rounded-full flex items-center justify-center shadow-md">
                      <User className="h-4 w-4 text-gray-900" strokeWidth={2.5} />
                    </div>
                    <span>{incident.assignedTo}</span>
                  </dd>
                </div>
              )}
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Fecha de creación</dt>
                <dd className="text-sm text-gray-900 flex items-center space-x-2 font-bold">
                  <Calendar className="h-5 w-5 text-gray-900" />
                  <span>{formatDate(incident.createdAt)}</span>
                </dd>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
                <dt className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Última actualización</dt>
                <dd className="text-sm text-gray-900 flex items-center space-x-2 font-bold">
                  <Clock className="h-5 w-5 text-gray-900" />
                  <span>{formatDate(incident.updatedAt)}</span>
                </dd>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="card border-2 shadow-xl bg-gradient-to-br from-utec-cyan/5 to-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-utec-cyan/20 border-2 border-utec-cyan shadow-lg">
                <Activity className="h-5 w-5 text-gray-900" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Estado</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border-2 border-gray-300">
                <span className="text-sm text-gray-900 font-black uppercase tracking-wide">Estado actual</span>
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[incident.status]} ring-2`}>
                  <Activity className="h-3.5 w-3.5" />
                  {STATUS_LABELS[incident.status]}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border-2 border-gray-300">
                <span className="text-sm text-gray-900 font-black uppercase tracking-wide">Prioridad</span>
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${PRIORITY_COLORS[incident.priority]} ring-2`}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {PRIORITY_LABELS[incident.priority]}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card border-2 shadow-xl bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border-2 border-purple-300 shadow-lg">
                <Edit className="h-5 w-5 text-gray-900" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Acciones</h2>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-white border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500 text-gray-900 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Edit className="h-5 w-5 text-gray-900" />
                <span>Editar Incidente</span>
              </button>

              <button
                onClick={() => setShowAssignModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-blue-600 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <UserPlus className="h-5 w-5 text-white" strokeWidth={2.5} />
                <span>Asignar Incidente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox con S3 */}
      {lightboxOpen && incident?.attachments && (() => {
        const imageAttachments = incident.attachments.filter(att => 
          att.contentType.startsWith('image/') || att.isImage
        );
        const s3Keys = imageAttachments
          .map(att => att.s3Key)
          .filter(key => key !== undefined) as string[];
        
        // Si hay claves S3, usar ImageLightbox con S3
        if (s3Keys.length > 0) {
          return (
            <ImageLightbox
              s3Keys={s3Keys}
              initialIndex={currentImageIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          );
        }
        
        // Fallback: lightbox tradicional para URLs directas
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {imageAttachments.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => 
                      prev === 0 ? imageAttachments.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => 
                      prev === imageAttachments.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <img
                src={imageAttachments[currentImageIndex]?.url}
                alt={imageAttachments[currentImageIndex]?.filename}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-white font-bold">
                  {imageAttachments[currentImageIndex]?.filename}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  {currentImageIndex + 1} de {imageAttachments.length}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignIncidentModal
          incidentId={incident?.id || ''}
          currentAssignee={incident?.assignedTo}
          onAssign={handleAssign}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
};
