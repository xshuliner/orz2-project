export type JsonPrimitive = boolean | null | number | string;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonValueType =
  | 'array'
  | 'boolean'
  | 'null'
  | 'number'
  | 'object'
  | 'string';

export type JsonIndent = 2 | 4 | '\t';

export interface JsonSyntaxError {
  caret: string;
  column: number;
  line: number;
  lineText: string;
  position: number;
}

export type JsonParseResult =
  | { error: JsonSyntaxError; ok: false }
  | { ok: true; value: JsonValue };

export interface JsonStatistics {
  byteCount: number;
  keyCount: number;
  lineCount: number;
  maxDepth: number;
  rootType: JsonValueType;
  valueCount: number;
}

export interface JsonPathEntry {
  path: string;
  preview: string;
  type: JsonValueType;
}

class JsonPositionError extends Error {
  readonly position: number;

  constructor(position: number) {
    super();
    this.position = position;
  }
}

function getPositionFromNativeError(message: string, text: string) {
  const positionMatch = message.match(/(?:at\s+)?position\s+(\d+)/i);
  if (positionMatch) return Number(positionMatch[1]);

  const lineColumnMatch = message.match(
    /line\s+(\d+)(?:\s+column|\s+at\s+column)\s+(\d+)/i
  );
  if (!lineColumnMatch) return undefined;

  const targetLine = Number(lineColumnMatch[1]);
  const targetColumn = Number(lineColumnMatch[2]);
  const lines = text.split(/\r\n|\r|\n/);
  let position = 0;

  for (let index = 0; index < targetLine - 1; index += 1) {
    position += (lines[index]?.length ?? 0) + 1;
  }

  return position + Math.max(0, targetColumn - 1);
}

function findJsonSyntaxErrorPosition(text: string) {
  let position = 0;

  function fail(at = position): never {
    throw new JsonPositionError(at);
  }

  function skipWhitespace() {
    while (/[\t\n\r ]/.test(text[position] ?? '')) position += 1;
  }

  function parseString() {
    if (text[position] !== '"') fail();
    position += 1;

    while (position < text.length) {
      const character = text[position];
      if (character === '"') {
        position += 1;
        return;
      }
      if (character === '\\') {
        position += 1;
        const escapeCharacter = text[position];
        if (!escapeCharacter || !'"\\/bfnrtu'.includes(escapeCharacter)) {
          fail();
        }
        if (escapeCharacter === 'u') {
          const unicodeEscape = text.slice(position + 1, position + 5);
          if (!/^[\dA-Fa-f]{4}$/.test(unicodeEscape)) fail(position + 1);
          position += 4;
        }
      } else if ((character?.charCodeAt(0) ?? 0) < 0x20) {
        fail();
      }
      position += 1;
    }

    fail(text.length);
  }

  function parseLiteral(literal: string) {
    if (text.slice(position, position + literal.length) !== literal) fail();
    position += literal.length;
  }

  function parseNumber() {
    const numberMatch = text
      .slice(position)
      .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!numberMatch) fail();
    position += numberMatch[0].length;
  }

  function parseArray() {
    position += 1;
    skipWhitespace();
    if (text[position] === ']') {
      position += 1;
      return;
    }

    while (position < text.length) {
      parseValue();
      skipWhitespace();
      if (text[position] === ']') {
        position += 1;
        return;
      }
      if (text[position] !== ',') fail();
      position += 1;
      skipWhitespace();
      if (text[position] === ']') fail();
    }

    fail(text.length);
  }

  function parseObject() {
    position += 1;
    skipWhitespace();
    if (text[position] === '}') {
      position += 1;
      return;
    }

    while (position < text.length) {
      if (text[position] !== '"') fail();
      parseString();
      skipWhitespace();
      if (text[position] !== ':') fail();
      position += 1;
      parseValue();
      skipWhitespace();
      if (text[position] === '}') {
        position += 1;
        return;
      }
      if (text[position] !== ',') fail();
      position += 1;
      skipWhitespace();
      if (text[position] === '}') fail();
    }

    fail(text.length);
  }

  function parseValue() {
    skipWhitespace();
    const character = text[position];

    if (character === '{') parseObject();
    else if (character === '[') parseArray();
    else if (character === '"') parseString();
    else if (character === 't') parseLiteral('true');
    else if (character === 'f') parseLiteral('false');
    else if (character === 'n') parseLiteral('null');
    else if (character === '-' || /\d/.test(character ?? '')) parseNumber();
    else fail();
  }

  try {
    parseValue();
    skipWhitespace();
    if (position !== text.length) fail();
    return text.length;
  } catch (error) {
    if (error instanceof JsonPositionError) return error.position;
    return text.length;
  }
}

