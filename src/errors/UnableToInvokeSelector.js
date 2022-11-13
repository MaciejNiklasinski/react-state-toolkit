export class UnableToInvokeSelector extends Error { }

export class UnableToInvokeUninitializedStoreSelector extends UnableToInvokeSelector {
  constructor({ selectorId }) {
    super(`Selector ${selectorId} selector has been called before store has been initialized.`);
  }
};

export class UnableToInvokeSelectingStoreSelector extends UnableToInvokeSelector {
  constructor({ selectorId }) {
    super(`Selector ${selectorId} has been directly invoked from inside selector func and this is not allowed. All referenced selectors must be passed directly into funcs param of createSelector() function.`);
  }
};