import React, { useContext, useEffect } from "react";
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
  const { joined, setJoined, setIsAdmin, isAdmin, ws, me, roomId } =
    useContext(RoomContext);
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
  useEffect(() => {
    if (me && joined) {
      ws.emit("join-room", { roomId: id, peerId: me._id, username });
    }
  }, [me, joined, ws, id, username]);

  return (
    <div className="h-full w-full min-h-screen bg-black ">
      <div className="home-screen flex justify-center bg-cover bg-no-repeat">
        {joined ? (
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
          <div className="bg-teal-100 p-6 rounded-lg shadow-lg">
            <label htmlFor="name" className="text-white font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="block w-full p-2 mb-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={username}
              onChange={(e) =>
                dispatch({
                  type: `${setName}`,
                  payload: {
                    username: e.target.value,
                  },
                })
              }
            />
            <button
              className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
              onClick={() => setJoined(true)}
            >
              Join Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