function createJsonSyntaxError(text: string, nativeError: unknown) {
  const nativePosition =
    nativeError instanceof SyntaxError
      ? getPositionFromNativeError(nativeError.message, text)
      : undefined;
  const position = Math.max(
    0,
    Math.min(text.length, nativePosition ?? findJsonSyntaxErrorPosition(text))
  );
  const beforeError = text.slice(0, position);
  const line = beforeError.split(/\r\n|\r|\n/).length;
  const lineStart = Math.max(
    beforeError.lastIndexOf('\n'),
    beforeError.lastIndexOf('\r')
  );
  const column = position - lineStart;
  const lineText = text.split(/\r\n|\r|\n/)[line - 1] ?? '';
  const caret = `${lineText
    .slice(0, Math.max(0, column - 1))
    .replace(/[^\t]/g, ' ')}^`;

  return { caret, column, line, lineText, position };
}

export function parseJson(text: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(text) as JsonValue };
  } catch (error) {
    return { error: createJsonSyntaxError(text, error), ok: false };
  }
}

export function getJsonValueType(value: JsonValue): JsonValueType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as Exclude<JsonValueType, 'array' | 'null'>;
}

export function sortJsonKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([firstKey], [secondKey]) =>
        firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0
      )
      .map(([key, childValue]) => [key, sortJsonKeys(childValue)])
  ) as { [key: string]: JsonValue };
}

export function stringifyJson(value: JsonValue, indent: JsonIndent) {
  return JSON.stringify(value, null, indent);
}

export function getJsonStatistics(
  value: JsonValue,
  sourceText: string
): JsonStatistics {
  let keyCount = 0;
  let valueCount = 0;
  let maxDepth = 1;
  const stack: Array<{ depth: number; value: JsonValue }> = [
    { depth: 1, value },
  ];

  while (stack.length) {
    const current = stack.pop();
    if (!current) break;
    maxDepth = Math.max(maxDepth, current.depth);

    if (Array.isArray(current.value)) {
      for (const childValue of current.value) {
        stack.push({ depth: current.depth + 1, value: childValue });
      }
    } else if (current.value !== null && typeof current.value === 'object') {
      const entries = Object.entries(current.value);
      keyCount += entries.length;
      for (const [, childValue] of entries) {
        stack.push({ depth: current.depth + 1, value: childValue });
      }
    } else {
      valueCount += 1;
    }
  }

  return {
    byteCount: new TextEncoder().encode(sourceText).length,
    keyCount,
    lineCount: sourceText ? sourceText.split(/\r\n|\r|\n/).length : 0,
    maxDepth,
    rootType: getJsonValueType(value),
    valueCount,
  };
}

export function buildJsonPath(parentPath: string, key: number | string) {
  if (typeof key === 'number') return `${parentPath}[${key}]`;
  return /^[A-Z_$][\w$]*$/i.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`;
}

export function getJsonPreview(value: JsonValue, maxLength = 96) {
  let preview: string;
  if (Array.isArray(value)) preview = `[…]`;
  else if (value !== null && typeof value === 'object') preview = `{…}`;
  else preview = JSON.stringify(value);

  return preview.length > maxLength
    ? `${preview.slice(0, maxLength - 1)}…`
    : preview;
}

export function listJsonPaths(value: JsonValue, limit = 5000) {
  const paths: JsonPathEntry[] = [];
  const stack: Array<{ path: string; value: JsonValue }> = [
    { path: '$', value },
  ];

  while (stack.length && paths.length < limit) {
    const current = stack.pop();
    if (!current) break;
    paths.push({
      path: current.path,
      preview: getJsonPreview(current.value),
      type: getJsonValueType(current.value),
    });

    const entries = Array.isArray(current.value)
      ? current.value.map((childValue, index) => [index, childValue] as const)
      : current.value !== null && typeof current.value === 'object'
        ? Object.entries(current.value)
        : [];

    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const [key, childValue] = entries[index];
      stack.push({
        path: buildJsonPath(current.path, key),
        value: childValue,
      });
    }
  }

  return paths;
}

export function searchJsonPaths(
  entries: JsonPathEntry[],
  query: string,
  limit = 100
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  return entries
    .filter(entry =>
      `${entry.path}\n${entry.preview}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    )
    .slice(0, limit);
}
