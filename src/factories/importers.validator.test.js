import { DEFAULT_STORE } from "../constants/store";
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from "../errors/UnableToCreateImporter";
import {
  // ImportAction Slice
  UnableToImportInvalidNameSliceAction,
  UnableToImportUnregisteredSliceAction,
  // ImportAction
  UnableToImportInvalidNameAction,
  UnableToImportUnregisteredAction,
} from '../errors/UnableToImportAction';
import {
  // ImportSelector Slice
  UnableToImportInvalidNameSliceSelector,
  UnableToImportUnregisteredSliceSelector,
  // ImportSelector
  UnableToImportInvalidNameSelector,
  UnableToImportUnregisteredSelector,
} from '../errors/UnableToImportSelector';
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

describe("importer creation validator", () => {
  test("Should throw correct error when attempting to create uninitialized store importer with invalid storeName.", () => {
    let error;
    try {
      createImporter({ storeName: null });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: null }));

    error = null;
    try {
      createImporter({ storeName: "" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "" }));

    error = null;
    try {
      createImporter({ storeName: "inva.lid" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "inva.lid" }));

    error = null;
    try {
      createImporter({ storeName: "inva_lid" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "inva_lid" }));
  });

  test("Should throw correct error when attempting to create initialized store importer with invalid storeName.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    let error;
    try {
      createImporter({ storeName: null });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: null }));

    error = null;
    try {
      createImporter({ storeName: "" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "" }));

    error = null;
    try {
      createImporter({ storeName: "inva.lid" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "inva.lid" }));

    error = null;
    try {
      createImporter({ storeName: "inva_lid" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStoreImporter({ storeName: "inva_lid" }));
  });
});

