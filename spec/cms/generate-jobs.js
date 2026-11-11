// 疑似 CMS に入れる求人のダミーデータを作る。
// 使い方：node spec/cms/generate-jobs.js --count 100 [--out spec/cms/data/jobs.json]
// 同じ件数なら毎回同じデータになる（ID と日付を、求人の通し番号から決めるため）。
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const COUNTS = [0, 10, 100, 500]
const DEFAULT_OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  'data',
  'jobs.json',
)

// 最新の求人の公開日時。ここから PUBLISH_INTERVAL_HOURS ずつさかのぼる
const LATEST_PUBLISHED_AT = Date.parse('2026-11-08T01:00:00.000Z')
const PUBLISH_INTERVAL_HOURS = 14
const ID_LENGTH = 10
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

const URBAN_LABS = ['神田研究棟', '中野研究棟', '横浜研究棟', '大宮研究棟']

// 本文は職種ごとに書き、どれも同じ構成（導入1文、箇条書き3つ、締め1文）にして長さをそろえる
const JOB_TYPES = [
  {
    name: '熱波師',
    category: 'store',
    locations: URBAN_LABS,
    salary: { 正社員: '月給28万円〜', アルバイト: '時給1,500円〜' },
    lead: 'サウナ室でタオルを振り、熱い空気をお客さまに届ける仕事です。1日に4回、決まった時間に熱波を送ります。',
    tasks: [
      '熱波の時間の案内と、サウナ室の入場の整理',
      'アロマ水の調合と、香りの記録',
      '熱波のあとの、水分補給の声かけ',
    ],
    closing:
      '体力は要りますが、いちばん大事なのは、お客さまの顔色を見て風の強さを変えることです。',
  },
  {
    name: 'ロウリュ担当',
    category: 'store',
    locations: URBAN_LABS,
    salary: { 正社員: '月給26万円〜', アルバイト: '時給1,300円〜' },
    lead: 'サウナストーンに水をかけ、サウナ室の湿度をつくる仕事です。かける量と間合いは、研究棟ごとに決めています。',
    tasks: [
      '決まった時間のロウリュと、湿度の記録',
      'サウナストーンの並べ替えと点検',
      'ロウリュ用の水とひしゃくの準備',
    ],
    closing:
      '水をかける音が鳴った瞬間に、サウナ室の空気が変わります。その変化を毎日確かめる仕事です。',
  },
  {
    name: '休憩処スタッフ',
    category: 'store',
    locations: URBAN_LABS,
    salary: { 正社員: '月給25万円〜', アルバイト: '時給1,250円〜' },
    lead: '外気浴スペースと休憩処を整え、サウナのあとの時間を気持ちよくする仕事です。椅子の向きも仕事のうちです。',
    tasks: [
      '外気浴の椅子と、休憩処の寝転びスペースの整頓',
      '飲み物とサウナ飯の提供',
      '気温と風向きに合わせた、椅子の向きの調整',
    ],
    closing:
      'お客さまが目を閉じている時間を守る仕事です。音を立てずに動けるようになるまで、先輩が教えます。',
  },
  {
    name: '水風呂の温度管理',
    category: 'facility',
    locations: URBAN_LABS,
    salary: { 正社員: '月給26万円〜', アルバイト: '時給1,350円〜' },
    lead: '水風呂の水温を、夏も冬も16.0℃に保つ仕事です。チラーと水質の点検を、1時間ごとに行います。',
    tasks: [
      '水温と水質の測定と記録',
      'チラー（冷却装置）の点検と調整',
      '水風呂の清掃と、水の入れ替え',
    ],
    closing:
      '0.1℃のずれにも、常連のお客さまは気づきます。数字を守ることが、そのまま接客になる仕事です。',
  },
  {
    name: 'サウナストーブ保守',
    category: 'facility',
    locations: URBAN_LABS,
    salary: { 正社員: '月給29万円〜', アルバイト: '時給1,450円〜' },
    lead: 'サウナストーブを点検し、修理する仕事です。研究棟でいちばん熱い場所が、そのまま職場になります。',
    tasks: [
      '開店前のストーブの点検と、温度の立ち上げ',
      'ヒーターとサウナストーンの交換',
      '故障したときの修理と、メーカーとのやりとり',
    ],
    closing:
      '電気工事の資格がある方は、入社後すぐに点検を任せます。ない方は、資格の取得を会社が支えます。',
  },
  {
    name: 'テントサウナ設営',
    category: 'facility',
    locations: ['湖畔研究棟'],
    salary: { 正社員: '月給25万円〜', アルバイト: '時給1,400円〜' },
    lead: '湖畔研究棟を拠点に、テントサウナを設営し、片付ける仕事です。河原や湖畔での貸し出しに同行します。',
    tasks: [
      'テントとストーブの設営と撤収',
      '薪の準備と、火の番',
      '貸し出し先での使い方の説明',
    ],
    closing:
      '天気に左右される仕事です。雨の日は設営がないので、湖畔研究棟で道具の手入れをします。',
  },
  {
    name: '新店舗開発',
    category: 'office',
    locations: ['本社'],
    salary: { 正社員: '年収600万円〜' },
    lead: '次の研究棟を出す場所を探し、開店までを進める仕事です。物件探しから、設計会社との打ち合わせまで担当します。',
    tasks: [
      '候補地の調査と、物件の内見',
      '設計会社・施工会社との打ち合わせ',
      '開店までの予定とお金の管理',
    ],
    closing:
      '候補地では、必ず近くのサウナに入って帰ってきます。それも調査のうちとして、経費で落とせます。',
  },
  {
    name: '広報',
    category: 'office',
    locations: ['本社'],
    salary: { 正社員: '年収460万円〜' },
    lead: 'ロウリュ研究所とサ活の楽しさを、外に向けて発信する仕事です。SNS とプレスリリースを担当します。',
    tasks: [
      'SNS の投稿の企画と、写真の撮影',
      'プレスリリースの作成と、取材の対応',
      '研究棟で行うイベントの告知',
    ],
    closing:
      '研究棟のスタッフに話を聞きに行くことが多い仕事です。取材のあとは、そのままサウナに入れます。',
  },
  {
    name: 'Web エンジニア',
    category: 'office',
    locations: ['本社'],
    salary: { 正社員: '年収520万円〜' },
    lead: 'この採用サイトと、研究棟の予約サイトを作る仕事です。作り方は、チームで比べて決めています。',
    tasks: [
      '採用サイトと予約サイトの開発と運用',
      '研究棟の混雑状況を出す仕組みの開発',
      '社内で使う道具の開発',
    ],
    closing:
      '採用サイトは、静的サイトの作り方を比べるために、同じものを3回作りました。比べるのが好きな方を歓迎します。',
  },
]

