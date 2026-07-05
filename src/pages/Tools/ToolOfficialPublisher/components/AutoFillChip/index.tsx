import type { PublisherCopy } from '@/pages/Tools/ToolOfficialPublisher/types';
import { Wand2 } from 'lucide-react';

export function AutoFillChip({
  copy,
  onClear,
}: {
  copy: PublisherCopy;
  onClear: () => void;
}) {
  return (
    <span className='autofill-chip'>
      <Wand2 size={13} aria-hidden='true' />
      <span>{copy.autoFill.chip}</span>
      <button
        className='autofill-chip-clear interactive'
        type='button'
        onClick={onClear}
        aria-label={copy.autoFill.clearAria}
      >
        {copy.autoFill.clear}
      </button>
    </span>
  );
}
