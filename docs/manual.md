# Documentación del CDN con Supabase Storage

## Introducción

Este documento proporciona una guía completa para la instalación, configuración y uso del CDN basado en Supabase Storage. El sistema permite almacenar, procesar y distribuir imágenes y otros archivos de manera eficiente, con optimización automática y una interfaz de administración intuitiva.

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Panel de Administración](#panel-de-administración)
5. [API REST Pública](#api-rest-pública)
6. [Componentes de Integración](#componentes-de-integración)
7. [Seguridad](#seguridad)
8. [Optimización y Rendimiento](#optimización-y-rendimiento)
9. [Solución de Problemas](#solución-de-problemas)
10. [Comparativa con Cloudflare R2](#comparativa-con-cloudflare-r2)

## Arquitectura General

El CDN está construido sobre Supabase Storage y consta de los siguientes componentes principales:

- **Backend**: Gestiona el almacenamiento, procesamiento y distribución de archivos
- **Panel de Administración**: Interfaz web para gestionar archivos y configuración
- **API REST Pública**: Endpoints para integración programática
- **Componentes Web**: Facilitan la integración en sitios web cliente

La arquitectura está diseñada para ser serverless, escalable y de fácil mantenimiento, aprovechando al máximo las capacidades de Supabase Storage.

## Requisitos del Sistema

### Requisitos Mínimos

- Suscripción activa a Supabase
- Node.js 16.x o superior
- NPM 7.x o superior
- Navegador web moderno para el panel de administración

### Dependencias Principales

- Supabase JS Client
- Express.js (para API)
- Sharp (para procesamiento de imágenes)
- React/Vue (para componentes de integración)

## Instalación y Configuración

### 1. Configuración de Supabase

1. Inicia sesión en tu cuenta de Supabase
2. Crea un nuevo proyecto (o utiliza uno existente)
3. Configura los siguientes buckets de almacenamiento:
   - `images`: Para imágenes procesadas
   - `originals`: Para imágenes originales
   - `assets`: Para otros tipos de archivos

4. Configura las políticas de acceso:
   ```sql
   -- Política para acceso público a imágenes procesadas
   CREATE POLICY "Imágenes públicas" ON storage.objects
     FOR SELECT
     USING (bucket_id = 'images');
   
   -- Política para acceso privado a originales
   CREATE POLICY "Originales privados" ON storage.objects
     FOR ALL
     USING (bucket_id = 'originals' AND auth.role() = 'authenticated');
   ```

### 2. Instalación del Backend

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cdn-project.git
   cd cdn-project/backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```
   # Crea un archivo .env con la siguiente información
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-clave-anon
   SUPABASE_SERVICE_KEY=tu-clave-service
   API_PORT=3000
   PUBLIC_API_PORT=3002
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

### 3. Instalación del Frontend

1. Navega a la carpeta del frontend:
   ```bash
   cd ../frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```
   # Crea un archivo .env con la siguiente información
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   VITE_API_URL=http://localhost:3000/api
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Para producción, construye el proyecto:
   ```bash
   npm run build
   ```

## Panel de Administración

El panel de administración proporciona una interfaz intuitiva para gestionar todos los aspectos del CDN.

### Acceso

Accede al panel en `http://localhost:3001` (desarrollo) o en la URL donde hayas desplegado el frontend.

### Autenticación

El panel utiliza la autenticación de Supabase. Para crear usuarios:

1. Ve a la sección Authentication de tu proyecto en Supabase
2. Añade usuarios con email y contraseña
3. Estos usuarios podrán acceder al panel de administración

### Funcionalidades Principales

#### Dashboard

Muestra estadísticas generales:
- Número total de archivos
- Espacio utilizado
- Distribución por tipos de archivo
- Eficiencia de caché

#### Gestor de Archivos

Permite:
- Subir archivos (arrastrar y soltar o selección)
- Organizar en carpetas
- Previsualizar imágenes
- Obtener URLs para diferentes tamaños
- Eliminar o archivar archivos

#### Procesamiento de Imágenes

Ofrece:
- Conversión automática a WebP
- Generación de diferentes tamaños
- Configuración de calidad de compresión
- Procesamiento por lotes

#### Configuración

Permite ajustar:
- Parámetros de almacenamiento
- Opciones de procesamiento
- Configuración de caché
- Regeneración de URLs

## API REST Pública

La API REST pública permite integrar el CDN con aplicaciones y sitios web de forma programática.

### Autenticación

La API utiliza claves de API para autenticación:

1. Genera una clave de API desde el panel de administración
2. Incluye la clave en el encabezado `x-api-key` en todas las solicitudes

### Endpoints Principales

#### Estado del Servicio

```
GET /api/public/status
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "status": "online",
    "version": "1.0.0"
  }
}
```

#### Obtener Información de Imagen

```
GET /api/public/images/:id
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "id": "example-id",
    "name": "example-image.webp",
    "formats": {
      "original": "https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image.webp",
      "lg": "https://example.supabase.co/storage/v1/object/public/images/webp/lg/example-image.webp",
      "md": "https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp",
      "sm": "https://example.supabase.co/storage/v1/object/public/images/webp/sm/example-image.webp",
      "thumb": "https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image.webp"
    },
    "metadata": {
      "width": 1200,
      "height": 800,
      "format": "webp",
      "originalFormat": "jpg"
    }
  }
}
```

#### Obtener URL para Tamaño Específico

```
GET /api/public/images/:id/url?size=md
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "url": "https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp"
  }
}
```

#### Obtener URLs Responsivas

```
GET /api/public/images/:id/responsive
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "srcset": "https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image.webp 200w, https://example.supabase.co/storage/v1/object/public/images/webp/sm/example-image.webp 400w, https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp 800w, https://example.supabase.co/storage/v1/object/public/images/webp/lg/example-image.webp 1200w",
    "sizes": "(max-width: 768px) 100vw, 50vw",
    "defaultUrl": "https://example.supabase.co/storage/v1/object/public/images/webp/md/example-image.webp"
  }
}
```

#### Listar Imágenes

```
GET /api/public/images?limit=20&page=1&folder=
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "img1",
        "name": "example-image-1.webp",
        "url": "https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image-1.webp",
        "thumbnail": "https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image-1.webp"
      },
      {
        "id": "img2",
        "name": "example-image-2.webp",
        "url": "https://example.supabase.co/storage/v1/object/public/images/webp/original/example-image-2.webp",
        "thumbnail": "https://example.supabase.co/storage/v1/object/public/images/webp/thumb/example-image-2.webp"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### Manejo de Errores

La API devuelve errores con el siguiente formato:

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

Códigos de estado HTTP:
- `200`: Éxito
- `400`: Error de solicitud (parámetros incorrectos)
- `401`: No autenticado (falta API key)
- `403`: No autorizado (API key inválida)
- `404`: Recurso no encontrado
- `429`: Demasiadas solicitudes (rate limiting)
- `500`: Error interno del servidor

## Componentes de Integración

### Componente React

```jsx
import { CDNImage } from 'cdn-project';

function MyComponent() {
  return (
    <CDNImage 
      id="example-id"
      size="md"
      alt="Descripción de la imagen"
      lazy={true}
      responsive={true}
      apiKey="tu-api-key"
    />
  );
}
```

### Componente Vue

```vue
<template>
  <CDNImage 
    id="example-id"
    size="md"
    alt="Descripción de la imagen"
    :lazy="true"
    :responsive="true"
    api-key="tu-api-key"
  />
</template>

<script>
import { CDNImage } from 'cdn-project-vue';

export default {
  components: {
    CDNImage
  }
}
</script>
```

### Uso con HTML/JavaScript Vanilla

```html
<div id="cdn-image-container"></div>

<script>
  const container = document.getElementById('cdn-image-container');
  
  fetch('https://tu-api.com/api/public/images/example-id/responsive', {
    headers: {
      'x-api-key': 'tu-api-key'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const img = document.createElement('img');
      img.src = data.data.defaultUrl;
      img.srcset = data.data.srcset;
      img.sizes = data.data.sizes;
      img.alt = 'Descripción de la imagen';
      img.loading = 'lazy';
      
      container.appendChild(img);
    }
  })
  .catch(error => console.error('Error:', error));
</script>
```

## Seguridad

### Protección de Recursos

- **Imágenes públicas**: Accesibles sin autenticación
- **Imágenes originales**: Protegidas, solo accesibles desde el panel de administración
- **Panel de administración**: Protegido con autenticación de Supabase

### API Keys

- Generadas desde el panel de administración
- Pueden tener permisos limitados
- Se recomienda rotar periódicamente
- Nunca expongas las API keys en código cliente (usar backend como proxy)

### Rate Limiting

La API pública implementa rate limiting para prevenir abusos:
- 100 solicitudes por IP en ventanas de 15 minutos
- Configurable desde el panel de administración

### Validación y Sanitización

- Validación de tipos de archivo permitidos
- Límites de tamaño configurables
- Sanitización de nombres de archivo
- Protección contra inyección en parámetros

## Optimización y Rendimiento

### Optimización de Imágenes

- Conversión automática a WebP para mejor compresión
- Generación de múltiples tamaños para uso responsivo
- Preservación de SVG para gráficos vectoriales

### Estrategias de Caché

- Headers `Cache-Control` configurados para caché de larga duración
- Soporte para `ETag` para validación eficiente
- Fingerprinting para invalidación de caché cuando sea necesario

### Rendimiento

- Distribución a través de la red de Supabase
- Lazy loading integrado en componentes
- Imágenes responsivas para optimizar ancho de banda

## Solución de Problemas

### Problemas Comunes

#### Las imágenes no se procesan automáticamente

Verifica:
- La configuración de procesamiento automático está activada
- Los permisos de los buckets son correctos
- Los logs del servidor para errores específicos

#### Error de autenticación en el panel

Verifica:
- Las credenciales de Supabase son correctas
- El usuario tiene permisos adecuados
- La URL de Supabase es correcta en la configuración

#### La API devuelve errores 401/403

Verifica:
- La API key es válida y está incluida en el encabezado `x-api-key`
- No has excedido el límite de rate limiting
- Los permisos de la API key son adecuados

### Logs y Depuración

- Los logs del backend se encuentran en `logs/backend.log`
- Habilita el modo de depuración en el archivo `.env`:
  ```
  DEBUG=true
  ```

## Comparativa con Cloudflare R2

| Característica | Supabase Storage | Cloudflare R2 |
|----------------|------------------|---------------|
| Tier gratuito | Limitado | 10GB/mes gratuitos |
| Red global | Menor cobertura | Extensa red global |
| Procesamiento de imágenes | Requiere implementación adicional | Servicio Images disponible |
| Integración con panel | Nativa | Requiere desarrollo adicional |
| Compatibilidad API | Propia | Compatible con S3 |
| Curva de aprendizaje | Menor | Mayor (Workers) |

### Cuándo migrar a Cloudflare R2

Considera migrar a Cloudflare R2 si:
- El volumen de datos crece significativamente
- Necesitas una distribución global más amplia
- El costo se vuelve un factor crítico

La arquitectura del CDN está diseñada para facilitar la migración si es necesario en el futuro.

## Conclusión

Este CDN basado en Supabase Storage proporciona una solución completa para almacenamiento, procesamiento y distribución de imágenes y otros archivos. Con su panel de administración intuitivo, API REST pública y componentes de integración, facilita la implementación en diversos proyectos web.

Para soporte adicional o contribuciones, visita el repositorio del proyecto en GitHub.
