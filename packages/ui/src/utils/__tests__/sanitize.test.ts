// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { escapeRegExp, isBlurhashValid } from '../index';

describe('escapeRegExp', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegExp('hello.world')).toBe('hello\\.world');
    expect(escapeRegExp('price$10')).toBe('price\\$10');
    expect(escapeRegExp('a*b+c?d')).toBe('a\\*b\\+c\\?d');
  });

  it('escapes brackets and braces', () => {
    expect(escapeRegExp('[test]')).toBe('\\[test\\]');
    expect(escapeRegExp('{key}')).toBe('\\{key\\}');
    expect(escapeRegExp('(group)')).toBe('\\(group\\)');
  });

  it('handles empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });

  it('passes through normal characters', () => {
    expect(escapeRegExp('hello')).toBe('hello');
    expect(escapeRegExp('abc123')).toBe('abc123');
  });

  it('escapes pipe and caret', () => {
    expect(escapeRegExp('a|b')).toBe('a\\|b');
    expect(escapeRegExp('^start')).toBe('\\^start');
  });

  it('escaped string works safely in RegExp', () => {
    const dangerous = 'price is $10.00 (USD)';
    const escaped = escapeRegExp(dangerous);
    const re = new RegExp(escaped);
    expect(re.test(dangerous)).toBe(true);
    expect(re.test('price is X10Y00 ZUSD)')).toBe(false);
  });
});

describe('isBlurhashValid', () => {
  it('accepts valid blurhash strings', () => {
    expect(isBlurhashValid('LEHV6nWB2yk8pyo0adR*.7kCMdnj')).toBe(true);
    expect(isBlurhashValid('LGF5]+Yk^6#M@-5c,1J5@[or[Q6.')).toBe(true);
  });

  it('rejects empty/null/undefined', () => {
    expect(isBlurhashValid('')).toBe(false);
    expect(isBlurhashValid(null as any)).toBe(false);
    expect(isBlurhashValid(undefined as any)).toBe(false);
  });

  it('rejects strings shorter than 6 characters', () => {
    expect(isBlurhashValid('ABCDE')).toBe(false);
    expect(isBlurhashValid('12345')).toBe(false);
  });

  it('accepts exactly 6 characters', () => {
    expect(isBlurhashValid('ABCDEF')).toBe(true);
  });

  it('rejects strings with invalid characters', () => {
    expect(isBlurhashValid('ABCDEF!')).toBe(false);
    expect(isBlurhashValid('ABC DEF')).toBe(false);
    expect(isBlurhashValid('ABCDEF\n')).toBe(false);
  });
});
