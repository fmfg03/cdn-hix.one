import React from 'react'
import { Outlet } from 'react-router-dom'
import { 
  Box, 
  Flex, 
  useColorModeValue, 
  Container
} from '@chakra-ui/react'

const AuthLayout = () => {
  return (
    <Flex 
      minH="100vh" 
      align="center" 
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW="md" py={12} px={6}>
        <Outlet />
      </Container>
    </Flex>
  )
}

export default AuthLayout
