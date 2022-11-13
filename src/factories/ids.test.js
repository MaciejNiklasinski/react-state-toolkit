import { DEFAULT_SLICE, DEFAULT_STORE } from "../constants/store";
import {
  getSliceId,
  getActionId,
  getSelectorId,
  getSubscriptionIds,
  getParamsId,
} from "./ids";

test("getSliceId produce correct sliceId", () => {
  const sliceId = getSliceId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE });
  expect(sliceId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}`);
});

test("getActionId produce correct actionId", () => {
  const actionName = "validAction";
  const actionId = getActionId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, actionName });
  expect(actionId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}.${actionName}`);
});

test("getSelectorId produce correct selectorId", () => {
  const selectorName = "validSelector";
  const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
  expect(selectorId).toEqual(`${DEFAULT_STORE}.${DEFAULT_SLICE}.${selectorName}`);
});

test("getParamsIds produce correct results subscriptionId and paramsId", () => {
  const selectorName = "validSelector";
  const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });

  const parameterlessParamsId = getParamsId({ selectorId, params: [] });
  expect(parameterlessParamsId).toEqual(`0`);

  const parameterizedParamsId = getParamsId({ selectorId, params: ["user123", 4] });
  expect(parameterizedParamsId).toEqual(`2suser123,n4,`);
});

test("getSubscriptionIds produce correct results subscriptionId and paramsId", () => {
  const selectorName = "validSelector";
  const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });

  const {
    subscriptionId: parameterlessSubscriptionId,
    paramsId: parameterlessParamsId
  } = getSubscriptionIds({ selectorId, params: [] });
  expect(parameterlessSubscriptionId).toEqual(`${selectorId}.0`);
  expect(parameterlessParamsId).toEqual(`0`);

  const {
    subscriptionId: parameterizedSubscriptionId,
    paramsId: parameterizedParamsId
  } = getSubscriptionIds({ selectorId, params: ["user123", 4] });
  expect(parameterizedSubscriptionId).toEqual(`${selectorId}.2suser123,n4,`);
  expect(parameterizedParamsId).toEqual(`2suser123,n4,`);
});