import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Raycaster, Vector3 } from "three";
import { RoomContext } from "../../contexts/socketContext";
import { Bounce, toast } from "react-toastify";

const RaycasterComponent = ({ camera, turn }) => {
  const { scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const raycaster = useRef(new Raycaster());
  const direction = new Vector3();
  const [intersectedObject, setIntersectedObject] = useState(null);
  const data = useSelector((state) => state.myPlayerData);
  const allPlayerData = useSelector((state) => state.otherPlayerData);
  const handleClick = () => {
    
  };
  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    // Update the direction vector to the camera's current direction
    camera.getWorldDirection(direction);

    // Set the raycaster from the camera position in the direction it is looking
    raycaster.current.set(camera.position, direction);

    // Find intersected objects
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;

      // Change the color of the intersected object to yellow
      if (intersected !== intersectedObject) {
        if (intersectedObject) {
          intersectedObject.material.color.set(intersectedObject.originalColor);
        }
        intersected.originalColor = intersected.material.color.getHex();
        intersected.material.color.set(0xffff00);
        setIntersectedObject(intersected);
      }
    } else {
      // Reset the color of the previously intersected object
      if (intersectedObject) {
        intersectedObject.material.color.set(intersectedObject.originalColor);
        setIntersectedObject(null);
      }
    }
  });

  return null;
};

export default RaycasterComponent;
