import { getSliceId } from "../factories/ids";

// Base
export class UnableToCreateStore extends Error {
  constructor(params) {
    const {
      storeName,
      message,
      baseMessageSuffix
    } = params;

    const hasStoreName = params.hasOwnProperty("storeName");

    let baseMessage = "Unable to create store slice";
    if (hasStoreName)
      baseMessage = `Unable to create store ${storeName}`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// Store validation
export class UnableToCreateInvalidNameStore extends UnableToCreateStore {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: 'name must be a string and its not allow to contain "." and/or "_" characters.' });
  }
};

export class UnableToCreateInitializedStore extends UnableToCreateStore {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: 'as it has already been initialized. Make sure that you are only calling createStore() once per store.' });
  }
};

// Store slices validation
export class UnableToCreateForeignSliceStore extends UnableToCreateStore {
  constructor({ storeName, foreignSliceId }) {
    super({ storeName, baseMessageSuffix: `found foreign store slice ${foreignSliceId} in storeSlices passed to createStore() function.` });
  }
};

export class UnableToCreateUnknownSliceStore extends UnableToCreateStore {
  constructor({ storeName, unknownSliceId }) {
    super({ storeName, baseMessageSuffix: `unknown store slice ${unknownSliceId} in storeSlices passed to createStore() function. Make sure all the slices have been created using createSlice() function.` });
  }
};

export class UnableToCreateMissingSliceStore extends UnableToCreateStore {
  constructor({ storeName, missingSliceId }) {
    super({ storeName, baseMessageSuffix: `missing store slice ${missingSliceId} in storeSlices passed to createStore() function. Make sure you are passing all the store slices created using createSlice() function.` });
  }
};

export class UnableToCreateEmptyStore extends UnableToCreateStore {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: 'at least one slice is required when creating store.' });
  }
};

// Store selectors validation
export class UnableToCreateUnknownSelectorStore extends UnableToCreateStore {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: `unknown selector passed to createStore() function. All selectors must be created using createSelector() function.` });
  }
};

export class UnableToCreateForeignStoreSelectorStore extends UnableToCreateStore {
  constructor({ storeName, foreignSelectorId }) {
    super({ storeName, baseMessageSuffix: `foreign store selector ${foreignSelectorId} has been passed to createStore() function.` });
  }
};

export class UnableToCreateSliceSelectorStore extends UnableToCreateStore {
  constructor({ storeName, sliceSelectorId }) {
    const [selectorStoreName, selectorSliceName] = sliceSelectorId.split(".");
    const selectorSliceId = getSliceId({ storeName: selectorStoreName, sliceName: selectorSliceName });
    super({ storeName, baseMessageSuffix: `slice selector ${sliceSelectorId} has been passed to createStore() function. Pass it into createSlice() ${selectorSliceId} instead.` });
  }
};

export class UnableToCreateSliceRegisteredSelectorStore extends UnableToCreateStore {
  constructor({ storeName, selectorId }) {
    const [selectorStoreName, selectorSliceName] = selectorId.split(".");
    const selectorSliceId = getSliceId({ storeName: selectorStoreName, sliceName: selectorSliceName });
    super({ storeName, baseMessageSuffix: `store selector ${selectorId} has already been passed to ${selectorSliceId} slice.` });
  }
};

export class UnableToCreateImportWrapperSelectorStore extends UnableToCreateStore {
  constructor({ storeName, selectorId }) {
    super({ storeName, baseMessageSuffix: `${selectorId} selector sudo import wrapper has been found in storeSelectors but it is not allowed to be used for selector registration. Please use standard-esm import to get appropriate for registration instance of the selector func.` });
  }
};

export class UnableToCreateMissingSelectorStore extends UnableToCreateStore {
  constructor({ storeName, missingSelectorId }) {
    super({ storeName, baseMessageSuffix: `store selector ${missingSelectorId} is missing storeSelectors passed to createStore() function.` });
  }
};

export class UnableToCreateCircularSelectorStore extends UnableToCreateStore {
  constructor({ storeName, circularSelectorId, selectionChain }) {
    super({ storeName, baseMessageSuffix: `selector ${circularSelectorId} contains circular selection chain: ${[...selectionChain, circularSelectorId].join(" -> ")}` });
  }
};

export class UnableToCreatePartialKeepMemoSelectorStore extends UnableToCreateStore {
  constructor({ storeName, selectorId, nonKeepMemoSelectorId }) {
    super({ storeName, baseMessageSuffix: `keepMemo selector ${selectorId} is referencing not permanently memoized ${nonKeepMemoSelectorId} selector.` });
  }
};
export class UnableToCreateParameterlessToParameterizedSelectorStore extends UnableToCreateStore {
  constructor({ storeName, selectorId, parameterizedSelectorId }) {
    super({ storeName, baseMessageSuffix: `parameterless selector ${selectorId} is referencing parameterized selector ${parameterizedSelectorId}.` });
  }
};
export class UnableToCreateNoParamsMapperSelectorStore extends UnableToCreateStore {
  constructor({ storeName, selectorId, paramsSignature, noMapperSelectorId, noMapperParamsSignature }) {
    super({ storeName, baseMessageSuffix: `parameterized selector ${selectorId} with paramsSignature "${paramsSignature}" is referencing ${noMapperSelectorId} with paramsSignature "${noMapperParamsSignature}". To use it provide appropriate paramsMapper function to createSelector() function.` });
  }
};

// Store Action Imports
export class UnableToCreateUnknownSliceActionImportStore extends UnableToCreateStore {
  constructor({ actionId }) {
    const [storeName, sliceName, actionName] = actionId.split(".");
    super({ storeName, baseMessageSuffix: `store import is attempting to import unknown slice ${sliceName} action ${actionName}` });
  }
};

export class UnableToCreateUnknownActionImportStore extends UnableToCreateStore {
  constructor({ actionId }) {
    const [storeName, sliceName, actionName] = actionId.split(".");
    super({ storeName, baseMessageSuffix: `store import is attempting to import unknown action ${actionId}` });
  }
};

// Store Selectors Imports
export class UnableToCreateUnknownSliceSelectorImportStore extends UnableToCreateStore {
  constructor({ selectorId }) {
    const [storeName, sliceName, selectorName] = selectorId.split(".");
    super({ storeName, baseMessageSuffix: `store import is attempting to import unknown slice ${sliceName} selector ${selectorName}` });
  }
};

export class UnableToCreateUnknownSelectorImportStore extends UnableToCreateStore {
  constructor({ selectorId }) {
    const [storeName, sliceName, selectorName] = selectorId.split(".");
    super({ storeName, baseMessageSuffix: `store import is attempting to import unknown selector ${selectorId}` });
  }
};
