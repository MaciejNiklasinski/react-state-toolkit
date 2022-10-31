export const capitalize = (str) =>
  `${str[0].toUpperCase()}${str.slice(1)}`;
export const insertString = (str, insertIndex, insertValue) =>
  `${str.slice(0, insertIndex)}${insertValue}${str.slice(insertIndex)}`;
export const insertCapitalized = (str, insertIndex, insertValue) =>
  insertString(str, insertIndex, capitalize(insertValue));  

export const toSnakeCase = str => str?.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)?.trimStart('_') || str;
export const toScreamingSnakeCase = str => toSnakeCase(str)?.toUpperCase();