// For the viewer; answering quesstions, seeing ranking, or viewing escape room progress
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SocketProvider } from "./utils";

import ViewerLeaderboard from "./components/viewer_leaderboard";
import ViewerQuestion from "./components/viewer_question";
import ViewerAnswered from "./components/viewer_answered";
import ViewerAnswer from "./components/viewer_answer";
import ViewerHostRater from "./components/viewer_host_rater";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Viewer loaded");
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log("#root element is present:", rootElement);
  } else {
    console.error("Error: #root element is missing!");
  }
  createRoot(document.getElementById("root")!).render(
    <SocketProvider>
      <Router>
        <nav
          style={{
            display: "flex",
            justifyContent: "left",
            marginBottom: "10px",
            position: "fixed",
            top: 0,
            width: "25%",
            backgroundColor: "white",
            zIndex: 10000,
            padding: "5px 0",
          }}
        >
          <button style={{ margin: "0 10px", color: "black" }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              Leaderboard
            </Link>
          </button>
          <button style={{ margin: "0 10px", color: "black" }}>
            <Link to="/hostrater" style={{ textDecoration: "none", color: "inherit" }}>
              Host Rater
            </Link>
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<ViewerLeaderboard />} />
          <Route path="/hostrater" element={<ViewerHostRater />} />
          <Route path="/viewer.html" element={<ViewerLeaderboard />} />
          <Route path="/question" element={<ViewerQuestion />} />
          <Route path="/answered" element={<ViewerAnswered />} />
          <Route path="/answer" element={<ViewerAnswer />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
});
