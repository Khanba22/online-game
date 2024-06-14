import { configureStore } from "@reduxjs/toolkit";
import PlayerData from "./PlayerDataReducer";
import OtherPlayerData from "./AllPlayerReducer";

export default configureStore({
  name: "store",
  reducer: {
    myPlayerData: PlayerData,
    otherPlayerData: OtherPlayerData,
  },
});
