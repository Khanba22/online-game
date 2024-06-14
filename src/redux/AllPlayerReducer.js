import { createSlice } from "@reduxjs/toolkit";

const OtherPlayerData = createSlice({
  name: "OtherPlayerData",
  initialState: {
    user: {
      username: "",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      color: "",
      position: "",
    },
  },
  reducers: {
    setOtherPlayer: (state, action) => {
      return {
        ...action.payload.data,
      };
    },
    reduceLife: (state, action) => {
      const user = action.payload.user;
      return {
        ...state,
        [user]: {
          ...state[user],
          lives: state[user].lives - action.payload.liveCount,
        },
      };
    },
  },
});

export const { setOtherPlayer } = OtherPlayerData.actions;
export default OtherPlayerData.reducer;
