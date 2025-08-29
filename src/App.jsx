import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.js';
import './App.css';
import Hero from './hero';
import NavBar from './NavBar';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar.jsx';
import Editor from './Editor.jsx';

function App() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  

  const [currentView, setCurrentView] = useState('dashboard'); 
  

  const [editorConfig, setEditorConfig] = useState({
    notebookId: null,
    noteId: null,
    noteData: null,
  });


  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);


  const handleStudyMaterialGenerated = (type, studyMaterial) => {
    if (type === 'flashcards') {
      setFlashcards(prev => [studyMaterial, ...prev]);
    } else if (type === 'quiz') {
      setQuizzes(prev => [studyMaterial, ...prev]);
    }
  };


  const handleOpenEditor = (notebookId) => {
    setEditorConfig({
      notebookId,
      noteId: null, 
      noteData: null,
    });
    setCurrentView('editor');
  };

 
  const handleOpenNote = (noteId, notebookId, noteData = null) => {
    setEditorConfig({
      notebookId,
      noteId,
      noteData,
    });
    setCurrentView('editor');
  };

  
  const handleGoHome = () => {
    setCurrentView('dashboard');

    setEditorConfig({
      notebookId: null,
      noteId: null,
      noteData: null,
    });
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex"> 
        <Sidebar 
          onOpenEditor={handleOpenEditor}
          onOpenNote={handleOpenNote}
          onGoHome={handleGoHome}
          flashcards={flashcards}
          quizzes={quizzes}
          onStudyMaterialGenerated={handleStudyMaterialGenerated}
        />
        
        <main className="flex-1 ml-64"> 
       
          {currentView === 'editor' ? (
            <Editor 
             
              key={editorConfig.noteId || 'new-note'}
              notebookId={editorConfig.notebookId}
              noteId={editorConfig.noteId}
              noteData={editorConfig.noteData}
              onClose={handleGoHome} 
              onStudyMaterialGenerated={handleStudyMaterialGenerated}
            />
          ) : (
            <Dashboard />
          )}
        </main>
      </div>
    );
  }


  return (
    <>
      <NavBar />
      <Hero />
    </>
  );
}

export default App;