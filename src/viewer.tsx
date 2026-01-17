import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { SocketProvider, SocketContext, userState } from "./utils";
import { useContext, useEffect, useState } from "react";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";

function ViewerApp() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const location = useLocation();

  // State Initialization
  const [teamColor, setTeamColor] = useState<string>(
    () => localStorage.getItem("team_color") || ""
  );
  const [username] = useState<string>(() => localStorage.getItem("username") || "");
  const [overlayType, setOverlayType] = useState<string>("none");

  useEffect(() => {
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
        setTeamColor(assignedColor);
        localStorage.setItem("team_color", assignedColor);
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

  // Image Path Logic
  let overlayImageSrc = "";
  if (overlayType === "reveal") {
    if (teamColor === "red") overlayImageSrc = "/mafia.png";
    else if (teamColor === "blue") overlayImageSrc = "/fbi.png";
  } else if (overlayType === "fbi") {
    overlayImageSrc = "/fbi.png";
  } else if (overlayType === "mafia") {
    overlayImageSrc = "/mafia.png";
  }

  // Page Check Logic
  const isMainPage = location.pathname === "/" || location.pathname === "/viewer.html";

  const navBackgroundColor =
    teamColor === "red" ? "#FF0000" : teamColor === "blue" ? "#0051FF" : "white";
  const navTextColor = teamColor ? "white" : "black";

  return (
    <div style={{ minHeight: "100vh", position: "relative", boxSizing: "border-box" }}>
      {/* Header Nav bar */}
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
            // Ensure the nav is tall enough to fit the image nicely
            minHeight: "50px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Leaderboard Button (Absolute Left) */}
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

          {/* Username (Centered by flex) */}
          <span style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{username}</span>

          {/* --- OVERLAY IMAGE (Absolute Right INSIDE Nav) --- */}
          {isMainPage && overlayImageSrc && (
            <img
              src={overlayImageSrc}
              alt="Affiliation Overlay"
              style={{
                position: "absolute",
                right: "15px",
                // Center vertically within the header
                top: "50%",
                transform: "translateY(-50%)",
                // Sizing to fit header
                maxHeight: "80%",
                width: "auto",
                maxWidth: "60px",
                pointerEvents: "none",
                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </nav>
      )}

      {/* Main Content container with padding for fixed header */}
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
