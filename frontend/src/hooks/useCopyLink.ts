import { useState } from 'react';

async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text).catch(() => {});
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.prepend(textArea);
    textArea.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    finally { textArea.remove(); }
  }
}

export function useCopyLink(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = async (url: string) => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), timeoutMs);
  };

  return { copied, copy };
}
