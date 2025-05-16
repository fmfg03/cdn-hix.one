/**
 * API REST para el CDN
 * 
 * Este archivo implementa los endpoints de la API REST para:
 * - Gestión de archivos
 * - Procesamiento de imágenes
 * - Estadísticas de uso
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { supabaseClient } from '../supabase/config.js';
import storageService from '../supabase/storage.js';
import imageProcessor from '../image-processing/processor.js';

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cors());

// Configuración de Multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Se requiere autenticación' 
    });
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Usuario no autenticado');
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido o expirado' 
    });
  }
};

// Rutas de la API

// Subir archivo
app.post('/api/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún archivo' 
      });
    }
    
    // Crear objeto File a partir del buffer
    const file = {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    };
    
    // Extraer metadatos de la solicitud
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    // Subir archivo original
    const uploadResult = await storageService.uploadOriginalFile(file, {
      ...metadata,
      uploadedBy: req.user.id
    });
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }
    
    // Si se solicita procesamiento inmediato
    if (req.body.processImmediately === 'true') {
      // Implementar lógica de procesamiento inmediato
      // (pendiente)
    }
    
    res.status(200).json(uploadResult);
  } catch (error) {
    console.error('Error en subida de archivo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Listar archivos
app.get('/api/files', authenticateUser, async (req, res) => {
  try {
    const { bucket, folder } = req.query;
    
    if (!bucket || !folder) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requieren los parámetros bucket y folder' 
      });
    }
    
    const options = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0,
      sortBy: req.query.sortBy || 'name',
      sortOrder: req.query.sortOrder || 'asc'
    };
    
    const result = await storageService.listFiles(bucket, folder, options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Obtener metadatos de archivo
app.get('/api/files/:bucket/:path(*)', authenticateUser, async (req, res) => {
  try {
    const { bucket, path } = req.params;
    
    const result = await storageService.getFileMetadata(bucket, path);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener metadatos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Eliminar archivo
app.delete('/api/files/:bucket/:path(*)', authenticateUser, async (req, res) => {
  try {
    const { bucket, path } = req.params;
    
    const result = await storageService.deleteFile(bucket, path);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Actualizar metadatos
app.put('/api/files/:bucket/:path(*)/metadata', authenticateUser, async (req, res) => {
  try {
    const { bucket, path } = req.params;
    const { metadata } = req.body;
    
    if (!metadata) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere el parámetro metadata' 
      });
    }
    
    const result = await storageService.updateFileMetadata(bucket, path, metadata);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al actualizar metadatos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Procesar imagen
app.post('/api/process/:bucket/:path(*)', authenticateUser, async (req, res) => {
  try {
    const { bucket, path } = req.params;
    const options = req.body.options || {};
    
    // Descargar archivo
    const { data, error } = await supabaseClient
      .storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    
    // Generar nombre de archivo único para las versiones procesadas
    const pathParts = path.split('/');
    const filename = pathParts.pop().split('.')[0];
    
    // Procesar imagen
    const result = await imageProcessor.processImage(data, path, filename, options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Obtener estadísticas
app.get('/api/stats', authenticateUser, async (req, res) => {
  try {
    const result = await storageService.getStorageStats();
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error en la API:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor' 
  });
});

// Exportar la aplicación Express
export default app;

// Si este archivo se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API REST del CDN ejecutándose en el puerto ${PORT}`);
  });
}
