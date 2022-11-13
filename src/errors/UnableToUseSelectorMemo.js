import { getSliceId, getSelectorId } from "../factories/ids";

export class UnableToUseSelectorMemo extends Error {
  constructor(message) {
    super(message);
  }
};

export class UnableToUseNonSelectorMemo extends UnableToUseSelectorMemo {
  constructor({ storeName }) {
    super(`Store ${storeName} useSelectorMemo cannot use non selector func.`);
  }
};

export class UnableToUseForeignStoreSelectorMemo extends UnableToUseSelectorMemo {
  constructor({ storeName, selectorId }) {
    super(`Store ${storeName} useSelectorMemo cannot use foreign store selector ${selectorId} func.`);
  }
};