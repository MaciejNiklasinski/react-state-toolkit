import { DEFAULT_STORE } from "../constants/store";
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from "../errors/UnableToCreateImporter";
import {
  // ImportAction Slice
  UnableToImportInvalidNameSliceAction,
  // ImportAction
  UnableToImportInvalidNameAction,
} from '../errors/UnableToImportAction';
import {
  // ImportSelector Slice
  UnableToImportInvalidNameSliceSelector,
  // ImportSelector
  UnableToImportInvalidNameSelector,
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
  test("Should throw correct error when attempting to create importer with invalid storeName.", () => {
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
  test("Should throw correct error when attempting to import action with invalid sliceName.", () => {
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

  test("Should throw correct error when attempting to import action with invalid name.", () => {
    const { importAction } = createImporter({});
    const sliceName = "testSlice";
    const actionName = "someAction";
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
});

describe("import selector validator", () => {
  test("Should throw correct error when attempting to import selector with invalid sliceName.", () => {
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

  test("Should throw correct error when attempting to import selector with invalid name.", () => {
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
});