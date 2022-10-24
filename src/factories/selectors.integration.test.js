import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getSelectorId } from "./ids";
import { UnableToInvokeUninitializedStoreSelector } from "../errors/UnableToInvokeUninitializedStoreSelector";

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

describe("single func selector", () => {
  test("Should throw error when executed before store creation.", () => {
    const sliceName = "testSlice";
    const selectorName = "validSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
    const { validSelector } = createSelector({
      sliceName,
      name: selectorName,
      funcs: [(state) => state[sliceName].value]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: { value: 0 }
    });    
    let error;
    try { validSelector(); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToInvokeUninitializedStoreSelector({ selectorId }));
  });

  test("Should be able to select value from initial state.", () => {
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
    const store = createStore({
      storeSlices: { slice }
    });
    const state = store.getState();
    const selectedValue = validSelector(state);
    expect(selectedValue).toEqual(0);
  });

  test("Should be able to select value after state update.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [(state) => state[sliceName].value]
    });
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: "setValue",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        },
      },
      sliceSelectors: [validSelector],
      initialState: { value: 0 }
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const oldState = store.getState();
    const oldSelectedValue = validSelector(oldState);
    expect(oldSelectedValue).toEqual(0);
    setValueAction(1);
    const newState = store.getState();
    const newSelectedValue = validSelector(newState);
    expect(newSelectedValue).toEqual(1);
  });
});

describe("multi func selector", () => {
  test("Should throw error when executed before store creation.", () => {
    const sliceName = "testSlice";
    const selectorName = "validSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
    const { validSelector } = createSelector({
      sliceName,
      name: selectorName,
      funcs: [
        (state) => state[sliceName].obj1,
        (state) => state[sliceName].obj2,
        (obj1, obj2) => obj1.value + obj2.value,
      ]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });    
    let error;
    try { validSelector(); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToInvokeUninitializedStoreSelector({ selectorId }));
  });

  test("Should be able to select value from initial state.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1,
        (state) => state[sliceName].obj2,
        (obj1, obj2) => obj1.value + obj2.value,
      ]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const state = store.getState();
    const selectedValue = validSelector(state);
    expect(selectedValue).toEqual(3);
  });

  test("Should be able to select value after state update.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1,
        (state) => state[sliceName].obj2,
        (obj1, obj2) => obj1.value + obj2.value,
      ]
    });
    const { setObj1ValueAction, SET_OBJ1_VALUE_ACTION } = createAction({
      sliceName,
      name: "setObj1Value",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_OBJ1_VALUE_ACTION]: (state, action) => {
          state.obj1 = { value: action.payload };
        },
      },
      sliceSelectors: [validSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const oldState = store.getState();
    const oldSelectedValue = validSelector(oldState);
    expect(oldSelectedValue).toEqual(3);
    setObj1ValueAction(2);
    const newState = store.getState();
    const newSelectedValue = validSelector(newState);
    expect(newSelectedValue).toEqual(4);
  });

  test("Should reselect new obj value every time selector executes if memoOnArgs is false.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1.value,
        (state) => state[sliceName].obj2.value,
        (value1, value2) => ({ value1, value2 })
      ]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const state = store.getState();
    const selectedValue = validSelector(state);
    expect(selectedValue).toEqual({ value1: 1, value2: 2 });
    const reselectedValue = validSelector(state);
    expect(selectedValue === reselectedValue).toEqual(false);
    expect(reselectedValue).toEqual({ value1: 1, value2: 2 });
  });

  test("Should reselect memoized obj value when args selectors results not change and memoOnArgs is true.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1.value,
        (state) => state[sliceName].obj2.value,
        (value1, value2) => ({ value1, value2 })
      ],
      memoOnArgs: true
    });
    const { setObj1ValueAction, SET_OBJ1_VALUE_ACTION } = createAction({
      sliceName,
      name: "setObj1Value",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_OBJ1_VALUE_ACTION]: (state, action) => {
          state.obj1 = { value: action.payload };
        },
      },
      sliceSelectors: [validSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const state = store.getState();
    const selectedValue = validSelector(state);
    expect(selectedValue).toEqual({ value1: 1, value2: 2 });

    const reselectedValue = validSelector(state);
    expect(selectedValue === reselectedValue).toEqual(true);
    expect(reselectedValue).toEqual({ value1: 1, value2: 2 });

    setObj1ValueAction(1);
    const argUpdatedNotChangedState = store.getState();
    const argUpdatedNotChangedSelectedValue = validSelector(argUpdatedNotChangedState);
    expect(selectedValue === argUpdatedNotChangedSelectedValue).toEqual(true);
    expect(argUpdatedNotChangedSelectedValue).toEqual({ value1: 1, value2: 2 });

    setObj1ValueAction(2);
    const argUpdatedChangedState = store.getState();
    const argUpdatedChangedSelectedValue = validSelector(argUpdatedChangedState);
    expect(selectedValue === argUpdatedChangedSelectedValue).toEqual(false);
    expect(argUpdatedChangedSelectedValue).toEqual({ value1: 2, value2: 2 });
  });
});