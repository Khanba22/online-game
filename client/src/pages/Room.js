import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import AudioControls from "../components/AudioControls";
import { useDispatch, useSelector } from "react-redux";
import { setName, setPlayer } from "../redux/PlayerDataReducer";


const Room = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const { username } = data;
  const { id } = useParams();
  const { joined, setJoined, setIsAdmin, isAdmin, ws, me, roomId, isConnected } =
    useContext(RoomContext);
  
  // State to track if we've already attempted to join
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
  const startGame = () => {
    ws.emit("start-request", { roomId });
  };
  useEffect(() => {
    if (joined && Object.keys(playerData).length > 0) {
      setIsAdmin(Object.keys(playerData)[0] === data.username);
      dispatch({
        type: `${setPlayer}`,
        payload: { data: playerData[username] },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, username, playerData, dispatch]);
  // Function to handle room joining
  const handleJoinRoom = () => {
    if (me && username && isConnected && username.trim() !== '') {
      console.log(`Joining room ${id} with username ${username}`);
      ws.emit("join-room", { roomId: id, peerId: me._id, username });
      setJoined(true);
    }
  };

  // Disabled auto-join to prevent issues - user must click "Join Room" button
  // useEffect(() => {
  //   if (id && !joined && username && isConnected && username.trim() !== '' && !hasAttemptedJoin && me) {
  //     console.log(`Auto-joining existing room ${id} - user navigated directly`);
  //     handleJoinRoom();
  //   }
  // }, [id, joined, isConnected, username, hasAttemptedJoin, me]);

  return (
    <div className="h-full w-full min-h-screen bg-black ">
      <div className="home-screen flex justify-center bg-cover bg-no-repeat">
        {!isConnected ? (
          <div className="h-screen w-screen flex justify-center items-center">
            <div className="text-white text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl mb-4">Connecting to server...</h2>
              <p className="text-gray-400">Please wait while we establish the connection</p>
            </div>
          </div>
        ) : joined ? (
          <div className="container backdrop-blur-sm flex flex-col items-center justify-center h-3/4">
            <AudioControls />
            {isAdmin && (
              <button
                className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
                onClick={startGame}
              >
                Start Game
              </button>
            )}
          </div>
        ) : (
          <div className="h-screen w-screen flex justify-center items-center">
            <div className="h-1/2 w-1/2 p-6 rounded-lg flex  items-center flex-col shadow-lg">
              <label htmlFor="name" className="text-slate-50 mb-10 text-center w-full cursor-none bg-transparent p-3 text-7xl from-red-700 foldit-bold">
                Enter Your Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your Name..."
                className="text-slate-50 text-center border-none my-4 rounded-3xl w-1/2 cursor-pointer bg-transparent border-slate-200 border-y-yellow-200 p-3 text-3xl from-red-700 "
                value={username}
                onChange={(e) =>
                  dispatch({
                    type: `${setName}`,
                    payload: {
                      username: e.target.value,
                    },
                  })
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter" && username.trim() && me && isConnected) {
                    setHasAttemptedJoin(true);
                    handleJoinRoom();
                  }
                }}
                maxLength={20}
                minLength={1}
              />
              {username && username.trim().length < 1 && (
                <p className="text-red-400 text-sm mb-2">Name must be at least 1 character</p>
              )}
              <button
                className={`py-2 px-4 rounded-lg transition duration-300 ${
                  username.trim() 
                    ? 'bg-teal-500 hover:bg-teal-700 text-white' 
                    : 'bg-gray-600 cursor-not-allowed text-gray-400'
                }`}
                onClick={() => {
                  if (username.trim() && me && isConnected) {
                    console.log(`User clicked join room with username: ${username}`);
                    setHasAttemptedJoin(true);
                    handleJoinRoom();
                  }
                }}
                disabled={!username.trim() || !me || !isConnected}
              >
                Join Room
              </button>
              <p className="text-gray-400 text-sm mt-4 text-center">
                You must enter a name to join the room
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
