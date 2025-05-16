/**
 * API REST pública para el CDN
 * 
 * Este archivo implementa los endpoints públicos para:
 * - Obtener información de imágenes
 * - Obtener URLs para diferentes tamaños
 * - Verificar estado del servicio
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { supabaseClient } from '../supabase/config.js';
import { STORAGE_BUCKETS, STORAGE_FOLDERS } from '../supabase/config.js';

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cors());

// Configuración de rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    error: 'Demasiadas solicitudes, por favor intenta más tarde'
  }
});

// Aplicar rate limiting a todas las rutas
app.use(apiLimiter);

// Middleware para validar API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Se requiere API key'
    });
  }
  
  // En producción, verificar la API key contra una base de datos
  // Por ahora, usamos una clave de ejemplo
  if (apiKey !== 'test-api-key-123') {
    return res.status(403).json({
      success: false,
      error: 'API key inválida'
    });
  }
  
  next();
};

// Rutas públicas

// Verificar estado del servicio (sin autenticación)
app.get('/api/public/status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'online',
      version: '1.0.0'
    }
  });
});

// Obtener información de una imagen por ID o path
app.get('/api/public/images/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar imagen por ID o path
    // En producción, esto se conectaría a la base de datos real
    
    // Ejemplo de respuesta
    res.status(200).json({
      success: true,
      data: {
        id,
        name: 'example-image.webp',
        formats: {
          original: 'https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image.webp',
          lg: 'https://example.supabase.co/storage/v1/object/public/images/webp/lg/example-image.webp',
          md: 'https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp',
          sm: 'https://example.supabase.co/storage/v1/object/public/images/webp/sm/example-image.webp',
          thumb: 'https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image.webp'
        },
        metadata: {
          width: 1200,
          height: 800,
          format: 'webp',
          originalFormat: 'jpg'
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Obtener URL para un tamaño específico
app.get('/api/public/images/:id/url', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { size = 'original' } = req.query;
    
    // Validar tamaño solicitado
    const validSizes = ['original', 'lg', 'md', 'sm', 'thumb'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        success: false,
        error: `Tamaño inválido. Valores permitidos: ${validSizes.join(', ')}`
      });
    }
    
    // En producción, buscar la URL real en la base de datos
    
    // Ejemplo de respuesta
    res.status(200).json({
      success: true,
      data: {
        url: `https://example.supabase.co/storage/v1/object/public/images/webp/${size}/example-image.webp`
      }
    });
  } catch (error) {
    console.error('Error al obtener URL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Obtener URLs responsivas para una imagen
app.get('/api/public/images/:id/responsive', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    // En producción, buscar las URLs reales en la base de datos
    
    // Ejemplo de respuesta
    res.status(200).json({
      success: true,
      data: {
        srcset: 'https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image.webp 200w, https://example.supabase.co/storage/v1/object/public/images/webp/sm/example-image.webp 400w, https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp 800w, https://example.supabase.co/storage/v1/object/public/images/webp/lg/example-image.webp 1200w',
        sizes: '(max-width: 768px) 100vw, 50vw',
        defaultUrl: 'https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp'
      }
    });
  } catch (error) {
    console.error('Error al obtener URLs responsivas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Listar imágenes públicas (con paginación)
app.get('/api/public/images', validateApiKey, async (req, res) => {
  try {
    const { limit = 20, page = 1, folder = '' } = req.query;
    
    // En producción, buscar imágenes en la base de datos con paginación
    
    // Ejemplo de respuesta
    res.status(200).json({
      success: true,
      data: {
        items: [
          {
            id: 'img1',
            name: 'example-image-1.webp',
            url: 'https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image-1.webp',
            thumbnail: 'https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image-1.webp'
          },
          {
            id: 'img2',
            name: 'example-image-2.webp',
            url: 'https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image-2.webp',
            thumbnail: 'https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image-2.webp'
          }
        ],
        pagination: {
          total: 42,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(42 / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error al listar imágenes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error en la API pública:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// Exportar la aplicación Express
export default app;

// Si este archivo se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.PUBLIC_API_PORT || 3002;
  app.listen(PORT, () => {
    console.log(`API REST pública del CDN ejecutándose en el puerto ${PORT}`);
  });
}
