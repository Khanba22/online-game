import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const Room = () => {
  const { id } = useParams();
  const { ws, me, members, roomId, stream , peers } =
    useContext(RoomContext);
  const [name, setName] = useState();
  const [joined, setJoined] = useState(false);
  useEffect(() => {
    if (me && joined) {
      ws.emit("join-room", { roomId: id, peerId: me._id, name });
    }
  }, [id, me, ws, joined, name]);
  return (
    <>
      {joined ? (
        <>
          <h2>Room Id {roomId}</h2>
          {members.map((participant,index) => {
            if (index === 0) {
              return <p>{participant} - Admin</p>;
            }else{
              return <p>{participant}</p>;
            }
          })}
          <VideoPlayer isAdmin = {members[0] === name} stream={stream} name={name} />
          {
            Object.values(peers).map((peer,i) => {
                return <VideoPlayer isAdmin={false} name = {members[0] !== name?members[i]:members[i+1]} stream={peer.stream} />

            })
          }
          {members[0] === name? <button>Start Game</button>:<></>}
        </>
      ) : (
        <>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <button
            onClick={() => {
              setJoined(true);
            }}
          >
            Join room
          </button>
        </>
      )}
    </>
  );
};

export default Room;
