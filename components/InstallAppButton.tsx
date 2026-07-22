'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handler as EventListener
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handler as EventListener
      );
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
  }

  if (!deferredPrompt) return null;

  return (
    <button
      className="btn"
      onClick={install}
      style={{ marginLeft: 12 }}
    >
      📲 Installeer app
    </button>
  );
}