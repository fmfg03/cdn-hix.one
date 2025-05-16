# Guía Rápida de Integración del CDN

Esta guía proporciona instrucciones básicas para integrar el CDN en tus sitios web.

## Instalación de Componentes

### React

```bash
npm install cdn-project-react
```

```jsx
import { CDNImage } from 'cdn-project-react';

function MyComponent() {
  return (
    <CDNImage 
      id="imagen-123"
      size="md"
      alt="Descripción de la imagen"
      apiKey="tu-api-key"
    />
  );
}
```

### Vue

```bash
npm install cdn-project-vue
```

```vue
<template>
  <CDNImage 
    id="imagen-123"
    size="md"
    alt="Descripción de la imagen"
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

## Uso Directo de la API

### Obtener URL de Imagen

```javascript
fetch('https://tu-api.com/api/public/images/imagen-123/url?size=md', {
  headers: {
    'x-api-key': 'tu-api-key'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    const imageUrl = data.data.url;
    // Usar la URL...
  }
});
```

### Obtener Configuración Responsiva

```javascript
fetch('https://tu-api.com/api/public/images/imagen-123/responsive', {
  headers: {
    'x-api-key': 'tu-api-key'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    const { srcset, sizes, defaultUrl } = data.data;
    // Crear elemento img con estos atributos...
  }
});
```

## Tamaños Disponibles

- `original`: Tamaño completo
- `lg`: 1200px de ancho
- `md`: 800px de ancho
- `sm`: 400px de ancho
- `thumb`: 200px de ancho

## Consejos de Optimización

- Usa `thumb` para previsualizaciones
- Usa `sm` o `md` para imágenes en artículos
- Usa `lg` para imágenes destacadas
- Usa el componente con `responsive={true}` para cargar automáticamente el tamaño óptimo

Para más detalles, consulta la documentación completa.
