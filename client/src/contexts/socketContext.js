import Peer from "peerjs";
import { createContext, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIoClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { peerReducer } from "./peerReducer";
import { addPeerAction, removePeerAction } from "./peerActions";
import { useDispatch, useSelector } from "react-redux";
import { setPlayer } from "../redux/PlayerDataReducer";
import { rotatePlayer, setOtherPlayer } from "../redux/AllPlayerReducer";
import { setPlayerArray } from "../redux/GameConfig";
import { toast } from "react-toastify";
const WS = process.env.REACT_APP_BACKEND_HOST_URL || "http://localhost:4000";

export const RoomContext = createContext(null);
console.log("Connecting to WebSocket:", WS);
const ws = socketIoClient(WS, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

// Add connection debugging
ws.on('connect', () => {
  console.log('Socket connected successfully');
});

ws.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

ws.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});
export const RoomProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // States
  const [joined, setJoined] = useState(false);
  const [me, setMe] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [stream, setStream] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myPeerId, setMyPeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Selectors
  const myPlayerData = useSelector((state) => state.myPlayerData);
  const { username } = myPlayerData;
  const [peers, dispatched] = useReducer(peerReducer, {});

  // Refs
  const adminRef = useRef(false);
  const usernameRef = useRef(null);
  const peerInitialized = useRef(false);

  // Functions
  const handleSocketConnect = () => {
    console.log('Socket connected successfully');
    setIsConnected(true);
  };

  const handleSocketDisconnect = (reason) => {
    console.log('Socket disconnected:', reason);
    setIsConnected(false);
    setJoined(false);
  };

  const handleSocketError = (error) => {
    console.error('Socket connection error:', error);
    setIsConnected(false);
  };

  useEffect(() => {
    ws.on('connect', handleSocketConnect);
    ws.on('disconnect', handleSocketDisconnect);
    ws.on('connect_error', handleSocketError);

    return () => {
      ws.off('connect', handleSocketConnect);
      ws.off('disconnect', handleSocketDisconnect);
      ws.off('connect_error', handleSocketError);
    };
  }, []);

  useEffect(() => {
    const enterRoom = ({ roomId }) => {
      console.log('Room created, entering:', roomId);
      setRoomId(roomId);
      // Don't set joined=true here - let user enter name first
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
  const rotatePlayers = ({ username, rotation }) => {
    dispatch({
      type: `${rotatePlayer}`,
      payload: {
        username,
        rotation,
      },
    });
  };
  const getUsers = ({ roomId, memberNames }) => {
    console.log('🎮 [SOCKET CONTEXT] Received get-users event:', { roomId, memberNames });
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
          ...(memberNames[username] || {}),
        },
      },
    });
    
    // Add current user to peers list for video/audio (only if not already added)
    if (myPeerId && stream && username && !peers[myPeerId]) {
      console.log(`Adding self to peers: ${username}`);
      dispatched(addPeerAction(myPeerId, stream, username));
    }
    
    // Establish peer connections with existing users
    if (me && stream) {
      console.log('Establishing peer connections with existing users...');
      Object.keys(memberNames).forEach(existingUsername => {
        if (existingUsername !== username && memberNames[existingUsername].peerId) {
          console.log(`Connecting to existing user: ${existingUsername}`);
          const call = me.call(memberNames[existingUsername].peerId, stream, {
            metadata: {
              username: usernameRef.current || 'You',
            },
          });
          call.on("stream", (peerStream) => {
            console.log(`Got stream from existing user: ${existingUsername}`);
            dispatched(addPeerAction(memberNames[existingUsername].peerId, peerStream, existingUsername));
          });
          call.on("error", (error) => {
            console.error(`Call error with existing user ${existingUsername}:`, error);
          });
        }
      });
    }
  };
  const startGame = ({ roomId }) => {
    setRoomId(roomId);
    navigate(`/game/${roomId}`);
  };

  const handleVictory = ({ winner, roomId }) => {
    setTimeout(() => {
      navigate(`/victory/${roomId}/${winner}`);
    }, 7000);
  };

    ws.on("start-game", startGame);
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);
    ws.on("error", (err) => {
      alert(err);
    });
    ws.on("rotation", rotatePlayers);
    ws.on("game-over", handleVictory);
    ws.on("invalid-room", () => {
      console.error("The Room Code Is Invalid Or The Game has Already Started");
      toast.error("Invalid Room Code");
      navigate("/");
    });
    
    ws.on("join-room-error", (error) => {
      console.error("Error joining room:", error);
      toast.error(error.error || "Failed to join room");
      setJoined(false);
    });
    return () => {
      ws.off("start-game", startGame);
      ws.off("room-created", enterRoom);
      ws.off("get-users", getUsers);
      ws.off("user-disconnected", removePeer);
      ws.off("invalid-room");
      ws.off("join-room-error");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username,navigate,dispatch]);

  useEffect(() => {
    if (window.location.pathname.includes("/room") && !peerInitialized.current) {
      console.log('Initializing peer connection...');
      peerInitialized.current = true;
      
      const meId = uuidv4();
      setMyPeerId(meId);
      
      const peer = new Peer(meId, {
        host: 'localhost',
        port: 9000,
        path: '/myapp'
      });
      
      peer.on('open', (id) => {
        console.log('Peer connection opened with ID:', id);
        setMe(peer);
      });
      
      peer.on('error', (error) => {
        console.error('Peer connection error:', error);
        // Fallback to a simpler configuration
        const fallbackPeer = new Peer(meId);
        fallbackPeer.on('open', (id) => {
          console.log('Fallback peer connection opened with ID:', id);
          setMe(fallbackPeer);
        });
      });
      
      // Get user media
      navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      }).then((stream) => {
        console.log('Got user media stream');
        setStream(stream);
        // Don't add self to peers here - this will be handled when joining room
      }).catch((error) => {
        console.error('Error getting user media:', error);
        // Continue without audio if permission denied
        setStream(null);
      });
    }
    
    return () => {
      if (window.location.pathname.includes("/room")) {
        peerInitialized.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]); // Removed username and dispatched from dependencies

  useEffect(() => {
    if (username) {
      usernameRef.current = username;
    }
  });

  useEffect(() => {
    if (!me) return;

    const handleUserJoined = ({ peerId, username }) => {
      console.log(`User joined: ${username} with peerId: ${peerId}`);
      if (stream) {
        const call = me.call(peerId, stream, {
          metadata: {
            username: usernameRef.current || 'You',
          },
        });
        call.on("stream", (peerStream) => {
          console.log(`Got stream from ${username}`);
          dispatched(addPeerAction(peerId, peerStream, username));
        });
        call.on("error", (error) => {
          console.error(`Call error with ${username}:`, error);
        });
      }
    };

    const handleIncomingCall = (call) => {
      console.log(`Incoming call from ${call.metadata.username}`);
      const caller = call.metadata.username;
      if (stream) {
        call.answer(stream, { metadata: { username: usernameRef.current || 'You' } });
      }
      call.on("stream", (peerStream) => {
        console.log(`Got stream from incoming call: ${caller}`);
        dispatched(addPeerAction(call.peer, peerStream, caller));
      });
      call.on("error", (error) => {
        console.error(`Incoming call error from ${caller}:`, error);
      });
    };

    ws.on("user-joined", handleUserJoined);
    me.on("call", handleIncomingCall);

    return () => {
      ws.off("user-joined", handleUserJoined);
      me.off("call", handleIncomingCall);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, stream, dispatched, ws]);

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
        isConnected,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
