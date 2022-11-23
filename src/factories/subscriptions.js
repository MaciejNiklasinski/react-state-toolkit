import { DEFAULT_STORE, STATUS } from "../constants/store";
import { getSubscriptionIds } from "./ids";

export const getSubscriptionsFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const getSubscriptionArg = (params) => Object.freeze({
    getParams: () => [...params],
  });

  const stackHookHandle = ({
    storeHandle,
    hookHandle
  }) => storeHandle.triggersStack.set(hookHandle.id, hookHandle);

  const createSubscriptionHandle = ({
    isCacheOnly,
    storeHandle,
    selectorHandle,
    hookHandle,
    params,
    subscriptionId,
    paramsId,
    associatedSubscriptionsChain,
    validateSubscription,
  }) => {
    let subscription;
    const triggers = new Map();
    const holders = new Map();
    const associatedSubscriptions = new Map();
    subscription = {
      selectorId: selectorHandle.selectorId,
      id: subscriptionId,
      paramsId,
      params,
      paramsMappers: selectorHandle.paramsMappers,
      memoOnArgs: selectorHandle.memoOnArgs,
      keepMemo: selectorHandle.keepMemo,
      arg: getSubscriptionArg(params),
      triggers,
      holders,
      associatedSubscriptions,
      funcs: [],
      lastArgs: [],
      prevSelected: undefined,
      lastSelected: undefined,
      lastStateVersion: null,
      onSelectedChange: newSelected =>
        triggers.forEach((trigger) => {
          trigger.requiresRender = true;
          trigger.value = newSelected;
        }),
      onStateChange: newState => {
        const currentSelected = subscription.lastSelected;
        const newSelected = subscription.selectFunc(newState, params, subscription, paramsId);
        if (currentSelected === newSelected) return;
        subscription.onSelectedChange(newSelected);
      }
    };

    if (!associatedSubscriptionsChain)
      associatedSubscriptionsChain = [associatedSubscriptions];
    else {
      associatedSubscriptionsChain.forEach(
        (associatedSubscriptions) => associatedSubscriptions.set(subscription.id, subscription)
      );
      associatedSubscriptionsChain = [...associatedSubscriptionsChain, associatedSubscriptions]; // replace instead of push
      //associatedSubscriptionsChain.push(associatedSubscriptions); // replace instead of push
    }

    // TODO refactor this if else block into separate function
    if (selectorHandle.funcs.length > 1) {
      selectorHandle.funcs.forEach((selectFunc, index, arr) => {
        if (index === arr.length - 1) {
          subscription.lastSelected = selectFunc(...subscription.lastArgs, subscription.arg);
          subscription.lastStateVersion = storeHandle.stateVersion;
          subscription.funcs.push((...args) => selectFunc(...args, subscription.arg));
        } else if (!selectFunc.__selectorId) {
          const selected = selectFunc(storeHandle.state, subscription.arg);
          subscription.lastArgs.push(selected);
          subscription.funcs.push((state) => selectFunc(state, subscription.arg));
        } else {
          const funcSelectorId = selectFunc.__selectorId;
          const { storeName, subscriptionsMatrix } = storeHandle;
          const funcSelectorHandle = selectors[selectFunc.__selectorId];
          const funcParamsMapper = subscription.paramsMappers[funcSelectorHandle.paramsSignature];
          const funcParams = funcParamsMapper(params);
          const {
            subscriptionId: funcSubscriptionId,
            funcParamsId,
          } = getSubscriptionIds({ selectorId: funcSelectorId, params: funcParams })
          const funcSubscriptions = ensureSubscriptionAvailability({
            selectorId: selectFunc.__selectorId,
            selectorStoreName: selectFunc.__storeName,
            subscriptionId: funcSubscriptionId,
            paramsId: funcParamsId,
            params: funcParams,
            storeName: storeHandle.name,
            hookHandle,
            validateSubscription,
            isCacheOnly: true,
            associatedSubscriptionsChain
          });

          subscription.lastArgs.push(funcSubscriptions.lastSelected);
          subscription.funcs.push(funcSubscriptions.selectFunc);
        }
      });

      subscription.selectFunc = (state) => {
        if (subscription.lastStateVersion === storeHandle.stateVersion) {
          return subscription.lastSelected;
        } return subscription.funcs.reduce(
          (args, selectFunc, index, arr) => {
            if (index < arr.length - 1) {
              args.push(selectFunc(state));
              return args;
            } else if (!subscription.memoOnArgs) {
              subscription.prevSelected = subscription.lastSelected;
              subscription.lastSelected = selectFunc(...args);
            } else if (args.some((arg, i) => arg !== subscription.lastArgs[i])) {
              subscription.prevSelected = subscription.lastSelected;
              subscription.lastSelected = selectFunc(...args);
              subscription.lastArgs = args;
            }
            subscription.lastStateVersion = storeHandle.stateVersion;
            return subscription.lastSelected;
          }, []);
      }
    } else {
      const [selectFunc] = selectorHandle.funcs;
      subscription.lastSelected = selectFunc(storeHandle.state, subscription.arg);
      subscription.lastStateVersion = storeHandle.stateVersion;
      subscription.funcs.push((state) => selectFunc(state, subscription.arg));
      subscription.selectFunc = (state) => {
        if (subscription.lastStateVersion !== storeHandle.stateVersion) {
          subscription.prevSelected = subscription.lastSelected;
          subscription.lastSelected = subscription.funcs[0](state);
        }
        subscription.lastStateVersion = storeHandle.stateVersion;
        return subscription.lastSelected;
      };
    }

    if (!isCacheOnly) triggers.set(hookHandle.id, hookHandle);
    else holders.set(hookHandle.id, hookHandle);

    storeHandle.subscriptionsMatrix.set(subscription.id, subscription);
    return subscription;
  };

  const addToSubscription = ({
    hookHandle,
    subscription,
    isCacheOnly,
    associatedSubscriptionsChain
  }) => {
    if (isCacheOnly)
      subscription.holders.set(hookHandle.id, hookHandle);
    else
      subscription.triggers.set(hookHandle.id, hookHandle);

    subscription.associatedSubscriptions.forEach(
      (associatedSubscription) => associatedSubscription.holders.set(hookHandle.id, hookHandle)
    );

    associatedSubscriptionsChain?.forEach(
      (associatedSubscriptionsChainLink) => {
        associatedSubscriptionsChainLink.set(subscription.id, subscription);
        subscription.associatedSubscriptions.forEach(
          (associatedSubscription) => associatedSubscriptionsChainLink.set(associatedSubscription.id, associatedSubscription)
        );
      }
    );
    return subscription;
  };

  const ensureSubscriptionAvailability = ({
    selectorId,
    selectorStoreName,
    subscriptionId,
    paramsId,
    params,
    storeName,
    hookHandle,
    validateSubscription,
    isCacheOnly = false,
    associatedSubscriptionsChain,
  }) => {
    const storeHandle = stores[storeName];
    const { subscriptionsMatrix } = storeHandle;
    const selectorHandle = selectors[selectorId] || {
      selectorId, funcs: [(state) => state]
    };

    let subscription = subscriptionsMatrix.get(subscriptionId);
    if (!subscription) {
      validateSubscription({ storeName, selectorStoreName, selectorId });
      // Change value of store status only on top level of the recursive chain call.
      const isRecursiveCall = !!associatedSubscriptionsChain;
      const lastStatus = storeHandle.status;
      if (!isRecursiveCall) storeHandle.status = STATUS.SELECTING;
      subscription = createSubscriptionHandle({
        isCacheOnly,
        storeHandle,
        selectorHandle,
        hookHandle,
        params,
        subscriptionId,
        paramsId,
        associatedSubscriptionsChain,
        validateSubscription,
      });
      if (!isRecursiveCall) storeHandle.status = lastStatus;
      return subscription;
    } else return addToSubscription({
      hookHandle,
      subscription,
      isCacheOnly,
      associatedSubscriptionsChain
    });
  };

  const createHookUnsubscriber = ({ storeHandle, hookHandle, isCacheOnly }) =>
    () => {
      const { triggersStack, subscriptionsMatrix } = storeHandle;
      const { id, subscription } = hookHandle;
      subscription.associatedSubscriptions.forEach(
        (associatedSubscription) => {
          associatedSubscription.holders.delete(id);
          if (associatedSubscription.triggers.size || associatedSubscription.holders.size) return;
          subscriptionsMatrix.delete(associatedSubscription.id);
        }
      );

      if (!isCacheOnly) {
        triggersStack.delete(id);
        subscription.triggers.delete(id);
      } else subscription.holders.delete(id);

      if (subscription.keepMemo || subscription.triggers.size || subscription.holders.size) return;
      subscriptionsMatrix.delete(subscription.id);
    };

  const createHookResubscriber = ({
    storeHandle,
    hookHandle,
    lastSubscription,
    isCacheOnly,
  }) => () => {
    const { subscriptionsMatrix } = storeHandle;
    const {
      id,
      subscriptionId,
      subscription: { associatedSubscriptions }
    } = hookHandle;

    lastSubscription.associatedSubscriptions.forEach(
      (subscription) => {
        if (
          subscription.id === subscriptionId ||
          associatedSubscriptions.has(subscription.id)
        ) return;
        subscription.holders.delete(id);

        if (subscription.keepMemo || subscription.triggers.size || subscription.holders.size) return;
        subscriptionsMatrix.delete(subscription.id);
      });

    if (!isCacheOnly)
      lastSubscription.triggers.delete(id);
    else
      lastSubscription.holders.delete(id);

    if (lastSubscription.keepMemo || lastSubscription.triggers.size || lastSubscription.holders.size) return;
    subscriptionsMatrix.delete(lastSubscription.id);
  };

  const createHookSubscription = ({
    storeName,
    selectorStoreName,
    selectorId,
    params,
    isCacheOnly = false,
    validateSubscription = () => { },
  }) => {
    const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });

    const hookHandle = {
      id: Symbol(),
      selectorId,
      subscriptionId,
      paramsId,
      subscription: null,
      requiresRender: false,
      value: null,
      setSelected: null,
      unsubscribe: null,
    };

    const subscription = ensureSubscriptionAvailability({
      selectorId,
      selectorStoreName,
      subscriptionId,
      paramsId,
      params,
      storeName,
      hookHandle,
      validateSubscription,
      isCacheOnly,
    });

    const storeHandle = stores[storeName];
    hookHandle.subscription = subscription;
    hookHandle.unsubscribe = createHookUnsubscriber({ storeHandle, hookHandle, isCacheOnly });
    !isCacheOnly && stackHookHandle({ storeHandle, hookHandle });

    return hookHandle;
  };

  const recreateHookSubscription = ({
    storeName,
    selectorStoreName,
    selectorId,
    params,
    hookHandle,
    isCacheOnly = false,
    validateSubscription = () => { },
  }) => {
    const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
    // should not really happen unless useEffect was triggered by change of params producing same paramsId, 
    // I guess throw error for now cause if it would happen on every rerender for multiple useSelector subscriptions
    // keep serializing params into paramsId would probably have significant performance hit
    if (hookHandle.paramsId === paramsId)
      throw new Error(`Params have changed but paramsId: haven't. Are all selector params serializable? ${paramsId}.`);
    else {
      hookHandle.subscriptionId = subscriptionId;
      hookHandle.paramsId = paramsId;
    }

    const { subscription: lastSubscription } = hookHandle;
    const storeHandle = stores[storeName];

    const subscription = ensureSubscriptionAvailability({
      selectorId,
      selectorStoreName,
      subscriptionId,
      paramsId,
      params,
      storeName,
      hookHandle,
      validateSubscription,
      isCacheOnly,
    });

    hookHandle.subscription = subscription;
    hookHandle.unsubscribe = createHookUnsubscriber({ storeHandle, hookHandle });
    const unsubscribeLast = createHookResubscriber({ storeHandle, hookHandle, lastSubscription });
    unsubscribeLast();
    return hookHandle;
  };

  return {
    createHookSubscription,
    recreateHookSubscription,
    createMemoSubscription: ({
      storeName,
      selectorStoreName,
      selectorId,
      params
    }) => createHookSubscription({
      storeName,
      selectorStoreName,
      selectorId,
      params,
      isCacheOnly: true
    })
  };
};