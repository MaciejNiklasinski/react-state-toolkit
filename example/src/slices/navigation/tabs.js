import { createSlice } from "react-state-toolkit";
import { TABS } from "../../consts/tabs";
import { NAVIGATION_STORE } from "../../consts/stores";
import { TABS_SLICE } from "../../consts/navigationSlices";
import { SET_ACTIVE_TAB_ACTION, SET_DISABLED_ACTION, RESET_DISABLED_ACTION } from "../../actions/navigation/tabs";
import * as tabsSelectors from "../../selectors/navigation/tabs";

export default createSlice({
  storeName: NAVIGATION_STORE,
  name: TABS_SLICE,
  initialState: {
    active: TABS.LOGIN,
    disabled: {}
  },
  reducer: {
    [SET_ACTIVE_TAB_ACTION]: (state, action) => {
      state.active = action.payload;
    },
    [SET_DISABLED_ACTION]: (state, action) => {
      state.disabled = { ...state.disabled, [action.payload]: true };
    },
    [RESET_DISABLED_ACTION]: (state) => {
      state.disabled = {};
    }
  },
  sliceSelectors: tabsSelectors,
});