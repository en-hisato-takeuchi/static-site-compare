// 疑似 CMS を起動したまま、コマンドを1つ動かす。終わったら CMS を止める。
// 使い方：node tools/with-cms.js pnpm build
import { spawn } from 'node:child_process'
import { MOCK_CMS } from '../spec/cms/config.js'
import { startMockCms } from '../spec/cms/server.js'

// 構成ごとの、ブラウザに出す環境変数の名前（Vanilla は build.js が自分で読み込む）
const BROWSER_ENV = Object.fromEntries(
  ['', 'PUBLIC_', 'NEXT_PUBLIC_'].flatMap((prefix) => [
    [`${prefix}MICROCMS_BROWSER_API_ENDPOINT`, MOCK_CMS.endpoint],
    [`${prefix}MICROCMS_BROWSER_API_KEY`, MOCK_CMS.browserApiKey],
  ]),
)

const [command, ...args] = process.argv.slice(2)
if (!command) {
  console.error(
    '動かすコマンドを指定してください（例：node tools/with-cms.js pnpm build）',
  )
  process.exit(1)
}

const { server } = await startMockCms()
const code = await new Promise((resolve) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    // ブラウザに置く値（GET 権限だけのキーと、疑似 CMS の接続先）。公開してよい値なので、
    // 構成ごとの「ブラウザに出す環境変数」の名前で渡す
    env: { ...process.env, ...BROWSER_ENV },
  })
  child.on('error', () => resolve(1))
  child.on('exit', (exitCode) => resolve(exitCode ?? 1))
})
server.close()
process.exit(code)
