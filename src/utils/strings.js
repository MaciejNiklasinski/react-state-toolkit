export const capitalize = (str) =>
  `${str[0].toUpperCase()}${str.slice(1)}`;

export const insertString = (str, insertIndex, insertValue) =>
  `${str.slice(0, insertIndex)}${insertValue}${str.slice(insertIndex)}`;

export const insertCapitalized = (str, insertIndex, insertValue) =>
  insertString(str, insertIndex, capitalize(insertValue));

export const toSnakeCase = str => str?.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)?.trimStart('_') || str;

export const toScreamingSnakeCase = str => toSnakeCase(str)?.toUpperCase();

export const isValidName = (name) => name && !/[_.]/.test(name);

export const suffixIfRequired = (str, suffix) => {
  if (str && (typeof str !== "string" || !str.endsWith(suffix)))
    return str + suffix;
  else return str;
};

export const toOrdinal = (number) => {
  const numberStr = `${number}`;
  const { length } = numberStr;
  const lastChar = numberStr[length - 1];
  const penultimateChar = length > 1 && numberStr[length - 2];
  if (penultimateChar === "1")
    return numberStr + "th";
  else if (lastChar === "1")
    return numberStr + "st";
  else if (lastChar === "2")
    return numberStr + "nd";
  else if (lastChar === "3")
    return numberStr + "rd";
  else
    return numberStr + "th";
};