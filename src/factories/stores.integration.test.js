import { render, screen, getByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { memo } from 'react'
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

describe("store useStoreState", () => {
  test("should cause rerender of component when store state got updated", () => {
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
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
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const {
      useStoreState,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let appRenders = 0;
    const App = () => {
      const state = useStoreState();
      appRenders++;
      return (
        <div>
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(0);

    expect(valueSelector(getState())).toEqual(0);
    expect(appRenders).toEqual(1);
    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getState())).toEqual(1);
    expect(appRenders).toEqual(2);
    userEvent.click(setValue);
    expect(appRenders).toEqual(3);
  });

  test("should not cause rerender of component when other store state got updated", () => {
    const otherStoreName = "other";
    const otherSliceName = "otherTestSlice";
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      storeName: otherStoreName,
      sliceName: otherSliceName,
      name: "value",
      funcs: [(state) => state[otherSliceName].value]
    });
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      storeName: otherStoreName,
      sliceName: otherSliceName,
      name: "setValue",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      initialState: { value: 0 },
    });
    const otherSlice = createSlice({
      storeName: otherStoreName,
      name: otherSliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        },
      },
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const { useStoreState } = createStore({
      storeSlices: { slice }
    });
    const { getOtherState } = createStore({
      name: otherStoreName,
      storeSlices: { otherSlice }
    });

    let appRenders = 0;
    const App = () => {
      const state = useStoreState();
      appRenders++;
      return (
        <div>
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(0);

    expect(valueSelector(getOtherState())).toEqual(0);
    expect(appRenders).toEqual(1);
    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getOtherState())).toEqual(1);
    expect(appRenders).toEqual(1);
    userEvent.click(setValue);
    expect(appRenders).toEqual(1);
  });

  test("should not cause rerender of memoized child of the component when store state got updated", () => {
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
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
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const {
      useStoreState,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let childRenders = 0;
    const Child = memo(() => {
      childRenders++;
      return (<div>Child</div>);
    });

    let appRenders = 0;
    const App = () => {
      const state = useStoreState();
      appRenders++;
      return (
        <div>
          <Child />
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(0);

    expect(valueSelector(getState())).toEqual(0);
    expect(childRenders).toEqual(1);
    expect(appRenders).toEqual(1);
    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getState())).toEqual(1);
    expect(childRenders).toEqual(1);
    expect(appRenders).toEqual(2);
    userEvent.click(setValue);
    expect(childRenders).toEqual(1);
    expect(appRenders).toEqual(3);
  });
});

