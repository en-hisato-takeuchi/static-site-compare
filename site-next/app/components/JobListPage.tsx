// 求人一覧の1ページ分。/jobs/ と /jobs/page/{n}/ で使う
import { getJobs } from '../lib/cms'
import { PER_PAGE, pageUrl } from '../lib/jobs'
import { ApplyCta } from './ApplyCta'
import { JobList } from './JobList'

export async function JobListPage({ page }: { page: number }) {
  const { contents, totalCount } = await getJobs(
    PER_PAGE,
    (page - 1) * PER_PAGE,
  )
  const lastPage = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)

  return (
    <>
      <div className="container">
        <header className="page-head">
          <h1 className="page-head__title">求人一覧</h1>
        </header>
        {totalCount > 0 && <p className="job-count">全{totalCount}件</p>}
        <JobList jobs={contents} level={2} />
        {lastPage > 1 && (
          <nav className="pagination" aria-label="ページ送り">
            <ul className="pagination__list">
              {page > 1 && (
                <li>
                  <a className="pagination__link" href={pageUrl(page - 1)}>
                    前へ
                  </a>
                </li>
              )}
              {pages.map((n) => (
                <li key={n}>
                  <a
                    className="pagination__link"
                    href={pageUrl(n)}
                    aria-current={n === page ? 'page' : undefined}
                  >
                    {n}
                  </a>
                </li>
              ))}
              {page < lastPage && (
                <li>
                  <a className="pagination__link" href={pageUrl(page + 1)}>
                    次へ
                  </a>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>

      <ApplyCta />
    </>
  )
}
