import { useState } from "react";

import { QuestionProps } from "../interfaces/QuestionProps";

function NumberQuestion({ question, sendResponse }: QuestionProps) {
  const [number, setNumber] = useState("");

  return (
    <div className="overflow-y-auto flex flex-col items-center justify-center h-screen w-screen bg-white">
      <h1 className="text-4xl text-black font-bold mb-4 text-center break-words">
        {question.question}
      </h1>
      <input
        type="number"
        className="border-4 border-solid border-black text-black p-2"
        placeholder="Enter a number..."
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
      />
      <button
        className="bg-green-500 text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center"
        onClick={() => sendResponse(number)}
      >
        Submit
      </button>
    </div>
  );
}

export default NumberQuestion;
