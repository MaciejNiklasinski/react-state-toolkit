import { DEFAULT_STORE } from "../constants/store";
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from "../errors/UnableToCreateImporter";
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
  test("Should be able to create default store importer.", () => {
    const importer = createImporter();

    expect(typeof importer.importAction).toEqual("function");
    expect(typeof importer.importSelector).toEqual("function");
    expect(actionsImports[DEFAULT_STORE]).toEqual({});
    expect(selectorsImports[DEFAULT_STORE]).toEqual({});    
  });
  
  test("Should be able to create non-default store importer.", () => {
    const storeName = "nonDefault"
    const importer = createImporter({ storeName });

    expect(typeof importer.importNonDefaultAction).toEqual("function");
    expect(typeof importer.importNonDefaultSelector).toEqual("function");
    expect(actionsImports[storeName]).toEqual({});
    expect(selectorsImports[storeName]).toEqual({});    
  });
});