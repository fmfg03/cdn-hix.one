# Arquitectura del CDN con Supabase Storage

## Visión General

Este documento describe la arquitectura general del CDN basado en Supabase Storage, diseñado para servir principalmente imágenes WebP y SVG a sitios web de blogs y ecommerce. La arquitectura se centra en la simplicidad, facilidad de mantenimiento y optimización de rendimiento.

## Componentes Principales

La arquitectura del CDN se compone de los siguientes elementos clave:

1. **Almacenamiento (Supabase Storage)**
2. **Procesador de Imágenes**
3. **API REST**
4. **Panel de Administración**
5. **Sistema de Caché y Distribución**

### Diagrama de Arquitectura

```
+----------------------------------+
|                                  |
|  Panel de Administración (Web)   |
|                                  |
+----------------+----------------+
                 |
                 v
+----------------+----------------+
|                                  |
|        API REST (Supabase)       |
|                                  |
+----------------+----------------+
                 |
        +--------+--------+
        |                 |
        v                 v
+-------+-------+  +------+------+
|               |  |             |
| Almacenamiento|  | Procesador  |
| (Supabase     |  | de Imágenes |
|  Storage)     |  |             |
|               |  |             |
+---------------+  +-------------+
        |                 |
        +---------+-------+
                  |
                  v
+----------------+----------------+
|                                  |
|    Sistema de Caché/Distribución |
|                                  |
+----------------+----------------+
                 |
                 v
+----------------+----------------+
|                                  |
|       Sitios Web Cliente         |
|                                  |
+----------------------------------+
```

## Estructura de Almacenamiento en Supabase

### Organización de Buckets

Se utilizarán los siguientes buckets en Supabase Storage:

1. **`images`**: Bucket principal para almacenar todas las imágenes procesadas
   - Acceso público para lectura
   - Acceso privado para escritura/eliminación

2. **`originals`**: Bucket para almacenar las imágenes originales antes del procesamiento
   - Acceso privado (solo administradores)

3. **`assets`**: Bucket para otros tipos de archivos (PDFs, videos, etc.)
   - Acceso público para lectura
   - Acceso privado para escritura/eliminación

### Estructura de Carpetas

Dentro de cada bucket, se implementará la siguiente estructura de carpetas:

```
/images
  /webp
    /original  # Tamaño original en formato WebP
    /lg        # Versión grande (1200px)
    /md        # Versión mediana (800px)
    /sm        # Versión pequeña (400px)
    /thumb     # Miniaturas (200px)
  /svg         # Archivos SVG (sin procesamiento)

/originals
  /uploads     # Imágenes recién subidas
  /processed   # Imágenes ya procesadas
  /archive     # Imágenes archivadas

/assets
  /documents   # PDFs y otros documentos
  /videos      # Archivos de video
  /other       # Otros tipos de archivos
```

## Sistema de Procesamiento de Imágenes

### Flujo de Procesamiento

1. **Subida**: Las imágenes se suben inicialmente al bucket `originals/uploads`
2. **Detección**: Se identifica el formato de la imagen
   - Si es SVG: Se mueve directamente a `images/svg`
   - Si es PNG/JPG/JPEG: Continúa el procesamiento
3. **Conversión**: Se convierte la imagen a formato WebP
4. **Redimensionamiento**: Se generan diferentes tamaños (original, lg, md, sm, thumb)
5. **Almacenamiento**: Se guardan todas las versiones en las carpetas correspondientes
6. **Metadatos**: Se registran metadatos (dimensiones, tamaño, formato original, etc.)
7. **Finalización**: La imagen original se mueve a `originals/processed`

### Tecnologías para Procesamiento

- **Sharp/ImageMagick**: Para conversión y redimensionamiento de imágenes
- **Supabase Edge Functions**: Para procesar imágenes tras la subida
- **Metadatos de Supabase Storage**: Para almacenar información adicional

## Estructura de URLs y Sistema de Caché

### Formato de URLs

Las URLs seguirán un formato predecible y limpio:

