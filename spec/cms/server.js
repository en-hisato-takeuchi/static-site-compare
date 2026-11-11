// microCMS と同じ形で求人を返す疑似 CMS。
// 使い方：node spec/cms/server.js（先に generate-jobs.js でデータを作る）
//
// GET /api/v1/jobs        一覧。limit（既定10、最大100）、offset、fields、filters に対応
// GET /api/v1/jobs/{id}   詳細。fields に対応
// どちらも X-MICROCMS-API-KEY ヘッダーがないか違うときは 401 を返す
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MOCK_CMS } from './config.js'

const DATA_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'data',
  'jobs.json',
)
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

const pickFields = (job, fields) =>
  fields
    ? Object.fromEntries(
        fields
          .split(',')
          .filter((key) => key in job)
          .map((key) => [key, job[key]]),
      )
    : job

// microCMS の filters のうち、[equals] と [contains] を [and] でつないだ形だけ扱う
// 例：category[contains]store[and]employmentType[equals]正社員
const toFilter = (filters) => {
  if (!filters) return () => true
  const conditions = filters.split('[and]').map((condition) => {
    const match = condition.match(/^(\w+)\[(equals|contains)\](.*)$/)
    if (!match) throw new Error(`filters の書き方が違います：${condition}`)
    return { field: match[1], operator: match[2], value: match[3] }
  })
  return (job) =>
    conditions.every(({ field, operator, value }) => {
      const actual = job[field]
      const values = Array.isArray(actual) ? actual : [actual]
      return operator === 'equals'
        ? values.length === 1 && String(values[0]) === value
        : values.some((item) => String(item).includes(value))
    })
}

const toInteger = (value, fallback) => {
  if (value === null) return fallback
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : NaN
}

const handle = (jobs, req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (req.method !== 'GET')
    return json(res, 405, { message: 'Method not allowed.' })
  if (req.headers['x-microcms-api-key'] !== MOCK_CMS.apiKey) {
    return json(res, 401, { message: 'X-MICROCMS-API-KEY header is invalid.' })
  }

  const [, api, version, endpoint, id, ...rest] = url.pathname.split('/')
  if (
    api !== 'api' ||
    version !== 'v1' ||
    endpoint !== 'jobs' ||
    rest.length > 0
  ) {
    return json(res, 404, { message: 'API not found.' })
  }

  const fields = url.searchParams.get('fields')
  if (id) {
    const job = jobs.find((item) => item.id === id)
    return job
      ? json(res, 200, pickFields(job, fields))
      : json(res, 404, { message: 'Content is not found.' })
  }

  const limit = toInteger(url.searchParams.get('limit'), DEFAULT_LIMIT)
  const offset = toInteger(url.searchParams.get('offset'), 0)
  if (Number.isNaN(limit) || Number.isNaN(offset) || limit > MAX_LIMIT) {
    return json(res, 400, {
      message: `limit は0〜${MAX_LIMIT}、offset は0以上の整数にしてください。`,
    })
  }
  let matched
  try {
    matched = jobs.filter(toFilter(url.searchParams.get('filters')))
  } catch (error) {
    return json(res, 400, { message: error.message })
  }
  return json(res, 200, {
    contents: matched
      .slice(offset, offset + limit)
      .map((job) => pickFields(job, fields)),
    totalCount: matched.length,
    offset,
    limit,
  })
}

export const startMockCms = async () => {
  const jobs = JSON.parse(
    await readFile(DATA_PATH, 'utf-8').catch(() => {
      throw new Error(
        '求人のデータがありません。先に pnpm generate:jobs --count 10 を実行してください',
      )
    }),
  )
  const server = createServer((req, res) => {
    setTimeout(() => handle(jobs, req, res), MOCK_CMS.latencyMs)
  })
  await new Promise((resolve) =>
    server.listen(MOCK_CMS.port, '127.0.0.1', resolve),
  )
  return { server, jobs }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { jobs } = await startMockCms()
  console.log(
    `疑似 CMS を ${MOCK_CMS.endpoint} で起動しました（求人${jobs.length}件）`,
  )
}
