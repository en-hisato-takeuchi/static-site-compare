// 求人一覧の1ページ分。/jobs/、/jobs/{category}/ と、それぞれの2ページ目以降で使う
import { type Category, getJobs } from '../lib/cms'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PER_PAGE,
  listUrl,
  pageUrl,
} from '../lib/jobs'
import { ApplyCta } from './ApplyCta'
import { JobList } from './JobList'

type Props = {
  page: number
  // 渡さないときは、すべての職種の一覧
  category?: Category
}

export async function JobListPage({ page, category }: Props) {
  const { contents, totalCount } = await getJobs(
    PER_PAGE,
    (page - 1) * PER_PAGE,
    category,
  )
  const heading = category ? `${CATEGORY_LABELS[category]}の求人` : '求人一覧'
  const categoryLinks = [
    { category: undefined, label: 'すべて' },
    ...CATEGORIES.map((slug) => ({
      category: slug,
      label: CATEGORY_LABELS[slug],
    })),
  ]
  const lastPage = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)

  return (
    <>
      <div className="container">
        <header className="page-head">
          <h1 className="page-head__title">{heading}</h1>
        </header>
        <nav
          className="category-nav"
          id="category-nav"
          aria-label="職種カテゴリ"
        >
          <ul className="category-nav__list">
            {categoryLinks.map((link) => (
              <li key={link.label}>
                <a
                  className="category-nav__link"
                  href={listUrl(link.category)}
                  aria-current={link.category === category ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {totalCount > 0 && <p className="job-count">全{totalCount}件</p>}
        <JobList jobs={contents} level={2} />
        {lastPage > 1 && (
          <nav className="pagination" aria-label="ページ送り">
            <ul className="pagination__list">
              {page > 1 && (
                <li>
                  <a
                    className="pagination__link"
                    href={pageUrl(page - 1, category)}
                  >
                    前へ
                  </a>
                </li>
              )}
              {pages.map((n) => (
                <li key={n}>
                  <a
                    className="pagination__link"
                    href={pageUrl(n, category)}
                    aria-current={n === page ? 'page' : undefined}
                  >
                    {n}
                  </a>
                </li>
              ))}
              {page < lastPage && (
                <li>
                  <a
                    className="pagination__link"
                    href={pageUrl(page + 1, category)}
                  >
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
