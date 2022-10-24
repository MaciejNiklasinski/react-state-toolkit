import { DEFAULT_SLICE } from "../constants/store";
import { getSliceId, getActionId } from "../factories/ids";

// Base
export class UnableToImportAction extends Error {
  constructor(params) {
    const {
      storeName,
      sliceName,
      actionName,
      message,
      baseMessageSuffix
    } = params;

    const hasStoreName = params.hasOwnProperty("storeName");
    const hasSliceName = params.hasOwnProperty("sliceName");
    const hasActionName = params.hasOwnProperty("actionName");

    let baseMessage = "Unable to import action";
    if (hasStoreName && hasSliceName && hasActionName)
      baseMessage = `Unable to import action ${getActionId({ storeName, sliceName, actionName })}`;
    else if (hasStoreName && hasSliceName)
      baseMessage = `Unable to import slice ${getSliceId({ storeName, sliceName })} action`;
    else if (hasStoreName && hasActionName)
      baseMessage = `Unable to import store ${storeName} ${actionName} action`;
    else if (hasStoreName)
      baseMessage = `Unable to import store ${storeName} action`;
    else if (hasSliceName && hasActionName)
      baseMessage = `Unable to import store slice ${sliceName} ${actionName} action`;
    else if (hasSliceName)
      baseMessage = `Unable to import store slice ${sliceName} action`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// ImportAction slice validation
export class UnableToImportInvalidNameSliceAction extends UnableToImportAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `sliceName must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToImportUnregisteredSliceAction extends UnableToImportAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `slice ${sliceName} has never been register within ${storeName} store.` });
  }
};

// ImportAction validation
export class UnableToImportInvalidNameAction extends UnableToImportAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `name must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToImportUnregisteredAction extends UnableToImportAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `slice ${sliceName} has never been register within ${getSliceId({ storeName, sliceName })} slice.` });
  }
};