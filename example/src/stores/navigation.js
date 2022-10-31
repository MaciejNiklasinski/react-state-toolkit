import { createStore } from "react-state-toolkit";
import { NAVIGATION_STORE } from "../consts/stores";
import { navigationSlices } from "../slices/navigation";

export const {
  withNavigationStore,
  useNavigationStoreState,
  useNavigationSelector,
  getNavigationState,
  getNavigationActions,
  getNavigationSelectors,
} = createStore({
  name: NAVIGATION_STORE,
  storeSlices: navigationSlices
});