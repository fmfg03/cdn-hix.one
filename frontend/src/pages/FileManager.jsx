import React, { useState, useCallback } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Card,
  CardBody,
  Image,
  Badge,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { FiSearch, FiFilter, FiUpload, FiMoreVertical, FiTrash2, FiEdit, FiDownload, FiCopy, FiEye } from 'react-icons/fi'
import { useQuery } from 'react-query'
import { supabase } from '../hooks/useSupabaseAuth'

// API para obtener archivos
const fetchFiles = async ({ bucket = 'images', folder = '', sortBy = 'created_at', sortOrder = 'desc' }) => {
  // En producción, esto se conectaría a la API real
  // Por ahora, simulamos datos de ejemplo
  return [
    {
      id: '1',
      name: 'product-image-1.webp',
      path: 'webp/original/product-image-1.webp',
      size: 245000,
      type: 'image/webp',
      created_at: '2025-05-10T14:30:00Z',
      metadata: {
        width: 1200,
        height: 800,
        originalFormat: 'jpg'
      },
      url: 'https://example.supabase.co/storage/v1/object/public/images/webp/original/product-image-1.webp'
    },
    {
      id: '2',
      name: 'logo.svg',
      path: 'svg/logo.svg',
      size: 12400,
      type: 'image/svg+xml',
      created_at: '2025-05-09T10:15:00Z',
      metadata: {
        width: 'vector',
        height: 'vector'
      },
      url: 'https://example.supabase.co/storage/v1/object/public/images/svg/logo.svg'
    },
    {
      id: '3',
      name: 'banner-home.webp',
      path: 'webp/lg/banner-home.webp',
      size: 350000,
      type: 'image/webp',
      created_at: '2025-05-08T09:45:00Z',
      metadata: {
        width: 1200,
        height: 600,
        originalFormat: 'png'
      },
      url: 'https://example.supabase.co/storage/v1/object/public/images/webp/lg/banner-home.webp'
    },
    {
      id: '4',
      name: 'icon-set.svg',
      path: 'svg/icon-set.svg',
      size: 8700,
      type: 'image/svg+xml',
      created_at: '2025-05-07T16:20:00Z',
      metadata: {
        width: 'vector',
        height: 'vector'
      },
      url: 'https://example.supabase.co/storage/v1/object/public/images/svg/icon-set.svg'
    }
  ]
}

