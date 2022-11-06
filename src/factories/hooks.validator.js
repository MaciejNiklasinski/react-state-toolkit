import { DEFAULT_SLICE } from '../constants/store';
import {
  // Store useSelector
  UnableToUseNonSelector,
  UnableToUseForeignStoreSelector,
} from '../errors/UnableToUseSelector';
import {
  // Store useSelectorMemo
  UnableToUseNonSelectorMemo,
  UnableToUseForeignStoreSelectorMemo,
} from '../errors/UnableToUseSelectorMemo';

export const getHooksValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => ({
  // Store useSelector
  validateUseSelector: ({ storeName, selectorStoreName, selectorId }) => {
    if (!selectorId)
      throw new UnableToUseNonSelector({ storeName });
    else if (storeName !== selectorStoreName)
      throw new UnableToUseForeignStoreSelector({ storeName, selectorId });
  },
  // Store useSelectorMemo
  validateUseSelectorMemo: ({ storeName, selectorStoreName, selectorId }) => {
    if (!selectorId)
      throw new UnableToUseNonSelectorMemo({ storeName });
    else if (storeName !== selectorStoreName)
      throw new UnableToUseForeignStoreSelectorMemo({ storeName, selectorId });
  },
});
