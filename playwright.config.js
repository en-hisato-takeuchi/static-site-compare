// E2E は、各構成のビルド結果を tools/serve.js で配って流す。
// 既定では3構成すべて。STACKS=astro,next のように絞れる（ビルドしていない構成があると起動に失敗するため）。
import { defineConfig, devices } from '@playwright/test'
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
  webServer: targets.map((name) => ({
    command: `node tools/serve.js ${name}`,
    url: `http://127.0.0.1:${STACKS[name].port}/`,
    reuseExistingServer: !process.env.CI,
  })),
})
