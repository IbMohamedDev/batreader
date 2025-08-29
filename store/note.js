import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './auth.js'


const API_BASE_URL = 'http://localhost:3001'

const apiRequest = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().token;
  
  console.log('🔍 Making API request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    hasToken: !!token,
    body: options.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : 'No token',
      ...options.headers,
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })



    const responseText = await response.text();
   

    if (!response.ok) {
  
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      } catch (parseError) {
      
        errorMesg = responseText.includes('<!DOCTYPE') 
          ? `Server returned HTML instead of JSON. Status: ${response.status}. Check if backend server is running on ${API_BASE_URL}` 
          : responseText || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMesg);
    }


    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
  } catch (error) {
    throw error;
  }
}

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

  
      createNote: async (noteData) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          return { success: false, error: 'Not authenticated' }
        }

        set({ isLoading: true, error: null })
        
        try {
          const newNote = await apiRequest('/notes', {
            method: 'POST',
            body: JSON.stringify(noteData),
          })


 
          set(state => ({
            notes: [...state.notes, newNote],
            isLoading: false,
            error: null,
          }))

          return { success: true, data: newNote }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

      // Update an existing note
      updateNote: async (noteId, noteData) => {
        const token = useAuthStore.getState().token;
        if (!token) return { success: false, error: 'Not authenticated' }
        if (!noteId) return { success: false, error: 'Note ID is required' }

        set({ isLoading: true, error: null })
        
        try {
          const updatedNote = await apiRequest(`/notes/${noteId}`, {  // Changed from '/api/notes' to '/notes'
            method: 'PUT',
            body: JSON.stringify(noteData),
          })

          // Update the note in the store
          set(state => ({
            notes: state.notes.map(note => 
              note.id === noteId ? updatedNote : note
            ),
            currentNote: state.currentNote?.id === noteId ? updatedNote : state.currentNote,
            isLoading: false,
            error: null,
          }))

          return { success: true, data: updatedNote }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

  
      fetchNotebookNotes: async (notebookId) => {
        const token = useAuthStore.getState().token;
        if (!token) return { success: false, error: 'Not authenticated' }
        if (!notebookId) return { success: false, error: 'Notebook ID is required' }

        set({ isLoading: true, error: null })
        
        try {
          const notes = await apiRequest(`/notes/notebook/${notebookId}`)
          console.log('📦 Received notes for notebook:', notebookId, notes);

  
          const notesWithNotebookId = notes.map(note => ({
            ...note,
            notebookId: notebookId
          }));


     
          const currentNotes = get().notes
          const otherNotes = currentNotes.filter(note => note.notebookId !== notebookId)
          const updatedNotes = [...otherNotes, ...notesWithNotebookId]


          set({
            notes: updatedNotes,
            isLoading: false,
            error: null,
          })

          return { success: true, data: notesWithNotebookId }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

 
      fetchNote: async (noteId) => {
        const token = useAuthStore.getState().token;
        if (!token) return { success: false, error: 'Not authenticated' }
        if (!noteId) return { success: false, error: 'Note ID is required' }

        set({ isLoading: true, error: null })
        
        try {
          const note = await apiRequest(`/notes/${noteId}`) 

        
          const currentNotes = get().notes
          const noteIndex = currentNotes.findIndex(n => n.id === noteId)
          
          let updatedNotes
          if (noteIndex >= 0) {
            updatedNotes = currentNotes.map(n => n.id === noteId ? note : n)
          } else {
            updatedNotes = [...currentNotes, note]
          }

          set({
            notes: updatedNotes,
            currentNote: note,
            isLoading: false,
            error: null,
          })

          return { success: true, data: note }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          })
          return { success: false, error: error.message }
        }
      },

    
      deleteNote: async (noteId) => {
        const token = useAuthStore.getState().token;
        if (!token) return { success: false, error: 'Not authenticated' }
        if (!noteId) return { success: false, error: 'Note ID is required' }

        set({ isLoading: true, error: null })
        
        try {
          await apiRequest(`/notes/${noteId}`, {  
            method: 'DELETE',
          })

          const currentNote = get().currentNote
          
          set({
            notes: get().notes.filter(note => note.id !== noteId),
            currentNote: currentNote?.id === noteId ? null : currentNote,
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

  
      getNote: (noteId) => {
        return get().notes.find(note => note.id === noteId)
      },

      getNotesByNotebook: (notebookId) => {
        return get().notes.filter(note => note.notebookId === notebookId)
      },


      clearNotes: () => {
        set({
          notes: [],
          currentNote: null,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({
        notes: state.notes,
     
      }),
    }
  )
)