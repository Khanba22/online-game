import React from "react";
import EquipmentBar from "../UIComponents/EquipmentBar";
import Stats from "../UIComponents/Stats";

const GameUI = ({turn,lives,round,playerTurn}) => {
  return (
    <>
      <EquipmentBar />
      <Stats turn={turn} lives={lives} playerTurn = {playerTurn}  round={round} />
    </>
  );
};

export default GameUI;
