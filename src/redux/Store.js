import { configureStore } from "@reduxjs/toolkit";
import PlayerData from "./PlayerDataReducer";
import OtherPlayerData from "./AllPlayerReducer";
import GameConfig from "./GameConfig"

export default configureStore({
  name: "store",
  reducer: {
    myPlayerData: PlayerData,
    otherPlayerData: OtherPlayerData,
    gameConfig: GameConfig,
  },
});
