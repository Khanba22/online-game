import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { Bounce, toast } from "react-toastify";
const RaycasterComponent = ({ camera, sound, audioLoader }) => {
  const { scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const raycaster = useRef(new Raycaster());
  const direction = new Vector3();
  const config = useSelector((state) => state.gameConfig);
  const myData = useSelector((state) => state.myPlayerData);
  const { turn, players } = config;
  const turnRef = useRef(turn);
  const intersectedObjectRef = useRef(null);
  const temp = useRef(false);

  const handleClick = () => {
    const currentIntersectedObject = intersectedObjectRef.current;
    const soundUrl = temp.current ? "sounds/gun_audio.mp3" : "sounds/player_death.mp3";
    console.log(soundUrl);
    audioLoader.load(soundUrl, function (buffer) {
      sound.setBuffer(buffer);
      sound.setVolume(1);
      sound.stop();
      sound.play();
    });

    temp.current = !temp.current;
    try {
      console.log(currentIntersectedObject.userData);
    } catch (err) {}
    if (!turnRef.current) {
      toast.warn("Not Your Turn Now");
      return;
    }
    if (
      currentIntersectedObject?.userData?.lives &&
      currentIntersectedObject.userData.lives <= 0
    ) {
      toast.warn("Cant Shoot A Dead Person");
      return;
    }
    if (
      currentIntersectedObject?.userData &&
      currentIntersectedObject.userData &&
      turnRef.current
    ) {
      console.log(currentIntersectedObject.userData);

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
  }, []);

  useFrame(() => {
    camera.getWorldDirection(direction);
    turnRef.current = players.indexOf(myData.username) === turn;
    raycaster.current.set(camera.position, direction);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    if (!intersects.userData) {
      return;
    }
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
