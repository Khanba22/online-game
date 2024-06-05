import React, { useCallback, useContext } from "react";
import { RoomContext } from "../contexts/socketContext";

function JoinButton() {
  const {ws} = useContext(RoomContext);
  const joinRoom = useCallback(() => {
    ws.emit("create-room");
  },[ws])
  return (
    <div>
      <button onClick={joinRoom}>Create Room</button>
    </div>
  );
}

export default JoinButton;
