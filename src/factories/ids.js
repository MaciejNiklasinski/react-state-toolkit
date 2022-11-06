import { UnableToSerializeSelectorParam } from "../errors/UnableToSerializeSelectorParam";

export const getSliceId = ({ storeName, sliceName }) => `${storeName}.${sliceName}`;
export const getActionId = ({ storeName, sliceName, actionName }) => `${getSliceId({ storeName, sliceName })}.${actionName}`;
export const getSelectorId = ({ storeName, sliceName, selectorName }) => `${getSliceId({ storeName, sliceName })}.${selectorName}`;
export const getSubscriptionIds = ({ selectorId, params }) => {
  const paramsId = getParamsId({ selectorId, params });
  return {
    subscriptionId: `${selectorId}.${paramsId}`,
    paramsId,
  }
};

export const getParamsId = ({ selectorId, params }) =>
  params.reduce((acc, param, index) => {
    const type = typeof param;
    switch (type) {
      case "bigint":
        return `${acc}i${param},`;
      case "boolean":
        return `${acc}b${param},`;
      case "number":
        return `${acc}n${param},`;
      case "string":
        return `${acc}s${param},`;
      case "undefined": return `${acc}u,`;
      case "function":
      case "symbol":
      case "object":
      default:
        if (param === null) return `${acc}n,`;
        throw new UnableToSerializeSelectorParam({ selectorId, index, type });
    }
  }, `${params.length}`);