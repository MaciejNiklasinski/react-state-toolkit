import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Action Store
  UnableToCreateInvalidNameStoreAction,
  UnableToCreateInitializedStoreAction,
  // Action Slice
  UnableToCreateInvalidNameSliceAction,
  UnableToCreateReservedSliceAction,
  UnableToCreateInitializedSliceAction,
  // Action
  UnableToCreateInvalidNameAction,
  UnableToCreateInvalidFuncAction,
  UnableToCreateInvalidOnResolvedAction,
  UnableToCreateInvalidOnRejectedAction,
  UnableToCreateInvalidOnSettledAction,
  UnableToCreateExistingAction,
} from "../errors/UnableToCreateAction";
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

describe("actions validator", () => {
  test("Should throw correct error when attempting to create sync action with invalid storeName.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const actionName = `${name}Action`;
    const syncFunc = () => ({});
    let error;
    try {
      createAction({
        storeName: null,
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: null, sliceName, actionName }));

    error = null;
    try {
      createAction({
        storeName: "",
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "", sliceName, actionName }));

    error = null;
    try {
      createAction({
        storeName: "inva.lid",
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "inva.lid", sliceName, actionName }));

    error = null;
    try {
      createAction({
        storeName: "inva_lid",
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "inva_lid", sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create sync action for already initialized store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });

    const name = "validSync";
    const syncFunc = () => ({});
    let error;
    try {
      createAction({
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateInitializedStoreAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create sync action with invalid sliceName.", () => {
    const name = "validSync";
    const syncFunc = () => ({});
    const actionName = `${name}Action`;
    let error;
    try {
      createAction({
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, actionName }));

    error = null;
    try {
      createAction({
        sliceName: null,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: null, actionName }));

    error = null;
    try {
      createAction({
        sliceName: "",
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "", actionName }));

    error = null;
    try {
      createAction({
        sliceName: "inva.lidSlice",
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva.lidSlice", actionName }));

    error = null;
    try {
      createAction({
        sliceName: "inva_lidSlice",
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva_lidSlice", actionName }));
  });

  test("Should throw correct error when attempting to create sync action with reserved sliceName.", () => {
    const sliceName = DEFAULT_SLICE;
    const name = "validSync";
    const syncFunc = () => ({});
    let error;
    try {
      createAction({
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateReservedSliceAction({ storeName: DEFAULT_STORE, actionName }));
  });

  test("Should throw correct error when attempting to create sync action for already initialized slice.", () => {
    const sliceName = "testSlice";
    createSlice({
      name: sliceName,
      reducer: {},
    });

    const name = "validSync";
    const syncFunc = () => ({});
    let error;
    try {
      createAction({
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateInitializedSliceAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create sync action with invalid name.", () => {
    const sliceName = "testSlice";
    const syncFunc = () => ({});
    let error;
    try {
      createAction({
        sliceName,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName }));

    error = null;
    try {
      createAction({
        sliceName,
        name: null,
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: null }));

    error = null;
    try {
      createAction({
        sliceName,
        name: "",
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "" }));

    error = null;
    try {
      createAction({
        sliceName,
        name: "inva.lidSync",
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva.lidSyncAction" }));

    error = null;
    try {
      createAction({
        sliceName,
        name: "inva_lidSync",
        func: syncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva_lidSyncAction" }));
  });

  test("Should throw correct error when attempting to create sync action with invalid func.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const actionName = `${name}Action`;
    let error;
    try {
      createAction({
        sliceName,
        name,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncAction({ storeName: DEFAULT_STORE, sliceName, actionName }));

    error = null;
    try {
      createAction({
        sliceName,
        name,
        func: [() => { }]
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create existing sync action.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = () => ({});
    createAction({
      sliceName,
      name,
      func: syncFunc,
    });
    let error;
    try {
      createAction({
        sliceName,
        name,
        func: syncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateExistingAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });
});

describe("async action validator", () => {
  test("Should throw correct error when attempting to create sync action with invalid storeName.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const actionName = `${name}Action`;
    const asyncFunc = async () => ({});
    let error;
    try {
      createAsyncAction({
        storeName: null,
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: null, sliceName, actionName }));

    error = null;
    try {
      createAsyncAction({
        storeName: "",
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "", sliceName, actionName }));

    error = null;
    try {
      createAsyncAction({
        storeName: "inva.lid",
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "inva.lid", sliceName, actionName }));

    error = null;
    try {
      createAsyncAction({
        storeName: "inva_lid",
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreAction({ storeName: "inva_lid", sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action for already initialized store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });

    const name = "validAsync";
    const asyncFunc = async () => ({});
    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateInitializedStoreAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action with invalid sliceName.", () => {
    const name = "validAsync";
    const asyncFunc = async () => ({});
    const actionName = `${name}Action`;
    let error;
    try {
      createAsyncAction({
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, actionName }));

    error = null;
    try {
      createAsyncAction({
        sliceName: null,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: null, actionName }));

    error = null;
    try {
      createAsyncAction({
        sliceName: "",
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "", actionName }));

    error = null;
    try {
      createAsyncAction({
        sliceName: "inva.lidSlice",
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva.lidSlice", actionName }));

    error = null;
    try {
      createAsyncAction({
        sliceName: "inva_lidSlice",
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva_lidSlice", actionName }));
  });

  test("Should throw correct error when attempting to create async action with reserved sliceName.", () => {
    const sliceName = DEFAULT_SLICE;
    const name = "validAsync";
    const asyncFunc = async () => ({});
    let error;
    try {
      createAction({
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateReservedSliceAction({ storeName: DEFAULT_STORE, actionName }));
  });

  test("Should throw correct error when attempting to create async action for already initialized slice.", () => {
    const sliceName = "testSlice";
    createSlice({
      name: sliceName,
      reducer: {},
    });

    const name = "validAsync";
    const asyncFunc = async () => ({});
    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateInitializedSliceAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action with invalid name.", () => {
    const sliceName = "testSlice";
    const asyncFunc = async () => ({});
    let error;
    try {
      createAsyncAction({
        sliceName,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName }));

    error = null;
    try {
      createAsyncAction({
        sliceName,
        name: null,
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: null }));

    error = null;
    try {
      createAsyncAction({
        sliceName,
        name: "",
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "" }));

    error = null;
    try {
      createAsyncAction({
        sliceName,
        name: "inva.lidSync",
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva.lidSyncAction" }));

    error = null;
    try {
      createAsyncAction({
        sliceName,
        name: "inva_lidSync",
        func: asyncFunc,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva_lidSyncAction" }));
  });

  test("Should throw correct error when attempting to create async action with invalid func.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const actionName = `${name}Action`;

    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncAction({ storeName: DEFAULT_STORE, sliceName, actionName }));

    error = null;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: [() => { }]
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidFuncAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action with invalid continueWithOnResolved.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const actionName = `${name}Action`;

    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: () => ({}),
        continueWithOnResolved: [() => { }]
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidOnResolvedAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action with invalid continueWithOnRejected.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const actionName = `${name}Action`;

    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: () => ({}),
        continueWithOnRejected: [() => { }]
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidOnRejectedAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create async action with invalid continueWithOnSettled.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const actionName = `${name}Action`;

    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: () => ({}),
        continueWithOnSettled: [() => { }]
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidOnSettledAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });

  test("Should throw correct error when attempting to create existing async action.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async () => ({});
    createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });
    let error;
    try {
      createAsyncAction({
        sliceName,
        name,
        func: asyncFunc,
      });
    } catch (err) { error = err; }

    const actionName = `${name}Action`;
    expect(error).toEqual(new UnableToCreateExistingAction({ storeName: DEFAULT_STORE, sliceName, actionName }));
  });
});