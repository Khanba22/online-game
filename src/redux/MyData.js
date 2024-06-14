import { createSlice } from "@reduxjs/toolkit";


const replyReducer = createSlice({
    name: "userReducer",
    initialState: {
        sender: "",
        color: "",
        message: "",
        time: "",
        show:false,
        reactions:{}
    },
    reducers: {
        editReply: (state, action) => {
            const data = action.payload.data
            return{
                ...state,
                sender:data.sender,
                color:data.color,
                message:data.message,
                time:data.time,
                show:data.show,
                reactions:data.reactions
            }
        }
    }
})
export const { editReply } = replyReducer.actions
export default replyReducer.reducer;