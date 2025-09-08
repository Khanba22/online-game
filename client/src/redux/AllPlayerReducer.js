import { createSlice } from "@reduxjs/toolkit";

const OtherPlayerData = createSlice({
  name: "OtherPlayerData",
  initialState: {
    user: {
      username: "",
      lives: 3,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
        skip: 0,
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
      const lives = action.payload.lives;
      const liveCount = action.payload.liveCount;
      
      // Ensure user exists in state
      if (!state[user]) {
        console.warn(`User ${user} not found in state`);
        return state;
      }
      
      // Use server-provided life count if available (authoritative)
      let newLives;
      if (lives !== undefined) {
        newLives = Math.max(0, lives);
      } else if (liveCount !== undefined) {
        // Fallback to old logic for backward compatibility
        const currentLives = state[user].lives || 0;
        newLives = Math.max(0, currentLives - liveCount);
      } else {
        return state; // No valid life data
      }
      
      if (newLives === 0) {
        console.log(`${user} Died`);
      }
      
      return {
        ...state,
        [user]: {
          ...(state[user] || {}),
          lives: newLives,
        },
      };
    },
    usePlayerEquipment: (state, action) => {
      const { 
        user, 
        equipmentType, 
        equipmentCount, 
        lives, 
        isShielded, 
        hasDoubleDamage, 
        canLookBullet, 
        hasDoubleTurn 
      } = action.payload;

      // If we have server-synced data, use it directly
      if (equipmentCount !== undefined) {
        return {
          ...state,
          [user]: {
            ...(state[user] || {}),
            equipment: {
              ...(state[user]?.equipment || {}),
              [equipmentType]: equipmentCount,
            },
            lives: lives !== undefined ? lives : (state[user]?.lives || 3),
            isShielded: isShielded !== undefined ? isShielded : (state[user]?.isShielded || false),
            hasDoubleDamage: hasDoubleDamage !== undefined ? hasDoubleDamage : (state[user]?.hasDoubleDamage || false),
            canLookBullet: canLookBullet !== undefined ? canLookBullet : (state[user]?.canLookBullet || false),
            hasDoubleTurn: hasDoubleTurn !== undefined ? hasDoubleTurn : (state[user]?.hasDoubleTurn || false),
          },
        };
      }

      // Fallback to old logic if no server data
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
        case "skip":
          // Skip doesn't set any effect, just consumes equipment
          return {
            ...state,
            [user]: {
              ...(state[user] || {}),
              equipment: {
                ...(state[user]?.equipment || {}),
                [equipmentType]: (state[user]?.equipment?.[equipmentType] || 0) - 1,
              },
            },
          };
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
            ...(state[user] || {}),
            equipment: {
              ...(state[user]?.equipment || {}),
              [equipmentType]: (state[user]?.equipment?.[equipmentType] || 0) - 1,
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
