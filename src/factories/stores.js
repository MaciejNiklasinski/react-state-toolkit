import { createElement } from 'react';
import { DEFAULT_STORE, STATUS } from '../constants/store';
import { getStoreValidator } from './stores.validator';
import { getHooksFactory } from './hooks';
import { insertCapitalized } from '../utils/strings';

export const getStoresFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => {
  return {
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
      const { validateStore } = getStoreValidator({
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

      const {
        getUseStoreState,
        getUsePrevStoreState,
        getUseSelector,
        getUsePrevSelector,
        getUseSelectorMemo
      } = getHooksFactory({
        stores,
        slices,
        actions,
        actionsByType,
        actionsImports,
        selectors,
        selectorsImports,
      });

      // Store state subscriptions
      const triggersStack = new Map();
      const subscriptionsMatrix = new Map();

      // Create store functions
      const dispatch = action => {
        const reducer = stores[name].reducers[action.sliceName][action.type];
        if (!reducer || action instanceof Promise) return;

        stores[name].status = STATUS.REDUCING;
        const newSliceState = { ...stores[name].state[action.sliceName] };
        try { reducer(newSliceState, action); }
        catch (error) {
          stores[name].status = STATUS.READY;
          throw error;
        }
        const newState = Object.freeze({
          ...stores[name].state,
          [action.sliceName]: Object.freeze(newSliceState),
        });
        stores[name].state = newState;
        stores[name].stateVersion = Symbol();

        stores[name].status = STATUS.SELECTING;
        subscriptionsMatrix.forEach(({ onStateChange }) => onStateChange(newState));

        stores[name].status = STATUS.RENDERING;
        triggersStack.forEach(renderTrigger => {
          const { requiresRender, value, setSelected } = renderTrigger;
          if (!requiresRender) return;
          renderTrigger.requiresRender = false;
          renderTrigger.value = null;
          setSelected(value);
        });
        stores[name].status = STATUS.READY;
      };

      const useStoreState = getUseStoreState({ storeName: name });
      const usePrevStoreState = getUsePrevStoreState({ storeName: name });
      const useSelector = getUseSelector({ storeName: name });
      const usePrevSelector = getUsePrevSelector({ storeName: name });
      const useSelectorMemo = getUseSelectorMemo({ storeName: name });

      const getState = (sliceName = null) =>
        sliceName ? stores[name].state[sliceName] : stores[name].state;
      const getActions = (sliceName = null) =>
        sliceName ? stores[name].actions[sliceName] : stores[name].actions;
      const getSelectors = (sliceName = null) =>
        sliceName ? stores[name].selectors[sliceName] : stores[name].selectors;
      const getHooks = () => ({ useStoreState, useSelector, useSelectorMemo });
      const withStore = Component => props =>
        createElement(Component, { ...{ ...props, getActions, getSelectors, getHooks } }, null);

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
      stores[name].triggersStack = triggersStack;
      stores[name].subscriptionsMatrix = subscriptionsMatrix;
      stores[name].dispatch = dispatch;
      stores[name].withStore = withStore;
      stores[name].useStoreState = useStoreState;
      stores[name].usePrevStoreState = usePrevStoreState;
      stores[name].useSelector = useSelector;
      stores[name].usePrevSelector = usePrevSelector;
      stores[name].getState = getState;
      stores[name].getActions = getActions;
      stores[name].getSelectors = getSelectors;
      stores[name].getHooks = getHooks;
      stores[name].name = name;
      stores[name].stateVersion = Symbol();
      stores[name].status = STATUS.READY;
      stores[name].initialized = true;

      Object.freeze(stores[name].reducers);
      Object.freeze(stores[name].selectors);
      Object.keys(stores[name].actions).forEach(sliceName =>
        Object.freeze(stores[name].actions[sliceName]),
      );
      Object.freeze(stores[name].actions);

      let storeExport = {
        withStore,
        useStoreState,
        usePrevStoreState,
        useSelector,
        usePrevSelector,
        useSelectorMemo,
        getState,
        getActions,
        getSelectors,
        getHooks,
      };
      if (name !== DEFAULT_STORE)
        storeExport = {
          ...storeExport,
          [insertCapitalized('withStore', 4, name)]: withStore,
          [insertCapitalized('useStoreState', 3, name)]: useStoreState,
          [insertCapitalized('usePrevStoreState', 3, name)]: usePrevStoreState,
          [insertCapitalized('useSelector', 3, name)]: useSelector,
          [insertCapitalized('usePrevSelector', 3, name)]: usePrevSelector,
          [insertCapitalized('useSelectorMemo', 3, name)]: useSelectorMemo,
          [insertCapitalized('getState', 3, name)]: getState,
          [insertCapitalized('getActions', 3, name)]: getActions,
          [insertCapitalized('getSelectors', 3, name)]: getSelectors,
          [insertCapitalized('getHooks', 3, name)]: getHooks,
        };
      return Object.freeze(storeExport);
    },
  };
};