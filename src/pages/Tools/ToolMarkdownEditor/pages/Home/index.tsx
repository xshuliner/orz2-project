import { LayoutPage } from '@/components/LayoutPage';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import {
  markdownEditorSeoKey,
  markdownEditorToolId,
} from '@/pages/Tools/ToolMarkdownEditor/config';
import { Clipboard } from 'lucide-react';
import { useState, type ReactNode } from 'react';

function renderMarkdown(source: string) {
  const nodes: ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  source.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        nodes.push(<pre key={`code-${index}`}>{codeLines.join('\n')}</pre>);
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }
    if (line.startsWith('# ')) nodes.push(<h2 key={index}>{line.slice(2)}</h2>);
    else if (line.startsWith('## '))
      nodes.push(<h3 key={index}>{line.slice(3)}</h3>);
    else if (line.startsWith('- '))
      nodes.push(<li key={index}>{line.slice(2)}</li>);
    else if (line.startsWith('> '))
      nodes.push(<blockquote key={index}>{line.slice(2)}</blockquote>);
    else if (line) nodes.push(<p key={index}>{line}</p>);
  });
  if (codeLines.length)
    nodes.push(<pre key='code-final'>{codeLines.join('\n')}</pre>);
  return nodes;
}

export function MarkdownEditor() {
  const { messages } = useI18n();
  const copy = messages.utilityTool;
  const [input, setInput] = useState<string>(copy.markdownPlaceholder);

  return (
    <LayoutPage
      icon={Clipboard}
      seoKey={markdownEditorSeoKey}
      toolId={markdownEditorToolId}
    >
      <section className='utility-workbench'>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.input}
            <textarea
              value={input}
              placeholder={copy.markdownPlaceholder}
              onChange={event => setInput(event.target.value)}
            />
          </label>
        </OCard>
        <OCard as='section' className='utility-card' padding='lg'>
          <h2>{copy.preview}</h2>
          <p className='utility-markdown-hint'>{copy.markdownHint}</p>
          <div className='utility-markdown-preview'>
            {renderMarkdown(input)}
          </div>
        </OCard>
      </section>
    </LayoutPage>
  );
}
