export interface ApiErrorPayload {
  code?: number;
  content?: string;
  message: string;
}

export const apiErrorEventName = 'orz2:api-error';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Normalizes the API's business-error envelope at the HTTP boundary.
 * A business error can arrive with either an HTTP error status or a 2xx status.
 */
export function getApiErrorPayload(value: unknown): ApiErrorPayload | null {
  if (!isRecord(value) || typeof value.message !== 'string') return null;

  const code = typeof value.code === 'number' ? value.code : undefined;
  if (code === 200) return null;

  return {
    code,
    content: typeof value.content === 'string' ? value.content : undefined,
    message: value.message,
  };
}

export function notifyApiError(value: unknown): void {
  const error = getApiErrorPayload(value);
  if (!error || typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<ApiErrorPayload>(apiErrorEventName, { detail: error })
  );
}
