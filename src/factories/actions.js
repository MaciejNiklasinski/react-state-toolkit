import { DEFAULT_STORE, STATUS } from '../constants/store';
import { TYPE_SUFFIXES } from '../constants/actions';
import { getActionId } from './ids';
import { getActionValidator } from './actions.validator';
import {
  UnableToInvokeUninitializedStoreAction,
  UnableToInvokeReducingStoreAction,
  UnableToInvokeSelectingStoreAction,
} from '../errors/UnableToInvokeAction';
import { suffixIfRequired, toScreamingSnakeCase } from '../utils/strings';

export const getActionsFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const { validateAction } = getActionValidator({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });
  return {
    createAction: ({
      storeName = DEFAULT_STORE,
      sliceName,
      name,
      func,
    }) => {
      const suffixedName = suffixIfRequired(name, "Action");
      validateAction({ storeName, sliceName, actionName: suffixedName, func });

      if (!stores[storeName]) stores[storeName] = {};
      if (!stores[storeName].actions) stores[storeName].actions = {};
      if (!stores[storeName].actions[sliceName])
        stores[storeName].actions[sliceName] = {};

      const type = Symbol(name);
      const action = param => {
        const { getState, getActions, getSelectors, status } = stores[storeName];
        if (status === STATUS.REDUCING)
          throw new UnableToInvokeReducingStoreAction({ actionId });
        else if (status === STATUS.SELECTING)
          throw new UnableToInvokeSelectingStoreAction({ actionId });
        const payload = func(param, { getState, getActions, getSelectors });
        const result = { sliceName, param, type, payload };
        stores[storeName].dispatch(result);
        return result;
      };

      stores[storeName].actions[sliceName][suffixedName] = action;
      const actionId = getActionId({
        storeName,
        sliceName,
        actionName: suffixedName,
      });
      actions[actionId] = Object.freeze({
        storeName,
        sliceName,
        actionName: suffixedName,
        actionType: type,
        [suffixedName]: action,
        [toScreamingSnakeCase(suffixedName)]: type,
      });
      actionsByType[type] = actions[actionId];
      const safeAction = (param) => {
        if (!stores[storeName]?.initialized)
          throw new UnableToInvokeUninitializedStoreAction({ actionId });
        return action(param);
      };
      return {
        ...actions[actionId],
        [suffixedName]: safeAction,
      };
    },

    createAsyncAction: ({
      storeName = DEFAULT_STORE,
      sliceName,
      name,
      func,
      rethrow = true,
      continueWithOnResolved = () => null,
      continueWithOnRejected = () => null,
      continueWithOnSettled = () => null,
    }) => {
      const suffixedName = suffixIfRequired(name, "Action");
      validateAction({
        storeName,
        sliceName,
        actionName: suffixedName,
        func,
        continueWithOnResolved,
        continueWithOnRejected,
        continueWithOnSettled,
      });

      if (!stores[storeName]) stores[storeName] = {};
      if (!stores[storeName].actions) stores[storeName].actions = {};
      if (!stores[storeName].actions[sliceName])
        stores[storeName].actions[sliceName] = {};

      const PENDING = Symbol(`${name}.${TYPE_SUFFIXES.PENDING}`);
      const REJECTED = Symbol(`${name}.${TYPE_SUFFIXES.REJECTED}`);
      const RESOLVED = Symbol(`${name}.${TYPE_SUFFIXES.RESOLVED}`);
      const type = { PENDING, REJECTED, RESOLVED };

      const action = param => {
        const { getState, getActions, getSelectors, status } = stores[storeName];
        if (status === STATUS.REDUCING)
          throw new UnableToInvokeReducingStoreAction({ actionId });
        else if (status === STATUS.SELECTING)
          throw new UnableToInvokeSelectingStoreAction({ actionId });
        stores[storeName].dispatch({ sliceName, param, type: PENDING });
        return new Promise(async (resolve, reject) => {
          let result;
          try {
            const payload = await func(param, {
              getState,
              getActions,
              getSelectors,
            });
            result = { sliceName, param, type: RESOLVED, payload };
          } catch (error) {
            result = { sliceName, param, type: REJECTED, error, rethrow };
          }

          try { stores[storeName].dispatch(result); }
          catch (error) { reject(error); }

          if (!result.error) try {
            const onResolvedResult = continueWithOnResolved(param);
            result.onResolved = {
              result: onResolvedResult instanceof Promise
                ? await onResolvedResult
                : onResolvedResult
            };
          } catch (error) { result.onResolved = { error }; }
          else try {
            const onRejectedResult = continueWithOnRejected(param);
            result.onRejected = {
              result: onRejectedResult instanceof Promise
                ? await onRejectedResult
                : onRejectedResult
            };
          } catch (error) { result.onRejected = { error }; }
          try {
            const onSettledResult = continueWithOnSettled(param);
            result.onSettled = {
              result: onSettledResult instanceof Promise
                ? await onSettledResult
                : onSettledResult
            };
          } catch (error) { result.onSettled = { error }; }

          if (result.error && result.rethrow)
            reject(result.error)
          else resolve(result);
        });
      };
      stores[storeName].actions[sliceName][suffixedName] = action;
      const actionId = getActionId({
        storeName,
        sliceName,
        actionName: suffixedName,
      });
      actions[actionId] = Object.freeze({
        storeName,
        sliceName,
        actionName: suffixedName,
        actionType: type,
        [suffixedName]: action,
        [toScreamingSnakeCase(suffixedName)]: type,
      });
      actionsByType[PENDING] = actions[actionId];
      actionsByType[REJECTED] = actions[actionId];
      actionsByType[RESOLVED] = actions[actionId];
      const safeAction = (param) => {
        if (!stores[storeName]?.initialized)
          throw new UnableToInvokeUninitializedStoreAction({ actionId });
        return action(param);
      };
      return {
        ...actions[actionId],
        [suffixedName]: safeAction,
      };
    },
  };
};