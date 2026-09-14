/**
 * Genera avatares y banners dinámicos sin Storage.
 * Usa el hash del userId para producir colores y formas reproducibles.
 */

function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const PALETTE: [string, string][] = [
  ['#10b981', '#065f46'], // emerald
  ['#3b82f6', '#1e3a8a'], // blue
  ['#8b5cf6', '#4c1d95'], // violet
  ['#f59e0b', '#78350f'], // amber
  ['#ef4444', '#7f1d1d'], // red
  ['#06b6d4', '#164e63'], // cyan
  ['#ec4899', '#831843'], // pink
  ['#84cc16', '#365314'], // lime
  ['#f97316', '#7c2d12'], // orange
  ['#6366f1', '#312e81'], // indigo
]

const SHAPES = ['circle', 'triangle', 'square', 'hexagon', 'diamond'] as const
type Shape = (typeof SHAPES)[number]

function shapeToSvgPath(shape: Shape, cx: number, cy: number, size: number): string {
  switch (shape) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${size}" />`
    case 'triangle': {
      const h = size * Math.sqrt(3)
      return `<polygon points="${cx},${cy - size} ${cx - h / 2},${cy + size / 2} ${cx + h / 2},${cy + size / 2}" />`
    }
    case 'square':
      return `<rect x="${cx - size}" y="${cy - size}" width="${size * 2}" height="${size * 2}" />`
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`
      }).join(' ')
      return `<polygon points="${pts}" />`
    }
    case 'diamond':
      return `<polygon points="${cx},${cy - size} ${cx + size * 0.7},${cy} ${cx},${cy + size} ${cx - size * 0.7},${cy}" />`
  }
}

export function generateAvatarSvg(userId: string, size = 96, paletteIndex?: number | null): string {
  const hash = hashStr(userId)
  const idx = paletteIndex != null && paletteIndex >= 0 && paletteIndex <= 9
    ? paletteIndex
    : hash % PALETTE.length
  const [primary, secondary] = PALETTE[idx]
  const shape1 = SHAPES[hash % SHAPES.length]
  const shape2 = SHAPES[(hash >> 3) % SHAPES.length]
  const shape3 = SHAPES[(hash >> 6) % SHAPES.length]

  const half = size / 2
  const s1 = size * 0.28
  const s2 = size * 0.18
  const s3 = size * 0.12

  const offX1 = (((hash >> 9) % 30) - 15) * (size / 96)
  const offY1 = (((hash >> 12) % 30) - 15) * (size / 96)
  const offX2 = (((hash >> 15) % 40) - 20) * (size / 96)
  const offY2 = (((hash >> 18) % 40) - 20) * (size / 96)
  const offX3 = (((hash >> 21) % 40) - 20) * (size / 96)
  const offY3 = (((hash >> 24) % 40) - 20) * (size / 96)

  const opacity1 = 0.85 + ((hash >> 6) % 15) / 100
  const opacity2 = 0.6 + ((hash >> 9) % 25) / 100
  const opacity3 = 0.4 + ((hash >> 12) % 30) / 100

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondary}" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg-${hash})" rx="${size * 0.12}" />
  <g fill="${primary}" opacity="${opacity1}">
    ${shapeToSvgPath(shape1, half + offX1, half + offY1, s1)}
  </g>
  <g fill="${primary}" opacity="${opacity2}">
    ${shapeToSvgPath(shape2, half * 0.5 + offX2, half * 1.5 + offY2, s2)}
  </g>
  <g fill="white" opacity="${opacity3}">
    ${shapeToSvgPath(shape3, half * 1.6 + offX3, half * 0.6 + offY3, s3)}
  </g>
</svg>`
}

export function generateBannerSvg(userId: string, paletteIndex?: number | null, width = 800, height = 200): string {
  const hash = hashStr(userId)
  const idx = paletteIndex != null && paletteIndex >= 0 && paletteIndex <= 9
    ? paletteIndex
    : (hash + 2) % PALETTE.length
  const [primary, secondary] = PALETTE[idx]

  const segments = Array.from({ length: 6 }, (_, i) => {
    const h = hashStr(userId + i)
    const shape = SHAPES[h % SHAPES.length]
    const x = (i / 5) * width + ((h % 40) - 20)
    const y = height * 0.5 + ((h >> 4) % height) * 0.4 - height * 0.2
    const s = 20 + (h % 40)
    const op = 0.1 + (h % 20) / 100
    return `<g fill="${i % 2 === 0 ? primary : 'white'}" opacity="${op}">${shapeToSvgPath(shape, x, y, s)}</g>`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="banner-${hash}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${secondary}" />
      <stop offset="50%" stop-color="#111111" />
      <stop offset="100%" stop-color="${primary}22" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#banner-${hash})" />
  ${segments}
</svg>`
}

export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
  return `data:image/svg+xml,${encoded}`
}

export function getAvatarDataUri(
  userId: string,
  size = 96,
  paletteIndex?: number | null
): string {
  return svgToDataUri(generateAvatarSvg(userId, size, paletteIndex))
}

export function getBannerDataUri(
  userId: string,
  paletteIndex?: number | null
): string {
  return svgToDataUri(generateBannerSvg(userId, paletteIndex))
}

export const AVATAR_PALETTE_NAMES = [
  'Esmeralda', 'Azul', 'Violeta', 'Ámbar', 'Rojo',
  'Cian', 'Rosa', 'Lima', 'Naranja', 'Índigo',
] as const
