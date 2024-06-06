import Peer from "peerjs";
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIoClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { peerReducer } from "./peerReducer";
import { addPeerAction, removePeerAction } from "./peerActions";
const WS = "http://localhost:8080";

export const RoomContext = createContext(null);
const ws = socketIoClient(WS);

export const RoomProvider = ({ children }) => {
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const [me, setMe] = useState();
  const [peers, dispatch] = useReducer(peerReducer, {});
  const [data, setData] = useState({
    members: [],
    participants: [],
    roomId: "",
  });
  const [name, setName] = useState("");
  const [stream, setStream] = useState(null);
  const enterRoom = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };

  const removePeer = ({ peerId, members }) => {
    setData({ ...data, members: members });
    dispatch(removePeerAction(peerId));
  };

  const getUsers = ({ roomId, participants, memberNames }) => {
    setData({ ...data, roomId, participants, members: memberNames });
  };

  const startGame = ({ roomId }) => {
    navigate(`/game/${roomId}`);
  };

  useEffect(() => {
    const meId = uuidv4();
    const peer = new Peer(meId);
    setMe(peer);
    try {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          setStream(stream);
        });
    } catch (error) {
      console.error(error);
    }
    ws.on("start-game", startGame);
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);
    ws.on("invalid-room", () => {
      alert("The Room Code Is Invalid Or The Game has Already Started");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!me) return;
    if (!stream) return;

    ws.on("user-joined", ({ peerId }) => {
      const call = me.call(peerId, stream);
      call.on("stream", (peerStream) => {
        dispatch(addPeerAction(peerId, peerStream));
      });
    });

    me.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (peerStream) => {
        dispatch(addPeerAction(call.peer, peerStream));
      });
    });
  }, [me, stream]);

  return (
    <RoomContext.Provider
      value={{ ws, me, data, stream, peers, name, setName, joined, setJoined }}
    >
      {children}
    </RoomContext.Provider>
  );
};
