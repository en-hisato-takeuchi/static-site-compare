import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ApplyCta } from './components/ApplyCta'
import { Photo, type PhotoName } from './components/Photo'
import { VoiceList } from './components/VoiceList'

export const metadata: Metadata = {
  description:
    '都市の5つの研究棟で、ととのいを研究し、届ける仲間を募集しています。',
}

const CATEGORIES: {
  name: string
  text: string
  photo: PhotoName
  alt: string
}[] = [
  {
    name: '店舗スタッフ',
    text: '熱波師、ロウリュ担当、休憩処スタッフ。お客さまのいちばん近くで、温度を届けます。',
    photo: 'category-store',
    alt: 'サウナストーンにひしゃくで水をかけるところ',
  },
  {
    name: '施設管理',
    text: '水風呂の温度管理、サウナストーブの保守、テントサウナの設営。研究棟の環境を守ります。',
    photo: 'category-facility',
    alt: '窓辺に置いたサウナストーブ',
  },
  {
    name: '本社',
    text: '新店舗の開発、広報、Web エンジニア。次の研究棟と、ここまでの道のりをつくります。',
    photo: 'category-office',
    alt: 'ノートパソコンで仕事をする社員の手元',
  },
]

// 目盛りの位置。CSS のカスタムプロパティで渡す
const at = (position: string) => ({ '--at': position }) as CSSProperties

export default function Home() {
  return (
    <>
      <section className="hero">
        <Photo
          name="hero"
          alt="ガラス越しに見た、木のベンチが並ぶサウナ室"
          className="hero__image"
          layout="hero"
        />
        <div className="hero__body">
          <div className="container">
            <h1 className="hero__title">
              熱いのは、
              <br />
              サウナだけじゃない。
            </h1>
            <p className="hero__lead">
              都市の5つの研究棟で、ととのいを研究し、届ける仲間を募集しています。
            </p>
            <a className="button" href="/process/">
              応募する
            </a>
          </div>
        </div>
      </section>

      <section className="container section" id="about">
        <h2 className="section__title">私たちについて</h2>
        <div className="section__body">
          <p>
            ロウリュ研究所は、都市型のサウナ施設を5つ運営しています。店舗を「研究棟」と呼ぶのは、温度と湿度と休憩の組み合わせを、毎日まじめに試しているからです。
          </p>
          <p className="section__more">
            <a href="/about/">私たちについて詳しく見る</a>
          </p>
        </div>
        <div className="photo-mosaic">
          <figure className="photo-mosaic__main">
            <Photo
              name="mosaic-sauna"
              alt="照明に照らされた、広いサウナ室とサウナストーブ"
              className="photo-mosaic__image"
              layout="main"
            />
            <figcaption>
              神田研究棟のサウナ室。92℃で毎朝10時に開きます。
            </figcaption>
          </figure>
          <figure className="photo-mosaic__sub">
            <Photo
              name="mosaic-plunge"
              alt="岩場に置いた金属の水風呂"
              className="photo-mosaic__image"
              layout="third"
            />
            <figcaption>水風呂は16.0℃。</figcaption>
          </figure>
          <figure className="photo-mosaic__sub">
            <Photo
              name="mosaic-chairs"
              alt="森に面したテラスに並ぶ2脚の椅子"
              className="photo-mosaic__image"
              layout="third"
            />
            <figcaption>外気浴の椅子は、毎日向きを調整しています。</figcaption>
          </figure>
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">温度で見るロウリュ研究所</h2>
        <div className="thermo">
          <div className="thermo__scale" aria-hidden="true">
            <span className="thermo__mark thermo__mark--cold" style={at('0%')}>
              16℃
            </span>
            <span
              className="thermo__mark thermo__mark--air"
              style={at('10.5%')}
            >
              24℃
            </span>
            <span className="thermo__mark thermo__mark--hot" style={at('100%')}>
              92℃
            </span>
          </div>
          <dl className="thermo__list">
            <div className="thermo__item thermo__item--cold">
              <dt className="thermo__label">
                水風呂。夏も冬も、0.1℃単位で守っています
              </dt>
              <dd className="thermo__value">16.0℃</dd>
            </div>
            <div className="thermo__item">
              <dt className="thermo__label">
                外気浴スペースの、いちばん気持ちいい気温
              </dt>
              <dd className="thermo__value">24℃</dd>
            </div>
            <div className="thermo__item thermo__item--hot">
              <dt className="thermo__label">神田研究棟のサウナ室</dt>
              <dd className="thermo__value">92℃</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">3つの仕事</h2>
        <ul className="category-cards">
          {CATEGORIES.map(({ name, text, photo, alt }) => (
            <li className="category-cards__item" key={name}>
              <Photo
                name={photo}
                alt={alt}
                className="category-cards__image"
                layout="third"
              />
              <div className="category-cards__body">
                <h3 className="category-cards__title">{name}</h3>
                <p className="category-cards__text">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <h2 className="section__title">研究員の声</h2>
        <VoiceList />
      </section>

      <ApplyCta />
    </>
  )
}
