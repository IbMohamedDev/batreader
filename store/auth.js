import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE_URL = 'http://localhost:3001'

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`)
  }

  return data
}

export const useAuthStore = create(
  persist(
    (set, get) => ({

      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

   
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

    
      signin: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const data = await apiRequest('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          })

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true, data }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
          })
          return { success: false, error: error.message }
        }
      },

      signup: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const data = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          })

          if (data.requires_email_verification) {
            set({
              isLoading: false,
              error: null,
            })
            return { 
              success: true, 
              data, 
              requiresVerification: true 
            }
          }

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true, data }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

      getProfile: async () => {
        const { token } = get()
        if (!token) return { success: false, error: 'No token available' }

        set({ isLoading: true })
        
        try {
          const data = await apiRequest('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          set({
            user: { ...get().user, profile: data.profile },
            isLoading: false,
          })

          return { success: true, data }
        } catch (error) {
       
          if (error.message.includes('401')) {
            get().logout()
          } else {
            set({ error: error.message, isLoading: false })
          }
          return { success: false, error: error.message }
        }
      },

     
      updateProfile: async (profileData) => {
        const { token } = get()
        if (!token) return { success: false, error: 'No token available' }

        set({ isLoading: true, error: null })
        
        try {
          const data = await apiRequest('/auth/profile', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          })

          set({
            user: { ...get().user, profile: data },
            isLoading: false,
          })

          return { success: true, data }
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return { success: false, error: error.message }
        }
      },


      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      initializeAuth: async () => {
        const { token } = get()
        if (!token) return

        const result = await get().getProfile()
        if (!result.success) {
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)