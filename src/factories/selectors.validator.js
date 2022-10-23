import {
  // Selector Store
  UnableToCreateInvalidNameStoreSelector,
  UnableToCreateInitializedStoreSelector,
  // Selector Slice
  UnableToCreateInvalidNameSliceSelector,
  UnableToCreateInitializedSliceSelector,
  // Selector
  UnableToCreateInvalidNameSelector,
  UnableToCreateInvalidFuncsSelector,
  UnableToCreateInvalidMemoOnArgsSelector,
  UnableToCreateExistingSelector
} from '../errors/UnableToCreateSelector';
import { getSliceId, getSelectorId } from './ids';

export const getSelectorValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  selectors,
}) => {
  const validateSelectorStore = ({ storeName, sliceName, selectorName }) => {
    if (!storeName || /[_.]/.test(storeName))
      throw new UnableToCreateInvalidNameStoreSelector({ storeName, sliceName, selectorName });
    else if (stores[storeName]?.initialized)
      throw new UnableToCreateInitializedStoreSelector({ storeName, sliceName, selectorName });
  };
  const validateSelectorSlice = ({ storeName, sliceName, selectorName }) => {
    if (!sliceName || /[_.]/.test(sliceName))
      throw new UnableToCreateInvalidNameSliceSelector({ storeName, sliceName, selectorName });
    else if (!!slices[getSliceId({ storeName, sliceName })])
      throw new UnableToCreateInitializedSliceSelector({ storeName, sliceName, selectorName });
  };
  return {
    // Selectors
    validateSelector: ({
      storeName,
      sliceName,
      selectorName,
      funcs,
      memoOnArgs,
    }) => {
      validateSelectorStore({ storeName, sliceName, selectorName });
      validateSelectorSlice({ storeName, sliceName, selectorName });

      if (!selectorName || /[_.]/.test(selectorName))
        throw new UnableToCreateInvalidNameSelector({ storeName, sliceName, selectorName });
      else if (
        !Array.isArray(funcs) ||
        !funcs.length ||
        !funcs.every(func => func instanceof Function)
      )
        throw new UnableToCreateInvalidFuncsSelector({ storeName, sliceName, selectorName });
      else if (funcs.length === 1 && memoOnArgs)
        throw new UnableToCreateInvalidMemoOnArgsSelector({ storeName, sliceName, selectorName });
      else if (selectors[getSelectorId({ storeName, sliceName, selectorName })])
        throw new UnableToCreateExistingSelector({ storeName, sliceName, selectorName });
    },
  };
};