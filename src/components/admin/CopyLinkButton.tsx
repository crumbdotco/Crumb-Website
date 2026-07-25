'use client';

import { useState } from 'react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-[#E6C39B]/30 px-2.5 py-1 text-xs font-semibold text-[#E6C39B] transition hover:bg-[#E6C39B]/10"
    >
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}
