import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { FiSave, FiRefreshCw } from 'react-icons/fi'

const Settings = () => {
  const [settings, setSettings] = useState({
    storage: {
      defaultBucket: 'images',
      maxFileSize: 10,
      autoProcessImages: true
    },
    processing: {
      webpQuality: 80,
      generateSizes: {
        original: true,
        lg: true,
        md: true,
        sm: true,
        thumb: true
      },
      preserveOriginals: true
    },
    cache: {
      maxAge: 31536000, // 1 año en segundos
      enableETag: true,
      enableFingerprinting: true
    }
  })
  
  const toast = useToast()
  
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Manejar cambios en configuración de almacenamiento
  const handleStorageChange = (field, value) => {
    setSettings({
      ...settings,
      storage: {
        ...settings.storage,
        [field]: value
      }
    })
  }
  
  // Manejar cambios en configuración de procesamiento
  const handleProcessingChange = (field, value) => {
    setSettings({
      ...settings,
      processing: {
        ...settings.processing,
        [field]: value
      }
    })
  }
  
  // Manejar cambios en tamaños a generar
  const handleSizeChange = (size, value) => {
    setSettings({
      ...settings,
      processing: {
        ...settings.processing,
        generateSizes: {
          ...settings.processing.generateSizes,
          [size]: value
        }
      }
    })
  }
  
  // Manejar cambios en configuración de caché
  const handleCacheChange = (field, value) => {
    setSettings({
      ...settings,
      cache: {
        ...settings.cache,
        [field]: value
      }
    })
  }
  
  // Guardar configuración
  const saveSettings = () => {
    // Aquí iría la lógica para guardar en la API
    toast({
      title: 'Configuración guardada',
      description: 'Los cambios han sido aplicados correctamente',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  }
  
  // Regenerar caché
  const regenerateCache = () => {
    // Aquí iría la lógica para regenerar caché
    toast({
      title: 'Regeneración iniciada',
      description: 'Se ha iniciado la regeneración de caché para todos los archivos',
      status: 'info',
      duration: 5000,
      isClosable: true,
    })
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Configuración</Heading>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Configuración de almacenamiento */}
        <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Almacenamiento</Heading>
            
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Bucket predeterminado</FormLabel>
                <Select 
                  value={settings.storage.defaultBucket}
                  onChange={(e) => handleStorageChange('defaultBucket', e.target.value)}
                >
                  <option value="images">Imágenes</option>
                  <option value="originals">Originales</option>
                  <option value="assets">Otros Archivos</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Tamaño máximo de archivo (MB)</FormLabel>
                <Input 
                  type="number" 
                  value={settings.storage.maxFileSize}
                  onChange={(e) => handleStorageChange('maxFileSize', parseInt(e.target.value))}
                  min={1}
                  max={100}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Switch 
                  id="auto-process" 
                  isChecked={settings.storage.autoProcessImages}
                  onChange={(e) => handleStorageChange('autoProcessImages', e.target.checked)}
                  colorScheme="brand"
                />
                <FormLabel htmlFor="auto-process" mb="0" ml={2}>
                  Procesar imágenes automáticamente al subir
                </FormLabel>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Configuración de procesamiento */}
        <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Procesamiento de Imágenes</Heading>
            
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Calidad de WebP (%)</FormLabel>
                <Input 
                  type="number" 
                  value={settings.processing.webpQuality}
                  onChange={(e) => handleProcessingChange('webpQuality', parseInt(e.target.value))}
                  min={10}
                  max={100}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Valores más altos = mejor calidad, archivos más grandes
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Tamaños a generar</FormLabel>
                <VStack align="start" spacing={2}>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="size-original" 
                      isChecked={settings.processing.generateSizes.original}
                      onChange={(e) => handleSizeChange('original', e.target.checked)}
                      colorScheme="brand"
                    />
                    <FormLabel htmlFor="size-original" mb="0" ml={2}>
                      Original (tamaño completo)
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="size-lg" 
                      isChecked={settings.processing.generateSizes.lg}
                      onChange={(e) => handleSizeChange('lg', e.target.checked)}
                      colorScheme="brand"
                    />
                    <FormLabel htmlFor="size-lg" mb="0" ml={2}>
                      Grande (1200px)
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="size-md" 
                      isChecked={settings.processing.generateSizes.md}
                      onChange={(e) => handleSizeChange('md', e.target.checked)}
                      colorScheme="brand"
                    />
                    <FormLabel htmlFor="size-md" mb="0" ml={2}>
                      Mediano (800px)
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="size-sm" 
                      isChecked={settings.processing.generateSizes.sm}
                      onChange={(e) => handleSizeChange('sm', e.target.checked)}
                      colorScheme="brand"
                    />
                    <FormLabel htmlFor="size-sm" mb="0" ml={2}>
                      Pequeño (400px)
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="size-thumb" 
                      isChecked={settings.processing.generateSizes.thumb}
                      onChange={(e) => handleSizeChange('thumb', e.target.checked)}
                      colorScheme="brand"
                    />
                    <FormLabel htmlFor="size-thumb" mb="0" ml={2}>
                      Miniatura (200px)
                    </FormLabel>
                  </FormControl>
                </VStack>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Switch 
                  id="preserve-originals" 
                  isChecked={settings.processing.preserveOriginals}
                  onChange={(e) => handleProcessingChange('preserveOriginals', e.target.checked)}
                  colorScheme="brand"
                />
                <FormLabel htmlFor="preserve-originals" mb="0" ml={2}>
                  Preservar imágenes originales
                </FormLabel>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Configuración de caché */}
        <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Caché y Distribución</Heading>
            
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Tiempo máximo de caché (segundos)</FormLabel>
                <Select 
                  value={settings.cache.maxAge}
                  onChange={(e) => handleCacheChange('maxAge', parseInt(e.target.value))}
                >
                  <option value={3600}>1 hora (3600)</option>
                  <option value={86400}>1 día (86400)</option>
                  <option value={604800}>1 semana (604800)</option>
                  <option value={2592000}>1 mes (2592000)</option>
                  <option value={31536000}>1 año (31536000)</option>
                </Select>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Switch 
                  id="enable-etag" 
                  isChecked={settings.cache.enableETag}
                  onChange={(e) => handleCacheChange('enableETag', e.target.checked)}
                  colorScheme="brand"
                />
                <FormLabel htmlFor="enable-etag" mb="0" ml={2}>
                  Habilitar ETag para validación
                </FormLabel>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Switch 
                  id="enable-fingerprinting" 
                  isChecked={settings.cache.enableFingerprinting}
                  onChange={(e) => handleCacheChange('enableFingerprinting', e.target.checked)}
                  colorScheme="brand"
                />
                <FormLabel htmlFor="enable-fingerprinting" mb="0" ml={2}>
                  Habilitar fingerprinting para invalidación de caché
                </FormLabel>
              </FormControl>
              
              <Button 
                leftIcon={<FiRefreshCw />} 
                colorScheme="orange"
                variant="outline"
                onClick={regenerateCache}
                mt={2}
              >
                Regenerar Caché
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Divider my={8} />
      
      <Flex justify="flex-end">
        <Button 
          leftIcon={<FiSave />} 
          colorScheme="brand"
          size="lg"
          onClick={saveSettings}
        >
          Guardar Configuración
        </Button>
      </Flex>
    </Box>
  )
}

export default Settings
