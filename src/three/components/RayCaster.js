import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { toast } from "react-toastify";
import * as THREE from "three";

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
  const soundRef = useRef(null);

  useEffect(() => {
    // Initialize the audio loader and sound
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/sounds/gun_audio.mp3", (buffer) => {
      sound.setBuffer(buffer);
      sound.setVolume(1);
    });
    soundRef.current = sound;

    return () => {
      camera.remove(listener);
    };
  }, [camera]);

  const handleClick = () => {
    const currentIntersectedObject = intersectedObjectRef.current;
    if (!turnRef.current) {
      toast.warn("Not Your Turn Now");
      return;
    }
    if (currentIntersectedObject?.userData?.username) {
      ws.emit("shoot-player", {
        shooter: myData.username,
        victim: currentIntersectedObject.userData.username,
        roomId,
      });
      soundRef.current.play();
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
