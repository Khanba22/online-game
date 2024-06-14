import { configureStore  } from "@reduxjs/toolkit";
import PlayerData from "./PlayerDataReducer";


export default  configureStore({
    name: "store",
    reducer:{
        myPlayerData:PlayerData
    }
})