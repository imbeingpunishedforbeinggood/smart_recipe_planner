/**
 * Computes cosine similarity between two equal-length numeric vectors.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Similarity in [-1, 1], or 0 if either vector has zero norm
 * @throws {Error} If vectors have different lengths
 */
export function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vector length mismatch');
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (normA * normB);
}