describe("import action validator", () => {
  test("Should throw correct error when attempting to import uninitialized default store action with invalid sliceName.", () => {
    const { importAction } = createImporter({});
    const actionName = "someAction";
    let error;
    try {
      importAction(null, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: null, actionName }));

    error = null;
    try {
      importAction("", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "", actionName }));

    error = null;
    try {
      importAction("inva.lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva.lid", actionName }));

    error = null;
    try {
      importAction("inva_lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva_lid", actionName }));
  });

  test("Should throw correct error when attempting to import uninitialized non-default store action with invalid sliceName.", () => {
    const storeName = "nonDefault"
    const { importNonDefaultAction } = createImporter({ storeName });
    const actionName = "someAction";
    let error;
    try {
      importNonDefaultAction(null, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: null, actionName }));

    error = null;
    try {
      importNonDefaultAction("", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "", actionName }));

    error = null;
    try {
      importNonDefaultAction("inva.lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "inva.lid", actionName }));

    error = null;
    try {
      importNonDefaultAction("inva_lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "inva_lid", actionName }));
  });
  
  test("Should throw correct error when attempting to import initialized default store action with invalid sliceName.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importAction } = createImporter({});
    const actionName = "someAction";
    let error;
    try {
      importAction(null, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: null, actionName }));

    error = null;
    try {
      importAction("", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "", actionName }));

    error = null;
    try {
      importAction("inva.lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva.lid", actionName }));

    error = null;
    try {
      importAction("inva_lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName: DEFAULT_STORE, sliceName: "inva_lid", actionName }));
  });
  
  test("Should throw correct error when attempting to import initialized non-default store action with invalid sliceName.", () => {
    const storeName = "nonDefault"
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultAction } = createImporter({ storeName });
    const actionName = "someAction";
    let error;
    try {
      importNonDefaultAction(null, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: null, actionName }));

    error = null;
    try {
      importNonDefaultAction("", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "", actionName }));

    error = null;
    try {
      importNonDefaultAction("inva.lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "inva.lid", actionName }));

    error = null;
    try {
      importNonDefaultAction("inva_lid", actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceAction({ storeName, sliceName: "inva_lid", actionName }));
  });

  test("Should throw correct error when attempting to import uninitialized default store action with invalid name.", () => {
    const { importAction } = createImporter({});
    const sliceName = "testSlice";
    let error;
    try {
      importAction(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: null }));

    error = null;
    try {
      importAction(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "" }));

    error = null;
    try {
      importAction(sliceName, "inva.lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva.lidAction" }));

    error = null;
    try {
      importAction(sliceName, "inva_lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva_lidAction" }));
  });

  test("Should throw correct error when attempting to import uninitialized non-default store action with invalid name.", () => {
    const storeName = "nonDefault"
    const { importNonDefaultAction } = createImporter({ storeName });
    const sliceName = "testSlice";
    let error;
    try {
      importNonDefaultAction(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: null }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "" }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "inva.lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "inva.lidAction" }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "inva_lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "inva_lidAction" }));
  });

  test("Should throw correct error when attempting to import initialized default store action with invalid name.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importAction } = createImporter({});
    let error;
    try {
      importAction(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: null }));

    error = null;
    try {
      importAction(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "" }));

    error = null;
    try {
      importAction(sliceName, "inva.lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva.lidAction" }));

    error = null;
    try {
      importAction(sliceName, "inva_lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName: DEFAULT_STORE, sliceName, actionName: "inva_lidAction" }));
  });

  test("Should throw correct error when attempting to import initialized non-default store action with invalid name.", () => {
    const storeName = "nonDefault"
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultAction } = createImporter({ storeName });
    let error;
    try {
      importNonDefaultAction(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: null }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "" }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "inva.lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "inva.lidAction" }));

    error = null;
    try {
      importNonDefaultAction(sliceName, "inva_lidAction");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameAction({ storeName, sliceName, actionName: "inva_lidAction" }));
  });

  test("Should throw correct error when attempting to import initialized default store unregistered slice action.", () => {
    const unregisteredSliceName = "unregisteredSlice";
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importAction } = createImporter({});
    const actionName = "someAction";
    let error;
    try {
      importAction(unregisteredSliceName, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSliceAction({ storeName: DEFAULT_STORE, sliceName: unregisteredSliceName, actionName }));
  });

  test("Should throw correct error when attempting to import initialized non-default store unregistered slice action.", () => {
    const storeName = "nonDefault"
    const unregisteredSliceName = "unregisteredSlice";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultAction } = createImporter({ storeName });
    const actionName = "someAction";
    let error;
    try {
      importNonDefaultAction(unregisteredSliceName, actionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSliceAction({ storeName, sliceName: unregisteredSliceName, actionName }));
  });
  
  test("Should throw correct error when attempting to import initialized default store unregistered action.", () => {
    const unregisteredActionName = "unregisteredAction";
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importAction } = createImporter({});
    let error;
    try {
      importAction(sliceName, unregisteredActionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredAction({ storeName: DEFAULT_STORE, sliceName, actionName: unregisteredActionName }));
  });
  
  test("Should throw correct error when attempting to import initialized non-default store unregistered action.", () => {
    const storeName = "nonDefault"
    const unregisteredActionName = "unregisteredAction";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultAction } = createImporter({ storeName });
    let error;
    try {
      importNonDefaultAction(sliceName, unregisteredActionName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredAction({ storeName, sliceName, actionName: unregisteredActionName }));
  });
});

