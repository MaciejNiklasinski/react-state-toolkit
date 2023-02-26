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
      precedeWith = (pendingAction, storeArg) => null,
      continueWithOnResolved = (settledAction, storeArg) => null,
      continueWithOnRejected = (settledAction, storeArg) => null,
      continueWithOnSettled = (settledAction, storeArg) => null,
    }) => {
      const suffixedName = suffixIfRequired(name, "Action");
      validateAction({
        storeName,
        sliceName,
        actionName: suffixedName,
        func,
        precedeWith,
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
        return new Promise(async (resolve, reject) => {
          const storeArg = { getState, getActions, getSelectors };
          const pendingAction = { sliceName, param, type: PENDING };
          const settledAction = { sliceName, param };
          try {
            const onPrecedeResult = precedeWith(param, storeArg, pendingAction);
            settledAction.onPrecede = pendingAction.onPrecede = {
              result: onPrecedeResult instanceof Promise
                ? await onPrecedeResult : onPrecedeResult
            };
          } catch (error) { settledAction.onPrecede = { error }; }

          try { stores[storeName].dispatch(pendingAction); }
          catch (error) { reject(error); }

          try {
            const payload = await func(param, storeArg);
            settledAction.type = RESOLVED;
            settledAction.payload = payload;
          } catch (error) {
            settledAction.type = REJECTED;
            settledAction.error = error;
            settledAction.rethrow = rethrow;
          }

          try { stores[storeName].dispatch(settledAction); }
          catch (error) { reject(error); }

          if (!settledAction.error) try {
            const onResolvedResult = continueWithOnResolved(param, storeArg, settledAction);
            settledAction.onResolved = {
              result: onResolvedResult instanceof Promise
                ? await onResolvedResult
                : onResolvedResult
            };
          } catch (error) { settledAction.onResolved = { error }; }
          else try {
            const onRejectedResult = continueWithOnRejected(param, storeArg, settledAction);
            settledAction.onRejected = {
              result: onRejectedResult instanceof Promise
                ? await onRejectedResult
                : onRejectedResult
            };
          } catch (error) { settledAction.onRejected = { error }; }
          try {
            const onSettledResult = continueWithOnSettled(param, storeArg, settledAction);
            settledAction.onSettled = {
              result: onSettledResult instanceof Promise
                ? await onSettledResult
                : onSettledResult
            };
          } catch (error) { settledAction.onSettled = { error }; }

          if (settledAction.error && settledAction.rethrow)
            reject(settledAction.error)
          else resolve(settledAction);
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