describe("store useSelector", () => {
  test("should cause rerender of component when value selected from store state changed", () => {
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
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
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let appRenders = 0;
    const App = () => {
      const value = useSelector(valueSelector);
      appRenders++;
      return (
        <div>
          <div>{`${value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(1);

    expect(valueSelector(getState())).toEqual(0);
    expect(appRenders).toEqual(1);

    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getState())).toEqual(1);
    expect(appRenders).toEqual(2);
  });

  test("should not cause rerender of component when store state got updated but value selected didn't change", () => {
    const sliceName = "testSlice";
    const { isFalsyValueSelector } = createSelector({
      sliceName,
      name: "isFalsyValue",
      funcs: [(state) => !!state[sliceName].value]
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
      sliceSelectors: [isFalsyValueSelector],
      initialState: { value: 1 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let appRenders = 0;
    const App = () => {
      const isFalsyValue = useSelector(isFalsyValueSelector);
      appRenders++;
      return (
        <div>
          <div>{`${isFalsyValue}`}</div>
          <button onClick={() => setValueAction(2)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(1);

    expect(isFalsyValueSelector(getState())).toEqual(true);
    expect(appRenders).toEqual(1);

    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(isFalsyValueSelector(getState())).toEqual(true);
    expect(appRenders).toEqual(1);
  });

  test("should not cause rerender of memoized child of the component when value selected from store state changed", () => {
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
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
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let childRenders = 0;
    const Child = memo(() => {
      childRenders++;
      return (<div>Child</div>);
    });

    let appRenders = 0;
    const App = () => {
      const value = useSelector(valueSelector);
      appRenders++;
      return (
        <div>
          <Child />
          <div>{`${value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(1);

    expect(valueSelector(getState())).toEqual(0);
    expect(appRenders).toEqual(1);
    expect(childRenders).toEqual(1);

    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getState())).toEqual(1);
    expect(appRenders).toEqual(2);
    expect(childRenders).toEqual(1);
  });

  test("should invoke selector func used by multiple instances of useSelector only single time when state change", () => {
    const sliceName = "testSlice";
    let valueSelectorInvocationsCount = 0;
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
      funcs: [(state) => {
        valueSelectorInvocationsCount++;
        return state[sliceName].value;
      }]
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
      sliceSelectors: [valueSelector],
      initialState: { value: 0 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let childRenders = 0;
    const Child = memo(() => {
      const value = useSelector(valueSelector);
      childRenders++;
      return (<div>{`${value}`}</div>);
    });

    let appRenders = 0;
    const App = () => {
      const value = useSelector(valueSelector);
      appRenders++;
      return (
        <div>
          <Child />
          <div>{`${value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].renderTriggers.size).toEqual(2);
    expect(stores[DEFAULT_STORE].subscriptions.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsById.size).toEqual(1);

    const state = getState();
    expect(state[sliceName].value).toEqual(0);
    expect(appRenders).toEqual(1);
    expect(childRenders).toEqual(1);
    expect(valueSelectorInvocationsCount).toEqual(1);

    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    const newState = getState();
    expect(newState[sliceName].value).toEqual(1);
    expect(appRenders).toEqual(2);
    expect(childRenders).toEqual(2);
    expect(valueSelectorInvocationsCount).toEqual(2);
  });

  test("should only execute selector once when selecting initial value for multiple different import wrappers of the same selector", () => {
    const sliceName = "testSlice";
    const name = "valueSelector";
    const { importSelector } = createImporter({});
    const { valueSelector: valueSelectorImportWrapper } = importSelector(sliceName, name);
    let valueSelectorInvocationsCount = 0;
    const { valueSelector } = createSelector({
      sliceName,
      name,
      funcs: [(state) => {
        valueSelectorInvocationsCount++;
        return state[sliceName].value;
      }]
    });
    const { otherValueSelector } = createSelector({
      sliceName,
      name: "otherValue",
      funcs: [(state) => state[sliceName].otherValue]
    });
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: "setValue",
      func: (value) => value
    });
    const { setOtherValueAction, SET_OTHER_VALUE_ACTION } = createAction({
      sliceName,
      name: "setOtherValue",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        },
        [SET_OTHER_VALUE_ACTION]: (state, action) => {
          state.otherValue = action.payload;
        },
      },
      sliceSelectors: [valueSelector, otherValueSelector],
      initialState: { value: 0, otherValue: 0 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });
    const { importSelector: importOtherSelector } = createImporter({});
    const { valueSelector: valueSelectorOtherImportWrapper } = importOtherSelector(sliceName, name);

    const Child = memo(() => {
      const value = useSelector(valueSelectorImportWrapper);
      return (
        <div>
          Child
          <div>{`${value}`}</div>
        </div>
      );
    });

    const OtherChild = memo(() => {
      const value = useSelector(valueSelectorOtherImportWrapper);
      const otherValue = useSelector(otherValueSelector);
      return (
        <div>
          Other Child
          <div>{`${value}`}</div>
          <div>{`${otherValue}`}</div>
        </div>
      );
    });

    const App = () => {
      const value = useSelector(valueSelector);
      const valueFromOtherImport = useSelector(valueSelectorImportWrapper);
      return (
        <div>
          <Child />
          <OtherChild />
          <button onClick={() => setValueAction(0)}>setValueTo0</button>
          <button onClick={() => setValueAction(1)}>setValueTo1</button>
          <button onClick={() => setValueAction(2)}>setValueTo2</button>
          <button onClick={() => setOtherValueAction(0)}>setOtherValueTo0</button>
          <button onClick={() => setOtherValueAction(1)}>setOtherValueTo1</button>
          <div>{`${value}`}</div>
          <div>{`${valueFromOtherImport}`}</div>
        </div>
      );
    };

    render(<App />);

    expect(valueSelectorInvocationsCount).toEqual(1);
  });

  test("should cause rerender of components using selector in correct order", () => {
    const sliceName = "testSlice";
    const { valueSelector } = createSelector({
      sliceName,
      name: "value",
      funcs: [(state) => state[sliceName].value]
    });
    const { otherValueSelector } = createSelector({
      sliceName,
      name: "otherValue",
      funcs: [(state) => state[sliceName].otherValue]
    });
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: "setValue",
      func: (value) => value
    });
    const { setOtherValueAction, SET_OTHER_VALUE_ACTION } = createAction({
      sliceName,
      name: "setOtherValue",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        },
        [SET_OTHER_VALUE_ACTION]: (state, action) => {
          state.otherValue = action.payload;
        },
      },
      sliceSelectors: [valueSelector, otherValueSelector],
      initialState: { value: 0, otherValue: 0 },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    const rendersHistory = [];
    const Child = memo(() => {
      const value = useSelector(valueSelector);
      rendersHistory.push("Child");
      return (
        <div>
          Child
          <div>{`${value}`}</div>
        </div>
      );
    });

    const ChildContainer = memo(() => {
      const otherValue = useSelector(otherValueSelector);
      rendersHistory.push("ChildContainer");
      return (
        <div>
          <div>{`${otherValue}`}</div>
          <button onClick={() => setOtherValueAction(0)}>setOtherValueTo0</button>
          <button onClick={() => setOtherValueAction(1)}>setOtherValueTo1</button>
          <Child />
        </div>
      );
    });

    const App = () => {
      const value = useSelector(valueSelector);
      rendersHistory.push("App");
      return (
        <div>
          <ChildContainer />
          <button onClick={() => setValueAction(0)}>setValueTo0</button>
          <button onClick={() => setValueAction(1)}>setValueTo1</button>
          <button onClick={() => setValueAction(2)}>setValueTo2</button>
          <div>{`${value}`}</div>
        </div>
      );
    };

    render(<App />);
    const initialRenderHistory = [...rendersHistory];
    expect(initialRenderHistory).toEqual(["App", "ChildContainer", "Child"]);

    const setValueTo0 = screen.getByText("setValueTo0");
    userEvent.click(setValueTo0);
    const updatedNotChangedRenderHistory = [...rendersHistory];
    expect(updatedNotChangedRenderHistory).toEqual(initialRenderHistory);

    const setValueTo1 = screen.getByText("setValueTo1");
    userEvent.click(setValueTo1);
    const updatedRenderHistory = [...rendersHistory];
    expect(updatedRenderHistory).toEqual([...initialRenderHistory, "App", "Child"]);

    const setValueTo2 = screen.getByText("setValueTo2");
    userEvent.click(setValueTo2);
    const subsequentlyUpdatedRenderHistory = [...rendersHistory];
    expect(subsequentlyUpdatedRenderHistory).toEqual([...updatedRenderHistory, "App", "Child"]);

    userEvent.click(setValueTo2);
    const subsequentlyUpdatedNotChangedRenderHistory = [...rendersHistory];
    expect(subsequentlyUpdatedNotChangedRenderHistory).toEqual(subsequentlyUpdatedRenderHistory);

    const setOtherValueTo0 = screen.getByText("setOtherValueTo0");
    userEvent.click(setOtherValueTo0);
    const otherUpdatedNotChangedRenderHistory = [...rendersHistory];
    expect(otherUpdatedNotChangedRenderHistory).toEqual(subsequentlyUpdatedRenderHistory);

    const setOtherValueTo1 = screen.getByText("setOtherValueTo1");
    userEvent.click(setOtherValueTo1);
    const otherUpdatedRenderHistory = [...rendersHistory];
    expect(otherUpdatedRenderHistory).toEqual([...subsequentlyUpdatedRenderHistory, "ChildContainer"]);

    userEvent.click(setOtherValueTo0);
    userEvent.click(setOtherValueTo0);
    const otherSubsequentlyUpdatedRenderHistory = [...rendersHistory];
    expect(otherSubsequentlyUpdatedRenderHistory).toEqual([...otherUpdatedRenderHistory, "ChildContainer"]);

    userEvent.click(setValueTo0);
    expect([...rendersHistory]).toEqual([...otherSubsequentlyUpdatedRenderHistory, "App", "Child"]);
  });

  test("should render with correct value when re-mounting the component after the state update", () => {
    const sliceName = "testSlice";
    const name = "valueSelector";
    const { valueSelector } = createSelector({
      sliceName,
      name,
      funcs: [(state) => state[sliceName].value]
    });
    const { otherValueSelector } = createSelector({
      sliceName,
      name: "otherValue",
      funcs: [(state) => state[sliceName].otherValue]
    });
    const { showChildSelector } = createSelector({
      sliceName,
      name: "showChildSelector",
      funcs: [(state) => state[sliceName].showChild]
    });
    const { setValueAction, SET_VALUE_ACTION } = createAction({
      sliceName,
      name: "setValue",
      func: (value) => value
    });
    const { setOtherValueAction, SET_OTHER_VALUE_ACTION } = createAction({
      sliceName,
      name: "setOtherValue",
      func: (value) => value
    });
    const { setShowChildAction, SET_SHOW_CHILD_ACTION } = createAction({
      sliceName,
      name: "setShowChildAction",
      func: (value) => value
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {
        [SET_VALUE_ACTION]: (state, action) => {
          state.value = action.payload;
        },
        [SET_OTHER_VALUE_ACTION]: (state, action) => {
          state.otherValue = action.payload;
        },
        [SET_SHOW_CHILD_ACTION]: (state, action) => {
          state.showChild = action.payload;
        },
      },
      sliceSelectors: [valueSelector, otherValueSelector, showChildSelector],
      initialState: { value: 0, otherValue: 0, showChild: true },
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let childValue;
    const Child = memo(() => {
      childValue = useSelector(valueSelector);
      return (
        <div>
          Child
          <div>{`${childValue}`}</div>
        </div>
      );
    });

    const OtherChild = memo(() => {
      const otherValue = useSelector(otherValueSelector);
      return (
        <div>
          Other Child
          <div>{`${otherValue}`}</div>
        </div>
      );
    });

    let showChild;
    const App = () => {
      showChild = useSelector(showChildSelector);
      return (
        <div>
          {showChild && <Child />}
          <OtherChild />
          <button onClick={() => setValueAction(0)}>setValueTo0</button>
          <button onClick={() => setValueAction(1)}>setValueTo1</button>
          <button onClick={() => setValueAction(2)}>setValueTo2</button>
          <button onClick={() => setOtherValueAction(0)}>setOtherValueTo0</button>
          <button onClick={() => setOtherValueAction(1)}>setOtherValueTo1</button>
          <button onClick={() => setShowChildAction(true)}>setShowChildToTrue</button>
          <button onClick={() => setShowChildAction(false)}>setShowChildToFalse</button>
        </div>
      );
    };

    render(<App />);

    expect(childValue).toEqual(0);
    expect(showChild).toEqual(true);

    const setShowChildToFalse = screen.getByText("setShowChildToFalse");
    userEvent.click(setShowChildToFalse);
    expect(childValue).toEqual(0);
    expect(showChild).toEqual(false);

    const setValueTo1 = screen.getByText("setValueTo1");
    userEvent.click(setValueTo1);
    expect(childValue).toEqual(0);

    const setShowChildToTrue = screen.getByText("setShowChildToTrue");
    userEvent.click(setShowChildToTrue);

    expect(childValue).toEqual(1);
    expect(showChild).toEqual(true);

    const setValueTo2 = screen.getByText("setValueTo2");
    userEvent.click(setValueTo2);
    expect(childValue).toEqual(2);
  });
});