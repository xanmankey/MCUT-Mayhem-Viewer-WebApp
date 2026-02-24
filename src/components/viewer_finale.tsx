import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext, userState } from "../utils.tsx";

import MultipleChoiceQuestion from "./MultipleChoiceQuestion.tsx";
import ShortAnswerQuestion from "./ShortAnswerQuestion.tsx";
import NumberQuestion from "./NumberQuestion.tsx";
import DropdownQuestion from "./DropdownQuestion.tsx";

function ViewerFinale() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  const initialQuestions = location.state?.questions || [];
  const [availableQuestions, setAvailableQuestions] = useState<any[]>(initialQuestions);

  // --- NEW: Track the entire active question object instead of just the ID ---
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [finaleEnded, setFinaleEnded] = useState(false);

  const GOAL_SCORE = 1000;

  useEffect(() => {
    if (initialQuestions.length === 0) {
      navigate("/");
    }

    // Listener 1: The official kill switch
    const handleFinaleEnded = () => {
      setFinaleEnded(true);
      setActiveQuestion(null);
    };

    // Listener 2: The Bulletproof Fallback
    // If the phone ever sees a score >= 1000, it kills the game itself
    const handleScoreUpdate = (data: { red: number; blue: number }) => {
      if (data.red >= GOAL_SCORE || data.blue >= GOAL_SCORE) {
        setFinaleEnded(true);
        setActiveQuestion(null);
      }
    };

    socket.on("finale_ended", handleFinaleEnded);
    socket.on("team_score_update", handleScoreUpdate);

    return () => {
      socket.off("finale_ended", handleFinaleEnded);
      socket.off("team_score_update", handleScoreUpdate);
    };
  }, [initialQuestions, navigate, socket]);

  if (finaleEnded) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 px-6 text-center"
        style={{ zIndex: 999999 }}
      >
        <h1 className="text-5xl font-black text-white mb-6 animate-pulse uppercase tracking-widest">
          SYSTEM OVERRIDE
          <br />
          COMPLETE
        </h1>
        <p className="text-2xl text-gray-300 font-medium border-t-2 border-gray-600 pt-6">
          The war is over - time for the results
        </p>
      </div>
    );
  }

  const handleFinaleSubmit = (response: string, questionNumber: number) => {
    console.log(`Submitting finale answer for Q${questionNumber}:`, response);

    socket.emit("submit_finale_answer", {
      username: userState.username,
      number: questionNumber,
      response: response,
    });

    // Remove from the list AND exit the full-screen view
    setAvailableQuestions((prev) => prev.filter((q) => q.number !== questionNumber));
    setActiveQuestion(null);
  };

  // ==========================================
  // VIEW 1: THE FULL-SCREEN ACTIVE QUESTION
  // ==========================================
  if (activeQuestion) {
    return (
      <div
        className="flex flex-col h-screen w-screen bg-gray-100 absolute top-0 left-0"
        style={{ zIndex: 99999 }} // Ensures it sits on top of everything, including the nav bar
      >
        {/* Top Header Bar */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between z-10 w-full">
          <button
            onClick={() => setActiveQuestion(null)}
            className="text-purple-600 font-bold px-4 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 active:bg-purple-300 transition-colors"
          >
            ← Back
          </button>
          <span className="font-bold text-gray-700 truncate ml-4 flex-1 text-right">
            Question {activeQuestion.number}
          </span>
        </div>

        {/* The Question Container (Takes up the rest of the screen) */}
        <div className="flex-1 overflow-y-auto relative bg-white">
          {/* Notice there are no scale/shrink CSS hacks here anymore! */}
          {activeQuestion.question_type === "multiple_choice" ||
          activeQuestion.question_type === "this_or_that" ? (
            <MultipleChoiceQuestion
              question={activeQuestion}
              sendResponse={(res: string) => handleFinaleSubmit(res, activeQuestion.number)}
            />
          ) : activeQuestion.question_type === "short_answer" ||
            activeQuestion.question_type === "ranked_answer" ? (
            <ShortAnswerQuestion
              question={activeQuestion}
              sendResponse={(res: string) => handleFinaleSubmit(res, activeQuestion.number)}
            />
          ) : activeQuestion.question_type === "numbers" ? (
            <NumberQuestion
              question={activeQuestion}
              sendResponse={(res: string) => handleFinaleSubmit(res, activeQuestion.number)}
            />
          ) : activeQuestion.question_type === "dropdown" ? (
            <DropdownQuestion
              question={activeQuestion}
              sendResponse={(res: string) => handleFinaleSubmit(res, activeQuestion.number)}
            />
          ) : (
            <div className="flex justify-center items-center h-full text-red-500 font-bold text-xl p-4 text-center">
              Unsupported format: {activeQuestion.question_type}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE MAIN QUESTION LIST
  // ==========================================
  return (
    <div className="flex flex-col items-center h-screen w-screen bg-gray-100 overflow-y-auto pb-20 pt-4 px-4">
      <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
        SYSTEM OVERRIDE ACTIVE
        <br />
        <span className="text-sm font-normal text-gray-600">
          Answer remaining questions to power up!
        </span>
      </h2>

      <div className="w-full max-w-md flex flex-col gap-4">
        {availableQuestions.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow border-2 border-green-400">
            <h3 className="text-2xl font-bold text-green-600 mb-2">Payload Delivered!</h3>
            <p className="text-gray-600">
              You have answered all available questions. Look at the main screen!
            </p>
          </div>
        ) : (
          availableQuestions.map((q) => (
            <div
              key={q.number}
              // Added active/hover states to make it feel like a clickable button
              className="bg-white rounded-xl shadow-md border border-gray-200 cursor-pointer hover:border-purple-500 hover:shadow-lg active:scale-95 transition-all duration-200"
              onClick={() => setActiveQuestion(q)}
            >
              <div className="p-5 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">{q.question}</span>
                <span className="text-purple-600 font-black text-2xl pl-4">→</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewerFinale;
