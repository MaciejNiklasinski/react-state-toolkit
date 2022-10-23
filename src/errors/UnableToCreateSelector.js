import { getSliceId, getSelectorId } from "../factories/ids";

// Base
export class UnableToCreateSelector extends Error {
  constructor(params) {
    const {
      storeName,
      sliceName,
      selectorName,
      message,
      baseMessageSuffix
    } = params;

    const hasStoreName = params.hasOwnProperty("storeName");
    const hasSliceName = params.hasOwnProperty("sliceName");
    const hasSelectorName = params.hasOwnProperty("selectorName");

    let baseMessage = "Unable to create selector";
    if (hasStoreName && hasSliceName && hasSelectorName)
      baseMessage = `Unable to create selector ${getSelectorId({ storeName, sliceName, selectorName })}`;
    else if (hasStoreName && hasSliceName)
      baseMessage = `Unable to create slice ${getSliceId({ storeName, sliceName })} selector`;
    else if (hasStoreName && hasSelectorName)
      baseMessage = `Unable to create store ${storeName} ${selectorName} selector`;
    else if (hasStoreName)
      baseMessage = `Unable to create store ${storeName} selector`;
    else if (hasSliceName && hasSelectorName)
      baseMessage = `Unable to create store slice ${sliceName} ${selectorName} selector`;
    else if (hasSliceName)
      baseMessage = `Unable to create store slice ${sliceName} selector`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// Selector store validation
export class UnableToCreateInvalidNameStoreSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: 'storeName must be a string and its not allow to contain "." and/or "_" characters.' });
  }
};

export class UnableToCreateInitializedStoreSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `as the store ${storeName} has already been initialized. Make sure that you are always invoking createSelector() prior to invoking createStore().` });
  }
};

// Selector slice validation
export class UnableToCreateInvalidNameSliceSelector extends UnableToCreateSelector {
  constructor({ storeName, selectorName }) {
    super({ storeName, selectorName, baseMessageSuffix: `sliceName must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToCreateInitializedSliceSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `as the store slice ${getSliceId({ storeName, sliceName })} has already been initialized. Make sure that you are always invoking createSelector() prior to invoking createSlice().` });
  }
};

// Selector slice validation
export class UnableToCreateInvalidNameSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `name must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToCreateInvalidFuncsSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: "funcs must be non empty array containing exclusively functions." });
  }
};

export class UnableToCreateInvalidMemoOnArgsSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: "based on only one selecting function when memoOnArgs flag is true." });
  }
};

export class UnableToCreateExistingSelector extends UnableToCreateSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: "selector already exists." });
  }
};