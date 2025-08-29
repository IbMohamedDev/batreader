import React, { useState } from 'react';
import FlashCard from './FlashCard'; 
export default function FlashcardViewer({ studyMaterial, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!studyMaterial || !studyMaterial.data || studyMaterial.data.length === 0) {
    return null;
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % studyMaterial.data.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + studyMaterial.data.length) % studyMaterial.data.length);
  };

  return (

    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} 
    >
   
      <div
        className="rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center space-x-8">
      
          <button
            onClick={goToPrevious}
            className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={studyMaterial.data.length <= 1}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

        
          <div className="flex-1 max-w-2xl">
            <FlashCard 
              front={studyMaterial.data[currentIndex].front}
              back={studyMaterial.data[currentIndex].back}
            />
          </div>

      
          <button
            onClick={goToNext}
            className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={studyMaterial.data.length <= 1}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

       
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {studyMaterial.data.length}
          </span>
        </div>
      </div>
    </div>
  );
}
