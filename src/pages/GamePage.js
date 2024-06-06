import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import SettingsTab from "../components/SettingsTab";

const GamePage = () => {
  const { id } = useParams();
  const { ws, me, data, stream, peers, setName, name } = useContext(RoomContext);
  const { roomId, members, participants } = data;

  return (
    <>
      <SettingsTab />
    </>
  );
};

export default GamePage;
