import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { useI18n } from '@/hooks/useI18n';
import {
  mockAccountFields,
  mockAccountSeoKey,
  mockAccountToolId,
} from '@/pages/Tools/ToolMockAccountGenerator/config';
import { generateMockAccount } from '@/pages/Tools/ToolMockAccountGenerator/utils/mockAccount';
import { copyTextToClipboard } from '@/utils/clipboard';
import { Check, Copy, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import './index.css';

export function MockAccountGenerator() {
  const { messages } = useI18n();
  const copy = messages.utilityTool.mockAccountGenerator;
  const [accountInfo, setAccountInfo] = useState(() =>
    generateMockAccount(copy.samples)
  );
  const [copyTarget, setCopyTarget] = useState<
    (typeof mockAccountFields)[number] | 'all' | null
  >(null);
  const [copyStatus, setCopyStatus] = useState<'success' | 'failed' | null>(
    null
  );

  // 每次替换完整资料，清除上一组的复制反馈。
  function handleGenerateButtonClick() {
    setAccountInfo(generateMockAccount(copy.samples));
    setCopyTarget(null);
    setCopyStatus(null);
  }

  // 单项只复制值，整组复制包含本地化字段名的纯文本。
  async function handleCopyButtonClick(
    target: (typeof mockAccountFields)[number] | 'all',
    value: string
  ) {
    setCopyStatus(null);
    const isCopied = await copyTextToClipboard(value);
    setCopyTarget(target);
    setCopyStatus(isCopied ? 'success' : 'failed');
  }

  return (
    <LayoutPage
      icon={Sparkles}
      seoKey={mockAccountSeoKey}
      toolId={mockAccountToolId}
    >
      <div className='mock-account-workbench'>
        <OCard
          as='section'
          aria-labelledby='mock-account-title'
          className='mock-account-panel'
          padding='lg'
          tone='brand'
        >
          <header className='mock-account-heading'>
            <h2 id='mock-account-title'>{copy.resultTitle}</h2>
            <p>{copy.resultDescription}</p>
          </header>
          <div className='mock-account-fields'>
            {mockAccountFields.map(field => {
              const label = copy.fields[field];
              const copyLabel = copy.copyField.replace('{field}', label);
              return (
                <div className='mock-account-field' key={field}>
                  <label htmlFor={`mock-account-${field}`}>{label}</label>
                  <div className='mock-account-value'>
                    {field === 'remarks' ? (
                      <textarea
                        id={`mock-account-${field}`}
                        readOnly
                        rows={3}
                        value={accountInfo[field]}
                      />
                    ) : (
                      <input
                        aria-describedby={
                          field === 'account' || field === 'name'
                            ? `mock-account-${field}-hint`
                            : undefined
                        }
                        id={`mock-account-${field}`}
                        readOnly
                        type='text'
                        value={accountInfo[field]}
                      />
                    )}
                    <OIconButton
                      aria-label={copyLabel}
                      hoverTranslate={false}
                      onClick={() =>
                        handleCopyButtonClick(field, accountInfo[field])
                      }
                      title={copyLabel}
                    >
                      {copyTarget === field && copyStatus === 'success' ? (
                        <Check size={18} aria-hidden='true' />
                      ) : (
                        <Copy size={18} aria-hidden='true' />
                      )}
                    </OIconButton>
                  </div>
                  {field === 'account' || field === 'name' ? (
                    <small id={`mock-account-${field}-hint`}>
                      {field === 'account' ? copy.accountHint : copy.nameHint}
                    </small>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p aria-atomic='true' className='mock-account-feedback' role='status'>
            {copyStatus === 'failed'
              ? copy.copyFailed
              : copyStatus === 'success' && copyTarget
                ? copy.copied.replace(
                    '{field}',
                    copyTarget === 'all'
                      ? copy.allFields
                      : copy.fields[copyTarget]
                  )
                : ''}
          </p>
        </OCard>
        <OCard
          as='aside'
          aria-labelledby='mock-account-actions-title'
          className='mock-account-summary'
          padding='lg'
          tone='soft'
        >
          <ShieldCheck size={24} aria-hidden='true' />
          <h2 id='mock-account-actions-title'>{copy.actionsTitle}</h2>
          <p>{copy.localHint}</p>
          <OButton onClick={handleGenerateButtonClick} size='lg' type='button'>
            <RefreshCw size={17} aria-hidden='true' />
            {copy.generate}
          </OButton>
          <OButton
            onClick={() =>
              handleCopyButtonClick(
                'all',
                mockAccountFields
                  .map(field => `${copy.fields[field]}: ${accountInfo[field]}`)
                  .join('\n')
              )
            }
            type='button'
            variant='secondary'
          >
            {copyTarget === 'all' && copyStatus === 'success' ? (
              <Check size={17} aria-hidden='true' />
            ) : (
              <Copy size={17} aria-hidden='true' />
            )}
            {copy.copyAll}
          </OButton>
          <p>{copy.fictionHint}</p>
        </OCard>
      </div>
    </LayoutPage>
  );
}
