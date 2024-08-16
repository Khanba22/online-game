import Peer from "peerjs";
import { createContext, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIoClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { peerReducer } from "./peerReducer";
import { addPeerAction, removePeerAction } from "./peerActions";
import { useDispatch, useSelector } from "react-redux";
import { setPlayer } from "../redux/PlayerDataReducer";
import { setOtherPlayer } from "../redux/AllPlayerReducer";
import { setPlayerArray } from "../redux/GameConfig";
import { toast } from "react-toastify";
const WS = "http://localhost:8080";

export const RoomContext = createContext(null);
const ws = socketIoClient(WS);
export const RoomProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // States
  const [joined, setJoined] = useState(false);
  const [me, setMe] = useState();
  const [roomId, setRoomId] = useState("");
  const [stream, setStream] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myPeerId, setMyPeerId] = useState("");

  // Selectors
  const myPlayerData = useSelector((state) => state.myPlayerData);
  const { username } = myPlayerData;
  const [peers, dispatched] = useReducer(peerReducer, {});

  // Refs
  const adminRef = useRef(false);
  const usernameRef = useRef(null);

  // Functions
  const enterRoom = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };
  const removePeer = ({ peerId, members, username }) => {
    dispatched(removePeerAction(peerId));
    toast.error(`${username} Left The Game`);
    dispatch({
      type: `${setOtherPlayer}`,
      payload: {
        data: members,
      },
    });
  };
  const getUsers = ({ roomId, memberNames }) => {
    setRoomId(roomId);
    dispatch({
      type: `${setOtherPlayer}`,
      payload: {
        data: memberNames,
      },
    });
    const playerArr = Object.keys(memberNames).map((memberName) =>
      memberName.toString()
    );
    dispatch({
      type: `${setPlayerArray}`,
      payload: {
        players: playerArr,
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

  // useEffects
  useEffect(() => {
    ws.on("start-game", startGame);
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);
    ws.on("invalid-room", () => {
      console.error("The Room Code Is Invalid Or The Game has Already Started");
      toast.error("Invalid Room Code");
      navigate("/");
    });
    return () => {
      ws.off("start-game", startGame);
      ws.off("room-created", enterRoom);
      ws.off("get-users", getUsers);
      ws.off("user-disconnected", removePeer);
      ws.off("invalid-room", () => {
        console.error(
          "The Room Code Is Invalid Or The Game has Already Started"
        );
        toast.error("Invalid Room Code");
        navigate("/");
      });
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname.includes("/room")) {
      const meId = uuidv4();
      setMyPeerId(meId);
      const peer = new Peer(meId);
      setMe(peer);
      if (!peer) {
        alert("Peer Connection Failed");
        return;
      }
      try {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          setStream(stream);
          dispatched(addPeerAction(meId, stream));
        });
      } catch (error) {
        console.error(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]);

  useEffect(() => {
    if (username) {
      usernameRef.current = username;
    }
  });

  useEffect(() => {
    if (!me) return;
    if (!stream) return;

    ws.on("user-joined", ({ peerId, username }) => {
      const call = me.call(peerId, stream, {
        metadata: {
          username: usernameRef.current,
        },
      });
      call.on("stream", (peerStream) => {
        dispatched(addPeerAction(peerId, peerStream, username));
      });
    });

    me.on("call", (call) => {
      const caller = call.metadata.username;
      call.answer(stream, { metadata: { username } });
      call.on("stream", (peerStream) => {
        dispatched(addPeerAction(call.peer, peerStream, caller));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, stream]);

  return (
    <RoomContext.Provider
      value={{
        adminRef,
        usernameRef,
        ws,
        me,
        roomId,
        myPeerId,
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
