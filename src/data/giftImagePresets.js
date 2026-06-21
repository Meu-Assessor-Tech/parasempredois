function unsplashPhoto(photoId) {
  return `https://images.unsplash.com/${photoId}?w=600&h=600&fit=crop&auto=format&q=80`
}

export const giftImagePresetCategories = [
  {
    id: 'lar',
    label: '🏠 Começando Nosso Lar',
    presets: [
      { id: 'cozinha-panelas', label: 'Jogo de panelas', url: unsplashPhoto('photo-1556909114-f6e7ad7d3136') },
      { id: 'cozinha-frigideira', label: 'Frigideira', url: unsplashPhoto('photo-1556911220-e15b29be8c8f') },
      { id: 'cozinha-air-fryer', label: 'Air Fryer', url: unsplashPhoto('photo-1585515320310-259814833e62') },
      { id: 'cozinha-liquidificador', label: 'Liquidificador', url: unsplashPhoto('photo-1570222094114-d054a817e56b') },
      { id: 'cozinha-cafeteira', label: 'Cafeteira', url: unsplashPhoto('photo-1495474472287-4d71bcdd2085') },
      { id: 'cozinha-facas', label: 'Conjunto de facas', url: unsplashPhoto('photo-1593618998160-e34014e67546') },
      { id: 'mesa-pratos', label: 'Jogo de pratos', url: unsplashPhoto('photo-1467003909585-2f8a72700288') },
      { id: 'mesa-copos', label: 'Jogo de copos', url: unsplashPhoto('photo-1523362628745-0c100150b504') },
      { id: 'mesa-talheres', label: 'Jogo de talheres', url: unsplashPhoto('photo-1603199506016-b9a594b593c0') },
      { id: 'mesa-travessa', label: 'Travessa', url: unsplashPhoto('photo-1543353071-10c8ba85a904') },
      { id: 'casa-sofa', label: 'Sofá', url: unsplashPhoto('photo-1555041469-a586c61ea9bc') },
      { id: 'casa-mesa-jantar', label: 'Mesa de jantar', url: unsplashPhoto('photo-1615874694520-474822394e73') },
      { id: 'casa-cama', label: 'Cama', url: unsplashPhoto('photo-1631049307264-da0ec9d70304') },
      { id: 'casa-colchao', label: 'Colchão', url: unsplashPhoto('photo-1505693416388-ac5ce068fe85') },
      { id: 'casa-guarda-roupa', label: 'Guarda-roupa', url: unsplashPhoto('photo-1558769132-cb1aea458c5e') },
      { id: 'casa-tv', label: 'Smart TV', url: unsplashPhoto('photo-1461151304267-38535e780c79') },
      { id: 'casa-geladeira', label: 'Geladeira', url: unsplashPhoto('photo-1571175443880-49e1d25b2bc5') },
      { id: 'casa-maquina-lavar', label: 'Máquina de lavar', url: unsplashPhoto('photo-1626806819282-2c1dc01a5e0c') },
    ],
  },
  {
    id: 'celebrando',
    label: '🍷 Celebrando Juntos',
    presets: [
      { id: 'cozinha-tacas', label: 'Taças', url: unsplashPhoto('photo-1558618666-fcd25c85cd64') },
      { id: 'lua-de-mel-jantar-romantico', label: 'Jantar romântico', url: unsplashPhoto('photo-1414235077428-338989a2e8c0') },
      { id: 'experiencias-vinhos', label: 'Degustação de vinhos', url: unsplashPhoto('photo-1510812431401-41d2bd2722f3') },
      { id: 'experiencias-culinaria', label: 'Aula de culinária', url: unsplashPhoto('photo-1556911220-e15b29be8c8f') },
      { id: 'experiencias-piquenique', label: 'Piquenique', url: unsplashPhoto('photo-1500530855697-b586d89ba3ee') },
      { id: 'experiencias-show', label: 'Show', url: unsplashPhoto('photo-1501386761578-eac5c94b800a') },
    ],
  },
  {
    id: 'lua-de-mel',
    label: '✈️ Nossa Lua de Mel',
    presets: [
      { id: 'lua-de-mel-passagens', label: 'Passagens', url: unsplashPhoto('photo-1436491865332-7a61a109cc05') },
      { id: 'lua-de-mel-hospedagem', label: 'Hospedagem', url: unsplashPhoto('photo-1566073771259-6a8506099945') },
      { id: 'lua-de-mel-passeio', label: 'Passeio', url: unsplashPhoto('photo-1499856871958-5b9627545d1a') },
      { id: 'lua-de-mel-carro', label: 'Aluguel de carro', url: unsplashPhoto('photo-1503376780353-7e6692767b70') },
      { id: 'lua-de-mel-cafe', label: 'Café da manhã especial', url: unsplashPhoto('photo-1533089860892-a7c6f0a88666') },
    ],
  },
  {
    id: 'memorias',
    label: '🌿 Construindo Memórias',
    presets: [
      { id: 'decoracao-quadros', label: 'Quadros', url: unsplashPhoto('photo-1513519245088-0e12902e5a38') },
      { id: 'decoracao-plantas', label: 'Plantas', url: unsplashPhoto('photo-1487530811176-3780de880c2d') },
      { id: 'decoracao-vasos', label: 'Vasos', url: unsplashPhoto('photo-1494438639946-1ebd1d20bf85') },
      { id: 'decoracao-luminaria', label: 'Luminária', url: unsplashPhoto('photo-1507473885765-e6ed057f782c') },
      { id: 'decoracao-espelho', label: 'Espelho', url: unsplashPhoto('photo-1618220179428-22790b461013') },
      { id: 'decoracao-tapete', label: 'Tapete', url: unsplashPhoto('photo-1600210492493-0946911123ea') },
      { id: 'experiencias-massagem', label: 'Massagem para casal', url: unsplashPhoto('photo-1544161515-4ab6ce6db874') },
      { id: 'experiencias-day-spa', label: 'Day Spa', url: unsplashPhoto('photo-1544161515-4ab6ce6db874') },
    ],
  },
  {
    id: 'sonhos',
    label: '✨ Realizando Sonhos',
    presets: [
      { id: 'sonhos-entrada-casa', label: 'Entrada da casa', url: unsplashPhoto('photo-1560518883-ce09059eeffa') },
      { id: 'sonhos-reforma', label: 'Reforma', url: unsplashPhoto('photo-1503387762-592deb58ef4e') },
      { id: 'sonhos-moveis-planejados', label: 'Móveis planejados', url: unsplashPhoto('photo-1618220179428-22790b461013') },
      { id: 'sonhos-fundo-viagens', label: 'Fundo para viagens', url: unsplashPhoto('photo-1488646953014-85cb44e25828') },
      { id: 'sonhos-reserva-futuro', label: 'Reserva para o futuro', url: unsplashPhoto('photo-1579621970563-ebec7560ff3e') },
    ],
  },
]

export const giftImagePresets = giftImagePresetCategories.flatMap(category =>
  category.presets.map(preset => ({ ...preset, category: category.label }))
)

const legacyGiftPresetIds = {
  'cozinha-loucas': 'mesa-pratos',
  'quarto-cama': 'casa-cama',
  'quarto-decoracao': 'decoracao-quadros',
  'quarto-flores': 'decoracao-plantas',
  'quarto-spa': 'experiencias-day-spa',
  'casa-liquidificador': 'cozinha-liquidificador',
  'casa-tv': 'casa-tv',
  'experiencias-viagem': 'lua-de-mel-passagens',
  'experiencias-churrasco': 'lua-de-mel-jantar-romantico',
  'experiencias-perfume': 'experiencias-day-spa',
}

export function giftImagePresetById(id) {
  const normalizedId = legacyGiftPresetIds[id] ?? id
  return giftImagePresets.find(preset => preset.id === normalizedId) ?? null
}
