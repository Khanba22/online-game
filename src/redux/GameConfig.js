import { createSlice } from "@reduxjs/toolkit";

const GameConfig = createSlice({
  name: "GameConfig",
  initialState: {
    players: [],
    turn: 0,
    deadUsers: 0,
  },
  reducers: {
    updateGameTurn: (state, action) => {
      console.log(action.payload)
      return {
        ...state,
        turn:action.payload.turn,
      };
    },
    setPlayerArray: (state, action) => {
      return {
        ...state,
        players: action.payload.players,
      };
    },
  },
});

export const { updateGameTurn , setPlayerArray } = GameConfig.actions;
export default GameConfig.reducer;
