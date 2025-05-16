/**
 * Configuración de Supabase para el CDN
 * 
 * Este archivo contiene la configuración básica para conectar con Supabase
 * y definir la estructura de buckets y políticas de acceso.
 */

// Importaciones
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Nota: En producción, estas variables deben estar en un archivo .env
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const SUPABASE_SERVICE_KEY = 'your-service-key'; // Solo para operaciones administrativas

// Cliente de Supabase para operaciones públicas
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente de Supabase para operaciones administrativas
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Definición de buckets
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  ORIGINALS: 'originals',
  ASSETS: 'assets'
};

// Definición de carpetas
export const STORAGE_FOLDERS = {
  IMAGES: {
    WEBP: {
      ORIGINAL: 'webp/original',
      LG: 'webp/lg',
      MD: 'webp/md',
      SM: 'webp/sm',
      THUMB: 'webp/thumb'
    },
    SVG: 'svg'
  },
  ORIGINALS: {
    UPLOADS: 'uploads',
    PROCESSED: 'processed',
    ARCHIVE: 'archive'
  },
  ASSETS: {
    DOCUMENTS: 'documents',
    VIDEOS: 'videos',
    OTHER: 'other'
  }
};

// Configuración de tamaños de imagen
export const IMAGE_SIZES = {
  ORIGINAL: null, // Mantiene el tamaño original
  LG: 1200,
  MD: 800,
  SM: 400,
  THUMB: 200
};

// Configuración de calidad de WebP
export const WEBP_QUALITY = 80; // 0-100

// Límites de tamaño de archivo (en bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
  VIDEO: 100 * 1024 * 1024 // 100MB
};

// Tipos de archivo permitidos
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Función para generar URLs públicas
export const getPublicUrl = (bucket, path, filename) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}/${filename}`;
};

// Función para generar URLs con fingerprinting para invalidación de caché
export const getVersionedUrl = (bucket, path, filename, version = 1) => {
  const filenameParts = filename.split('.');
  const extension = filenameParts.pop();
  const name = filenameParts.join('.');
  return getPublicUrl(bucket, path, `${name}.v${version}.${extension}`);
};

// Exportar configuración completa
export default {
  supabaseClient,
  supabaseAdmin,
  STORAGE_BUCKETS,
  STORAGE_FOLDERS,
  IMAGE_SIZES,
  WEBP_QUALITY,
  FILE_SIZE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  getPublicUrl,
  getVersionedUrl
};
