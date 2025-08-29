import React, { useState } from 'react';

export default function FlashCard({ front, back }) {
  const [showAnswer, setShowAnswer] = useState(false);


  React.useEffect(() => {
    setShowAnswer(false);
  }, [front]);

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 min-h-[200px] flex flex-col justify-between">
      <div>
        <h5 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {front}
        </h5>
        {showAnswer && (
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {back}
          </p>
        )}
      </div>
      
      <button 
        onClick={() => setShowAnswer(!showAnswer)}
        className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 self-start"
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      
      </button>
    </div>
  );
}