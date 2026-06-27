import { api } from './client'

export function submitRsvp(slug, confirmation) {
  return api(`/weddings/public/${encodeURIComponent(slug)}/rsvps`, {
    method: 'POST',
    body: JSON.stringify({
      name: confirmation.name,
      companions: Number(confirmation.companions ?? 0),
    }),
  })
}

export function getGuestConfirmations(weddingId) {
  return api(`/weddings/${weddingId}/rsvps`)
}
