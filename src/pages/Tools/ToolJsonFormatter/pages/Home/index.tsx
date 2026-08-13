import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import { JsonTreeView } from '@/pages/Tools/ToolJsonFormatter/components/JsonTreeView';
import {
  jsonFormatterSeoKey,
  jsonFormatterToolId,
} from '@/pages/Tools/ToolJsonFormatter/config';
import {
  getJsonStatistics,
  listJsonPaths,
  parseJson,
  searchJsonPaths,
  sortJsonKeys,
  stringifyJson,
  type JsonIndent,
  type JsonSyntaxError,
  type JsonValue,
} from '@/pages/Tools/ToolJsonFormatter/utils/jsonWorkbench';
import {
  ArrowDownAZ,
  Braces,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileUp,
  ListTree,
  Minimize2,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import './index.css';

const maximumFileSize = 5 * 1024 * 1024;

type JsonStatusKey =
  | 'copied'
  | 'fileLoaded'
  | 'formatted'
  | 'minified'
  | 'pathCopied'
  | 'sorted'
  | 'valid';

type JsonErrorKey =
  | 'copyFailed'
  | 'empty'
  | 'fileReadFailed'
  | 'fileTooLarge'
  | 'syntax';

type JsonFeedback =
  | { detail?: string; key: JsonErrorKey; tone: 'error' }
  | { detail?: string; key: JsonStatusKey; tone: 'success' };

interface JsonDiagnostic {
  error: JsonSyntaxError;
  target: 'output' | 'source';
}

export function JsonFormatter() {
  const { locale, messages } = useI18n();
  const copy = messages.utilityTool.jsonFormatter;
  const [sourceText, setSourceText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<JsonFeedback | null>(null);
  const sourceEditorRef = useRef<HTMLTextAreaElement>(null);
  const outputEditorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceParseResult = useMemo(
    () => (sourceText.trim() ? parseJson(sourceText) : null),
    [sourceText]
  );
  const outputParseResult = useMemo(
    () => (outputText.trim() ? parseJson(outputText) : null),
    [outputText]
  );
  const inspectionText = outputText.trim() ? outputText : sourceText;
  const inspectionParseResult = outputText.trim()
    ? outputParseResult
    : sourceParseResult;
  const inspectionValue =
    inspectionParseResult?.ok === true
      ? inspectionParseResult.value
      : undefined;
  const statistics = useMemo(
    () =>
      inspectionValue === undefined
        ? null
        : getJsonStatistics(inspectionValue, inspectionText),
    [inspectionText, inspectionValue]
  );
  const jsonPaths = useMemo(
    () => (inspectionValue === undefined ? [] : listJsonPaths(inspectionValue)),
    [inspectionValue]
  );
  const searchResults = useMemo(
    () => searchJsonPaths(jsonPaths, searchQuery),
    [jsonPaths, searchQuery]
  );
  const diagnostic: JsonDiagnostic | null =
    sourceParseResult?.ok === false
      ? { error: sourceParseResult.error, target: 'source' }
      : outputParseResult?.ok === false
        ? { error: outputParseResult.error, target: 'output' }
        : null;
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale]
  );

  function getSourceValue() {
    if (!sourceText.trim()) {
      setFeedback({ key: 'empty', tone: 'error' });
      return undefined;
    }
    if (!sourceParseResult?.ok) {
      setFeedback({ key: 'syntax', tone: 'error' });
      return undefined;
    }
    return sourceParseResult.value;
  }

  function transformSource(
    action: 'format' | 'minify' | 'sort',
    transform: (value: JsonValue) => string
  ) {
    const value = getSourceValue();
    if (value === undefined) return;

    setOutputText(transform(value));
    setSearchQuery('');
    setFeedback({
      key: {
        format: 'formatted',
        minify: 'minified',
        sort: 'sorted',
      }[action] as JsonStatusKey,
      tone: 'success',
    });
  }

  function handleSourceChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setSourceText(event.target.value);
    setOutputText('');
    setSearchQuery('');
    setFeedback(null);
  }

  function handleOutputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setOutputText(event.target.value);
    setSearchQuery('');
    setFeedback(null);
  }

  function handleEditorTab(
    event: KeyboardEvent<HTMLTextAreaElement>,
    setText: (text: string) => void
  ) {
    if (
      event.key !== 'Tab' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    const editor = event.currentTarget;
    const insertedIndent = indent === '\t' ? '\t' : ' '.repeat(indent);
    const nextText = `${editor.value.slice(0, editor.selectionStart)}${insertedIndent}${editor.value.slice(editor.selectionEnd)}`;
    const nextCursorPosition = editor.selectionStart + insertedIndent.length;
    setText(nextText);
    setFeedback(null);
    requestAnimationFrame(() => {
      editor.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  function validateSource() {
    if (getSourceValue() === undefined) return;
    setFeedback({ key: 'valid', tone: 'success' });
  }

  function loadSample() {
    setSourceText(copy.sample);
    setOutputText('');
    setSearchQuery('');
    setFeedback(null);
  }

  function clearWorkspace() {
    setSourceText('');
    setOutputText('');
    setSearchQuery('');
    setFeedback(null);
    sourceEditorRef.current?.focus();
  }

  async function loadJsonFile(event: ChangeEvent<HTMLInputElement>) {
    const fileInput = event.currentTarget;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (file.size > maximumFileSize) {
      setFeedback({ key: 'fileTooLarge', tone: 'error' });
      fileInput.value = '';
      return;
    }

    try {
      const fileText = await file.text();
      setSourceText(fileText);
      setOutputText('');
      setSearchQuery('');
      setFeedback({ detail: file.name, key: 'fileLoaded', tone: 'success' });
    } catch {
      setFeedback({ key: 'fileReadFailed', tone: 'error' });
    } finally {
      fileInput.value = '';
    }
  }

  async function writeClipboard(
    text: string,
    statusKey: Extract<JsonStatusKey, 'copied' | 'pathCopied'>
  ) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ key: statusKey, tone: 'success' });
    } catch {
      setFeedback({ key: 'copyFailed', tone: 'error' });
    }
  }

  function downloadJson() {
    if (!inspectionParseResult?.ok) return;

    const blobUrl = URL.createObjectURL(
      new Blob([inspectionText], { type: 'application/json;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.download = copy.downloadFilename;
    link.href = blobUrl;
    document.body.append(link);
    link.click();
    link.remove();
    requestAnimationFrame(() => URL.revokeObjectURL(blobUrl));
  }

  function locateSyntaxError() {
    if (!diagnostic) return;
    const editor =
      diagnostic.target === 'source'
        ? sourceEditorRef.current
        : outputEditorRef.current;
    if (!editor) return;

    editor.focus();
    editor.setSelectionRange(
      diagnostic.error.position,
      Math.min(diagnostic.error.position + 1, editor.value.length)
    );
    editor.scrollIntoView({ block: 'nearest' });
  }

  const feedbackMessage = feedback
    ? feedback.tone === 'success'
      ? copy.status[feedback.key]
      : copy.errors[feedback.key]
    : '';

  return (
    <LayoutPage
      icon={Braces}
      seoKey={jsonFormatterSeoKey}
      toolId={jsonFormatterToolId}
    >
      <div className='json-workbench'>
        <OCard
          aria-labelledby='json-workspace-title'
          as='section'
          className='json-workspace-toolbar'
          padding='lg'
          tone='soft'
        >
          <div className='json-section-heading'>
            <div className='json-section-heading__icon' aria-hidden='true'>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id='json-workspace-title'>{copy.workspaceTitle}</h2>
              <p>{copy.workspaceDescription}</p>
            </div>
          </div>
          <div className='json-toolbar-controls'>
            <label className='json-indent-control'>
              <span>{copy.indentLabel}</span>
              <select
                value={indent}
                onChange={event => {
                  const nextIndent = event.target.value;
                  setIndent(
                    nextIndent === '\t' ? '\t' : nextIndent === '4' ? 4 : 2
                  );
                }}
              >
                <option value='2'>{copy.indentOptions.twoSpaces}</option>
                <option value='4'>{copy.indentOptions.fourSpaces}</option>
                <option value={'\t'}>{copy.indentOptions.tab}</option>
              </select>
            </label>
            <div className='json-toolbar-actions'>
              <OButton
                onClick={loadSample}
                size='sm'
                type='button'
                variant='ghost'
              >
                <Braces size={15} aria-hidden='true' />
                {copy.actions.loadSample}
              </OButton>
              <OButton
                onClick={() => fileInputRef.current?.click()}
                size='sm'
                type='button'
                variant='secondary'
              >
                <FileUp size={15} aria-hidden='true' />
                {copy.actions.upload}
              </OButton>
              <input
                ref={fileInputRef}
                className='sr-only'
                type='file'
                accept='.json,application/json,text/json'
                onChange={loadJsonFile}
              />
              <OButton
                disabled={!sourceText && !outputText}
                onClick={clearWorkspace}
                size='sm'
                type='button'
                variant='ghost'
              >
                <Trash2 size={15} aria-hidden='true' />
                {copy.actions.clear}
              </OButton>
            </div>
          </div>
        </OCard>

        <section aria-label={copy.workspaceTitle} className='json-editor-grid'>
          <OCard
            aria-labelledby='json-source-title'
            as='section'
            className='json-editor-card'
            padding='lg'
          >
            <header className='json-editor-header'>
              <div>
                <h2 id='json-source-title'>{copy.editor.sourceTitle}</h2>
                <p>{copy.editor.sourceDescription}</p>
              </div>
              {sourceParseResult ? (
                <span
                  className={`json-validity json-validity--${sourceParseResult.ok ? 'valid' : 'invalid'}`}
                >
                  {sourceParseResult.ok ? (
                    <CheckCircle2 size={14} aria-hidden='true' />
                  ) : null}
                  {sourceParseResult.ok
                    ? copy.status.valid
                    : copy.errors.syntax}
                </span>
              ) : null}
            </header>
            <textarea
              ref={sourceEditorRef}
              aria-describedby={
                diagnostic?.target === 'source' ? 'json-error-title' : undefined
              }
              aria-invalid={sourceParseResult?.ok === false}
              aria-label={copy.editor.sourceTitle}
              className='json-editor'
              placeholder={copy.editor.sourcePlaceholder}
              spellCheck='false'
              value={sourceText}
              onChange={handleSourceChange}
              onKeyDown={event =>
                handleEditorTab(event, text => {
                  setSourceText(text);
                  setOutputText('');
                  setSearchQuery('');
                })
              }
            />
            <div className='json-editor-actions'>
              <OButton
                onClick={() =>
                  transformSource('format', value =>
                    stringifyJson(value, indent)
                  )
                }
                size='sm'
                type='button'
              >
                <Braces size={15} aria-hidden='true' />
                {copy.actions.format}
              </OButton>
              <OButton
                onClick={() =>
                  transformSource('minify', value => JSON.stringify(value))
                }
                size='sm'
                type='button'
                variant='secondary'
              >
                <Minimize2 size={15} aria-hidden='true' />
                {copy.actions.minify}
              </OButton>
              <OButton
                onClick={validateSource}
                size='sm'
                type='button'
                variant='ghost'
              >
                <CheckCircle2 size={15} aria-hidden='true' />
                {copy.actions.validate}
              </OButton>
              <OButton
                onClick={() =>
                  transformSource('sort', value =>
                    stringifyJson(sortJsonKeys(value), indent)
                  )
                }
                size='sm'
                type='button'
                variant='ghost'
              >
                <ArrowDownAZ size={15} aria-hidden='true' />
                {copy.actions.sortKeys}
              </OButton>
            </div>
          </OCard>

          <OCard
            aria-labelledby='json-output-title'
            as='section'
            className='json-editor-card'
            padding='lg'
          >
            <header className='json-editor-header'>
              <div>
                <h2 id='json-output-title'>{copy.editor.outputTitle}</h2>
                <p>{copy.editor.outputDescription}</p>
              </div>
              {outputParseResult ? (
                <span
                  className={`json-validity json-validity--${outputParseResult.ok ? 'valid' : 'invalid'}`}
                >
                  {outputParseResult.ok ? (
                    <CheckCircle2 size={14} aria-hidden='true' />
                  ) : null}
                  {outputParseResult.ok
                    ? copy.status.valid
                    : copy.errors.syntax}
                </span>
              ) : null}
            </header>
            <textarea
              ref={outputEditorRef}
              aria-describedby={
                diagnostic?.target === 'output' ? 'json-error-title' : undefined
              }
              aria-invalid={outputParseResult?.ok === false}
              aria-label={copy.editor.outputTitle}
              className='json-editor'
              placeholder={copy.editor.outputPlaceholder}
              spellCheck='false'
              value={outputText}
              onChange={handleOutputChange}
              onKeyDown={event => handleEditorTab(event, setOutputText)}
            />
            <div className='json-editor-actions'>
              <OButton
                disabled={!outputText}
                onClick={() => writeClipboard(outputText, 'copied')}
                size='sm'
                type='button'
                variant='secondary'
              >
                <Copy size={15} aria-hidden='true' />
                {copy.actions.copy}
              </OButton>
              <OButton
                disabled={!inspectionParseResult?.ok}
                onClick={downloadJson}
                size='sm'
                type='button'
                variant='ghost'
              >
                <Download size={15} aria-hidden='true' />
                {copy.actions.download}
              </OButton>
            </div>
          </OCard>
        </section>

        <div
          aria-live={feedback?.tone === 'error' ? 'assertive' : 'polite'}
          className={`json-feedback${feedback ? ` json-feedback--${feedback.tone}` : ''}`}
          role={feedback?.tone === 'error' ? 'alert' : 'status'}
        >
          {feedback ? (
            <>
              {feedbackMessage}
              {feedback.detail ? <code>{feedback.detail}</code> : null}
            </>
          ) : null}
        </div>

        {diagnostic ? (
          <OCard
            aria-labelledby='json-error-title'
            as='section'
            className='json-error-panel'
            padding='lg'
            tone='danger'
          >
            <div className='json-error-panel__content'>
              <div>
                <h2 id='json-error-title'>{copy.errorPanel.title}</h2>
                <p>{copy.errorPanel.description}</p>
              </div>
              <dl className='json-error-position'>
                <div>
                  <dt>{copy.errorPanel.line}</dt>
                  <dd>{numberFormatter.format(diagnostic.error.line)}</dd>
                </div>
                <div>
                  <dt>{copy.errorPanel.column}</dt>
                  <dd>{numberFormatter.format(diagnostic.error.column)}</dd>
                </div>
                <div>
                  <dt>{copy.errorPanel.character}</dt>
                  <dd>{numberFormatter.format(diagnostic.error.position)}</dd>
                </div>
              </dl>
            </div>
            <div className='json-error-excerpt'>
              <span>{copy.errorPanel.excerptLabel}</span>
              <pre>
                <code>{`${diagnostic.error.lineText}\n${diagnostic.error.caret}`}</code>
              </pre>
            </div>
            <OButton
              onClick={locateSyntaxError}
              size='sm'
              type='button'
              variant='secondary'
            >
              <Eye size={15} aria-hidden='true' />
              {copy.actions.locateError}
            </OButton>
          </OCard>
        ) : null}

        <OCard
          aria-labelledby='json-statistics-title'
          as='section'
          className='json-insight-card'
          padding='lg'
        >
          <div className='json-section-heading'>
            <div className='json-section-heading__icon' aria-hidden='true'>
              <Braces size={20} />
            </div>
            <div>
              <h2 id='json-statistics-title'>{copy.stats.title}</h2>
              <p>{copy.stats.description}</p>
            </div>
          </div>
          <dl className='json-statistics'>
            {(
              [
                [
                  copy.stats.rootType,
                  statistics ? copy.types[statistics.rootType] : '—',
                ],
                [
                  copy.stats.keys,
                  statistics
                    ? numberFormatter.format(statistics.keyCount)
                    : '—',
                ],
                [
                  copy.stats.values,
                  statistics
                    ? numberFormatter.format(statistics.valueCount)
                    : '—',
                ],
                [
                  copy.stats.depth,
                  statistics
                    ? numberFormatter.format(statistics.maxDepth)
                    : '—',
                ],
                [
                  copy.stats.bytes,
                  statistics
                    ? numberFormatter.format(statistics.byteCount)
                    : '—',
                ],
                [
                  copy.stats.lines,
                  statistics
                    ? numberFormatter.format(statistics.lineCount)
                    : '—',
                ],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </OCard>

        <OCard
          aria-labelledby='json-inspector-title'
          as='section'
          className='json-insight-card json-inspector'
          padding='lg'
        >
          <div className='json-inspector-header'>
            <div className='json-section-heading'>
              <div className='json-section-heading__icon' aria-hidden='true'>
                <ListTree size={20} />
              </div>
              <div>
                <h2 id='json-inspector-title'>{copy.inspector.title}</h2>
                <p>{copy.inspector.description}</p>
              </div>
            </div>
            <label className='json-search-field'>
              <span>{copy.inspector.searchLabel}</span>
              <span className='json-search-field__control'>
                <Search size={17} aria-hidden='true' />
                <input
                  disabled={inspectionValue === undefined}
                  placeholder={copy.inspector.searchPlaceholder}
                  type='search'
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                />
              </span>
            </label>
          </div>

          {inspectionValue === undefined ? (
            <p className='json-inspector-empty'>{copy.inspector.empty}</p>
          ) : searchQuery.trim() ? (
            <div className='json-search-results'>
              <h3>
                {copy.inspector.searchResults}{' '}
                <span>{numberFormatter.format(searchResults.length)}</span>
              </h3>
              {searchResults.length ? (
                <ul>
                  {searchResults.map(entry => (
                    <li key={entry.path}>
                      <div>
                        <code className='json-search-results__path'>
                          {entry.path}
                        </code>
                        <span className='json-search-results__preview'>
                          {copy.types[entry.type]} · {entry.preview}
                        </span>
                      </div>
                      <OButton
                        aria-label={`${copy.actions.copyPath} ${entry.path}`}
                        onClick={() => writeClipboard(entry.path, 'pathCopied')}
                        size='sm'
                        type='button'
                        variant='ghost'
                      >
                        <Copy size={14} aria-hidden='true' />
                        {copy.actions.copyPath}
                      </OButton>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='json-inspector-empty'>
                  {copy.inspector.noSearchResults}
                </p>
              )}
            </div>
          ) : (
            <div className='json-tree-panel'>
              <h3>{copy.inspector.treeLabel}</h3>
              <JsonTreeView
                labels={{
                  moreItems: copy.inspector.moreItems,
                  rootLabel: copy.inspector.rootLabel,
                  types: copy.types,
                }}
                value={inspectionValue}
              />
            </div>
          )}
        </OCard>
      </div>
    </LayoutPage>
  );
}
