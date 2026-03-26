# Contract: Unsplash Photo Search API

**Version**: 1.0.0
**Date**: 2026-03-24
**Implemented in**: `src/services/unsplashService.js`

---

## Endpoint

```
GET https://api.unsplash.com/search/photos
```

### Query Parameters

| Parameter     | Value                                    | Notes                        |
|---------------|------------------------------------------|------------------------------|
| `query`       | `recipe.imageSearchQuery` (URL-encoded) | From Claude recipe response  |
| `per_page`    | `1`                                      | Only the top result is used  |
| `orientation` | `landscape`                              | Better card aspect ratio     |

### Required Header

```
Authorization: Client-ID {UNSPLASH_ACCESS_KEY}
```

`UNSPLASH_ACCESS_KEY` is loaded from `Constants.expoConfig.extra.unsplashAccessKey`.

---

## Request Example

```
GET https://api.unsplash.com/search/photos?query=thai+basil+chicken&per_page=1&orientation=landscape
Authorization: Client-ID abc123yourkey
```

---

## Success Response

HTTP 200. The app uses only:

```json
{
  "results": [
    {
      "urls": {
        "regular": "https://images.unsplash.com/photo-xxxx?..."
      }
    }
  ]
}
```

**Extracted value**: `data.results[0]?.urls?.regular`

If `results` is empty or the field is missing, `fetchDishImage` returns `null` and the
caller renders a placeholder image.

---

## Error Handling

| Condition                       | Response from `fetchDishImage`  | UI behaviour            |
|---------------------------------|---------------------------------|-------------------------|
| HTTP non-200                    | `null`                          | Placeholder image shown |
| Network timeout / unreachable   | `null` (caught exception)       | Placeholder image shown |
| `results` empty                 | `null`                          | Placeholder image shown |
| Invalid JSON body               | `null`                          | Placeholder image shown |

Individual image failures MUST NOT block the batch from being displayed. All 5 image
fetches run in parallel via `Promise.allSettled` (not `Promise.all`), so one failure
does not reject the others.

---

## Parallel Fetch Pattern

```js
// unsplashService.js
export async function fetchBatchImages(recipes, accessKey) {
  const results = await Promise.allSettled(
    recipes.map((r) => fetchDishImage(r.imageSearchQuery, accessKey))
  );
  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
```

---

## Rate Limits

| Tier        | Limit              | Batch cost | Max batches/hr |
|-------------|--------------------|------------|----------------|
| Demo        | 50 requests/hour   | 5 requests | 10 batches/hr  |
| Production  | Unlimited          | 5 requests | Unlimited      |

Development uses Demo tier (Unsplash Developer account, no approval needed).
Production submission to Unsplash review is required for public release.

---

## Attribution Requirement

Unsplash API guidelines require attribution when displaying photos. The app MUST display
"Photo by Unsplash" (or the photographer credit from `results[0].user.name`) somewhere
visible when a dish image is shown. Implementation detail deferred to UI task.
