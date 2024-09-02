import React, { Suspense, useContext, useEffect } from "react";
import { Chair } from "./Chair";
import { PlayerFinal } from "./PlayerFinal";
import { useDispatch, useSelector } from "react-redux";
import { GunHand } from "./GunHand";
import { Text, Billboard } from "@react-three/drei"; // Import Text and Billboard components
import { RoomContext } from "../../contexts/socketContext";

const PlayerMapper = ({ playerData, turn, camera, username }) => {
  const { playerTurn } = useSelector((state) => state.gameConfig);
  const { ws } = useContext(RoomContext);
  const dispatch = useDispatch();
  

  return (
    <Suspense fallback={null}>
      {playerData.map((player, i) => {
        const isMe = player.username === username;
        const isMyTurn = player.username === playerTurn;
        const labelPosition = [
          player.position[0],
          player.cameraOffset[1] + 0.1, // Add 0.5 to the Y-axis coordinate
          player.position[2],
        ];

        return (
          <React.Fragment key={`playerGroup${i}`}>
            {isMyTurn && isMe ? (
              <GunHand
                userData={{ ...player }}
                camera={camera}
                isMe={isMe}
                {...player}
              />
            ) : (
              <PlayerFinal
                userData={{ ...player }}
                camera={camera}
                isMe={isMe}
                {...player}
                isMyTurn={isMyTurn}
              />
            )}
            <Chair userData={{ ...player }} {...player} />
            <Billboard // Billboard makes the text always face the camera
              position={labelPosition} // Position the label above the player's head
            >
              <Text
                fontSize={0.15} // Adjust font size as needed
                color="white" // Text color
                anchorX="center" // Anchor the text at the center
                anchorY="middle"
              >
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
