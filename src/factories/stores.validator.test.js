import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Store
  UnableToCreateInvalidNameStore,
  UnableToCreateInitializedStore,
  // Store Slices
  UnableToCreateForeignSliceStore,
  UnableToCreateUnknownSliceStore,
  UnableToCreateMissingSliceStore,
  UnableToCreateEmptyStore,
  // Store Selectors
  UnableToCreateUnknownSelectorStore,
  UnableToCreateForeignStoreSelectorStore,
  UnableToCreateSliceSelectorStore,
  UnableToCreateSliceRegisteredSelectorStore,
  UnableToCreateMissingSelectorStore,
} from "../errors/UnableToCreateStore";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getSliceId } from "./ids";

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

describe("stores validator", () => {
  beforeEach(reset);
  test("Should throw correct error when attempting to create store with invalid name.", () => {
    let error;
    try {
      createStore({ name: null });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: null }));
    error = null;
    try {
      createStore({ name: "" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "" }));
    error = null;
    try {
      createStore({ name: "inva.lidStore" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "inva.lidStore" }));
    error = null;
    try {
      createStore({ name: "inva_lidStore" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "inva_lidStore" }));
  });

  test("Should throw correct error when attempting to create already existing default store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    let error;
    try {
      createStore({ storeSlices: { slice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create already existing non-default store.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    let error;
    try {
      createStore({ name: storeName, storeSlices: { slice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStore({ storeName }));
  });

  test("Should throw correct error when attempting to create store with foreign store slice", () => {
    const foreignStoreName = "foreign";
    const foreignSliceName = "foreignSlice";
    const foreignSliceId = getSliceId({ storeName: foreignStoreName, sliceName: foreignSliceName });
    const foreignSlice = createSlice({
      storeName: foreignStoreName,
      name: foreignSliceName,
      reducer: {},
    });
    let error;
    try {
      createStore({ storeSlices: { foreignSlice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignSliceStore({ storeName: DEFAULT_STORE, foreignSliceId }));
  });

  test("Should throw correct error when attempting to create store with unknown slice", () => {
    let error;
    try {
      createStore({ storeSlices: { unknownSlice: {} } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSliceStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with missing slice", () => {
    const sliceName = "missingSlice";
    const missingSliceId = getSliceId({ storeName: DEFAULT_STORE, sliceName });
    createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({ storeSlices: {} });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingSliceStore({ storeName: DEFAULT_STORE, missingSliceId }));
  });

  test("Should throw correct error when attempting to create empty store", () => {
    let error;
    try {
      createStore({});
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateEmptyStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with unknown store selector", () => {
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { unknownStoreSelector: (state) => state }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSelectorStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with foreign store selector", () => {
    const foreignStoreName = "foreignStore";
    const { foreignSelector } = createSelector({
      storeName: foreignStoreName,
      name: "foreign",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { foreignSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignStoreSelectorStore({ storeName: DEFAULT_STORE, foreignSelectorId: foreignSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with slice selector", () => {
    const { validSelector } = createSelector({
      sliceName: "selectorSlice",
      name: "valid",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { validSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateSliceSelectorStore({ storeName: DEFAULT_STORE, sliceSelectorId: validSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with slice registered store selector", () => {
    const { validSelector } = createSelector({
      name: "valid",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: { validSelector } });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { validSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateSliceRegisteredSelectorStore({ storeName: DEFAULT_STORE, selectorId: validSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with missing store selector", () => {
    const { missingStoreSelector } = createSelector({
      name: "missingStore",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingSelectorStore({ storeName: DEFAULT_STORE, missingSelectorId: missingStoreSelector.__selectorId }));
  });
});