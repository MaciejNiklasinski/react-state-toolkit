import { render } from '@testing-library/react'
import { DEFAULT_STORE, DEFAULT_SLICE } from "../constants/store";
import {
  // Store
  UnableToCreateInvalidNameStore,
  UnableToCreateInitializedStore,
  // Store Slices
  UnableToCreateForeignSliceStore,
  UnableToCreateUnknownSliceStore,
  UnableToCreateMissingSliceStore,
  UnableToCreateEmptyStore,
  // Store Selectors
  UnableToCreateUnknownSelectorStore,
  UnableToCreateForeignStoreSelectorStore,
  UnableToCreateSliceSelectorStore,
  UnableToCreateSliceRegisteredSelectorStore,
  UnableToCreateImportWrapperSelectorStore,
  UnableToCreateMissingSelectorStore,
  UnableToCreateCircularSelectorStore,
  UnableToCreatePartialKeepMemoSelectorStore,
  UnableToCreateParameterlessToParameterizedSelectorStore,
  UnableToCreateNoParamsMapperSelectorStore,
  // Store Import Action
  UnableToCreateUnknownSliceActionImportStore,
  UnableToCreateUnknownActionImportStore,
  // Store Import Selector
  UnableToCreateUnknownSliceSelectorImportStore,
  UnableToCreateUnknownSelectorImportStore,
} from "../errors/UnableToCreateStore";
import {
  // Store useSelector
  UnableToUseNonSelector,
  UnableToUseForeignStoreSelector,
} from '../errors/UnableToUseSelector';
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getActionId, getSelectorId, getSliceId } from "./ids";

let stores, slices, actions, actionsByType, actionsImports, selectors, selectorsImports;
let createStore, createSlice, createAction, createAsyncAction, createSelector, createImporter;
const reset = () => {
  stores = {};
  slices = {};
  actions = {};
  actionsByType = {};
  actionsImports = {};
  selectors = {};
  selectorsImports = {};

  ({ createStore } = getStoresFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSlice } = getSlicesFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({
    createAction,
    createAsyncAction
  } = getActionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSelector } = getSelectorsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createImporter } = getImportersFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
};
beforeEach(reset);

