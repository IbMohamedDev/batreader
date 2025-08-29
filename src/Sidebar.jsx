import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.js';
import { useNotebooksStore } from '../store/notebooks.js';
import { useNotesStore } from '../store/note.js';
import PopupForm from './PopupForm.jsx';
import FlashcardViewer from './FlashcardViewer.jsx'; 
import InteractiveQuiz from './InteractiveQuiz.jsx'; 

export default function Sidebar({ 
  onOpenEditor, 
  onOpenNote, 
  onGoHome, 
  flashcards = [], 
  quizzes = [], 
  onStudyMaterialGenerated 
}) {
  const [expandedNotebooks, setExpandedNotebooks] = useState({});
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [expandedFlashcards, setExpandedFlashcards] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  const logout = useAuthStore((state) => state.logout);
  const { token, isAuthenticated } = useAuthStore();
  const { notebooks, fetchNotebooks, createNotebook } = useNotebooksStore();
  const { fetchNotebookNotes, notes, deleteNote } = useNotesStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotebooks(token);
    }
  }, [isAuthenticated, token, fetchNotebooks]);

  const handleDeleteNote = async (noteId, noteTitle) => {

    try {
      const result = await deleteNote(noteId);
    
   
    } catch (error) {
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleNotebook = async (notebookId) => {
    const wasExpanded = !!expandedNotebooks[notebookId];
    
    setExpandedNotebooks(prev => ({ ...prev, [notebookId]: !wasExpanded }));

    if (!wasExpanded) {
      await fetchNotebookNotes(notebookId);
    }
  };

  const getNotebookNotes = (notebookId) => {
    return notes.filter(note => note.notebookId === notebookId);
  };

  const handleAddNote = (notebookId) => {
    setExpandedNotebooks(prev => ({ ...prev, [notebookId]: true }));
    if (onOpenEditor) {
      onOpenEditor(notebookId);
    }
  };

  const handleOpenNote = (noteId, notebookId) => {
    const note = notes.find(n => n.id === noteId);
    if (onOpenNote && note) {
      onOpenNote(noteId, notebookId, note);
    }
  };

  const handleNewNotebook = () => setShowPopupForm(true);
  const handleClosePopupForm = () => setShowPopupForm(false);

  const handleFormSubmit = async (formData) => {
    if (!token) return;
    const result = await createNotebook(formData, token);
    if (result.success) {
      setShowPopupForm(false);
    } else {
    }
  };

  const handleGoHome = () => {
   
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleFlashcardClick = (flashcard) => setSelectedFlashcard(flashcard);
  const handleQuizClick = (quiz) => setSelectedQuiz(quiz);
  const closeStudyMaterial = () => {
    setSelectedFlashcard(null);
    setSelectedQuiz(null);
  };

  return (
    <>
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200">
        <div className="flex flex-col h-full py-4 px-3">
          
          <nav className="flex-1 space-y-1 mt-5 overflow-y-auto">
            <button 
                type="button" 
                onClick={handleGoHome}
                className="flex items-center p-2 ... w-full text-left"
            >
                <img src='src/assets/dlogo.png' width={30}></img>
                <span className="ml-3">Distill</span>
            </button>

         
            <div className="pt-5 mt-5 border-t border-gray-200">
              <h3 className="px-2 mb-3 text-md font-medium text-gray-500 uppercase tracking-wider">Study</h3>
              <div className="space-y-1">
              
                <div>
                  <button onClick={() => setExpandedFlashcards(!expandedFlashcards)} className="flex items-center w-full p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <svg className={`w-4 h-4 mr-2 text-gray-400 transition-transform ${expandedFlashcards ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-1 text-left">Flashcards</span>
                  </button>
               {expandedFlashcards && flashcards.length > 0 && (
  <ul className="ml-8 mt-1 space-y-1">
    {flashcards.map((flashcard) => (
      <li key={flashcard.id}>
        <button
          onClick={() => handleFlashcardClick(flashcard)}
          className="p-1 text-sm rounded-lg hover:bg-gray-100 w-full text-left truncate text-gray-600"
        >
          {flashcard.noteTitle}
        </button>
      </li>
    ))}
  </ul>
)}

                </div>

             
                <div>
                  <button onClick={() => setExpandedQuizzes(!expandedQuizzes)} className="flex items-center w-full p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <svg className={`w-4 h-4 mr-2 text-gray-400 transition-transform ${expandedQuizzes ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-1 text-left">Quizzes </span>
                  </button>
                 {expandedQuizzes && quizzes.length > 0 && (
  <ul className="ml-8 mt-1 space-y-1">
    {quizzes.map((quiz) => (
      <li key={quiz.id}>
        <button
          onClick={() => handleQuizClick(quiz)}
          className="p-1 text-sm rounded-lg hover:bg-gray-100 w-full text-left truncate text-gray-600"
        >
          {quiz.noteTitle}
        </button>
      </li>
    ))}
  </ul>
)}

                </div>
              </div>
            </div>

          
            <div className="pt-5 mt-5 border-t border-gray-200">
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-md font-medium text-gray-500 uppercase tracking-wider">Notebooks</h3>
                <button onClick={handleNewNotebook} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Add Notebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              <ul className="space-y-1">
                {notebooks.map((notebook) => (
                  <li key={notebook.id} className="group">
                    <div className="flex items-center justify-between">
                      <button onClick={() => toggleNotebook(notebook.id)} className="flex items-center flex-1 p-2 text-base rounded-lg hover:bg-gray-100 min-w-0">
                        <svg className={`w-4 h-4 mr-2 text-gray-400 transition-transform flex-shrink-0 ${expandedNotebooks[notebook.id] ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                        <span className="text-sm font-medium text-gray-900 truncate block">{notebook.title}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleAddNote(notebook.id); }} className="opacity-0 group-hover:opacity-100 p-1 mr-2 text-gray-400 hover:text-gray-600" title="Add Note">
<svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
</svg>
                      </button>
                    </div>
                 {expandedNotebooks[notebook.id] && (
  <ul className="ml-8 mt-1 space-y-1">
  {getNotebookNotes(notebook.id)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .map((note) => (
      <li key={note.id} className="group/note flex items-center justify-between">
        <button
          onClick={() => handleOpenNote(note.id, notebook.id)}
          className="p-1 text-sm rounded-lg hover:bg-gray-100 flex-1 text-left truncate text-gray-600"
        >
          {note.title || "Untitled Note"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNote(note.id, note.title || "Untitled Note");
          }}
          className="opacity-0 group-hover/note:opacity-100 p-1 ml-1 text-red-400 hover:text-red-600"
          title="Delete Note"
        >
          <svg
            className="w-4 h-4 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </li>
    ))}
</ul>
)}

</li>
))}
</ul>

            </div>
          </nav>

          <div className="mt-auto flex justify-start space-x-4 px-2 py-4 border-t border-gray-200">
            <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 flex items-center text-sm">
<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clip-rule="evenodd"/>
</svg>
              <span className="ml-2">Log out</span>
            </button>
          </div>
        </div>

        {showPopupForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <PopupForm onSubmit={handleFormSubmit} onClose={handleClosePopupForm} />
            </div>
          </div>
        )}
      </aside>

      {selectedFlashcard && <FlashcardViewer studyMaterial={selectedFlashcard} onClose={closeStudyMaterial} />}
      {selectedQuiz && <InteractiveQuiz studyMaterial={selectedQuiz} onClose={closeStudyMaterial} />}
    </>
  );
}