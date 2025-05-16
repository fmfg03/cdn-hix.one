import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Image,
  Badge,
  Flex,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { FiUpload, FiRefreshCw, FiCheck, FiImage } from 'react-icons/fi'
import { useQuery } from 'react-query'
import { supabase } from '../hooks/useSupabaseAuth'

// API para obtener imágenes pendientes de procesamiento
const fetchPendingImages = async () => {
  // En producción, esto se conectaría a la API real
  // Por ahora, simulamos datos de ejemplo
  return [
    {
      id: '1',
      name: 'product-new-1.jpg',
      path: 'uploads/product-new-1.jpg',
      size: 345000,
      type: 'image/jpeg',
      created_at: '2025-05-16T10:30:00Z',
      url: 'https://example.supabase.co/storage/v1/object/public/originals/uploads/product-new-1.jpg'
    },
    {
      id: '2',
      name: 'banner-promo.png',
      path: 'uploads/banner-promo.png',
      size: 520000,
      type: 'image/png',
      created_at: '2025-05-16T09:15:00Z',
      url: 'https://example.supabase.co/storage/v1/object/public/originals/uploads/banner-promo.png'
    }
  ]
}

const ImageProcessor = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [webpQuality, setWebpQuality] = useState(80)
  const [generateSizes, setGenerateSizes] = useState({
    original: true,
    lg: true,
    md: true,
    sm: true,
    thumb: true
  })
  const [processingStatus, setProcessingStatus] = useState({})
  
  const toast = useToast()
  
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Consulta para obtener imágenes pendientes
  const { 
    data: pendingImages, 
    isLoading, 
    error, 
    refetch 
  } = useQuery('pendingImages', fetchPendingImages)
  
  // Formatear tamaño en bytes a formato legible
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Procesar una imagen
  const processImage = async (imageId) => {
    try {
      setProcessingStatus(prev => ({ ...prev, [imageId]: 'processing' }))
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProcessingStatus(prev => ({ ...prev, [imageId]: 'completed' }))
      
      toast({
        title: 'Imagen procesada',
        description: 'La imagen ha sido convertida a WebP y redimensionada correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      
      setProcessingStatus(prev => ({ ...prev, [imageId]: 'error' }))
      
      toast({
        title: 'Error de procesamiento',
        description: error.message || 'No se pudo procesar la imagen',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  // Procesar todas las imágenes pendientes
  const processAllImages = async () => {
    try {
      toast({
        title: 'Procesamiento iniciado',
        description: 'Procesando todas las imágenes pendientes...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      
      // Iniciar procesamiento para cada imagen
      pendingImages.forEach(image => {
        setProcessingStatus(prev => ({ ...prev, [image.id]: 'processing' }))
      })
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Marcar todas como completadas
      const newStatus = {}
      pendingImages.forEach(image => {
        newStatus[image.id] = 'completed'
      })
      setProcessingStatus(newStatus)
      
      toast({
        title: 'Procesamiento completado',
        description: `${pendingImages.length} imágenes procesadas correctamente`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error al procesar imágenes:', error)
      
      toast({
        title: 'Error de procesamiento',
        description: error.message || 'No se pudieron procesar algunas imágenes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  if (error) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Procesamiento de Imágenes</Heading>
        <Text color="red.500">Error al cargar imágenes: {error.message}</Text>
      </Box>
    )
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Procesamiento de Imágenes</Heading>
      
      <Tabs 
        index={selectedTab} 
        onChange={setSelectedTab}
        colorScheme="brand"
        mb={6}
      >
        <TabList>
          <Tab>Imágenes Pendientes</Tab>
          <Tab>Configuración</Tab>
          <Tab>Procesamiento por Lotes</Tab>
        </TabList>
        
        <TabPanels>
          {/* Pestaña de imágenes pendientes */}
          <TabPanel p={0} pt={4}>
            <Box mb={4}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text>
                  {isLoading ? 'Cargando...' : 
                    `${pendingImages?.length || 0} ${
                      pendingImages?.length === 1 ? 
                      'imagen pendiente' : 
                      'imágenes pendientes'
                    } de procesamiento`
                  }
                </Text>
                
                {pendingImages?.length > 0 && (
                  <Button 
                    leftIcon={<FiRefreshCw />} 
                    colorScheme="brand"
                    onClick={processAllImages}
                  >
                    Procesar Todas
                  </Button>
                )}
              </Flex>
              
              {isLoading ? (
                <Text>Cargando imágenes pendientes...</Text>
              ) : pendingImages?.length === 0 ? (
                <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
                  <CardBody textAlign="center" py={10}>
                    <FiImage size={48} style={{ margin: '0 auto 16px' }} />
                    <Heading size="md" mb={2}>No hay imágenes pendientes</Heading>
                    <Text>Todas las imágenes han sido procesadas</Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {pendingImages.map((image) => (
                    <Card 
                      key={image.id} 
                      bg={bgCard} 
                      borderWidth="1px" 
                      borderColor={borderColor}
                      overflow="hidden"
                    >
                      <Flex>
                        {/* Vista previa de imagen */}
                        <Box 
                          w="120px" 
                          h="120px" 
                          bg="gray.100" 
                          overflow="hidden"
                        >
                          <Image 
                            src={image.url} 
                            alt={image.name}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                        </Box>
                        
                        <CardBody>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" noOfLines={1} title={image.name}>
                              {image.name}
                            </Text>
                            
                            <Text fontSize="sm" color="gray.500">
                              {formatSize(image.size)}
                            </Text>
                            
                            <Text fontSize="sm" color="gray.500">
                              {image.type.split('/')[1].toUpperCase()}
                            </Text>
                            
                            <Badge 
                              colorScheme={
                                processingStatus[image.id] === 'completed' ? 'green' :
                                processingStatus[image.id] === 'processing' ? 'blue' :
                                processingStatus[image.id] === 'error' ? 'red' :
                                'gray'
                              }
                              mt={1}
                            >
                              {processingStatus[image.id] === 'completed' ? 'Procesado' :
                               processingStatus[image.id] === 'processing' ? 'Procesando...' :
                               processingStatus[image.id] === 'error' ? 'Error' :
                               'Pendiente'}
                            </Badge>
                          </VStack>
                          
                          <Button 
                            mt={4}
                            size="sm"
                            colorScheme="brand"
                            leftIcon={
                              processingStatus[image.id] === 'completed' ? <FiCheck /> : 
                              <FiRefreshCw />
                            }
                            isLoading={processingStatus[image.id] === 'processing'}
                            onClick={() => processImage(image.id)}
                            isDisabled={processingStatus[image.id] === 'completed'}
                          >
                            {processingStatus[image.id] === 'completed' ? 
                              'Procesado' : 'Procesar'}
                          </Button>
                        </CardBody>
                      </Flex>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>
          
          {/* Pestaña de configuración */}
          <TabPanel p={0} pt={4}>
            <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={4}>Configuración de Procesamiento</Heading>
                
                <VStack spacing={6} align="start">
                  {/* Calidad de WebP */}
                  <FormControl>
                    <FormLabel>Calidad de WebP: {webpQuality}%</FormLabel>
                    <Slider 
                      value={webpQuality} 
                      onChange={setWebpQuality}
                      min={10}
                      max={100}
                      step={5}
                      colorScheme="brand"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Valores más altos = mejor calidad, archivos más grandes
                    </Text>
                  </FormControl>
                  
                  {/* Tamaños a generar */}
                  <FormControl>
                    <FormLabel>Tamaños a generar</FormLabel>
                    <VStack align="start" spacing={2}>
                      <Flex w="full">
                        <FormControl display="flex" alignItems="center">
                          <Switch 
                            id="original" 
                            isChecked={generateSizes.original}
                            onChange={(e) => setGenerateSizes({
                              ...generateSizes,
                              original: e.target.checked
                            })}
                            colorScheme="brand"
                          />
                          <FormLabel htmlFor="original" mb="0" ml={2}>
                            Original (tamaño completo)
                          </FormLabel>
                        </FormControl>
                      </Flex>
                      
                      <Flex w="full">
                        <FormControl display="flex" alignItems="center">
                          <Switch 
                            id="lg" 
                            isChecked={generateSizes.lg}
                            onChange={(e) => setGenerateSizes({
                              ...generateSizes,
                              lg: e.target.checked
                            })}
                            colorScheme="brand"
                          />
                          <FormLabel htmlFor="lg" mb="0" ml={2}>
                            Grande (1200px)
                          </FormLabel>
                        </FormControl>
                      </Flex>
                      
                      <Flex w="full">
                        <FormControl display="flex" alignItems="center">
                          <Switch 
                            id="md" 
                            isChecked={generateSizes.md}
                            onChange={(e) => setGenerateSizes({
                              ...generateSizes,
                              md: e.target.checked
                            })}
                            colorScheme="brand"
                          />
                          <FormLabel htmlFor="md" mb="0" ml={2}>
                            Mediano (800px)
                          </FormLabel>
                        </FormControl>
                      </Flex>
                      
                      <Flex w="full">
                        <FormControl display="flex" alignItems="center">
                          <Switch 
                            id="sm" 
                            isChecked={generateSizes.sm}
                            onChange={(e) => setGenerateSizes({
                              ...generateSizes,
                              sm: e.target.checked
                            })}
                            colorScheme="brand"
                          />
                          <FormLabel htmlFor="sm" mb="0" ml={2}>
                            Pequeño (400px)
                          </FormLabel>
                        </FormControl>
                      </Flex>
                      
                      <Flex w="full">
                        <FormControl display="flex" alignItems="center">
                          <Switch 
                            id="thumb" 
                            isChecked={generateSizes.thumb}
                            onChange={(e) => setGenerateSizes({
                              ...generateSizes,
                              thumb: e.target.checked
                            })}
                            colorScheme="brand"
                          />
                          <FormLabel htmlFor="thumb" mb="0" ml={2}>
                            Miniatura (200px)
                          </FormLabel>
                        </FormControl>
                      </Flex>
                    </VStack>
                  </FormControl>
                  
                  <Button colorScheme="brand" alignSelf="flex-end">
                    Guardar Configuración
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Pestaña de procesamiento por lotes */}
          <TabPanel p={0} pt={4}>
            <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={4}>Procesamiento por Lotes</Heading>
                
                <VStack spacing={6} align="start">
                  <Text>
                    Utiliza esta función para procesar múltiples imágenes a la vez.
                    Puedes seleccionar archivos desde tu dispositivo o especificar una carpeta
                    en el almacenamiento para procesar todas las imágenes contenidas.
                  </Text>
                  
                  <FormControl>
                    <FormLabel>Origen de las imágenes</FormLabel>
                    <Select defaultValue="upload">
                      <option value="upload">Subir archivos</option>
                      <option value="folder">Procesar carpeta existente</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Carpeta de destino</FormLabel>
                    <Select defaultValue="webp/original">
                      <option value="webp/original">WebP Original</option>
                      <option value="webp/lg">WebP Grande</option>
                      <option value="webp/md">WebP Mediano</option>
                      <option value="webp/sm">WebP Pequeño</option>
                      <option value="webp/thumb">WebP Miniatura</option>
                    </Select>
                  </FormControl>
                  
                  <Button 
                    leftIcon={<FiUpload />} 
                    colorScheme="brand"
                    alignSelf="flex-end"
                  >
                    Iniciar Procesamiento
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default ImageProcessor
