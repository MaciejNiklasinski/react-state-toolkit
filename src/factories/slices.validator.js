import { DEFAULT_SLICE } from '../constants/store';
import {
  // Slice Store
  UnableToCreateInvalidNameStoreSlice,
  UnableToCreateInitializedStoreSlice,
  // Slice
  UnableToCreateInvalidNameSlice,
  UnableToCreateReservedNameSlice,
  UnableToCreateExistingSlice,
  // Slice Actions
  UnableToCreateNoReducerSlice,
  UnableToCreateUnknownActionHandlerReducerSlice,
  UnableToCreateForeignStoreActionHandlerReducerSlice,
  UnableToCreateForeignSliceActionHandlerReducerSlice,
  UnableToCreateMissingActionHandlerReducerSlice,
  // Slice Selectors
  UnableToCreateNoSelectorsSlice,
  UnableToCreateUnknownSelectorSlice,
  UnableToCreateForeignStoreSelectorSlice,
  UnableToCreateForeignSliceSelectorSlice,
  UnableToCreateForeignRegisteredSliceSelectorSlice,
  UnableToCreateImportWrapperSelectorSlice,
  UnableToCreateMissingSliceSelectorSlice,
} from '../errors/UnableToCreateSlice';
import { getSliceId } from './ids';
import { isValidName } from '../utils/strings';

export const getSliceValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const validateSliceStore = ({ storeName, sliceName }) => {
    if (!isValidName(storeName))
      throw new UnableToCreateInvalidNameStoreSlice({ storeName, sliceName });
    else if (stores[storeName]?.initialized)
      throw new UnableToCreateInitializedStoreSlice({ storeName, sliceName });
  };
  const validateSliceActions = ({ storeName, sliceName, reducer, noHandlerTypes }) => {
    if (!reducer)
      throw new UnableToCreateNoReducerSlice({ storeName, sliceName });
    else if (Reflect.ownKeys(reducer).some((key) => !actionsByType[key]))
      throw new UnableToCreateUnknownActionHandlerReducerSlice({ storeName, sliceName });

    const handlersByName = {};
    Reflect.ownKeys(reducer).forEach(type => {
      const {
        storeName: actionStoreName,
        sliceName: actionSliceName,
        actionName,
      } = actionsByType[type];
      if (storeName !== actionStoreName)
        throw new UnableToCreateForeignStoreActionHandlerReducerSlice({ storeName, sliceName, actionStoreName, actionSliceName, actionName });
      else if (sliceName !== actionSliceName)
        throw new UnableToCreateForeignSliceActionHandlerReducerSlice({ storeName, sliceName, actionSliceName, actionName });

      handlersByName[actionName] = type;
    });

    // This will validate whether each action have an action handler.
    // For async action that means that action with at least ONE event handler
    // (PENDING/REJECTED/RESOLVED) or a type object will be considered as valid.
    Object.values(actions).forEach(
      ({
        storeName: actionStoreName,
        sliceName: actionSliceName,
        actionName,
        actionType,
      }) => {
        const types = typeof actionType === "symbol"
          ? [actionType] : [
            actionType.PENDING,
            actionType.REJECTED,
            actionType.RESOLVED,
          ];

        const isNoHandlerType = () => noHandlerTypes.some(
          (type) => types.includes(type) ||
            types.includes(type.PENDING) ||
            types.includes(type.REJECTED) ||
            types.includes(type.RESOLVED)
        );

        if (
          storeName === actionStoreName &&
          sliceName === actionSliceName &&
          !isNoHandlerType() &&
          !handlersByName[actionName]
        )
          throw new UnableToCreateMissingActionHandlerReducerSlice({ storeName, sliceName, actionName });
      },
    );
  };
  const validateSliceSelectors = ({ storeName, sliceName, sliceSelectors }) => {
    if (!sliceSelectors)
      throw new UnableToCreateNoSelectorsSlice({ storeName, sliceName });

    sliceSelectors.forEach(({ __selectorId, __isImportWrapper }) => {
      if (!selectors[__selectorId])
        throw new UnableToCreateUnknownSelectorSlice({ storeName, sliceName, selectorId: __selectorId });
      const [selectorStoreName, selectorSliceName] = __selectorId.split('.');
      if (storeName !== selectorStoreName)
        throw new UnableToCreateForeignStoreSelectorSlice({ storeName, sliceName, selectorId: __selectorId });
      else if (![sliceName, DEFAULT_SLICE].includes(selectorSliceName))
        throw new UnableToCreateForeignSliceSelectorSlice({ storeName, sliceName, selectorId: __selectorId });
      else if (selectorSliceName === DEFAULT_SLICE && stores[storeName].slices)
        Object.entries(stores[storeName].slices).forEach(
          ([storeSliceName, slice]) => {
            if (storeSliceName !== DEFAULT_SLICE && slice.selectors)
              Object.values(slice.selectors).forEach(sliceSelector => {
                if (sliceSelector.__selectorId === __selectorId)
                  throw new UnableToCreateForeignRegisteredSliceSelectorSlice({ storeName, sliceName, selectorSliceName: storeSliceName, selectorId: __selectorId });
              });
          },
        );
      else if (__isImportWrapper)
        throw new UnableToCreateImportWrapperSelectorSlice({ storeName, sliceName, selectorId: __selectorId });
    });

    Object.keys(selectors).forEach(selectorId => {
      const [selectorStoreName, selectorSliceName] = selectorId.split('.');
      if (
        selectorStoreName === storeName &&
        selectorSliceName === sliceName &&
        !sliceSelectors.find(func => func.__selectorId === selectorId)
      )
        throw new UnableToCreateMissingSliceSelectorSlice({ storeName, sliceName, selectorId });
    });
  };
  return {
    // Slice
    validateSlice: ({ storeName, sliceName, reducer, noHandlerTypes, sliceSelectors }) => {
      validateSliceStore({ storeName, sliceName });

      if (!isValidName(sliceName))
        throw new UnableToCreateInvalidNameSlice({ storeName, sliceName });
      else if (sliceName === DEFAULT_SLICE)
        throw new UnableToCreateReservedNameSlice({ storeName });
      else if (slices[getSliceId({ storeName, sliceName })])
        throw new UnableToCreateExistingSlice({ storeName, sliceName });

      validateSliceActions({ storeName, sliceName, reducer, noHandlerTypes });
      validateSliceSelectors({ storeName, sliceName, sliceSelectors });
    },
  };
};