import { QuestionProps } from "../interfaces/QuestionProps";

function MultipleChoiceQuestion({ question, sendResponse }: QuestionProps) {
  const colors = ["#2AE4E0", "#BC13FE", "#E09B2A", "#A3E02A"];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-screen bg-white">
      {/* h-[calc(100vh-80px)] accounts for the fixed header height */}

      {/* --- IMAGE SECTION --- */}
      {question.image_url && (
        <div className="flex-shrink-0 flex justify-center w-full p-2 bg-gray-50">
          <img
            src={question.image_url}
            alt="Question"
            className="object-contain rounded-lg shadow-md"
            style={{ maxHeight: "35vh", maxWidth: "100%" }}
          />
        </div>
      )}

      {/* --- BUTTON GRID SECTION --- */}
      <div className="flex-grow w-full p-2">
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          {question.choices.split(",").map((choice, index) => {
            const color1 = colors[index % colors.length];
            const color2 = colors[(index + 1) % colors.length];
            const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;

            return (
              <button
                key={index}
                className="text-white h-full w-full flex items-center justify-center p-2 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                id={choice}
                style={{
                  background: gradient,
                  border: "none",
                  borderRadius: "1rem",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                }}
                onClick={() => sendResponse(choice)}
              >
                <p className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-center drop-shadow-md break-words w-full">
                  {choice}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