const FileManager = () => {
  const [selectedBucket, setSelectedBucket] = useState('images')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedFile, setSelectedFile] = useState(null)
  
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const dropzoneBg = useColorModeValue('gray.50', 'gray.800')
  const dropzoneBorderColor = useColorModeValue('gray.300', 'gray.600')
  
  // Consulta para obtener archivos
  const { data: files, isLoading, error, refetch } = useQuery(
    ['files', selectedBucket, selectedFolder, sortBy, sortOrder],
    () => fetchFiles({ bucket: selectedBucket, folder: selectedFolder, sortBy, sortOrder })
  )
  
  // Configuración de dropzone para subida de archivos
  const onDrop = useCallback(acceptedFiles => {
    // Aquí iría la lógica de subida de archivos
    toast({
      title: 'Archivos recibidos',
      description: `${acceptedFiles.length} archivos listos para subir`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/svg+xml': []
    }
  })
  
  // Formatear tamaño en bytes a formato legible
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Abrir modal de vista previa
  const handlePreview = (file) => {
    setSelectedFile(file)
    onOpen()
  }
  
  // Filtrar archivos por búsqueda
  const filteredFiles = files?.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  if (error) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Gestor de Archivos</Heading>
        <Text color="red.500">Error al cargar archivos: {error.message}</Text>
      </Box>
    )
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Gestor de Archivos</Heading>
      
      {/* Controles */}
      <HStack spacing={4} mb={6} flexWrap="wrap">
        <Select 
          value={selectedBucket}
          onChange={(e) => setSelectedBucket(e.target.value)}
          w={{ base: 'full', md: '200px' }}
          mb={{ base: 2, md: 0 }}
        >
          <option value="images">Imágenes</option>
          <option value="originals">Originales</option>
          <option value="assets">Otros Archivos</option>
        </Select>
        
        <Select 
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          w={{ base: 'full', md: '200px' }}
          mb={{ base: 2, md: 0 }}
        >
          <option value="">Todas las carpetas</option>
          <option value="webp/original">WebP Original</option>
          <option value="webp/lg">WebP Grande</option>
          <option value="webp/md">WebP Mediano</option>
          <option value="webp/sm">WebP Pequeño</option>
          <option value="webp/thumb">WebP Miniatura</option>
          <option value="svg">SVG</option>
        </Select>
        
        <InputGroup w={{ base: 'full', md: '300px' }} mb={{ base: 2, md: 0 }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar archivos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Button 
          leftIcon={<FiUpload />} 
          colorScheme="brand"
          ml={{ base: 0, md: 'auto' }}
          w={{ base: 'full', md: 'auto' }}
        >
          Subir Archivos
        </Button>
      </HStack>
      
      {/* Área de dropzone */}
      <Box
        {...getRootProps()}
        p={6}
        mb={6}
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={isDragActive ? 'brand.500' : dropzoneBorderColor}
        borderRadius="md"
        bg={dropzoneBg}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: 'brand.500'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text>Suelta los archivos aquí...</Text>
        ) : (
          <VStack spacing={2}>
            <FiUpload size={24} />
            <Text>Arrastra archivos aquí o haz clic para seleccionar</Text>
            <Text fontSize="sm" color="gray.500">
              Formatos aceptados: JPG, PNG, WebP, SVG
            </Text>
          </VStack>
        )}
      </Box>
      
      {/* Lista de archivos */}
      {isLoading ? (
        <Text>Cargando archivos...</Text>
      ) : (
        <>
          <Text mb={4}>
            {filteredFiles.length} {filteredFiles.length === 1 ? 'archivo encontrado' : 'archivos encontrados'}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {filteredFiles.map((file) => (
              <Card 
                key={file.id} 
                bg={bgCard} 
                borderWidth="1px" 
                borderColor={borderColor}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
              >
                {/* Vista previa de imagen */}
                <Box 
                  h="160px" 
                  bg="gray.100" 
                  position="relative"
                  overflow="hidden"
                  onClick={() => handlePreview(file)}
                  cursor="pointer"
                >
                  <Image 
                    src={file.url} 
                    alt={file.name}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                  
                  {/* Badge para tipo de archivo */}
                  <Badge 
                    position="absolute" 
                    top={2} 
                    right={2}
                    colorScheme={file.type.includes('svg') ? 'purple' : 'blue'}
                  >
                    {file.type.split('/')[1].toUpperCase()}
                  </Badge>
                </Box>
                
                <CardBody>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" noOfLines={1} title={file.name}>
                      {file.name}
                    </Text>
                    
                    <Text fontSize="sm" color="gray.500">
                      {formatSize(file.size)}
                    </Text>
                    
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(file.created_at)}
                    </Text>
                    
                    {/* Dimensiones (si están disponibles) */}
                    {file.metadata?.width && file.metadata?.height && (
                      <Text fontSize="sm" color="gray.500">
                        {file.metadata.width} × {file.metadata.height}
                      </Text>
                    )}
                  </VStack>
                  
                  {/* Acciones */}
                  <Flex justify="space-between" mt={4}>
                    <Button 
                      size="sm" 
                      leftIcon={<FiEye />}
                      variant="ghost"
                      onClick={() => handlePreview(file)}
                    >
                      Ver
                    </Button>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        aria-label="Más acciones"
                      />
                      <MenuList>
                        <MenuItem icon={<FiDownload />}>Descargar</MenuItem>
                        <MenuItem icon={<FiCopy />}>Copiar URL</MenuItem>
                        <MenuItem icon={<FiEdit />}>Editar metadatos</MenuItem>
                        <MenuItem icon={<FiTrash2 />} color="red.500">Eliminar</MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
      
      {/* Modal de vista previa */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFile?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image 
              src={selectedFile?.url} 
              alt={selectedFile?.name}
              maxH="500px"
              mx="auto"
            />
            
            {/* Información del archivo */}
            {selectedFile && (
              <VStack align="start" mt={4} spacing={2}>
                <Text><strong>Ruta:</strong> {selectedFile.path}</Text>
                <Text><strong>Tamaño:</strong> {formatSize(selectedFile.size)}</Text>
                <Text><strong>Tipo:</strong> {selectedFile.type}</Text>
                <Text><strong>Fecha:</strong> {formatDate(selectedFile.created_at)}</Text>
                
                {/* Dimensiones (si están disponibles) */}
                {selectedFile.metadata?.width && selectedFile.metadata?.height && (
                  <Text>
                    <strong>Dimensiones:</strong> {selectedFile.metadata.width} × {selectedFile.metadata.height}
                  </Text>
                )}
                
                {/* Formato original (si está disponible) */}
                {selectedFile.metadata?.originalFormat && (
                  <Text>
                    <strong>Formato original:</strong> {selectedFile.metadata.originalFormat}
                  </Text>
                )}
                
                <Text><strong>URL:</strong> {selectedFile.url}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} leftIcon={<FiDownload />}>
              Descargar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default FileManager
