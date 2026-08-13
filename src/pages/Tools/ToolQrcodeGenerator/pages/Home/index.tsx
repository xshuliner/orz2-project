import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OSelector } from '@/components/OSelector';
import { OTab } from '@/components/OTab';
import { useI18n } from '@/hooks/useI18n';
import {
  qrcodeByteLimits,
  qrcodeGeneratorSeoKey,
  qrcodeGeneratorToolId,
  type QrcodeErrorCorrectionLevel,
  type StandardQrcodeContentType,
  type WifiEncryption,
} from '@/pages/Tools/ToolQrcodeGenerator/config';
import {
  buildStandardQrcodeValue,
  getColorContrastRatio,
  getColorLuminance,
  getUtf8ByteCount,
  type StandardQrcodeForm,
} from '@/pages/Tools/ToolQrcodeGenerator/utils/qrcodeValue';
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileCode2,
  QrCode,
  RefreshCcw,
  Settings2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import './index.css';

const defaultForm: StandardQrcodeForm = {
  contentType: 'url',
  text: '',
  url: 'https://orz2.online',
  wifiName: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',
  wifiHidden: false,
  emailAddress: '',
  emailSubject: '',
  emailBody: '',
  phoneNumber: '',
  smsNumber: '',
  smsMessage: '',
};

const defaultStyle = {
  backgroundColor: '#FFFFFF',
  errorCorrectionLevel: 'M' as QrcodeErrorCorrectionLevel,
  foregroundColor: '#07130F',
  margin: 4,
  size: 320,
};

type ActionFeedback =
  | 'value-copied'
  | 'download-complete'
  | 'copy-unavailable'
  | 'export-unavailable'
  | null;

function fillTemplate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    template
  );
}

function serializeQrcode(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(clone);
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = objectUrl;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const didCopy = document.execCommand('copy');
  textarea.remove();
  if (!didCopy) throw new Error();
}

