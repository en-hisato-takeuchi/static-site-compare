import type { Job } from '../lib/cms'
import { CATEGORY_LABELS } from '../lib/jobs'
import { JobDate } from './JobDate'

type Props = {
  jobs: Job[]
  // 置く場所に合わせた見出しのレベル。トップの新着は h3、求人一覧は h2
  level: 2 | 3
}

export function JobList({ jobs, level }: Props) {
  if (jobs.length === 0) {
    return <p className="empty-state">現在募集している職種はありません。</p>
  }
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <ul className="job-list">
      {jobs.map((job) => (
        <li className="job-list__item" key={job.id}>
          <Heading className="job-list__title">
            <a href={`/jobs/${job.id}/`}>{job.title}</a>
          </Heading>
          <dl className="job-list__meta">
            <dt>職種カテゴリ</dt>
            <dd>
              <span className="category-tag">
                {CATEGORY_LABELS[job.category[0]]}
              </span>
            </dd>
            <dt>勤務地</dt>
            <dd>{job.location[0]}</dd>
            <dt>雇用形態</dt>
            <dd>{job.employmentType[0]}</dd>
            <dt>給与</dt>
            <dd>{job.salary}</dd>
          </dl>
          <p className="job-list__date">
            公開日 <JobDate iso={job.publishedAt} />
          </p>
        </li>
      ))}
    </ul>
  )
}
