import type { Metadata } from 'next'
import { ApplyCta } from '../components/ApplyCta'
import { Photo } from '../components/Photo'

export const metadata: Metadata = {
  title: '選考の流れ',
  description: '応募から内定までの流れと、サウナ見学の案内です。',
}

const STEPS = [
  { title: '応募', text: '求人一覧から、気になる職種に応募してください。' },
  { title: '書類選考', text: '1週間ほどで結果をお知らせします。' },
  { title: '面接', text: '研究棟の会議室で、配属先の責任者と話します。' },
  {
    title: '最終面接',
    text: '最終面接はサウナで行います（任意）。服装は館内着で構いません。',
  },
  { title: '内定', text: '入社日は相談して決めます。' },
]

export default function Process() {
  return (
    <>
      <div className="container">
        <header className="page-head">
          <h1 className="page-head__title">選考の流れ</h1>
          <p className="page-head__lead">
            応募から内定まで、3週間ほどかかります。
          </p>
        </header>

        <section className="section">
          <h2 className="section__title">選考のステップ</h2>
          <ol className="step-list">
            {STEPS.map(({ title, text }) => (
              <li className="step-list__item" key={title}>
                <h3 className="step-list__title">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section" id="visit">
          <h2 className="section__title">サウナ見学</h2>
          <div className="section__body">
            <p>
              応募の前に、研究棟を見学できます。仕事の様子を見たあと、そのままサウナに入っていってください。
            </p>
          </div>
          <Photo
            name="visit"
            alt="サウナ小屋の入口。壁にタオルが掛かっている"
            className="prose-image"
            layout="prose"
          />
        </section>

        <section className="section">
          <h2 className="section__title">よくある質問</h2>
          <dl className="faq section__body">
            <dt>サウナが苦手でも働けますか？</dt>
            <dd>本社の職種なら、サウナ室に入る仕事はありません。</dd>
            <dt>熱波師は未経験でも応募できますか？</dt>
            <dd>できます。入社後3か月、タオルの振り方から研修します。</dd>
          </dl>
        </section>
      </div>

      <ApplyCta />
    </>
  )
}
