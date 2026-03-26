# Contract: TF-IDF Algorithm Behaviour

**Version**: 1.0.0
**Date**: 2026-03-25
**Implemented in**: `src/utils/tfidf.js`
**Principle II note**: No external API is called. This document defines the algorithm's observable behaviour as a contract for unit tests and future maintainers.

---

## Tokenization

Input text is tokenized before any TF or IDF computation:

1. Lowercase the entire string
2. Split on `/[^a-z]+/` (split at any non-alphabetic character)
3. Discard tokens with `length < 2`

**Examples**:
- `"Spaghetti Carbonara"` → `["spaghetti", "carbonara"]`
- `"Tags: quick, one-pot"` → `["tags", "quick", "one", "pot"]`
- `"35 minutes"` → `["minutes"]` (`"35"` discarded as non-alpha, `"35"` also < 2 chars if split differently)
  - More precisely: `"35 minutes"` → split on `/[^a-z]+/` → `["", "minutes"]` → discard `""` (length 0) → `["minutes"]`

---

## Vocabulary

```
buildVocabulary(corpus: string[]): string[]
```

Returns the sorted array of unique tokens across all documents in the corpus:

```
vocabulary = sort(deduplicate(flatten(corpus.map(tokenize))))
```

- Sorting is lexicographic (standard JS `Array.sort()`)
- Includes tokens from all documents; the order is deterministic
- An empty corpus returns `[]`

---

## TF-IDF Formula

```
tfidf(text: string, corpus: string[]): number[]
```

Returns a dense vector of length `vocabulary(corpus).length`.

For each term `t` at index `i` in `vocabulary(corpus)`:

```
TF(t, text)  = count(t in tokenize(text)) / max(1, tokenize(text).length)
IDF(t)       = log((|corpus| + 1) / (df(t) + 1)) + 1
result[i]    = TF(t, text) × IDF(t)
```

Where:
- `count(t in tokenize(text))` — number of times `t` appears in the tokenized text
- `|corpus|` — number of documents in the corpus (`corpus.length`)
- `df(t)` — number of documents in corpus whose tokenized form contains `t` (document frequency)
- `log` is the natural logarithm (`Math.log`)

Terms not present in `text` but present in the vocabulary have `TF = 0`, so their `result[i] = 0`.

**Edge case — empty corpus**: Returns a zero vector of length 0 (empty array). Callers should treat this as a "no profile" state.

**Edge case — text with no valid tokens**: Returns a zero vector of length `vocabulary(corpus).length`.

---

## Vocabulary Alignment (for profile updates)

When the profile vocabulary grows, old profile vectors are aligned to the new vocabulary by zero-padding:

```
For each term in newVocabulary:
  if term in oldVocabulary:
    alignedOld[i] = oldVector[oldVocabulary.indexOf(term)]
  else:
    alignedOld[i] = 0
```

This is handled in `tfidfProfile.js`, not in `tfidf.js`.

---

## Scoring Projection (for match score computation)

When scoring a new recipe against a stored profile, the new recipe's full vector is projected into the profile's vocabulary subspace:

```
liveVocab = buildVocabulary(currentCorpus)
liveVector = tfidf(recipeText, currentCorpus)

projected[i] = liveVector[liveVocab.indexOf(profileVocab[i])]
               if profileVocab[i] is in liveVocab, else 0
```

Cosine similarity is then computed between `projected` and `profile.vector`. Both have length `|profileVocab|`.

---

## Contract Versioning

| Version | Change |
|---|---|
| 1.0.0 | Initial — smooth IDF, `/[^a-z]+/` tokenizer, min token length 2, `Math.log` |

Any change to tokenization rules, IDF formula, or constant values is a breaking change that requires:
1. A version bump here
2. Clearing `@srp/tfidf_profile` and `@srp/recipe_corpus` from AsyncStorage (old vectors are incompatible)
3. A migration note in the commit message
