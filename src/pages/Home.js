import React, { useEffect } from "react";
import JoinButton from "../components/JoinButton";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, useEquipment } from "../redux/PlayerDataReducer";

const Home = () => {
  const myPlayerData = useSelector((state) => state.myPlayerData);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: `${addEquipment}`,
      payload: {
        equipment: {
          heals: 2,
          doubleDamage: 1,
        },
      },
    });
  }, []);

  return (
    <div>
      <JoinButton />
      <button
        onClick={() => {
          console.log("MyData", myPlayerData);
          dispatch({
            type: `${useEquipment}`,
            payload: {
              equipmentType: "doubleDamage",
            },
          });
        }}
      >
        {" "}
        Log DATA
      </button>
    </div>
  );
};

export default Home;
