import { DEFAULT_STORE, DEFAULT_SLICE } from '../constants/store';
import { UnableToInvokeUninitializedStoreSelector } from '../errors/UnableToInvokeUninitializedStoreSelector';
import { getSelectorId } from './ids';
import { getSelectorValidator } from './selectors.validator';

export const getSelectorsFactory = ({
  stores,
  slices,
  actions,
  actionsByType,
  actionsImports,
  selectors,
  selectorsImports,
}) => ({
  createSelector: ({
    storeName = DEFAULT_STORE,
    sliceName = DEFAULT_SLICE,
    name,
    funcs = [],
    memoOnArgs = false,
  }) => {
    let suffixedName = name;
    if (name && (typeof name !== "string" || !name.endsWith("Selector")))
      suffixedName = `${name}Selector`;
    const { validateSelector } = getSelectorValidator({
      stores,
      slices,
      actions,
      actionsByType,
      actionsImports,
      selectors,
      selectorsImports,
    });
    validateSelector({
      storeName,
      sliceName,
      selectorName: suffixedName,
      funcs,
      memoOnArgs,
    });

    if (!stores[storeName]) stores[storeName] = {};
    if (!stores[storeName].selectors) stores[storeName].selectors = {};
    if (!stores[storeName].selectors[sliceName])
      stores[storeName].selectors[sliceName] = {};

    let lastArgs = [];
    let lastResult;
    funcs = [...funcs];

    const storeArg = Object.freeze({
      getSelectors: () => stores[storeName].getSelectors()
    });

    // selector func
    // function taking state and returning selected value
    const func = funcs.length === 1
      ? state => funcs[0](state, storeArg)
      : state => funcs.reduce(
        (args, selectFunc, index) => {
          if (index < funcs.length - 1) {
            args.push(selectFunc(state, storeArg));
            return args;
          } else if (!memoOnArgs) {
            return selectFunc(...args, storeArg);
          } else if (args.some((arg, i) => arg !== lastArgs[i])) {
            lastResult = selectFunc(...args, storeArg);
            lastArgs = args;
          }
          return lastResult;
        }, []);

    const selectorId = getSelectorId({
      storeName,
      sliceName,
      selectorName: suffixedName,
    });
    func.__storeName = storeName;
    func.__selectorId = selectorId;
    stores[storeName].selectors[sliceName][suffixedName] = func;
    
    let safeFunc;
    const funcWrapper = (state) => {
      if (safeFunc) return safeFunc(state);
      else if (!stores[storeName].initialized)
        throw new UnableToInvokeUninitializedStoreSelector({ selectorId });
      safeFunc = func;
      return safeFunc(state);
    };
    funcWrapper.__storeName = storeName;
    funcWrapper.__selectorId = selectorId;
    funcWrapper.__shouldReselect = func.__shouldReselect;

    selectors[selectorId] = {
      storeName,
      sliceName,
      selectorName: suffixedName,
      [suffixedName]: funcWrapper,
    };
    return Object.freeze({ ...selectors[selectorId] });
  },
});
