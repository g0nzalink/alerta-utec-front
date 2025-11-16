import React, { useState, useEffect } from 'react';
import { imagesAPI } from '../api/images';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface S3ImageProps {
  s3Key: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Componente para mostrar imágenes de S3 usando URLs pre-firmadas
 * Maneja automáticamente la carga lazy, errores y estados de carga
 */
export const S3Image: React.FC<S3ImageProps> = ({
  s3Key,
  alt,
  className = '',
  fallback,
  onLoad,
  onError
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Intentar obtener la imagen local primero
        const localImage = imagesAPI.getLocalImage(s3Key);
        if (localImage) {
          console.log(`💾 Using locally stored image: ${s3Key}`);
          if (isMounted) {
            setSignedUrl(localImage);
            setLoading(false);
          }
          return;
        }
        
        // Si no está local, intentar obtener de S3
        const url = await imagesAPI.getSignedUrl(s3Key);
        
        if (isMounted) {
          setSignedUrl(url);
        }
      } catch (err: any) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar la imagen');
          onError?.(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [s3Key, onError]);

  const handleImageLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setError('Error al cargar la imagen');
    setLoading(false);
  };

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg p-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-700 font-semibold text-center">{error}</p>
      </div>
    );
  }

  if (loading || !signedUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-lg p-8 ${className}`}>
        <Loader2 className="h-8 w-8 text-utec-cyan animate-spin mb-2" />
        <p className="text-sm text-gray-600 font-semibold">Cargando imagen...</p>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

/**
 * Componente para mostrar una galería de imágenes de S3
 */
interface S3ImageGalleryProps {
  s3Keys: string[];
  onImageClick?: (index: number) => void;
  className?: string;
}

export const S3ImageGallery: React.FC<S3ImageGalleryProps> = ({
  s3Keys,
  onImageClick,
  className = ''
}) => {
  if (s3Keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
        <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 font-semibold">No hay imágenes para mostrar</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {s3Keys.map((key, index) => (
        <div
          key={key}
          className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:shadow-xl transition-all"
          onClick={() => onImageClick?.(index)}
        >
          <S3Image
            s3Key={key}
            alt={`Imagen ${index + 1}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs font-bold truncate">Imagen {index + 1}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Componente simple para mostrar una imagen con placeholder
 */
interface S3ImageWithPlaceholderProps {
  s3Key?: string;
  alt: string;
  className?: string;
  placeholderIcon?: React.ReactNode;
}

export const S3ImageWithPlaceholder: React.FC<S3ImageWithPlaceholderProps> = ({
  s3Key,
  alt,
  className = '',
  placeholderIcon
}) => {
  if (!s3Key) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg ${className}`}>
        {placeholderIcon || <ImageIcon className="h-12 w-12 text-gray-400" />}
      </div>
    );
  }

  return <S3Image s3Key={s3Key} alt={alt} className={className} />;
};
