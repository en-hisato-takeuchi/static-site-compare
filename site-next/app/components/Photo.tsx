// 写真は AVIF と WebP を出し分け、JPEG を最後の手段にする。3構成で同じ幅と sizes を使う。
// 画像は tools/convert-images.js で変換して public/images に置いてある（{名前}-{幅}.{形式}）

// 写真の枠ごとの、画面に出る幅。.container の最大幅は 68rem
const LAYOUTS = {
  hero: { widths: [640, 1280, 1920], sizes: '100vw' },
  wide: { widths: [640, 1280], sizes: '(min-width: 72rem) 68rem, 100vw' },
  main: {
    widths: [640, 1280],
    sizes: '(min-width: 72rem) 45rem, (min-width: 48em) 66vw, 100vw',
  },
  third: {
    widths: [640, 1280],
    sizes: '(min-width: 72rem) 22rem, (min-width: 48em) 33vw, 100vw',
  },
  prose: { widths: [640, 1280], sizes: '(min-width: 50rem) 46rem, 100vw' },
}

// 元の写真の大きさ。width と height に入れて、読み込み中に枠の高さを確保する
const DIMENSIONS = {
  hero: [6832, 4270],
  'mosaic-sauna': [1920, 1280],
  'mosaic-plunge': [1920, 1280],
  'mosaic-chairs': [1280, 1920],
  'category-store': [1280, 1920],
  'category-facility': [1920, 1280],
  'category-office': [1280, 1920],
  'voice-towel': [1920, 1280],
  'voice-bucket': [1920, 1280],
  'voice-laptop': [1920, 1280],
  'lab-kanda': [1920, 1280],
  'lab-nakano': [1920, 1133],
  'lab-yokohama': [1536, 1920],
  'lab-omiya': [1920, 1440],
  'lab-kohan': [1920, 1280],
  'band-about': [1920, 1440],
  'band-workplace': [1920, 1280],
  visit: [1440, 1920],
} as const

export type PhotoName = keyof typeof DIMENSIONS

type Props = {
  name: PhotoName
  alt: string
  className: string
  layout: keyof typeof LAYOUTS
  // 1画面目に入る写真。遅延読み込みしない
  eager?: boolean
}

export function Photo({ name, alt, className, layout, eager = false }: Props) {
  const { widths, sizes } = LAYOUTS[layout]
  const [width, height] = DIMENSIONS[name]
  const isHero = layout === 'hero'
  const srcSet = (format: string) =>
    widths.map((w) => `/images/${name}-${w}.${format} ${w}w`).join(', ')

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        className={className}
        src={`/images/${name}-${widths.at(-1)}.jpg`}
        srcSet={srcSet('jpg')}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        loading={isHero || eager ? 'eager' : 'lazy'}
        fetchPriority={isHero ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  )
}
