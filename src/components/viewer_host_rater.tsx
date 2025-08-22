import { useContext, useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { userState, BACKEND, SocketContext } from "../utils.tsx";

import { HostReview } from "../interfaces/HostReview.tsx";

let hostUsername: string;

function ViewerHostRater() {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [review, setReview] = useState<HostReview | null>(null);
  const [textReview, setTextReview] = useState("");
  let lastReviewTime;
  const [textReviewPending, setTextReviewPending] = useState("");
  const [charisma, setCharisma] = useState("0");
  const [pendingCharisma, setPendingCharisma] = useState("0");
  const [challengePerformance, setChallengePerformance] = useState("0");
  const [pendingChallengePerformance, setPendingChallengePerformance] = useState("0");
  const [audienceInteraction, setAudienceInteraction] = useState("0");
  const [pendingAudienceInteraction, setPendingAudienceInteraction] = useState("0");
  const [flow, setFlow] = useState("0");
  const [pendingFlow, setPendingFlow] = useState("0");
  const [other, setOther] = useState("0");
  const [pendingOther, setPendingOther] = useState("0");

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
    setCharisma(pendingCharisma);

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
    setChallengePerformance(pendingChallengePerformance);

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

  const handleTextReview = () => {
    setTextReview(textReviewPending);
    socket.emit(
      "update_review",
      JSON.stringify({
        username: userState.username,
        host_username: hostUsername,
        review: textReview,
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
              <label className="block text-lg font-semibold mb-2">
                Charisma: {pendingCharisma}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="charisma"
                value={pendingCharisma}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setPendingCharisma(newValue);
                }}
                onMouseUp={handleSetCharisma}
                onTouchEnd={handleSetCharisma} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">
                Challenge Performance: {pendingChallengePerformance}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="challenge_performance"
                value={pendingChallengePerformance}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setPendingChallengePerformance(newValue);
                }}
                onMouseUp={handleSetChallengePerformance}
                onTouchEnd={handleSetChallengePerformance} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">
                Audience Interaction: {pendingAudienceInteraction}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="audience_interaction"
                value={pendingAudienceInteraction}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setPendingAudienceInteraction(newValue);
                }}
                onMouseUp={handleSetAudienceInteraction}
                onTouchEnd={handleSetAudienceInteraction} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Flow: {pendingFlow}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="flow"
                value={pendingFlow}
                className="w-full"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setPendingFlow(newValue);
                }}
                onMouseUp={handleSetFlow}
                onTouchEnd={handleSetFlow} // for mobile support
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Other: {pendingOther}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                id="other"
                value={pendingOther}
                className="w-full custom-gradient-range"
                onChange={async (e) => {
                  const newValue = e.target.value;
                  setPendingOther(newValue);
                }}
                onMouseUp={handleSetOther}
                onTouchEnd={handleSetOther} // for mobile support
              />
            </div>
          </div>
          <textarea
            className="border-4 border-solid border-black text-black p-2 w-2/3 resize-none"
            placeholder=""
            value={textReviewPending}
            rows={5}
            onChange={(e) => {
              const newReviewTime = Date.now();
              if (e.target.value.length <= 500) {
                setTextReviewPending(e.target.value);
              } else {
                return;
              }
              // Check if the time of the previous input was more than 1 second ago
              lastReviewTime = newReviewTime;
              if (newReviewTime - lastReviewTime > 2000) {
                handleTextReview();
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default ViewerHostRater;
