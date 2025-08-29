import React, { useState, useEffect } from 'react';
import PopupForm from './PopupForm.jsx';
import { useNotebooksStore } from '../store/notebooks.js';
import { useAuthStore } from '../store/auth.js';

export default function Dashboard() {
  const [showPopupForm, setShowPopupForm] = useState(false);
  
  const { token, isAuthenticated } = useAuthStore();
  const { createNotebook } = useNotebooksStore();


  const handleNewNotebook = () => {
    setShowPopupForm(true);
  };

  const handleClosePopupForm = () => {
    setShowPopupForm(false);
  };

  const handleFormSubmit = async (formData) => {
    if (!token) return;

    const result = await createNotebook(formData, token);
    
    if (result.success) {
      setShowPopupForm(false);
     
    } else {
      alert(`Failed to create notebook: ${result.error}`);
    }
  };

  return (

    <div className="h-full flex flex-col items-center justify-center mt-40">
         

      <div className="p-8 text-center">
            

    
      </div>

      <button 
        onClick={handleNewNotebook}
        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
      >
        <span className="text-xl">+</span>
        New Notebook
      </button>

      {showPopupForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <PopupForm onSubmit={handleFormSubmit} onClose={handleClosePopupForm} />
          </div>
        </div>
      )}
    </div>
  );
}
