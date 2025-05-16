import React from 'react'
import { 
  Flex, 
  Box, 
  Heading, 
  Spacer, 
  IconButton, 
  useColorMode, 
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar
} from '@chakra-ui/react'
import { FiSun, FiMoon, FiUser, FiSettings, FiHelpCircle } from 'react-icons/fi'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useSupabaseAuth()
  
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px={6}
      py={4}
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="sm"
    >
      <Heading 
        as="h1" 
        size="md" 
        display={{ base: 'block', md: 'none' }}
        color="brand.500"
      >
        CDN Admin
      </Heading>
      
      <Spacer />
      
      <Flex align="center">
        {/* Botón de cambio de tema */}
        <IconButton
          aria-label={`Cambiar a modo ${colorMode === 'light' ? 'oscuro' : 'claro'}`}
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          variant="ghost"
          mr={3}
        />
        
        {/* Menú de usuario */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={
              <Avatar 
                size="sm" 
                name={user?.email || 'Usuario'} 
                bg="brand.500"
                color="white"
              />
            }
            variant="ghost"
            aria-label="Menú de usuario"
          />
          <MenuList>
            <MenuItem icon={<FiUser />}>Perfil</MenuItem>
            <MenuItem icon={<FiSettings />}>Preferencias</MenuItem>
            <MenuItem icon={<FiHelpCircle />}>Ayuda</MenuItem>
            <MenuItem 
              onClick={logout}
              color="red.500"
            >
              Cerrar sesión
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  )
}

export default Header
