import type { Metadata } from 'next'
import { JobListPage } from '../components/JobListPage'

export const metadata: Metadata = {
  title: '求人一覧',
  description: 'ロウリュ研究所で募集している職種の一覧です。',
}

export default function Jobs() {
  return <JobListPage page={1} />
}
