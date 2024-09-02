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
              />
              <button
                className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
                onClick={() => setJoined(true)}
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
