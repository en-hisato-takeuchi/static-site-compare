// E2E は、各構成のビルド結果を tools/serve.js で配って流す。
// 既定では3構成すべて。STACKS=astro,next のように絞れる（ビルドしていない構成があると起動に失敗するため）。
import { defineConfig, devices } from '@playwright/test'
import { MOCK_CMS } from './spec/cms/config.js'
import { STACKS, stackNames } from './tools/stacks.js'

const targets = process.env.STACKS ? process.env.STACKS.split(',') : stackNames

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  projects: targets.map((name) => ({
    name,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://127.0.0.1:${STACKS[name].port}`,
    },
  })),
  webServer: [
    // プレビューは、リクエストのたびに疑似 CMS から下書きを取る
    {
      command: 'node spec/cms/server.js',
      url: `${MOCK_CMS.endpoint}/jobs`,
      // API キーがないリクエストは 401 を返すので、起動の確認では 401 も「起動した」とみなす
      reuseExistingServer: !process.env.CI,
    },
    ...targets.map((name) => ({
      command: `node tools/serve.js ${name}`,
      url: `http://127.0.0.1:${STACKS[name].port}/`,
      reuseExistingServer: !process.env.CI,
    })),
  ],
})
