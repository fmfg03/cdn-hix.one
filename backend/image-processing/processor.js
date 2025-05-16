/**
 * Procesamiento de imágenes para el CDN
 * 
 * Este archivo contiene las funciones para procesar imágenes:
 * - Conversión a WebP
 * - Redimensionamiento a diferentes tamaños
 * - Optimización de imágenes
 */

import sharp from 'sharp';
import { IMAGE_SIZES, WEBP_QUALITY, STORAGE_BUCKETS, STORAGE_FOLDERS } from '../supabase/config.js';
import { moveFile, updateFileMetadata } from '../supabase/storage.js';

/**
 * Procesa una imagen para convertirla a WebP y generar diferentes tamaños
 * @param {Buffer} imageBuffer - Buffer de la imagen original
 * @param {string} originalPath - Ruta de la imagen original
 * @param {string} filename - Nombre del archivo final (sin extensión)
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} - Resultado de la operación con URLs de las imágenes generadas
 */
export const processImage = async (imageBuffer, originalPath, filename, options = {}) => {
  try {
    const { quality = WEBP_QUALITY } = options;
    const results = {};
    
    // Obtener información de la imagen
    const imageInfo = await sharp(imageBuffer).metadata();
    
    // Verificar si es SVG
    if (imageInfo.format === 'svg') {
      // Para SVG, simplemente mover al bucket de imágenes sin procesar
      const destPath = `${STORAGE_FOLDERS.IMAGES.SVG}/${filename}.svg`;
      
      await moveFile(
        STORAGE_BUCKETS.ORIGINALS,
        originalPath,
        STORAGE_BUCKETS.IMAGES,
        destPath
      );
      
      results.svg = {
        path: destPath,
        width: imageInfo.width,
        height: imageInfo.height,
        format: 'svg'
      };
      
      return {
        success: true,
        data: results
      };
    }
    
    // Para otros formatos, convertir a WebP y redimensionar
    const sizes = Object.entries(IMAGE_SIZES);
    
    for (const [sizeName, targetWidth] of sizes) {
      // Si es tamaño original, mantener dimensiones
      const width = sizeName === 'ORIGINAL' ? null : targetWidth;
      
      let processedImage;
      
      if (width) {
        // Redimensionar y convertir
        processedImage = await sharp(imageBuffer)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();
      } else {
        // Solo convertir a WebP sin redimensionar
        processedImage = await sharp(imageBuffer)
          .webp({ quality })
          .toBuffer();
      }
      
      // Obtener información de la imagen procesada
      const processedInfo = await sharp(processedImage).metadata();
      
      // Determinar la carpeta de destino según el tamaño
      const destFolder = STORAGE_FOLDERS.IMAGES.WEBP[sizeName];
      const destPath = `${destFolder}/${filename}.webp`;
      
      // Guardar resultado
      results[sizeName.toLowerCase()] = {
        path: destPath,
        width: processedInfo.width,
        height: processedInfo.height,
        format: 'webp',
        size: processedImage.length
      };
    }
    
    // Mover original a carpeta de procesados
    const processedPath = `${STORAGE_FOLDERS.ORIGINALS.PROCESSED}/${filename}.${imageInfo.format}`;
    
    await moveFile(
      STORAGE_BUCKETS.ORIGINALS,
      originalPath,
      STORAGE_BUCKETS.ORIGINALS,
      processedPath
    );
    
    // Actualizar metadatos para indicar que ha sido procesado
    await updateFileMetadata(
      STORAGE_BUCKETS.ORIGINALS,
      processedPath,
      {
        processed: true,
        processedAt: new Date().toISOString(),
        versions: Object.keys(results)
      }
    );
    
    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Convierte una imagen de formato común (JPG, PNG) a WebP
 * @param {Buffer} imageBuffer - Buffer de la imagen original
 * @param {Object} options - Opciones de conversión
 * @returns {Promise<Buffer>} - Buffer de la imagen convertida
 */
export const convertToWebP = async (imageBuffer, options = {}) => {
  try {
    const { quality = WEBP_QUALITY } = options;
    
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality })
      .toBuffer();
    
    return {
      success: true,
      data: webpBuffer
    };
  } catch (error) {
    console.error('Error al convertir a WebP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Redimensiona una imagen a un tamaño específico
 * @param {Buffer} imageBuffer - Buffer de la imagen original
 * @param {number} width - Ancho objetivo
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Buffer>} - Buffer de la imagen redimensionada
 */
export const resizeImage = async (imageBuffer, width, options = {}) => {
  try {
    const { 
      height = null, 
      fit = 'contain',
      withoutEnlargement = true
    } = options;
    
    const resizedBuffer = await sharp(imageBuffer)
      .resize({ 
        width, 
        height, 
        fit, 
        withoutEnlargement 
      })
      .toBuffer();
    
    return {
      success: true,
      data: resizedBuffer
    };
  } catch (error) {
    console.error('Error al redimensionar imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Procesa un lote de imágenes pendientes
 * @param {number} limit - Número máximo de imágenes a procesar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const processPendingImages = async (limit = 10) => {
  // Esta función sería llamada por un cron job o webhook
  // para procesar imágenes recién subidas
  
  try {
    // Implementación pendiente - requiere integración con Supabase
    return {
      success: true,
      message: 'Procesamiento por lotes pendiente de implementación'
    };
  } catch (error) {
    console.error('Error al procesar lote de imágenes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Exportar todas las funciones
export default {
  processImage,
  convertToWebP,
  resizeImage,
  processPendingImages
};
