import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import { UtilityToolPageLayout } from '@/pages/Tools/components/UtilityToolPageLayout';
import {
  base64ConverterSeoKey,
  base64ConverterToolId,
} from '@/pages/Tools/ToolBase64Converter/config';
import { RefreshCcw, TextCursorInput } from 'lucide-react';
import { useState } from 'react';

export function Base64Converter() {
  const { messages } = useI18n();
  const copy = messages.utilityTool;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState('');

  function convert(isEncoding: boolean) {
    try {
      setOutput(
        isEncoding
          ? window.btoa(unescape(encodeURIComponent(input)))
          : decodeURIComponent(escape(window.atob(input)))
      );
      setFeedback('');
    } catch {
      setFeedback(copy.invalidBase64);
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
    <UtilityToolPageLayout
      icon={TextCursorInput}
      seoKey={base64ConverterSeoKey}
      toolId={base64ConverterToolId}
    >
      <section className='utility-workbench'>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.input}
            <textarea
              value={input}
              placeholder={copy.base64Placeholder}
              onChange={event => {
                setInput(event.target.value);
                setFeedback('');
              }}
            />
          </label>
          <div className='utility-actions'>
            <OButton onClick={() => convert(true)} type='button'>
              {copy.encode}
            </OButton>
            <OButton
              onClick={() => convert(false)}
              type='button'
              variant='secondary'
            >
              {copy.decode}
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
    </UtilityToolPageLayout>
  );
}
