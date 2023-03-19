import { useEffect, useMemo, useRef, useState } from "react";
import { getHooksValidator } from "./hooks.validator";
import { getSubscriptionsFactory } from "./subscriptions";

let prevRef;
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

  const useAsyncMount = (
    onMount = async () => { },
    onUnmount = async () => { },
  ) =>
    useMount(() => {
      onMount();
      return () => {
        onUnmount();
      };
    });

  const useAsyncUnmount = (onUnmount = async () => { }) =>
    useUnmount(() => {
      onUnmount();
    });

  const useSingleMountInStrictMode = (onMount = () => { }) => {
    const ref = useRef({ mount: false, unmount: false });
    useMount(() => {
      if (!ref.current.mount)
        ref.current.mount = true;
      else {
        ref.current.mount = false;
        ref.current.result = onMount();
      }
      return () => {
        if (!ref.current.unmount)
          ref.current.unmount = true;
        else {
          ref.current.unmount = false;
          if (typeof ref.current.result === "function")
            ref.current.result();
        }
      };
    });
  };

  const useSingleUnmountInStrictMode = (onUnmount = () => { }) => {
    const ref = useRef(false);
    useMount(() => () => {
      if (!ref.current)
        ref.current = true;
      else onUnmount();
    });
  };

  const useSingleEffectInStrictMode = (onEffect = () => { }, dependencies) => {
    const ref = useRef({ dependencies: null, unmount: false });
    useEffect(() => {
      if (ref.current.dependencies !== dependencies) {
        ref.current.dependencies = dependencies;
        ref.current.result = onEffect();
      } else {
        ref.current.unmount = false;
      }
      return () => {
        if (!ref.current.unmount)
          ref.current.unmount = true;
        else {
          ref.current.unmount = false;
          if (typeof ref.current.result === "function")
            ref.current.result();
        }
      };
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

  const useSubscription = (
    subscribe = () => ({ unsubscribe: () => { } }),
    resubscribe = () => ({ unsubscribe: () => { } }),
    dependencies = [],
  ) => {
    const ref = useRef();
    let isFirstRender = false;
    if (!ref.current) {
      isFirstRender = true;
      const handle = subscribe();
      ref.current = {
        mounted: false,
        unmounted: false,
        prevRef,
        handle,
      };
      prevRef = ref;
    }

    useEffect(() => {
      if (ref.current.unmounted) {
        const { setSelected } = ref.current.handle;
        const handle = subscribe();
        handle.setSelected = setSelected;
        ref.current = {
          mounted: false,
          unmounted: false,
          prevRef,
          handle,
        };
        prevRef = ref;
        setSelected && setSelected(handle.subscription.lastSelected);
      }
      ref.current.mounted = true;
      return () => {
        const { prevRef: ownPrefRef, handle } = ref.current;
        if (ownPrefRef?.current && !ownPrefRef.current.mounted && !ownPrefRef.current.unmounted) {
          ownPrefRef.current.handle.unsubscribe();
          ownPrefRef.current.unmounted = true;
          if (ownPrefRef === prevRef) prevRef = null;
        } else {
          ref.current.unmounted = true;
          handle.unsubscribe();
          if (ref === prevRef) prevRef = null;
        }
      };
    }, []);

    useMemo(() => !isFirstRender && resubscribe(ref.current.handle), dependencies);

    return ref.current.handle;
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

  const getUseStoreState = ({ storeName }) => () => {
    // This should create initial subscription
    const hookHandle = useSubscription(
      () => createHookSubscription({
        storeName,
        selectorId: storeName,
        selectorStoreName: storeName,
        params: []
      })
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));
    return hookHandle.subscription.lastSelected;
  };

  const getUsePrevStoreState = ({ storeName }) => () => {
    // This should create initial subscription
    const hookHandle = useSubscription(
      () => createHookSubscription({
        storeName,
        selectorId: storeName,
        selectorStoreName: storeName,
        params: []
      })
    );

    let prevSelected, selected;
    ([prevSelected, selected, hookHandle.setSelected] = usePrevState(hookHandle.subscription.lastSelected));
    return [prevSelected, selected];
  };

  const getUseSelector = ({ storeName }) => (selector, ...params) => {
    // This should create initial subscription
    const hookHandle = useSubscription(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      }),
      (hookHandle) => recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        validateSubscription: validateUseSelector,
      }),
      params
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));
    return hookHandle.subscription.lastSelected;
  };

  const getUsePrevSelector = ({ storeName }) => (selector, ...params) => {
    // This should create initial subscription
    const hookHandle = useSubscription(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      }),
      (hookHandle) => recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        validateSubscription: validateUseSelector,
      }),
      params
    );

    let selected;
    ([selected, hookHandle.setSelected] = useState(hookHandle.subscription.lastSelected));
    return [hookHandle.subscription.prevSelected, hookHandle.subscription.lastSelected];
  };

  const getUseSelectorMemo = ({ storeName }) => (selector, ...params) => {
    // This should create initial subscription
    const hookHandle = useSubscription(
      () => createHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      }),
      (hookHandle) => recreateHookSubscription({
        storeName,
        selectorId: selector.__selectorId,
        selectorStoreName: selector.__storeName,
        params,
        hookHandle,
        isCacheOnly: true,
        validateSubscription: validateUseSelectorMemo
      }),
      params
    );
  };

  return {
    useMount,
    useUnmount,
    useAsyncMount,
    useAsyncUnmount,
    useSingleMountInStrictMode,
    useSingleUnmountInStrictMode,
    useSingleEffectInStrictMode,
    useObj,
    useSymbol,
    useSubscription,
    usePrev,
    usePrevState,
    getUseStoreState,
    getUsePrevStoreState,
    getUseSelector,
    getUsePrevSelector,
    getUseSelectorMemo,
  };
};