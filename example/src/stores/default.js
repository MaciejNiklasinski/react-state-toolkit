import { createStore } from "react-state-toolkit";
import { defaultSlices } from "../slices/index";

export const {
  withStore,
  useStoreState,
  useSelector,
  getState,
  getActions,
  getSelectors,
} = createStore({
  storeSlices: defaultSlices
});