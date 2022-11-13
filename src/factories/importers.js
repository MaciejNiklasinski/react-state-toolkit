import { DEFAULT_STORE, DEFAULT_SLICE } from '../constants/store';
import { UnableToInvokeUninitializedStoreAction } from '../errors/UnableToInvokeUninitializedStoreAction';
import { UnableToInvokeUninitializedStoreSelector } from '../errors/UnableToInvokeSelector';
import { insertCapitalized, suffixIfRequired } from '../utils/strings';
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
      actionName = suffixIfRequired(actionName, "Action");
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
      selectorName = suffixIfRequired(selectorName, "Selector");
      validateImportSelector({ storeName, sliceName, selectorName });

      if (!selectorsImports[storeName][sliceName])
        selectorsImports[storeName][sliceName] = {};

      const sliceId = getSliceId({ storeName, sliceName });
      const selectorId = getSelectorId({ storeName, sliceName, selectorName });

      if (stores[storeName]?.initialized) {
        const selectorHandle = selectors[selectorId];
        return Object.freeze({
          storeName,
          sliceName,
          selectorName,
          [selectorName]: selectorHandle[selectorName],
          clearCache: selectorHandle.clearCache,
          isReady: () => true,
        });
      } else {
        let selectorFunc = () => { throw new UnableToInvokeUninitializedStoreSelector({ selectorId }); }
        let clearCacheWrapper = (...params) => { };
        let selectorFuncWrapper = (param) => selectorFunc(param);
        selectorFuncWrapper.__storeName = storeName;
        selectorFuncWrapper.__selectorId = selectorId;
        selectorFuncWrapper.__isImportWrapper = true;

        let isReady = false;
        const importSelectorFunc = () => {
          const selectorHandle = selectors[selectorId];
          selectorFunc = selectorHandle[selectorName];
          clearCacheWrapper = selectorHandle.clearCache;
          isReady = true;
        };
        if (!selectorsImports[storeName][sliceName][selectorName])
          selectorsImports[storeName][sliceName][selectorName] = [importSelectorFunc];
        else
          selectorsImports[storeName][sliceName][selectorName].push(importSelectorFunc);

        return Object.freeze({
          storeName,
          sliceName,
          selectorName,
          [selectorName]: selectorFuncWrapper,
          clearCache: clearCacheWrapper,
          isReady: () => isReady,
        });
      }
    };
    let importerExport = {
      importAction,
      importSelector,
    };
    if (storeName !== DEFAULT_STORE)
      importerExport = {
        ...importerExport,
        [insertCapitalized('importAction', 6, storeName)]: importAction,
        [insertCapitalized('importSelector', 6, storeName)]: importSelector,
      }
    return Object.freeze(importerExport);
  },
});
