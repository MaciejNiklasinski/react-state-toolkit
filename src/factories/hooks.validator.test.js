import { render } from '@testing-library/react'
import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Store useSelector
  UnableToUseNonSelector,
  UnableToUseForeignStoreSelector,
} from '../errors/UnableToUseSelector';
import {
  // Store useSelector
  UnableToUseNonSelectorMemo,
  UnableToUseForeignStoreSelectorMemo,
} from '../errors/UnableToUseSelectorMemo';
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getSelectorId } from "./ids";

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

describe("useSelector validator", () => {
  test("Should throw correct error when attempting to useSelector with non-selector func", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    const App = () => {
      const state = useSelector((state) => state);
      return (
        <div>
          <div>{`${!!state}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };
    let error;
    try { render(<App />); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToUseNonSelector({ storeName: DEFAULT_STORE }))
  });

  test("Should throw correct error when attempting to useSelector with foreign store selector func", () => {
    const foreignStoreName = "foreignStore";
    const foreignSliceName = "foreignSlice";
    const foreignSelectorName = "foreignSelector";
    const { foreignSelector } = createSelector({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      name: foreignSelectorName,
      funcs: [(state) => state[foreignSliceName].value]
    });
    const foreignSelectorId = getSelectorId({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      selectorName: foreignSelectorName
    });

    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    const {
      useSelector,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    const App = () => {
      const state = useSelector(foreignSelector);
      return (
        <div>
          <div>{`${!!state}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };
    let error;
    try { render(<App />); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToUseForeignStoreSelector({ storeName: DEFAULT_STORE, selectorId: foreignSelectorId }))
  });
});

describe("useSelectorMemo validator", () => {
  test("Should throw correct error when attempting to useSelectorMemo with non-selector func", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    const {
      useSelectorMemo,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    const App = () => {
      const state = useSelectorMemo((state) => state);
      return (
        <div>
          <div>{`${!!state}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };
    let error;
    try { render(<App />); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToUseNonSelectorMemo({ storeName: DEFAULT_STORE }))
  });

  test("Should throw correct error when attempting to useSelectorMemo with foreign store selector func", () => {
    const foreignStoreName = "foreignStore";
    const foreignSliceName = "foreignSlice";
    const foreignSelectorName = "foreignSelector";
    const { foreignSelector } = createSelector({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      name: foreignSelectorName,
      funcs: [(state) => state[foreignSliceName].value]
    });
    const foreignSelectorId = getSelectorId({
      storeName: foreignStoreName,
      sliceName: foreignSliceName,
      selectorName: foreignSelectorName
    });

    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    const {
      useSelectorMemo,
      getState,
    } = createStore({
      storeSlices: { slice }
    });

    const App = () => {
      const state = useSelectorMemo(foreignSelector);
      return (
        <div>
          <div>{`${!!state}`}</div>
          <button onClick={() => setValueAction(1)}>setValue</button>
        </div>
      );
    };
    let error;
    try { render(<App />); }
    catch (err) { error = err; }
    expect(error).toEqual(new UnableToUseForeignStoreSelectorMemo({ storeName: DEFAULT_STORE, selectorId: foreignSelectorId }))
  });
});