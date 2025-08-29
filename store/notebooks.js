import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE_URL = 'http://localhost:3001'

const apiRequest = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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

export const useNotebooksStore = create(
  persist(
    (set, get) => ({
      notebooks: [],
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

     fetchNotebooks: async (token) => {
  if (!token) return { success: false, error: 'No token available' }

  set({ isLoading: true, error: null })
  
  try {
    const notebooks = await apiRequest('/notebooks', token)

    set({
      notebooks,
      isLoading: false,
      error: null,
    })

    return { success: true, data: notebooks }
  } catch (error) {
    set({
      error: error.message,
      isLoading: false,
    })
    return { success: false, error: error.message }
  }
},


      createNotebook: async (notebookData, token) => {
        if (!token) return { success: false, error: 'No token available' }

        set({ isLoading: true, error: null })
        
        try {
          const newNotebook = await apiRequest('/notebooks', token, {
            method: 'POST',
            body: JSON.stringify(notebookData),
          })

          set({
            notebooks: [...get().notebooks, newNotebook],
            isLoading: false,
            error: null,
          })

          return { success: true, data: newNotebook }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

      updateNotebook: async (notebookId, notebookData, token) => {
        if (!token) return { success: false, error: 'No token available' }

        set({ isLoading: true, error: null })
        
        try {
          const updatedNotebook = await apiRequest(`/notebooks/${notebookId}`, token, {
            method: 'PUT',
            body: JSON.stringify(notebookData),
          })

          set({
            notebooks: get().notebooks.map(notebook => 
              notebook.id === notebookId ? updatedNotebook : notebook
            ),
            isLoading: false,
            error: null,
          })

          return { success: true, data: updatedNotebook }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

      deleteNotebook: async (notebookId, token) => {
        if (!token) return { success: false, error: 'No token available' }

        set({ isLoading: true, error: null })
        
        try {
          await apiRequest(`/notebooks/${notebookId}`, token, {
            method: 'DELETE',
          })

          set({
            notebooks: get().notebooks.filter(notebook => notebook.id !== notebookId),
            isLoading: false,
            error: null,
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

      getNotebook: (notebookId) => {
        return get().notebooks.find(notebook => notebook.id === notebookId)
      },

      clearNotebooks: () => {
        set({
          notebooks: [],
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'notebooks-storage',
      partialize: (state) => ({
        notebooks: state.notebooks,
      }),
    }
  )
)