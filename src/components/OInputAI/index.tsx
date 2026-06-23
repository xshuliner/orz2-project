import {
  postPolishContent,
  type PostPolishContentMode,
  type PostPolishContentResult,
} from '@/api';
import { OButton } from '@/components/OButton';
import { useI18n } from '@/i18n';
import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type Ref,
  type TextareaHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import './index.css';

type OInputAIBaseProps = {
  className?: string;
  controlClassName?: string;
  disabledPolish?: boolean;
  onPolishError?: (message: string) => void;
  onPolishSuccess?: (result: PostPolishContentResult) => void;
  onValueChange: (value: string) => void;
  polishMode: PostPolishContentMode;
  value: string;
};

export type OInputAIInputProps = OInputAIBaseProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'children' | 'className' | 'onChange' | 'value'
  > & {
    as?: 'input';
  };

export type OInputAITextareaProps = OInputAIBaseProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'children' | 'className' | 'onChange' | 'value'
  > & {
    as: 'textarea';
  };

export type OInputAIProps = OInputAIInputProps | OInputAITextareaProps;

type PolishSnapshot = {
  before: string;
  after: string;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const OInputAI = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  OInputAIProps
>(function OInputAI(props, ref) {
  const {
    className,
    controlClassName,
    disabled,
    disabledPolish = false,
    onPolishError,
    onPolishSuccess,
    onValueChange,
    polishMode,
    value,
  } = props;
  const { messages } = useI18n();
  const copy = messages.common.aiInput;
  const [isPolishing, setIsPolishing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [snapshot, setSnapshot] = useState<PolishSnapshot | null>(null);
  const isTextarea = props.as === 'textarea';
  const canPolish =
    !disabled && !disabledPolish && !isPolishing && value.trim().length > 0;
  const canRestore = Boolean(snapshot && value === snapshot.after);

  useEffect(() => {
    setFeedback('');
  }, [value, polishMode]);

  async function handlePolish() {
    if (canRestore && snapshot) {
      onValueChange(snapshot.before);
      setSnapshot(null);
      setFeedback('');
      return;
    }
    if (!canPolish) return;

    const source = value;
    setIsPolishing(true);
    setFeedback('');
    try {
      const result = await postPolishContent({
        content: source,
        mode: polishMode,
      });
      if (!result.content.trim()) {
        throw new Error(copy.failed);
      }
      setSnapshot({ before: source, after: result.content });
      onValueChange(result.content);
      onPolishSuccess?.(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.failed;
      setFeedback(message);
      onPolishError?.(message);
    } finally {
      setIsPolishing(false);
    }
  }

  const button = (
    <OButton
      aria-label={canRestore ? copy.restoreAriaLabel : copy.polishAriaLabel}
      className='o-input-ai__button'
      disabled={
        disabled || disabledPolish || isPolishing || (!canRestore && !canPolish)
      }
      hoverTranslate={false}
      onClick={handlePolish}
      size='sm'
      type='button'
      variant={canRestore ? 'secondary' : 'ghost'}
    >
      {isPolishing ? (
        <Loader2
          className='o-input-ai__loading-icon'
          size={15}
          aria-hidden='true'
        />
      ) : canRestore ? (
        <RotateCcw size={15} aria-hidden='true' />
      ) : (
        <Sparkles size={15} aria-hidden='true' />
      )}
      {isPolishing ? copy.polishing : canRestore ? copy.restore : copy.polish}
    </OButton>
  );

  if (isTextarea) {
    const {
      as: _as,
      className: _className,
      controlClassName: _controlClassName,
      disabledPolish: _disabledPolish,
      onPolishError: _onPolishError,
      onPolishSuccess: _onPolishSuccess,
      onValueChange: _onValueChange,
      polishMode: _polishMode,
      value: _value,
      ...textareaProps
    } = props;

    return (
      <div
        className={cx('o-input-ai', 'o-input-ai--textarea', className)}
        aria-busy={isPolishing}
      >
        <div className='o-input-ai__textarea-wrap'>
          <textarea
            {...textareaProps}
            ref={ref as Ref<HTMLTextAreaElement>}
            className={cx('o-input-ai__control', controlClassName)}
            disabled={disabled}
            onChange={event => onValueChange(event.target.value)}
            value={value}
          />
          <div className='o-input-ai__textarea-action'>{button}</div>
        </div>
        {feedback ? (
          <small className='o-input-ai__feedback' role='alert'>
            {feedback}
          </small>
        ) : null}
      </div>
    );
  }

  const {
    as: _as,
    className: _className,
    controlClassName: _controlClassName,
    disabledPolish: _disabledPolish,
    onPolishError: _onPolishError,
    onPolishSuccess: _onPolishSuccess,
    onValueChange: _onValueChange,
    polishMode: _polishMode,
    value: _value,
    ...inputProps
  } = props;

  return (
    <div
      className={cx('o-input-ai', 'o-input-ai--input', className)}
      aria-busy={isPolishing}
    >
      <input
        {...inputProps}
        ref={ref as Ref<HTMLInputElement>}
        className={cx('o-input-ai__control', controlClassName)}
        disabled={disabled}
        onChange={event => onValueChange(event.target.value)}
        value={value}
      />
      {button}
      {feedback ? (
        <small className='o-input-ai__feedback' role='alert'>
          {feedback}
        </small>
      ) : null}
    </div>
  );
});
