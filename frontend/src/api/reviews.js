import client from './client'

export async function getSchemeReviews(schemeId) {
  const res = await client.get(`/schemes/reviews?schemeId=${schemeId}`)
  return res.data
}

export async function submitSchemeReview(data) {
  const res = await client.post('/schemes/reviews', data)
  return res.data
}

export async function toggleReviewLike(reviewId) {
  const res = await client.post('/schemes/reviews/like', { reviewId })
  return res.data
}

export async function getRatingSummaries() {
  try {
    const res = await client.get('/schemes/rating-summaries')
    return res.data || {}
  } catch {
    return {}
  }
}
