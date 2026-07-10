import type {
  AutoFillKeyPattern,
  PromptTemplate,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import type {
  AutoFillKey,
  WechatPublisherForm,
} from '@/pages/Tools/ToolOfficialPublisher/types';

export function truncate(value: string, max: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

export function newValueForKey(template: PromptTemplate, key: AutoFillKey) {
  if (key === 'promptSystem') return template.fields.promptSystem;
  if (key === 'promptContent') return template.fields.promptContent;
  if (key === 'imageCover.value') return template.fields.coverValue;
  if (key.startsWith('imagesInlineList.')) {
    const idx = Number(key.split('.')[1]);
    return pickInlinePrompt(template, idx);
  }
  return '';
}

// Pick the inline image prompt by index; fall back to the last prompt.
export function pickInlinePrompt(template: PromptTemplate, idx: number) {
  const list = template.fields.inlineValueList;
  if (idx >= 0 && idx < list.length) return list[idx];
  return list[list.length - 1];
}

export function expandDefaultCheckedPatterns(
  patterns: AutoFillKeyPattern[],
  currentForm: WechatPublisherForm,
  planFilledKeys: AutoFillKey[]
): AutoFillKey[] {
  const expanded: AutoFillKey[] = [];
  for (const pattern of patterns) {
    if (pattern === 'imagesInlineList.*.value') {
      // Expand to every AI inline-image key.
      planFilledKeys.forEach(key => {
        if (key.startsWith('imagesInlineList.')) {
          const idx = Number(key.split('.')[1]);
          if (currentForm.imagesInlineList[idx]?.type === 'ai') {
            expanded.push(key);
          }
        }
      });
    } else if (planFilledKeys.includes(pattern)) {
      expanded.push(pattern);
    }
  }
  return expanded;
}
