import { DEFAULT_SLICE } from "../constants/store";
import { getSliceId, getSelectorId } from "../factories/ids";

// Base
export class UnableToImportSelector extends Error {
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

    let baseMessage = "Unable to import selector";
    if (hasStoreName && hasSliceName && hasSelectorName)
      baseMessage = `Unable to import selector ${getSelectorId({ storeName, sliceName, selectorName })}`;
    else if (hasStoreName && hasSliceName)
      baseMessage = `Unable to import slice ${getSliceId({ storeName, sliceName })} selector`;
    else if (hasStoreName && hasSelectorName)
      baseMessage = `Unable to import store ${storeName} ${selectorName} selector`;
    else if (hasStoreName)
      baseMessage = `Unable to import store ${storeName} selector`;
    else if (hasSliceName && hasSelectorName)
      baseMessage = `Unable to import store slice ${sliceName} ${selectorName} selector`;
    else if (hasSliceName)
      baseMessage = `Unable to import store slice ${sliceName} selector`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// ImportSelector slice validation
export class UnableToImportInvalidNameSliceSelector extends UnableToImportSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `sliceName must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToImportUnregisteredSliceSelector extends UnableToImportSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `slice ${sliceName} has never been register within ${storeName} store.` });
  }
};

// ImportSelector validation
export class UnableToImportInvalidNameSelector extends UnableToImportSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `name must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToImportUnregisteredSelector extends UnableToImportSelector {
  constructor({ storeName, sliceName, selectorName }) {
    super({ storeName, sliceName, selectorName, baseMessageSuffix: `slice ${sliceName} has never been register within ${getSliceId({ storeName, sliceName })} slice.` });
  }
};