import type { Metadata } from 'next'
import { ApplyCta } from '../components/ApplyCta'
import { Photo, type PhotoName } from '../components/Photo'

export const metadata: Metadata = {
  title: '私たちについて',
  description:
    'ロウリュ研究所の5つの研究棟と、大事にしていることを紹介します。',
}

const LABS: { name: string; text: string; photo: PhotoName; alt: string }[] = [
  {
    name: '神田研究棟',
    text: '最初の研究棟。サウナ室は92℃、いちばん熱い',
    photo: 'lab-kanda',
    alt: 'サウナストーンを積んだストーブのある、木のサウナ室',
  },
  {
    name: '中野研究棟',
    text: '薪ストーブのサウナがある',
    photo: 'lab-nakano',
    alt: '煙突から煙が上がる、森の中のサウナ小屋',
  },
  {
    name: '横浜研究棟',
    text: '海風で外気浴ができる',
    photo: 'lab-yokohama',
    alt: '海辺の岩場に建つサウナ小屋',
  },
  {
    name: '大宮研究棟',
    text: '水風呂が3つ。13℃、16℃、20℃',
    photo: 'lab-omiya',
    alt: '真上から見た、石張りの水風呂',
  },
  {
    name: '湖畔研究棟',
    text: 'テントサウナの拠点。湖が水風呂',
    photo: 'lab-kohan',
    alt: '湖のほとりに置いた樽型のサウナ',
  },
]

export default function About() {
  return (
    <>
      <div className="container">
        <header className="page-head">
          <h1 className="page-head__title">私たちについて</h1>
          <p className="page-head__lead">
            温度と湿度と休憩の組み合わせを、毎日まじめに試している会社です。
          </p>
        </header>
        <Photo
          name="band-about"
          alt="雪の中に建つ、木とガラスの小さなサウナ小屋"
          className="photo-band"
          layout="wide"
          eager
        />

        <section className="section">
          <h2 className="section__title">5つの研究棟</h2>
          <ul className="lab-list">
            {LABS.map(({ name, text, photo, alt }) => (
              <li className="lab-list__item" key={name}>
                <Photo
                  name={photo}
                  alt={alt}
                  className="lab-list__image"
                  layout="third"
                />
                <h3 className="lab-list__name">{name}</h3>
                <p className="lab-list__text">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <h2 className="section__title">大事にしていること</h2>
          <div className="section__body">
            <p>
              熱さを競わないこと。お客さまがいちばん気持ちよく出られる温度を、研究棟ごとに探し続けています。
            </p>
          </div>
        </section>
      </div>

      <ApplyCta />
    </>
  )
}
