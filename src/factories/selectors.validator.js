import { NO_PARAMS_SIGNATURE } from '../constants/selectors';
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
  UnableToCreateForeignSelectorLinkedSelector,
  UnableToCreateSelectorLastFuncSelector,
  UnableToCreateInvalidMemoOnArgsSelector,
  UnableToCreateExistingSelector,
  UnableToCreateParameterlessSignatureSelector,
  UnableToCreateMissingSignatureParameterizedSelector,
} from '../errors/UnableToCreateSelector';
import { getSliceId, getSelectorId, getParamsId } from './ids';
import { isValidName } from '../utils/strings';

export const getSelectorValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const validateSelectorStore = ({ storeName, sliceName, selectorName }) => {
    if (!isValidName(storeName))
      throw new UnableToCreateInvalidNameStoreSelector({ storeName, sliceName, selectorName });
    else if (stores[storeName]?.initialized)
      throw new UnableToCreateInitializedStoreSelector({ storeName, sliceName, selectorName });
  };
  const validateSelectorSlice = ({ storeName, sliceName, selectorName }) => {
    if (!isValidName(sliceName))
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
      isParameterized,
      paramsSignature,
    }) => {
      validateSelectorStore({ storeName, sliceName, selectorName });
      validateSelectorSlice({ storeName, sliceName, selectorName });

      if (!isValidName(selectorName))
        throw new UnableToCreateInvalidNameSelector({ storeName, sliceName, selectorName });
      else if (
        !Array.isArray(funcs) ||
        !funcs.length ||
        !funcs.every(func => func instanceof Function)
      )
        throw new UnableToCreateInvalidFuncsSelector({ storeName, sliceName, selectorName });

      const foreignLinkedSelector = funcs.find(
        (func) => func.__storeName && storeName !== func.__storeName
      );
      if (foreignLinkedSelector)
        throw new UnableToCreateForeignSelectorLinkedSelector({
          storeName,
          sliceName,
          selectorName,
          foreignSelectorId: foreignLinkedSelector.__selectorId
        });
      const lastFunc = funcs[funcs.length - 1];
      if (lastFunc.__selectorId)
        throw new UnableToCreateSelectorLastFuncSelector({
          storeName,
          sliceName,
          selectorName,
          linkedSelectorId: lastFunc.__selectorId
        });
      else if (funcs.length === 1 && memoOnArgs)
        throw new UnableToCreateInvalidMemoOnArgsSelector({ storeName, sliceName, selectorName });
      else if (selectors[getSelectorId({ storeName, sliceName, selectorName })])
        throw new UnableToCreateExistingSelector({ storeName, sliceName, selectorName });
      else if (!isParameterized && paramsSignature !== NO_PARAMS_SIGNATURE)
        throw new UnableToCreateParameterlessSignatureSelector({ storeName, sliceName, selectorName, paramsSignature });
      else if (isParameterized && paramsSignature === NO_PARAMS_SIGNATURE)
        throw new UnableToCreateMissingSignatureParameterizedSelector({ storeName, sliceName, selectorName });
    },
  };
};