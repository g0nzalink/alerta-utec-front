import React, { useState } from 'react';
import type { Comment } from '../types';
import { formatDate, formatRelativeTime } from '../utils/date';
import { Send, MessageCircle } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onAddComment: (content: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <div className="card border-2 border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-gray-900" strokeWidth={2.5} />
          Agregar Comentario
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            rows={3}
            className="input-field w-full resize-none border-2 text-gray-900 font-medium"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Comentario'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900">
          Comentarios ({comments.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="card border-2 border-gray-200 text-center py-8 bg-gray-50">
            <MessageCircle className="h-12 w-12 text-gray-900 mx-auto mb-4" strokeWidth={2.5} />
            <h4 className="text-lg font-black text-gray-900 mb-2">Sin comentarios</h4>
            <p className="text-gray-900 font-bold">Sé el primero en comentar este incidente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="card border-2 border-gray-200 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-900 text-sm font-black shadow-md border-2 border-gray-400">
                    {comment.createdByName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-black text-gray-900">{comment.createdByName}</span>
                      <span className="text-gray-900 text-sm font-bold" title={formatDate(comment.createdAt)}>
                        hace alrededor de {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 leading-relaxed font-medium">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
