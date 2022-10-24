import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
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

describe("action factory", () => {
  test("Should be able to create default store valid sync action.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = () => ({});
    const action = createAction({
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;

    expect(action.storeName).toEqual(DEFAULT_STORE);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(actionName);
    expect(typeof action[action.actionName]).toEqual("function");
    expect(typeof action.actionType).toEqual("symbol");
    expect(action.actionType?.description).toEqual(name);
    expect(action.actionType).toEqual(action["VALID_SYNC_ACTION"]);

    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(actionsByType[action.actionType].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType].VALID_SYNC_ACTION).toEqual(action.VALID_SYNC_ACTION);
    expect(typeof actionsByType[action.actionType][actionName]).toEqual("function");
  });

  test("Should be able to create non-default store valid sync action.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = () => ({});
    const action = createAction({
      storeName,
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;

    expect(action.storeName).toEqual(storeName);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(actionName);
    expect(typeof action[action.actionName]).toEqual("function");
    expect(typeof action.actionType).toEqual("symbol");
    expect(action.actionType?.description).toEqual(name);
    expect(action.actionType).toEqual(action["VALID_SYNC_ACTION"]);

    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(actionsByType[action.actionType].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType].VALID_SYNC_ACTION).toEqual(action.VALID_SYNC_ACTION);
    expect(typeof actionsByType[action.actionType][actionName]).toEqual("function");
  });

  test("Should be able to create valid sync action with already suffixed name.", () => {
    const sliceName = "testSlice";
    const name = "validSyncAction";
    const syncFunc = () => ({});
    const action = createAction({
      sliceName,
      name,
      func: syncFunc,
    });

    expect(action.storeName).toEqual(DEFAULT_STORE);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(name);
  });
});

describe("async action factory", () => {
  test("Should be able to create default store valid async action", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async () => ({});
    const action = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;

    expect(action.storeName).toEqual(DEFAULT_STORE);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(actionName);
    expect(typeof action[action.actionName]).toEqual("function");

    expect(typeof action.actionType.PENDING).toEqual("symbol");
    expect(typeof action.actionType.REJECTED).toEqual("symbol");
    expect(typeof action.actionType.RESOLVED).toEqual("symbol");

    expect(action.actionType.PENDING.description).toEqual(name + ".PENDING");
    expect(action.actionType.REJECTED.description).toEqual(name + ".REJECTED");
    expect(action.actionType.RESOLVED.description).toEqual(name + ".RESOLVED");

    expect(action.actionType.PENDING).toEqual(action["VALID_ASYNC_ACTION"].PENDING);
    expect(action.actionType.REJECTED).toEqual(action["VALID_ASYNC_ACTION"].REJECTED);
    expect(action.actionType.RESOLVED).toEqual(action["VALID_ASYNC_ACTION"].RESOLVED);

    expect(typeof action["VALID_ASYNC_ACTION"].PENDING).toEqual("symbol");
    expect(typeof action["VALID_ASYNC_ACTION"].REJECTED).toEqual("symbol");
    expect(typeof action["VALID_ASYNC_ACTION"].RESOLVED).toEqual("symbol");

    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.PENDING].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.PENDING].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.PENDING].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.PENDING].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.PENDING].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.PENDING][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.REJECTED].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.REJECTED].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.REJECTED].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.REJECTED].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.REJECTED].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.REJECTED][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.RESOLVED].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.RESOLVED].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.RESOLVED].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.RESOLVED].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.RESOLVED].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.RESOLVED][actionName]).toEqual("function");
  });

  test("Should be able to create non-default store valid async action", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async () => ({});
    const action = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;

    expect(action.storeName).toEqual(storeName);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(actionName);
    expect(typeof action[action.actionName]).toEqual("function");

    expect(typeof action.actionType.PENDING).toEqual("symbol");
    expect(typeof action.actionType.REJECTED).toEqual("symbol");
    expect(typeof action.actionType.RESOLVED).toEqual("symbol");

    expect(action.actionType.PENDING.description).toEqual(name + ".PENDING");
    expect(action.actionType.REJECTED.description).toEqual(name + ".REJECTED");
    expect(action.actionType.RESOLVED.description).toEqual(name + ".RESOLVED");

    expect(action.actionType.PENDING).toEqual(action["VALID_ASYNC_ACTION"].PENDING);
    expect(action.actionType.REJECTED).toEqual(action["VALID_ASYNC_ACTION"].REJECTED);
    expect(action.actionType.RESOLVED).toEqual(action["VALID_ASYNC_ACTION"].RESOLVED);

    expect(typeof action["VALID_ASYNC_ACTION"].PENDING).toEqual("symbol");
    expect(typeof action["VALID_ASYNC_ACTION"].REJECTED).toEqual("symbol");
    expect(typeof action["VALID_ASYNC_ACTION"].RESOLVED).toEqual("symbol");

    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.PENDING].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.PENDING].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.PENDING].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.PENDING].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.PENDING].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.PENDING][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.REJECTED].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.REJECTED].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.REJECTED].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.REJECTED].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.REJECTED].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.REJECTED][actionName]).toEqual("function");

    expect(actionsByType[action.actionType.RESOLVED].storeName).toEqual(action.storeName);
    expect(actionsByType[action.actionType.RESOLVED].sliceName).toEqual(action.sliceName);
    expect(actionsByType[action.actionType.RESOLVED].actionName).toEqual(action.actionName);
    expect(actionsByType[action.actionType.RESOLVED].actionType).toEqual(action.actionType);
    expect(actionsByType[action.actionType.RESOLVED].VALID_ASYNC_ACTION).toEqual(action.VALID_ASYNC_ACTION);
    expect(typeof actionsByType[action.actionType.RESOLVED][actionName]).toEqual("function");
  });

  test("Should be able to create valid async action with already suffixed name.", () => {
    const sliceName = "testSlice";
    const name = "validAsyncAction";
    const asyncFunc = async () => ({});
    const action = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    expect(action.storeName).toEqual(DEFAULT_STORE);
    expect(action.sliceName).toEqual(sliceName);
    expect(action.actionName).toEqual(name);
  });
});