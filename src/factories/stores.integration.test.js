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

    expect(valueSelector(getState())).toEqual(0);
    expect(appRenders).toEqual(1);
    expect(childRenders).toEqual(1);

    const setValue = screen.getByText("setValue");
    userEvent.click(setValue);
    expect(valueSelector(getState())).toEqual(1);
    expect(appRenders).toEqual(2);
    expect(childRenders).toEqual(1);
  });
});