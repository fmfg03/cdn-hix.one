import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Dashboard from './pages/Dashboard'
import FileManager from './pages/FileManager'
import ImageProcessor from './pages/ImageProcessor'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

function App() {
  const { user, isLoading } = useSupabaseAuth()
  
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        Cargando...
      </Box>
    )
  }

  return (
    <Routes>
      {/* Rutas protegidas */}
      {user ? (
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<FileManager />} />
          <Route path="/process" element={<ImageProcessor />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      ) : (
        // Rutas públicas
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      )}
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
