import React, { useCallback, useContext, useState } from "react";
import { RoomContext } from "../contexts/socketContext";
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate()
  const { ws } = useContext(RoomContext);
  const createRoom = useCallback(() => {
    ws.emit("create-room");
  }, [ws]);
  const [roomId,setRoomId] = useState("")
  const joinRoom = ()=>{
    navigate(`/room/${roomId}`);
  }

  return (
    <div className="h-screen w-screen bg-black">
      <div className="home-screen container justify-center flex items-center">
        <div className=" flex w-2/4 h-1/2 px-10 flex-col justify-evenly">
          <h1 className="text-slate-50 mb-10 text-center w-full cursor-pointer bg-transparent p-3 text-9xl from-red-700 foldit-bold">
            Heading
          </h1>
          <input
            className=" text-slate-50 my-4 text-center border-none rounded-3xl w-full cursor-pointer bg-transparent border-slate-200 border-y-yellow-200 p-3 text-5xl from-red-700 foldit-semibold"
            type="text"
            placeholder="Enter Room Code"
            value={roomId}
            onChange={(e)=>{
              setRoomId(e.target.value);
            }}
          />
          <button
            className="w-full outline-none my-4 border-none p-3 text-5xl foldit-semibold"
            onClick={joinRoom}
          >
            Join Room
          </button>
          <button
            style={{border:"1px solid #f78fb3"}}
            className="w-full outline-none my-4 border-none rounded-3xl hover:bg-[#6363630f] p-3 text-5xl foldit-semibold"
            onClick={createRoom}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
