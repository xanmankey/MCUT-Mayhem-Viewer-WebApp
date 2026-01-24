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

  // Auth Guard: Ensure the user is logged in
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (!user) {
      console.warn("No username found, redirecting to login...");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Sync local state from navigation to show "Locked In" response
    if (location.state && location.state.response) {
      setLocalResponse(location.state.response);
    }
  }, [location]);

  useEffect(() => {
    const handleResults = (data: any) => {
      console.log("Results payload received:", data);
      setResultData(data);

      const myUsername = localStorage.getItem("username");

      // Source of Truth: Look up what the server officially recorded for this user
      let myAnswer =
        myUsername && data.responses && data.responses[myUsername]
          ? data.responses[myUsername]
          : localResponse;

      if (myAnswer && data.answer) {
        const cleanMyAnswer = myAnswer.trim();
        const validAnswers = data.answer.split(",").map((a: string) => a.trim());
        const weight = data.weight || 1;

        // --- NUMBERS LOGIC SYNCED WITH STREAMER ---
        // Check for both the enum index 4 and the string identifier
        if (data.question_type === 4 || data.question_type === "numbers") {
          const myNum = parseFloat(cleanMyAnswer);

          const match = validAnswers.some((ans: string) => {
            const targetNum: number = parseFloat(ans);

            // Basic sanity checks: ensure numbers are valid and prevent division by zero
            if (isNaN(myNum) || isNaN(targetNum) || targetNum === 0) return false;

            const difference: number = Math.abs(targetNum - myNum);

            // 1. Calculate the accuracy ratio as a float
            const ratio = 1 - difference / targetNum;

            // 2. Perform the score calculation matching app.py exactly
            // We add 0.000001 (Epsilon) to handle floating point precision errors
            // before flooring. This prevents 0.999999 from becoming 0.
            const scoreCalculation = ratio * 15 * Math.abs(weight) + 0.000001;
            const finalScore = Math.max(0, Math.floor(scoreCalculation));

            console.log(
              `User: ${myNum}, Target: ${targetNum}, Ratio: ${ratio}, Calc: ${scoreCalculation}, Final: ${finalScore}`
            );

            return finalScore > 0;
          });

          setIsCorrect(match);
        } else {
          // Standard Exact Match for Multiple Choice/This or That/Dropdown
          setIsCorrect(validAnswers.includes(cleanMyAnswer));
        }
      } else {
        setIsCorrect(false);
      }

      // Auto-redirect back to leaderboard after 5 seconds
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
        // --- RESULT VIEW ---
        <div
          className={`flex flex-col items-center justify-center w-full max-w-md aspect-square rounded-3xl shadow-2xl animate-bounce-in 
            ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
        >
          <h1 className="text-6xl font-black text-white drop-shadow-md tracking-wider">
            {isCorrect ? "CORRECT" : "WRONG"}
          </h1>
        </div>
      ) : (
        // --- WAITING VIEW ---
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
