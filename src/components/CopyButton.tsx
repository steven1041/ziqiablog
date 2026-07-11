'use client';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy code"
      className="absolute right-3 top-3 rounded-md border border-outline-variant bg-surface/90 px-2 py-1 text-[11px] font-semibold text-on-surface-variant backdrop-blur transition-colors hover:bg-surface-variant"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
