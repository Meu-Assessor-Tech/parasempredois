export function weddingDisplayNames(wedding) {
  return {
    brideName: wedding?.brideName?.trim() || 'Nome da noiva',
    groomName: wedding?.groomName?.trim() || 'Nome do noivo',
  }
}

export function weddingDisplayTitle(wedding) {
  const { brideName, groomName } = weddingDisplayNames(wedding)
  return `${brideName} & ${groomName}`
}

export function formatWeddingDate(date, options, fallback = 'Data a definir') {
  if (!date) return fallback
  const weddingDate = parseWeddingDate(date)
  if (Number.isNaN(weddingDate.getTime())) return fallback
  return weddingDate.toLocaleDateString('pt-BR', options)
}

export function parseWeddingDate(date) {
  const match = String(date ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return new Date(date)

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function weddingDisplayVenue(wedding) {
  return wedding?.venue?.trim() || 'Local a definir'
}

export function weddingDisplayMessage(wedding) {
  return wedding?.message?.trim() || 'Mensagem do casal'
}

export function weddingDisplayStory(wedding) {
  return wedding?.story?.trim() || 'Conte aqui a história de vocês.'
}

export const DEFAULT_RSVP_MESSAGE = 'Sua presença tornará esse dia ainda mais especial. Confirme sua participação para celebrarmos juntos.'

export function weddingDisplayRsvpMessage(wedding) {
  return wedding?.rsvpMessage?.trim() || ''
}
