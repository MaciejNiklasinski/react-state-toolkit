import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";

let stores, slices, actions, actionsByType, selectors;
let createStore, createSlice, createAction, createAsyncAction, createSelector;
const reset = () => {
  stores = {};
  slices = {};
  actions = {};
  actionsByType = {};
  selectors = {};

  ({ createStore } = getStoresFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({ createSlice } = getSlicesFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({
    createAction,
    createAsyncAction
  } = getActionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
  ({ createSelector } = getSelectorsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    selectors,
  }));
};
beforeEach(reset);

describe("slices factory", () => {
  test("Should be able to create valid default store empty slice.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(stores[DEFAULT_STORE].actions).toEqual({});
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: {} });
  });

  test("Should be able to create valid non-default store empty slice.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(stores[storeName].actions).toEqual({});
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: {} });
  });

  test("Should be able to create valid default store empty slice with initial state.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      initialState: { value: 0 },
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(stores[DEFAULT_STORE].actions).toEqual({});
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store empty slice with initial state.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      initialState: { value: 0 },
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(stores[storeName].actions).toEqual({});
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid slice selector.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({ [sliceName]: { validSelector } });
    expect(stores[DEFAULT_STORE].actions).toEqual({});
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([validSelector]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid slice selector.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      storeName,
      sliceName,
      name: "valid",
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({ [sliceName]: { validSelector } });
    expect(stores[storeName].actions).toEqual({});
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([validSelector]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid store selector.", () => {
    const sliceName = "testSlice";
    const { validStoreSelector } = createSelector({
      name: "validStore",
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validStoreSelector],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({ [DEFAULT_SLICE]: { validStoreSelector } });
    expect(stores[DEFAULT_STORE].actions).toEqual({});
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([validStoreSelector]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid store selector.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const { validStoreSelector } = createSelector({
      storeName,
      name: "validStore",
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      sliceSelectors: [validStoreSelector],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({ [DEFAULT_SLICE]: { validStoreSelector } });
    expect(stores[storeName].actions).toEqual({});
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([validStoreSelector]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = (value) => value;
    const { validSyncAction, VALID_SYNC_ACTION } = createAction({
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_SYNC_ACTION]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = (value) => value;
    const { validSyncAction, VALID_SYNC_ACTION } = createAction({
      storeName,
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_SYNC_ACTION]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action with no action handler.", () => {
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = (value) => value;
    const { validSyncAction, VALID_SYNC_ACTION } = createAction({
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_SYNC_ACTION],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action with no action handler.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validSync";
    const syncFunc = (value) => value;
    const { validSyncAction, VALID_SYNC_ACTION } = createAction({
      storeName,
      sliceName,
      name,
      func: syncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_SYNC_ACTION],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid async action with PENDING action handler only.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid async action with PENDING action handler only.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid async action with REJECTED action handler only.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid async action with REJECTED action handler only.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid async action with RESOLVED action handler only.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid async action with RESOLVED action handler only.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const reducer = {
      [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
        state.value = action.payload;
      }
    };
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer,
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: reducer });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action with no async action handler registered by passing whole type object {PENDING,REJECTED,RESOLVED} to noActionHandlers.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action with no async action handler registered by passing whole type object {PENDING,REJECTED,RESOLVED} to noActionHandlers.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action with no async action handler registered by passing PENDING type symbol to noActionHandlers.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.PENDING],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action with no async action handler registered by passing PENDING type symbol to noActionHandlers.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.PENDING],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action with no async action handler registered by passing REJECTED type symbol to noActionHandlers.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.REJECTED],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action with no async action handler registered by passing REJECTED type symbol to noActionHandlers.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.REJECTED],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid default store slice with valid action with no async action handler registered by passing RESOLVED type symbol to noActionHandlers.", () => {
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.RESOLVED],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(DEFAULT_STORE);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].selectors).toEqual({});
    expect(typeof stores[DEFAULT_STORE].actions[sliceName][actionName]).toEqual("function");
    expect(stores[DEFAULT_STORE].reducers).toEqual({ [sliceName]: {} });
    expect(stores[DEFAULT_STORE].slices[sliceName].storeName).toEqual(DEFAULT_STORE);
    expect(stores[DEFAULT_STORE].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[DEFAULT_STORE].slices[sliceName].selectors).toEqual([]);
    expect(stores[DEFAULT_STORE].state).toEqual({ [sliceName]: { value: 0 } });
  });

  test("Should be able to create valid non-default store slice with valid action with no async action handler registered by passing RESOLVED type symbol to noActionHandlers.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const name = "validAsync";
    const asyncFunc = async (value) => new Promise(
      (resolve) => setTimeout(() => resolve(value), 10)
    );
    const { validAsyncAction, VALID_ASYNC_ACTION } = createAsyncAction({
      storeName,
      sliceName,
      name,
      func: asyncFunc,
    });

    const actionName = `${name}Action`;
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
      noHandlerTypes: [VALID_ASYNC_ACTION.RESOLVED],
      initialState: { value: 0 }
    });

    expect(slice.storeName).toEqual(storeName);
    expect(slice.sliceName).toEqual(sliceName);
    expect(stores[storeName].selectors).toEqual({});
    expect(typeof stores[storeName].actions[sliceName][actionName]).toEqual("function");
    expect(stores[storeName].reducers).toEqual({ [sliceName]: {} });
    expect(stores[storeName].slices[sliceName].storeName).toEqual(storeName);
    expect(stores[storeName].slices[sliceName].sliceName).toEqual(sliceName);
    expect(stores[storeName].slices[sliceName].selectors).toEqual([]);
    expect(stores[storeName].state).toEqual({ [sliceName]: { value: 0 } });
  });
});