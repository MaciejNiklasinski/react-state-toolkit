import { render } from '@testing-library/react'
import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getSelectorId } from "./ids";
import {
  UnableToInvokeUninitializedStoreSelector,
  UnableToInvokeSelectingStoreSelector,
} from "../errors/UnableToInvokeSelector";

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

  test("Should throw correct error when associated selector has been executed directly inside selecting func of referencing it selector.", () => {
    const sliceName = "testSlice";
    const { obj1Selector } = createSelector({
      sliceName,
      name: "obj1Selector",
      funcs: [(state) => state[sliceName].obj1]
    });
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => {
          return obj1Selector(state);
        },
        (state) => state[sliceName].obj2,
        (obj1, obj2) => obj1.value + obj2.value,
      ]
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: [validSelector, obj1Selector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
      },
    });
    const {
      useSelector
    } = createStore({
      storeSlices: { slice }
    });

    const App = () => {
      const value = useSelector(validSelector);
      return (<div>{`${value}`}</div>);
    };

    let error;
    try { render(<App />); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToInvokeSelectingStoreSelector({ selectorId: obj1Selector.__selectorId }));
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

  test("Should reselect memoized obj value when args selectors results not change and memoOnArgs && keep memo are true.", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1.value,
        (state) => state[sliceName].obj2.value,
        (value1, value2) => ({ value1, value2 })
      ],
      memoOnArgs: true,
      keepMemo: true,
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

    setObj1ValueAction(2);
    const argPostChangeReselectedState = store.getState();
    const argPostChangeReselectedSelectedValue = validSelector(argPostChangeReselectedState);
    expect(argUpdatedChangedSelectedValue === argPostChangeReselectedSelectedValue).toEqual(true);
    expect(argPostChangeReselectedSelectedValue).toEqual({ value1: 2, value2: 2 });

    const argSubsequentReselectedState = store.getState();
    const argSubsequentReselectedSelectedValue = validSelector(argSubsequentReselectedState);
    expect(argUpdatedChangedSelectedValue === argSubsequentReselectedSelectedValue).toEqual(true);
    expect(argSubsequentReselectedSelectedValue).toEqual({ value1: 2, value2: 2 });

    setObj1ValueAction(1);
    const argSubsequentChangedState = store.getState();
    const argSubsequentChangeSelectedValue = validSelector(argSubsequentChangedState);
    expect(argSubsequentReselectedSelectedValue === argSubsequentChangeSelectedValue).toEqual(false);
    expect(argSubsequentChangeSelectedValue).toEqual({ value1: 1, value2: 2 });
  });

  test("Should reselect memoized obj value when args selectors results not change, memoOnArgs is true, and one of the args selectors is multi func memoOnArgs selector itself", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1.value,
        (state) => state[sliceName].obj2.value,
        (value1, value2) => ({ value1, value2 })
      ],
      memoOnArgs: true,
      keepMemo: true,
    });
    const { validCombinedSelector } = createSelector({
      sliceName,
      name: "validCombined",
      funcs: [
        validSelector,
        (state) => state[sliceName].obj3.value,
        ({ value1, value2 }, value3) => {
          return { value1, value2, value3 };
        }
      ],
      memoOnArgs: true,
      keepMemo: true,
    });
    const { setObj1ValueAction, SET_OBJ1_VALUE_ACTION } = createAction({
      sliceName,
      name: "setObj1Value",
      func: (value) => value
    });
    const { setObj3ValueAction, SET_OBJ3_VALUE_ACTION } = createAction({
      sliceName,
      name: "setObj3Value",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_OBJ1_VALUE_ACTION]: (state, action) => {
          state.obj1 = { value: action.payload };
        },
        [SET_OBJ3_VALUE_ACTION]: (state, action) => {
          state.obj3 = { value: action.payload };
        },
      },
      sliceSelectors: [validSelector, validCombinedSelector],
      initialState: {
        obj1: { value: 1 },
        obj2: { value: 2 },
        obj3: { value: 3 },
      },
    });
    const store = createStore({
      storeSlices: { slice }
    });
    const state = store.getState();
    const selectedValue = validCombinedSelector(state);
    expect(selectedValue).toEqual({ value1: 1, value2: 2, value3: 3 });

    const reselectedValue = validCombinedSelector(state);
    expect(selectedValue === reselectedValue).toEqual(true);
    expect(reselectedValue).toEqual({ value1: 1, value2: 2, value3: 3 });

    setObj1ValueAction(1);
    setObj3ValueAction(3);
    const argUpdatedNotChangedState = store.getState();
    const argUpdatedNotChangedSelectedValue = validCombinedSelector(argUpdatedNotChangedState);
    expect(selectedValue === argUpdatedNotChangedSelectedValue).toEqual(true);
    expect(argUpdatedNotChangedSelectedValue).toEqual({ value1: 1, value2: 2, value3: 3 });

    setObj1ValueAction(2);
    const argUpdatedChangedState = store.getState();
    const argUpdatedChangedSelectedValue = validCombinedSelector(argUpdatedChangedState);
    expect(selectedValue === argUpdatedChangedSelectedValue).toEqual(false);
    expect(argUpdatedChangedSelectedValue).toEqual({ value1: 2, value2: 2, value3: 3 });

    setObj1ValueAction(2);
    const argPostChangeReselectedState = store.getState();
    const argPostChangeReselectedSelectedValue = validCombinedSelector(argPostChangeReselectedState);
    expect(argUpdatedChangedSelectedValue === argPostChangeReselectedSelectedValue).toEqual(true);
    expect(argPostChangeReselectedSelectedValue).toEqual({ value1: 2, value2: 2, value3: 3 });

    const argSubsequentReselectedState = store.getState();
    const argSubsequentReselectedSelectedValue = validCombinedSelector(argSubsequentReselectedState);
    expect(argUpdatedChangedSelectedValue === argSubsequentReselectedSelectedValue).toEqual(true);
    expect(argSubsequentReselectedSelectedValue).toEqual({ value1: 2, value2: 2, value3: 3 });

    setObj3ValueAction(4);
    const argOtherValueChangedState = store.getState();
    const argOtherValueChangeSelectedValue = validCombinedSelector(argOtherValueChangedState);
    expect(argSubsequentReselectedSelectedValue === argOtherValueChangeSelectedValue).toEqual(false);
    expect(argOtherValueChangeSelectedValue).toEqual({ value1: 2, value2: 2, value3: 4 });

    const argOtherValueChangedReselectedState = store.getState();
    const argOtherValueChangedReselectedSelectedValue = validCombinedSelector(argOtherValueChangedReselectedState);
    expect(argOtherValueChangeSelectedValue === argOtherValueChangedReselectedSelectedValue).toEqual(true);
    expect(argOtherValueChangedReselectedSelectedValue).toEqual({ value1: 2, value2: 2, value3: 4 });

    setObj1ValueAction(2);
    setObj3ValueAction(4);
    const argSubsequentUpdatedNotChangedState = store.getState();
    const argSubsequentUpdatedNotChangedSelectedValue = validCombinedSelector(argSubsequentUpdatedNotChangedState);
    const argSubsequentUpdatedNotChangedSelectedValue2 = validCombinedSelector(argSubsequentUpdatedNotChangedState);
    expect(argOtherValueChangedReselectedSelectedValue === argSubsequentUpdatedNotChangedSelectedValue).toEqual(true);
    expect(argSubsequentUpdatedNotChangedSelectedValue).toEqual({ value1: 2, value2: 2, value3: 4 });
  });
});