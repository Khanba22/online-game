import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
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
  const bulletArrRef = useRef(bulletArr);

  const [timeBuffer, setTimeBuffer] = useState(false);

  // Update bullet array ref on change
  useEffect(() => {
    bulletArrRef.current = bulletArr;
  }, [bulletArr]);

  // Update turn ref when turn changes
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  const handleClick = useCallback(
    (myself) => {
      const currentIntersectedObject = intersectedObjectRef.current;
      if (!isLocked.current) return;
      if (timeBuffer) return;
      setTimeBuffer(true);
      setTimeout(() => setTimeBuffer(false), 3000);
      
      // Safety switch: prevent shooting during countdown (removed - not essential for shooting logic)
      // if (isCountdownActive) {
      //   toast.warn("Round is starting, please wait...");
      //   return;
      // }
      
      // Check if it's the current player's turn
      if (playerTurn !== myData.username) {
        toast.warn("Not Your Turn Now");
        return;
      }
      if (!myself && currentIntersectedObject?.userData?.username) {
        console.log(`🎯 [CLIENT] Emitting shoot-player event:`, {
          shooter: myData.username,
          victim: currentIntersectedObject.userData.username,
          roomId
        });
        ws.emit("shoot-player", {
          shooter: myData.username,
          victim: currentIntersectedObject.userData.username,
          roomId,
        });
      } else {
        console.log(`🎯 [CLIENT] Emitting shoot-player event (self):`, {
          shooter: myData.username,
          victim: myData.username,
          roomId
        });
        ws.emit("shoot-player", {
          shooter: myData.username,
          victim: myData.username,
          roomId,
        });
      }

      if (bulletArrRef.current.length === 0) {
        toast.info("Round Over");
        setTimeout(() => toast.info("Starting Next Round"), 2000);
      }
    },
    [isLocked, myData.username, roomId, timeBuffer, ws, playerTurn]
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

    for (const intersect of intersects) {
      const intersected = intersect.object.parent;

      if (intersected.userData && intersected.userData.username) {
        foundValidIntersection = true;

        if (intersected !== intersectedObjectRef.current) {
          if (intersectedObjectRef.current?.material) {
            intersectedObjectRef.current.material.color.set(
              intersectedObjectRef.current.originalColor
            );
          }
          if (intersected.material) {
            intersected.originalColor = intersected.material.color.getHex();
            intersected.material.color.set("purple");
          }
          intersectedObjectRef.current = intersected;
        }
        break;
      }
    }

    if (!foundValidIntersection && intersectedObjectRef.current?.material) {
      intersectedObjectRef.current.material.color.set(
        intersectedObjectRef.current.originalColor
      );
      intersectedObjectRef.current = null;
    }
  });

  return null;
};

export default RaycasterComponent;
