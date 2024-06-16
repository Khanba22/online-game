import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { Bounce, toast } from "react-toastify";

const RaycasterComponent = ({ camera }) => {
  const { scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const raycaster = useRef(new Raycaster());
  const direction = new Vector3();
  const config = useSelector((state) => state.gameConfig);
  const myData = useSelector((state) => state.myPlayerData);
  const { turn, players } = config;
  const turnRef = useRef(turn);
  const intersectedObjectRef = useRef(null);

  const handleClick = () => {
    const currentIntersectedObject = intersectedObjectRef.current;
    console.log(currentIntersectedObject);
    if (currentIntersectedObject && currentIntersectedObject.userData && turnRef.current) {
      console.log(currentIntersectedObject.userData);
      ws.emit("shoot-player", {
        shooter: myData.username,
        victim: currentIntersectedObject.userData.username,
        roomId,
      });
    }
    if (!turnRef.current) {
      toast.warn("Not Your Turn Now")
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useFrame(() => {
    camera.getWorldDirection(direction);
    turnRef.current = players.indexOf(myData.username) === turn;
    raycaster.current.set(camera.position, direction);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected !== intersectedObjectRef.current) {
        if (intersectedObjectRef.current) {
          intersectedObjectRef.current.material.color.set(
            intersectedObjectRef.current.originalColor
          );
        }
        intersected.originalColor = intersected.material.color.getHex();
        intersected.material.color.set(0xffff00);
        intersectedObjectRef.current = intersected;
      }
    } else {
      // Reset the color of the previously intersected object
      if (intersectedObjectRef.current) {
        intersectedObjectRef.current.material.color.set(
          intersectedObjectRef.current.originalColor
        );
        intersectedObjectRef.current = null;
      }
    }
  });

  return null;
};

export default RaycasterComponent;
