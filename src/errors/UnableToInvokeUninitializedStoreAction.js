export class UnableToInvokeUninitializedStoreAction extends Error {
  constructor({ actionId }) {
    super(`Action ${actionId} action has been called before store has been initialized.`);
  }
};