describe("stores validator", () => {
  test("Should throw correct error when attempting to create store with invalid name.", () => {
    let error;
    try {
      createStore({ name: null });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: null }));
    error = null;
    try {
      createStore({ name: "" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "" }));
    error = null;
    try {
      createStore({ name: "inva.lidStore" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "inva.lidStore" }));
    error = null;
    try {
      createStore({ name: "inva_lidStore" });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInvalidNameStore({ storeName: "inva_lidStore" }));
  });

  test("Should throw correct error when attempting to create already existing default store.", () => {
    const sliceName = "testSlice";
    const slice = createSlice({
      name: sliceName,
      reducer: {},
    });
    createStore({ storeSlices: { slice } });
    let error;
    try {
      createStore({ storeSlices: { slice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create already existing non-default store.", () => {
    const storeName = "nonDefault";
    const sliceName = "testSlice";
    const slice = createSlice({
      storeName,
      name: sliceName,
      reducer: {},
    });
    createStore({ name: storeName, storeSlices: { slice } });
    let error;
    try {
      createStore({ name: storeName, storeSlices: { slice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateInitializedStore({ storeName }));
  });

  test("Should throw correct error when attempting to create store with foreign store slice", () => {
    const foreignStoreName = "foreign";
    const foreignSliceName = "foreignSlice";
    const foreignSliceId = getSliceId({ storeName: foreignStoreName, sliceName: foreignSliceName });
    const foreignSlice = createSlice({
      storeName: foreignStoreName,
      name: foreignSliceName,
      reducer: {},
    });
    let error;
    try {
      createStore({ storeSlices: { foreignSlice } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignSliceStore({ storeName: DEFAULT_STORE, foreignSliceId }));
  });

  test("Should throw correct error when attempting to create store with unknown slice", () => {
    let error;
    try {
      createStore({ storeSlices: { unknownSlice: {} } });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSliceStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with missing slice", () => {
    const sliceName = "missingSlice";
    const missingSliceId = getSliceId({ storeName: DEFAULT_STORE, sliceName });
    createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({ storeSlices: {} });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingSliceStore({ storeName: DEFAULT_STORE, missingSliceId }));
  });

  test("Should throw correct error when attempting to create empty store", () => {
    let error;
    try {
      createStore({});
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateEmptyStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with unknown store selector", () => {
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { unknownStoreSelector: (state) => state }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSelectorStore({ storeName: DEFAULT_STORE }));
  });

  test("Should throw correct error when attempting to create store with foreign store selector", () => {
    const foreignStoreName = "foreignStore";
    const { foreignSelector } = createSelector({
      storeName: foreignStoreName,
      name: "foreign",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { foreignSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateForeignStoreSelectorStore({ storeName: DEFAULT_STORE, foreignSelectorId: foreignSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with slice selector", () => {
    const { validSelector } = createSelector({
      sliceName: "selectorSlice",
      name: "valid",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { validSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateSliceSelectorStore({ storeName: DEFAULT_STORE, sliceSelectorId: validSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with slice registered store selector", () => {
    const { validSelector } = createSelector({
      name: "valid",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: { validSelector } });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { validSelector }
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateSliceRegisteredSelectorStore({ storeName: DEFAULT_STORE, selectorId: validSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create slice with selector sudo import wrapper selector.", () => {
    const sliceName = "testSlice";
    const selectorName = "valueSelector";
    const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName: DEFAULT_SLICE, selectorName });

    const { importSelector } = createImporter({});
    const { valueSelector: valueSelectorImportWrapper } = importSelector(DEFAULT_SLICE, selectorName);

    const { valueSelector } = createSelector({
      name: selectorName,
      funcs: [(state) => state[sliceName].value],
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {},
      initialState: { value: 0 }
    });

    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: { valueSelectorImportWrapper }
      })
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateImportWrapperSelectorStore({ storeName: DEFAULT_STORE, selectorId }));
  });

  test("Should throw correct error when attempting to create store with missing store selector", () => {
    const { missingStoreSelector } = createSelector({
      name: "missingStore",
      funcs: [(state) => state]
    });
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateMissingSelectorStore({ storeName: DEFAULT_STORE, missingSelectorId: missingStoreSelector.__selectorId }));
  });

  test("Should throw correct error when attempting to create store with selector referencing itself directly - circular selection chain (A -> A)", () => {
    const sliceName = "testSlice";
    const { value1Selector } = createSelector({
      sliceName,
      name: "value1Selector",
      funcs: [(state) => value1]
    });

    const { importSelector } = createImporter({});
    const { circular1Selector: circular1SelectorImportWrapper } = importSelector(sliceName, "circular1Selector");

    const { circular1Selector } = createSelector({ // A -> A
      sliceName,
      name: "circular1Selector",
      funcs: [
        circular1SelectorImportWrapper,
        value1Selector,
        (circular1, value1) => `${circular1}_${value1}`
      ]
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        value1Selector,
        circular1Selector,
      },
      initialState: {
        value1: 1,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateCircularSelectorStore({
      storeName: DEFAULT_STORE,
      circularSelectorId: circular1Selector.__selectorId,
      selectionChain: [circular1Selector.__selectorId]
    }));
  });

  test("Should throw correct error when attempting to create store with selector referencing itself through referenced selector - circular selection chain (A -> B -> A)", () => {
    const sliceName = "testSlice";
    const { importSelector } = createImporter({});
    const { circular1Selector: circular1SelectorImportWrapper } = importSelector(sliceName, "circular1Selector");

    const { value1Selector } = createSelector({
      sliceName,
      name: "value1Selector",
      funcs: [(state) => value1]
    });
    const { value2Selector } = createSelector({
      sliceName,
      name: "value2Selector",
      funcs: [(state) => value2]
    });

    const { combined1Selector } = createSelector({ // B -> A
      sliceName,
      name: "combined1Selector",
      funcs: [
        circular1SelectorImportWrapper,
        value2Selector,
        (circular1, value2) => `${circular1}_${value2}`
      ]
    });

    const { circular1Selector } = createSelector({ // A -> B
      sliceName,
      name: "circular1Selector",
      funcs: [
        combined1Selector,
        value1Selector,
        (combined1, value1) => `${combined1}_${value1}`
      ]
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        value1Selector,
        value2Selector,
        combined1Selector,
        circular1Selector,
      },
      initialState: {
        value1: 1,
        value2: 2,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateCircularSelectorStore({
      storeName: DEFAULT_STORE,
      circularSelectorId: combined1Selector.__selectorId,
      selectionChain: [
        combined1Selector.__selectorId,
        circular1Selector.__selectorId,
      ]
    }));
  });

  test("Should throw correct error when attempting to create store with selector referencing itself through multiple referenced selector - circular selection chain (A -> B -> C -> A)", () => {
    const sliceName = "testSlice";
    const { importSelector } = createImporter({});
    const { circular1Selector: circular1SelectorImportWrapper } = importSelector(sliceName, "circular1Selector");

    const { value1Selector } = createSelector({
      sliceName,
      name: "value1Selector",
      funcs: [(state) => value1],
    });
    const { value2Selector } = createSelector({
      sliceName,
      name: "value2Selector",
      funcs: [(state) => value2]
    });

    const { combined1Selector } = createSelector({ // C -> A
      sliceName,
      name: "combined1Selector",
      funcs: [
        circular1SelectorImportWrapper,
        value1Selector,
        (circular1, value1) => `${circular1}_${value1}`
      ]
    });
    const { combined2Selector } = createSelector({ // B -> C
      sliceName,
      name: "combined2Selector",
      funcs: [
        combined1Selector,
        value2Selector,
        (combined1, value2) => `${combined1}_${value2}`
      ]
    });

    const { circular1Selector } = createSelector({ // A -> B
      sliceName,
      name: "circular1Selector",
      funcs: [
        combined2Selector,
        value1Selector,
        (combined2, value1) => `${combined2}_${value1}`
      ]
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        value1Selector,
        value2Selector,
        combined1Selector,
        combined2Selector,
        circular1Selector,
      },
      initialState: {
        value1: 1,
        value2: 2,
        value3: 3,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateCircularSelectorStore({
      storeName: DEFAULT_STORE,
      circularSelectorId: combined1Selector.__selectorId,
      selectionChain: [
        combined1Selector.__selectorId,
        circular1Selector.__selectorId,
        combined2Selector.__selectorId,
      ]
    }));
  });

  test("Should throw correct error when attempting to create store with selector referencing itself through multiple referenced selector - circular selection chain (A -> B -> C -> D -> A)", () => {
    const sliceName = "testSlice";
    const { importSelector } = createImporter({});
    const { circular1Selector: circular1SelectorImportWrapper } = importSelector(sliceName, "circular1Selector");

    const { value1Selector } = createSelector({
      sliceName,
      name: "value1Selector",
      funcs: [(state) => value1],
    });
    const { value2Selector } = createSelector({
      sliceName,
      name: "value2Selector",
      funcs: [(state) => value2]
    });

    const { combined1Selector } = createSelector({ // D -> A
      sliceName,
      name: "combined1Selector",
      funcs: [
        circular1SelectorImportWrapper,
        value1Selector,
        (circular1, value1) => `${circular1}_${value1}`
      ]
    });
    const { combined2Selector } = createSelector({ // C -> D
      sliceName,
      name: "combined2Selector",
      funcs: [
        combined1Selector,
        value2Selector,
        (combined1, value2) => `${combined1}_${value2}`
      ]
    });
    const { combined3Selector } = createSelector({ // B -> C
      sliceName,
      name: "combined3Selector",
      funcs: [
        combined2Selector,
        value1Selector,
        (combined2, value1) => `${combined2}_${value1}`
      ]
    });

    const { circular1Selector } = createSelector({ // A -> B
      sliceName,
      name: "circular1Selector",
      funcs: [
        combined3Selector,
        value1Selector,
        (combined3, value1) => `${combined3}_${value1}`
      ]
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        value1Selector,
        value2Selector,
        combined1Selector,
        combined2Selector,
        combined3Selector,
        circular1Selector,
      },
      initialState: {
        value1: 1,
        value2: 2,
        value3: 3,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateCircularSelectorStore({
      storeName: DEFAULT_STORE,
      circularSelectorId: combined1Selector.__selectorId,
      selectionChain: [
        combined1Selector.__selectorId,
        circular1Selector.__selectorId,
        combined3Selector.__selectorId,
        combined2Selector.__selectorId,
      ]
    }));
  });

  test("Should throw correct error when attempting to create store with keepMemo true selector referencing keepMemo false selector", () => {
    const sliceName = "testSlice";
    const { validSelector } = createSelector({
      sliceName,
      name: "valid",
      funcs: [
        (state) => state[sliceName].obj1.value,
        (state) => state[sliceName].obj2.value,
        (value1, value2) => ({ value1, value2 })
      ],
    });
    const { validCombinedSelector } = createSelector({
      sliceName,
      name: "validCombined",
      funcs: [
        validSelector,
        (state) => state[sliceName].obj3.value,
        ({ value1, value2 }, value3) => {
          return { value1, value2, value3 };
        }
      ],
      keepMemo: true,
    });

    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        validSelector,
        validCombinedSelector,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreatePartialKeepMemoSelectorStore({
      storeName: DEFAULT_STORE,
      selectorId: validCombinedSelector.__selectorId,
      nonKeepMemoSelectorId: validSelector.__selectorId
    }));
  });

  test("Should throw correct error when attempting to create store with parameterless selector referencing parameterized", () => {
    const sliceName = "testSlice";
    const { parameterizedSelector } = createSelector({
      sliceName,
      name: "parameterizedSelector",
      funcs: [(state, { getParams }) => {
        const [fieldName] = getParams();
        return state[fieldName];
      }],
      isParameterized: true,
      paramsSignature: "fieldName",
    });
    const { parameterlessSelector } = createSelector({
      sliceName,
      name: "parameterlessSelector",
      funcs: [
        parameterizedSelector,
        (arg) => arg
      ],
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        parameterlessSelector,
        parameterizedSelector,
      },
      initialState: {
        value1: 1,
        value2: 2,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateParameterlessToParameterizedSelectorStore({
      storeName: DEFAULT_STORE,
      selectorId: parameterlessSelector.__selectorId,
      parameterizedSelectorId: parameterizedSelector.__selectorId
    }));
  });

  test("Should throw correct error when attempting to create store with parameterized selector referencing selector with different paramsSignature and no appropriate paramsMapper", () => {
    const sliceName = "testSlice";
    const { otherParameterizedSelector } = createSelector({
      sliceName,
      name: "otherParameterizedSelector",
      funcs: [(state, { getParams }) => {
        const [fieldName] = getParams();
        return state[fieldName];
      }],
      isParameterized: true,
      paramsSignature: "fieldName",
    });
    const { parameterizedSelector } = createSelector({
      sliceName,
      name: "parameterizedSelector",
      funcs: [
        otherParameterizedSelector,
        (arg, { getParams }) => {
          const [multiplier] = getParams();
          return arg * multiplier;
        }],
      isParameterized: true,
      paramsSignature: "multiplier",
    });
    const slice = createSlice({
      name: sliceName,
      reducer: {},
      sliceSelectors: {
        otherParameterizedSelector,
        parameterizedSelector,
      },
      initialState: {
        value1: 1,
        value2: 2,
      }
    });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateNoParamsMapperSelectorStore({
      storeName: DEFAULT_STORE,
      selectorId: parameterizedSelector.__selectorId,
      paramsSignature: selectors[parameterizedSelector.__selectorId].paramsSignature,
      noMapperSelectorId: otherParameterizedSelector.__selectorId,
      noMapperParamsSignature: selectors[otherParameterizedSelector.__selectorId].paramsSignature,
    }));
  });

  test("Should throw correct error when attempting to create store with unknown slice action import", () => {
    const { importAction } = createImporter({});
    const importSliceName = "importSlice";
    const importActionName = "importAction";
    const importActionId = getActionId({
      storeName: DEFAULT_STORE,
      sliceName: importSliceName,
      actionName: importActionName
    });
    importAction(importSliceName, importActionName);
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSliceActionImportStore({ actionId: importActionId }));
  });

  test("Should throw correct error when attempting to create store with unknown action import", () => {
    const { importAction } = createImporter({});
    const sliceName = "testSlice";
    const importActionName = "importAction";
    const importActionId = getActionId({
      storeName: DEFAULT_STORE,
      sliceName,
      actionName: importActionName
    });
    importAction(sliceName, importActionName);
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownActionImportStore({ actionId: importActionId }));
  });

  test("Should throw correct error when attempting to create store with unknown slice selector import", () => {
    const { importSelector } = createImporter({});
    const importSliceName = "importSlice";
    const importSelectorName = "importSelector";
    const importSelectorId = getSelectorId({
      storeName: DEFAULT_STORE,
      sliceName: importSliceName,
      selectorName: importSelectorName
    });
    importSelector(importSliceName, importSelectorName);
    const sliceName = "testSlice";
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSliceSelectorImportStore({ selectorId: importSelectorId }));
  });

  test("Should throw correct error when attempting to create store with unknown selector import", () => {
    const { importSelector } = createImporter({});
    const sliceName = "testSlice";
    const importSelectorName = "importSelector";
    const importSelectorId = getSelectorId({
      storeName: DEFAULT_STORE,
      sliceName,
      selectorName: importSelectorName
    });
    importSelector(sliceName, importSelectorName);
    const slice = createSlice({ name: sliceName, reducer: {}, sliceSelectors: {} });
    let error;
    try {
      createStore({
        storeSlices: { slice },
        storeSelectors: {}
      });
    } catch (err) { error = err; }
    expect(error).toEqual(new UnableToCreateUnknownSelectorImportStore({ selectorId: importSelectorId }));
  });
});
