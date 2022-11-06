import { DEFAULT_SLICE } from '../constants/store';
import {
  // Store
  UnableToCreateInvalidNameStore,
  UnableToCreateInitializedStore,
  // Store Slices
  UnableToCreateForeignSliceStore,
  UnableToCreateUnknownSliceStore,
  UnableToCreateMissingSliceStore,
  UnableToCreateEmptyStore,
  // Store Selectors
  UnableToCreateUnknownSelectorStore,
  UnableToCreateForeignStoreSelectorStore,
  UnableToCreateSliceSelectorStore,
  UnableToCreateSliceRegisteredSelectorStore,
  UnableToCreateImportWrapperSelectorStore,
  UnableToCreateMissingSelectorStore,
  UnableToCreateCircularSelectorStore,
  UnableToCreatePartialKeepMemoSelectorStore,
  UnableToCreateParameterlessToParameterizedSelectorStore,
  UnableToCreateNoParamsMapperSelectorStore,
  // Store Action Imports
  UnableToCreateUnknownSliceActionImportStore,
  UnableToCreateUnknownActionImportStore,
  // Store Selectors Imports
  UnableToCreateUnknownSliceSelectorImportStore,
  UnableToCreateUnknownSelectorImportStore,
} from '../errors/UnableToCreateStore';
import { getActionId, getSelectorId, getSliceId } from './ids';
import { isValidName } from '../utils/strings';

