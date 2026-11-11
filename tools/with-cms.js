// 疑似 CMS を起動したまま、コマンドを1つ動かす。終わったら CMS を止める。
// 使い方：node tools/with-cms.js pnpm build
import { spawn } from 'node:child_process'
import { BROWSER_ENV } from '../spec/cms/config.js'
import { startMockCms } from '../spec/cms/server.js'

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
    // ブラウザに置く値（GET 権限だけのキーと、疑似 CMS の接続先）
    env: { ...process.env, ...BROWSER_ENV },
  })
  child.on('error', () => resolve(1))
  child.on('exit', (exitCode) => resolve(exitCode ?? 1))
})
server.close()
process.exit(code)
