import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { SocketProvider, SocketContext, userState } from "./utils"; // Remove BACKEND import, not needed for images now
import { useContext, useEffect, useState } from "react";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";

function ViewerApp() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  // 1. INITIALIZE STATE DIRECTLY FROM LOCALSTORAGE
  // This ensures the color is there the instant the component mounts, before any effects run.
  const [teamColor, setTeamColor] = useState<string>(
    () => localStorage.getItem("team_color") || ""
  );
  const [username, setUsername] = useState<string>(() => localStorage.getItem("username") || "");

  const [overlayType, setOverlayType] = useState<string>("none");

  useEffect(() => {
    // --- SOCKET LISTENERS ---
    const handleNewQuestion = (data: any) => {
      console.log("Global: New question received", data);
      navigate("/question", { state: { question: data } });
    };

    const handleCheckAnswered = () => {
      if (userState.username !== "") {
        socket.emit("check_answered_response", { username: userState.username });
      }
    };

    const handleAlreadyAnswered = () => {
      navigate("/answered", { state: { response: "", question: null } });
    };

    const handleTeamAssigned = (teamMap: any) => {
      const myUsername = localStorage.getItem("username");
      if (myUsername && teamMap[myUsername]) {
        const assignedColor = teamMap[myUsername];
        console.log("Team Assigned via Socket:", assignedColor);

        // Update State
        setTeamColor(assignedColor);
        // Update Storage
        localStorage.setItem("team_color", assignedColor);
      }
    };

    const handleShowOverlay = (data: any) => {
      console.log("Overlay Triggered:", data.type);
      setOverlayType(data.type);
    };

    socket.on("new_question", handleNewQuestion);
    socket.on("check_answered", handleCheckAnswered);
    socket.on("already_answered", handleAlreadyAnswered);
    socket.on("team_assigned", handleTeamAssigned);
    socket.on("show_overlay", handleShowOverlay);

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("check_answered", handleCheckAnswered);
      socket.off("already_answered", handleAlreadyAnswered);
      socket.off("team_assigned", handleTeamAssigned);
      socket.off("show_overlay", handleShowOverlay);
    };
  }, [socket, navigate]);

  // --- IMAGE PATH LOGIC (LOCAL PUBLIC FOLDER) ---
  // Ensure fbi.png and mafia.png are in the 'public' folder of your React project
  let overlayImageSrc = "";

  if (overlayType === "reveal") {
    if (teamColor === "red") overlayImageSrc = "/mafia.png";
    else if (teamColor === "blue") overlayImageSrc = "/fbi.png";
  } else if (overlayType === "fbi") {
    overlayImageSrc = "/fbi.png";
  } else if (overlayType === "mafia") {
    overlayImageSrc = "/mafia.png";
  }

  const navBackgroundColor =
    teamColor === "red" ? "#FF0000" : teamColor === "blue" ? "#0051FF" : "white";
  const navTextColor = teamColor ? "white" : "black";

  return (
    <div style={{ minHeight: "100vh", position: "relative", boxSizing: "border-box" }}>
      {/* --- OVERLAY IMAGE --- */}
      {overlayImageSrc && (
        <img
          src={overlayImageSrc}
          alt="Affiliation Overlay"
          style={{
            position: "fixed",
            top: "70px", // Push down below header
            right: "10px",
            width: "100px",
            height: "auto",
            zIndex: 99999,
            pointerEvents: "none",
            filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))",
          }}
          onError={(e) => {
            console.error("Failed to load image at path:", overlayImageSrc);
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      {/* --- HEADER --- */}
      {username && (
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            backgroundColor: navBackgroundColor,
            color: navTextColor,
            zIndex: 10000,
            padding: "10px 0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Leaderboard Button */}
          <button
            style={{
              position: "absolute",
              left: "15px",
              color: navTextColor,
              border: `1px solid ${navTextColor}`,
              padding: "5px 10px",
              borderRadius: "5px",
              backgroundColor: "rgba(255,255,255,0.2)",
              fontWeight: "bold",
            }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              Leaderboard
            </Link>
          </button>

          {/* Username */}
          <span style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{username}</span>
        </nav>
      )}

      <div style={{ paddingTop: username ? "70px" : "0px" }}>
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
