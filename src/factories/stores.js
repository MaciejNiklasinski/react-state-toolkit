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

    // Validate store creation
    const { validateStore } = getStoreValidator({
      stores,
      slices,
      actions,
      actionsByType,
      actionsImports,
      selectors,
      selectorsImports,
    });
    validateStore({ storeName: name, storeSlices, storeSelectors });

    // Create store functions
    const getState = (sliceName = null) =>
      sliceName ? stores[name].state[sliceName] : stores[name].state;
    const getActions = (sliceName = null) =>
      sliceName ? stores[name].actions[sliceName] : stores[name].actions;
    const getSelectors = (sliceName = null) =>
      sliceName ? stores[name].selectors[sliceName] : stores[name].selectors;

    const subscriptions = new Map();
    const subscriptionsSelected = new Map();
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
      subscriptions.forEach(subscription => subscription(newState));
    };

    const useStoreState = () => {
      let subscriptionDispatch;
      [stores[name].state, subscriptionDispatch] = useState(stores[name].state);
      useEffect(() => {
        const key = Symbol();
        subscriptions.set(key, subscriptionDispatch);
        return () => subscriptions.delete(key);
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return stores[name].state;
    };

    const useSelector = (selector = state => state) => {
      const [selected, selectorDispatch] = useState(selector(stores[name].state));

      useEffect(() => {
        const key = Symbol();

        subscriptions.set(key, newState => {
          const lastSelected = subscriptionsSelected.get(key);
          const newSelected = selector(newState);
          if (lastSelected === newSelected) return;
          subscriptionsSelected.set(key, newSelected);
          selectorDispatch(newSelected);
        });

        subscriptionsSelected.set(key, selected);

        return () => {
          subscriptions.delete(key);
          subscriptionsSelected.delete(key);
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
    stores[name].subscriptions = subscriptions;
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