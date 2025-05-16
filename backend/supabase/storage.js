/**
 * Gestión de archivos en Supabase Storage
 * 
 * Este archivo contiene las funciones para gestionar archivos en Supabase Storage:
 * - Subida de archivos
 * - Listado de archivos
 * - Eliminación de archivos
 * - Actualización de metadatos
 */

import { supabaseClient, supabaseAdmin, STORAGE_BUCKETS, STORAGE_FOLDERS, FILE_SIZE_LIMITS, ALLOWED_IMAGE_TYPES } from './config.js';

/**
 * Sube un archivo al bucket de originales
 * @param {File} file - Archivo a subir
 * @param {Object} metadata - Metadatos del archivo
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const uploadOriginalFile = async (file, metadata = {}) => {
  try {
    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido: ${file.type}`);
    }

    // Validar tamaño de archivo
    if (file.size > FILE_SIZE_LIMITS.IMAGE) {
      throw new Error(`Archivo demasiado grande: ${file.size} bytes`);
    }

    // Generar nombre de archivo único
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${STORAGE_FOLDERS.ORIGINALS.UPLOADS}/${fileName}`;

    // Subir archivo
    const { data, error } = await supabaseClient
      .storage
      .from(STORAGE_BUCKETS.ORIGINALS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        metadata: {
          ...metadata,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          processed: false
        }
      });

    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        metadata,
        originalName: file.name,
        path: filePath,
        bucket: STORAGE_BUCKETS.ORIGINALS
      }
    };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Lista archivos en un bucket y carpeta específicos
 * @param {string} bucket - Nombre del bucket
 * @param {string} folder - Carpeta dentro del bucket
 * @param {Object} options - Opciones adicionales (límite, offset, etc.)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const listFiles = async (bucket, folder, options = {}) => {
  try {
    const { limit = 100, offset = 0, sortBy = 'name', sortOrder = 'asc' } = options;

    const { data, error } = await supabaseClient
      .storage
      .from(bucket)
      .list(folder, {
        limit,
        offset,
        sortBy: {
          column: sortBy,
          order: sortOrder
        }
      });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error al listar archivos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtiene metadatos de un archivo
 * @param {string} bucket - Nombre del bucket
 * @param {string} path - Ruta completa del archivo
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getFileMetadata = async (bucket, path) => {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .getPublicUrl(path);

    if (error) throw error;

    // Obtener metadatos adicionales
    const response = await fetch(data.publicUrl, { method: 'HEAD' });
    const metadata = Object.fromEntries(response.headers.entries());

    return {
      success: true,
      data: {
        publicUrl: data.publicUrl,
        metadata
      }
    };
  } catch (error) {
    console.error('Error al obtener metadatos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mueve un archivo entre buckets o carpetas
 * @param {string} sourceBucket - Bucket de origen
 * @param {string} sourcePath - Ruta de origen
 * @param {string} destBucket - Bucket de destino
 * @param {string} destPath - Ruta de destino
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const moveFile = async (sourceBucket, sourcePath, destBucket, destPath) => {
  try {
    // Primero descargamos el archivo
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from(sourceBucket)
      .download(sourcePath);

    if (downloadError) throw downloadError;

    // Luego lo subimos al destino
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(destBucket)
      .upload(destPath, fileData, {
        cacheControl: '31536000', // 1 año para recursos inmutables
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Finalmente eliminamos el original
    const { error: deleteError } = await supabaseAdmin
      .storage
      .from(sourceBucket)
      .remove([sourcePath]);

    if (deleteError) throw deleteError;

    return {
      success: true,
      data: {
        sourceBucket,
        sourcePath,
        destBucket,
        destPath
      }
    };
  } catch (error) {
    console.error('Error al mover archivo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina un archivo
 * @param {string} bucket - Nombre del bucket
 * @param {string} path - Ruta del archivo
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabaseAdmin
      .storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return {
      success: true,
      data: {
        bucket,
        path
      }
    };
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualiza los metadatos de un archivo
 * @param {string} bucket - Nombre del bucket
 * @param {string} path - Ruta del archivo
 * @param {Object} metadata - Nuevos metadatos
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateFileMetadata = async (bucket, path, metadata) => {
  try {
    // Supabase no permite actualizar metadatos directamente,
    // así que debemos descargar, volver a subir con nuevos metadatos y eliminar el original
    
    // Descargar archivo
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from(bucket)
      .download(path);

    if (downloadError) throw downloadError;

    // Obtener metadatos actuales
    const { data: currentMetadata, error: metadataError } = await getFileMetadata(bucket, path);
    if (metadataError) throw metadataError;

    // Subir con nuevos metadatos
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(`${path}_temp`, fileData, {
        cacheControl: '31536000',
        upsert: true,
        contentType: currentMetadata.metadata['content-type'],
        metadata: {
          ...currentMetadata.metadata,
          ...metadata
        }
      });

    if (uploadError) throw uploadError;

    // Eliminar original
    const { error: deleteError } = await supabaseAdmin
      .storage
      .from(bucket)
      .remove([path]);

    if (deleteError) throw deleteError;

    // Renombrar el temporal al nombre original
    const { error: moveError } = await supabaseAdmin
      .storage
      .from(bucket)
      .move(`${path}_temp`, path);

    if (moveError) throw moveError;

    return {
      success: true,
      data: {
        bucket,
        path,
        metadata
      }
    };
  } catch (error) {
    console.error('Error al actualizar metadatos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtiene estadísticas de uso de almacenamiento
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getStorageStats = async () => {
  try {
    const buckets = [
      STORAGE_BUCKETS.IMAGES,
      STORAGE_BUCKETS.ORIGINALS,
      STORAGE_BUCKETS.ASSETS
    ];

    const stats = {};

    // Para cada bucket, obtener estadísticas
    for (const bucket of buckets) {
      // Listar todos los archivos (puede requerir paginación para buckets grandes)
      const { data, error } = await supabaseAdmin
        .storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (error) throw error;

      // Calcular estadísticas
      stats[bucket] = {
        totalFiles: data.length,
        totalSize: 0, // Supabase no proporciona tamaño directamente
        fileTypes: {}
      };

      // Contar tipos de archivo
      data.forEach(file => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        stats[bucket].fileTypes[fileExt] = (stats[bucket].fileTypes[fileExt] || 0) + 1;
      });
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Exportar todas las funciones
export default {
  uploadOriginalFile,
  listFiles,
  getFileMetadata,
  moveFile,
  deleteFile,
  updateFileMetadata,
  getStorageStats
};
