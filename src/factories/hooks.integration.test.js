import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { memo, useState } from 'react'
import { DEFAULT_STORE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getHooksFactory } from "./hooks";
import { getSelectorId } from "./ids";

let stores, slices, actions, actionsByType, actionsImports, selectors, selectorsImports;
let createStore, createSlice, createAction, createAsyncAction, createSelector, createImporter;
let useMount, useUnmount, useSingleUnmountInStrictMode, useSingleEffectInStrictMode, useObj, useSymbol,
  useFirstRender, usePrev, usePrevState;
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
  ({
    useMount,
    useUnmount,
    useSingleUnmountInStrictMode,
    useSingleEffectInStrictMode,
    useObj,
    useSymbol,
    useFirstRender,
    usePrev,
    usePrevState,
  } = getHooksFactory({
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

test("useMount executes only on component mount", () => {
  let effectCount = 0;
  let rendersCount = 0;
  const App = () => {
    const [value, setValue] = useState(0);
    useMount(() => { effectCount++; });
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
      </div>
    );
  };
  render(<App />);
  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(1);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(2);
});

test("useUnmount executes only on component unmount", () => {
  let effectCount = 0;
  let rendersCount = 0;
  const Child = () => {
    useUnmount(() => { effectCount++; });
    return (<div>Child</div>);
  };
  const App = () => {
    const [value, setValue] = useState(false);
    rendersCount++;
    return (
      <div>
        {value && <Child />}
        <button onClick={() => setValue(true)}>setTrue</button>
        <button onClick={() => setValue(false)}>setFalse</button>
      </div>
    );
  };
  render(<App />);

  expect(effectCount).toEqual(0);
  expect(rendersCount).toEqual(1);
  const setTrue = screen.getByText("setTrue");
  userEvent.click(setTrue);
  expect(effectCount).toEqual(0);
  expect(rendersCount).toEqual(2);
  const setFalse = screen.getByText("setFalse");
  userEvent.click(setFalse);
  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(3);
});

test("useSingleUnmountInStrictMode executes only once on component unmount", () => {
  let effectCount = 0;
  let rendersCount = 0;
  const Child = () => {
    useSingleUnmountInStrictMode(() => { effectCount++; });
    return (<div>Child</div>);
  };
  const App = () => {
    const [value, setValue] = useState(false);
    rendersCount++;
    return (
      <div>
        {value && <Child />}
        <button onClick={() => setValue(true)}>setTrue</button>
        <button onClick={() => setValue(false)}>setFalse</button>
      </div>
    );
  };
  render(<React.StrictMode><App /></React.StrictMode>);

  expect(effectCount).toEqual(0);
  expect(rendersCount).toEqual(2);
  const setTrue = screen.getByText("setTrue");
  userEvent.click(setTrue);
  expect(effectCount).toEqual(0);
  expect(rendersCount).toEqual(4);
  const setFalse = screen.getByText("setFalse");
  userEvent.click(setFalse);
  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(6);
});

test("useSingleEffectInStrictMode executes only once on component mount and per dependency change", () => {
  let effectCount = 0;
  let rendersCount = 0;
  const App = () => {
    const [value, setValue] = useState(0);
    const [otherValue, setOtherValue] = useState(0);
    useSingleEffectInStrictMode(() => { effectCount++; }, [otherValue]);
    rendersCount++;
    return (
      <div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
        <button onClick={() => setOtherValue(otherValue + 1)}>increaseOtherValue</button>
      </div>
    );
  };
  render(<React.StrictMode><App /></React.StrictMode>);

  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(2);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(effectCount).toEqual(1);
  expect(rendersCount).toEqual(4);
  const increaseOtherValue = screen.getByText("increaseOtherValue");
  userEvent.click(increaseOtherValue);
  expect(effectCount).toEqual(2);
  expect(rendersCount).toEqual(6);
});

test("useObj executes factory function only once", () => {
  let factoryCount = 0;
  let rendersCount = 0;
  let manufacturedObj;
  let lastObj;
  const App = () => {
    const [value, setValue] = useState(0);
    const obj = useObj(() => {
      factoryCount++;
      manufacturedObj = {};
      return manufacturedObj;
    });
    expect(obj).toBe(manufacturedObj);
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
      </div>
    );
  };
  render(<App />);
  expect(factoryCount).toEqual(1);
  expect(rendersCount).toEqual(1);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(factoryCount).toEqual(1);
  expect(rendersCount).toEqual(2);
});

test("useSymbol return the same unique symbol per call", () => {
  let rendersCount = 0;
  let lastSymbol;
  let lastOtherSymbol;
  const App = () => {
    const [value, setValue] = useState(0);
    const symbol = useSymbol();
    const otherSymbol = useSymbol();
    expect(symbol).not.toBe(otherSymbol);
    if (lastSymbol)
      expect(symbol).toBe(lastSymbol);
    if (lastOtherSymbol)
      expect(symbol).toBe(lastOtherSymbol);
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
      </div>
    );
  };
  render(<App />);
  expect(rendersCount).toEqual(1);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(rendersCount).toEqual(2);
});

