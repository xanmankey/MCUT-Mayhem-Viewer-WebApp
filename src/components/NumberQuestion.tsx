import { useState } from "react";

import { QuestionProps } from "../interfaces/QuestionProps";

function NumberQuestion({ question, sendResponse }: QuestionProps) {
  const [number, setNumber] = useState("");

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
        <input
          type="number"
          className="border-4 border-solid border-black w-2/3 text-black p-2"
          placeholder="Enter a number..."
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <div className="my-2"></div>
        <button
          className="bg-gradient-to-r from-[#2AE4E0] to-[#BC13FE] text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center"
          onClick={() => sendResponse(number)}
        >
          Submit
        </button>
      </div>
      <div className="m-1"></div>
    </div>
  );
}

export default NumberQuestion;
