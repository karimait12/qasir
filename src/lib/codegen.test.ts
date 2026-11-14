import { describe, expect, it } from 'vitest';
import { generateCode } from './codegen';

describe('generateCode', () => {
  it('creates a 7 character code by default', () => {
    expect(generateCode()).toHaveLength(7);
  });

  it('only uses base62 characters', () => {
    expect(generateCode(32)).toMatch(/^[A-Za-z0-9]{32}$/);
  });

  it('respects a custom length', () => {
    expect(generateCode(12)).toHaveLength(12);
  });

  it('is reasonably random', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateCode()));
    expect(codes.size).toBeGreaterThan(40);
  });
});