test("useFirstRender executes factory function only once and returns correct value of isFirstRender flag", () => {
  let factoryCount = 0;
  let rendersCount = 0;
  let manufacturedObj;
  let lastObj;
  const isFirstRenderValues = [];
  const App = () => {
    const [value, setValue] = useState(0);
    const [obj, isFirstRender] = useFirstRender(() => {
      factoryCount++;
      manufacturedObj = {};
      return manufacturedObj;
    });
    expect(obj).toBe(manufacturedObj);
    expect(isFirstRender).toEqual(!rendersCount);
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
      </div>
    );
  };
  render(<App />);
  expect(factoryCount).toEqual(1);
  expect(rendersCount).toEqual(1);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(factoryCount).toEqual(1);
  expect(rendersCount).toEqual(2);
});

test("usePrev returns correct value", () => {
  let rendersCount = 0;
  let value;
  let prevValue;
  const App = () => {
    let setValue;
    [value, setValue] = useState(0);
    const [otherValue, setOtherValue] = useState(0);
    prevValue = usePrev(value);
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
        <button onClick={() => setOtherValue(otherValue + 1)}>increaseOtherValue</button>
      </div>
    );
  };
  render(<App />);
  expect(rendersCount).toEqual(1);
  expect(prevValue).toEqual(undefined);
  expect(value).toEqual(0);
  const increaseOtherValue = screen.getByText("increaseOtherValue");
  userEvent.click(increaseOtherValue);
  expect(rendersCount).toEqual(2);
  expect(prevValue).toEqual(0);
  expect(value).toEqual(0);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(rendersCount).toEqual(3);
  expect(prevValue).toEqual(0);
  expect(value).toEqual(1);
  userEvent.click(increaseOtherValue);
  expect(rendersCount).toEqual(4);
  expect(prevValue).toEqual(1);
  expect(value).toEqual(1);
});

test("usePrevState returns correct values", () => {
  let rendersCount = 0;
  let value;
  let prevValue;
  const App = () => {
    let setValue;
    [prevValue, value, setValue] = usePrevState(0);
    const [otherValue, setOtherValue] = useState(0)
    rendersCount++;
    return (
      <div>
        <div>{`${value}`}</div>
        <button onClick={() => setValue(value + 1)}>increaseValue</button>
        <button onClick={() => setOtherValue(otherValue + 1)}>increaseOtherValue</button>
      </div>
    );
  };
  render(<App />);
  expect(rendersCount).toEqual(1);
  expect(prevValue).toEqual(undefined);
  expect(value).toEqual(0);
  const increaseOtherValue = screen.getByText("increaseOtherValue");
  userEvent.click(increaseOtherValue);
  expect(rendersCount).toEqual(2);
  expect(prevValue).toEqual(undefined);
  expect(value).toEqual(0);
  const increaseValue = screen.getByText("increaseValue");
  userEvent.click(increaseValue);
  expect(rendersCount).toEqual(3);
  expect(prevValue).toEqual(0);
  expect(value).toEqual(1);
  userEvent.click(increaseOtherValue);
  expect(rendersCount).toEqual(4);
  expect(prevValue).toEqual(0);
  expect(value).toEqual(1);
  userEvent.click(increaseValue);
  expect(rendersCount).toEqual(5);
  expect(prevValue).toEqual(1);
  expect(value).toEqual(2);
});

