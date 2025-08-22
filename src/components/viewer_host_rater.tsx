import { useContext, useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { userState, BACKEND, SocketContext } from "../utils.tsx";

import { HostReview } from "../interfaces/HostReview.tsx";

// Extend the Window interface to include textReviewTimer
declare global {
  interface Window {
    textReviewTimer?: ReturnType<typeof setTimeout> | null;
  }
}

let hostUsername: string;

function ViewerHostRater() {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [review, setReview] = useState<HostReview | null>(null);
  const [textReview, setTextReview] = useState("");
  const [charisma, setCharisma] = useState("0");
  const [challengePerformance, setChallengePerformance] = useState("0");
  const [audienceInteraction, setAudienceInteraction] = useState("0");
  const [flow, setFlow] = useState("0");
  const [other, setOther] = useState("0");

  // Listen for new questions via WebSocket
  useEffect(() => {
    socket.on("new_question", (data) => {
      // Navigate to the question page
      console.log("New question received:", data);
      navigate("/question", { state: { question: data } });
      // navigate(0);
    });

    return () => {
      socket.off("new_question");
    }; // Cleanup on unmount (does this mean it will only run once?)
  }, []); // Runs once and listens for new questions

  useEffect(() => {
    socket.on("check_answered", () => {
      // Send the current username to the server to check if they have answered
      if (userState.username != "") {
        console.log("Checking if user has answered");
        socket.emit("check_answered_response", { username: userState.username });
      }
    });

    return () => {
      socket.off("check_answered");
    }; // Cleanup on unmount (does this mean it will only run once?)
  }, []); // Runs once and listens for new questions

  useEffect(() => {
    socket.on("already_answered", () => {
      // Redirect to answered page
      console.log("User has already answered the question");
      navigate("/answered", { state: { response: "", question: null } });
    });

    return () => {
      socket.off("check_answered");
    }; // Cleanup on unmount (does this mean it will only run once?)
  }, []); // Runs once and listens for new questions

  useEffect(() => {
    const fetchCurrentReview = async () => {
      if (userState.username) {
        try {
          await fetch(BACKEND + "/current_review", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: userState.username }),
          })
            .then((response) => response.json())
            .then((data) => {
              setReview(data.review);
              hostUsername = data.review.host_username;
              setCharisma(data.review.charisma_rating ?? "0");
              setChallengePerformance(data.review.challenge_performance_rating ?? "0");
              setAudienceInteraction(data.review.audience_interaction_rating ?? "0");
              setFlow(data.review.flow_rating ?? "0");
              setOther(data.review.other_rating ?? "0");
              setTextReview(data.review.review ?? "");
              console.log("Current review:", data);
            });
        } catch (err) {
          console.error("Error fetching current review:", err);
        }
      }
    };
    fetchCurrentReview();
  }, []);

  const handleSetCharisma = () => {
    setCharisma(charisma);

    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        charisma_rating: charisma,
      })
    );
  };

  const handleSetChallengePerformance = () => {
    setChallengePerformance(challengePerformance);

    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        challenge_performance_rating: challengePerformance,
      })
    );
  };

  const handleSetAudienceInteraction = () => {
    // If you want to use a pending value, add a pendingAudienceInteraction state and use it here
    setAudienceInteraction(audienceInteraction);

    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        audience_interaction_rating: audienceInteraction,
      })
    );
  };

  const handleSetFlow = () => {
    // If you want to use a pending value, add a pendingFlow state and use it here
    setFlow(flow);

    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        flow_rating: flow,
      })
    );
  };

  const handleSetOther = () => {
    // If you want to use a pending value, add a pendingOther state and use it here
    setOther(other);

    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        other_rating: other,
      })
    );
  };

  const handleTextReview = (rev: string) => {
    setTextReview(rev);
    console.log("setting text review:", rev);
    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        review: rev,
      })
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen" key={location.key}>
      {review && (
        <>
          <h1 className="text-4xl text-black font-bold mb-4 text-center break-words">
            {review.host_username}
          </h1>
          <img
            src={review.circle_image}
            alt="Review Circle"
            className="rounded-full object-cover w-32 h-32"
          />
          <div className="w-2/3 max-w-md space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-2">Charisma: {charisma}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="charisma"
                value={charisma}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setCharisma(newValue);
                }}
                onMouseUp={handleSetCharisma}
                onTouchEnd={handleSetCharisma} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">
                Challenge Performance: {challengePerformance}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="challenge_performance"
                value={challengePerformance}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setChallengePerformance(newValue);
                }}
                onMouseUp={handleSetChallengePerformance}
                onTouchEnd={handleSetChallengePerformance} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">
                Audience Interaction: {audienceInteraction}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="audience_interaction"
                value={audienceInteraction}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setAudienceInteraction(newValue);
                }}
                onMouseUp={handleSetAudienceInteraction}
                onTouchEnd={handleSetAudienceInteraction} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Flow: {flow}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="flow"
                value={flow}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setFlow(newValue);
                }}
                onMouseUp={handleSetFlow}
                onTouchEnd={handleSetFlow} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Other: {other}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="other"
                value={other}
                className="w-full custom-gradient-range"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setOther(newValue);
                }}
                onMouseUp={handleSetOther}
                onTouchEnd={handleSetOther} // for mobile support
              />
            </div>
          </div>
          <textarea
            className="border-4 border-solid border-black text-black p-2 w-2/3 resize-none"
            placeholder=""
            value={textReview}
            rows={5}
            onChange={(e) => {
              if (e.target.value.length <= 2000) {
                setTextReview(e.target.value);
              }
              // Start a timer (if not already running) to handle text review submission
              // The timer will stop once the review is submitted
              if (window.textReviewTimer) {
                clearTimeout(window.textReviewTimer);
              }
              window.textReviewTimer = setTimeout(() => {
                handleTextReview(e.target.value);
                window.textReviewTimer = null;
              }, 2000);
            }}
          />
        </>
      )}
    </div>
  );
}

export default ViewerHostRater;
