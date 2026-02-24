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

  // Grab the questions passed from the router state
  const initialQuestions = location.state?.questions || [];
  const [availableQuestions, setAvailableQuestions] = useState<any[]>(initialQuestions);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Fallback if accessed without state
  useEffect(() => {
    if (initialQuestions.length === 0) {
      navigate("/");
    }
  }, [initialQuestions, navigate]);

  // The overridden submit function
  const handleFinaleSubmit = (response: string, questionNumber: number) => {
    console.log(`Submitting finale answer for Q${questionNumber}:`, response);

    // 1. Send the answer asynchronously
    socket.emit("submit_finale_answer", {
      username: userState.username,
      number: questionNumber,
      response: response,
    });

    // 2. Remove the question from the local list so they can't answer again
    setAvailableQuestions((prev) => prev.filter((q) => q.number !== questionNumber));

    // 3. Close the expanded view
    setExpandedQuestionId(null);
  };

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
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 border-2 ${
                expandedQuestionId === q.number ? "border-purple-500" : "border-gray-200"
              }`}
            >
              {/* Card Header (Click to expand) */}
              <div
                className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                onClick={() =>
                  setExpandedQuestionId(expandedQuestionId === q.number ? null : q.number)
                }
              >
                <span className="font-bold text-gray-700 truncate pr-4">{q.question}</span>
                <span className="text-2xl text-purple-600">
                  {expandedQuestionId === q.number ? "−" : "+"}
                </span>
              </div>

              {/* Card Body (The Question Component) */}
              {expandedQuestionId === q.number && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 relative z-10">
                  {/* Re-using existing components, but injecting the new finale submit handler */}
                  {q.question_type === "multiple_choice" || q.question_type === "this_or_that" ? (
                    <MultipleChoiceQuestion
                      question={q}
                      sendResponse={(res: string) => handleFinaleSubmit(res, q.number)}
                    />
                  ) : q.question_type === "short_answer" || q.question_type === "ranked_answer" ? (
                    <ShortAnswerQuestion
                      question={q}
                      sendResponse={(res: string) => handleFinaleSubmit(res, q.number)}
                    />
                  ) : q.question_type === "numbers" ? (
                    <NumberQuestion
                      question={q}
                      sendResponse={(res: string) => handleFinaleSubmit(res, q.number)}
                    />
                  ) : q.question_type === "dropdown" ? (
                    <DropdownQuestion
                      question={q}
                      sendResponse={(res: string) => handleFinaleSubmit(res, q.number)}
                    />
                  ) : (
                    <p className="text-red-500">Unsupported format.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewerFinale;
