/**
 * @fileoverview PWA Install Prompt Component
 *
 * Provides a button/UI element that allows users to install the app
 * to their home screen. Captures the beforeinstallprompt event and
 * triggers it when the user clicks the install button.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';

/**
 * BeforeInstallPromptEvent interface
 * Extends the standard Event with PWA-specific properties
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWAInstallPrompt Component
 *
 * Renders an install button when the app can be installed as a PWA.
 * The button is hidden if:
 * - The app is already installed (running in standalone mode)
 * - The browser doesn't support PWA installation
 * - The user has already dismissed the prompt
 *
 * @returns Install button UI or null if not installable
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Dev mode preview - shows the component even without the browser event
  const isDev = import.meta.env.DEV;
  const showDevPreview = isDev && !isInstallable && !isInstalled && !isDismissed;

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Triggers the native install prompt
   */
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // In dev mode without the event, just show an alert
      if (isDev) {
        alert('Install prompt would appear here in production (requires HTTPS)');
      }
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }

    // Clear the deferred prompt - it can only be used once
    setDeferredPrompt(null);
  };

  /**
   * Dismiss the install prompt
   */
  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't show anything if already installed, dismissed, or not installable (unless dev preview)
  if (isInstalled || isDismissed || (!isInstallable && !showDevPreview)) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Install Rackem Leagues
                  {showDevPreview && (
                    <span className="ml-2 text-xs text-orange-600 font-normal">(Dev Preview)</span>
                  )}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Add to your home screen for quick access
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="mt-3 gap-2"
              loadingText="Installing..."
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
