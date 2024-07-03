import { createSlice } from "@reduxjs/toolkit";

const GameConfig = createSlice({
  name: "GameConfig",
  initialState: {
    players: [],
    turn: 0,
    bulletArr: [],
    deadUsers: 0,
    playerTurn:""
  },
  reducers: {
    updateGameTurn: (state, action) => {
      console.log(action.payload);
      return {
        ...state,
        playerTurn:action.payload.playerTurn,
        turn: action.payload.turn,
      };
    },
    setPlayerArray: (state, action) => {
      return {
        ...state,
        players: action.payload.players,
      };
    },
    setBulletArr: (state, action) => {
      return {
        ...state,
        bulletArr: action.payload.bulletArr,
      };
    },
    removeBulletArr: (state, action) => {
      return {
        ...state,
        bulletArr: state.bulletArr.slice(0, -1),
      };
    },
  },
});

export const { updateGameTurn, setPlayerArray, setBulletArr, removeBulletArr } =
  GameConfig.actions;
export default GameConfig.reducer;
