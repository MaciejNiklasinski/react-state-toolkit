import { createImporter, createSelector } from "react-state-toolkit";
import { LOGGED_IN } from "../consts/appStatus";
import { USER_SLICE, APP_SLICE } from "../consts/defaultSlices";

const { importSelector } = createImporter();
const { statusSelector } = importSelector(APP_SLICE, "statusSelector");
const { loadingSelector } = importSelector(APP_SLICE, "loadingSelector");

export const { userIdSelector } = createSelector({
  sliceName: USER_SLICE,
  name: "userIdSelector",
  funcs: [
    (state) => state[USER_SLICE].id
  ]
});

export const { canLogInSelector } = createSelector({
  sliceName: USER_SLICE,
  name: "canLogInSelector",
  funcs: [
    loadingSelector,
    statusSelector,
    (loading, status) => !loading && status !== LOGGED_IN
  ]
});

export const { firstNameSelector } = createSelector({
  sliceName: USER_SLICE,
  name: "firstNameSelector",
  funcs: [
    (state) => state[USER_SLICE].firstName
  ]
});

export const { lastNameSelector } = createSelector({
  sliceName: USER_SLICE,
  name: "lastNameSelector",
  funcs: [
    (state) => state[USER_SLICE].lastName
  ]
});