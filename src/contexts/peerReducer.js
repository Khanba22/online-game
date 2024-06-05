import {
  ADD_PEER,
  REMOVE_PEER,
  // ADD_MEMBER,
  // REMOVE_MEMBER,
} from "./peerActions";

export const peerReducer = (state, action) => {
  switch (action.type) {
    case ADD_PEER:
      return {
        ...state,
        [action.payload.peerId]: {
          stream: action.payload.stream,
        },
      };
    case REMOVE_PEER:
      const { [action.payload.peerId]: deleted, ...rest } = action.payload;
      return { rest };
    // case ADD_MEMBER:
    //   return {
    //     ...state,
    //     members: [...state.members, action.payload.member],
    //   };
    // case REMOVE_MEMBER:
    //   const members = state.members.filter((x) => x !== action.payload.member);
    //   return { ...state, members: members };
    default:
      return { ...state };
  }
};
