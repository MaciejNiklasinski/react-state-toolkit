import { createAction, createAsyncAction, createImporter } from "react-state-toolkit";
import { FAILED, LOGGED_IN, LOGGED_OUT } from "../consts/appStatus";
import { USERS } from "../consts/users";
import { USER_SLICE, APP_SLICE } from "../consts/defaultSlices";

const { importAction, importSelector } = createImporter();

const { userIdSelector } = importSelector(USER_SLICE, "userIdSelector");
const { statusSelector } = importSelector(APP_SLICE, "statusSelector");

const { setLoadingAction } = importAction(APP_SLICE, "setLoadingAction");
const { setStatusAction } = importAction(APP_SLICE, "setStatusAction");
const { setErrorAction } = importAction(APP_SLICE, "setErrorAction");

export const { logInAction, LOG_IN_ACTION } = createAsyncAction({
  sliceName: USER_SLICE,
  name: "logIn",
  func: async (id, { getState }) => {
    const state = getState();
    const status = statusSelector(state);
    if (status === LOGGED_IN)
      throw new Error("Already logged in");
    try {
      setLoadingAction(true);

      await new Promise((resolve) => setTimeout(resolve, 2500));

      const user = USERS[id];
      if (!user) {
        throw new Error(`User ${id} not found`);
      };

      setStatusAction(LOGGED_IN);
      return user;
    } catch (error) {
      setStatusAction(FAILED);
      setErrorAction(error);
      throw error;
    } finally {
      setLoadingAction(false);
    }
  }
});

export const { logOutAction, LOG_OUT_ACTION } = createAction({
  sliceName: USER_SLICE,
  name: "logOut",
  func: () => { setStatusAction(LOGGED_OUT); }
});

export const { setFirstNameAction, SET_FIRST_NAME_ACTION } = createAction({
  sliceName: USER_SLICE,
  name: "setFirstName",
  func: (firstName, { getState }) => {
    const state = getState();
    const status = statusSelector(state);
    if (status !== LOGGED_IN)
      throw new Error("Log in before changing user first name");
    const userId = userIdSelector(state);
    if (userId === "admin")
      throw new Error("admin first name cannot be change");
    return firstName;
  }
});

export const { setLastNameAction, SET_LAST_NAME_ACTION } = createAction({
  sliceName: USER_SLICE,
  name: "setLastName",
  func: (lastName, { getState }) => {
    const state = getState();
    const status = statusSelector(state);
    if (status !== LOGGED_IN)
      throw new Error("Log in before changing user last name");
    const userId = userIdSelector(state);
    if (userId === "admin")
      throw new Error("admin last name cannot be change");
    return lastName;
  }
});