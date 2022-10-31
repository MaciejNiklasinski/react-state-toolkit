import { DEFAULT_SLICE } from '../constants/store';
import {
  // Action Store
  UnableToCreateInvalidNameStoreAction,
  UnableToCreateInitializedStoreAction,
  // Action Slice
  UnableToCreateInvalidNameSliceAction,
  UnableToCreateReservedSliceAction,
  UnableToCreateInitializedSliceAction,
  // Action
  UnableToCreateInvalidNameAction,
  UnableToCreateInvalidFuncAction,
  UnableToCreateExistingAction,
} from '../errors/UnableToCreateAction';
import { getSliceId, getActionId } from './ids';
import { isValidName } from '../utils/strings';

export const getActionValidator = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const validateActionStore = ({ storeName, sliceName, actionName }) => {
    if (!isValidName(storeName))
      throw new UnableToCreateInvalidNameStoreAction({ storeName, sliceName, actionName });
    else if (stores[storeName]?.initialized)
      throw new UnableToCreateInitializedStoreAction({ storeName, sliceName, actionName });
  };
  const validateActionSlice = ({ storeName, sliceName, actionName }) => {
    if (!isValidName(sliceName))
      throw new UnableToCreateInvalidNameSliceAction({ storeName, sliceName, actionName });
    else if (sliceName === DEFAULT_SLICE)
      throw new UnableToCreateReservedSliceAction({ storeName, actionName });
    else if (!!slices[getSliceId({ storeName, sliceName })])
      throw new UnableToCreateInitializedSliceAction({ storeName, sliceName, actionName });
  };
  return {
    // Actions
    validateAction: ({ storeName, sliceName, actionName, func }) => {
      validateActionStore({ storeName, sliceName, actionName });
      validateActionSlice({ storeName, sliceName, actionName });

      if (!isValidName(actionName))
        throw new UnableToCreateInvalidNameAction({ storeName, sliceName, actionName });
      else if (!func || !(func instanceof Function))
        throw new UnableToCreateInvalidFuncAction({ storeName, sliceName, actionName });
      else if (actions[getActionId({ storeName, sliceName, actionName })])
        throw new UnableToCreateExistingAction({ storeName, sliceName, actionName });
    },
  };
};
