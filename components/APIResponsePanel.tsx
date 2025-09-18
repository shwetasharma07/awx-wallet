'use client';

import { useState } from 'react';
import { DebugShape } from '@/lib/fetcher';

interface APIResponsePanelProps {
  title: string;
  debug?: DebugShape;
  collapsedByDefault?: boolean;
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 transition-colors"
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

function CodeBlock({ content, language = 'json' }: { content: string; language?: string }) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <CopyButton text={content} />
      </div>
      <pre className="bg-gray-50 border rounded p-3 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{content}</code>
      </pre>
    </div>
  );
}

function formatJson(obj: any): string {
  if (typeof obj === 'string') {
    try {
      return JSON.stringify(JSON.parse(obj), null, 2);
    } catch {
      return obj;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function StatusBadge({ status }: { status: number }) {
  let bgColor = 'bg-gray-100 text-gray-800';

  if (status >= 200 && status < 300) {
    bgColor = 'bg-green-100 text-green-800';
  } else if (status >= 400 && status < 500) {
    bgColor = 'bg-yellow-100 text-yellow-800';
  } else if (status >= 500) {
    bgColor = 'bg-red-100 text-red-800';
  }

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
}

export default function APIResponsePanel({
  title,
  debug,
  collapsedByDefault = false
}: APIResponsePanelProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsedByDefault);

  if (!debug) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">No debug information available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left border-b bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={debug.status} />
            <span className="text-xs font-mono text-gray-500">
              {debug.method.toUpperCase()}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Request Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Request</h4>
            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-gray-600 mb-1">URL</h5>
                <div className="bg-gray-50 border rounded p-2 text-xs font-mono break-all">
                  <span className="text-blue-600 font-bold">{debug.method.toUpperCase()}</span>{' '}
                  {debug.url}
                </div>
              </div>

              {Object.keys(debug.reqHeaders).length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Headers</h5>
                  <CodeBlock content={formatJson(debug.reqHeaders)} />
                </div>
              )}

              {debug.body && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Body</h5>
                  <CodeBlock content={formatJson(debug.body)} />
                </div>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Response</h4>
            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-gray-600 mb-1">Status</h5>
                <div className="flex items-center gap-2">
                  <StatusBadge status={debug.status} />
                  <span className="text-xs text-gray-600">
                    {debug.status >= 200 && debug.status < 300 ? 'Success' :
                     debug.status >= 400 && debug.status < 500 ? 'Client Error' :
                     debug.status >= 500 ? 'Server Error' : 'Unknown'}
                  </span>
                </div>
              </div>

              {Object.keys(debug.respHeaders).length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Headers</h5>
                  <CodeBlock content={formatJson(debug.respHeaders)} />
                </div>
              )}

              {debug.respBody && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Body</h5>
                  <CodeBlock content={formatJson(debug.respBody)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}