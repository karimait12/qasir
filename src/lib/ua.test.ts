import { describe, expect, it } from 'vitest';
import { detectBrowser, detectDevice, isBot, parseUserAgent } from './ua';

const CHROME_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IPAD =
  'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const ANDROID_TABLET =
  'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const FIREFOX =
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0';
const GOOGLEBOT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const FACEBOOK = 'facebookexternalhit/1.1';

describe('user agent parsing', () => {
  it('detects desktop chrome', () => {
    expect(detectDevice(CHROME_DESKTOP)).toBe('desktop');
    expect(detectBrowser(CHROME_DESKTOP)).toBe('Chrome');
  });

  it('detects mobile safari', () => {
    expect(detectDevice(SAFARI_IPHONE)).toBe('mobile');
    expect(detectBrowser(SAFARI_IPHONE)).toBe('Safari');
  });

  it('detects tablets', () => {
    expect(detectDevice(IPAD)).toBe('tablet');
    expect(detectDevice(ANDROID_TABLET)).toBe('tablet');
  });

  it('detects firefox', () => {
    expect(detectBrowser(FIREFOX)).toBe('Firefox');
  });

  it('flags bots', () => {
    expect(isBot(GOOGLEBOT)).toBe(true);
    expect(isBot(FACEBOOK)).toBe(true);
    expect(parseUserAgent(GOOGLEBOT).device).toBe('bot');
  });

  it('returns safe defaults for empty UA', () => {
    expect(parseUserAgent('')).toEqual({ device: 'desktop', browser: 'Unknown' });
  });
});
