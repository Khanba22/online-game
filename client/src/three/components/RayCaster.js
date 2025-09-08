import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3, Color } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { toast } from "react-toastify";

const RaycasterComponent = ({ camera, isLocked }) => {
  const { scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const raycaster = useRef(new Raycaster());
  const direction = new Vector3();
  const config = useSelector((state) => state.gameConfig);
  const myData = useSelector((state) => state.myPlayerData);
  const { turn, players, bulletArr, playerTurn } = config;
  
  const turnRef = useRef(turn);
  const intersectedObjectRef = useRef(null);
  const rightMouseDown = useRef(false);
  const bulletArrRef = useRef(bulletArr || []);

  const [timeBuffer, setTimeBuffer] = useState(false);
  const [targetedPlayer, setTargetedPlayer] = useState(null);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetPosition, setTargetPosition] = useState(null);

  // Update bullet array ref on change
  useEffect(() => {
    bulletArrRef.current = bulletArr || [];
  }, [bulletArr]);

  // Update turn ref when turn changes
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  const handleClick = useCallback(
    (myself) => {
      if (!isLocked.current) return;
      if (timeBuffer) return;
      
      // Check if it's the current player's turn
      console.log(`🎯 [TURN CHECK] playerTurn: "${playerTurn}", myData.username: "${myData.username}"`);
      if (playerTurn !== myData.username) {
        console.log(`❌ [TURN CHECK] Not your turn! Expected: ${playerTurn}, Got: ${myData.username}`);
        toast.warn("Not Your Turn Now");
        return;
      }
      
      // Only shoot if actively targeting a player
      if (!isTargeting || !targetedPlayer) {
        console.log(`❌ [TARGET CHECK] Not targeting anyone! isTargeting: ${isTargeting}, targetedPlayer: ${targetedPlayer}`);
        toast.warn("Aim at a player to shoot!");
        return;
      }
      
      setTimeBuffer(true);
      setTimeout(() => setTimeBuffer(false), 3000);
      
      // Debug bullet array state
      console.log(`🎯 [SHOOT DEBUG] bulletArrRef.current:`, bulletArrRef.current);
      console.log(`🎯 [SHOOT DEBUG] bulletArr from config:`, bulletArr);
      
      const normalizedRoomId = roomId?.toLowerCase();
      
      if (!myself && targetedPlayer) {
        console.log(`🎯 [CLIENT] Emitting shoot-player event:`, {
          shooter: myData.username,
          victim: targetedPlayer,
          roomId: normalizedRoomId
        });
        ws.emit("shoot-player", {
          shooter: myData.username,
          victim: targetedPlayer,
          roomId: normalizedRoomId,
        });
      } else {
        console.log(`🎯 [CLIENT] Emitting shoot-player event (self):`, {
          shooter: myData.username,
          victim: myData.username,
          roomId: normalizedRoomId
        });
        ws.emit("shoot-player", {
          shooter: myData.username,
          victim: myData.username,
          roomId: normalizedRoomId,
        });
      }

      // Clear targeting after shooting
      setTargetedPlayer(null);
      setIsTargeting(false);
      setTargetPosition(null);

      if (bulletArrRef.current && bulletArrRef.current.length === 0) {
        toast.info("Round Over");
        setTimeout(() => toast.info("Starting Next Round"), 2000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLocked, myData.username, roomId, timeBuffer, ws, playerTurn, isTargeting, targetedPlayer]
  );

  useEffect(() => {
    const onMouseDown = (event) => {
      if (event.button === 2) rightMouseDown.current = true;
      if (event.button === 0) handleClick(rightMouseDown.current);
    };

    const onMouseUp = (event) => {
      if (event.button === 2) rightMouseDown.current = false;
    };

    const onContextMenu = (event) => {
      if (rightMouseDown.current) event.preventDefault();
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  }, [handleClick]);

  useFrame(() => {
    camera.getWorldDirection(direction);
    turnRef.current = players.indexOf(myData.username) === turn;

    raycaster.current.set(camera.position, direction);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let foundValidIntersection = false;
    // let currentTarget = null;

    for (const intersect of intersects) {
      const intersected = intersect.object.parent;

      if (intersected.userData && intersected.userData.username) {
        foundValidIntersection = true;
        // currentTarget = intersected.userData.username;
        console.log(`🎯 [TARGET] Found valid intersection with ${intersected.userData.username}`);

        // Update targeting state
        if (intersected.userData.username !== targetedPlayer) {
          setTargetedPlayer(intersected.userData.username);
          setIsTargeting(true);
          
          // Extract target position from the intersected object
          const worldPosition = new Vector3();
          intersected.getWorldPosition(worldPosition);
          const targetPos = [worldPosition.x, 2.6, worldPosition.z]; // Y = 2.6 for head level
          console.log(`🎯 [TARGET] Targeting ${intersected.userData.username} at position:`, targetPos);
          setTargetPosition(targetPos);
        }

        // Handle highlighting
        if (intersected !== intersectedObjectRef.current) {
          // Reset previous highlight
          if (intersectedObjectRef.current?.material) {
            intersectedObjectRef.current.material.color.set(
              intersectedObjectRef.current.originalColor
            );
          }
          // Apply new highlight
          if (intersected.material) {
            intersected.originalColor = intersected.material.color.getHex();
            intersected.material.color.set(new Color(1, 0, 0)); // Red highlight for targeting
          }
          intersectedObjectRef.current = intersected;
        }
        break;
      }
    }

    // Clear targeting if not intersecting with any player
    if (!foundValidIntersection) {
      if (targetedPlayer) {
        setTargetedPlayer(null);
        setIsTargeting(false);
        setTargetPosition(null);
      }
      
      // Reset highlight
      if (intersectedObjectRef.current?.material) {
        intersectedObjectRef.current.material.color.set(
          intersectedObjectRef.current.originalColor
        );
        intersectedObjectRef.current = null;
      }
    }
  });

  return (
    <>
      {/* Red triangle indicator for targeted player */}
      {isTargeting && targetedPlayer && targetPosition && (
        <mesh position={[targetPosition[0], targetPosition[1] - 0.3, targetPosition[2]]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.15, 0.3, 2]} />
          <meshBasicMaterial color="red" transparent opacity={0.8} />
        </mesh>
      )}
    </>
  );
};

export default RaycasterComponent;
