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
      return {
        ...state,
        turn:action.payload.turn,
      };
    },
    setPlayers: (state, action) => {
      return {
        ...state,
        players: action.payload.players,
      };
    },
  },
});

export const { updateGameTurn } = GameConfig.actions;
export default GameConfig.reducer;
