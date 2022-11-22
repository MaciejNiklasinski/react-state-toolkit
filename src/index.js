import { DEFAULT_STORE, DEFAULT_SLICE } from "./constants/store";
export { getSliceId, getActionId, getSelectorId } from "./factories/ids";
import { getStoresFactory } from "./factories/stores";
import { getSlicesFactory } from "./factories/slices";
import { getActionsFactory } from "./factories/actions";
import { getSelectorsFactory } from "./factories/selectors";
import { getImportersFactory } from "./factories/importers";
import { getHooksFactory } from "./factories/hooks";

const stores = {};
const slices = {};
const actions = {};
const actionsByType = {};
const actionsImports = {};
const selectors = {};
const selectorsImports = {};
const storesFactory = getStoresFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});
const slicesFactory = getSlicesFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});
const actionsFactory = getActionsFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});
const selectorsFactory = getSelectorsFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});
const importersFactory = getImportersFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});
const hooksFactory = getHooksFactory({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
});

export const createStore = ({
  name = DEFAULT_STORE,
  storeSlices = {},
  storeSelectors = {},
  isStrictDevMode = false,
} = {}) => storesFactory.createStore({
  name,
  storeSlices,
  storeSelectors,
  isStrictDevMode
});

export const createSlice = ({
  storeName = DEFAULT_STORE,
  name,
  reducer,
  sliceSelectors = {},
  initialState = {},
  noHandlerTypes = []
} = {}) => slicesFactory.createSlice({
  storeName,
  name,
  reducer,
  sliceSelectors,
  noHandlerTypes,
  initialState,
});

export const createAction = ({
  storeName = DEFAULT_STORE,
  sliceName,
  name,
  func,
} = {}) => actionsFactory.createAction({
  storeName,
  sliceName,
  name,
  func,
});

export const createAsyncAction = ({
  storeName = DEFAULT_STORE,
  sliceName,
  name,
  func,
  rethrow,
  precedeWith,
  continueWithOnResolved,
  continueWithOnRejected,
  continueWithOnSettled,
} = {}) => actionsFactory.createAsyncAction({
  storeName,
  sliceName,
  name,
  func,
  rethrow,
  precedeWith,
  continueWithOnResolved,
  continueWithOnRejected,
  continueWithOnSettled,
});

export const createSelector = ({
  storeName = DEFAULT_STORE,
  sliceName = DEFAULT_SLICE,
  name,
  funcs = [],
  memoOnArgs = false,
  keepMemo = false,
  isParameterized = false,
  paramsSignature = undefined,
  paramsMappers = {}
} = {}) => selectorsFactory.createSelector({
  storeName,
  sliceName,
  name,
  funcs,
  memoOnArgs,
  keepMemo,
  isParameterized,
  paramsSignature,
  paramsMappers
});

export const createImporter = ({
  storeName = DEFAULT_STORE,
} = {}) => importersFactory.createImporter({ storeName });

export const useMount = hooksFactory.useMount;
export const useUnmount = hooksFactory.useUnmount;
export const useSingleUnmountInStrictMode = hooksFactory.useSingleUnmountInStrictMode;
export const useSingleEffectInStrictMode = hooksFactory.useSingleEffectInStrictMode;
export const useObj = hooksFactory.useObj;
export const useSymbol = hooksFactory.useSymbol;
export const useFirstRender = hooksFactory.useFirstRender;
export const usePrev = hooksFactory.usePrev;
export const usePrevState = hooksFactory.usePrevState;