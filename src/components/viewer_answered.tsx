import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../utils";

function ViewerAnswered() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [localResponse, setLocalResponse] = useState("");
  const [resultData, setResultData] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state && location.state.response) {
      setLocalResponse(location.state.response);
    }
  }, [location]);

  useEffect(() => {
    const handleResults = (data: any) => {
      setResultData(data);

      const myUsername = localStorage.getItem("username");
      let myAnswer =
        myUsername && data.responses && data.responses[myUsername]
          ? data.responses[myUsername]
          : localResponse;

      if (myAnswer && data.answer) {
        const cleanMyAnswer = myAnswer.trim();
        const validAnswers = data.answer.split(",").map((a: string) => a.trim());
        const weight = data.weight || 1;

        // --- MATCHING STREAMER LOGIC ---
        if (data.question_type === 4) {
          // QuestionType.NUMBERS
          const myNum = parseFloat(cleanMyAnswer);

          const match = validAnswers.some((ans: string) => {
            const targetNum: number = parseFloat(ans);
            if (isNaN(myNum) || isNaN(targetNum) || targetNum === 0) return false;

            const difference: number = Math.abs(targetNum - myNum);
            // Replicating: Math.max(0, Math.floor((1 - difference / answer) * 15 * Math.abs(weight)))
            // If the result of this formula is > 0, we consider it "Correct"
            const score: number = Math.floor((1 - difference / targetNum) * 15 * Math.abs(weight));
            return score > 0;
          });

          setIsCorrect(match);
        } else {
          // Standard exact string match for other types
          setIsCorrect(validAnswers.includes(cleanMyAnswer));
        }
      } else {
        setIsCorrect(false);
      }

      setTimeout(() => {
        navigate("/");
      }, 5000);
    };

    const handleNewQuestion = (data: any) => {
      navigate("/question", { state: { question: data } });
    };

    socket.on("results", handleResults);
    socket.on("new_question", handleNewQuestion);

    return () => {
      socket.off("results", handleResults);
      socket.off("new_question", handleNewQuestion);
    };
  }, [socket, localResponse, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100 p-4">
      {resultData ? (
        <div
          className={`flex flex-col items-center justify-center w-full max-w-md aspect-square rounded-3xl shadow-2xl animate-bounce-in 
            ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
        >
          <h1 className="text-6xl font-black text-white drop-shadow-md tracking-wider">
            {isCorrect ? "CORRECT" : "WRONG"}
          </h1>
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl w-full max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-6"></div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">LOCKED IN</h2>
          <p className="text-2xl text-purple-600 font-bold italic mb-6">Good answer?</p>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
            Waiting for host...
          </p>
        </div>
      )}
    </div>
  );
}

export default ViewerAnswered;
