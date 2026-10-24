import { expect, it } from 'vitest';
import { matchKeywords } from './speechCheck';

it('matches keywords despite case and punctuation', () => {
  expect(matchKeywords("I'm a WEB developer!", ['web', 'developer'])).toEqual(['web', 'developer']);
});

it('matches a plural form of a keyword', () => {
  expect(matchKeywords('I build websites', ['website'])).toEqual(['website']);
});

it('does not invent matches', () => {
  expect(matchKeywords('I work at Edone', ['worked', 'client'])).toEqual([]);
  expect(matchKeywords('', ['web'])).toEqual([]);
});
