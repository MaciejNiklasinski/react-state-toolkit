import { DEFAULT_STORE } from "../constants/store";
import {
  // Selector Store
  UnableToCreateInvalidNameStoreSelector,
  UnableToCreateInitializedStoreSelector,
  // Selector Slice
  UnableToCreateInvalidNameSliceSelector,
  UnableToCreateInitializedSliceSelector,
  // Selector
  UnableToCreateInvalidNameSelector,
  UnableToCreateInvalidFuncsSelector,
  UnableToCreateInvalidMemoOnArgsSelector,
  UnableToCreateExistingSelector
} from "../errors/UnableToCreateSelector";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";

let stores, slices, actions, actionsByType, actionsImports, selectors, selectorsImports;
let createStore, createSlice, createAction, createAsyncAction, createSelector, createImporter;
const reset = () => {
  stores = {};
  slices = {};
  actions = {};
  actionsByType = {};
  actionsImports = {};
  selectors = {};
  selectorsImports = {};

  ({ createStore } = getStoresFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSlice } = getSlicesFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({
    createAction,
    createAsyncAction
  } = getActionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSelector } = getSelectorsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createImporter } = getImportersFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
};
beforeEach(reset);

describe("selectors validator", () => {
  test("Should throw correct error when attempting to create selector with invalid storeName.", () => {
    const sliceName = "testSlice";
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        storeName: null,
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSelector({ storeName: null, sliceName, selectorName }));

    error = null;
    try {
      createSelector({
        storeName: "",
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSelector({ storeName: "", sliceName, selectorName }));

    error = null;
    try {
      createSelector({
        storeName: "inva.lid",
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSelector({ storeName: "inva.lid", sliceName, selectorName }));

    error = null;
    try {
      createSelector({
        storeName: "inva_lid",
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSelector({ storeName: "inva_lid", sliceName, selectorName }));
  });

  test("Should throw correct error when attempting to create selector for already initialized store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });

    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStoreSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
  });

  test("Should throw correct error when attempting to create selector with invalid sliceName.", () => {
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        sliceName: null,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: null, selectorName }));

    error = null;
    try {
      createSelector({
        sliceName: "",
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "", selectorName }));

    error = null;
    try {
      createSelector({
        sliceName: "inva.lidSlice",
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva.lidSlice", selectorName }));

    error = null;
    try {
      createSelector({
        sliceName: "inva_lidSlice",
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva_lidSlice", selectorName }));
  });

  test("Should throw correct error when attempting to create sync selector for already initialized slice.", () => {
    const sliceName = "testSlice";
    createSlice({
      name: sliceName,
      reducer: {},
    });
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateInitializedSliceSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
  });

  test("Should throw correct error when attempting to create selector with invalid name.", () => {
    const sliceName = "testSlice";
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        sliceName,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName }));

    error = null;
    try {
      createSelector({
        sliceName,
        name: "inva.lid",
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva.lidSelector" }));

    error = null;
    try {
      createSelector({
        sliceName,
        name: null,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: null }));

    error = null;
    try {
      createSelector({
        sliceName,
        name: "",
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "" }));

    error = null;
    try {
      createSelector({
        sliceName,
        name: "inva_lid",
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva_lidSelector" }));

  });

  test("Should throw correct error when attempting to create selector with invalid funcs.", () => {
    const sliceName = "testSlice";
    const name = `valid`;
    const selectorName = `${name}Selector`;
    let error;
    try {
      createSelector({
        sliceName,
        name,
        funcs: (state) => state,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncsSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
    try {
      createSelector({
        sliceName,
        name,
        funcs: [],
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncsSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
    try {
      createSelector({
        sliceName,
        name,
        funcs: [0],
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncsSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
  });

  test("Should throw correct error when attempting to create selector with invalid funcs.", () => {
    const sliceName = "testSlice";
    const name = `valid`;
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    let error;
    try {
      createSelector({
        sliceName,
        name,
        funcs,
        memoOnArgs: true
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidMemoOnArgsSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
  });

  test("Should be able to create valid slice selector.", () => {
    const sliceName = "testSlice";
    const name = "valid";
    const selectorName = `${name}Selector`;
    const funcs = [(state) => state];
    createSelector({
      sliceName,
      name,
      funcs,
    });
    let error;
    try {
      createSelector({
        sliceName,
        name,
        funcs,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateExistingSelector({ storeName: DEFAULT_STORE, sliceName, selectorName }));
  });
});