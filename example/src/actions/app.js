import { createAction } from "react-state-toolkit";
import { APP_SLICE } from "../consts/defaultSlices";

export const { setLoadingAction, SET_LOADING_ACTION } = createAction({
  sliceName: APP_SLICE,
  name: "setLoading",
  func: (value) => value
});

export const { setStatusAction, SET_STATUS_ACTION } = createAction({
  sliceName: APP_SLICE,
  name: "setStatus",
  func: (status) => status
});

export const { setErrorAction, SET_ERROR_ACTION } = createAction({
  sliceName: APP_SLICE,
  name: "setError",
  func: (error) => error
});