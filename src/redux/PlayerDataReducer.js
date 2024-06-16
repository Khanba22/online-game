import { createSlice } from "@reduxjs/toolkit";

const myPlayerData = createSlice({
  name: "myPlayerData",
  initialState: {
    index:0,
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
  reducers: {
    setPlayer: (state, action) => {
      return {
        ...state,
        ...action.payload.data,
      };
    },
    addEquipment: (state, action) => {
      var tempState = {
        heals: state.equipment.heals,
        doubleDamage: state.equipment.doubleDamage,
        looker: state.equipment.looker,
        doubleTurn: state.equipment.doubleTurn,
        shield: state.equipment.shield,
      };
      if (action.payload.equipment) {
        Object.keys(action.payload.equipment).forEach((key) => {
          tempState = {
            ...tempState,
            [key]: action.payload.equipment[key] + tempState[key],
          };
        });
      } else {
        console.error("Equipment Not Found");
      }
      return {
        ...state,
        equipment: tempState,
      };
    },
    useEquipment: (state, action) => {
      switch (action.payload.equipmentType) {
        case "shield":
          return {
            ...state,
            isShielded: true,
            equipment: {
              ...state.equipment,
              shield: state.equipment.shield - 1,
            },
          };

        case "doubleDamage":
          return {
            ...state,
            equipment: {
              ...state.equipment,
              doubleDamage: state.equipment.doubleDamage - 1,
            },
            hasDoubleDamage: true,
          };
        case "looker":
          return {
            ...state,
            equipment: {
              ...state.equipment,
              looker: state.equipment.looker - 1,
            },
            canLookBullet: true,
          };
        case "doubleTurn":
          return {
            ...state,
            equipment: {
              ...state.equipment,
              doubleTurn: state.equipment.doubleTurn - 1,
            },
            hasDoubleTurn: true,
          };
        case "heals":
          return {
            ...state,
            equipment: {
              ...state.equipment,
              heals: state.equipment.heals - 1,
            },
            lives: state.lives + 1,
          };
        default:
          return { ...state };
      }
    },
    setName: (state, action) => {
      return {
        ...state,
        username: action.payload.username,
      };
    },
    reduceMyLife: (state, action) => {
      return {
        ...state,
        lives: state.lives - action.payload.liveCount,
      };
    },
  },
});
export const { setPlayer, useEquipment, addEquipment, setName , reduceMyLife } =
  myPlayerData.actions;
export default myPlayerData.reducer;
