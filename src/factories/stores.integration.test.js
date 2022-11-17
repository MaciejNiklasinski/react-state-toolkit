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

test("store getState should return store state or slice state depending on provided arg.", () => {
  const sliceName = "testSlice";
  const initialState = { value: "Not yet executed" };
  const slice = createSlice({
    name: sliceName,
    reducer: {},
    initialState,
  });
  const store = createStore({
    storeSlices: { slice }
  });
  const storeState = store.getState();
  const sliceState = store.getState(sliceName);
  expect(initialState === sliceState).toEqual(true);
  expect(storeState).toEqual({ [sliceName]: sliceState });
});

test("store getActions should return store or slice actions depending on provided arg.", () => {
  const sliceName = "testSlice";
  const name = "setValue";
  const actionName = `${name}Action`;
  const { SET_VALUE_ACTION } = createAction({
    sliceName,
    name,
    func: (value) => value,
  });
  const otherName = "setOtherValue";
  const otherActionName = `${otherName}Action`;
  const { SET_OTHER_VALUE_ACTION } = createAction({
    sliceName,
    name: otherName,
    func: (otherValue) => otherValue,
  });
  const slice = createSlice({
    name: sliceName,
    reducer: {
      [SET_VALUE_ACTION]: (state, action) => {
        state.value = action.payload;
      },
      [SET_OTHER_VALUE_ACTION]: (state, action) => {
        state.otherValue = action.payload;
      }
    },
    initialState: {}
  });
  const store = createStore({
    storeSlices: { slice }
  });

  const storeActions = store.getActions();
  const sliceActions = store.getActions(sliceName);
  expect(storeActions).toEqual({ [sliceName]: sliceActions });
  expect(storeActions[sliceName][actionName]).toEqual(sliceActions[actionName]);
  expect(storeActions[sliceName][otherActionName]).toEqual(sliceActions[otherActionName]);
  expect(typeof sliceActions[actionName]).toEqual("function");
  expect(typeof sliceActions[otherActionName]).toEqual("function");

  sliceActions[actionName]("newValue");
  expect(store.getState(sliceName).value).toEqual("newValue");
  sliceActions[otherActionName]("newOtherValue");
  expect(store.getState(sliceName).otherValue).toEqual("newOtherValue");
});

test("store getSelectors should return store or slice actions depending on provided arg.", () => {
  const sliceName = "testSlice";
  const {
    valueSelector,
    selectorName: valueSelectorName
  } = createSelector({
    sliceName,
    name: "value",
    funcs: [(state) => state[sliceName].value]
  });
  const {
    otherValueSelector,
    selectorName: otherValueSelectorName
  } = createSelector({
    sliceName,
    name: "otherValue",
    funcs: [(state) => state[sliceName].otherValue]
  });
  const slice = createSlice({
    name: sliceName,
    reducer: {},
    sliceSelectors: [valueSelector, otherValueSelector],
    initialState: { value: 0, otherValue: 1 }
  });
  const store = createStore({ storeSlices: { slice } });

  const storeSelectors = store.getSelectors();
  const sliceSelectors = store.getSelectors(sliceName);

  expect(storeSelectors[sliceName][valueSelectorName]).toEqual(sliceSelectors[valueSelectorName]);
  expect(storeSelectors[sliceName][otherValueSelectorName]).toEqual(sliceSelectors[otherValueSelectorName]);
  expect(typeof sliceSelectors[valueSelectorName]).toEqual("function");
  expect(typeof sliceSelectors[otherValueSelectorName]).toEqual("function");
});