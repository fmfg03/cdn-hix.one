/**
 * Componente Vue para integración del CDN en sitios web
 * 
 * Este componente facilita la integración de imágenes del CDN
 * con soporte para imágenes responsivas y lazy loading.
 */

<template>
  <div v-if="loading" 
       :class="`cdn-image-placeholder ${className}`"
       :style="placeholderStyle">
  </div>
  
  <div v-else-if="error || !imageData" 
       :class="`cdn-image-error ${className}`"
       :style="errorStyle">
    <span v-if="alt" class="cdn-image-alt">{{ alt }}</span>
  </div>
  
  <img v-else-if="responsive && imageData.srcset"
       :src="imageData.defaultUrl"
       :srcset="imageData.srcset"
       :sizes="imageData.sizes"
       :alt="alt"
       :class="`cdn-image ${className}`"
       :loading="lazy ? 'lazy' : 'eager'"
       v-bind="$attrs" />
       
  <img v-else
       :src="imageData.url"
       :alt="alt"
       :class="`cdn-image ${className}`"
       :loading="lazy ? 'lazy' : 'eager'"
       v-bind="$attrs" />
</template>

<script>
export default {
  name: 'CDNImage',
  
  props: {
    id: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['original', 'lg', 'md', 'sm', 'thumb'].includes(value)
    },
    alt: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    lazy: {
      type: Boolean,
      default: true
    },
    responsive: {
      type: Boolean,
      default: true
    },
    apiKey: {
      type: String,
      required: true
    },
    apiUrl: {
      type: String,
      default: 'https://your-cdn-api.com/api/public'
    },
    fallbackSize: {
      type: String,
      default: 'md',
      validator: (value) => ['original', 'lg', 'md', 'sm', 'thumb'].includes(value)
    }
  },
  
  data() {
    return {
      loading: true,
      error: null,
      imageData: null
    }
  },
  
  computed: {
    placeholderStyle() {
      return {
        backgroundColor: '#f0f0f0',
        ...this.$attrs.style
      }
    },
    
    errorStyle() {
      return {
        backgroundColor: '#ffdddd',
        ...this.$attrs.style
      }
    }
  },
  
  watch: {
    id() {
      this.fetchImageData()
    },
    
    size() {
      if (!this.responsive) {
        this.fetchImageData()
      }
    },
    
    responsive() {
      this.fetchImageData()
    }
  },
  
  mounted() {
    if (this.id && this.apiKey) {
      this.fetchImageData()
    }
  },
  
  methods: {
    async fetchImageData() {
      try {
        this.loading = true
        
        // Si responsive está activado, obtener datos responsivos
        const endpoint = this.responsive 
          ? `${this.apiUrl}/images/${this.id}/responsive` 
          : `${this.apiUrl}/images/${this.id}/url?size=${this.size}`
        
        const response = await fetch(endpoint, {
          headers: {
            'x-api-key': this.apiKey
          }
        })
        
        if (!response.ok) {
          throw new Error(`Error al cargar imagen: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido')
        }
        
        this.imageData = result.data
        this.error = null
      } catch (err) {
        console.error('Error en CDNImage:', err)
        this.error = err
        this.$emit('error', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.cdn-image-placeholder,
.cdn-image-error {
  display: inline-block;
  min-width: 50px;
  min-height: 50px;
}

.cdn-image-alt {
  display: block;
  padding: 8px;
  text-align: center;
  color: #666;
}
</style>
