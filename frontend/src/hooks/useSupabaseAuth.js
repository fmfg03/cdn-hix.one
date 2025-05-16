import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
// Nota: En producción, estas variables deben estar en un archivo .env
const SUPABASE_URL = 'https://your-project-url.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

// Cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Hook personalizado para gestionar la autenticación con Supabase
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        setIsLoading(true)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Ejecutar verificación inicial
    checkSession()
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )
    
    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Función para cerrar sesión
  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    user,
    isLoading,
    error,
    login,
    logout
  }
}
