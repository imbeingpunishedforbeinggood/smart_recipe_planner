import { cosineSimilarity } from '../../../src/utils/cosineSimilarity';

describe('cosineSimilarity', () => {
  test('identical vectors → 1.0', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0);
  });

  test('orthogonal vectors → 0.0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0);
  });

  test('opposite vectors → -1.0', () => {
    expect(cosineSimilarity([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1.0);
  });

  test('one zero vector → 0.0 (edge case)', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  test('both zero vectors → 0.0', () => {
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  test('length mismatch → throws Error("Vector length mismatch")', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('Vector length mismatch');
    expect(() => cosineSimilarity([], [1])).toThrow('Vector length mismatch');
  });

  test('two-element known vectors — hand-computed expected value', () => {
    // [1, 0] · [1, 1] = 1; |[1,0]| = 1; |[1,1]| = sqrt(2)
    // cosine = 1 / (1 * sqrt(2)) ≈ 0.7071
    expect(cosineSimilarity([1, 0], [1, 1])).toBeCloseTo(1 / Math.sqrt(2), 5);
  });
});