describe("useStoreState", () => {
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

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

describe("usePrevStoreState", () => {
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
      usePrevStoreState,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    let appRenders = 0;
    const App = () => {
      const [prevState, state] = usePrevStoreState();
      appRenders++;
      return (
        <div>
          <div>{`${prevState?.[sliceName]?.value}`}</div>
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
    const { usePrevStoreState } = createStore({
      storeSlices: { slice }
    });
    const { getOtherState } = createStore({
      name: otherStoreName,
      storeSlices: { otherSlice }
    });

    let appRenders = 0;
    const App = () => {
      const [prevState, state] = usePrevStoreState();
      appRenders++;
      return (
        <div>
          <div>{`${prevState?.[sliceName]?.value}`}</div>
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
      usePrevStoreState,
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
      const [prevState, state] = usePrevStoreState();
      appRenders++;
      return (
        <div>
          <Child />
          <div>{`${prevState?.[sliceName]?.value}`}</div>
          <div>{`${state[sliceName].value}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };

    render(<App />);

    expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
    expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

describe("useSelector", () => {
  describe("using parameterless selector", () => {
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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      expect(childValue).toEqual(0);
      expect(showChild).toEqual(true);

      const setShowChildToFalse = screen.getByText("setShowChildToFalse");
      userEvent.click(setShowChildToFalse);
      expect(childValue).toEqual(0);
      expect(showChild).toEqual(false);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const setValueTo1 = screen.getByText("setValueTo1");
      userEvent.click(setValueTo1);
      expect(childValue).toEqual(0);

      const setShowChildToTrue = screen.getByText("setShowChildToTrue");
      userEvent.click(setShowChildToTrue);

      expect(childValue).toEqual(1);
      expect(showChild).toEqual(true);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      const setValueTo2 = screen.getByText("setValueTo2");
      userEvent.click(setValueTo2);
      expect(childValue).toEqual(2);
    });
  });

  describe("using parameterized selector", () => {
    test("should cause rerender of component when value selected from store state changed", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let user;
      const App = () => {
        const [value, setValue] = useState(0);
        user = useSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(appRenders).toEqual(2);
    });

    test("should cause value reselect when selector param change", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let user;
      const App = () => {
        const [value, setValue] = useState(0);
        user = useSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setValue(0)}>setValue0</button>
            <button onClick={() => setValue(1)}>setValue1</button>
            <button onClick={() => setValue(2)}>setValue2</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setValue1 = screen.getByText("setValue1");
      userEvent.click(setValue1);

      expect(user).toBe(initialState.users[1]);
      expect(appRenders).toEqual(2);
    });

    test("should not cause rerender of component when store state got updated but value selected didn't change", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let user;
      const App = () => {
        const [value, setValue] = useState(0);
        user = useSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setUsersAction([...initialState.users])}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);
    });

    test("should not cause rerender of memoized child of the component when value selected from store state changed", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
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
      let user;
      const App = () => {
        const [value, setValue] = useState(0);
        user = useSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <Child />
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(1);
    });

    test("should invoke selector func used by multiple instances of useSelector only single time when state change", () => {
      const sliceName = "testSlice";
      let usersSelectorInvocationsCount = 0;
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => {
          usersSelectorInvocationsCount++;
          return state[sliceName].users;
        }]
      });
      let userSelectorInvocationsCount = 0;
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            userSelectorInvocationsCount++;
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let childRenders = 0;
      let childUser;
      const Child = memo(() => {
        childUser = useSelector(userSelector, 0);
        childRenders++;
        return (<div>{`${childUser.name}`}</div>);
      });

      let appRenders = 0;
      let user;
      const App = () => {
        user = useSelector(userSelector, 0);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${user.name}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(initialRenderUser).toBe(childUser);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(usersSelectorInvocationsCount).toEqual(1);
      expect(userSelectorInvocationsCount).toEqual(1);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(user).toBe(childUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(usersSelectorInvocationsCount).toEqual(2);
      expect(userSelectorInvocationsCount).toEqual(2);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(2);
    });

    test("should only execute selector once when selecting initial value for multiple different import wrappers of the same selector", () => {
      const sliceName = "testSlice";
      const { importSelector } = createImporter({});
      const { userSelector: userSelectorImportWrapper } = importSelector(sliceName, "userSelector");
      let usersSelectorInvocationsCount = 0;
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => {
          usersSelectorInvocationsCount++;
          return state[sliceName].users;
        }]
      });
      let userSelectorInvocationsCount = 0;
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            userSelectorInvocationsCount++;
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });
      const { importSelector: importOtherSelector } = createImporter({});
      const { userSelector: userSelectorOtherImportWrapper } = importOtherSelector(sliceName, "userSelector");

      let childRenders = 0;
      let childUser;
      const Child = memo(() => {
        childUser = useSelector(userSelector, 0);
        childRenders++;
        return (<div>{`${childUser.name}`}</div>);
      });

      let appRenders = 0;
      let user;
      let importUser;
      let otherImportUser;
      const App = () => {
        user = useSelector(userSelector, 0);
        importUser = useSelector(userSelectorImportWrapper, 0);
        otherImportUser = useSelector(userSelectorOtherImportWrapper, 0);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${user.name}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(4);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(initialRenderUser).toBe(childUser);
      expect(initialRenderUser).toBe(importUser);
      expect(initialRenderUser).toBe(otherImportUser);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(usersSelectorInvocationsCount).toEqual(1);
      expect(userSelectorInvocationsCount).toEqual(1);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(user).toBe(childUser);
      expect(user).toBe(importUser);
      expect(user).toBe(otherImportUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(usersSelectorInvocationsCount).toEqual(2);
      expect(userSelectorInvocationsCount).toEqual(2);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(2);
    });

    test("should cause rerender of components using selector in correct order", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      const rendersHistory = [];

      let childUser;
      const Child = memo(() => {
        const [childValue, setValue] = useState(0);
        childUser = useSelector(userSelector, childValue);
        rendersHistory.push("Child");
        return (
          <div>
            <button onClick={() => setValue(0)}>setChildValueTo0</button>
            <button onClick={() => setValue(1)}>setChildValueTo1</button>
            <button onClick={() => setValue(2)}>setChildValueTo2</button>
            <div>{`${user.name}`}</div>
          </div>
        );
      });

      let user;
      const App = () => {
        const [value, setValue] = useState(0);
        user = useSelector(userSelector, value);
        rendersHistory.push("App");
        return (
          <div>
            <Child />
            <button onClick={() => setValue(0)}>setValueTo0</button>
            <button onClick={() => setValue(1)}>setValueTo1</button>
            <button onClick={() => setValue(2)}>setValueTo2</button>
            <div>{`${user.name}`}</div>
          </div>
        );
      };

      render(<App />);
      const initialRenderHistory = [...rendersHistory];
      expect(initialRenderHistory).toEqual(["App", "Child"]);

      const setValueTo0 = screen.getByText("setValueTo0");
      userEvent.click(setValueTo0);
      const updatedNotChangedRenderHistory = [...rendersHistory];
      expect(updatedNotChangedRenderHistory).toEqual(initialRenderHistory);

      const setValueTo1 = screen.getByText("setValueTo1");
      userEvent.click(setValueTo1);
      const updatedRenderHistory = [...rendersHistory];
      expect(updatedRenderHistory).toEqual([...initialRenderHistory, "App"]);

      const setChildValueTo0 = screen.getByText("setChildValueTo0");
      userEvent.click(setChildValueTo0);
      const updatedNotChangedChildRenderHistory = [...rendersHistory];
      expect(updatedNotChangedChildRenderHistory).toEqual(updatedRenderHistory);

      const setChildValueTo1 = screen.getByText("setChildValueTo1");
      userEvent.click(setChildValueTo1);
      const updatedChildRenderHistory = [...rendersHistory];
      expect(updatedChildRenderHistory).toEqual([...updatedRenderHistory, "Child"]);

      const setValueTo2 = screen.getByText("setValueTo2");
      userEvent.click(setValueTo2);
      const subsequentlyUpdatedRenderHistory = [...rendersHistory];
      expect(subsequentlyUpdatedRenderHistory).toEqual([...updatedChildRenderHistory, "App"]);

      const setChildValueTo2 = screen.getByText("setChildValueTo2");
      userEvent.click(setChildValueTo2);
      const subsequentlyUpdatedChildRenderHistory = [...rendersHistory];
      expect(subsequentlyUpdatedChildRenderHistory).toEqual([...subsequentlyUpdatedRenderHistory, "Child"]);
    });

    test("should render with correct value when re-mounting the component after the state update", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        useSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let childUser;
      const Child = memo(() => {
        childUser = useSelector(userSelector, 1);
        return (
          <div>
            Child
            <div>{`${childUser.name}`}</div>
          </div>
        );
      });

      let otherChildUser;
      const OtherChild = memo(() => {
        otherChildUser = useSelector(userSelector, 2);
        return (
          <div>
            Other Child
            <div>{`${childUser.name}`}</div>
          </div>
        );
      });

      let showChild, setShowChild, user;
      const App = () => {
        [showChild, setShowChild] = useState(true);
        user = useSelector(userSelector, 0);
        return (
          <div>
            {showChild && <Child />}
            <OtherChild />
            <button onClick={() => setShowChild(false)}>setShowChildToFalse</button>
            <button onClick={() => setShowChild(true)}>setShowChildToTrue</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 0 ? { ...u } : u))}>setUser0</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 1 ? { ...u } : u))}>setUser1</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 2 ? { ...u } : u))}>setUser2</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);

      const initialRenderChildUser = childUser;

      expect(user).toBe(initialState.users[0]);
      expect(childUser).toBe(initialState.users[1]);
      expect(otherChildUser).toBe(initialState.users[2]);
      expect(showChild).toEqual(true);

      const setShowChildToFalse = screen.getByText("setShowChildToFalse");
      userEvent.click(setShowChildToFalse);
      expect(childUser).toBe(initialState.users[1]);
      expect(showChild).toEqual(false);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      const setUser1 = screen.getByText("setUser1");
      userEvent.click(setUser1);
      expect(childUser).toBe(initialState.users[1]);

      const setShowChildToTrue = screen.getByText("setShowChildToTrue");
      userEvent.click(setShowChildToTrue);

      expect(childUser).not.toBe(initialState.users[1]);
      expect(childUser).toEqual(initialState.users[1]);
      expect(showChild).toEqual(true);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);

      const setUser2 = screen.getByText("setUser2");
      userEvent.click(setUser2);
      expect(otherChildUser).not.toBe(initialState.users[2]);
      expect(otherChildUser).toEqual(initialState.users[2]);
    });
  });
});

describe("usePrevSelector", () => {
  describe("using parameterless selector", () => {
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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      const App = () => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        appRenders++;
        return (
          <div>
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
            <button onClick={() => setValueAction(1)}>setValue</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      const App = () => {
        const [prevIsFalsyValue, isFalsyValue] = usePrevSelector(isFalsyValueSelector);
        appRenders++;
        return (
          <div>
            <div>{`${prevIsFalsyValue}`}</div>
            <div>{`${isFalsyValue}`}</div>
            <button onClick={() => setValueAction(2)}>setValue</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
        usePrevSelector,
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
        const [prevValue, value] = usePrevSelector(valueSelector);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
            <button onClick={() => setValueAction(1)}>setValue</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let childRenders = 0;
      const Child = memo(() => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        childRenders++;
        return (
          <div>
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
          </div>
        );
      });

      let appRenders = 0;
      const App = () => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
            <button onClick={() => setValueAction(1)}>setValue</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);

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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });
      const { importSelector: importOtherSelector } = createImporter({});
      const { valueSelector: valueSelectorOtherImportWrapper } = importOtherSelector(sliceName, name);

      const Child = memo(() => {
        const [prevValue, value] = usePrevSelector(valueSelectorImportWrapper);
        return (
          <div>
            Child
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
          </div>
        );
      });

      const OtherChild = memo(() => {
        const [prevValue, value] = usePrevSelector(valueSelectorOtherImportWrapper);
        const [prevOtherValue, otherValue] = usePrevSelector(otherValueSelector);
        return (
          <div>
            Other Child
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
            <div>{`${prevOtherValue}`}</div>
            <div>{`${otherValue}`}</div>
          </div>
        );
      });

      const App = () => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        const [prevValueFromOtherImport, valueFromOtherImport] = usePrevSelector(valueSelectorImportWrapper);
        return (
          <div>
            <Child />
            <OtherChild />
            <button onClick={() => setValueAction(0)}>setValueTo0</button>
            <button onClick={() => setValueAction(1)}>setValueTo1</button>
            <button onClick={() => setValueAction(2)}>setValueTo2</button>
            <button onClick={() => setOtherValueAction(0)}>setOtherValueTo0</button>
            <button onClick={() => setOtherValueAction(1)}>setOtherValueTo1</button>
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
            <div>{`${prevValueFromOtherImport}`}</div>
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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      const rendersHistory = [];
      const Child = memo(() => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        rendersHistory.push("Child");
        return (
          <div>
            Child
            <div>{`${prevValue}`}</div>
            <div>{`${value}`}</div>
          </div>
        );
      });

      const ChildContainer = memo(() => {
        const [prevOtherValue, otherValue] = usePrevSelector(otherValueSelector);
        rendersHistory.push("ChildContainer");
        return (
          <div>
            <div>{`${prevOtherValue}`}</div>
            <div>{`${otherValue}`}</div>
            <button onClick={() => setOtherValueAction(0)}>setOtherValueTo0</button>
            <button onClick={() => setOtherValueAction(1)}>setOtherValueTo1</button>
            <Child />
          </div>
        );
      });

      const App = () => {
        const [prevValue, value] = usePrevSelector(valueSelector);
        rendersHistory.push("App");
        return (
          <div>
            <ChildContainer />
            <button onClick={() => setValueAction(0)}>setValueTo0</button>
            <button onClick={() => setValueAction(1)}>setValueTo1</button>
            <button onClick={() => setValueAction(2)}>setValueTo2</button>
            <div>{`${prevValue}`}</div>
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
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let prevChildValue, childValue;
      const Child = memo(() => {
        [prevChildValue, childValue] = usePrevSelector(valueSelector);
        return (
          <div>
            Child
            <div>{`${prevChildValue}`}</div>
            <div>{`${childValue}`}</div>
          </div>
        );
      });

      const OtherChild = memo(() => {
        const [prevOtherValue, otherValue] = usePrevSelector(otherValueSelector);
        return (
          <div>
            Other Child
            <div>{`${prevOtherValue}`}</div>
            <div>{`${otherValue}`}</div>
          </div>
        );
      });

      let prevShowChild, showChild;
      const App = () => {
        [prevShowChild, showChild] = usePrevSelector(showChildSelector);
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

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      expect(childValue).toEqual(0);
      expect(showChild).toEqual(true);

      const setShowChildToFalse = screen.getByText("setShowChildToFalse");
      userEvent.click(setShowChildToFalse);
      expect(childValue).toEqual(0);
      expect(showChild).toEqual(false);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const setValueTo1 = screen.getByText("setValueTo1");
      userEvent.click(setValueTo1);
      expect(childValue).toEqual(0);

      const setShowChildToTrue = screen.getByText("setShowChildToTrue");
      userEvent.click(setShowChildToTrue);

      expect(childValue).toEqual(1);
      expect(showChild).toEqual(true);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      const setValueTo2 = screen.getByText("setValueTo2");
      userEvent.click(setValueTo2);
      expect(childValue).toEqual(2);
    });
  });

  describe("using parameterized selector", () => {
    test("should cause rerender of component when value selected from store state changed", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let prevUser, user;
      const App = () => {
        const [value, setValue] = useState(0);
        [prevUser, user] = usePrevSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(prevUser).toEqual(undefined);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(prevUser).toBe(initialRenderUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(appRenders).toEqual(2);
    });

    test("should cause value reselect when selector param change", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let prevUser, user;
      const App = () => {
        const [value, setValue] = useState(0);
        [prevUser, user] = usePrevSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setValue(0)}>setValue0</button>
            <button onClick={() => setValue(1)}>setValue1</button>
            <button onClick={() => setValue(2)}>setValue2</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      expect(prevUser).toBe(undefined);
      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setValue1 = screen.getByText("setValue1");
      userEvent.click(setValue1);

      expect(prevUser).toBe(undefined);
      expect(user).toBe(initialState.users[1]);
      expect(appRenders).toEqual(2);
    });

    test("should not cause rerender of component when store state got updated but value selected didn't change", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let appRenders = 0;
      let prevUser, user;
      const App = () => {
        const [value, setValue] = useState(0);
        [prevUser, user] = usePrevSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <button onClick={() => setUsersAction([...initialState.users])}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      expect(prevUser).toBe(undefined);
      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(prevUser).toBe(undefined);
      expect(user).toBe(initialState.users[0]);
      expect(appRenders).toEqual(1);
    });

    test("should not cause rerender of memoized child of the component when value selected from store state changed", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
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
      let prevUser, user;
      const App = () => {
        const [value, setValue] = useState(0);
        [prevUser, user] = usePrevSelector(userSelector, value);
        appRenders++;
        return (
          <div>
            <div>{`${value}`}</div>
            <Child />
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(prevUser).toEqual(undefined);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(prevUser).toBe(initialRenderUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(1);
    });

    test("should invoke selector func used by multiple instances of useSelector only single time when state change", () => {
      const sliceName = "testSlice";
      let usersSelectorInvocationsCount = 0;
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => {
          usersSelectorInvocationsCount++;
          return state[sliceName].users;
        }]
      });
      let userSelectorInvocationsCount = 0;
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            userSelectorInvocationsCount++;
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let childRenders = 0;
      let prevChildUser, childUser;
      const Child = memo(() => {
        [prevChildUser, childUser] = usePrevSelector(userSelector, 0);
        childRenders++;
        return (
          <div>
            <div>{`${childUser.name}`}</div>
            <div>{`${prevChildUser?.name}`}</div>
          </div>
        );
      });

      let appRenders = 0;
      let prevUser, user;
      const App = () => {
        [prevUser, user] = usePrevSelector(userSelector, 0);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${user.name}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(prevChildUser).toBe(undefined);
      expect(prevUser).toBe(undefined);
      expect(initialRenderUser).toBe(childUser);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(usersSelectorInvocationsCount).toEqual(1);
      expect(userSelectorInvocationsCount).toEqual(1);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(prevChildUser).toBe(initialRenderUser);
      expect(prevUser).toBe(initialRenderUser);
      expect(user).toBe(childUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(usersSelectorInvocationsCount).toEqual(2);
      expect(userSelectorInvocationsCount).toEqual(2);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(2);
    });

    test("should only execute selector once when selecting initial value for multiple different import wrappers of the same selector", () => {
      const sliceName = "testSlice";
      const { importSelector } = createImporter({});
      const { userSelector: userSelectorImportWrapper } = importSelector(sliceName, "userSelector");
      let usersSelectorInvocationsCount = 0;
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => {
          usersSelectorInvocationsCount++;
          return state[sliceName].users;
        }]
      });
      let userSelectorInvocationsCount = 0;
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            userSelectorInvocationsCount++;
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });
      const { importSelector: importOtherSelector } = createImporter({});
      const { userSelector: userSelectorOtherImportWrapper } = importOtherSelector(sliceName, "userSelector");

      let childRenders = 0;
      let prevChildUser, childUser;
      const Child = memo(() => {
        [prevChildUser, childUser] = usePrevSelector(userSelector, 0);
        childRenders++;
        return (
          <div>
            <div>{`${prevChildUser?.name}`}</div>
            <div>{`${childUser.name}`}</div>
          </div>
        );
      });

      let appRenders = 0;
      let prevUser, user;
      let prevImportUser, importUser;
      let prevOtherImportUser, otherImportUser;
      const App = () => {
        [prevUser, user] = usePrevSelector(userSelector, 0);
        [prevImportUser, importUser] = usePrevSelector(userSelectorImportWrapper, 0);
        [prevOtherImportUser, otherImportUser] = usePrevSelector(userSelectorOtherImportWrapper, 0);
        appRenders++;
        return (
          <div>
            <Child />
            <div>{`${user.name}`}</div>
            <button onClick={() => setUsersAction(initialState.users.map((u) => ({ ...u })))}>setUsers</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(4);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);

      const initialRenderUser = user;
      expect(prevChildUser).toBe(undefined);
      expect(prevUser).toBe(undefined);
      expect(prevImportUser).toBe(undefined);
      expect(prevOtherImportUser).toBe(undefined);
      expect(initialRenderUser).toBe(childUser);
      expect(initialRenderUser).toBe(importUser);
      expect(initialRenderUser).toBe(otherImportUser);
      expect(initialRenderUser).toEqual(initialState.users[0]);
      expect(usersSelectorInvocationsCount).toEqual(1);
      expect(userSelectorInvocationsCount).toEqual(1);
      expect(appRenders).toEqual(1);
      expect(childRenders).toEqual(1);

      const setUsers = screen.getByText("setUsers");
      userEvent.click(setUsers);

      expect(prevChildUser).toBe(initialRenderUser);
      expect(prevUser).toBe(initialRenderUser);
      expect(prevImportUser).toBe(initialRenderUser);
      expect(prevOtherImportUser).toBe(initialRenderUser);
      expect(user).toBe(childUser);
      expect(user).toBe(importUser);
      expect(user).toBe(otherImportUser);
      expect(user).not.toBe(initialRenderUser);
      expect(user).toEqual(initialRenderUser);
      expect(usersSelectorInvocationsCount).toEqual(2);
      expect(userSelectorInvocationsCount).toEqual(2);
      expect(appRenders).toEqual(2);
      expect(childRenders).toEqual(2);
    });

    test("should cause rerender of components using selector in correct order", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      const rendersHistory = [];

      let prevChildUser, childUser;
      const Child = memo(() => {
        const [childValue, setValue] = useState(0);
        [prevChildUser, childUser] = usePrevSelector(userSelector, childValue);
        rendersHistory.push("Child");
        return (
          <div>
            <button onClick={() => setValue(0)}>setChildValueTo0</button>
            <button onClick={() => setValue(1)}>setChildValueTo1</button>
            <button onClick={() => setValue(2)}>setChildValueTo2</button>
            <div>{`${user.name}`}</div>
          </div>
        );
      });

      let prevUser, user;
      const App = () => {
        const [value, setValue] = useState(0);
        [prevUser, user] = usePrevSelector(userSelector, value);
        rendersHistory.push("App");
        return (
          <div>
            <Child />
            <button onClick={() => setValue(0)}>setValueTo0</button>
            <button onClick={() => setValue(1)}>setValueTo1</button>
            <button onClick={() => setValue(2)}>setValueTo2</button>
            <div>{`${user.name}`}</div>
          </div>
        );
      };

      render(<App />);
      const initialRenderHistory = [...rendersHistory];
      expect(initialRenderHistory).toEqual(["App", "Child"]);

      const setValueTo0 = screen.getByText("setValueTo0");
      userEvent.click(setValueTo0);
      const updatedNotChangedRenderHistory = [...rendersHistory];
      expect(updatedNotChangedRenderHistory).toEqual(initialRenderHistory);

      const setValueTo1 = screen.getByText("setValueTo1");
      userEvent.click(setValueTo1);
      const updatedRenderHistory = [...rendersHistory];
      expect(updatedRenderHistory).toEqual([...initialRenderHistory, "App"]);

      const setChildValueTo0 = screen.getByText("setChildValueTo0");
      userEvent.click(setChildValueTo0);
      const updatedNotChangedChildRenderHistory = [...rendersHistory];
      expect(updatedNotChangedChildRenderHistory).toEqual(updatedRenderHistory);

      const setChildValueTo1 = screen.getByText("setChildValueTo1");
      userEvent.click(setChildValueTo1);
      const updatedChildRenderHistory = [...rendersHistory];
      expect(updatedChildRenderHistory).toEqual([...updatedRenderHistory, "Child"]);

      const setValueTo2 = screen.getByText("setValueTo2");
      userEvent.click(setValueTo2);
      const subsequentlyUpdatedRenderHistory = [...rendersHistory];
      expect(subsequentlyUpdatedRenderHistory).toEqual([...updatedChildRenderHistory, "App"]);

      const setChildValueTo2 = screen.getByText("setChildValueTo2");
      userEvent.click(setChildValueTo2);
      const subsequentlyUpdatedChildRenderHistory = [...rendersHistory];
      expect(subsequentlyUpdatedChildRenderHistory).toEqual([...subsequentlyUpdatedRenderHistory, "Child"]);
    });

    test("should render with correct value when re-mounting the component after the state update", () => {
      const sliceName = "testSlice";
      const { usersSelector } = createSelector({
        sliceName,
        name: "usersSelector",
        funcs: [(state) => state[sliceName].users]
      });
      const { userSelector } = createSelector({
        sliceName,
        name: "userSelector",
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [index] = getParams();
            return users[index];
          }
        ],
        isParameterized: true,
        paramsSignature: "index",
      });
      const { setUsersAction, SET_USERS_ACTION } = createAction({
        sliceName,
        name: "setUsers",
        func: (users) => users
      });
      const initialState = {
        users: [
          { name: "user1" },
          { name: "user2" },
          { name: "user3" }
        ]
      };
      const slice = createSlice({
        name: sliceName,
        reducer: {
          [SET_USERS_ACTION]: (state, action) => {
            state.users = action.payload;
          },
        },
        sliceSelectors: [usersSelector, userSelector],
        initialState,
      });
      const {
        usePrevSelector,
        getState,
      } = createStore({
        storeSlices: { slice }
      });

      let prevChildUser, childUser;
      const Child = memo(() => {
        [prevChildUser, childUser] = usePrevSelector(userSelector, 1);
        return (
          <div>
            Child
            <div>{`${childUser.name}`}</div>
          </div>
        );
      });

      let prevOtherChildUser, otherChildUser;
      const OtherChild = memo(() => {
        [prevOtherChildUser, otherChildUser] = usePrevSelector(userSelector, 2);
        return (
          <div>
            Other Child
            <div>{`${childUser.name}`}</div>
          </div>
        );
      });

      let showChild, setShowChild, prevUser, user;
      const App = () => {
        [showChild, setShowChild] = useState(true);
        [prevUser, user] = usePrevSelector(userSelector, 0);
        return (
          <div>
            {showChild && <Child />}
            <OtherChild />
            <button onClick={() => setShowChild(false)}>setShowChildToFalse</button>
            <button onClick={() => setShowChild(true)}>setShowChildToTrue</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 0 ? { ...u } : u))}>setUser0</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 1 ? { ...u } : u))}>setUser1</button>
            <button onClick={() => setUsersAction(getState()[sliceName].users.map((u, index) => index === 2 ? { ...u } : u))}>setUser2</button>
          </div>
        );
      };

      render(<App />);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);

      const initialRenderChildUser = childUser;

      expect(prevChildUser).toBe(undefined);
      expect(prevOtherChildUser).toBe(undefined);
      expect(prevUser).toBe(undefined);
      expect(user).toBe(initialState.users[0]);
      expect(childUser).toBe(initialState.users[1]);
      expect(otherChildUser).toBe(initialState.users[2]);
      expect(showChild).toEqual(true);

      const setShowChildToFalse = screen.getByText("setShowChildToFalse");
      userEvent.click(setShowChildToFalse);
      expect(childUser).toBe(initialState.users[1]);
      expect(showChild).toEqual(false);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);

      const setUser1 = screen.getByText("setUser1");
      userEvent.click(setUser1);
      expect(prevChildUser).toBe(undefined);
      expect(prevOtherChildUser).toBe(undefined);
      expect(prevUser).toBe(undefined);
      expect(childUser).toBe(initialState.users[1]);

      const setShowChildToTrue = screen.getByText("setShowChildToTrue");
      userEvent.click(setShowChildToTrue);

      expect(prevChildUser).toBe(undefined);
      expect(prevOtherChildUser).toBe(undefined);
      expect(prevUser).toBe(undefined);
      expect(childUser).not.toBe(initialState.users[1]);
      expect(childUser).toEqual(initialState.users[1]);
      expect(showChild).toEqual(true);

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);

      const setUser2 = screen.getByText("setUser2");
      userEvent.click(setUser2);
      expect(prevChildUser).toBe(undefined);
      expect(prevOtherChildUser).toBe(initialState.users[2]);
      expect(prevUser).toBe(undefined);
      expect(otherChildUser).not.toBe(initialState.users[2]);
      expect(otherChildUser).toEqual(initialState.users[2]);
    });
  });
});