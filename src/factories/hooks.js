import { useEffect, useMemo, useRef, useState } from "react";
import { getHooksValidator } from "./hooks.validator";
import { getSubscriptionsFactory } from "./subscriptions";

export const getHooksFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  const {
    validateUseSelector,
    validateUseSelectorMemo
  } = getHooksValidator({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });

  const {
    createHookSubscription,
    recreateHookSubscription
  } = getSubscriptionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });

  const useMount = (onMount = () => { }) =>
    useEffect(() => onMount(), []);

  const useUnmount = (onUnmount = () => { }) =>
    useMount(() => () => onUnmount());

  const useSingleUnmountInStrictMode = (onUnmount = () => { }) => {
    const ref = useRef(false);
    useMount(() => () => {
      if (!ref.current)
        ref.current = true;
      else onUnmount();
    });
  };

  const useSingleEffectInStrictMode = (onEffect = () => { }, dependencies) => {
    const ref = useRef();
    useEffect(() => {
      if (ref.current === dependencies) return;
      ref.current = dependencies;
      return onEffect();
    }, dependencies);
  };

  const useObj = (factory = () => ({})) => {
    const ref = useRef();
    if (!ref.current)
      ref.current = factory();
    return ref.current;
  };

  const useSymbol = () => {
    const ref = useRef();
    if (!ref.current)
      ref.current = Symbol();
    return ref.current;
  };

  const useFirstRender = (factory = () => ({})) => {
    const ref = useRef();
    let isFirstRender = false;
    if (!ref.current) {
      isFirstRender = true;
      ref.current = { result: factory() };
    }
    return [ref.current.result, isFirstRender];
  };

  const usePrev = (value) => {
    const ref = useRef();
    useEffect(() => (ref.current = value), [value]);
    return ref.current;
  };

  const usePrevState = (initialState) => {
    const [state, setState] = useState(initialState);
    const prevState = usePrev(state);
    return useMemo(
      () => [prevState, state, setState],
      [prevState, state, setState]
    );
  };

  const getUseStoreState = ({ storeName, isStrictDevMode }) => isStrictDevMode ? () => {
    // This should create initial subscription
    const [hookHandle] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: storeName,
        selectorStoreName: storeName,
        params: []
      })
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));

    // This should handle unsubscribe when unmounting component
    useSingleUnmountInStrictMode(hookHandle.unsubscribe);
    return selected;
  } : () => {
    // This should create initial subscription
    const [hookHandle] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: storeName,
        selectorStoreName: storeName,
        params: []
      })
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));

    // This should handle unsubscribe when unmounting component
    useUnmount(hookHandle.unsubscribe);
    return selected;
  };

  const getUseSelector = ({ storeName, isStrictDevMode }) => isStrictDevMode ? (selector, ...params) => {
    // This should create initial subscription
    const [hookHandle, isFirstRender] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      })
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));

    // This should handle changing subscription should for new params
    useSingleEffectInStrictMode(() => {
      if (isFirstRender) return;
      recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        validateSubscription: validateUseSelector,
      });
      hookHandle.setSelected(hookHandle.subscription.lastSelected);
    }, params);

    // This should handle unsubscribe when unmounting component
    useSingleUnmountInStrictMode(hookHandle.unsubscribe);
    return selected;
  } : (selector, ...params) => {
    // This should create initial subscription
    const [hookHandle, isFirstRender] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      })
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));

    // This should handle changing subscription should for new params
    useEffect(() => {
      if (isFirstRender) return;
      recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        validateSubscription: validateUseSelector,
      });
      hookHandle.setSelected(hookHandle.subscription.lastSelected);
    }, params);

    // This should handle unsubscribe when unmounting component
    useUnmount(hookHandle.unsubscribe);
    return selected;
  };

  const getUseSelectorMemo = ({ storeName, isStrictDevMode }) => isStrictDevMode ? (selector, ...params) => {
    // This should create initial subscription
    const [hookHandle, isFirstRender] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      })
    );

    // This should handle changing subscription should for new params
    useSingleEffectInStrictMode(() => {
      if (isFirstRender) return;
      recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      });
    }, params);

    // This should handle unsubscribe when unmounting component
    useSingleUnmountInStrictMode(hookHandle.unsubscribe);
  } : (selector, ...params) => {
    // This should create initial subscription
    const [hookHandle, isFirstRender] = useFirstRender(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      })
    );

    // This should handle changing subscription should for new params
    useEffect(() => {
      if (isFirstRender) return;
      recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      });
    }, params);

    // This should handle unsubscribe when unmounting component
    useUnmount(hookHandle.unsubscribe);
  };

  return {
    useMount,
    useUnmount,
    useObj,
    useSymbol,
    useFirstRender,
    usePrev,
    usePrevState,
    getUseStoreState,
    getUseSelector,
    getUseSelectorMemo,
  };
};