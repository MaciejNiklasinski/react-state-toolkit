import { createSelector } from "react-state-toolkit";
import { APP_SLICE } from "../consts/defaultSlices";

export const { statusSelector } = createSelector({
  sliceName: APP_SLICE,
  name: "statusSelector",
  funcs: [(state) => state[APP_SLICE].status]
});

export const { errorSelector } = createSelector({
  sliceName: APP_SLICE,
  name: "errorSelector",
  funcs: [(state) => state[APP_SLICE].error]
});

export const { loadingSelector } = createSelector({
  sliceName: APP_SLICE,
  name: "loadingSelector",
  funcs: [(state) => state[APP_SLICE].loading]
});