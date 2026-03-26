import { buildVocabulary, tfidf } from '../../../src/utils/tfidf';

describe('buildVocabulary', () => {
  test('returns sorted, deduplicated tokens across all documents', () => {
    expect(buildVocabulary(['pasta garlic', 'garlic oil'])).toEqual(['garlic', 'oil', 'pasta']);
  });

  test('empty corpus returns []', () => {
    expect(buildVocabulary([])).toEqual([]);
  });

  test('single document', () => {
    expect(buildVocabulary(['hello world'])).toEqual(['hello', 'world']);
  });

  test('tokens are lowercased and sorted lexicographically', () => {
    expect(buildVocabulary(['Pasta Carbonara'])).toEqual(['carbonara', 'pasta']);
  });

  test('discards tokens shorter than 2 characters', () => {
    const vocab = buildVocabulary(['a is the cat']);
    expect(vocab).not.toContain('a');
    expect(vocab).toContain('is');
    expect(vocab).toContain('the');
    expect(vocab).toContain('cat');
  });
});

describe('tfidf', () => {
  test('empty corpus returns []', () => {
    expect(tfidf('any text', [])).toEqual([]);
  });

  test('text with no valid tokens returns zero vector', () => {
    const corpus = ['hello world'];
    const result = tfidf('1 2 3', corpus); // no alphabetic chars → empty token list
    expect(result.length).toBe(buildVocabulary(corpus).length);
    expect(result.every(v => v === 0)).toBe(true);
  });

  test('identical texts in same corpus produce identical vectors', () => {
    const corpus = ['pasta carbonara', 'chicken soup'];
    const v1 = tfidf('pasta carbonara', corpus);
    const v2 = tfidf('pasta carbonara', corpus);
    expect(v1).toEqual(v2);
  });

  test('single-doc corpus: IDF = log(2/2) + 1 = 1.0 for present terms', () => {
    // N=1, df=1 for each term → IDF = log((1+1)/(1+1)) + 1 = log(1) + 1 = 0 + 1 = 1.0
    // TF = 1/2 for each of 2 tokens → result = 0.5 * 1.0 = 0.5
    const corpus = ['hello world'];
    const vocab = buildVocabulary(corpus);
    const result = tfidf('hello world', corpus);
    expect(vocab).toEqual(['hello', 'world']);
    vocab.forEach((_, i) => {
      expect(result[i]).toBeCloseTo(0.5, 5);
    });
  });

  test('term in all docs has lower weight than term unique to one doc', () => {
    // 'common' appears in all 3 docs: IDF = log(4/4) + 1 = 1.0
    // 'word'   appears in 1 doc:      IDF = log(4/2) + 1 = log(2) + 1 ≈ 1.693
    const corpus = ['common word', 'common other', 'common again'];
    const vocab = buildVocabulary(corpus);
    const result = tfidf('common word', corpus);
    const commonIdx = vocab.indexOf('common');
    const wordIdx = vocab.indexOf('word');
    expect(result[commonIdx]).toBeLessThan(result[wordIdx]);
  });

  test('term unique to one doc has high IDF weight', () => {
    // 'pasta'     in 2/3 docs: IDF = log(4/3) + 1 ≈ 1.288
    // 'carbonara' in 1/3 docs: IDF = log(4/2) + 1 = log(2) + 1 ≈ 1.693
    const corpus = ['pasta carbonara', 'chicken soup', 'pasta salad'];
    const vocab = buildVocabulary(corpus);
    const result = tfidf('pasta carbonara', corpus);
    const pastaIdx = vocab.indexOf('pasta');
    const carbonaraIdx = vocab.indexOf('carbonara');
    expect(result[carbonaraIdx]).toBeGreaterThan(result[pastaIdx]);
  });

  test('dense vector length matches vocabulary size', () => {
    const corpus = ['pasta carbonara', 'chicken soup', 'vegetable stir fry'];
    const vocab = buildVocabulary(corpus);
    const result = tfidf('pasta', corpus);
    expect(result.length).toBe(vocab.length);
  });

  test('terms absent from text have zero TF-IDF value', () => {
    const corpus = ['pasta carbonara', 'chicken soup'];
    const vocab = buildVocabulary(corpus);
    const result = tfidf('pasta', corpus);
    const chickenIdx = vocab.indexOf('chicken');
    const soupIdx = vocab.indexOf('soup');
    expect(result[chickenIdx]).toBe(0);
    expect(result[soupIdx]).toBe(0);
  });
});
