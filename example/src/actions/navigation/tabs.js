import { createAction } from "react-state-toolkit";
import { NAVIGATION_STORE } from "../../consts/stores";
import { TABS_SLICE } from "../../consts/navigationSlices";

export const { setActiveTabAction, SET_ACTIVE_TAB_ACTION } = createAction({
  storeName: NAVIGATION_STORE,
  sliceName: TABS_SLICE,
  name: "setActiveTabAction",
  func: (name) => name
});

export const { setDisabledAction, SET_DISABLED_ACTION } = createAction({
  storeName: NAVIGATION_STORE,
  sliceName: TABS_SLICE,
  name: "setDisabledAction",
  func: (name) => name
});

export const { resetDisabledAction, RESET_DISABLED_ACTION } = createAction({
  storeName: NAVIGATION_STORE,
  sliceName: TABS_SLICE,
  name: "resetDisabledAction",
  func: () => ({})
});