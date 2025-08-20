import { useEffect, useState, useContext } from "react";
import { BACKEND } from "../utils.tsx";

// import { socket } from "../utils.tsx";
import { SocketContext } from "../utils.tsx";
import { Player } from "../interfaces/Player.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { userState, setUsername } from "../utils.tsx";

// addUser(); // Add user to database; will be replaced with Twitch API

function ViewerLeaderboard() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warning, setWarning] = useState("");
  const location = useLocation();

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
    // Fetch the current leaderboard for the viewer, highlighting the player; TODO pass username
    fetch(BACKEND + "/leaderboard")
      .then((response) => response.json())
      .then((data) => {
        setLeaderboard(data.leaderboard);
      });
  }, []);

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

  const filteredLeaderboard = leaderboard.filter((player) =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return userState.username != "" ? (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          position: "fixed",
          top: 0,
          width: "100%",
          backgroundColor: "white",
          zIndex: 1000,
          padding: "10px 0",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "black" }}>
          {userState.username}
        </h1>
      </nav>
      <div
        className="flex flex-col items-center justify-center h-screen w-screen"
        key={location.key}
      >
        <input
          type="text"
          placeholder="Search by username"
          className="w-64 px-4 py-2 mb-4 rounded-full border border-gray-300 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="overflow-y-auto w-64">
          {filteredLeaderboard.map((player, index) => (
            <div
              key={player.username}
              className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between w-full"
            >
              <p className="font-bold text-black relative z-10">
                {index + 1}. {player.username}
              </p>
              <p className="font-bold text-black relative z-10">{player.score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen w-screen" key={location.key}>
      <p className="text-4xl font-bold py-2">Your first question</p>
      {warning && <p className="text-2xl font-bold py-2 text-red-600">{warning}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const username = formData.get("username") as string;

          fetch(BACKEND + "/create_player", {
            method: "POST",
            body: formData,
          })
            .then(async (response) => {
              if (response.ok) {
                console.log("User account created successfully");
                setUsername(username);
                navigate("/");
                // Technically, shouldn't need to refresh the page, but doing it anyway
                navigate(0);
              } else {
                // Handle error response
                const errorData = await response.json();
                setWarning(errorData.message || response.statusText);
                console.error("Error creating user account:", response.statusText);
              }
            })
            .catch((err) => {
              setWarning("Error sending data to backend");
              console.error("Error sending data to backend:", err);
            });
        }}
        className="w-64"
      >
        <input
          type="text"
          name="username"
          placeholder="Enter a UNIQUE username"
          className="w-full px-4 py-2 mb-4 rounded-full border border-gray-300 focus:outline-none"
        />
        <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-full">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ViewerLeaderboard;
