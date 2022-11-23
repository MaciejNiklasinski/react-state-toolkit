import { DEFAULT_STORE, DEFAULT_SLICE, STATUS } from "../constants/store";
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
      withStore,
      usePrevStoreState,
      useStoreState,
      useSelector,
      usePrevSelector,
      getState,
      getActions,
      getSelectors,
      getHooks,
    } = createStore({
      storeSlices: { emptySlice },
    });

    expect(typeof withStore).toEqual("function");
    expect(typeof useStoreState).toEqual("function");
    expect(typeof usePrevStoreState).toEqual("function");
    expect(typeof useSelector).toEqual("function");
    expect(typeof usePrevSelector).toEqual("function");
    expect(typeof getState).toEqual("function");
    expect(typeof getActions).toEqual("function");
    expect(typeof getSelectors).toEqual("function");
    expect(typeof getHooks).toEqual("function");

    expect(stores[DEFAULT_STORE].withStore).toEqual(withStore);
    expect(stores[DEFAULT_STORE].useStoreState).toEqual(useStoreState);
    expect(stores[DEFAULT_STORE].usePrevStoreState).toEqual(usePrevStoreState);
    expect(stores[DEFAULT_STORE].useSelector).toEqual(useSelector);
    expect(stores[DEFAULT_STORE].usePrevSelector).toEqual(usePrevSelector);
    expect(stores[DEFAULT_STORE].getState).toEqual(getState);
    expect(stores[DEFAULT_STORE].getActions).toEqual(getActions);
    expect(stores[DEFAULT_STORE].getSelectors).toEqual(getSelectors);
    expect(stores[DEFAULT_STORE].getHooks).toEqual(getHooks);

    expect(stores[DEFAULT_STORE].initialized).toEqual(true);
    expect(stores[DEFAULT_STORE].status).toEqual(STATUS.READY);
    expect(stores[DEFAULT_STORE].triggersStack).toEqual(new Map());
    expect(stores[DEFAULT_STORE].subscriptionsMatrix).toEqual(new Map());
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
      withStore,
      useStoreState,
      usePrevStoreState,
      useSelector,
      usePrevSelector,
      getState,
      getActions,
      getSelectors,
      getHooks,
      withNonDefaultStore,
      useNonDefaultStoreState,
      useNonDefaultPrevStoreState,
      useNonDefaultSelector,
      useNonDefaultPrevSelector,
      getNonDefaultState,
      getNonDefaultActions,
      getNonDefaultSelectors,
      getNonDefaultHooks,
    } = createStore({
      name: storeName,
      storeSlices: { emptySlice },
    });

    expect(typeof withStore).toEqual("function");
    expect(typeof useStoreState).toEqual("function");
    expect(typeof usePrevStoreState).toEqual("function");
    expect(typeof useSelector).toEqual("function");
    expect(typeof usePrevSelector).toEqual("function");
    expect(typeof getState).toEqual("function");
    expect(typeof getActions).toEqual("function");
    expect(typeof getSelectors).toEqual("function");
    expect(typeof getHooks).toEqual("function");

    expect(withStore).toEqual(withNonDefaultStore);
    expect(useStoreState).toEqual(useNonDefaultStoreState);
    expect(usePrevStoreState).toEqual(useNonDefaultPrevStoreState);
    expect(useSelector).toEqual(useNonDefaultSelector);
    expect(usePrevSelector).toEqual(useNonDefaultPrevSelector);
    expect(getState).toEqual(getNonDefaultState);
    expect(getActions).toEqual(getNonDefaultActions);
    expect(getSelectors).toEqual(getNonDefaultSelectors);
    expect(getHooks).toEqual(getNonDefaultHooks);

    expect(stores[storeName].withStore).toEqual(withNonDefaultStore);
    expect(stores[storeName].useStoreState).toEqual(useNonDefaultStoreState);
    expect(stores[storeName].usePrevStoreState).toEqual(useNonDefaultPrevStoreState);
    expect(stores[storeName].useSelector).toEqual(useNonDefaultSelector);
    expect(stores[storeName].usePrevSelector).toEqual(useNonDefaultPrevSelector);
    expect(stores[storeName].getState).toEqual(getNonDefaultState);
    expect(stores[storeName].getActions).toEqual(getNonDefaultActions);
    expect(stores[storeName].getSelectors).toEqual(getNonDefaultSelectors);

    expect(stores[storeName].initialized).toEqual(true);
    expect(stores[storeName].status).toEqual(STATUS.READY);
    expect(stores[storeName].triggersStack).toEqual(new Map());
    expect(stores[storeName].subscriptionsMatrix).toEqual(new Map());
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