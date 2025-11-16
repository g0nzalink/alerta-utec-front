import React, { useState } from 'react';
import { S3Image, S3ImageGallery, S3ImageWithPlaceholder } from '../components/S3Image';
import { ImageLightbox } from '../components/ImageLightbox';
import { Image as ImageIcon, Upload, Info } from 'lucide-react';

/**
 * Página de demostración del sistema de imágenes S3
 * Muestra cómo usar los componentes de imágenes con URLs pre-firmadas
 */
export const ImageDemo: React.FC = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ejemplos de claves S3 (ajustar según la estructura real)
  const exampleKeys = [
    'incidents/example1.jpg',
    'incidents/example2.jpg',
    'incidents/example3.jpg',
    'incidents/example4.jpg',
  ];

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border-2 border-gray-200 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-purple-300 shadow-xl">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                Sistema de Imágenes S3
              </h1>
              <p className="text-base text-gray-900 font-semibold">
                Demostración de componentes para mostrar imágenes con URLs pre-firmadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-300">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Características</h3>
            <ul className="space-y-1 text-sm text-gray-900 font-semibold">
              <li>✅ URLs pre-firmadas de S3 con cache automático</li>
              <li>✅ Carga lazy de imágenes</li>
              <li>✅ Manejo de errores con placeholders</li>
              <li>✅ Galería con lightbox interactivo</li>
              <li>✅ Soporte para zoom y navegación por teclado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Single Image Example */}
      <section className="card border-2 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 border-2 border-green-300 shadow-lg">
            <ImageIcon className="h-5 w-5 text-gray-900" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Imagen Individual</h2>
        </div>
        
        <div className="max-w-md">
          <S3Image
            s3Key={exampleKeys[0]}
            alt="Ejemplo de imagen individual"
            className="w-full h-64 object-cover rounded-xl border-2 border-gray-300 shadow-lg"
          />
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-mono text-gray-700">
            <span className="font-bold">Uso:</span>{' '}
            <span className="text-utec-cyan">&lt;S3Image s3Key="{exampleKeys[0]}" alt="..." /&gt;</span>
          </p>
        </div>
      </section>

      {/* Image with Placeholder */}
      <section className="card border-2 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 border-2 border-yellow-300 shadow-lg">
            <Upload className="h-5 w-5 text-gray-900" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Imagen con Placeholder</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Con imagen:</p>
            <S3ImageWithPlaceholder
              s3Key={exampleKeys[0]}
              alt="Con imagen"
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Sin imagen (placeholder):</p>
            <S3ImageWithPlaceholder
              alt="Sin imagen"
              className="w-full h-48 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="card border-2 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border-2 border-purple-300 shadow-lg">
            <ImageIcon className="h-5 w-5 text-gray-900" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Galería de Imágenes</h2>
        </div>
        
        <S3ImageGallery
          s3Keys={exampleKeys}
          onImageClick={handleImageClick}
        />
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-mono text-gray-700 mb-2">
            <span className="font-bold">Uso:</span>
          </p>
          <pre className="text-xs text-utec-cyan overflow-x-auto">
{`<S3ImageGallery
  s3Keys={imageKeys}
  onImageClick={(index) => handleClick(index)}
/>`}
          </pre>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          s3Keys={exampleKeys}
          initialIndex={selectedIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* API Usage */}
      <section className="card border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 border-2 border-indigo-300 shadow-lg">
            <span className="text-xl">💻</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Uso Programático</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Obtener URL pre-firmada individual:</p>
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
{`import { imagesAPI } from '../api/images';

const signedUrl = await imagesAPI.getSignedUrl('incidents/image.jpg');
console.log(signedUrl); // https://bucket.s3.amazonaws.com/...?signature=...`}
            </pre>
          </div>
          
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Obtener múltiples URLs:</p>
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
{`const keys = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
const urls = await imagesAPI.getSignedUrls(keys);
// Retorna array de URLs en el mismo orden`}
            </pre>
          </div>
          
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Cache automático:</p>
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
{`// Las URLs se cachean por 55 minutos
// Llamadas subsecuentes usan el cache
const cacheSize = imagesAPI.getCacheSize();
imagesAPI.clearCache(); // Limpiar cache manualmente`}
            </pre>
          </div>
        </div>
      </section>

      {/* Notes */}
      <div className="card border-2 border-amber-200 bg-amber-50 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 border-2 border-amber-300">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Notas Importantes</h3>
            <ul className="space-y-2 text-sm text-gray-900 font-semibold">
              <li>
                <strong>Estructura de claves S3:</strong> Las claves deben seguir la estructura:
                <code className="ml-2 px-2 py-1 bg-gray-900 text-green-400 rounded font-mono text-xs">
                  incidents/[incidentId]/[filename]
                </code>
              </li>
              <li>
                <strong>Expiración:</strong> Las URLs pre-firmadas expiran después de 1 hora (configurado en el backend).
              </li>
              <li>
                <strong>Cache:</strong> Las URLs se cachean localmente por 55 minutos para optimizar rendimiento.
              </li>
              <li>
                <strong>Autenticación:</strong> Se requiere JWT token válido para obtener URLs pre-firmadas.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
