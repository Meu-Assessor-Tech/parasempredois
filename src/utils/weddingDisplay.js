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
  const weddingDate = new Date(date)
  if (Number.isNaN(weddingDate.getTime())) return fallback
  return weddingDate.toLocaleDateString('pt-BR', options)
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
