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

    let lastArgs;
    let lastResult;
    funcs = [...funcs];

    const storeArg = Object.freeze({
      getSelectors: () => stores[storeName].getSelectors()
    });

    // selectorFunc
    // function taking state and returning selected value
    let func;
    // If selector has been created from single selecting function
    if (funcs.length === 1) {
      // simply execute it providing state as the only function argument
      func = state => funcs[0](state, storeArg);
      // Else if selector has been created from multiple selecting functions,
      // all but last selecting functions will be treated as arguments selectors,
      // last selecting function will be treated as result selector.
      // And memoOnArgs is false
    } else if (!memoOnArgs) {
      func = state =>
        funcs.reduce((args, selectFunc, index) => {
          if (index < funcs.length - 1) {
            args.push(selectFunc(state, storeArg));
            return args;
          } else return selectFunc(...args, storeArg);
        }, []);
      // Else if  memoOnArgs is true
    } else {
      func = state => !lastArgs
        // If selector executes first time and has no lastArgs
        ? funcs.reduce((args, selectFunc, index) => {
          // If selectFunc is not last selecting function
          if (index < funcs.length - 1) {
            // use it as argument selector and execute it with state provided as the only function argument
            args.push(selectFunc(state, storeArg));
            return args;
            // Else If selectFunc is the last selecting function
          } else {
            // use it as result selector and execute it with args provided as the function arguments
            const result = selectFunc(...args, storeArg);
            // store last args and result
            lastArgs = args;
            lastResult = result;
            return result;
          }
        }, [])

        // Else if selector executes subsequent time and memoized lastArgs
        : funcs.reduce((args, selectFunc, index) => {
          // If argument selector is NOT a selector created with createSelector() function
          if (!selectFunc.__shouldReselect && index < funcs.length - 1) {
            // simply execute it with state provided as the only function argument
            args.push(selectFunc(state, storeArg));
            return args;
            // Else if argument selector has been created with createSelector() function
          } else if (index < funcs.length - 1) {
            // use its private __shouldReselect function to check whether memoized arg can be used
            const { reselect, args: subArgs } = selectFunc.__shouldReselect(state);
            // reselect arg only if reselect flag indicates its required, else use memoized arg
            args.push(reselect ? selectFunc(...subArgs, storeArg) : args.push(lastArgs[index]));
            return args;
            // Only if at least one of arguments selectors results changed, recalculate result selector output.
          } else if (args.find((arg, i) => arg !== lastArgs[i])) {
            // Result selector function will executed with combined results of arguments selectors
            lastResult = selectFunc(...args, storeArg);
            lastArgs = args;
          }
          // Return either memoized or reselected result of last selecting function
          return lastResult;
        }, []);

      // func.__shouldReselect
      // function taking state and returning object {reselect: bool, args: Array}
      // where reselect is a boolean flag indicating whether memoized lastResult can be used
      // instead of recalculating it by executing selector last selecting function
      func.__shouldReselect = state =>
        funcs.reduce(
          ({ reselect, args }, selectFunc, index) => {
            if (index === funcs.length - 1) return { reselect, args };

            let newArg;
            // If argument selector is NOT a selector created with createSelector() function
            // simply execute it with state provided as the only function argument
            if (!selectFunc.__shouldReselect)
              newArg = selectFunc(state, storeArg);
            // Else if argument selector has been created with createSelector() function
            else {
              // use its private __shouldReselect function to check whether memoized arg can be used
              const { reselect: subReselect, args: subArgs } = selectFunc.__shouldReselect(state);
              // reselect newArg only if subReselect flag indicates its required, else use memoized arg
              newArg = subReselect ? selectFunc(...subArgs, storeArg) : lastArgs[index];
            }
            args.push(newArg);

            if (!reselect && newArg !== lastArgs[index]) reselect = true;
            return { reselect, args };
          },
          { reselect: false, args: [] },
        );
    }

    const selectorId = getSelectorId({
      storeName,
      sliceName,
      selectorName: suffixedName,
    });
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
    funcWrapper.__selectorId = selectorId;
    funcWrapper.__shouldReselect = func.__shouldReselect;

    selectors[selectorId] = Object.freeze({
      storeName,
      sliceName,
      selectorName: suffixedName,
      [suffixedName]: funcWrapper,
    });
    return selectors[selectorId];
  },
});
