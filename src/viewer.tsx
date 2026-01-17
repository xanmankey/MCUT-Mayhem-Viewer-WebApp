import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { SocketProvider, SocketContext, userState } from "./utils"; // Added userState import
import { useContext, useEffect, useState } from "react";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";

function ViewerApp() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate(); // Hook for global navigation
  const [teamColor, setTeamColor] = useState<string>("");
  const [overlayType, setOverlayType] = useState<string>("none");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // 1. GLOBAL LISTENER: New Question
    // This solves your desync issue. No matter what screen the user is on
    // (Correct, Incorrect, Leaderboard, Spinner), this forces them to the question.
    const handleNewQuestion = (data: any) => {
      console.log("Global: New question received", data);
      navigate("/question", { state: { question: data } });
    };

    // 2. GLOBAL LISTENER: Sync on Connect/Refresh
    const handleCheckAnswered = () => {
      if (userState.username !== "") {
        console.log("Global: Checking if user has answered");
        socket.emit("check_answered_response", { username: userState.username });
      }
    };

    const handleAlreadyAnswered = () => {
      console.log("Global: User already answered");
      // Navigate to answered state if they reconnect during a question they finished
      navigate("/answered", { state: { response: "", question: null } });
    };

    // 3. GLOBAL LISTENER: Team/Overlay Logic
    const handleTeamAssigned = (teamMap: any) => {
      const myUsername = localStorage.getItem("username");
      if (myUsername && teamMap[myUsername]) {
        setTeamColor(teamMap[myUsername]);
      }
    };

    const handleShowOverlay = (data: any) => {
      setOverlayType(data.type);
    };

    // Attach Listeners
    socket.on("new_question", handleNewQuestion);
    socket.on("check_answered", handleCheckAnswered);
    socket.on("already_answered", handleAlreadyAnswered);
    socket.on("team_assigned", handleTeamAssigned);
    socket.on("show_overlay", handleShowOverlay);

    // Cleanup
    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("check_answered", handleCheckAnswered);
      socket.off("already_answered", handleAlreadyAnswered);
      socket.off("team_assigned", handleTeamAssigned);
      socket.off("show_overlay", handleShowOverlay);
    };
  }, [socket, navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);
  }, []);

  let overlayImageSrc = "";
  if (overlayType === "reveal") {
    if (teamColor === "red") overlayImageSrc = "/static/images/mafia.png";
    else if (teamColor === "blue") overlayImageSrc = "/static/images/fbi.png";
  } else if (overlayType === "fbi") {
    overlayImageSrc = "/static/images/fbi.png";
  } else if (overlayType === "mafia") {
    overlayImageSrc = "/static/images/mafia.png";
  }

  const navBackgroundColor =
    teamColor === "red" ? "#FF0000" : teamColor === "blue" ? "#0051FF" : "white";
  const navTextColor = teamColor ? "white" : "black";

  return (
    <div style={{ minHeight: "100vh", position: "relative", boxSizing: "border-box" }}>
      {overlayImageSrc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 99999,
          }}
        >
          <img
            src={overlayImageSrc}
            alt="Affiliation Overlay"
            style={{
              position: "absolute",
              top: "60px",
              right: "10px",
              width: "100px",
              height: "auto",
              filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.5))",
            }}
          />
        </div>
      )}

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: navBackgroundColor,
          color: navTextColor,
          zIndex: 10000,
          padding: "10px 20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease",
        }}
      >
        <button
          style={{
            color: navTextColor,
            border: `1px solid ${navTextColor}`,
            padding: "5px 10px",
            borderRadius: "5px",
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}>
            Leaderboard
          </Link>
        </button>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{username}</span>
      </nav>

      <div style={{ paddingTop: "70px" }}>
        <Routes>
          <Route path="/" element={<ViewerLeaderboard />} />
          <Route path="/viewer.html" element={<ViewerLeaderboard />} />
          <Route path="/question" element={<ViewerQuestion />} />
          <Route path="/answered" element={<ViewerAnswered />} />
          <Route path="/answer" element={<ViewerAnswer />} />
        </Routes>
      </div>
    </div>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <SocketProvider>
        <Router>
          <ViewerApp />
        </Router>
      </SocketProvider>
    );
  }
});
