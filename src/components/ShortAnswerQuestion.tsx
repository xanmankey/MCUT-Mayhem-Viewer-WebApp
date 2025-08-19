import { useState } from "react";

import { QuestionProps } from "../interfaces/QuestionProps";

function MultipleChoiceQuestion({ question, sendResponse }: QuestionProps) {
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <div className="m-1"></div>
      <div className="overflow-y-auto flex flex-col items-center justify-center h-screen w-screen bg-white">
        {/* <h1 className="text-4xl text-black font-bold mb-4 text-center break-words">
          {question.question}
        </h1> */}
        {question.image_url && (
          <div className="flex justify-center mb-4 w-full">
            <img
              src={question.image_url}
              alt="Question related"
              className="max-w-full h-auto object-contain"
              style={{ maxHeight: "40vh" }}
            />
          </div>
        )}
        <textarea
          className="border-4 border-solid border-black text-black p-2 w-2/3 resize-none"
          placeholder="Type your answer here..."
          value={answer}
          rows={Math.max(1, Math.min(8, Math.ceil(question.answer.length / 20)))}
          onChange={(e) => {
            if (e.target.value.length <= 200) {
              setAnswer(e.target.value);
            }
          }}
        />
        <div className="my-2"></div>
        <button
          className="bg-gradient-to-r from-[#2AE4E0] to-[#BC13FE] text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center"
          onClick={() => sendResponse(answer)}
        >
          Submit
        </button>
      </div>
      <div className="m-1"></div>
    </div>
  );
}

export default MultipleChoiceQuestion;
