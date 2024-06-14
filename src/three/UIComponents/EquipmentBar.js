import React from "react";
import { useSelector } from "react-redux";

const EquipmentBar = () => {
  const data = useSelector((state) => state.myPlayerData);
  const { equipment } = data;
  return (
    <div className="absolute h-14 w-2/5 bottom-8 left-0 right-0 m-auto flex justify-evenly items-center">
      {equipment &&
        Object.keys(equipment).map((eq) => {
          return (
            <>
              <div>
                {eq} - {equipment[eq]}
              </div>
            </>
          );
        })}
    </div>
  );
};

export default EquipmentBar;