export function QrcodeGenerator() {
  const { messages } = useI18n();
  const copy = messages.utilityTool.qrcodeGenerator;
  const [form, setForm] = useState<StandardQrcodeForm>(defaultForm);
  const [size, setSize] = useState(defaultStyle.size);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<QrcodeErrorCorrectionLevel>(defaultStyle.errorCorrectionLevel);
  const [margin, setMargin] = useState(defaultStyle.margin);
  const [foregroundColor, setForegroundColor] = useState(
    defaultStyle.foregroundColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    defaultStyle.backgroundColor
  );
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  const qrcodeResult = buildStandardQrcodeValue(form);
  const qrcodeValue = qrcodeResult.value;
  const byteCount = getUtf8ByteCount(qrcodeValue);
  const byteLimit = qrcodeByteLimits[errorCorrectionLevel];
  const isContentTooLong = byteCount > byteLimit;
  const canGenerate = Boolean(qrcodeValue) && !isContentTooLong;
  const foregroundLuminance = getColorLuminance(foregroundColor);
  const backgroundLuminance = getColorLuminance(backgroundColor);
  const hasContrastRisk =
    getColorContrastRatio(foregroundColor, backgroundColor) < 4.5 ||
    foregroundLuminance >= backgroundLuminance;

  const contentError = isContentTooLong
    ? fillTemplate(copy.contentTooLong, {
        count: byteCount,
        limit: byteLimit,
      })
    : qrcodeResult.error === 'invalid-url'
      ? copy.invalidUrl
      : qrcodeResult.error === 'required'
        ? copy.contentRequired
        : null;

  const feedbackMessage = {
    'value-copied': copy.valueCopied,
    'download-complete': copy.downloadComplete,
    'copy-unavailable': copy.copyUnavailable,
    'export-unavailable': copy.exportUnavailable,
  } as const;

  const contentTypeOptions = [
    { label: copy.contentTypes.text, value: 'text' },
    { label: copy.contentTypes.url, value: 'url' },
    { label: copy.contentTypes.wifi, value: 'wifi' },
    { label: copy.contentTypes.email, value: 'email' },
    { label: copy.contentTypes.phone, value: 'phone' },
    { label: copy.contentTypes.sms, value: 'sms' },
  ];
  const wifiEncryptionOptions = [
    { label: copy.wifiEncryptionOptions.wpa, value: 'WPA' },
    { label: copy.wifiEncryptionOptions.wep, value: 'WEP' },
    { label: copy.wifiEncryptionOptions.none, value: 'nopass' },
  ] as const;
  const errorCorrectionOptions = [
    { label: copy.errorCorrectionOptions.low, value: 'L' },
    { label: copy.errorCorrectionOptions.medium, value: 'M' },
    { label: copy.errorCorrectionOptions.quartile, value: 'Q' },
    { label: copy.errorCorrectionOptions.high, value: 'H' },
  ] as const;

  function updateForm(patch: Partial<StandardQrcodeForm>) {
    setForm(current => ({ ...current, ...patch }));
    setFeedback(null);
  }

  function resetStyle() {
    setSize(defaultStyle.size);
    setErrorCorrectionLevel(defaultStyle.errorCorrectionLevel);
    setMargin(defaultStyle.margin);
    setForegroundColor(defaultStyle.foregroundColor);
    setBackgroundColor(defaultStyle.backgroundColor);
    setFeedback(null);
  }

  async function handleCopyValue() {
    if (!canGenerate) return;
    try {
      await copyText(qrcodeValue);
      setFeedback('value-copied');
    } catch {
      setFeedback('copy-unavailable');
    }
  }

  function handleDownloadSvg() {
    if (!canGenerate || !qrRef.current) return;
    try {
      const svg = serializeQrcode(qrRef.current);
      triggerDownload(
        new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
        'orz2-qrcode.svg'
      );
      setFeedback('download-complete');
    } catch {
      setFeedback('export-unavailable');
    }
  }

  function handleDownloadPng() {
    if (!canGenerate || !qrRef.current) return;
    const svgBlob = new Blob([serializeQrcode(qrRef.current)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const objectUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        setFeedback('export-unavailable');
        return;
      }
      context.drawImage(image, 0, 0, size, size);
      canvas.toBlob(blob => {
        if (!blob) {
          setFeedback('export-unavailable');
          return;
        }
        triggerDownload(blob, 'orz2-qrcode.png');
        setFeedback('download-complete');
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setFeedback('export-unavailable');
    };
    image.src = objectUrl;
  }

  function renderContentFields() {
    const validationProps = {
      'aria-describedby': contentError ? 'qrcode-content-error' : undefined,
      'aria-invalid': Boolean(contentError),
    };
    const isWifiNameMissing =
      form.contentType === 'wifi' && !form.wifiName.trim();
    const isWifiPasswordMissing =
      form.contentType === 'wifi' &&
      form.wifiEncryption !== 'nopass' &&
      !form.wifiPassword;

    switch (form.contentType) {
      case 'text':
        return (
          <label className='qrcode-field qrcode-field--full'>
            <span>{copy.textLabel}</span>
            <textarea
              {...validationProps}
              value={form.text}
              placeholder={copy.textPlaceholder}
              onChange={event => updateForm({ text: event.target.value })}
            />
          </label>
        );
      case 'url':
        return (
          <label className='qrcode-field qrcode-field--full'>
            <span>{copy.urlLabel}</span>
            <input
              {...validationProps}
              inputMode='url'
              type='url'
              value={form.url}
              placeholder={copy.urlPlaceholder}
              onChange={event => updateForm({ url: event.target.value })}
            />
          </label>
        );
      case 'wifi':
        return (
          <>
            <label className='qrcode-field qrcode-field--full'>
              <span>{copy.wifiNameLabel}</span>
              <input
                aria-describedby={
                  isWifiNameMissing ? 'qrcode-content-error' : undefined
                }
                aria-invalid={isWifiNameMissing}
                value={form.wifiName}
                placeholder={copy.wifiNamePlaceholder}
                onChange={event => updateForm({ wifiName: event.target.value })}
              />
            </label>
            <div className='qrcode-field'>
              <span>{copy.wifiEncryptionLabel}</span>
              <OSelector<WifiEncryption>
                ariaLabel={copy.wifiEncryptionLabel}
                options={wifiEncryptionOptions}
                value={form.wifiEncryption}
                onChange={wifiEncryption => updateForm({ wifiEncryption })}
              />
            </div>
            <label className='qrcode-field'>
              <span>{copy.wifiPasswordLabel}</span>
              <input
                aria-describedby={
                  isWifiPasswordMissing ? 'qrcode-content-error' : undefined
                }
                aria-invalid={isWifiPasswordMissing}
                disabled={form.wifiEncryption === 'nopass'}
                type='text'
                value={form.wifiPassword}
                placeholder={copy.wifiPasswordPlaceholder}
                onChange={event =>
                  updateForm({ wifiPassword: event.target.value })
                }
              />
            </label>
            <label className='qrcode-checkbox qrcode-field--full'>
              <input
                checked={form.wifiHidden}
                type='checkbox'
                onChange={event =>
                  updateForm({ wifiHidden: event.target.checked })
                }
              />
              <span>{copy.wifiHiddenLabel}</span>
            </label>
          </>
        );
      case 'email':
        return (
          <>
            <label className='qrcode-field'>
              <span>{copy.emailAddressLabel}</span>
              <input
                {...validationProps}
                inputMode='email'
                type='email'
                value={form.emailAddress}
                placeholder={copy.emailAddressPlaceholder}
                onChange={event =>
                  updateForm({ emailAddress: event.target.value })
                }
              />
            </label>
            <label className='qrcode-field'>
              <span>{copy.emailSubjectLabel}</span>
              <input
                value={form.emailSubject}
                placeholder={copy.emailSubjectPlaceholder}
                onChange={event =>
                  updateForm({ emailSubject: event.target.value })
                }
              />
            </label>
            <label className='qrcode-field qrcode-field--full'>
              <span>{copy.emailBodyLabel}</span>
              <textarea
                value={form.emailBody}
                placeholder={copy.emailBodyPlaceholder}
                onChange={event =>
                  updateForm({ emailBody: event.target.value })
                }
              />
            </label>
          </>
        );
      case 'phone':
        return (
          <label className='qrcode-field qrcode-field--full'>
            <span>{copy.phoneNumberLabel}</span>
            <input
              {...validationProps}
              inputMode='tel'
              type='tel'
              value={form.phoneNumber}
              placeholder={copy.phoneNumberPlaceholder}
              onChange={event =>
                updateForm({ phoneNumber: event.target.value })
              }
            />
          </label>
        );
      case 'sms':
        return (
          <>
            <label className='qrcode-field qrcode-field--full'>
              <span>{copy.smsNumberLabel}</span>
              <input
                {...validationProps}
                inputMode='tel'
                type='tel'
                value={form.smsNumber}
                placeholder={copy.smsNumberPlaceholder}
                onChange={event =>
                  updateForm({ smsNumber: event.target.value })
                }
              />
            </label>
            <label className='qrcode-field qrcode-field--full'>
              <span>{copy.smsMessageLabel}</span>
              <textarea
                value={form.smsMessage}
                placeholder={copy.smsMessagePlaceholder}
                onChange={event =>
                  updateForm({ smsMessage: event.target.value })
                }
              />
            </label>
          </>
        );
    }
  }

  return (
    <LayoutPage
      icon={QrCode}
      seoKey={qrcodeGeneratorSeoKey}
      toolId={qrcodeGeneratorToolId}
    >
      <div className='qrcode-workbench'>
        <div className='qrcode-workbench__controls'>
          <OCard
            as='section'
            aria-labelledby='qrcode-content-heading'
            className='qrcode-panel'
            padding='lg'
          >
            <header className='qrcode-panel__heading'>
              <div>
                <h2 id='qrcode-content-heading'>{copy.contentSectionTitle}</h2>
                <p>{copy.contentSectionDescription}</p>
              </div>
              <QrCode size={20} aria-hidden='true' />
            </header>

            <div className='qrcode-content-type'>
              <span>{copy.contentTypeLabel}</span>
              <OTab
                ariaLabel={copy.contentTypeLabel}
                className='qrcode-content-tabs'
                options={contentTypeOptions}
                value={form.contentType}
                onChange={value =>
                  updateForm({
                    contentType: value as StandardQrcodeContentType,
                  })
                }
              />
            </div>

            <div className='qrcode-fields'>{renderContentFields()}</div>
            {contentError ? (
              <p
                className='qrcode-inline-message is-error'
                id='qrcode-content-error'
                role='alert'
              >
                <AlertTriangle size={16} aria-hidden='true' />
                {contentError}
              </p>
            ) : null}

            <div className='qrcode-value-block'>
              <div className='qrcode-value-block__heading'>
                <div>
                  <h3>{copy.encodedValueTitle}</h3>
                  <p>{copy.encodedValueDescription}</p>
                </div>
                <OButton
                  disabled={!canGenerate}
                  size='sm'
                  type='button'
                  variant='ghost'
                  onClick={handleCopyValue}
                >
                  <Clipboard size={15} aria-hidden='true' />
                  {copy.copyValue}
                </OButton>
              </div>
              <code>{qrcodeValue || copy.contentRequired}</code>
              <span className={isContentTooLong ? 'is-error' : undefined}>
                {fillTemplate(copy.byteCount, {
                  count: byteCount,
                  limit: byteLimit,
                })}
              </span>
            </div>
          </OCard>

          <OCard
            as='section'
            aria-labelledby='qrcode-customization-heading'
            className='qrcode-panel'
            padding='lg'
          >
            <header className='qrcode-panel__heading'>
              <div>
                <h2 id='qrcode-customization-heading'>
                  {copy.customizationTitle}
                </h2>
                <p>{copy.customizationDescription}</p>
              </div>
              <Settings2 size={20} aria-hidden='true' />
            </header>

            <div className='qrcode-style-grid'>
              <label className='qrcode-field qrcode-field--range'>
                <span>
                  {copy.sizeLabel}
                  <output>{size}</output>
                </span>
                <input
                  max='1024'
                  min='128'
                  step='16'
                  type='range'
                  value={size}
                  onChange={event => setSize(Number(event.target.value))}
                />
              </label>
              <label className='qrcode-field qrcode-field--range'>
                <span>
                  {copy.marginLabel}
                  <output>{margin}</output>
                </span>
                <input
                  max='8'
                  min='0'
                  step='1'
                  type='range'
                  value={margin}
                  onChange={event => setMargin(Number(event.target.value))}
                />
              </label>
              <div className='qrcode-field'>
                <span>{copy.errorCorrectionLabel}</span>
                <OSelector<QrcodeErrorCorrectionLevel>
                  ariaLabel={copy.errorCorrectionLabel}
                  options={errorCorrectionOptions}
                  value={errorCorrectionLevel}
                  onChange={setErrorCorrectionLevel}
                />
              </div>
              <label className='qrcode-field qrcode-field--color'>
                <span>{copy.foregroundColorLabel}</span>
                <span className='qrcode-color-control'>
                  <input
                    aria-label={copy.foregroundColorLabel}
                    type='color'
                    value={foregroundColor}
                    onChange={event => setForegroundColor(event.target.value)}
                  />
                  <code>{foregroundColor.toUpperCase()}</code>
                </span>
              </label>
              <label className='qrcode-field qrcode-field--color'>
                <span>{copy.backgroundColorLabel}</span>
                <span className='qrcode-color-control'>
                  <input
                    aria-label={copy.backgroundColorLabel}
                    type='color'
                    value={backgroundColor}
                    onChange={event => setBackgroundColor(event.target.value)}
                  />
                  <code>{backgroundColor.toUpperCase()}</code>
                </span>
              </label>
            </div>

            {hasContrastRisk ? (
              <p className='qrcode-inline-message is-warning'>
                <AlertTriangle size={16} aria-hidden='true' />
                {copy.contrastWarning}
              </p>
            ) : null}
            <OButton
              className='qrcode-reset-button'
              size='sm'
              type='button'
              variant='ghost'
              onClick={resetStyle}
            >
              <RefreshCcw size={15} aria-hidden='true' />
              {copy.resetStyle}
            </OButton>
          </OCard>
        </div>

        <OCard
          as='section'
          aria-labelledby='qrcode-preview-heading'
          className='qrcode-panel qrcode-preview-panel'
          padding='lg'
        >
          <header className='qrcode-panel__heading'>
            <div>
              <h2 id='qrcode-preview-heading'>{copy.previewTitle}</h2>
              <p>{copy.previewDescription}</p>
            </div>
          </header>

          <div
            className={['qrcode-preview', !canGenerate ? 'is-empty' : undefined]
              .filter(Boolean)
              .join(' ')}
            style={{ backgroundColor }}
          >
            {canGenerate ? (
              <QRCodeSVG
                ref={qrRef}
                bgColor={backgroundColor}
                fgColor={foregroundColor}
                level={errorCorrectionLevel}
                marginSize={margin}
                size={size}
                title={copy.qrCodeTitle}
                value={qrcodeValue}
              />
            ) : (
              <div className='qrcode-preview__empty'>
                <QrCode size={48} aria-hidden='true' />
                <p>{contentError}</p>
              </div>
            )}
          </div>

          <div className='qrcode-preview-actions'>
            <OButton
              disabled={!canGenerate}
              type='button'
              onClick={handleDownloadPng}
            >
              <Download size={16} aria-hidden='true' />
              {copy.downloadPng}
            </OButton>
            <OButton
              disabled={!canGenerate}
              type='button'
              variant='secondary'
              onClick={handleDownloadSvg}
            >
              <FileCode2 size={16} aria-hidden='true' />
              {copy.downloadSvg}
            </OButton>
          </div>

          {feedback ? (
            <p
              className={[
                'qrcode-action-feedback',
                feedback.endsWith('unavailable') ? 'is-error' : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              role='status'
            >
              {feedback.endsWith('unavailable') ? (
                <AlertTriangle size={16} aria-hidden='true' />
              ) : (
                <CheckCircle2 size={16} aria-hidden='true' />
              )}
              {feedbackMessage[feedback]}
            </p>
          ) : null}
        </OCard>
      </div>
    </LayoutPage>
  );
}
