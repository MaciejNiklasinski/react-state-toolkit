import { DEFAULT_SLICE, DEFAULT_STORE } from "../constants/store";
import {
  getSliceId,
  getActionId,
  getSelectorId,
} from "./ids";

test("getSliceId produce correct sliceId", () => {
  const sliceId = getSliceId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE });
  expect(sliceId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}`);
});

test("getActionId produce correct actoinId", () => {
  const actionName = "validAction";
  const actoinId = getActionId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, actionName });
  expect(actoinId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}.${actionName}`);
});

test("getSelectorId produce correct selectorId", () => {
  const selectorName = "validSelector";
  const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
  expect(selectorId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}.${selectorName}`);
});