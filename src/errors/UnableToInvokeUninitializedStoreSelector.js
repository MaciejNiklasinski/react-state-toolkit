export class UnableToInvokeUninitializedStoreSelector extends Error {
  constructor({ selectorId }) {
    super(`Selector ${selectorId} selector has been called before store has been initialized.`);
  }
};