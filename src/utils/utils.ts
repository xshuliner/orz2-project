/**
 * Utility helpers.
 */

/**
 * traverseObject - Apply a modifier to every own value of an object.
 */
const traverseObject = ({
  obj,
  modifier,
}: {
  obj: Record<string, any>;
  modifier: (key: string, value: any) => any;
}): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return {};

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      result[key] = modifier(key, value);
    }
  }

  return result;
};

/**
 * router2url - Convert a path and query object into a URL string.
 */
const router2url = (
  path: string,
  query: Record<string, any>
): string | null => {
  if (!path) return null;

  const queryParts: string[] = [];

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const value = query[key];
      if (value !== undefined && value !== null) {
        queryParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        );
      }
    }
  }

  if (queryParts.length > 0) {
    return `${path}?${queryParts.join('&')}`;
  }

  return path;
};

const Utils = {
  traverseObject,
  router2url,
};

export default Utils;
