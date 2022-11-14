import { DEFAULT_STORE } from '../constants/store';
import { getSliceId } from './ids';
import { getSliceValidator } from './slices.validator';

export const getSlicesFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const { validateSlice } = getSliceValidator({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });
  return {
    createSlice: ({
      storeName = DEFAULT_STORE,
      name,
      reducer,
      sliceSelectors = {},
      initialState = {},
      noHandlerTypes = []
    }) => {
      if (sliceSelectors && typeof sliceSelectors === "object")
        sliceSelectors = Object.values(sliceSelectors);
      validateSlice({
        storeName,
        sliceName: name,
        reducer,
        sliceSelectors,
        noHandlerTypes
      });

      if (!stores[storeName]) stores[storeName] = {};
      if (!stores[storeName].selectors) stores[storeName].selectors = {};
      if (!stores[storeName].actions) stores[storeName].actions = {};
      if (!stores[storeName].reducers) stores[storeName].reducers = {};
      if (!stores[storeName].slices) stores[storeName].slices = {};
      if (!stores[storeName].state) stores[storeName].state = {};

      const getSliceState = () => stores[storeName].state[name];
      stores[storeName].state[name] = initialState;
      stores[storeName].reducers[name] = Object.freeze({ ...reducer });
      const slice = Object.freeze({
        storeName,
        sliceName: name,
        getSliceState,
        selectors: sliceSelectors
      });
      stores[storeName].slices[name] = slice;
      const sliceId = getSliceId({ storeName, sliceName: name });
      slices[sliceId] = slice;
      return slice;
    },
  };
};