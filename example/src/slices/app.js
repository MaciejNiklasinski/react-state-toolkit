import { createSlice } from "react-state-toolkit";
import { STARTED } from "../consts/appStatus";
import { APP_SLICE } from "../consts/defaultSlices";
import {
  SET_LOADING_ACTION,
  SET_STATUS_ACTION,
  SET_ERROR_ACTION,
} from "../actions/app";
import * as appSelectors from "../selectors/app";

export default createSlice({
  name: APP_SLICE,
  initialState: {
    status: STARTED,
    error: null,
    loading: false,
  },
  reducer: {
    [SET_LOADING_ACTION]: (state, action) => {
      state.loading = action.payload;
    },
    [SET_STATUS_ACTION]: (state, action) => {
      state.status = action.payload;
    },
    [SET_ERROR_ACTION]: (state, action) => {
      state.error = action.payload;
    }
  },
  sliceSelectors: appSelectors,
});