export const getSliceId = ({ storeName, sliceName }) => `${storeName}.${sliceName}`;
export const getActionId = ({ storeName, sliceName, actionName }) => `${getSliceId({ storeName, sliceName })}.${actionName}`;
export const getSelectorId = ({ storeName, sliceName, selectorName }) => `${getSliceId({ storeName, sliceName })}.${selectorName}`;