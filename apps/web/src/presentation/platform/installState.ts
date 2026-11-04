/** How Riselyo is opened: already installed, in an iPhone / iPad browser, or elsewhere. */
export type InstallState = 'installed' | 'ios' | 'other';

/** The browser facts used, injected so that tests can describe any device. */
export interface BrowserFacts {
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
  /** Safari on iOS only: true when opened from the home screen icon. */
  readonly standalone: boolean | undefined;
  readonly displayModeStandalone: boolean;
}

const IOS_DEVICE = /iPhone|iPad|iPod/;
/** iPadOS presents itself as a Mac, but a Mac has no touch screen. */
const IPAD_AS_MAC_TOUCH_POINTS = 1;

export function installStateOf(facts: BrowserFacts): InstallState {
  if (facts.standalone === true || facts.displayModeStandalone) {
    return 'installed';
  }
  const iPadAsMac =
    facts.platform === 'MacIntel' && facts.maxTouchPoints > IPAD_AS_MAC_TOUCH_POINTS;
  return IOS_DEVICE.test(facts.userAgent) || iPadAsMac ? 'ios' : 'other';
}

export function currentBrowserFacts(): BrowserFacts {
  const iosNavigator = navigator as Navigator & { readonly standalone?: boolean };
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone: iosNavigator.standalone,
    displayModeStandalone:
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches,
  };
}
