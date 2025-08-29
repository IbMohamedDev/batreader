import React, { useState } from 'react'

export default function PopupForm({ onSubmit, onClose }) {
  const [title, setTitle] = useState('New Notebook')
  const [description, setDescription] = useState('notebook description')
const [coverImage, setCoverImage] = useState(null)

const handleSubmit = () => {
  const formData = {
    title: title,
    description: description,
    color: '#3B82F6'
  }
  

  onSubmit(formData, (notebookId) => {
    if (coverImage && notebookId) {
      saveImageToLocalStorage(notebookId, coverImage)
    }
  })
}


  const handleImageUpload = (event) => {
  const file = event.target.files[0]
  
  if (file) {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const base64String = e.target.result
      setCoverImage(base64String)
    }
    
    reader.readAsDataURL(file)
  }
}


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Create New Notebook</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/>
</svg>

        </button>
      </div>



    <div>
      <label for="small-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
      <input 
       onChange={(e) => setTitle(e.target.value)}
        type="text" id="small-input" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
  </div>



   
      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-black hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg"
        >
          Create Notebook
        </button>
      </div>
    </div>
  )
}