import { useState } from "react";

import { QuestionProps } from "../interfaces/QuestionProps";

function MultipleChoiceQuestion({ question, sendResponse }: QuestionProps) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white">
      <h1 className="text-4xl text-black font-bold mb-4 text-center break-words">
        {question.question}
      </h1>
      <input
        type="text"
        className="border-4 border-solid border-black text-black p-2"
        placeholder="Type your answer..."
        value={answer}
        onChange={(e) => {
          if (e.target.value.length <= 200) {
            setAnswer(e.target.value);
          }
        }}
      />
      <button
        className="bg-blue-500 text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center"
        onClick={() => sendResponse(answer)}
      >
        Submit
      </button>
    </div>
  );
}

export default MultipleChoiceQuestion;
