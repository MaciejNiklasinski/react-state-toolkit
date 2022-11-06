import { toOrdinal } from "../utils/strings";

export class UnableToSerializeSelectorParam extends Error {
  constructor({ selectorId, type, index }) {
    super(`Unable to serialize selector ${selectorId} ${toOrdinal(index + 1)} param as it is a ${type}. react-state-toolkit requires selector parameters to be of a serializable value type [bigint, boolean, number, string, undefined, null]`);
  }
};