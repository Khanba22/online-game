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
          {members.map((participant) => {
            return <p>{participant}</p>;
          })}
          <VideoPlayer stream={stream} />
          {
            Object.values(peers).map((peer) => {
                return <VideoPlayer stream={peer.stream} />

            })
          }
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
