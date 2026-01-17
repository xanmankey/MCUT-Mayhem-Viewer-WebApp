import { useEffect, useState, useContext } from "react";
import { BACKEND } from "../utils.tsx";
import { Player } from "../interfaces/Player.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { userState, setUsername } from "../utils.tsx";

function ViewerLeaderboard() {
  // Socket context is no longer needed here for navigation listeners!
  // The Parent (ViewerApp) handles the "game state" navigation.

  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warning, setWarning] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Fetch the current leaderboard
    fetch(BACKEND + "/leaderboard")
      .then((response) => response.json())
      .then((data) => {
        setLeaderboard(data.leaderboard);
      });
  }, []);

  const filteredLeaderboard = leaderboard.filter((player) =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return userState.username != "" ? (
    <div>
      {/* Note: The Top Nav is now handled by ViewerApp, but the Search/List is here */}
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
        <div className="overflow-y-auto w-64 h-3/4">
          {" "}
          {/* Added height constraint */}
          {filteredLeaderboard.map((player, index) => (
            <div
              key={player.username}
              className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between w-full"
            >
              <p className="font-bold text-black relative z-10" id={player.username}>
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
      <p className="text-4xl font-bold py-2 text-center">Join the Game</p>
      {warning && (
        <p className="text-2xl font-bold py-2 text-red-600" id="warning">
          {warning}
        </p>
      )}
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
                // Refresh to trigger the App-level check_answered logic
                navigate(0);
              } else {
                const errorData = await response.json();
                setWarning(errorData.message || response.statusText);
              }
            })
            .catch((err) => {
              setWarning("Error sending data to backend");
            });
        }}
        className="w-64"
      >
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Enter a UNIQUE username"
          className="w-full px-4 py-2 mb-4 rounded-full border border-gray-300 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-full"
          id="login"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ViewerLeaderboard;
