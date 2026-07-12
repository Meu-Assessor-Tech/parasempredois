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

export function getInvitations(weddingId) {
  return api(`/weddings/${weddingId}/invitations`)
}

export function createInvitation(weddingId, invitation) {
  return api(`/weddings/${weddingId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(invitation),
  })
}

export function deleteInvitation(weddingId, invitationId) {
  return api(`/weddings/${weddingId}/invitations/${invitationId}`, { method: 'DELETE' })
}

export function searchInvitations(slug, name) {
  return api(`/weddings/public/${encodeURIComponent(slug)}/invitations/search?name=${encodeURIComponent(name)}`)
}

export function verifyInvitation(slug, invitationId, code) {
  return api(`/weddings/public/${encodeURIComponent(slug)}/invitations/verify`, {
    method: 'POST',
    body: JSON.stringify({ invitationId, code }),
  })
}

export function respondToInvitation(slug, invitationId, code, guests) {
  return api(`/weddings/public/${encodeURIComponent(slug)}/invitations/${invitationId}/rsvp`, {
    method: 'PUT',
    body: JSON.stringify({ code, guests }),
  })
}
