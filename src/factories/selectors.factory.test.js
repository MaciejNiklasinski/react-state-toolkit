import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getSelectorId } from "./ids";

let stores, slices, actions, actionsByType, selectors;
let createStore, createSlice, createAction, createAsyncAction, createSelector;
const reset = () => {
  stores = {};
  slices = {};
  actions = {};
  actionsByType = {};
  selectors = {};

  ({ createStore } = getStoresFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({ createSlice } = getSlicesFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({
    createAction,
    createAsyncAction
  } = getActionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({ createSelector } = getSelectorsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
};
beforeEach(reset);

describe("selector factory", () => {
  test("Should be able to create default store valid slice selector.", () => {
    const sliceName = "testSlice";
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    const selector = createSelector({
      sliceName,
      name,
      funcs,
    });

    expect(selector.storeName).toEqual(DEFAULT_STORE);
    expect(selector.sliceName).toEqual(sliceName);
    expect(selector.selectorName).toEqual(selectorName);
    expect(typeof selector[selector.selectorName]).toEqual("function");

    expect(stores[DEFAULT_STORE].selectors[sliceName][selectorName]).toEqual(selector[selector.selectorName]);
    expect(selectors[getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName })]).toEqual(selector);
  });

  test("Should be able to create non-default store valid slice selector.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    const selector = createSelector({
      storeName,
      sliceName,
      name,
      funcs,
    });

    expect(selector.storeName).toEqual(storeName);
    expect(selector.sliceName).toEqual(sliceName);
    expect(selector.selectorName).toEqual(selectorName);
    expect(typeof selector[selector.selectorName]).toEqual("function");

    expect(stores[storeName].selectors[sliceName][selectorName]).toEqual(selector[selector.selectorName]);
    expect(selectors[getSelectorId({ storeName, sliceName, selectorName })]).toEqual(selector);
  });

  test("Should be able to create default store valid store selector.", () => {
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    const selector = createSelector({
      name,
      funcs,
    });

    expect(selector.storeName).toEqual(DEFAULT_STORE);
    expect(selector.sliceName).toEqual(DEFAULT_SLICE);
    expect(selector.selectorName).toEqual(selectorName);
    expect(typeof selector[selector.selectorName]).toEqual("function");

    expect(stores[DEFAULT_STORE].selectors[DEFAULT_SLICE][selectorName]).toEqual(selector[selector.selectorName]);
    expect(selectors[getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName })]).toEqual(selector);
  });

  test("Should be able to create non-default store valid store selector.", () => {
    const storeName = "nonDefault";
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    const selector = createSelector({
      storeName,
      name,
      funcs,
    });

    expect(selector.storeName).toEqual(storeName);
    expect(selector.sliceName).toEqual(DEFAULT_SLICE);
    expect(selector.selectorName).toEqual(selectorName);
    expect(typeof selector[selector.selectorName]).toEqual("function");

    expect(stores[storeName].selectors[DEFAULT_SLICE][selectorName]).toEqual(selector[selector.selectorName]);
    expect(selectors[getSelectorId({ storeName, sliceName: DEFAULT_SLICE, selectorName })]).toEqual(selector);
  });

  test("Should be able to create selector with already suffixed name.", () => {
    const storeName = "nonDefault";
    const name = "validSelector";
    const funcs = [(state) => state];
    const selector = createSelector({
      storeName,
      name,
      funcs,
    });

    expect(selector.storeName).toEqual(storeName);
    expect(selector.sliceName).toEqual(DEFAULT_SLICE);
    expect(selector.selectorName).toEqual(name);
  });
});