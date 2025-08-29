import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.js';
import AIMenu from './AiMenu.jsx';


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

function AIExplanationDrawer({ explanation, isOpen, onClose }) {
  if (!explanation && !isOpen) return null;

  return (
    <div 
      className={`fixed top-0 right-0 z-[60] h-screen p-4 overflow-y-auto transition-transform bg-white w-80 dark:bg-gray-800 ${
        isOpen ? 'transform-none' : 'translate-x-full'
      }`}
      tabIndex="-1"
    >
     
      
      <button 
        type="button" 
        onClick={onClose}
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      
      <div className="mb-6 prose prose-sm max-w-none dark:prose-invert">
        <div 
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: explanation
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^\d+\.\s\*\*(.*?)\*\*/gm, '<h4 class="font-bold text-base mb-2 mt-4 underline">$1</h4>')
              .replace(/^-\s/gm, '• ')
              .replace(/\n/g, '<br/>')
          }}
        />
      </div>
    </div>
  );
}


function MenuBar({ editor, onStudyMaterialGenerated, noteTitle }) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [isExplainProcessing, setIsExplainProcessing] = useState(false);
  const [isMenuProcessing, setIsMenuProcessing] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAiMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');

  const { token } = useAuthStore();

  const editorState = useEditorState({
    editor,
    selector: createEditorSelector(),
  });

  const getSelectedText = () => {
    if (!editor) return '';
    const selection = editor.state.selection.empty 
      ? null 
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        );
    return selection?.trim() || '';
  };

  const handleAIExplainClick = async () => {
    if (!editor) return;

    const selection = getSelectedText();
    if (!selection) {
      return;
    }

    setIsExplainProcessing(true);
    setShowExplanation(false);

    try {
      const response = await fetch('http://localhost:3001/ai/explain-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: selection,
          content: selection,
          instructions: "Provide a concise explanation in 2-3 sentences. Include a simple, practical example to illustrate the concept. Keep it brief and easy to understand."
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setExplanation(data.explanation);
        setShowExplanation(true);
      } else {
        throw new Error(data.message || 'Failed to explain text');
      }
    } catch (error) {
      console.error('Error explaining text:', error);
      alert('Failed to explain text. Please try again.');
    } finally {
      setIsExplainProcessing(false);
    }
  };

  const handleAIButtonClick = (event) => {
    if (!editor) return;


    const buttonRect = event.currentTarget.getBoundingClientRect();
    setAiMenuPosition({
      top: buttonRect.bottom + 5,
      left: buttonRect.left,
    });
    
    setShowAIMenu(true);
  };

  const handleAIMenuSelect = async (option) => {
    setIsMenuProcessing(true);
    setShowExplanation(false);
    setShowAIMenu(false);

    try {
      let endpoint, successCallback, content;
      
      switch (option) {
        case 'explain':
         
          const selection = getSelectedText();
          if (!selection) {
            alert('Please select some text to explain');
            setIsMenuProcessing(false);
            return;
          }
          content = selection;
          endpoint = '/ai/explain-text';
          successCallback = (data) => {
            setExplanation(data.explanation);
            setShowExplanation(true);
          };
    
          const requestBody = {
            text: content,
            content: content,
            instructions: "Provide a concise explanation in 2-3 sentences. Include a simple, practical example to illustrate the concept. Keep it simple and easy to understand."
          };
          break;
          
        case 'flashcards':
       
          content = editor.getHTML();
          if (!content || content.trim() === '<p></p>') {
            alert('Please add some content to your note first');
            setIsMenuProcessing(false);
            return;
          }
          endpoint = '/ai/generate-notecards';
          successCallback = (data) => {
            const studyMaterial = {
              id: Date.now(),
              noteTitle: noteTitle || 'Untitled Note',
              noteId: null,
              data: data.data,
              createdAt: new Date().toISOString()
            };
            onStudyMaterialGenerated?.('flashcards', studyMaterial);
          };
          break;
          
        case 'quiz':
      
          content = editor.getHTML();
          if (!content || content.trim() === '<p></p>') {
            alert('Please add some content to your note first');
            setIsMenuProcessing(false);
            return;
          }
          endpoint = '/ai/generate-quiz';
          successCallback = (data) => {
            const studyMaterial = {
              id: Date.now(),
              noteTitle: noteTitle || 'Untitled Note',
              noteId: null,
              data: data.data,
              createdAt: new Date().toISOString()
            };
            onStudyMaterialGenerated?.('quiz', studyMaterial);
          };
          break;
          
        default:
          throw new Error('Invalid option selected');
      }

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(option === 'explain' ? requestBody : {
          text: content,
          content: content
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        successCallback(data);
      } else {
        throw new Error(data.message || `Failed to ${option} text`);
      }
    } catch (error) {
      console.error(`Error with ${option}:`, error);
      alert(`Failed to ${option} content. Please try again.`);
    } finally {
      setIsMenuProcessing(false);
    }
  };

  if (!editor) return null;

  const getCurrentHeading = () => {
    if (editorState.isHeading1) return 'H1';
    if (editorState.isHeading2) return 'H2';
    if (editorState.isHeading3) return 'H3';
    return (
      <svg className="w-[20px] h-[19px] text-zinc-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"/>
      </svg>
    );
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 ml-20 bg-white border border-gray-100 rounded-lg px-3 py-2 z-50 flex items-center space-x-1">

        <div className="relative">
          <button onClick={() => setShowHeadingDropdown(!showHeadingDropdown)} className="px-3 py-1 text-sm rounded text-zinc-600 bg-white border-gray-300 hover:bg-gray-200 flex items-center space-x-1">
            <span>{getCurrentHeading()}</span>
            <span className="text-xs">▼</span>
          </button>
          {showHeadingDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border-gray-300 rounded-md shadow-lg py-1 min-w-[80px] z-60 text-zinc-600">
              <button onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingDropdown(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-200 text-zinc-600">Normal</button>
              {EDITOR_HEADINGS.map(level => (
                <button key={level} onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setShowHeadingDropdown(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-200 text-zinc-600">H{level}</button>
              ))}
            </div>
          )}
        </div>

 
        {EDITOR_ACTIONS.slice(0, 3).map(({ key, action }) => (
          <button key={action} onClick={() => editor.chain().focus()[`toggle${capitalize(action)}`]().run()} disabled={!editorState[`can${capitalize(action)}`]} className={`px-3 py-1 text-sm rounded transition-colors ${editorState[key] ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-300 hover:bg-gray-200 text-zinc-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {action === 'bold' && <svg className="w-[20px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6"/></svg>}
            {action === 'italic' && <svg className="w-[20px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18"/></svg>}
            {action === 'underline' && <span>U</span>}
          </button>
        ))}


        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1 text-sm rounded transition-colors ${editorState.isCodeBlock ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-300 hover:bg-gray-200 text-zinc-600'}`}><svg className="w-[20px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/></svg></button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`px-3 py-1 text-md rounded transition-colors ${editorState.isTaskList ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-300 hover:bg-gray-200 text-zinc-600'}`}>☑</button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1 text-sm rounded transition-colors ${editorState.isBlockquote ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-300 hover:bg-gray-200 text-zinc-600'}`}><svg className="w-[20px] h-[19px]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z" clipRule="evenodd"/></svg></button>
   

        <div className="relative">
          <button onClick={() => setShowListDropdown(!showListDropdown)} className="px-3 py-1 text-sm rounded bg-white border-gray-300 hover:bg-gray-200 flex items-center space-x-1 text-zinc-600">
            <span>≡</span>
            <span className="text-xs">▼</span>
          </button>
          {showListDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[120px] z-60">
              <button onClick={() => { editor.chain().focus().toggleBulletList().run(); setShowListDropdown(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-200 text-zinc-600">• Bullet List</button>
              <button onClick={() => { editor.chain().focus().toggleOrderedList().run(); setShowListDropdown(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-200 text-zinc-600">1. Numbered List</button>
            </div>
          )}
        </div>

        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} className="px-3 py-1 text-sm rounded bg-white border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-600"><svg className="w-[20px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"/></svg></button>
        
   
        <button
          onClick={handleAIExplainClick}
          disabled={isExplainProcessing}
          className="px-3 py-1 text-sm rounded transition-colors bg-white border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-zinc-600"
          title="AI Explain Text"
        >
          {isExplainProcessing ? (
           <svg aria-hidden="true" class="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          ) : (
 <svg class="w-6 h-6 text-gray-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
</svg>



          )}
        </button>

        <button
          onClick={handleAIButtonClick}
          disabled={isMenuProcessing}
          className="px-3 py-1 text-sm rounded transition-colors bg-white border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-zinc-600"
          title="AI Tools"
        >
          {isMenuProcessing ? (
            <svg aria-hidden="true" class="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M17.44 3a1 1 0 0 1 .707.293l2.56 2.56a1 1 0 0 1 0 1.414L18.194 9.78 14.22 5.806l2.513-2.513A1 1 0 0 1 17.44 3Zm-4.634 4.22-9.513 9.513a1 1 0 0 0 0 1.414l2.56 2.56a1 1 0 0 0 1.414 0l9.513-9.513-3.974-3.974ZM6 6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 0 1 0-2h1V7a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z" clipRule="evenodd"/>
              <path d="M19 13h-2v2h2v-2ZM13 3h-2v2h2V3Zm-2 2H9v2h2V5ZM9 3H7v2h2V3Zm12 8h-2v2h2v-2Zm0 4h-2v2h2v-2Z"/>
            </svg>
          )}
        </button>
      </div>

  
      <AIMenu
        isVisible={showAIMenu}
        position={aiMenuPosition}
        onClose={() => setShowAIMenu(false)}
        onSelect={handleAIMenuSelect}
      />

 
      <AIExplanationDrawer
        explanation={explanation}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </>
  );
}

export default MenuBar;