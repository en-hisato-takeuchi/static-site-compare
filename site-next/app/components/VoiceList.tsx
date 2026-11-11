import { Photo, type PhotoName } from './Photo'

const VOICES: {
  quote: string
  person: string
  photo: PhotoName
  alt: string
}[] = [
  {
    quote: '入社理由は、ととのったからです。',
    person: '熱波師／神田研究棟／2023年入社',
    photo: 'voice-towel',
    alt: 'サウナ室のベンチに掛けたタオル',
  },
  {
    quote: '水温が16.1℃になると、夜中でも目が覚めます。',
    person: '水風呂の温度管理／横浜研究棟／2021年入社',
    photo: 'voice-bucket',
    alt: '沢の水を引き込んだ水風呂',
  },
  {
    quote: 'この採用サイトは3回作り直しました。',
    person: 'Web エンジニア／本社／2024年入社',
    photo: 'voice-laptop',
    alt: '机の上のノートパソコンとコーヒー',
  },
]

export function VoiceList() {
  return (
    <ul className="voice-list">
      {VOICES.map(({ quote, person, photo, alt }) => (
        <li className="voice-list__item" key={photo}>
          <Photo
            name={photo}
            alt={alt}
            className="voice-list__photo"
            layout="third"
          />
          <p className="voice-list__quote">{quote}</p>
          <p className="voice-list__person">{person}</p>
        </li>
      ))}
    </ul>
  )
}