export const getStoreValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const validateStoreSlices = ({ storeName, storeSlices }) => {
    storeSlices.forEach(({ storeName: sliceStoreName, sliceName }) => {
      if (!slices[getSliceId({ storeName: sliceStoreName, sliceName })])
        throw new UnableToCreateUnknownSliceStore({ storeName });
      else if (storeName !== sliceStoreName)
        throw new UnableToCreateForeignSliceStore({ storeName, foreignSliceId: getSliceId({ storeName: sliceStoreName, sliceName }) });
    });
    Object.keys(slices).forEach(sliceId => {
      const [sliceStoreName, sliceName] = sliceId.split('.');
      if (
        sliceStoreName === storeName &&
        sliceName !== DEFAULT_SLICE &&
        !storeSlices.find(slice => slice.sliceName === sliceName)
      )
        throw new UnableToCreateMissingSliceStore({ storeName, missingSliceId: sliceId });
    });
    if (!storeSlices.length) throw new UnableToCreateEmptyStore({ storeName });
  };
  const validateStoreSelectors = ({ storeName, storeSlices, storeSelectors }) => {
    const storeSelectorsIds = [];
    storeSelectors.forEach(({ __selectorId, __isImportWrapper }) => {
      if (!__selectorId)
        throw new UnableToCreateUnknownSelectorStore({ storeName });

      const [selectorStoreName, selectorSliceName] = __selectorId.split('.');
      if (storeName !== selectorStoreName)
        throw new UnableToCreateForeignStoreSelectorStore({ storeName, foreignSelectorId: __selectorId });
      else if (DEFAULT_SLICE !== selectorSliceName)
        throw new UnableToCreateSliceSelectorStore({ storeName, sliceSelectorId: __selectorId });
      else if (!__isImportWrapper) {
        storeSlices.forEach(({ sliceName }) => {
          const { selectors: sliceSelectors } = stores[storeName].slices[sliceName];
          if (sliceSelectors)
            Object.values(sliceSelectors).forEach(sliceSelector => {
              if (sliceSelector.__selectorId === __selectorId)
                throw new UnableToCreateSliceRegisteredSelectorStore({ storeName, selectorId: __selectorId });
            });
        });
      } else
        throw new UnableToCreateImportWrapperSelectorStore({ storeName, selectorId: __selectorId });
      storeSelectorsIds.push(__selectorId);
    });

    const selectorsSliceNames = Object.values(stores[storeName].slices)
      .map(({ sliceName }) => sliceName)
      .filter(
        sliceName =>
          sliceName !== DEFAULT_SLICE &&
          stores[storeName].slices[sliceName].selectors,
      );
    Object.values(stores[storeName].selectors[DEFAULT_SLICE] || {}).forEach(
      ({ __selectorId }) => {
        if (
          !storeSelectorsIds.includes(__selectorId) &&
          !selectorsSliceNames.find(sliceName =>
            Object.values(stores[storeName].slices[sliceName].selectors).find(
              selector => selector.__selectorId === __selectorId,
            ),
          )
        )
          throw new UnableToCreateMissingSelectorStore({ storeName, missingSelectorId: __selectorId });
      },
    );
    const selectorsSlices = Object.keys(stores[storeName].selectors);
    selectorsSlices.forEach(
      (sliceName) => Object.values(stores[storeName].selectors[sliceName] || {}).forEach(
        ({ __selectorId }) => {
          let validateSelectionChain;
          validateSelectionChain = (selectorId, selectionChain = [selectorId]) => {
            selectors[selectorId].referencedSelectorIds.forEach(
              (funcSelectorId) => {
                if (selectionChain.includes(funcSelectorId))
                  throw new UnableToCreateCircularSelectorStore({
                    storeName,
                    circularSelectorId: funcSelectorId,
                    selectionChain
                  });
                validateSelectionChain(funcSelectorId, [...selectionChain, funcSelectorId]);
              }
            );
          }
          validateSelectionChain(__selectorId);

          const {
            keepMemo,
            isParameterized,
            paramsMappers,
            paramsSignature,
            referencedSelectorIds
          } = selectors[__selectorId];
          referencedSelectorIds.forEach(
            (funcSelectorId) => {
              const funcSelector = selectors[funcSelectorId];
              if (keepMemo && !funcSelector.keepMemo)
                throw new UnableToCreatePartialKeepMemoSelectorStore({ storeName, selectorId: __selectorId, nonKeepMemoSelectorId: funcSelectorId });
              else if (!isParameterized && funcSelector.isParameterized)
                throw new UnableToCreateParameterlessToParameterizedSelectorStore({
                  storeName,
                  selectorId: __selectorId,
                  parameterizedSelectorId: funcSelectorId
                });
              else if (
                !paramsMappers[funcSelectorId]
                && isParameterized
                && funcSelector.isParameterized
                && funcSelector.paramsSignature !== paramsSignature
              )
                throw new UnableToCreateNoParamsMapperSelectorStore({
                  storeName,
                  selectorId: __selectorId,
                  paramsSignature,
                  noMapperSelectorId: funcSelectorId,
                  noMapperParamsSignature: funcSelector.paramsSignature
                });
            }
          );
        }
      )
    );


  };
  const validateStoreActionImports = ({ storeName }) =>
    Object.keys(actionsImports[storeName] || {}).forEach(
      (sliceName) => Object.keys(actionsImports[storeName][sliceName]).forEach(
        (actionName) => {
          const sliceId = getSliceId({ storeName, sliceName });
          const actionId = getActionId({ storeName, sliceName, actionName });
          if (!slices[sliceId])
            throw new UnableToCreateUnknownSliceActionImportStore({ actionId });
          else if (!actions[actionId])
            throw new UnableToCreateUnknownActionImportStore({ actionId });
        })
    );
  const validateStoreSelectorImports = ({ storeName }) =>
    Object.keys(selectorsImports[storeName] || {}).forEach(
      (sliceName) => Object.keys(selectorsImports[storeName][sliceName]).forEach(
        (selectorName) => {
          const sliceId = getSliceId({ storeName, sliceName });
          const selectorId = getSelectorId({ storeName, sliceName, selectorName });
          if (!slices[sliceId] && sliceName !== DEFAULT_SLICE)
            throw new UnableToCreateUnknownSliceSelectorImportStore({ selectorId });
          else if (!selectors[selectorId])
            throw new UnableToCreateUnknownSelectorImportStore({ selectorId });
        })
    );
  return {
    // Store
    validateStore: ({ storeName, storeSlices, storeSelectors }) => {
      if (!isValidName(storeName))
        throw new UnableToCreateInvalidNameStore({ storeName });
      else if (stores[storeName]?.initialized)
        throw new UnableToCreateInitializedStore({ storeName });
      validateStoreSlices({ storeName, storeSlices });
      validateStoreSelectors({ storeName, storeSlices, storeSelectors });
      validateStoreActionImports({ storeName });
      validateStoreSelectorImports({ storeName });
    },
  };
};
