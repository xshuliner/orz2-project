import type { ArticleInfo } from '@/api';

const removedElementSelector =
  'script, style, iframe, object, embed, form, link, meta, svg, math, template';
const allowedElements = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);
const allowedAttributes: Record<string, ReadonlySet<string>> = {
  a: new Set(['href', 'title', 'target']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan', 'scope']),
};

function isSafeArticleUrl(value: string, allowMailto = false) {
  return (
    /^https?:\/\//i.test(value) ||
    value.startsWith('#') ||
    (allowMailto && /^mailto:/i.test(value))
  );
}

export type ArticleImageDirection = 'horizontal' | 'vertical';

export function getArticleImages(
  article: ArticleInfo,
  direction: ArticleImageDirection = 'horizontal'
) {
  const candidates =
    direction === 'vertical'
      ? [article.imgCoverV, ...(article.imgListV ?? [])]
      : [article.imgCover, ...(article.imgList ?? [])];

  return Array.from(
    new Set(
      candidates
        .filter((url): url is string => typeof url === 'string')
        .filter(url => /^https?:\/\//i.test(url))
    )
  );
}

export function getArticleBodyText(article: ArticleInfo) {
  const content = article.content?.trim() ?? '';
  if (!content) return '';
  const document = new DOMParser().parseFromString(content, 'text/html');
  const title = article.title?.trim();
  const firstElement = document.body.firstElementChild;
  if (
    title &&
    firstElement?.matches('h1, h2, h3, h4, h5, h6') &&
    firstElement.textContent?.trim() === title
  ) {
    firstElement.remove();
  }
  return document.body.textContent?.trim() ?? '';
}

export function sanitizeArticleHtml(content: string, title?: string) {
  const document = new DOMParser().parseFromString(content, 'text/html');
  document
    .querySelectorAll(removedElementSelector)
    .forEach(element => element.remove());
  document.body.querySelectorAll('*').forEach(element => {
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'h1') {
      const heading = document.createElement('h2');
      heading.append(...Array.from(element.childNodes));
      element.replaceWith(heading);
      return;
    }
    if (!allowedElements.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    const tagAttributes = allowedAttributes[tagName] ?? new Set<string>();
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (!tagAttributes.has(name)) {
        element.removeAttribute(attribute.name);
      }
      if (
        (name === 'href' && !isSafeArticleUrl(value, true)) ||
        (name === 'src' && !isSafeArticleUrl(value)) ||
        (['width', 'height'].includes(name) && !/^\d{1,4}$/.test(value)) ||
        (name === 'target' && value !== '_blank')
      ) {
        element.removeAttribute(attribute.name);
      }
    }
    if (tagName === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
    if (tagName === 'img') {
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
    }
  });
  const firstElement = document.body.firstElementChild;
  if (
    title?.trim() &&
    firstElement?.matches('h2, h3, h4, h5, h6') &&
    firstElement.textContent?.trim() === title.trim()
  ) {
    firstElement.remove();
  }
  return document.body.innerHTML;
}

export function formatArticleDate(value: string | undefined, locale: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
