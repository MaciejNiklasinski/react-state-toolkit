import { DEFAULT_STORE, DEFAULT_SLICE, STATUS } from '../constants/store';
import { NO_PARAMS_SIGNATURE } from '../constants/selectors';
import {
  UnableToInvokeUninitializedStoreSelector,
  UnableToInvokeSelectingStoreSelector,
} from '../errors/UnableToInvokeSelector';
import { getParamsId, getSelectorId, getSubscriptionIds } from './ids';
import { getSelectorValidator } from './selectors.validator';
import { getSubscriptionsFactory } from './subscriptions';
import { suffixIfRequired } from '../utils/strings';

export const getSelectorsFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const { validateSelector } = getSelectorValidator({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });
  const { createMemoSubscription } = getSubscriptionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });
  const noParamsMapper = () => [];
  const equivalentParamsMapper = (params) => params;
  return {
    createSelector: ({
      storeName = DEFAULT_STORE,
      sliceName = DEFAULT_SLICE,
      name,
      funcs = [],
      memoOnArgs = false,
      keepMemo = false,
      isParameterized = false,
      paramsSignature = NO_PARAMS_SIGNATURE,
      paramsMappers = {}
    }) => {
      const suffixedName = suffixIfRequired(name, "Selector");
      validateSelector({
        storeName,
        sliceName,
        selectorName: suffixedName,
        funcs,
        memoOnArgs,
        isParameterized,
        paramsSignature,
      });

      if (!stores[storeName]) stores[storeName] = {};
      if (!stores[storeName].selectors) stores[storeName].selectors = {};
      if (!stores[storeName].selectors[sliceName])
        stores[storeName].selectors[sliceName] = {};

      const selectorId = getSelectorId({
        storeName,
        sliceName,
        selectorName: suffixedName,
      });

      paramsMappers = Object.entries(paramsMappers).reduce(
        (acc, [paramsSignature, paramsMapper]) => {
          acc[paramsSignature] = paramsMapper;
          return acc;
        },
        isParameterized
          ? { [NO_PARAMS_SIGNATURE]: noParamsMapper, [paramsSignature]: equivalentParamsMapper }
          : { [NO_PARAMS_SIGNATURE]: noParamsMapper }
      );

      const selectorHandle = {
        storeName,
        sliceName,
        selectorName: suffixedName,
        selectorId,
        memoOnArgs,
        keepMemo,
        isParameterized,
        paramsSignature,
        paramsMappers,
        referencedSelectorIds: funcs.filter(
          ({ __selectorId }) => !!__selectorId
        ).map(
          ({ __selectorId }) => __selectorId
        ),
        funcs: [...funcs],
        clearCache: (...params) => {
          const { subscriptionId } = getSubscriptionIds({ selectorId, params });
          const subscription = stores[storeName].subscriptionsMatrix.get(subscriptionId);
          if (!subscription[subscriptionId]) return;
          subscription.lastArgs = [];
          subscription.lastSelected = null;
        },
      };
      selectors[selectorId] = selectorHandle;

      const getStoreArg = (params) => Object.freeze({
        getParams: () => [...params],
      });

      const selectValueFunc = (state, ...params) => {
        const storeArg = getStoreArg(params);
        if (stores[storeName].status === STATUS.SELECTING)
          throw new UnableToInvokeSelectingStoreSelector({ selectorId });
        else if (selectorHandle.funcs.length > 1)
          return selectorHandle.funcs.reduce(
            (args, selectFunc, index, arr) => {
              if (index === arr.length - 1) {
                return selectFunc(...args, storeArg);
              } else if (selectFunc.__selectorId) {
                const selectFuncSelectorHandle = selectors[selectFunc.__selectorId];
                const paramsMapper = paramsMappers[selectFuncSelectorHandle.paramsSignature];
                const mappedParams = paramsMapper(params);
                args.push(selectFunc(state, ...mappedParams));
                return args;
              } else {
                args.push(selectFunc(state, storeArg));
                return args;
              }
            }, []);
        else return selectorHandle.funcs[0](state, storeArg);
      };

      const selectSubscriptionValueFunc = (state, ...params) => {
        if (stores[storeName].status === STATUS.SELECTING)
          throw new UnableToInvokeSelectingStoreSelector({ selectorId });
        const { subscriptionId } = getSubscriptionIds({ selectorId, params });
        let subscription = stores[storeName].subscriptionsMatrix.get(subscriptionId);
        if (!subscription)
          ({ subscription } = createMemoSubscription({
            storeName,
            selectorId,
            params,
            isCacheOnly: true,
            validateSubscription: () => { }, // No validation
          }));
        return subscription.selectFunc(state);
      };

      let validatedFunc;
      const exportFunc = (state, ...params) => {
        if (validatedFunc) return validatedFunc(state, ...params);
        else if (!stores[storeName].initialized)
          throw new UnableToInvokeUninitializedStoreSelector({ selectorId });
        validatedFunc = keepMemo ? selectSubscriptionValueFunc : selectValueFunc;
        return validatedFunc(state, ...params);
      };
      stores[storeName].selectors[sliceName][suffixedName] = exportFunc;
      selectorHandle[suffixedName] = exportFunc;
      exportFunc.__storeName = storeName;
      exportFunc.__selectorId = selectorId;

      // Selector export
      return Object.freeze({
        storeName,
        sliceName,
        selectorName: suffixedName,
        [suffixedName]: exportFunc,
        clearCache: selectorHandle.clearCache,
      });
    },
  };
};