const REQUIREMENTS = {
  正社員:
    '未経験でも応募できます。サウナが好きな方を歓迎します。週5日、シフト制で働ける方。',
  アルバイト:
    '未経験でも応募できます。サウナが好きな方を歓迎します。週2日、1日4時間から働ける方。',
}

const { values } = parseArgs({
  options: {
    count: { type: 'string' },
    out: { type: 'string', default: DEFAULT_OUT },
  },
})

const count = Number(values.count)
if (!COUNTS.includes(count)) {
  console.error(`--count には ${COUNTS.join(' / ')} のどれかを指定してください`)
  process.exit(1)
}

// 通し番号を種にした擬似乱数で、英数字の ID を作る（microCMS の ID に見た目を寄せる）
const toId = (index) => {
  let seed = index + 1
  let id = ''
  for (let i = 0; i < ID_LENGTH; i++) {
    // mulberry32
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    id += ID_CHARS[((t ^ (t >>> 14)) >>> 0) % ID_CHARS.length]
  }
  return id
}

const toBody = ({ lead, tasks, closing }) =>
  `<p>${lead}</p><ul>${tasks.map((task) => `<li>${task}</li>`).join('')}</ul><p>${closing}</p>`

const toJob = (index) => {
  const type = JOB_TYPES[index % JOB_TYPES.length]
  const round = Math.floor(index / JOB_TYPES.length)
  const location = type.locations[round % type.locations.length]
  const employmentTypes = Object.keys(type.salary)
  // 研究棟をひと回りするごとに雇用形態を切り替え、どの研究棟にも両方の求人が出るようにする
  const employmentType =
    employmentTypes[
      Math.floor(round / type.locations.length) % employmentTypes.length
    ]
  const date = new Date(
    LATEST_PUBLISHED_AT - index * PUBLISH_INTERVAL_HOURS * 60 * 60 * 1000,
  ).toISOString()

  return {
    id: toId(index),
    createdAt: date,
    updatedAt: date,
    publishedAt: date,
    revisedAt: date,
    // 「本社の Web エンジニア」のように、英字で始まる職種名の前には空白を入れる
    title: `${location}の${/^[A-Za-z]/.test(type.name) ? ' ' : ''}${type.name}（${employmentType}）`,
    // microCMS のセレクトフィールドは、1つだけ選ぶ設定でも配列で返る
    category: [type.category],
    location: [location],
    employmentType: [employmentType],
    salary: type.salary[employmentType],
    body: toBody(type),
    requirements: REQUIREMENTS[employmentType],
  }
}

const jobs = Array.from({ length: count }, (_, index) => toJob(index))

if (new Set(jobs.map((job) => job.id)).size !== jobs.length) {
  throw new Error('求人の ID が重なりました')
}

mkdirSync(dirname(values.out), { recursive: true })
writeFileSync(values.out, `${JSON.stringify(jobs, null, 2)}\n`)

const bodyLengths = jobs.map((job) => job.body.length)
const range =
  jobs.length > 0
    ? `${Math.min(...bodyLengths)}〜${Math.max(...bodyLengths)}`
    : '-'
console.log(
  `${count}件を ${values.out} に書き出しました（本文の文字数 ${range}）`,
)
