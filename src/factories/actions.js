import { DEFAULT_STORE } from '../constants/store';
import { TYPE_SUFFIXES } from '../constants/actions';
import { getActionId } from './ids';
import { getActionValidator } from './actions.validator';
import { UnableToInvokeUninitializedStoreAction } from '../errors/UnableToInvokeUninitializedStoreAction';

const toSnakeCase = str => str?.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)?.trimStart('_') || str;
const toScreamingSnakeCase = str => toSnakeCase(str)?.toUpperCase();

export const getActionsFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => ({
  createAction: ({
    storeName = DEFAULT_STORE,
    sliceName,
    name,
    func,
  }) => {
    let suffixedName = name;
    if (name && (typeof name !== "string" || !name.endsWith("Action")))
      suffixedName = `${name}Action`;
    const { validateAction } = getActionValidator({
      stores,
      slices,
      actions,
      actionsByType,
      actionsImports,
      selectors,
      selectorsImports,
    });
    validateAction({ storeName, sliceName, actionName: suffixedName, func });

    if (!stores[storeName]) stores[storeName] = {};
    if (!stores[storeName].actions) stores[storeName].actions = {};
    if (!stores[storeName].actions[sliceName])
      stores[storeName].actions[sliceName] = {};

    const type = Symbol(name);
    const action = params => {
      const { getState, getActions, getSelectors } = stores[storeName];
      const payload = func(params, { getState, getActions, getSelectors });
      const result = { sliceName, params, type, payload };
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
    const safeAction = (...params) => {
      if (!stores[storeName]?.initialized)
        throw new UnableToInvokeUninitializedStoreAction({ actionId });
      return action(...params);
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
  }) => {
    let suffixedName = name;
    if (name && (typeof name !== "string" || !name.endsWith("Action")))
      suffixedName = `${name}Action`;
    const { validateAction } = getActionValidator({
      stores,
      slices,
      actions,
      actionsByType,
      actionsImports,
      selectors,
      selectorsImports,
    });
    validateAction({ storeName, sliceName, actionName: suffixedName, func });

    if (!stores[storeName]) stores[storeName] = {};
    if (!stores[storeName].actions) stores[storeName].actions = {};
    if (!stores[storeName].actions[sliceName])
      stores[storeName].actions[sliceName] = {};

    const PENDING = Symbol(`${name}.${TYPE_SUFFIXES.PENDING}`);
    const REJECTED = Symbol(`${name}.${TYPE_SUFFIXES.REJECTED}`);
    const RESOLVED = Symbol(`${name}.${TYPE_SUFFIXES.RESOLVED}`);
    const type = { PENDING, REJECTED, RESOLVED };

    const action = async params => {
      const { getState, getActions, getSelectors } = stores[storeName];
      stores[storeName].dispatch({ sliceName, params, type: PENDING });
      return new Promise(async (resolve, reject) => {
        let result;
        try {
          const payload = await func(params, {
            getState,
            getActions,
            getSelectors,
          });
          result = { sliceName, params, type: RESOLVED, payload };
        } catch (error) {
          result = { sliceName, params, type: REJECTED, error, rethrow };
        }

        try { stores[storeName].dispatch(result); }
        catch (error) { reject(error); }
        
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
    const safeAction = (...params) => {
      if (!stores[storeName]?.initialized)
        throw new UnableToInvokeUninitializedStoreAction({ actionId });
      return action(...params);
    };
    return {
      ...actions[actionId],
      [suffixedName]: safeAction,
    };
  },
});