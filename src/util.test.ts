import seedrandom from 'seedrandom';

import { shuffle } from './util';

describe('util.ts', () => {
    describe('shuffle()', () => {
        test('works on empty list', () => {
            const rng = seedrandom('test');
            expect(shuffle([], rng)).toEqual([]);
        });
        test('works on single-element list', () => {
            const rng = seedrandom('test');
            expect(shuffle([1], rng)).toEqual([1]);
        });
        test('works on bigger list', () => {
            const rng = seedrandom('test');
            expect(shuffle([1, 2, 3, 4, 5, 6], rng)).toEqual([6, 4, 1, 2, 5, 3]);
            expect(shuffle([1, 2, 3, 4, 5, 6], rng)).toEqual([2, 4, 3, 6, 5, 1]);
        });
    });
});