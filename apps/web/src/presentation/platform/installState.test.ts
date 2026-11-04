import { describe, expect, it } from 'vitest';
import { installStateOf, type BrowserFacts } from './installState';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

const facts = (change: Partial<BrowserFacts>): BrowserFacts => ({
  userAgent: IPHONE_SAFARI,
  platform: 'iPhone',
  maxTouchPoints: 5,
  standalone: false,
  displayModeStandalone: false,
  ...change,
});

describe('installStateOf', () => {
  it('suggests installing on an iPhone browser', () => {
    expect(installStateOf(facts({}))).toBe('ios');
  });

  it('recognises an iPad that presents itself as a Mac', () => {
    expect(installStateOf(facts({ userAgent: 'Macintosh', platform: 'MacIntel' }))).toBe('ios');
  });

  it('does not mistake a Mac for an iPad', () => {
    const mac = { userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 0 };
    expect(installStateOf(facts(mac))).toBe('other');
  });

  it('knows when the app was opened from the home screen', () => {
    expect(installStateOf(facts({ standalone: true }))).toBe('installed');
    expect(installStateOf(facts({ standalone: undefined, displayModeStandalone: true }))).toBe(
      'installed',
    );
  });

  it('treats other devices as other', () => {
    const android = { userAgent: 'Mozilla/5.0 (Linux; Android 15)', platform: 'Linux armv8l' };
    expect(installStateOf(facts({ ...android, standalone: undefined }))).toBe('other');
  });
});