```
https://{supabase-project}.supabase.co/storage/v1/object/public/images/webp/{size}/{filename}.webp
https://{supabase-project}.supabase.co/storage/v1/object/public/images/svg/{filename}.svg
```

Ejemplos:
- `https://example.supabase.co/storage/v1/object/public/images/webp/original/product-123.webp`
- `https://example.supabase.co/storage/v1/object/public/images/webp/sm/product-123.webp`
- `https://example.supabase.co/storage/v1/object/public/images/svg/logo.svg`

### Configuración de Caché

Se implementarán las siguientes estrategias de caché:

1. **Headers HTTP**:
   - `Cache-Control: public, max-age=31536000` (1 año para recursos inmutables)
   - `ETag` para validación
   - `Content-Type` apropiado según el formato

2. **Invalidación de Caché**:
   - Generación de URLs con fingerprinting para actualizaciones (ej: `filename.v2.webp`)
   - Posibilidad de forzar recarga desde el panel de administración

## Panel de Administración

### Funcionalidades Principales

1. **Gestión de Archivos**:
   - Subida de imágenes (individual y múltiple)
   - Organización en carpetas/categorías
   - Previsualización de imágenes
   - Eliminación y archivado

2. **Procesamiento**:
   - Conversión manual a WebP
   - Regeneración de tamaños
   - Ajuste de calidad de compresión

3. **Estadísticas**:
   - Número total de archivos
   - Espacio utilizado por bucket/carpeta
   - Tipos de archivos almacenados

4. **Configuración**:
   - Ajustes de procesamiento de imágenes
   - Gestión de acceso

### Tecnologías Frontend

- **Framework**: React con Vite
- **UI Components**: Chakra UI o similar
- **Estado**: React Query para gestión de datos
- **Autenticación**: Supabase Auth

## API REST

### Endpoints Principales

1. **Gestión de Archivos**:
   - `POST /api/upload`: Subir nuevos archivos
   - `GET /api/files`: Listar archivos
   - `DELETE /api/files/{id}`: Eliminar archivo
   - `PUT /api/files/{id}`: Actualizar metadatos

2. **Procesamiento**:
   - `POST /api/process/{id}`: Procesar imagen específica
   - `POST /api/regenerate/{id}`: Regenerar versiones

3. **Estadísticas**:
   - `GET /api/stats`: Obtener estadísticas de uso

### Implementación

- **Supabase Functions**: Para implementar la lógica de la API
- **Supabase Storage API**: Para operaciones directas de almacenamiento
- **Autenticación**: JWT para acceso seguro

## Componente Web para Integración

Se desarrollará un componente web simple para facilitar la integración con sitios cliente:

```javascript
// Ejemplo de uso del componente
import { CDNImage } from 'supabase-cdn-component';

// En el componente React/Vue
<CDNImage 
  id="product-123" 
  size="md" 
  alt="Descripción del producto" 
  lazy={true} 
/>
```

Este componente gestionará automáticamente:
- Construcción de URLs correctas
- Carga perezosa (lazy loading)
- Imágenes responsivas con srcset
- Fallbacks para navegadores sin soporte WebP

## Consideraciones de Seguridad

1. **Autenticación**: Panel de administración protegido con Supabase Auth
2. **Autorización**: Políticas de acceso en Supabase Storage
3. **Validación**: Verificación de tipos de archivo y tamaños máximos
4. **Sanitización**: Limpieza de nombres de archivo y metadatos

## Escalabilidad y Mantenimiento

La arquitectura está diseñada para ser:

1. **Serverless**: Sin necesidad de gestionar servidores
2. **Modular**: Componentes independientes que pueden evolucionar por separado
3. **Extensible**: Fácil adición de nuevas funcionalidades
4. **Migrable**: Posibilidad de migrar a Cloudflare R2 u otras soluciones en el futuro

## Próximos Pasos

1. Configuración inicial de Supabase Storage
2. Implementación del sistema de procesamiento de imágenes
3. Desarrollo del panel de administración
4. Creación de la API REST
5. Implementación del componente web para integración
6. Pruebas y optimización
7. Documentación completa
