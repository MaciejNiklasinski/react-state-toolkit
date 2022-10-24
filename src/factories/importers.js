import { DEFAULT_STORE, DEFAULT_SLICE } from '../constants/store';
import { UnableToInvokeUninitializedStoreAction } from '../errors/UnableToInvokeUninitializedStoreAction';
import { UnableToInvokeUninitializedStoreSelector } from '../errors/UnableToInvokeUninitializedStoreSelector';
import { getActionId, getSelectorId, getSliceId } from './ids';
import { getImporterValidator } from './importers.validator';

export const getImportersFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => ({
  createImporter: ({ storeName = DEFAULT_STORE }) => {
    const {
      validateImporter,
      validateImportAction,
      validateImportSelector,
    } = getImporterValidator({
      stores,
      slices,
      actions,
      actionsByType,
      selectors,
    });
    validateImporter({ storeName });

    if (!actionsImports[storeName])
      actionsImports[storeName] = {};
    if (!selectorsImports[storeName])
      selectorsImports[storeName] = {};

    const importAction = (sliceName, actionName) => {
      if (actionName && typeof actionName === "string" && !actionName.endsWith("Action"))
        actionName = `${actionName}Action`;

      validateImportAction({ storeName, sliceName, actionName });

      if (!actionsImports[storeName][sliceName])
        actionsImports[storeName][sliceName] = {};

      const sliceId = getSliceId({ storeName, sliceName });
      const actionId = getActionId({ storeName, sliceName, actionName });

      if (stores[storeName]?.initialized) {
        return Object.freeze({ [actionName]: actions[actionId][actionName], isReady: () => true });
      } else {
        let actionFunc = () => { throw new UnableToInvokeUninitializedStoreAction({ actionId }); }
        let actionFuncWrapper = (param) => actionFunc(param);
        actionFuncWrapper.__isImportWrapper = true;

        let isReady = false;
        const importActionFunc = () => {
          actionFunc = actions[actionId][actionName];
          isReady = true;
        };
        if (!actionsImports[storeName][sliceName][actionName])
          actionsImports[storeName][sliceName][actionName] = [importActionFunc];
        else
          actionsImports[storeName][sliceName][actionName].push(importActionFunc);

        return Object.freeze({ [actionName]: actionFuncWrapper, isReady: () => isReady });
      }
    };

    const importSelector = (sliceName, selectorName) => {
      if (selectorName && typeof selectorName === "string" && !selectorName.endsWith("Selector"))
        selectorName = `${selectorName}Selector`;

      validateImportSelector({ storeName, sliceName, selectorName });

      if (!selectorsImports[storeName][sliceName])
        selectorsImports[storeName][sliceName] = {};

      const sliceId = getSliceId({ storeName, sliceName });
      const selectorId = getSelectorId({ storeName, sliceName, selectorName });

      if (stores[storeName]?.initialized) {
        return Object.freeze({ [selectorName]: selectors[selectorId][selectorName], isReady: () => true });
      } else {
        let selectorFunc = () => { throw new UnableToInvokeUninitializedStoreSelector({ selectorId }); }
        let selectorFuncWrapper = (param) => selectorFunc(param);
        selectorFuncWrapper.__selectorId = selectorId;
        selectorFuncWrapper.__isImportWrapper = true;

        let isReady = false;
        const importSelectorFunc = () => {
          selectorFunc = selectors[selectorId][selectorName];
          selectorFuncWrapper.__shouldReselect = selectorFunc.__shouldReselect;
          isReady = true;
        };
        if (!selectorsImports[storeName][sliceName][selectorName])
          selectorsImports[storeName][sliceName][selectorName] = [importSelectorFunc];
        else
          selectorsImports[storeName][sliceName][selectorName].push(importSelectorFunc);

        return Object.freeze({ [selectorName]: selectorFuncWrapper, isReady: () => isReady });
      }
    };

    const getStorePropName = propName =>
      storeName !== DEFAULT_STORE
        ? `${propName.slice(0, 6)}${storeName[0].toUpperCase()}${storeName.slice(1)}${propName.slice(6)}`
        : propName;

    return {
      [getStorePropName('importAction')]: importAction,
      [getStorePropName('importSelector')]: importSelector,
    };
  },
});
