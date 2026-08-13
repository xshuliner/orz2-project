import {
  buildJsonPath,
  getJsonPreview,
  getJsonValueType,
  type JsonValue,
  type JsonValueType,
} from '@/pages/Tools/ToolJsonFormatter/utils/jsonWorkbench';

const visibleChildLimit = 100;

interface JsonTreeLabels {
  moreItems: string;
  rootLabel: string;
  types: Record<JsonValueType, string>;
}

interface JsonTreeNodeProps {
  depth: number;
  labels: JsonTreeLabels;
  name: number | string;
  path: string;
  value: JsonValue;
}

function JsonTreeNode({ depth, labels, name, path, value }: JsonTreeNodeProps) {
  const type = getJsonValueType(value);
  const isCollection = type === 'array' || type === 'object';

  if (!isCollection) {
    return (
      <li className='json-tree__leaf'>
        <code className='json-tree__key'>{name}</code>
        <span aria-hidden='true'>:</span>
        <code className={`json-tree__value json-tree__value--${type}`}>
          {getJsonPreview(value)}
        </code>
      </li>
    );
  }

  const entries: ReadonlyArray<readonly [number | string, JsonValue]> =
    Array.isArray(value)
      ? value.map((childValue, index) => [index, childValue] as const)
      : value !== null && typeof value === 'object'
        ? Object.entries(value)
        : [];
  const visibleEntries = entries.slice(0, visibleChildLimit);
  const hiddenCount = entries.length - visibleEntries.length;

  return (
    <li className='json-tree__branch'>
      <details open={depth < 1}>
        <summary>
          <code className='json-tree__key'>{name}</code>
          <span className='json-tree__summary-meta'>
            {labels.types[type]} · {entries.length}
          </span>
        </summary>
        <ul>
          {visibleEntries.map(([key, childValue]) => (
            <JsonTreeNode
              depth={depth + 1}
              key={String(key)}
              labels={labels}
              name={key}
              path={buildJsonPath(path, key)}
              value={childValue}
            />
          ))}
          {hiddenCount > 0 ? (
            <li className='json-tree__more'>
              {labels.moreItems} {hiddenCount}
            </li>
          ) : null}
        </ul>
      </details>
    </li>
  );
}

interface JsonTreeViewProps {
  labels: JsonTreeLabels;
  value: JsonValue;
}

export function JsonTreeView({ labels, value }: JsonTreeViewProps) {
  return (
    <ul className='json-tree'>
      <JsonTreeNode
        depth={0}
        labels={labels}
        name={labels.rootLabel}
        path='$'
        value={value}
      />
    </ul>
  );
}
