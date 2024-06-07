import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import SettingsTab from "../components/SettingsTab";
import MainCanvas from "../components/Canvas/MainCanvas";

const GamePage = () => {
  const { id } = useParams();
  const { ws, me, data, stream, peers, setName, name } =
    useContext(RoomContext);
  const { roomId, members, participants } = data;

  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  };

  return (
    <>
      <SettingsTab show={show} handleShow={handleShow} />

      <div className="h-screen w-screen">
        <MainCanvas setShow = {setShow} show={show} handleShow={handleShow} />
      </div>
    </>
  );
};

export default GamePage;
