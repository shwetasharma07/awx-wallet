import { v4 as uuidv4 } from 'uuid';

export interface DebugShape {
  url: string;
  method: string;
  reqHeaders: Record<string, string>;
  body?: any;
  status: number;
  respHeaders: Record<string, string>;
  respBody: any;
}

export interface FetchResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  json: any;
  debug: DebugShape;
}

const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'webhook-secret',
  'x-webhook-secret'
];

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_HEADERS.some(sensitive => lowerKey.includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAWX(
  path: string,
  init: RequestInit & { idemp?: string } = {}
): Promise<FetchResult> {
  const baseUrl = process.env.AIRWALLEX_BASE || 'https://api-demo.airwallex.com';
  const url = `${baseUrl}${path}`;
  const method = init.method || 'GET';

  // Extract idemp key and remove from init
  const { idemp, ...restInit } = init;
  const idempotencyKey = idemp || uuidv4();

  // Build headers
  const defaultHeaders: Record<string, string> = {
    'Authorization': `Bearer ${process.env.AIRWALLEX_API_KEY}`,
    'X-Client-Id': process.env.AIRWALLEX_CLIENT_ID || '',
    'Content-Type': 'application/json'
  };

  // Add idempotency key for mutating operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    defaultHeaders['X-Idempotency-Key'] = idempotencyKey;
  }

  const headers = {
    ...defaultHeaders,
    ...restInit.headers
  };

  const requestConfig: RequestInit = {
    ...restInit,
    method,
    headers
  };

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, requestConfig);
      const responseHeaders = headersToRecord(response.headers);

      let responseBody: any;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      const debug: DebugShape = {
        url,
        method,
        reqHeaders: redactHeaders(headers),
        body: requestConfig.body ? JSON.parse(requestConfig.body as string) : undefined,
        status: response.status,
        respHeaders: redactHeaders(responseHeaders),
        respBody: responseBody
      };

      // Don't retry on success or 4xx errors (except 429)
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return {
          ok: response.ok,
          status: response.status,
          headers: responseHeaders,
          json: responseBody,
          debug
        };
      }

      // Retry on 429 or 5xx
      if (response.status === 429 || response.status >= 500) {
        if (attempt < 2) { // Don't sleep on last attempt
          const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
          await sleep(backoffMs);
          continue;
        }
      }

      return {
        ok: response.ok,
        status: response.status,
        headers: responseHeaders,
        json: responseBody,
        debug
      };

    } catch (error) {
      lastError = error as Error;

      if (attempt < 2) { // Don't sleep on last attempt
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
        await sleep(backoffMs);
        continue;
      }
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error('All retry attempts failed');
}