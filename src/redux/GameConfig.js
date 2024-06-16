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
<<<<<<< HEAD
      console.log(action.payload)
=======
>>>>>>> 9caa3e7dfe5b4c96dd88302f466fa4ba8a2ab458
      return {
        ...state,
        turn:action.payload.turn,
      };
    },
<<<<<<< HEAD
    setPlayerArray: (state, action) => {
=======
    setPlayers: (state, action) => {
>>>>>>> 9caa3e7dfe5b4c96dd88302f466fa4ba8a2ab458
      return {
        ...state,
        players: action.payload.players,
      };
    },
  },
});

<<<<<<< HEAD
export const { updateGameTurn , setPlayerArray } = GameConfig.actions;
=======
export const { updateGameTurn } = GameConfig.actions;
>>>>>>> 9caa3e7dfe5b4c96dd88302f466fa4ba8a2ab458
export default GameConfig.reducer;
