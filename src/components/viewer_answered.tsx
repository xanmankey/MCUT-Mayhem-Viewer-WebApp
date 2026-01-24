import { useEffect, useState, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../utils";

function ViewerAnswered() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [localResponse, setLocalResponse] = useState("");
  const [resultData, setResultData] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Ref ensures the listener always sees the answer, even if state is mid-update
  const responseRef = useRef("");

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (!user) navigate("/");

    if (location.state?.response) {
      const resp = String(location.state.response);
      setLocalResponse(resp);
      console.log(localResponse);
      responseRef.current = resp;
    }
  }, [location, navigate]);

  useEffect(() => {
    console.log("ViewerAnswered established - Listening for results...");

    const handleResults = (data: any) => {
      // THIS MUST PRINT IF THE PACKET HITS THE BROWSER
      console.log("!!! Results payload received !!!", data);
      setResultData(data);

      const myUsername = localStorage.getItem("username");
      let myAnswer =
        myUsername && data.responses?.[myUsername]
          ? data.responses[myUsername]
          : responseRef.current;

      if (myAnswer && data.answer) {
        const cleanMyAnswer = String(myAnswer).trim();
        const validAnswers = String(data.answer)
          .split(",")
          .map((a: string) => a.trim());
        const weight = data.weight || 1;

        // FIX: Handle BOTH string and integer type identifiers
        if (data.question_type === 4 || data.question_type === "numbers") {
          const myNum = parseFloat(cleanMyAnswer);
          const targetNum = parseFloat(validAnswers[0]);

          if (!isNaN(myNum) && !isNaN(targetNum) && targetNum !== 0) {
            const difference = Math.abs(targetNum - myNum);
            const ratio = 1 - difference / targetNum;

            // FIX: Add Epsilon (0.0001) to prevent precision errors
            const scoreCalculation = ratio * 15 * Math.abs(weight) + 0.0001;
            const finalScore = Math.max(0, Math.floor(scoreCalculation));

            console.log(`NUMBERS: User ${myNum}, Target ${targetNum}, Score ${finalScore}`);
            setIsCorrect(finalScore > 0);
          } else {
            setIsCorrect(false);
          }
        } else {
          setIsCorrect(validAnswers.includes(cleanMyAnswer));
        }
      } else {
        setIsCorrect(false);
      }

      setTimeout(() => navigate("/"), 5000);
    };

    socket.on("results", handleResults);
    return () => {
      socket.off("results", handleResults);
    };
  }, [socket, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100 p-4">
      {resultData ? (
        <div
          className={`flex flex-col items-center justify-center w-full max-w-md aspect-square rounded-3xl shadow-2xl animate-bounce-in ${
            isCorrect ? "bg-green-500" : "bg-red-500"
          }`}
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
        </div>
      )}
    </div>
  );
}

export default ViewerAnswered;
