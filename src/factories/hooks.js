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
    useEffect(() => { ref.current = value; }, [value]);
    return ref.current;
  };

  const usePrevState = (initialState) => {
    const [{ lastState, state }, setState] = useState({ state: initialState });
    return [lastState, state, (newState) => setState({ lastState: state, state: newState })];
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

    // This should handle changing subscription for new params
    useMemo(() => !isFirstRender && recreateHookSubscription({
      storeName,
      selectorId: selector.__selectorId,
      selectorStoreName: selector.__storeName,
      params,
      hookHandle,
      validateSubscription: validateUseSelector,
    }), params);

    // This should handle unsubscribe when unmounting component
    useSingleUnmountInStrictMode(hookHandle.unsubscribe);

    // Return subscription lastSelected which might be different to useState selected
    // if subscription has been recreated on params change 
    return hookHandle.subscription.lastSelected;
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

    // This should handle changing subscription for new params
    useMemo(() => !isFirstRender && recreateHookSubscription({
      storeName,
      selectorId: selector.__selectorId,
      selectorStoreName: selector.__storeName,
      params,
      hookHandle,
      validateSubscription: validateUseSelector,
    }), params);

    // This should handle unsubscribe when unmounting component
    useUnmount(hookHandle.unsubscribe);

    // Return subscription lastSelected which might be different to useState selected
    // if subscription has been recreated on params change 
    return hookHandle.subscription.lastSelected;
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

    // This should handle changing subscription for new params
    useMemo(() => !isFirstRender && recreateHookSubscription({
      storeName,
      selectorId: selector.__selectorId,
      selectorStoreName: selector.__storeName,
      params,
      hookHandle,
      isCacheOnly: true,
      validateSubscription: validateUseSelectorMemo
    }), params);

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

    // This should handle changing subscription for new params
    useMemo(() => !isFirstRender && recreateHookSubscription({
      storeName,
      selectorId: selector.__selectorId,
      selectorStoreName: selector.__storeName,
      params,
      hookHandle,
      isCacheOnly: true,
      validateSubscription: validateUseSelectorMemo
    }), params);

    // This should handle unsubscribe when unmounting component
    useUnmount(hookHandle.unsubscribe);
  };

  return {
    useMount,
    useUnmount,
    useSingleUnmountInStrictMode,
    useSingleEffectInStrictMode,
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