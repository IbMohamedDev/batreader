import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import { useNotesStore } from '../store/note.js';
import { useAuthStore } from '../store/auth.js';
import AIMenu from './AiMenu.jsx';
import MenuBar from './MenuBar.jsx';

const lowlight = createLowlight();
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('javascript', js);
lowlight.register('ts', ts);
lowlight.register('typescript', ts);
lowlight.register('python', python);
lowlight.register('json', json);

const EDITOR_ACTIONS = [
  { key: 'isBold', action: 'bold', canKey: 'canBold' },
  { key: 'isItalic', action: 'italic', canKey: 'canItalic' },
  { key: 'isUnderline', action: 'underline', canKey: 'canUnderline' },
  { key: 'isStrike', action: 'strike', canKey: 'canStrike' },
  { key: 'isCode', action: 'code', canKey: 'canCode' },
];
const EDITOR_FORMATTING = ['paragraph', 'bulletList', 'orderedList', 'codeBlock', 'taskList', 'blockquote'];
const EDITOR_HEADINGS = [1, 2, 3];
const EDITOR_COMMANDS = [{ key: 'canUndo', command: 'undo' }, { key: 'canRedo', command: 'redo' }];

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const createEditorSelector = () => ({ editor }) => {
  const state = {};
  EDITOR_ACTIONS.forEach(({ key, action, canKey }) => {
    state[key] = editor.isActive(action) ?? false;
    state[canKey] = editor.can().chain()[`toggle${capitalize(action)}`]().run() ?? false;
  });
  EDITOR_FORMATTING.forEach(block => {
    state[`is${capitalize(block)}`] = editor.isActive(block) ?? false;
  });
  EDITOR_HEADINGS.forEach(level => {
    state[`isHeading${level}`] = editor.isActive('heading', { level }) ?? false;
  });
  EDITOR_COMMANDS.forEach(({ key, command }) => {
    state[key] = editor.can().chain()[command]().run() ?? false;
  });
  return state;
};

function useEditorState({ editor, selector }) {
  const [state, setState] = useState({});
  const memoizedSelector = useCallback(selector, []);

  useEffect(() => {
    if (!editor) return;
    const updateState = () => {
      try {
        setState(memoizedSelector({ editor }));
      } catch (error) {
        console.error('Error updating editor state:', error);
      }
    };
    const events = ['selectionUpdate', 'transaction'];
    events.forEach(event => editor.on(event, updateState));
    updateState();
    return () => events.forEach(event => editor.off(event, updateState));
  }, [editor, memoizedSelector]);

  return state;
}

function AIExplanationModal({ explanation, onClose }) {
  if (!explanation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">AI Explanation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

export default function Editor({ notebookId, noteId = null, noteData = null, onClose, onStudyMaterialGenerated }) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isNewNote, setIsNewNote] = useState(!noteId);
  const titleRef = useRef(null);

  const { createNote, updateNote } = useNotesStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-6 min-h-[500px]',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (noteData) {
      setTitle(noteData.title || 'Untitled Note');
      editor.commands.setContent(noteData.content || '');
      setIsNewNote(false);
    } else {
      setTitle('');
      editor.commands.setContent('');
      setIsNewNote(true);
    }
  }, [editor, noteData]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      adjustHeight();
      textarea.addEventListener('input', adjustHeight);
      return () => textarea.removeEventListener('input', adjustHeight);
    }
  }, [title]);

  const handleSave = async () => {
    const content = editor?.getHTML() || '';
    if (!title.trim() && content.trim() === '<p></p>') {
      setError('Please add a title or some content before saving.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    const noteDataToSave = {
      title: title.trim() || 'Untitled Note',
      content,
      notebookId,
    };

    const result = isNewNote
      ? await createNote(noteDataToSave)
      : await updateNote(noteId, noteDataToSave);

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage(isNewNote ? 'Note created successfully!' : 'Note updated successfully!');
      setTimeout(() => onClose(), 1500);
    } else {
      setError(result.error || 'Failed to save note');
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MenuBar 
        editor={editor} 
        onStudyMaterialGenerated={onStudyMaterialGenerated}
        noteTitle={title}
      />
      
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <button onClick={handleSave} disabled={isSaving} className="bg-black hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50 flex items-center space-x-2">
          {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{isSaving ? 'Saving...' : (isNewNote ? 'Save Note' : 'Update Note')}</span>
        </button>
      </div>
      
      {error && (
        <div className="fixed top-16 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg></div>
            <div className="ml-3"><p className="text-sm">{error}</p></div>
            <div className="ml-auto pl-3"><button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg></button></div>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-16 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
            <div className="ml-3"><p className="text-sm">{successMessage}</p></div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto pt-20 px-8 mt-20">
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold w-full border-none outline-none placeholder-gray-400 bg-transparent mb-8 resize-none overflow-hidden"
          placeholder="Enter title"
          autoFocus
          rows={1}
          style={{ minHeight: '1.2em' }}
        />
        <div className="flex-1 overflow-y-auto">
          <EditorContent 
            editor={editor}
            className="h-full editor-content"
          />
        </div>
      </div>
    </div>
  );
}