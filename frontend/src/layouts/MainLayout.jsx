import React from 'react'
import { Outlet } from 'react-router-dom'
import { 
  Box, 
  Flex, 
  useColorModeValue, 
  Container
} from '@chakra-ui/react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = () => {
  return (
    <Flex 
      minH="100vh" 
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box 
        flex="1"
        ml={{ base: 0, md: 60 }}
        transition="margin-left 0.3s"
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Container 
          maxW="container.xl" 
          py={6}
        >
          <Outlet />
        </Container>
      </Box>
    </Flex>
  )
}

export default MainLayout
