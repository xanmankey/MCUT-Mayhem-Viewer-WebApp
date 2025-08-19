import { useState } from "react";
import { QuestionProps } from "../interfaces/QuestionProps";

function DropdownQuestion({ question, sendResponse }: QuestionProps) {
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <div className="m-1"></div>
      <div className="flex flex-col justify-center items-center overflow-y-auto">
        {/* <h1 className="text-9xl text-black text-center font-bold mb-4">{question.question}</h1> */}
        {/* {question.image_url && (
          <div className="flex justify-center mb-4">
            <img src={question.image_url} alt="Question related" className="w-160 h-auto" />
          </div>
        )} */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 items-center justify-center max-w-[620px]">
          {question.choices.split(",").map((choice, index) => (
            <button
              key={index}
              onClick={() => setAnswer(choice)}
              className={`px-2 py-1 rounded border text-base font-medium truncate w-full ${
                answer === choice ? "bg-blue-500 text-white" : "bg-white text-black"
              }`}
              style={{ maxWidth: "300px" }}
            >
              {choice}
            </button>
          ))}
        </div>
        <div className="m-4"></div>
        <button
          className="bg-gradient-to-r from-[#2AE4E0] to-[#BC13FE] text-white px-4 py-1 rounded"
          disabled={!answer}
          onClick={() => sendResponse(answer)}
        >
          Submit
        </button>
      </div>
      <div className="m-1"></div>
    </div>
  );
}

export default DropdownQuestion;
