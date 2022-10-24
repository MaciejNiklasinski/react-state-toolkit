import { DEFAULT_SLICE } from '../constants/store';
import {
  // Importer Store
  UnableToCreateInvalidNameStoreImporter,
} from '../errors/UnableToCreateImporter';
import {
  // ImportAction Slice
  UnableToImportInvalidNameSliceAction,
  // ImportAction
  UnableToImportInvalidNameAction,
} from '../errors/UnableToImportAction';
import {
  // ImportSelector Slice
  UnableToImportInvalidNameSliceSelector,
  // ImportSelector
  UnableToImportInvalidNameSelector,
} from '../errors/UnableToImportSelector';
import { getSliceId, getActionId } from './ids';

export const getImporterValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const validateImportActionSlice = ({ storeName, sliceName, actionName }) => {
    if (!sliceName || /[_.]/.test(sliceName))
      throw new UnableToImportInvalidNameSliceAction({ storeName, sliceName, actionName });
  };
  const validateImportSelectorSlice = ({ storeName, sliceName, selectorName }) => {
    if (!sliceName || /[_.]/.test(sliceName))
      throw new UnableToImportInvalidNameSliceSelector({ storeName, sliceName, selectorName });
  };
  return {
    // Importer
    validateImporter: ({ storeName }) => {
      if (!storeName || /[_.]/.test(storeName))
        throw new UnableToCreateInvalidNameStoreImporter({ storeName });
    },
    // Import Action
    validateImportAction: ({ storeName, sliceName, actionName }) => {
      validateImportActionSlice({ storeName, sliceName, actionName });
      if (!actionName || /[_.]/.test(actionName))
        throw new UnableToImportInvalidNameAction({ storeName, sliceName, actionName });
    },
    // Import Selector
    validateImportSelector: ({ storeName, sliceName, selectorName }) => {
      validateImportSelectorSlice({ storeName, sliceName, selectorName });
      if (!selectorName || /[_.]/.test(selectorName))
        throw new UnableToImportInvalidNameSelector({ storeName, sliceName, selectorName });
    },
  };
};