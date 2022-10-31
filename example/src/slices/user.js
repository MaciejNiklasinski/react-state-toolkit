import { createSlice } from "react-state-toolkit";
import { USER_SLICE } from "../consts/defaultSlices";
import {
  LOG_IN_ACTION,
  LOG_OUT_ACTION,
  SET_FIRST_NAME_ACTION,
  SET_LAST_NAME_ACTION
} from "../actions/user";
import * as userSelectors from "../selectors/user";

export default createSlice({
  name: USER_SLICE,
  initialState: {
    id: null,
    firstName: "",
    lastName: "",
  },
  reducer: {
    [LOG_IN_ACTION.PENDING]: (state) => {
      state.id = null;
      state.firstName = "";
      state.lastName = "";
    },
    [LOG_IN_ACTION.RESOLVED]: (state, action) => {
      const {
        id,
        firstName,
        lastName,
      } = action.payload;
      state.id = id;
      state.firstName = firstName;
      state.lastName = lastName;
    },
    [LOG_IN_ACTION.REJECTED]: (state, action) => {
      if (action.error.message === "Already logged in") return;
      state.id = null;
      state.firstName = "";
      state.lastName = "";
    },
    [LOG_OUT_ACTION]: (state) => {
      state.id = null;
      state.firstName = "";
      state.lastName = "";
      console.log(JSON.stringify(state));
    },
    [SET_FIRST_NAME_ACTION]: (state, action) => {
      state.firstName = action.payload;
    },
    [SET_LAST_NAME_ACTION]: (state, action) => {
      state.lastName = action.payload;
    },
  },
  sliceSelectors: userSelectors,
});