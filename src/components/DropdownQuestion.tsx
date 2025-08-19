import { useState } from "react";
import { QuestionProps } from "../interfaces/QuestionProps";

function DropdownQuestion({ question, sendResponse }: QuestionProps) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="overflow-y-auto">
      <h1 className="text-9xl text-black text-center font-bold mb-4">{question.question}</h1>
      {/* {question.image_url && (
          <div className="flex justify-center mb-4">
            <img src={question.image_url} alt="Question related" className="w-160 h-auto" />
          </div>
        )} */}
      <div className="w-full flex flex-col gap-4">
        {question.choices.split(",").map((choice, index) => (
          <button
            key={index}
            onClick={() => setAnswer(choice)}
            className={`px-4 py-2 rounded border text-lg font-medium ${
              answer === choice ? "bg-blue-500 text-white" : "bg-white text-black"
            }`}
          >
            {choice}
          </button>
        ))}

        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          disabled={!answer}
          onClick={() => sendResponse(answer)}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default DropdownQuestion;
