import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useWedding } from '../../context/WeddingContext'
import { formatWeddingDate, weddingDisplayTitle, weddingDisplayVenue } from '../../utils/weddingDisplay'
import { mediaUrl } from '../../utils/media'

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://parasempredois.com.br').replace(/\/$/, '')
const DEFAULT_TITLE = 'Para sempre dois - Site de casamento gratuito'
const DEFAULT_DESCRIPTION = 'Crie um site de casamento gratuito, elegante e simples para compartilhar fotos, presentes, RSVP e detalhes do grande dia.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

const INTERNAL_PATHS = ['/login', '/principal', '/dashboard', '/criar-site', '/editor', '/templates']

export default function SeoManager() {
  const location = useLocation()
  const { wedding, publishedWedding } = useWedding()

  useEffect(() => {
    const path = location.pathname
    const params = new URLSearchParams(location.search)
    const isPreview = params.get('preview') === '1'
    const isInternalView = INTERNAL_PATHS.some(internalPath => path === internalPath || path.startsWith(`${internalPath}/`))
    const isWeddingSite = path.startsWith('/site/') || (path !== '/' && !isInternalView && path.split('/').filter(Boolean).length === 1)
    const canonicalPath = isWeddingSite ? path : path === '/' ? '/' : path
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`

    if (isWeddingSite) {
      const renderedWedding = isPreview ? wedding : publishedWedding
      const title = `${weddingDisplayTitle(renderedWedding)} - Site de casamento`
      const date = formatWeddingDate(renderedWedding?.date, { day: '2-digit', month: 'long', year: 'numeric' }, 'data a definir')
      const venue = weddingDisplayVenue(renderedWedding)
      const description = `Veja as informações do casamento de ${weddingDisplayTitle(renderedWedding)}: data, local, presentes e confirmação de presença.`
      const image = mediaUrl(renderedWedding?.coverImage) || DEFAULT_IMAGE
      applySeo({
        title,
        description,
        canonicalUrl,
        image,
        robots: isPreview || params.has('from') ? 'noindex, nofollow' : 'index, follow',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `Casamento de ${weddingDisplayTitle(renderedWedding)}`,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          startDate: renderedWedding?.date || undefined,
          location: venue === 'Local a definir' ? undefined : { '@type': 'Place', name: venue },
          image,
          description,
        },
      })
      return
    }

    if (isInternalView) {
      applySeo({
        title: 'Área do casal - Para sempre dois',
        description: DEFAULT_DESCRIPTION,
        canonicalUrl,
        image: DEFAULT_IMAGE,
        robots: 'noindex, nofollow',
        jsonLd: null,
      })
      return
    }

    applySeo({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonicalUrl,
      image: DEFAULT_IMAGE,
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Para sempre dois',
        url: SITE_URL,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        description: DEFAULT_DESCRIPTION,
      },
    })
  }, [location.pathname, location.search, wedding, publishedWedding])

  return null
}

function applySeo({ title, description, canonicalUrl, image, robots, jsonLd }) {
  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', robots)
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:site_name', 'Para sempre dois')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('property', 'og:image', image)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)
  setCanonical(canonicalUrl)
  setJsonLd(jsonLd)
}

function setMeta(attribute, key, content) {
  if (!content) return
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

function setJsonLd(data) {
  const id = 'structured-data'
  const current = document.getElementById(id)
  if (!data) {
    current?.remove()
    return
  }
  const element = current || document.createElement('script')
  element.id = id
  element.type = 'application/ld+json'
  element.textContent = JSON.stringify(removeUndefined(data))
  if (!current) document.head.appendChild(element)
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, removeUndefined(entryValue)]),
  )
}