describe("import selector validator", () => {
  test("Should throw correct error when attempting to import uninitialized non-default store selector with invalid sliceName.", () => {
    const { importSelector } = createImporter({});
    const selectorName = "someSelector";
    let error;
    try {
      importSelector(null, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: null, selectorName }));

    error = null;
    try {
      importSelector("", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "", selectorName }));

    error = null;
    try {
      importSelector("inva.lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva.lid", selectorName }));

    error = null;
    try {
      importSelector("inva_lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva_lid", selectorName }));
  });

  test("Should throw correct error when attempting to import uninitialized non-default store selector with invalid sliceName.", () => {
    const storeName = "nonDefault"
    const { importNonDefaultSelector } = createImporter({ storeName });
    const selectorName = "someSelector";
    let error;
    try {
      importNonDefaultSelector(null, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: null, selectorName }));

    error = null;
    try {
      importNonDefaultSelector("", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "", selectorName }));

    error = null;
    try {
      importNonDefaultSelector("inva.lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "inva.lid", selectorName }));

    error = null;
    try {
      importNonDefaultSelector("inva_lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "inva_lid", selectorName }));
  });

  test("Should throw correct error when attempting to import uninitialized default store selector with invalid name.", () => {
    const { importSelector } = createImporter({});
    const sliceName = "testSlice";
    const selectorName = "someSelector";
    let error;
    try {
      importSelector(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: null }));

    error = null;
    try {
      importSelector(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "" }));

    error = null;
    try {
      importSelector(sliceName, "inva.lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva.lidSelector" }));

    error = null;
    try {
      importSelector(sliceName, "inva_lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva_lidSelector" }));
  });

  test("Should throw correct error when attempting to import uninitialized non-default store selector with invalid name.", () => {
    const storeName = "nonDefault"
    const { importNonDefaultSelector } = createImporter({ storeName });
    const sliceName = "testSlice";
    const selectorName = "someSelector";
    let error;
    try {
      importNonDefaultSelector(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: null }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "" }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "inva.lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "inva.lidSelector" }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "inva_lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "inva_lidSelector" }));
  });

  test("Should throw correct error when attempting to import initialized default store selector with invalid sliceName.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importSelector } = createImporter({});
    const selectorName = "someSelector";
    let error;
    try {
      importSelector(null, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: null, selectorName }));

    error = null;
    try {
      importSelector("", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "", selectorName }));

    error = null;
    try {
      importSelector("inva.lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva.lid", selectorName }));

    error = null;
    try {
      importSelector("inva_lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName: DEFAULT_STORE, sliceName: "inva_lid", selectorName }));
  });

  test("Should throw correct error when attempting to import initialized non-default store selector with invalid sliceName.", () => {
    const storeName = "nonDefault"
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importNonDefaultSelector } = createImporter({ storeName });
    const selectorName = "someSelector";
    let error;
    try {
      importNonDefaultSelector(null, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: null, selectorName }));

    error = null;
    try {
      importNonDefaultSelector("", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "", selectorName }));

    error = null;
    try {
      importNonDefaultSelector("inva.lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "inva.lid", selectorName }));

    error = null;
    try {
      importNonDefaultSelector("inva_lid", selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSliceSelector({ storeName, sliceName: "inva_lid", selectorName }));
  });

  test("Should throw correct error when attempting to import initialized default store selector with invalid name.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importSelector } = createImporter({});
    let error;
    try {
      importSelector(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: null }));

    error = null;
    try {
      importSelector(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "" }));

    error = null;
    try {
      importSelector(sliceName, "inva.lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva.lidSelector" }));

    error = null;
    try {
      importSelector(sliceName, "inva_lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: "inva_lidSelector" }));
  });

  test("Should throw correct error when attempting to import initialized non-default store selector with invalid name.", () => {
    const storeName = "nonDefault"
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importNonDefaultSelector } = createImporter({ storeName });
    let error;
    try {
      importNonDefaultSelector(sliceName, null);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: null }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "" }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "inva.lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "inva.lidSelector" }));

    error = null;
    try {
      importNonDefaultSelector(sliceName, "inva_lidSelector");
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName: "inva_lidSelector" }));
  });

  test("Should throw correct error when attempting to import initialized default store unregistered slice selector.", () => {
    const unregisteredSliceName = "unregisteredSlice";
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importSelector } = createImporter({});
    const selectorName = "someSelector";
    let error;
    try {
      importSelector(unregisteredSliceName, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSliceSelector({ storeName: DEFAULT_STORE, sliceName: unregisteredSliceName, selectorName }));
  });

  test("Should throw correct error when attempting to import initialized non-default store unregistered slice selector.", () => {
    const storeName = "nonDefault"
    const unregisteredSliceName = "unregisteredSlice";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultSelector } = createImporter({ storeName });
    const selectorName = "someSelector";
    let error;
    try {
      importNonDefaultSelector(unregisteredSliceName, selectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSliceSelector({ storeName, sliceName: unregisteredSliceName, selectorName }));
  });
  
  test("Should throw correct error when attempting to import initialized default store unregistered selector.", () => {
    const unregisteredSelectorName = "unregisteredSelector";
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    const { importSelector } = createImporter({});
    let error;
    try {
      importSelector(sliceName, unregisteredSelectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSelector({ storeName: DEFAULT_STORE, sliceName, selectorName: unregisteredSelectorName }));
  });
  
  test("Should throw correct error when attempting to import initialized non-default store unregistered selector.", () => {
    const storeName = "nonDefault"
    const unregisteredSelectorName = "unregisteredSelector";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    const { importNonDefaultSelector } = createImporter({ storeName });
    let error;
    try {
      importNonDefaultSelector(sliceName, unregisteredSelectorName);
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToImportUnregisteredSelector({ storeName, sliceName, selectorName: unregisteredSelectorName }));
  });
});