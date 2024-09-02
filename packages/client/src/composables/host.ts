import { isInChromePanel, isInElectron, isInIframe } from '@vue/devtools-shared';

export function useHostEnv() {
  if (isInElectron) return 'electron';

  if (isInChromePanel) return 'chrome';

  if (isInIframe) return 'iframe';
  return 'separate-window';
}
