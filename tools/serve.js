// 3構成のビルド結果を、同じ条件で配る静的サーバー。
// 使い方：node tools/serve.js <構成の名前>
// 静的ホスティングのふるまいに寄せる。
// - /about/ は about/index.html を返す。/about のように末尾の / がないときは、ディレクトリがあれば /about/ に 301 で飛ばす
// - ファイルがないパスは、404.html の中身を 404 のステータスで返す
// - テキストは、ブラウザが対応していれば brotli か gzip で圧縮して返す
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createBrotliCompress, createGzip } from 'node:zlib'
import { getStack } from './stacks.js'

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}
const COMPRESSIBLE = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.txt',
  '.xml',
  '.svg',
])

const isFile = async (path) =>
  (await stat(path).catch(() => null))?.isFile() ?? false
const isDirectory = async (path) =>
  (await stat(path).catch(() => null))?.isDirectory() ?? false

// URL のパスを、配信するディレクトリの中のファイルに対応させる。外に出るパスは null
const toFilePath = (root, pathname) => {
  const decoded = decodeURIComponent(pathname)
  const filePath = normalize(join(root, decoded))
  return filePath === root || filePath.startsWith(root + sep) ? filePath : null
}

const send = async (req, res, status, filePath) => {
  const ext = extname(filePath)
  const headers = {
    'Content-Type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  }
  const accept = req.headers['accept-encoding'] ?? ''
  const encoding = !COMPRESSIBLE.has(ext)
    ? null
    : accept.includes('br')
      ? 'br'
      : accept.includes('gzip')
        ? 'gzip'
        : null
  if (encoding) {
    headers['Content-Encoding'] = encoding
    headers.Vary = 'Accept-Encoding'
  }
  res.writeHead(status, headers)
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  const source = createReadStream(filePath)
  if (encoding === 'br') await pipeline(source, createBrotliCompress(), res)
  else if (encoding === 'gzip') await pipeline(source, createGzip(), res)
  else await pipeline(source, res)
}

const handle = async (root, req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  const url = new URL(req.url ?? '/', 'http://localhost')
  const filePath = toFilePath(root, url.pathname)
  const notFound = join(root, '404.html')

  if (filePath) {
    if (url.pathname.endsWith('/')) {
      const index = join(filePath, 'index.html')
      if (await isFile(index)) return send(req, res, 200, index)
    } else if (await isFile(filePath)) {
      return send(req, res, 200, filePath)
    } else if (await isDirectory(filePath)) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end()
      return
    }
  }
  if (await isFile(notFound)) return send(req, res, 404, notFound)
  res
    .writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    .end('Not Found')
}

export const startServer = async (name) => {
  const stack = getStack(name)
  if (!(await isDirectory(stack.outPath))) {
    throw new Error(`${stack.outDir} がありません。先にビルドしてください`)
  }
  const server = createServer((req, res) => {
    handle(stack.outPath, req, res).catch((error) => {
      console.error(error)
      if (!res.headersSent) res.writeHead(500).end()
    })
  })
  await new Promise((resolve) =>
    server.listen(stack.port, '127.0.0.1', resolve),
  )
  return { server, url: `http://127.0.0.1:${stack.port}` }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { url } = await startServer(process.argv[2])
  console.log(`${process.argv[2]} を ${url} で配信しています`)
}
