import { createSelector } from "react-state-toolkit";
import { TABS_SLICE } from "../../consts/navigationSlices";
import { NAVIGATION_STORE } from "../../consts/stores";
import { TABS } from "../../consts/tabs";

export const { activeTabSelector } = createSelector({
  storeName: NAVIGATION_STORE,
  sliceName: TABS_SLICE,
  name: "activeTabSelector",
  funcs: [(state) => state[TABS_SLICE].active]
});

export const { isProfileTabDisabledSelector } = createSelector({
  storeName: NAVIGATION_STORE,
  sliceName: TABS_SLICE,
  name: "isProfileTabDisabledSelector",
  funcs: [(state) => state[TABS_SLICE].disabled[TABS.PROFILE]]
});