import React, { useContext, useEffect, useState } from "react";
import { RoomContext } from "../../contexts/socketContext";

const EquipmentBar = ({ equipment }) => {
  const { myData, setMyData } = useContext(RoomContext);

  return (
    <div className="absolute h-14 w-2/5 bottom-8 left-0 right-0 m-auto flex justify-evenly items-center">
      {myData.equipment &&
        Object.keys(myData.equipment).map((equipmentItem) => {
          return (
            <div className="h-14 aspect-square bg-slate-200 cursor-pointer border border-red-400 flex justify-center items-center">
              {equipmentItem}
            </div>
          );
        })}
    </div>
  );
};

export default EquipmentBar;
