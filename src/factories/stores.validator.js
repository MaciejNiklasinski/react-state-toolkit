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
  UnableToCreateMissingSelectorStore
} from '../errors/UnableToCreateStore';
import { getSliceId } from './ids';

export const getStoreValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  selectors,
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
    Object.values(storeSelectors).forEach(({ __selectorId }) => {
      if (!__selectorId)
        throw new UnableToCreateUnknownSelectorStore({ storeName });

      const [selectorStoreName, selectorSliceName] = __selectorId.split('.');
      if (storeName !== selectorStoreName)
        throw new UnableToCreateForeignStoreSelectorStore({ storeName, foreignSelectorId: __selectorId });
      else if (DEFAULT_SLICE !== selectorSliceName)
        throw new UnableToCreateSliceSelectorStore({ storeName, sliceSelectorId: __selectorId });
      else if (selectorSliceName === DEFAULT_SLICE) {
        storeSlices.forEach(({ sliceName }) => {
          const { selectors: sliceSelectors } = stores[storeName].slices[sliceName];
          if (sliceSelectors)
            Object.values(sliceSelectors).forEach(sliceSelector => {
              if (sliceSelector.__selectorId === __selectorId)
                throw new UnableToCreateSliceRegisteredSelectorStore({ storeName, selectorId: __selectorId });
            });
        });
      } else storeSelectorsIds.push(__selectorId);
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
  };
  return {
    // Store
    validateStore: ({ storeName, storeSlices, storeSelectors }) => {
      if (!storeName || /[_.]/.test(storeName))
        throw new UnableToCreateInvalidNameStore({ storeName });
      else if (stores[storeName]?.initialized)
        throw new UnableToCreateInitializedStore({ storeName });
      validateStoreSlices({ storeName, storeSlices });
      validateStoreSelectors({ storeName, storeSlices, storeSelectors });
    },
  };
};