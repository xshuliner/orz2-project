import { LayoutToolPage } from '@/components/LayoutToolPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import {
  jsonFormatterSeoKey,
  jsonFormatterToolId,
} from '@/pages/Tools/ToolJsonFormatter/config';
import { Braces, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

export function JsonFormatter() {
  const { messages } = useI18n();
  const copy = messages.utilityTool;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState('');

  function formatJson(isMinified: boolean) {
    try {
      const value = JSON.parse(input);
      setOutput(
        isMinified ? JSON.stringify(value) : JSON.stringify(value, null, 2)
      );
      setFeedback('');
    } catch {
      setFeedback(copy.invalidJson);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setFeedback(copy.copied);
  }

  function clear() {
    setInput('');
    setOutput('');
    setFeedback('');
  }

  return (
    <LayoutToolPage
      icon={Braces}
      seoKey={jsonFormatterSeoKey}
      toolId={jsonFormatterToolId}
    >
      <section className='utility-workbench'>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.input}
            <textarea
              value={input}
              placeholder={copy.jsonPlaceholder}
              onChange={event => {
                setInput(event.target.value);
                setFeedback('');
              }}
            />
          </label>
          <div className='utility-actions'>
            <OButton onClick={() => formatJson(false)} type='button'>
              {copy.format}
            </OButton>
            <OButton
              onClick={() => formatJson(true)}
              type='button'
              variant='secondary'
            >
              {copy.minify}
            </OButton>
            <OButton onClick={clear} type='button' variant='ghost'>
              <RefreshCcw size={15} aria-hidden='true' />
              {copy.clear}
            </OButton>
          </div>
        </OCard>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.output}
            <textarea readOnly value={output} />
          </label>
          <OButton
            disabled={!output}
            onClick={copyOutput}
            type='button'
            variant='secondary'
          >
            {copy.copy}
          </OButton>
        </OCard>
      </section>
      {feedback ? (
        <p className='utility-feedback' role='alert'>
          {feedback}
        </p>
      ) : null}
    </LayoutToolPage>
  );
}
