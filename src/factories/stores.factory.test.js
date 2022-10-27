import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getSliceId } from "./ids";

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

describe("stores factory", () => {
  test("Should be able to create valid default store with single empty slice.", () => {
    const sliceName = "emptySlice";
    const emptySlice = createSlice({
      name: sliceName,
      reducer: {},
    });
    const {
      useStoreState,
      useSelector,
      getState,
      getActions,
      getSelectors,
    } = createStore({
      storeSlices: { emptySlice },
    });

    expect(typeof useStoreState).toEqual("function");
    expect(typeof useSelector).toEqual("function");
    expect(typeof getState).toEqual("function");
    expect(typeof getActions).toEqual("function");
    expect(typeof getSelectors).toEqual("function");

    expect(stores[DEFAULT_STORE].useStoreState).toEqual(useStoreState);
    expect(stores[DEFAULT_STORE].useSelector).toEqual(useSelector);
    expect(stores[DEFAULT_STORE].getState).toEqual(getState);
    expect(stores[DEFAULT_STORE].getActions).toEqual(getActions);
    expect(stores[DEFAULT_STORE].getSelectors).toEqual(getSelectors);

    expect(stores[DEFAULT_STORE].initialized).toEqual(true);
    expect(stores[DEFAULT_STORE].renderTriggers).toEqual(new Map());
    expect(stores[DEFAULT_STORE].subscriptions).toEqual(new Map());
    expect(stores[DEFAULT_STORE].subscriptionsById).toEqual(new Map());
    expect(typeof stores[DEFAULT_STORE].dispatch).toEqual("function");
    expect(stores[DEFAULT_STORE].actions).toEqual({});
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(typeof stores[DEFAULT_STORE].slices[sliceName].getSliceState).toEqual("function");
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
  });

  test("Should be able to create valid non-default store with single empty slice.", () => {
    const storeName = "nonDefault";
    const sliceName = "emptySlice";
    const emptySlice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    const {
      useNonDefaultStoreState,
      useNonDefaultSelector,
      getNonDefaultState,
      getNonDefaultActions,
      getNonDefaultSelectors,
    } = createStore({
      name: storeName,
      storeSlices: { emptySlice },
    });

    expect(typeof useNonDefaultStoreState).toEqual("function");
    expect(typeof useNonDefaultSelector).toEqual("function");
    expect(typeof getNonDefaultState).toEqual("function");
    expect(typeof getNonDefaultActions).toEqual("function");
    expect(typeof getNonDefaultSelectors).toEqual("function");

    expect(stores[storeName].useStoreState).toEqual(useNonDefaultStoreState);
    expect(stores[storeName].useSelector).toEqual(useNonDefaultSelector);
    expect(stores[storeName].getState).toEqual(getNonDefaultState);
    expect(stores[storeName].getActions).toEqual(getNonDefaultActions);
    expect(stores[storeName].getSelectors).toEqual(getNonDefaultSelectors);

    expect(stores[storeName].initialized).toEqual(true);
    expect(stores[storeName].renderTriggers).toEqual(new Map());
    expect(stores[storeName].subscriptions).toEqual(new Map());
    expect(stores[storeName].subscriptionsById).toEqual(new Map());
    expect(typeof stores[storeName].dispatch).toEqual("function");
    expect(stores[storeName].actions).toEqual({});
    expect(stores[storeName].selectors).toEqual({});
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(typeof stores[storeName].slices[sliceName].getSliceState).toEqual("function");
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
  });
});