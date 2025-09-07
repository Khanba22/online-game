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
      angle:[]
    },
  },
  reducers: {
    rotatePlayer:(state,action)=>{
      const {username,rotation} = action.payload

      return {
        ...state,
        [username]:{
          ...state[username],
          neckRotation:rotation
        }
      }
    },
    setOtherPlayer: (state, action) => {
      return {
        ...action.payload.data,
      };
    },
    reduceLife: (state, action) => {
      const user = action.payload.user;
      const liveCount = action.payload.liveCount || 0;
      
      // Ensure user exists in state
      if (!state[user]) {
        console.warn(`User ${user} not found in state`);
        return state;
      }
      
      const currentLives = state[user].lives || 0;
      const newLives = Math.max(0, currentLives - liveCount);
      
      if (newLives === 0) {
        console.log(`${user} Died`);
      }
      
      return {
        ...state,
        [user]: {
          ...state[user],
          lives: newLives,
        },
      };
    },
    usePlayerEquipment: (state, action) => {
      const { user, equipmentType } = action.payload;
      var effect = "";
      switch (equipmentType) {
        case "shield":
          effect = "isShielded";
          break;
        case "doubleDamage":
          effect = "hasDoubleDamage";
          break;
        case "looker":
          effect = "canLookBullet";
          break;
        case "heals":
          effect = "healing";
          break;
        case "doubleTurn":
          effect = "hasDoubleTurn";
          break;
        default:
          return state;
      }
      if (effect === "healing") {
        return {
          ...state,
          [user]: {
            ...state[user],
            equipment: {
              ...state[user].equipment,
              [equipmentType]: state[user].equipment[equipmentType] - 1,
            },
            lives: state[user].lives + 1,
          },
        };
      }
      return {
        ...state,
        [user]: {
          ...state[user],
          equipment: {
            ...state[user].equipment,
            [equipmentType]: state[user].equipment[equipmentType] - 1,
          },
          [effect]: true,
        },
      };
    },
  },
});

export const { setOtherPlayer, usePlayerEquipment, reduceLife , rotatePlayer } =
  OtherPlayerData.actions;
export default OtherPlayerData.reducer;
