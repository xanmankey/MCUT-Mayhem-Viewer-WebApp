import { QuestionProps } from "../interfaces/QuestionProps";

function MultipleChoiceQuestion({ question, sendResponse }: QuestionProps) {
  const colors = ["#39FF14", "#FF073A", "#0FF0FC", "#BC13FE"];

  return (
    <div className="overflow-y-auto flex flex-col items-center justify-center h-screen w-screen bg-white">
      <h1 className="text-4xl text-black font-bold mb-4 text-center">{question.question}</h1>
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        {question.choices.split(",").map((choice, index) => (
          <button
            key={index}
            className={`text-white h-full w-full flex items-center justify-center p-4`}
            style={{ backgroundColor: colors[index % 4] }}
            onClick={() => sendResponse(choice)}
          >
            <p className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center">
              {choice}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
