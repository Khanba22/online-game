import Peer from "peerjs";
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIoClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { peerReducer } from "./peerReducer";
import { addPeerAction, removePeerAction } from "./peerActions";
import { useDispatch, useSelector } from "react-redux";
import { setPlayer } from "../redux/PlayerDataReducer";
import { setOtherPlayer } from "../redux/AllPlayerReducer";
const WS = "http://localhost:8080";

export const RoomContext = createContext(null);
const ws = socketIoClient(WS);
export const RoomProvider = ({ children }) => {
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const [me, setMe] = useState();
  const myPlayerData = useSelector((state) => state.myPlayerData);
  const { username } = myPlayerData;
  const dispatch = useDispatch();
  const [peers, dispatched] = useReducer(peerReducer, {});
  const [roomId, setRoomId] = useState("");
  const [stream, setStream] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const enterRoom = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };

  const removePeer = ({ peerId }) => {
    setRoomId(roomId);
    dispatched(removePeerAction(peerId));
  };

  const getUsers = ({ roomId, memberNames }) => {
    setRoomId(roomId);
    dispatch({
      type: `${setOtherPlayer}`,
      payload: {
        data: memberNames,
      },
    });
    dispatch({
      type: `${setPlayer}`,
      payload: {
        data: {
          ...memberNames[username],
        },
      },
    });
  };

  const startGame = ({ roomId }) => {
    setRoomId(roomId);
    navigate(`/game/${roomId}`);
  };

  useEffect(() => {
    const meId = uuidv4();
    const peer = new Peer(meId);
    setMe(peer);
    if (!peer) {
      alert("Peer Connection Failed");
      return;
    }
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
      console.error("The Room Code Is Invalid Or The Game has Already Started");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!me) return;
    if (!stream) return;

    ws.on("user-joined", ({ peerId }) => {
      const call = me.call(peerId, stream);
      call.on("stream", (peerStream) => {
        dispatched(addPeerAction(peerId, peerStream));
      });
    });

    me.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (peerStream) => {
        dispatched(addPeerAction(call.peer, peerStream));
      });
    });
  }, [me, stream]);

  return (
    <RoomContext.Provider
      value={{
        ws,
        me,
        roomId,
        setRoomId,
        stream,
        peers,
        joined,
        setJoined,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
