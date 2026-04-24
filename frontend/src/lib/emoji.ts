const EMOJIS = ['📍', '☕', '🍜', '🛍️', '🎵', '📚', '🍸', '🏙️', '🌿', '✨']

const CATEGORY_COLORS: { bg: string; text: string }[] = [
  { bg: '#fff0e8', text: '#ff6b35' },
  { bg: '#e8f0ff', text: '#4f7cff' },
  { bg: '#e8fff0', text: '#2db87c' },
  { bg: '#f4e8ff', text: '#9b59d4' },
  { bg: '#fff8e8', text: '#e08c35' },
  { bg: '#e8fffd', text: '#35b8c7' },
]

const SPOT_GRADIENTS: string[] = [
  'linear-gradient(135deg, #ffe4d4, #ffd0b8)',
  'linear-gradient(135deg, #d4eeff, #b8daff)',
  'linear-gradient(135deg, #d4ffda, #b8f0bf)',
  'linear-gradient(135deg, #ffecd4, #ffd4b8)',
  'linear-gradient(135deg, #f4d4ff, #e8b8ff)',
  'linear-gradient(135deg, #fffbd4, #fff0b8)',
]

export function getAutoEmoji(index: number): string {
  return EMOJIS[index % EMOJIS.length]
}

export function getCategoryColor(index: number): { bg: string; text: string } {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export function getSpotGradient(index: number): string {
  return SPOT_GRADIENTS[index % SPOT_GRADIENTS.length]
}
