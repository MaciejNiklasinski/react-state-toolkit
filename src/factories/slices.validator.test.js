import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Slice Store
  UnableToCreateInvalidNameStoreSlice,
  UnableToCreateInitializedStoreSlice,
  // Slice
  UnableToCreateInvalidNameSlice,
  UnableToCreateReservedNameSlice,
  UnableToCreateExistingSlice,
  // Slice Actions
  UnableToCreateNoReducerSlice,
  UnableToCreateUnknownActionHandlerReducerSlice,
  UnableToCreateForeignStoreActionHandlerReducerSlice,
  UnableToCreateForeignSliceActionHandlerReducerSlice,
  UnableToCreateMissingActionHandlerReducerSlice,
  // Slice Sectors
  UnableToCreateNoSelectorsSlice,
  UnableToCreateUnknownSelectorSlice,
  UnableToCreateForeignStoreSelectorSlice,
  UnableToCreateForeignSliceSelectorSlice,
  UnableToCreateForeignRegisteredSliceSelectorSlice,
  UnableToCreateMissingSliceSelectorSlice,
} from "../errors/UnableToCreateSlice";
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

describe("slices validator", () => {
  test("Should throw correct error when attempting to create slice with invalid storeName.", () => {
    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        storeName: null,
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSlice({ storeName: null, sliceName }));

    error = null;
    try {
      createSlice({
        storeName: "",
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSlice({ storeName: "", sliceName }));

    error = null;
    try {
      createSlice({
        storeName: "inva.lidSlice",
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSlice({ storeName: "inva.lidSlice", sliceName }));

    error = null;
    try {
      createSlice({
        storeName: "inva_lidSlice",
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreSlice({ storeName: "inva_lidSlice", sliceName }));
  });

  test("Should throw correct error when attempting to create slice for already initialized store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStoreSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice with invalid name.", () => {
    let error;
    try {
      createSlice({
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSlice({ storeName: DEFAULT_STORE }));

    error = null;
    try {
      createSlice({
        name: null,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSlice({ storeName: DEFAULT_STORE, sliceName: null }));

    error = null;
    try {
      createSlice({
        name: "",
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSlice({ storeName: DEFAULT_STORE, sliceName: "" }));

    error = null;
    try {
      createSlice({
        name: "inva.lidSlice",
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSlice({ storeName: DEFAULT_STORE, sliceName: "inva.lidSlice" }));

    error = null;
    try {
      createSlice({
        name: "inva_lidSlice",
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameSlice({ storeName: DEFAULT_STORE, sliceName: "inva_lidSlice" }));
  });

  test("Should throw correct error when attempting to create slice with reserved name.", () => {
    let error;
    try {
      createSlice({
        name: DEFAULT_SLICE,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateReservedNameSlice({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create existing slice.", () => {
    const sliceName = "testSlice";
    createSlice({
      name: sliceName,
      reducer: {},
    });
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateExistingSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice without reducer.", () => {
    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateNoReducerSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice with unknown action handler reducer.", () => {
    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {
          unknownActionHandler: (state, action) => { }
        }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownActionHandlerReducerSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice with foreign store action handler reducer.", () => {
    const foreignStoreName = "foreignStore";
    const foreignSliceName = "foreignSlice";
    const foreignName = "foreignSync";
    const foreignSyncFunc = () => ({});
    const {
      actionName: foreignActionName,
      FOREIGN_SYNC_ACTION
    } = createAction({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      name: foreignName,
      func: foreignSyncFunc,
    });

    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {
          [FOREIGN_SYNC_ACTION]: (state, action) => { }
        }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignStoreActionHandlerReducerSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      actionStoreName: foreignStoreName,
      actionSliceName: foreignSliceName,
      actionName: foreignActionName
    }));
  });

  test("Should throw correct error when attempting to create slice with foreign slice action handler reducer.", () => {
    const foreignSliceName = "foreignSlice";
    const foreignName = "foreignSync";
    const foreignSyncFunc = () => ({});
    const {
      actionName: foreignActionName,
      FOREIGN_SYNC_ACTION
    } = createAction({
      sliceName: foreignSliceName,
      name: foreignName,
      func: foreignSyncFunc,
    });

    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {
          [FOREIGN_SYNC_ACTION]: (state, action) => { }
        }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignSliceActionHandlerReducerSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      actionSliceName: foreignSliceName,
      actionName: foreignActionName
    }));
  });

  test("Should throw correct error when attempting to create slice with missing store action handler reducer.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = () => ({});
    const { actionName } = createAction({
      sliceName,
      name: name,
      func: syncFunc,
    });

    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingActionHandlerReducerSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      actionName
    }));
  });

  test("Should throw correct error when attempting to create slice with no sliceSelectors.", () => {
    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: null,
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateNoSelectorsSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice with unknown selector.", () => {
    const sliceName = "testSlice";
    const unknownSelector = (state) => state;
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: { unknownSelector },
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSelectorSlice({ storeName: DEFAULT_STORE, sliceName }));
  });

  test("Should throw correct error when attempting to create slice with foreign store selector.", () => {
    const foreignStoreName = "foreignStore";
    const foreignSliceName = "foreignSlice";
    const foreignName = "foreign";
    const { foreignSelector } = createSelector({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      name: foreignName,
      funcs: [(state) => state],
    });

    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: { foreignSelector },
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignStoreSelectorSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      selectorId: foreignSelector.__selectorId
    }));
  });

  test("Should throw correct error when attempting to create slice with foreign slice selector.", () => {
    const foreignSliceName = "foreignSlice";
    const foreignName = "foreign";
    const { foreignSelector } = createSelector({
      sliceName: foreignSliceName,
      name: foreignName,
      funcs: [(state) => state],
    });

    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: { foreignSelector },
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignSliceSelectorSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      selectorId: foreignSelector.__selectorId
    }));
  });

  test("Should throw correct error when attempting to create slice with foreign slice registered store selector.", () => {
    const foreignSliceName = "foreignSlice";
    const foreignRegisteredName = "foreignRegistered";
    const { foreignRegisteredSelector } = createSelector({
      name: foreignRegisteredName,
      funcs: [(state) => state],
    });

    createSlice({
      name: foreignSliceName,
      reducer: {},
      sliceSelectors: { foreignRegisteredSelector },
    });

    const sliceName = "testSlice";
    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: { foreignRegisteredSelector },
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignRegisteredSliceSelectorSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      selectorSliceName: foreignSliceName,
      selectorId: foreignRegisteredSelector.__selectorId
    }));
  });

  test("Should throw correct error when attempting to create slice with missing slice selector.", () => {
    const sliceName = "testSlice";
    const missingName = "missing";
    const { missingSelector } = createSelector({
      sliceName,
      name: missingName,
      funcs: [(state) => state],
    });

    let error;
    try {
      createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: {},
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingSliceSelectorSlice({
      storeName: DEFAULT_STORE,
      sliceName,
      selectorId: missingSelector.__selectorId
    }));
  });
});