const TIME_ZONE = 'Asia/Tokyo'
const labelFormat = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'long',
  timeZone: TIME_ZONE,
})
// sv-SE の書式は YYYY-MM-DD になる
const datetimeFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE })

export function JobDate({ iso }: { iso: string }) {
  const date = new Date(iso)
  return (
    <time dateTime={datetimeFormat.format(date)}>
      {labelFormat.format(date)}
    </time>
  )
}
