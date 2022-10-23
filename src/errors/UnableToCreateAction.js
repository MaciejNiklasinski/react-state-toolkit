import { DEFAULT_SLICE } from "../constants/store";
import { getSliceId, getActionId } from "../factories/ids";

// Base
export class UnableToCreateAction extends Error {
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

    let baseMessage = "Unable to create action";
    if (hasStoreName && hasSliceName && hasActionName)
      baseMessage = `Unable to create action ${getActionId({ storeName, sliceName, actionName })}`;
    else if (hasStoreName && hasSliceName)
      baseMessage = `Unable to create slice ${getSliceId({ storeName, sliceName })} action`;
    else if (hasStoreName && hasActionName)
      baseMessage = `Unable to create store ${storeName} ${actionName} action`;
    else if (hasStoreName)
      baseMessage = `Unable to create store ${storeName} action`;
    else if (hasSliceName && hasActionName)
      baseMessage = `Unable to create store slice ${sliceName} ${actionName} action`;
    else if (hasSliceName)
      baseMessage = `Unable to create store slice ${sliceName} action`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// Action store validation
export class UnableToCreateInvalidNameStoreAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: 'storeName must be a string and its not allow to contain "." and/or "_" characters.' });
  }
};

export class UnableToCreateInitializedStoreAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `as the store ${storeName} has already been initialized. Make sure that you are always invoking createAction()/createAsyncAction() prior to invoking createStore().` });
  }
};

// Action slice validation
export class UnableToCreateInvalidNameSliceAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `sliceName must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToCreateReservedSliceAction extends UnableToCreateAction {
  constructor({ storeName, actionName }) {
    super({ storeName, sliceName: DEFAULT_SLICE, actionName, baseMessageSuffix: `sliceName ${DEFAULT_SLICE} is reserved for store selectors.` });
  }
};

export class UnableToCreateInitializedSliceAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `as the store slice ${getSliceId({ storeName, sliceName })} has already been initialized. Make sure that you are always invoking createAction()/createAsyncAction() prior to invoking createSlice().` });
  }
};

// Action validation
export class UnableToCreateInvalidNameAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: `name must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToCreateInvalidFuncAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: "func must be a function." });
  }
};

export class UnableToCreateExistingAction extends UnableToCreateAction {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, actionName, baseMessageSuffix: "action already exists." });
  }
};