import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Icon,
  Flex,
  Progress,
  useColorModeValue
} from '@chakra-ui/react'
import { FiFile, FiImage, FiHardDrive, FiActivity } from 'react-icons/fi'
import { useQuery } from 'react-query'
import { supabase } from '../hooks/useSupabaseAuth'

// API para obtener estadísticas
const fetchStats = async () => {
  // En producción, esto se conectaría a la API real
  // Por ahora, simulamos datos de ejemplo
  return {
    totalFiles: 187,
    totalSize: 256 * 1024 * 1024, // 256 MB
    fileTypes: {
      webp: 142,
      svg: 38,
      pdf: 7
    },
    storageUsed: 0.25, // 25% del total disponible
    recentUploads: 12,
    cachingEfficiency: 0.92 // 92% de hit rate
  }
}

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery('stats', fetchStats)
  
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Formatear tamaño en bytes a formato legible
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  if (isLoading) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        <Progress isIndeterminate />
        <Text mt={4}>Cargando estadísticas...</Text>
      </Box>
    )
  }
  
  if (error) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        <Text color="red.500">Error al cargar estadísticas: {error.message}</Text>
      </Box>
    )
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Dashboard</Heading>
      
      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Archivos Totales"
          value={stats.totalFiles}
          icon={FiFile}
          description="Archivos almacenados"
          color="blue.500"
        />
        
        <StatCard
          title="Espacio Utilizado"
          value={formatSize(stats.totalSize)}
          icon={FiHardDrive}
          description={`${Math.round(stats.storageUsed * 100)}% del total`}
          color="purple.500"
        />
        
        <StatCard
          title="Imágenes WebP"
          value={stats.fileTypes.webp}
          icon={FiImage}
          description={`${Math.round((stats.fileTypes.webp / stats.totalFiles) * 100)}% del total`}
          color="green.500"
        />
        
        <StatCard
          title="Eficiencia de Caché"
          value={`${Math.round(stats.cachingEfficiency * 100)}%`}
          icon={FiActivity}
          description="Hit rate de caché"
          color="orange.500"
        />
      </SimpleGrid>
      
      {/* Uso de almacenamiento */}
      <Card bg={bgCard} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Uso de Almacenamiento</Heading>
          <Progress 
            value={stats.storageUsed * 100} 
            colorScheme="blue" 
            height="24px" 
            borderRadius="md"
            mb={2}
          />
          <Flex justify="space-between">
            <Text>Utilizado: {formatSize(stats.totalSize)}</Text>
            <Text>Disponible: {formatSize(stats.totalSize / stats.storageUsed - stats.totalSize)}</Text>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Distribución de tipos de archivo */}
      <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Heading size="md" mb={4}>Distribución de Tipos de Archivo</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {Object.entries(stats.fileTypes).map(([type, count]) => (
              <Box 
                key={type}
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
              >
                <Stat>
                  <StatLabel textTransform="uppercase">{type}</StatLabel>
                  <StatNumber>{count}</StatNumber>
                  <StatHelpText>
                    {Math.round((count / stats.totalFiles) * 100)}% del total
                  </StatHelpText>
                </Stat>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  )
}

// Componente para tarjetas de estadísticas
const StatCard = ({ title, value, icon, description, color }) => {
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  return (
    <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <Flex align="center" mb={2}>
          <Box
            p={2}
            bg={`${color}20`}
            borderRadius="md"
            mr={3}
          >
            <Icon as={icon} boxSize={6} color={color} />
          </Box>
          <Heading size="sm">{title}</Heading>
        </Flex>
        <Stat>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          <StatHelpText>{description}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  )
}

export default Dashboard
