/**
 * Componente React para integración del CDN en sitios web
 * 
 * Este componente facilita la integración de imágenes del CDN
 * con soporte para imágenes responsivas y lazy loading.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente CDNImage para mostrar imágenes desde el CDN
 * 
 * @param {Object} props - Propiedades del componente
 * @returns {React.Component} Componente de imagen
 */
const CDNImage = ({
  id,
  size = 'md',
  alt = '',
  className = '',
  lazy = true,
  responsive = true,
  apiKey,
  apiUrl = 'https://your-cdn-api.com/api/public',
  fallbackSize = 'md',
  onError,
  style = {},
  ...rest
}) => {
  const [imageData, setImageData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Cargar datos de la imagen
  React.useEffect(() => {
    const fetchImageData = async () => {
      try {
        setLoading(true);
        
        // Si responsive está activado, obtener datos responsivos
        const endpoint = responsive 
          ? `${apiUrl}/images/${id}/responsive` 
          : `${apiUrl}/images/${id}/url?size=${size}`;
        
        const response = await fetch(endpoint, {
          headers: {
            'x-api-key': apiKey
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar imagen: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido');
        }
        
        setImageData(result.data);
      } catch (err) {
        console.error('Error en CDNImage:', err);
        setError(err);
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id && apiKey) {
      fetchImageData();
    }
  }, [id, size, responsive, apiUrl, apiKey, onError]);
  
  // Si está cargando, mostrar placeholder
  if (loading) {
    return (
      <div 
        className={`cdn-image-placeholder ${className}`}
        style={{
          backgroundColor: '#f0f0f0',
          ...style
        }}
        {...rest}
      />
    );
  }
  
  // Si hay error, mostrar fallback o placeholder de error
  if (error || !imageData) {
    return (
      <div 
        className={`cdn-image-error ${className}`}
        style={{
          backgroundColor: '#ffdddd',
          ...style
        }}
        {...rest}
      >
        {alt && <span className="cdn-image-alt">{alt}</span>}
      </div>
    );
  }
  
  // Renderizar imagen responsiva
  if (responsive && imageData.srcset) {
    return (
      <img
        src={imageData.defaultUrl}
        srcSet={imageData.srcset}
        sizes={imageData.sizes}
        alt={alt}
        className={`cdn-image ${className}`}
        loading={lazy ? 'lazy' : 'eager'}
        style={style}
        {...rest}
      />
    );
  }
  
  // Renderizar imagen simple
  return (
    <img
      src={imageData.url}
      alt={alt}
      className={`cdn-image ${className}`}
      loading={lazy ? 'lazy' : 'eager'}
      style={style}
      {...rest}
    />
  );
};

CDNImage.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['original', 'lg', 'md', 'sm', 'thumb']),
  alt: PropTypes.string,
  className: PropTypes.string,
  lazy: PropTypes.bool,
  responsive: PropTypes.bool,
  apiKey: PropTypes.string.isRequired,
  apiUrl: PropTypes.string,
  fallbackSize: PropTypes.oneOf(['original', 'lg', 'md', 'sm', 'thumb']),
  onError: PropTypes.func,
  style: PropTypes.object
};

export default CDNImage;
