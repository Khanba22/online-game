import React from "react";
import EquipmentBar from "../UIComponents/EquipmentBar";
import Stats from "../UIComponents/Stats";
import SettingsTab from "../../components/SettingsTab"

const GameUI = ({turn,lives,round,playerTurn}) => {
  return (
    <>
      <SettingsTab/>
      <EquipmentBar />
      <Stats turn={turn} lives={lives} playerTurn = {playerTurn}  round={round} />
    </>
  );
};

export default GameUI;
