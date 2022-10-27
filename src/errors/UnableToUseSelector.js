import { getSliceId, getSelectorId } from "../factories/ids";

export class UnableToUseSelector extends Error {
  constructor(message) {
    super(message);
  }
};

export class UnableToUseNonSelector extends UnableToUseSelector {
  constructor({ storeName }) {
    super(`Store ${storeName} useSelector cannot use non selector func.`);
  }
};

export class UnableToUseForeignStoreSelector extends UnableToUseSelector {
  constructor({ storeName, selectorId }) {
    super(`Store ${storeName} useSelector cannot use foreign store selector ${selectorId} func.`);
  }
};