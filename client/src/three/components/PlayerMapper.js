import React, { Suspense } from "react";
import { Chair } from "./Chair";
import { PlayerFinal } from "./PlayerFinal";
import {  useSelector } from "react-redux";
import { GunHand } from "./GunHand";
import { Text, Billboard } from "@react-three/drei"; // Import Text and Billboard components

const PlayerMapper = ({ playerData, turn, camera, username }) => {
  const { playerTurn } = useSelector((state) => state.gameConfig);

  return (
    <Suspense fallback={null}>
      {playerData.map((player, i) => {
        const isMe = player.username === username;
        const isMyTurn = player.username === playerTurn;
        const labelPosition = [
          player.position[0],
          player.cameraOffset[1] + 0.1, // Adjust label position above the player's head
          player.position[2],
        ];

        const PlayerComponent = isMe && isMyTurn ? GunHand : PlayerFinal;

        return (
          <React.Fragment key={`playerGroup${i}`}>
            <PlayerComponent
              userData={player}
              camera={camera}
              isMe={isMe}
              isMyTurn={isMyTurn}
              {...player}
              rotation = {player.neckRotation}
            />
            <Chair userData={player} {...player} />
            <Billboard position={labelPosition}>
              <Text fontSize={0.15} color="white" anchorX="center" anchorY="middle">
                {player.username}
              </Text>
            </Billboard>
          </React.Fragment>
        );
      })}
    </Suspense>
  );
};

export default PlayerMapper;
