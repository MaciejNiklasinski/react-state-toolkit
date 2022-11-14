export class UnableToInvokeAction extends Error { };

export class UnableToInvokeUninitializedStoreAction extends UnableToInvokeAction {
  constructor({ actionId }) {
    super(`Action ${actionId} action has been called before store has been initialized.`);
  }
};

export class UnableToInvokeReducingStoreAction extends UnableToInvokeAction {
  constructor({ actionId }) {
    super(`Action ${actionId} action has been directly invoked from inside action handler and this is not allowed.`);
  }
};

export class UnableToInvokeSelectingStoreAction extends UnableToInvokeAction {
  constructor({ actionId }) {
    super(`Action ${actionId} action has been directly invoked from inside selector and this is not allowed.`);
  }
};