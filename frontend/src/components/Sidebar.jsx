import React from 'react'
import { 
  Box, 
  Flex, 
  Text, 
  Icon, 
  Link, 
  useColorModeValue 
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiFolder, 
  FiImage, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'

// Definición de los elementos del menú
const MenuItems = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Archivos', icon: FiFolder, path: '/files' },
  { name: 'Procesamiento', icon: FiImage, path: '/process' },
  { name: 'Configuración', icon: FiSettings, path: '/settings' },
]

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useSupabaseAuth()
  
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      display={{ base: 'none', md: 'block' }}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          CDN Admin
        </Text>
      </Flex>
      
      {/* Menú de navegación */}
      <Box mt={4}>
        {MenuItems.map((item) => (
          <NavItem 
            key={item.name} 
            icon={item.icon} 
            path={item.path}
            isActive={location.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}
        
        {/* Botón de cerrar sesión */}
        <Box mt={8}>
          <NavItem 
            icon={FiLogOut} 
            onClick={logout}
            color="red.500"
          >
            Cerrar Sesión
          </NavItem>
        </Box>
      </Box>
    </Box>
  )
}

// Componente para cada elemento de navegación
const NavItem = ({ icon, children, path, isActive, onClick, ...rest }) => {
  const activeColor = useColorModeValue('brand.500', 'brand.300')
  const inactiveColor = useColorModeValue('gray.600', 'gray.300')
  const activeBg = useColorModeValue('brand.50', 'gray.700')
  
  const content = (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 'bold' : 'normal'}
      _hover={{
        bg: activeBg,
        color: activeColor,
      }}
      onClick={onClick}
      {...rest}
    >
      {icon && (
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
      )}
      {children}
    </Flex>
  )
  
  return onClick ? (
    content
  ) : (
    <Link 
      as={RouterLink} 
      to={path} 
      style={{ textDecoration: 'none' }}
    >
      {content}
    </Link>
  )
}

export default Sidebar
