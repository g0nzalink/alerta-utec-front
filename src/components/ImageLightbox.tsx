import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { S3Image } from './S3Image';

interface ImageLightboxProps {
  s3Keys: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal lightbox para ver imágenes en pantalla completa
 * Incluye navegación, zoom y descarga
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  s3Keys,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : s3Keys.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < s3Keys.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = async () => {
    // TODO: Implementar descarga cuando sea necesario
    console.log('Download image:', s3Keys[currentIndex]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Header con controles */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-bold">
            {currentIndex + 1} / {s3Keys.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de zoom */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Alejar"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-white text-sm font-bold min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Acercar"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Botón de descarga */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Descargar"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Cerrar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="relative w-full h-full flex items-center justify-center p-16">
        <div
          className="max-w-full max-h-full overflow-auto transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <S3Image
            s3Key={s3Keys[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* Botones de navegación */}
      {s3Keys.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            title="Anterior (←)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            title="Siguiente (→)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Miniaturas */}
      {s3Keys.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 justify-center overflow-x-auto max-w-4xl mx-auto">
            {s3Keys.map((key, index) => (
              <button
                key={key}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-utec-cyan shadow-lg scale-110'
                    : 'border-white/30 hover:border-white/50 hover:scale-105'
                }`}
              >
                <S3Image
                  s3Key={key}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
