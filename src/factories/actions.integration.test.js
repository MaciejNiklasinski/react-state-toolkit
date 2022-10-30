import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Action Invocation
  UnableToInvokeUninitializedStoreAction
} from "../errors/UnableToInvokeUninitializedStoreAction";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getActionId } from "./ids";

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

describe("sync action", () => {
  describe("Can only be executed when store is initialized", () => {
    test("Should throw error when executed before store creation.", () => {
      const sliceName = "testSlice";
      const name = "validSync";
      const actionName = `${name}Action`;
      const actionId = getActionId({ storeName: DEFAULT_STORE, sliceName, actionName });
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: () => ({}),
      });
      createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => { }
        }
      });
      let error;
      try { validSyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new UnableToInvokeUninitializedStoreAction({ actionId }));
    });

    test("Should not throw error when executed after store creation.", () => {
      const sliceName = "testSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: () => ({}),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => { }
        }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error = null;
      try { validSyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(null);
    });
  });

  describe("Can update store only slice state correctly", () => {
    test("Should correctly update when action got executed without error.", () => {
      const sliceName = "testSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: (value) => value,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      validSyncAction("Executed");
      const newState = store.getState();
      const { [sliceName]: newSliceState } = newState;
      expect(oldState === newState).toEqual(false);
      expect(oldSliceState === newSliceState).toEqual(false);
      expect(newSliceState.value).toEqual("Executed");
    });

    test("Should not update when action got executed with error.", () => {
      const sliceName = "testSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: () => { throw new Error(); },
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      let error = null;
      try { validSyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const { [sliceName]: newSliceState } = newState;
      expect(oldState === newState).toEqual(true);
      expect(oldSliceState === newSliceState).toEqual(true);
      expect(newSliceState.value).toEqual("Not yet executed");
    });
  });

  describe("Can update one store slice state without effecting same store other slice state", () => {
    test("Should correctly update when action got executed without error.", () => {
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: (value) => value,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      validSyncAction("Executed");
      const newState = store.getState();
      const { [sliceName]: newSliceState, [otherSliceName]: otherNewSliceState } = newState;
      expect(oldState === newState).toEqual(false);
      expect(oldSliceState === newSliceState).toEqual(false);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(newSliceState.value).toEqual("Executed");
    });

    test("Should not update when action got executed with error.", () => {
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: () => { throw new Error(); },
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;

      let error = null;
      try { validSyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const { [sliceName]: newSliceState, [otherSliceName]: otherNewSliceState } = newState;
      expect(oldState === newState).toEqual(true);
      expect(oldSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(newSliceState.value).toEqual("Not yet executed");
    });
  });

  describe("Can update one store slice state without effecting other store slice state", () => {
    test("Should correctly update when action got executed without error.", () => {
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: (value) => value,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      validSyncAction("Executed");
      const newState = store.getState();
      const otherNewState = otherStore.getOtherState();
      const { [sliceName]: newSliceState } = newState;
      const { [otherSliceName]: otherNewSliceState } = otherNewState;
      expect(oldState === newState).toEqual(false);
      expect(otherOldState === otherNewState).toEqual(true);
      expect(oldSliceState === newSliceState).toEqual(false);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(newSliceState.value).toEqual("Executed");
    });

    test("Should not update when action got executed with error.", () => {
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validSync";
      const {
        validSyncAction,
        VALID_SYNC_ACTION
      } = createAction({
        sliceName,
        name,
        func: () => { throw new Error(); },
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_SYNC_ACTION]: (state, action) => {
            state.value = action.payload;
          }
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;

      let error = null;
      try { validSyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const otherNewState = otherStore.getOtherState();
      const { [sliceName]: newSliceState } = newState;
      const { [otherSliceName]: otherNewSliceState } = otherNewState;
      expect(oldState === newState).toEqual(true);
      expect(otherOldState === otherNewState).toEqual(true);
      expect(oldSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(newSliceState.value).toEqual("Not yet executed");
    });
  });
});

describe("async action", () => {
  describe("Can only be executed when store is initialized", () => {
    test("Should throw error when executed before store creation.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const actionName = `${name}Action`;
      const actionId = getActionId({ storeName: DEFAULT_STORE, sliceName, actionName });
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve) => setTimeout(() => resolve({}), 10)
        ),
      });
      createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => { }
        }
      });
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new UnableToInvokeUninitializedStoreAction({ actionId }));

    });

    test("Should not throw error when executed after store creation.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve) => setTimeout(() => resolve({}), 10)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => { }
        }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error = null;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(null);
    });
  });

  describe("Can manage whether async action error will be re-thrown using rethrow flag", () => {
    test("Should rethrow error if action with REJECTED action handler and rethrow flag is true (default) executed with error.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error("Rejected"));
    });

    test("Should rethrow error if action without REJECTED action handler and rethrow flag is true (default) executed with error.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        noHandlerTypes: [VALID_ASYNC_ACTION],
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error("Rejected"));
    });

    test("Should not rethrow error if action with REJECTED action handler and rethrow flag is false executed with error.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
        rethrow: false
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error = null;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(null);
    });

    test("Should not rethrow error if action without REJECTED action handler and rethrow flag is false executed with error.", async () => {
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
        rethrow: false
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        noHandlerTypes: [VALID_ASYNC_ACTION],
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      let error = null
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(null);
    });
  });

  describe("Can update store only slice state correctly", () => {
    test("Should correctly update when action with PENDING action handler got executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      expect(pendingState === resolvedState).toEqual(true);
      expect(pendingSliceState === resolvedSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING]);
    });

    test("Should correctly update when action with PENDING action handler got executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error()), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const { [sliceName]: newSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING]);
    });

    test("Should correctly update when action with REJECTED action handlers got executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });

    test("Should not update when action without REJECTED action handler got executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        noHandlerTypes: [VALID_ASYNC_ACTION],
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      expect(error).toEqual(new Error("Rejected"));
      executionOrder.push("settled");
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(true);
      expect(oldSliceState === rejectedSliceState).toEqual(true);
      expect(executionOrder).toEqual(["settled"]);
    });

    test("Should correctly update when action with RESOLVED action handlers got executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      await validAsyncAction("Resolved");
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers got executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => ({})
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      let error = null;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(null);
      const newState = store.getState();
      const { [sliceName]: newSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers got executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers got executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(pendingState === resolvedState).toEqual(false);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers got executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const newState = store.getState();
      const { [sliceName]: newSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action got handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(pendingState === resolvedState).toEqual(false);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action got handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });
  });

  describe("Can update one store slice state without effecting same store other slice state", () => {
    test("Should correctly update when action with PENDING action handler executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState, [otherSliceName]: otherResolvedSliceState } = resolvedState;
      expect(pendingState === resolvedState).toEqual(true);
      expect(pendingSliceState === resolvedSliceState).toEqual(true);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING action handler executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error()), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const { [sliceName]: newSliceState, [otherSliceName]: otherNewSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with REJECTED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState, [otherSliceName]: rejectedOtherSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should not update when action without REJECTED action handler executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        noHandlerTypes: [VALID_ASYNC_ACTION],
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState, [otherSliceName]: rejectedOtherSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(true);
      expect(oldSliceState === rejectedSliceState).toEqual(true);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(executionOrder).toEqual(["settled"]);
    });

    test("Should correctly update when action with RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      await validAsyncAction("Resolved");
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState, [otherSliceName]: otherResolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => ({})
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error = null;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(null);
      const newState = store.getState();
      const { [sliceName]: newSliceState, [otherSliceName]: otherNewSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState, [otherSliceName]: rejectedOtherSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(otherPendingSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState, [otherSliceName]: otherResolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(pendingState === resolvedState).toEqual(false);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(otherPendingSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const newState = store.getState();
      const { [sliceName]: newSliceState, [otherSliceName]: otherNewSliceState } = newState;
      expect(pendingState === newState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const { [sliceName]: resolvedSliceState, [otherSliceName]: otherResolvedSliceState } = resolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(pendingState === resolvedState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(otherPendingSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const otherSlice = createSlice({
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const store = createStore({
        storeSlices: { slice, otherSlice }
      });

      const oldState = store.getState();
      const { [sliceName]: oldSliceState, [otherSliceName]: otherOldSliceState } = oldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const { [sliceName]: pendingSliceState, [otherSliceName]: otherPendingSliceState } = pendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const { [sliceName]: rejectedSliceState, [otherSliceName]: rejectedOtherSliceState } = rejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });
  });

  describe("Can update one store slice state without effecting other store slice state", () => {
    test("Should correctly update when action with PENDING action handler executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const otherResolvedState = otherStore.getOtherState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      const { [otherSliceName]: otherResolvedSliceState } = otherResolvedState;
      expect(pendingState === resolvedState).toEqual(true);
      expect(otherPendingState === otherResolvedState).toEqual(true);
      expect(otherPendingState === otherResolvedState).toEqual(true);
      expect(pendingSliceState === resolvedSliceState).toEqual(true);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING action handler executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error()), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error());
      const newState = store.getState();
      const otherNewState = otherStore.getOtherState();
      const { [sliceName]: newSliceState } = newState;
      const { [otherSliceName]: otherNewSliceState } = otherNewState;
      expect(pendingState === newState).toEqual(true);
      expect(otherPendingState === otherNewState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with REJECTED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const otherRejectedState = otherStore.getOtherState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      const { [otherSliceName]: rejectedOtherSliceState } = otherRejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(otherOldState === otherRejectedState).toEqual(true);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });

    test("Should not update when action without REJECTED action handler executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        noHandlerTypes: [VALID_ASYNC_ACTION],
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      let error;
      try { await validAsyncAction(); }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const otherRejectedState = otherStore.getOtherState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      const { [otherSliceName]: rejectedOtherSliceState } = otherRejectedState;
      expect(oldState === rejectedState).toEqual(true);
      expect(otherOldState === otherRejectedState).toEqual(true);
      expect(oldSliceState === rejectedSliceState).toEqual(true);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(executionOrder).toEqual(["settled"]);
    });

    test("Should correctly update when action with RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      await validAsyncAction("Resolved");
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const otherResolvedState = otherStore.getOtherState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      const { [otherSliceName]: otherResolvedSliceState } = otherResolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(otherOldState === otherResolvedState).toEqual(true);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => ({})
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error = null;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(null);
      const newState = store.getState();
      const otherNewState = otherStore.getOtherState();
      const { [sliceName]: newSliceState } = newState;
      const { [otherSliceName]: otherNewSliceState } = otherNewState;
      expect(pendingState === newState).toEqual(true);
      expect(otherPendingState === otherNewState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING and REJECTED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const otherRejectedState = otherStore.getOtherState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      const { [otherSliceName]: rejectedOtherSliceState } = otherRejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(otherOldState === otherRejectedState).toEqual(true);
      expect(oldSliceState === rejectedSliceState).toEqual(false);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(otherPendingSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const otherResolvedState = otherStore.getOtherState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      const { [otherSliceName]: otherResolvedSliceState } = otherResolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(pendingState === resolvedState).toEqual(false);
      expect(otherOldState === otherResolvedState).toEqual(true);
      expect(oldSliceState === resolvedSliceState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(otherOldSliceState === otherResolvedSliceState).toEqual(true);
      expect(otherPendingSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING and RESOLVED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const newState = store.getState();
      const otherNewState = otherStore.getOtherState();
      const { [sliceName]: newSliceState } = newState;
      const { [otherSliceName]: otherNewSliceState } = otherNewState;
      expect(pendingState === newState).toEqual(true);
      expect(otherOldState === otherNewState).toEqual(true);
      expect(pendingSliceState === newSliceState).toEqual(true);
      expect(otherOldSliceState === otherNewSliceState).toEqual(true);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action handlers executed without error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: (value) => new Promise(
          (resolve) => setTimeout(() => resolve(value), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction("Resolved");
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      await promise;
      executionOrder.push("settled");
      const resolvedState = store.getState();
      const otherResolvedState = otherStore.getOtherState();
      const { [sliceName]: resolvedSliceState } = resolvedState;
      const { [otherSliceName]: otherResolvedSliceState } = otherResolvedState;
      expect(oldState === resolvedState).toEqual(false);
      expect(otherOldState === otherResolvedState).toEqual(true);
      expect(pendingState === resolvedState).toEqual(false);
      expect(pendingSliceState === resolvedSliceState).toEqual(false);
      expect(otherPendingSliceState === otherResolvedSliceState).toEqual(true);
      expect(resolvedSliceState.value).toEqual("Resolved");
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.RESOLVED, "settled"]);
    });

    test("Should correctly update when action with PENDING, REJECTED and RESOLVED action handlers executed with error.", async () => {
      const executionOrder = [];
      const sliceName = "testSlice";
      const otherStoreName = "other";
      const otherSliceName = "otherTestSlice";
      const name = "validAsync";
      const {
        validAsyncAction,
        VALID_ASYNC_ACTION
      } = createAsyncAction({
        sliceName,
        name,
        func: () => new Promise(
          (resolve, reject) => setTimeout(() => reject(new Error("Rejected")), 0)
        ),
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [VALID_ASYNC_ACTION.PENDING]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.PENDING);
            state.value = "Pending";
          },
          [VALID_ASYNC_ACTION.REJECTED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.REJECTED);
            state.value = action.error.message;
          },
          [VALID_ASYNC_ACTION.RESOLVED]: (state, action) => {
            executionOrder.push(VALID_ASYNC_ACTION.RESOLVED);
            state.value = action.payload;
          },
        },
        initialState: { value: "Not yet executed" }
      });
      const store = createStore({
        storeSlices: { slice }
      });
      const otherSlice = createSlice({
        storeName: otherStoreName,
        name: otherSliceName,
        reducer: {},
        initialState: { value: "Other value" }
      });
      const otherStore = createStore({
        name: otherStoreName,
        storeSlices: { otherSlice }
      });

      const oldState = store.getState();
      const otherOldState = otherStore.getOtherState();
      const { [sliceName]: oldSliceState } = oldState;
      const { [otherSliceName]: otherOldSliceState } = otherOldState;
      const promise = validAsyncAction();
      const pendingState = store.getState();
      const otherPendingState = otherStore.getOtherState();
      const { [sliceName]: pendingSliceState } = pendingState;
      const { [otherSliceName]: otherPendingSliceState } = otherPendingState;
      expect(oldState === pendingState).toEqual(false);
      expect(otherOldState === otherPendingState).toEqual(true);
      expect(oldSliceState === pendingSliceState).toEqual(false);
      expect(otherOldSliceState === otherPendingSliceState).toEqual(true);
      expect(pendingSliceState.value).toEqual("Pending");
      let error;
      try { await promise; }
      catch (err) { error = err; }
      executionOrder.push("settled");
      expect(error).toEqual(new Error("Rejected"));
      const rejectedState = store.getState();
      const otherRejectedState = otherStore.getOtherState();
      const { [sliceName]: rejectedSliceState } = rejectedState;
      const { [otherSliceName]: rejectedOtherSliceState } = otherRejectedState;
      expect(oldState === rejectedState).toEqual(false);
      expect(pendingState === rejectedState).toEqual(false);
      expect(otherOldState === otherRejectedState).toEqual(true);
      expect(pendingSliceState === rejectedSliceState).toEqual(false);
      expect(otherOldSliceState === rejectedOtherSliceState).toEqual(true);
      expect(rejectedSliceState.value).toEqual(error.message);
      expect(executionOrder).toEqual([VALID_ASYNC_ACTION.PENDING, VALID_ASYNC_ACTION.REJECTED, "settled"]);
    });
  });
});