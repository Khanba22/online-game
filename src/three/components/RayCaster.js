import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { toast } from "react-toastify";
import * as THREE from "three";

const RaycasterComponent = ({ camera, isLocked }) => {
  const { scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const raycaster = useRef(new Raycaster());
  const direction = new Vector3();
  const config = useSelector((state) => state.gameConfig);
  const myData = useSelector((state) => state.myPlayerData);
  const { turn, players, bulletArr } = config;
  const turnRef = useRef(turn);
  const intersectedObjectRef = useRef(null);

  const bulletArrRef = useRef(bulletArr);

  useEffect(() => {
    bulletArrRef.current = bulletArr;
    console.log(bulletArr)
  }, [bulletArr]);

  useEffect(() => {
    
  }, [isLocked]);

  const handleClick = () => {
    if (!isLocked.current) {
      return;
    }
    const currentIntersectedObject = intersectedObjectRef.current;
    if (!turnRef.current) {
      toast.warn("Not Your Turn Now");
      return;
    }
    if (bulletArrRef.current.length === 0) {
      toast.info("Round Over");
      setTimeout(() => {
        toast.info("Starting Next Round");
      }, 2000);
      return;
    }
    if (currentIntersectedObject?.userData?.username) {
      console.log("Shot Player", bulletArrRef.current.length);
      ws.emit("shoot-player", {
        shooter: myData.username,
        victim: currentIntersectedObject.userData.username,
        roomId,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    camera.getWorldDirection(direction);
    turnRef.current = players.indexOf(myData.username) === turn;
    raycaster.current.set(camera.position, direction);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let foundValidIntersection = false;
    for (let i = 0; i < intersects.length; i++) {
      const intersected = intersects[i].object;
      if (intersected.userData && intersected.userData.username) {
        foundValidIntersection = true;
        if (intersected !== intersectedObjectRef.current) {
          if (intersectedObjectRef.current) {
            intersectedObjectRef.current.material.color.set(
              intersectedObjectRef.current.originalColor
            );
          }
          intersected.originalColor = intersected.material.color.getHex();
          intersected.material.color.set("purple");
          intersectedObjectRef.current = intersected;
        }
        break;
      }
    }

    if (!foundValidIntersection && intersectedObjectRef.current) {
      intersectedObjectRef.current.material.color.set(
        intersectedObjectRef.current.originalColor
      );
      intersectedObjectRef.current = null;
    }
  });

  return null;
};

export default RaycasterComponent;
