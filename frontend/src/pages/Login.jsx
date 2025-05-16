import React from 'react'
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Card,
  CardBody,
  Divider,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { FiLogIn } from 'react-icons/fi'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'

const Login = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  
  const { login } = useSupabaseAuth()
  const toast = useToast()
  
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa tu email y contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      const result = await login(email, password)
      
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar sesión')
      }
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido al panel de administración del CDN',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      
      toast({
        title: 'Error de inicio de sesión',
        description: error.message || 'No se pudo iniciar sesión',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card bg={bgCard} borderWidth="1px" borderColor={borderColor} boxShadow="lg">
      <CardBody>
        <VStack spacing={6} align="center" mb={4}>
          <Heading size="xl" color="brand.500">CDN Admin</Heading>
          <Text>Inicia sesión para acceder al panel de administración</Text>
        </VStack>
        
        <Divider mb={6} />
        
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormControl>
            
            <Button 
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              mt={4}
              leftIcon={<FiLogIn />}
              isLoading={isLoading}
              loadingText="Iniciando sesión..."
            >
              Iniciar Sesión
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}

export default Login
