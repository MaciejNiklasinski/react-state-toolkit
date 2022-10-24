import { DEFAULT_SLICE } from "../constants/store";

// Base
export class UnableToCreateImporter extends Error {
  constructor(params) {
    const {
      storeName,
      message,
      baseMessageSuffix
    } = params;

    const hasStoreName = params.hasOwnProperty("storeName");

    let baseMessage = "Unable to create store importer";
    if (hasStoreName)
      baseMessage = `Unable to create store ${storeName} importer`;

    super(message || `${baseMessage}, ${baseMessageSuffix}`);
  }
};

// Importer store validation
export class UnableToCreateInvalidNameStoreImporter extends UnableToCreateImporter {
  constructor({ storeName }) {
    super({ storeName, baseMessageSuffix: 'storeName must be a string and its not allow to contain "." and/or "_" characters.' });
  }
};