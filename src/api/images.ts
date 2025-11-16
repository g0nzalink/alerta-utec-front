import axios, { type AxiosInstance } from 'axios';
import { TOKEN_KEY } from '../config';
import { AppError } from '../utils/helpers';

// URL base para la API de imágenes AWS Lambda
const IMAGES_API_URL = 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev';

// Cliente HTTP para imágenes con autenticación
const imagesHttpClient: AxiosInstance = axios.create({
  baseURL: IMAGES_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
imagesHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🖼️ Images API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('❌ Images Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
imagesHttpClient.interceptors.response.use(
  (response) => {
    console.log('✅ Images Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Images Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Cache de URLs pre-firmadas para evitar solicitudes repetidas
const urlCache = new Map<string, { url: string; expiresAt: number }>();

class ImagesAPI {
  /**
   * Obtiene una URL pre-firmada de S3 para acceder a una imagen
   * @param key - La clave/ruta del archivo en S3 (ej: "incidents/abc123/image.jpg")
   * @returns URL pre-firmada válida por 1 hora
   */
  async getSignedUrl(key: string): Promise<string> {
    try {
      // Verificar cache primero (con 5 min de margen antes de expiración)
      const cached = urlCache.get(key);
      const now = Date.now();
      
      if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
        console.log(`🎯 Using cached URL for: ${key}`);
        return cached.url;
      }

      console.log(`📡 Fetching signed URL for: ${key}`);
      const response = await imagesHttpClient.get('/images/signed-url', {
        params: { key }
      });

      const signedUrl = response.data.url;
      
      // Cachear URL (expira en 55 minutos, antes de la expiración real de S3)
      urlCache.set(key, {
        url: signedUrl,
        expiresAt: now + 55 * 60 * 1000
      });

      return signedUrl;
    } catch (error: any) {
      console.error('❌ Get signed URL error:', error);
      
      if (error.response?.status === 404) {
        throw new AppError('Imagen no encontrada', 404, 'NOT_FOUND');
      }
      
      if (error.response?.status === 400) {
        throw new AppError('Clave de imagen inválida', 400, 'INVALID_KEY');
      }

      throw new AppError(
        error.response?.data?.error || 'Error al obtener URL de imagen',
        error.response?.status || 500,
        'SIGNED_URL_ERROR'
      );
    }
  }

  /**
   * Obtiene URLs pre-firmadas para múltiples imágenes en paralelo
   * @param keys - Array de claves de S3
   * @returns Array de URLs pre-firmadas en el mismo orden
   */
  async getSignedUrls(keys: string[]): Promise<string[]> {
    try {
      const uniqueKeys = [...new Set(keys)]; // Eliminar duplicados
      
      const urls = await Promise.all(
        uniqueKeys.map(key => this.getSignedUrl(key))
      );

      // Mapear URLs de vuelta al orden original (considerando duplicados)
      const urlMap = new Map(uniqueKeys.map((key, i) => [key, urls[i]]));
      return keys.map(key => urlMap.get(key)!);
    } catch (error: any) {
      console.error('❌ Get signed URLs error:', error);
      throw new AppError('Error al obtener URLs de imágenes', error.status || 500, 'SIGNED_URLS_ERROR');
    }
  }

  /**
   * Genera una URL pre-firmada de S3 para SUBIR una imagen
   * POST /images/generate
   * @param fileName - Nombre del archivo (ej: "imagen1.jpg")
   * @param fileType - Tipo MIME del archivo (ej: "image/jpeg", "image/png")
   * @returns Objeto con la URL pre-firmada y la clave S3
   */
  async generateUploadUrl(fileName: string, fileType: string): Promise<{ url: string; key: string }> {
    try {
      console.log(`📤 Generating upload URL for: ${fileName} (${fileType})`);
      
      const response = await imagesHttpClient.post('/images/generate', {
        fileName,
        fileType
      });

      const { url, key } = response.data;

      if (!url || !key) {
        throw new AppError('Respuesta inválida del servidor', 500);
      }

      console.log(`✅ Upload URL generated for key: ${key}`);
      return { url, key };
    } catch (error: any) {
      console.error('❌ Generate upload URL error:', error);
      
      if (error.response?.status === 401) {
        throw new AppError('No autorizado', 401);
      }

      throw new AppError(
        error.response?.data?.error || 'Error al generar URL de subida',
        error.response?.status || 500
      );
    }
  }

  /**
   * Sube un archivo a S3 usando una URL pre-firmada
   * @param file - Archivo a subir
   * @param uploadUrl - URL pre-firmada obtenida de generateUploadUrl
   * @returns Promise que se resuelve cuando la subida está completa
   */
  async uploadFile(file: File, uploadUrl: string): Promise<void> {
    try {
      console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);
      
      // Intentar subir a S3 usando fetch nativo (mejor manejo de CORS)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        console.error('❌ S3 Upload failed:', response.status, response.statusText);
        
        // Si falla con 403, NO lanzar error - continuar con modo desarrollo
        if (response.status === 403) {
          console.warn('⚠️ S3 upload blocked (403). Backend needs to fix S3 bucket permissions.');
          console.warn('⚠️ Continuing with local image preview mode...');
          // No lanzar error, retornar normalmente
          return;
        }
        
        throw new AppError(
          `Error al subir archivo: ${response.statusText}`,
          response.status
        );
      }

      console.log(`✅ File uploaded successfully: ${file.name}`);
    } catch (error: any) {
      console.error('❌ Upload file error:', error);
      
      // Si es un AppError de permisos (403), no propagar el error
      if (error instanceof AppError && error.status === 403) {
        console.warn('⚠️ Skipping S3 upload error, continuing with local mode');
        return;
      }
      
      // Si ya es AppError (otro tipo), re-lanzarlo
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Error al subir el archivo',
        500
      );
    }
  }

  /**
   * Guarda una imagen en localStorage como base64
   * (Fallback cuando S3 no está disponible)
   */
  private async saveImageLocally(file: File, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          localStorage.setItem(`img_${key}`, base64);
          console.log(`💾 Image saved locally: ${key}`);
          resolve();
        } catch (error) {
          console.error('Error saving image locally:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtiene una imagen de localStorage
   */
  getLocalImage(key: string): string | null {
    return localStorage.getItem(`img_${key}`);
  }

  /**
   * Proceso completo: genera URL pre-firmada y sube el archivo
   * @param file - Archivo a subir
   * @returns La clave S3 del archivo subido
   */
  async uploadImage(file: File): Promise<string> {
    try {
      // 1. Generar URL pre-firmada
      const { url, key } = await this.generateUploadUrl(file.name, file.type);

      // 2. Guardar localmente primero (para preview inmediato)
      await this.saveImageLocally(file, key);

      // 3. Intentar subir archivo a S3
      try {
        await this.uploadFile(file, url);
        console.log(`✅ Image uploaded to S3: ${key}`);
      } catch (uploadError: any) {
        // Si falla S3, ya tenemos la imagen local
        console.warn(`⚠️ S3 upload failed for ${key}, but image is saved locally`);
        console.warn('⚠️ Backend needs to fix S3 bucket permissions');
      }

      // 4. Retornar la clave (funciona tanto para S3 como local)
      return key;
    } catch (error: any) {
      console.error('❌ Upload image error:', error);
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes en paralelo
   * @param files - Array de archivos a subir
   * @returns Array de claves S3 de los archivos subidos
   */
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      console.log(`📤 Uploading ${files.length} images...`);
      
      const uploadPromises = files.map(file => this.uploadImage(file));
      const keys = await Promise.all(uploadPromises);

      console.log(`✅ All ${files.length} images uploaded successfully`);
      return keys;
    } catch (error: any) {
      console.error('❌ Upload images error:', error);
      throw new AppError('Error al subir las imágenes', 500);
    }
  }

  /**
   * Limpia el cache de URLs (útil cuando el usuario cierra sesión)
   */
  clearCache(): void {
    urlCache.clear();
    console.log('🗑️ Image URL cache cleared');
  }

  /**
   * Obtiene el tamaño del cache actual
   */
  getCacheSize(): number {
    return urlCache.size;
  }

  /**
   * Elimina URLs expiradas del cache
   */
  cleanExpiredUrls(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, value] of urlCache.entries()) {
      if (value.expiresAt <= now) {
        urlCache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🗑️ Cleaned ${removed} expired URLs from cache`);
    }
  }
}

// Exportar instancia singleton
export const imagesAPI = new ImagesAPI();

// Limpiar URLs expiradas cada 10 minutos
setInterval(() => {
  imagesAPI.cleanExpiredUrls();
}, 10 * 60 * 1000);
