import { describe, expect, it } from 'vitest';
import { isPrivateHost, validateAlias, validateTargetUrl } from './validation';

describe('validateTargetUrl', () => {
  it('accepts http and https urls', () => {
    expect(validateTargetUrl('https://example.com').ok).toBe(true);
    expect(validateTargetUrl('http://example.com/path?q=1').ok).toBe(true);
  });

  it('rejects non-http protocols', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'ftp://example.com']) {
      expect(validateTargetUrl(url).ok).toBe(false);
    }
  });

  it('rejects localhost and private ips', () => {
    for (const url of [
      'http://localhost:3000',
      'http://127.0.0.1',
      'http://10.0.0.5',
      'http://192.168.1.10',
      'http://172.16.0.1',
      'http://172.31.255.1',
    ]) {
      expect(validateTargetUrl(url).ok).toBe(false);
    }
  });

  it('allows public addresses outside the private range', () => {
    expect(validateTargetUrl('http://172.32.0.1').ok).toBe(true);
    expect(validateTargetUrl('https://example.com').ok).toBe(true);
  });

  it('rejects urls pointing at the app own domain', () => {
    expect(validateTargetUrl('https://qasir.app/abc', ['qasir.app']).ok).toBe(false);
    expect(validateTargetUrl('https://sub.qasir.app/abc', ['qasir.app']).ok).toBe(false);
  });

  it('rejects overlong urls', () => {
    expect(validateTargetUrl(`https://example.com/${'a'.repeat(2048)}`).ok).toBe(false);
  });

  it('rejects empty input', () => {
    expect(validateTargetUrl('   ').ok).toBe(false);
  });
});

describe('validateAlias', () => {
  it('accepts valid aliases', () => {
    expect(validateAlias('promo').ok).toBe(true);
    expect(validateAlias('my-link_2').ok).toBe(true);
  });

  it('rejects short aliases', () => {
    expect(validateAlias('abc').ok).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(validateAlias('bad alias').ok).toBe(false);
    expect(validateAlias('bad!alias').ok).toBe(false);
  });

  it('rejects reserved aliases', () => {
    expect(validateAlias('dashboard').ok).toBe(false);
    expect(validateAlias('LOGIN').ok).toBe(false);
  });
});

describe('isPrivateHost', () => {
  it('flags loopback and private hosts', () => {
    expect(isPrivateHost('localhost')).toBe(true);
    expect(isPrivateHost('127.0.0.1')).toBe(true);
    expect(isPrivateHost('10.1.2.3')).toBe(true);
    expect(isPrivateHost('::1')).toBe(true);
    expect(isPrivateHost('fc00::1')).toBe(true);
  });

  it('does not flag public hosts', () => {
    expect(isPrivateHost('example.com')).toBe(false);
    expect(isPrivateHost('8.8.8.8')).toBe(false);
  });
});
