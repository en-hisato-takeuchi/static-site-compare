// スマホのメニューの開閉。3構成で同じものを使う。
// <html> に js クラスを付ける処理は、表示のずれを防ぐため <head> のインラインスクリプトで行う。
const toggle = document.querySelector('.site-nav__toggle')
const nav = document.querySelector('.site-nav')

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!isOpen))
    nav.dataset.open = String(!isOpen)
  })
}
