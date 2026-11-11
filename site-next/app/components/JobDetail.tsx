import { CATEGORY_LABELS } from '../lib/jobs'
import type { Category, Job } from '../lib/cms'
import { JobDate } from './JobDate'
import { Photo, type PhotoName } from './Photo'

// 求人詳細に出す項目。公開済みの求人も、プレビューの下書きも、この形で渡す
export type JobContent = Pick<
  Job,
  | 'title'
  | 'category'
  | 'location'
  | 'employmentType'
  | 'salary'
  | 'body'
  | 'requirements'
  | 'publishedAt'
>

// 求人データに写真は持たせず、職種カテゴリの写真を使う
const CATEGORY_PHOTOS: Record<Category, { name: PhotoName; alt: string }> = {
  store: {
    name: 'category-store',
    alt: 'サウナストーンにひしゃくで水をかけるところ',
  },
  facility: { name: 'category-facility', alt: '窓辺に置いたサウナストーブ' },
  office: {
    name: 'category-office',
    alt: 'ノートパソコンで仕事をする社員の手元',
  },
}

// 求人詳細の本文。公開用のページ（jobs/[slug]/[id]）とプレビュー（jobs/preview）で共有する
export function JobDetail({ job }: { job: JobContent }) {
  const category = job.category[0]
  const photo = CATEGORY_PHOTOS[category]

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="パンくず">
        <ol className="breadcrumb__list">
          <li className="breadcrumb__item">
            <a href="/">トップ</a>
          </li>
          <li className="breadcrumb__item">
            <a href="/jobs/">求人一覧</a>
          </li>
          <li className="breadcrumb__item">
            <a href={`/jobs/${category}/`}>{CATEGORY_LABELS[category]}</a>
          </li>
          <li className="breadcrumb__item" aria-current="page">
            {job.title}
          </li>
        </ol>
      </nav>
      <article className="job-detail">
        <h1 className="job-detail__title">{job.title}</h1>
        <Photo
          name={photo.name}
          alt={photo.alt}
          className="job-detail__image"
          layout="prose"
          eager
        />
        <dl className="job-summary">
          <dt>職種カテゴリ</dt>
          <dd>
            <span className="category-tag">{CATEGORY_LABELS[category]}</span>
          </dd>
          <dt>勤務地</dt>
          <dd>{job.location[0]}</dd>
          <dt>雇用形態</dt>
          <dd>{job.employmentType[0]}</dd>
          <dt>給与</dt>
          <dd>{job.salary}</dd>
          <dt>公開日</dt>
          <dd>
            <JobDate iso={job.publishedAt} />
          </dd>
        </dl>
        <section className="job-detail__section">
          <h2 className="job-detail__heading">仕事内容</h2>
          {/* CMS のリッチエディタの HTML をそのまま入れる */}
          <div
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: job.body }}
          />
        </section>
        <section className="job-detail__section">
          <h2 className="job-detail__heading">応募の条件</h2>
          <div className="section__body">
            <p>{job.requirements}</p>
          </div>
        </section>
        <div className="job-detail__actions">
          <a className="button" href="/process/#visit">
            まずはサウナ見学から
          </a>
          <a href="/jobs/">求人一覧に戻る</a>
        </div>
      </article>
    </div>
  )
}
