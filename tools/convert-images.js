// spec/assets/images の写真を、AVIF・WebP・JPEG の決まった幅に変換して書き出す。
// 使い方：node tools/convert-images.js <書き出し先>
// Vanilla と Next.js は、ビルドで画像を変換しない。ここで一度だけ変換したものを public/ に置いてコミットする。
// 画質は sharp の既定のまま（Astro の <Picture> も画質を指定しないと sharp の既定になるので、3構成でそろう）
import { mkdir, readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'
import { ROOT } from './stacks.js'

const SOURCE_DIR = join(ROOT, 'spec', 'assets', 'images')
const FORMATS = ['avif', 'webp', 'jpg']
// ヒーローだけ 1920 まで出す。ほかの枠は画面に出る幅が .container（68rem）以下なので 1280 まで
const WIDTHS = { hero: [640, 1280, 1920] }
const DEFAULT_WIDTHS = [640, 1280]

const outDir = process.argv[2]
if (!outDir) {
  console.error(
    '書き出し先を指定してください（例：site-vanilla/public/images）',
  )
  process.exit(1)
}
await mkdir(outDir, { recursive: true })

const files = (await readdir(SOURCE_DIR)).filter(
  (file) => extname(file) === '.jpg',
)
for (const file of files) {
  const name = basename(file, '.jpg')
  for (const width of WIDTHS[name] ?? DEFAULT_WIDTHS) {
    for (const format of FORMATS) {
      await sharp(join(SOURCE_DIR, file))
        .resize({ width })
        .toFormat(format === 'jpg' ? 'jpeg' : format)
        .toFile(join(outDir, `${name}-${width}.${format}`))
    }
  }
  console.log(`${name} を変換しました`)
}
