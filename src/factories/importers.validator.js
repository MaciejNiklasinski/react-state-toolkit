import { DEFAULT_SLICE } from '../constants/store';
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from '../errors/UnableToCreateImporter';
import {
  // ImportAction Slice
  UnableToImportInvalidNameSliceAction,
  UnableToImportUnregisteredSliceAction,
  // ImportAction
  UnableToImportInvalidNameAction,
  UnableToImportUnregisteredAction,
} from '../errors/UnableToImportAction';
import {
  // ImportSelector Slice
  UnableToImportInvalidNameSliceSelector,
  UnableToImportUnregisteredSliceSelector,
  // ImportSelector
  UnableToImportInvalidNameSelector,
  UnableToImportUnregisteredSelector,
} from '../errors/UnableToImportSelector';
import { getSliceId, getActionId, getSelectorId } from './ids';
import { isValidName } from '../utils/strings';

export const getImporterValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  // ImportAction Slice
  const validateImportActionSlice = ({ storeName, sliceName, actionName }) => {
    if (!isValidName(sliceName))
      throw new UnableToImportInvalidNameSliceAction({ storeName, sliceName, actionName });

    const sliceId = getSliceId({ storeName, sliceName });
    if (stores[storeName]?.initialized && !slices[sliceId])
      throw new UnableToImportUnregisteredSliceAction({ storeName, sliceName, actionName });
  };
  // ImportSelector Slice
  const validateImportSelectorSlice = ({ storeName, sliceName, selectorName }) => {
    if (!isValidName(sliceName))
      throw new UnableToImportInvalidNameSliceSelector({ storeName, sliceName, selectorName });

    const sliceId = getSliceId({ storeName, sliceName });
    if (stores[storeName]?.initialized && !slices[sliceId])
      throw new UnableToImportUnregisteredSliceSelector({ storeName, sliceName, selectorName });
  };
  return {
    // Importer
    validateImporter: ({ storeName }) => {
      if (!isValidName(storeName))
        throw new UnableToCreateInvalidNameStoreImporter({ storeName });
    },
    // ImportAction
    validateImportAction: ({ storeName, sliceName, actionName }) => {
      validateImportActionSlice({ storeName, sliceName, actionName });
      if (!isValidName(actionName))
        throw new UnableToImportInvalidNameAction({ storeName, sliceName, actionName });

      const actionId = getActionId({ storeName, sliceName, actionName });
      if (stores[storeName]?.initialized && !actions[actionId])
        throw new UnableToImportUnregisteredAction({ storeName, sliceName, actionName });
    },
    // ImportSelector
    validateImportSelector: ({ storeName, sliceName, selectorName }) => {
      validateImportSelectorSlice({ storeName, sliceName, selectorName });
      if (!isValidName(selectorName))
        throw new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName });

      const selectorId = getSelectorId({ storeName, sliceName, selectorName });
      if (stores[storeName]?.initialized && !selectors[selectorId])
        throw new UnableToImportUnregisteredSelector({ storeName, sliceName, selectorName });
    },
  };
};