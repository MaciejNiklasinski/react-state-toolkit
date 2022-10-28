import { DEFAULT_SLICE } from "../constants/store";
import { getSliceId, getActionId } from "../factories/ids";

// Base
export class UnableToCreateSlice extends Error {
  constructor(params) {
    const {
      storeName,
      sliceName,
      message,
      baseMessageSuffix
    } = params;

    const hasStoreName = params.hasOwnProperty("storeName");
    const hasSliceName = params.hasOwnProperty("sliceName");

    let baseMessage = "Unable to create store slice";
    if (hasStoreName && hasSliceName)
      baseMessage = `Unable to create store slice ${getSliceId({ storeName, sliceName })}`;
    else if (hasStoreName)
      baseMessage = `Unable to create store ${storeName} slice`;
    else if (hasSliceName)
      baseMessage = `Unable to create store slice ${sliceName}`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// Slice store validation
export class UnableToCreateInvalidNameStoreSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: 'storeName must be a string and its not allow to contain "." and/or "_" characters.' });
  }
};

export class UnableToCreateInitializedStoreSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: `as the store ${storeName} has already been initialized. Make sure that you are always invoking createSlice() prior to invoking createStore().` });
  }
};

// Slice validation
export class UnableToCreateInvalidNameSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: `name must be a string and its not allow to contain "." and/or "_" characters.` });
  }
};

export class UnableToCreateReservedNameSlice extends UnableToCreateSlice {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: `name ${DEFAULT_SLICE} is reserved for store selectors.` });
  }
};

export class UnableToCreateExistingSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: `slice already exists.` });
  }
};

// Slice Actions validation
export class UnableToCreateNoReducerSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: "reducer is required." });
  }
};

export class UnableToCreateUnknownActionHandlerReducerSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: "reducer contains an action handler for unknown action. Please make sure that all action types in the reducer has been created using createAction() or createAsyncAction() functions." });
  }
};

export class UnableToCreateForeignStoreActionHandlerReducerSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, actionStoreName, actionSliceName, actionName }) {
    super({ storeName, sliceName, baseMessageSuffix: `reducer with foreign store action handler type ${getActionId({ storeName: actionStoreName, sliceName: actionSliceName, actionName })} has been passed to createSlice() function` });
  }
};

export class UnableToCreateForeignSliceActionHandlerReducerSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, actionSliceName, actionName }) {
    super({ storeName, sliceName, baseMessageSuffix: `reducer with foreign slice action handler type ${getActionId({ storeName, sliceName: actionSliceName, actionName })} has been passed to createSlice() function` });
  }
};

export class UnableToCreateMissingActionHandlerReducerSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, actionName }) {
    super({ storeName, sliceName, baseMessageSuffix: `reducer with missing action handler for action type ${getActionId({ storeName, sliceName, actionName })} has been passed to createSlice() function. Make sure that reducer object passed to createSlice() contains an action handler for each action, or include action type in noHandlerTypes array passed to createSlice() function.` });
  }
};

// Slice Selectors validation
export class UnableToCreateNoSelectorsSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName }) {
    super({ storeName, sliceName, baseMessageSuffix: "selectors must be either an array/object of selectors created using createSelector() function or empty array/obj." });
  }
};

export class UnableToCreateUnknownSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorId }) {
    const baseMessageSuffix = selectorId 
      ? `unknown selector ${selectorId} passed to createSlice() function. All selectors must be created using createSelector() function.`
      : `unknown selector passed to createSlice() function. All selectors must be created using createSelector() function.`;
    super({ storeName, sliceName, baseMessageSuffix });
  }
};

export class UnableToCreateForeignStoreSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorId }) {
    super({ storeName, sliceName, baseMessageSuffix: `foreign store selector ${selectorId} has been passed to createSlice() function.` });
  }
};

export class UnableToCreateForeignSliceSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorId }) {
    super({ storeName, sliceName, baseMessageSuffix: `foreign slice selector ${selectorId} has been passed to createSlice() function.` });
  }
};

export class UnableToCreateForeignRegisteredSliceSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorSliceName, selectorId }) {
    super({ storeName, sliceName, baseMessageSuffix: `store selector ${selectorId} has already been registered in ${getSliceId({ storeName, sliceName: selectorSliceName })} slice. Make sure each store selector is passed as argument to only one createSlice()/createStore() function call.` });
  }
};

export class UnableToCreateImportWrapperSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorId }) {
    super({ storeName, sliceName, baseMessageSuffix: `${selectorId} selector sudo import wrapper has been found in sliceSelectors but it is not allowed to be used for selector registration. Please use standard-esm import to get appropriate for registration instance of the selector func.` });
  }
};

export class UnableToCreateMissingSliceSelectorSlice extends UnableToCreateSlice {
  constructor({ storeName, sliceName, selectorId }) {
    super({ storeName, sliceName, baseMessageSuffix: `selector ${selectorId} is missing in sliceSelectors passed to createSlice() function.` });
  }
};