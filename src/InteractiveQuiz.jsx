import React, { useState } from 'react';

export default function InteractiveQuiz({ studyMaterial, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFinalResults, setShowFinalResults] = useState(false);

  const questions = studyMaterial.data;
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (selectedOption) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(selectedOption);

    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ.question,
        userAnswer: selectedOption,
        correctAnswer: currentQ.correctAnswer,
        isCorrect: isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowFinalResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsAnswered(false);
    setUserAnswers([]);
    setShowFinalResults(false);
  };


  if (showFinalResults) {
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose} 
      >
        <div
          className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold">
               {score} / {totalQuestions} ({percentage}%)
            </h3>
          </div>

          <div className="space-y-4 mb-6">
          
            {userAnswers.map((answer, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  answer.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p className="font-semibold mb-2">
                  Question {index + 1}: {answer.question}
                </p>
                <div className="text-sm">
                  <span className="font-medium">Your answer: </span>
                  <span
                    className={
                      answer.isCorrect ? 'text-green-700' : 'text-red-700'
                    }
                  >
                    {answer.userAnswer}
                  </span>
                  
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetQuiz}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

 
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} 
    >
      <div
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="mb-6 flex justify-between text-sm text-gray-600">
          <span>
            Question {currentQuestion + 1} / {totalQuestions}
          </span>
          <span>Score: {score}</span>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQ.question}
          </h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isCorrect = option === currentQ.correctAnswer;
              const isSelected = option === selectedAnswer;

              let buttonClass =
                'w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ';
              if (isAnswered) {
                if (isCorrect)
                  buttonClass +=
                    'border-green-500 bg-green-100 text-green-800';
                else if (isSelected && !isCorrect)
                  buttonClass += 'border-red-500 bg-red-100 text-red-800';
                else
                  buttonClass +=
                    'border-gray-200 bg-gray-50 text-gray-600 opacity-70';
              } else {
                buttonClass +=
                  'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center">
                    <span className="font-semibold mr-3 text-gray-500">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{option}</span>
                    {isAnswered && isCorrect && (
                      <svg
                        className="w-5 h-5 text-green-600 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <svg
                        className="w-5 h-5 text-red-600 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors flex items-center"
            >
              {currentQuestion < totalQuestions - 1
                ? 'Next Question'
                : 'Finish Quiz'}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
