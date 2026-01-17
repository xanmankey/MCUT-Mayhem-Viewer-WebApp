// viewer.tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SocketProvider, SocketContext } from "./utils";
import { useContext, useEffect, useState } from "react";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";

function ViewerApp() {
  const socket = useContext(SocketContext);

  // STATE 1: Controls the Red/Blue Border
  const [teamColor, setTeamColor] = useState<string>("");

  // STATE 2: Controls the Logo Overlay (starts as "none")
  const [overlayType, setOverlayType] = useState<string>("none");

  useEffect(() => {
    // EVENT 1: Happens when you click "Assign Teams"
    socket.on("team_assigned", (teamMap: any) => {
      const myUsername = localStorage.getItem("username");
      if (myUsername && teamMap[myUsername]) {
        setTeamColor(teamMap[myUsername]); // Only sets the color!
      }
    });

    // EVENT 2: Happens when you click "Reveal Allegiance"
    socket.on("show_overlay", (data: any) => {
      setOverlayType(data.type); // Only NOW does the overlay state change
    });

    return () => {
      socket.off("team_assigned");
      socket.off("show_overlay");
    };
  }, [socket]);

  // Logic: Calculate which image to show based on the two states
  let overlayImageSrc = "";

  if (overlayType === "reveal") {
    // This is the "Magic Moment" logic
    // It uses the PREVIOUSLY assigned teamColor to decide the image
    if (teamColor === "red") overlayImageSrc = "/static/images/mafia.png";
    else if (teamColor === "blue") overlayImageSrc = "/static/images/fbi.png";
  } else if (overlayType === "fbi") {
    overlayImageSrc = "/static/images/fbi.png";
  } else if (overlayType === "mafia") {
    overlayImageSrc = "/static/images/mafia.png";
  }

  // Logic: Border appears as soon as teamColor is set (Event 1)
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    position: "relative",
    border: teamColor ? `10px solid ${teamColor === "blue" ? "#0051FF" : "#FF0000"}` : "none",
    boxSizing: "border-box",
  };

  return (
    <div style={containerStyle}>
      {/* Image only renders if overlayImageSrc is not empty (Event 2) */}
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
              top: "10px",
              right: "10px",
              width: "120px",
              height: "auto",
              filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.5))",
            }}
          />
        </div>
      )}

      {/* Navigation and Routing */}
      <nav
        style={{
          display: "flex",
          justifyContent: "left",
          marginBottom: "10px",
          position: "fixed",
          top: teamColor ? "10px" : "0",
          left: teamColor ? "10px" : "0",
          width: "25%",
          backgroundColor: "rgba(255,255,255,0.9)",
          zIndex: 10000,
          padding: "5px 10px",
          borderRadius: "0 0 10px 0",
        }}
      >
        <button style={{ margin: "0", color: "black", border: "1px solid #ccc" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Leaderboard
          </Link>
        </button>
      </nav>

      <div style={{ paddingTop: "50px" }}>
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
