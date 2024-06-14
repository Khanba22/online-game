import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoomContext } from "../../contexts/socketContext";
import { useEquipment } from "../../redux/PlayerDataReducer";
import { usePlayerEquipment } from "../../redux/AllPlayerReducer";

const EquipmentBar = () => {
  const { ws, roomId } = useContext(RoomContext);
  const data = useSelector((state) => state.myPlayerData);
  const { equipment, username } = data;
  const dispatch = useDispatch();

  return (
    <div className="absolute h-14 w-2/5 bottom-8 left-0 right-0 m-auto flex justify-evenly items-center">
      {equipment &&
        Object.keys(equipment).map((eq) => {
          return (
            <>
              <div className="z-40">
                <button
                  className="z-40 cursor-pointer"
                  onClick={() => {
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
                  {eq}
                </button>
                {equipment[eq]}
              </div>
            </>
          );
        })}
    </div>
  );
};

export default EquipmentBar;
