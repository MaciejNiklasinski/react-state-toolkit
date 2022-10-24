import { DEFAULT_SLICE, DEFAULT_STORE } from "../constants/store";
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from "../errors/UnableToCreateImporter";
import { 
  // Importer Action Invocation
  UnableToInvokeUninitializedStoreAction,
} from "../errors/UnableToInvokeUninitializedStoreAction";
import {
  // Importer Selector Invocation
  UnableToInvokeUninitializedStoreSelector,
} from "../errors/UnableToInvokeUninitializedStoreSelector";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getActionId, getSelectorId } from "./ids";

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

describe("importer action", () => {
  test("Should be able to import default store sync action before its creation.", () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const { setValueAction: importedSetValue, isReady } = importAction(sliceName, actionName);
    expect(typeof importedSetValue).toEqual("function");
    expect(importedSetValue.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: actionName,
      func: (value) => value,
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should be able to import default store async action before its creation.", () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const { setValueAction: importedSetValue, isReady } = importAction(sliceName, actionName);
    expect(typeof importedSetValue).toEqual("function");
    expect(importedSetValue.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { setValueAction, SET_VALUE_ACTION } = createAsyncAction({
      sliceName,
      name: actionName,
      func: async (value) => new Promise(
        (resolve) => setTimeout(resolve(value), 0)
      ),
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION.RESOLVED]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should throw correct error when imported sync action gets invoked before store creation.", () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const actionId = getActionId({ storeName: DEFAULT_STORE, sliceName, actionName });
    const { setValueAction: importedSetValue, isReady } = importAction(sliceName, actionName);
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: actionName,
      func: (value) => value,
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    let error;
    try { importedSetValue(1); }
    catch (err) { error = err; };
    expect(error).toEqual(new UnableToInvokeUninitializedStoreAction({ actionId }));
  });

  test("Should throw correct error when imported async action gets invoked before store creation.", () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const actionId = getActionId({ storeName: DEFAULT_STORE, sliceName, actionName });
    const { setValueAction: importedSetValue, isReady } = importAction(sliceName, actionName);
    const { setValueAction, SET_VALUE_ACTION } = createAsyncAction({
      sliceName,
      name: actionName,
      func: (value) => value,
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION.RESOLVED]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    let error;
    try { importedSetValue(1); }
    catch (err) { error = err; };
    expect(error).toEqual(new UnableToInvokeUninitializedStoreAction({ actionId }));
  });

  test("Should be able to invoke imported sync action after store creation.", () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const { setValueAction: importedSetValue } = importAction(sliceName, actionName);
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: actionName,
      func: (value) => value,
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });
    const { getState } = createStore({
      storeSlices: { slice },
    });
    importedSetValue(1);
    const sliceState = getState(sliceName);
    expect(sliceState.value).toEqual(1);
  });

  test("Should be able to invoke imported async action after store creation.", async () => {
    const { importAction } = createImporter();
    const sliceName = "testSlice";
    const actionName = "setValueAction";
    const { setValueAction: importedSetValue } = importAction(sliceName, actionName);
    const { setValueAction, SET_VALUE_ACTION } = createAsyncAction({
      sliceName,
      name: actionName,
      func: async (value) => new Promise(
        (resolve) => setTimeout(resolve(value), 0)
      ),
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION.RESOLVED]: (state, action) => {
          state.value = action.payload;
        }
      },
      initialState: { value: 0 }
    });    
    const { getState } = createStore({
      storeSlices: { slice },
    });
    await importedSetValue(1);
    const sliceState = getState(sliceName);
    expect(sliceState.value).toEqual(1);
  });
});

describe("importer selector", () => {
  test("Should be able to import default store slice selector before its creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(sliceName, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      sliceName,
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should be able to import default store slice-registered store selector before its creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should be able to import default store selector before its creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
      storeSelectors: { valueSelector },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should throw correct error when imported slice selector gets invoked before store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(sliceName, selectorName);
    const { valueSelector } = createSelector({
      sliceName,
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    let error;
    try { importedValueSelector({}); }
    catch (err) { error = err };
    expect(error).toEqual(new UnableToInvokeUninitializedStoreSelector({ selectorId }));
  });

  test("Should throw correct error when imported slice-registered store selector gets invoked before store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    let error;
    try { importedValueSelector({}); }
    catch (err) { error = err };
    expect(error).toEqual(new UnableToInvokeUninitializedStoreSelector({ selectorId }));
  });

  test("Should throw correct error when imported store selector gets invoked before store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    let error;
    try { importedValueSelector({}); }
    catch (err) { error = err };
    expect(error).toEqual(new UnableToInvokeUninitializedStoreSelector({ selectorId }));
  });
  
  test("Should be able to invoke imported slice selector after store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(sliceName, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      sliceName,
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should be able to invoke imported slice-registered store selector after store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: { valueSelector },
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
    });
    expect(isReady()).toEqual(true);
  });

  test("Should be able to invoke imported store selector after store creation.", () => {
    const { importSelector } = createImporter();
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });
    const { valueSelector: importedValueSelector, isReady } = importSelector(DEFAULT_SLICE, selectorName);
    expect(typeof importedValueSelector).toEqual("function");
    expect(importedValueSelector.__selectorId).toEqual(selectorId);
    expect(importedValueSelector.__isImportWrapper).toEqual(true);
    expect(isReady()).toEqual(false);
    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      initialState: { value: 0 }
    });
    expect(isReady()).toEqual(false);
    createStore({
      storeSlices: { slice },
      storeSelectors: { valueSelector },
    });
    expect(isReady()).toEqual(true);
  });
});