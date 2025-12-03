/**
 * @fileoverview PWA Update Prompt Component
 *
 * Displays a prompt to users when a new version of the app is available.
 * Uses the vite-plugin-pwa's useRegisterSW hook to detect and apply updates.
 * The prompt appears as a toast-like notification at the bottom of the screen.
 */

import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';

/**
 * PWAUpdatePrompt Component
 *
 * Handles service worker registration and displays an update prompt
 * when a new version of the app is available. Users can choose to
 * update immediately or dismiss the prompt.
 *
 * @returns The update prompt UI or null if no update is available
 */
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW Registered:', registration);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  /**
   * Closes the update prompt without applying the update
   */
  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-card border border-border p-4 shadow-lg">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Update Available</h3>
          <p className="text-sm text-muted-foreground">
            A new version of Rackem Leagues is available. Reload to update.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={close}>
            Later
          </Button>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
}
