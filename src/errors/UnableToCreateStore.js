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
export class UnableToCreateMissingSelectorStore extends UnableToCreateStore {
  constructor({ storeName, missingSelectorId }) {
    super({ storeName, baseMessageSuffix: `store selector ${missingSelectorId} is missing storeSelectors passed to createStore() function.` });
  }
};
