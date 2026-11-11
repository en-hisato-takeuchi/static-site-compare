// いまの仕様で変わる値。仕様変更（#9）で、応募ボタンの文言とリンク先が変わった
export const APPLY_BUTTON = {
  text: 'まずはサウナ見学から',
  href: '/process/#visit',
}

export const jobUrl = (job) => `/jobs/${job.category[0]}/${job.id}/`
