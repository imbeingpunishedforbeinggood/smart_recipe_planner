/**
 * Tokenizes text into lowercase alphabetic tokens of length >= 2.
 *
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(token => token.length >= 2);
}

/**
 * Builds a sorted, deduplicated vocabulary from a corpus of strings.
 *
 * @param {string[]} corpus
 * @returns {string[]} Sorted unique tokens across all documents
 */
export function buildVocabulary(corpus) {
  if (corpus.length === 0) return [];

  const tokenSet = new Set();
  for (const doc of corpus) {
    for (const token of tokenize(doc)) {
      tokenSet.add(token);
    }
  }

  return Array.from(tokenSet).sort();
}

/**
 * Computes a dense TF-IDF vector for the given text against the corpus.
 * Vector is indexed by buildVocabulary(corpus).
 *
 * IDF formula: log((N + 1) / (df + 1)) + 1  (smooth IDF)
 *
 * @param {string} text
 * @param {string[]} corpus
 * @returns {number[]} Dense TF-IDF vector, or [] if corpus is empty
 */
export function tfidf(text, corpus) {
  if (corpus.length === 0) return [];

  const vocabulary = buildVocabulary(corpus);
  const N = corpus.length;
  const textTokens = tokenize(text);
  const textLen = Math.max(1, textTokens.length);

  // Count term frequency in text
  const tfCounts = new Map();
  for (const token of textTokens) {
    tfCounts.set(token, (tfCounts.get(token) ?? 0) + 1);
  }

  // Count document frequency for each vocabulary term
  const dfCounts = new Map();
  for (const term of vocabulary) {
    let df = 0;
    for (const doc of corpus) {
      if (tokenize(doc).includes(term)) {
        df++;
      }
    }
    dfCounts.set(term, df);
  }

  // Build TF-IDF vector
  return vocabulary.map(term => {
    const tf = (tfCounts.get(term) ?? 0) / textLen;
    const df = dfCounts.get(term);
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    return tf * idf;
  });
}
