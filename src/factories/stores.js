import { useState, useEffect } from 'react';
import { DEFAULT_STORE } from '../constants/store';
import { getStoreValidator } from './stores.validator';

export const getStoresFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => ({
  createStore: ({
    name = DEFAULT_STORE,
    storeSlices = {},
    storeSelectors = {},
  }) => {
    // Normalize store creations arguments
    if (storeSlices && typeof storeSlices === "object")
      storeSlices = Object.values(storeSlices);
    if (storeSelectors && typeof storeSelectors === "object")
      storeSelectors = Object.values(storeSelectors);

    // Create validators
    const { validateStore, validateUseSelector } = getStoreValidator({
      stores,
      slices,
      actions,
      actionsByType,
      actionsImports,
      selectors,
      selectorsImports,
    });
    // Validate store creation
    validateStore({ storeName: name, storeSlices, storeSelectors });

    // Create store functions
    const getState = (sliceName = null) =>
      sliceName ? stores[name].state[sliceName] : stores[name].state;
    const getActions = (sliceName = null) =>
      sliceName ? stores[name].actions[sliceName] : stores[name].actions;
    const getSelectors = (sliceName = null) =>
      sliceName ? stores[name].selectors[sliceName] : stores[name].selectors;

    const renderTriggers = new Map();
    const subscriptions = new Map();
    const subscriptionsById = new Map();
    const dispatch = action => {
      const reducer = stores[name].reducers[action.sliceName][action.type];
      if (!reducer || action instanceof Promise) return;

      const newSliceState = { ...stores[name].state[action.sliceName] };
      reducer(newSliceState, action);
      const newState = {
        ...stores[name].state,
        [action.sliceName]: newSliceState,
      };
      stores[name].state = newState;
      subscriptions.forEach(({ onStateChange }) => onStateChange(newState));
      renderTriggers.forEach(renderTrigger => {
        const { requiresRender, value, invoke } = renderTrigger;
        if (!requiresRender) return;
        renderTrigger.value = null;
        invoke(value);
      });
    };

    const useStoreState = () => {
      let setState;
      [stores[name].state, setState] = useState(stores[name].state);
      useEffect(() => {
        const key = Symbol();
        const renderTrigger = {
          key,
          requiresRender: false,
          value: null,
          invoke: newState => setState(newState),
        };
        const subscription = {
          key,
          onStateChange: newState => {
            renderTrigger.requiresRender = true;
            renderTrigger.value = newState
          },
        };
        renderTriggers.set(renderTrigger.key, renderTrigger);
        subscriptions.set(subscription.key, subscription);
        return () => {
          subscriptions.delete(subscription.key);
          renderTriggers.delete(renderTrigger.key);
        };
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return stores[name].state;
    };

    const useSelector = (selector = state => state) => {
      const [selected, setSelected] = useState(() => {
        if (!selector.__hasInitialSelected) {
          selector.__lastSelected = selector(stores[name].state);
          selector.__hasInitialSelected = true;
        }
        return selector.__lastSelected;
      });

      useEffect(() => {
        const selectorId = selector.__selectorId;
        const renderTrigger = {
          key: Symbol(),
          requiresRender: false,
          value: null,
          invoke: newSelected => setSelected(newSelected),
        };

        let subscription = subscriptionsById.get(selectorId);
        if (!subscription) {
          validateUseSelector({ storeName: name, selector });
          subscription = {
            selectorId,
            key: Symbol(),
            triggers: new Map(),
            lastSelected: selected
          };

          const onSelectedChange = newSelected =>
            subscription.triggers.forEach((trigger) => {
              trigger.requiresRender = true;
              trigger.value = newSelected;
            });
          const onStateChange = newState => {
            const newSelected = selector(newState);
            if (selector.__lastSelected === newSelected) return;
            selector.__lastSelected = newSelected;
            onSelectedChange(newSelected);
          };

          subscription.onSelectedChange = onSelectedChange;
          subscription.onStateChange = onStateChange;
          subscriptions.set(subscription.key, subscription);
          subscriptionsById.set(selectorId, subscription);
        }

        renderTriggers.set(renderTrigger.key, renderTrigger);
        subscription.triggers.set(renderTrigger.key, renderTrigger);

        return () => {
          renderTriggers.delete(renderTrigger.key);
          subscription.triggers.delete(renderTrigger.key);
          if (subscription.triggers.size > 0) return;
          subscriptions.delete(subscription.key);
          subscriptionsById.delete(subscription.selectorId);
        };
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return selected;
    };

    // Assign validated store imports
    const storeActionImports = actionsImports[name] || {};
    Object.keys(storeActionImports).forEach(
      (sliceName) => Object.keys(storeActionImports[sliceName]).forEach(
        (actionName) => storeActionImports[sliceName][actionName].forEach(assignImport => assignImport())
      )
    );
    const storeSelectorImports = selectorsImports[name] || {};
    Object.keys(storeSelectorImports).forEach(
      (sliceName) => Object.keys(storeSelectorImports[sliceName]).forEach(
        (selectorName) => storeSelectorImports[sliceName][selectorName].forEach(assignImport => assignImport())
      )
    );

    // Create and freeze store
    stores[name].renderTriggers = renderTriggers;
    stores[name].subscriptions = subscriptions;
    stores[name].subscriptionsById = subscriptionsById;
    stores[name].dispatch = dispatch;
    stores[name].useStoreState = useStoreState;
    stores[name].useSelector = useSelector;
    stores[name].getState = getState;
    stores[name].getActions = getActions;
    stores[name].getSelectors = getSelectors;
    stores[name].initialized = true;
    Object.freeze(stores[name].reducers);
    Object.keys(stores[name].selectors).forEach(sliceName =>
      Object.freeze(stores[name].selectors[sliceName]),
    );
    Object.keys(stores[name].actions).forEach(sliceName =>
      Object.freeze(stores[name].actions[sliceName]),
    );
    Object.freeze(stores[name].actions);

    const getStorePropName = propName =>
      name !== DEFAULT_STORE
        ? `${propName.slice(0, 3)}${name[0].toUpperCase()}${name.slice(1)}${propName.slice(3)}`
        : propName;

    return Object.freeze({
      [getStorePropName('useStoreState')]: useStoreState,
      [getStorePropName('useSelector')]: useSelector,
      [getStorePropName('getState')]: getState,
      [getStorePropName('getActions')]: getActions,
      [getStorePropName('getSelectors')]: getSelectors,
    });
  },
});