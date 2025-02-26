import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoomContext } from "../../contexts/socketContext";
import { useEquipment } from "../../redux/PlayerDataReducer";
import { usePlayerEquipment } from "../../redux/AllPlayerReducer";
import "./EquipmentBar.css"; // Make sure to create and import the CSS file
import { toast } from "react-toastify";

const EquipmentBar = () => {
  const { ws, roomId } = useContext(RoomContext);
  const data = useSelector((state) => state.myPlayerData);
  const { bulletArr } = useSelector((state) => state.gameConfig);
  const { equipment, username } = data;
  const dispatch = useDispatch();
  return (
    <div className="equipment-bar">
      {equipment &&
        Object.keys(equipment).map((eq, i) => {
          return (
            <div key={eq} className="equipment-item">
              <button
                className="equipment-button"
                disabled={equipment[eq] === 0}
                onClick={() => {
                  console.log(eq)
                  if (eq === "looker") {
                    console.log("Looker Activated")
                    toast.info(`${bulletArr[bulletArr.length - 1]?"Bullet is Live":"Bullet is Fake"}`);
                  }
                  ws.emit("use-equipment", {
                    roomId,
                    equipmentType: eq,
                    player: username,
                  });
                  dispatch({
                    type: `${useEquipment}`,
                    payload: {
                      equipmentType: eq,
                    },
                  });
                  dispatch({
                    type: `${usePlayerEquipment}`,
                    payload: {
                      user: username,
                      equipmentType: eq,
                    },
                  });
                }}
              >
                <img src={`/assets/${eq}.png`} alt={eq} />
                <span className="equipment-count">{equipment[eq]}</span>
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default EquipmentBar;
