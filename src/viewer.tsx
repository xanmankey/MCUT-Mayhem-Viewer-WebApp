import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { SocketProvider, SocketContext, userState } from "./utils";
import { useContext, useEffect, useState } from "react";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";

function ViewerApp() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [teamColor, setTeamColor] = useState<string>("");
  const [overlayType, setOverlayType] = useState<string>("none");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // ... (Keep existing Global Event Listeners) ...
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
        setTeamColor(teamMap[myUsername]);
      }
    };

    const handleShowOverlay = (data: any) => {
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

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);
  }, []);

  // --- UPDATED IMAGE PATHS (Using Flask Static Folder) ---
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
      {/* --- UPDATED OVERLAY POSITION (Top Right) --- */}
      {overlayImageSrc && (
        <img
          src={overlayImageSrc}
          alt="Affiliation Overlay"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "120px",
            height: "auto",
            zIndex: 99999,
            pointerEvents: "none", // Lets clicks pass through
            filter: "drop-shadow(-2px 2px 4px rgba(0,0,0,0.5))",
          }}
        />
      )}

      {/* --- UPDATED HEADER (Center Username) --- */}
      {username && (
        <nav
          style={{
            display: "flex",
            justifyContent: "center", // Center the username
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
          {/* Leaderboard Button: Absolute Left */}
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

          {/* Username: Centered (by flex container) */}
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
