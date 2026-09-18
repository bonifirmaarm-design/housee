import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///home/user/housee/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);

const state = () => p.evaluate(() => ({
  hash: location.hash, y: Math.round(window.scrollY),
  dlg: !!document.querySelector('#sheet')?.open,
  room: document.querySelector('.rooms__tab.is-on')?.dataset.room,
  pinOpen: document.querySelectorAll('.pin__pill[aria-expanded="true"]').length,
  status: document.querySelector('#lead-status')?.textContent || ''
}));

async function check(sel, label, nth = 0) {
  const els = await p.$$(sel);
  const el = els[nth];
  if (!el) return console.log(`  ✗ ${label} — элемент не найден`);
  const before = await state();
  try { await el.scrollIntoViewIfNeeded({ timeout: 3000 }); await el.click({ timeout: 3000 }); }
  catch { return console.log(`  ✗ ${label} — клик не прошёл`); }
  await p.waitForTimeout(500);
  const after = await state();
  const ok = JSON.stringify(before) !== JSON.stringify(after);
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (after.dlg) { await p.keyboard.press('Escape'); await p.waitForTimeout(350); }
}

console.log('=== ПРОВЕРКА НАЖАТИЙ ===');
await check('.hero .seal', 'печать → проекты');
await check('.film', 'карточка видео → студия');
await check('.mani__link', 'ссылка в тёмном блоке');
await check('.shot', 'карточка проекта открывает окно');
await check('.rooms__tab[data-room="kitchen"]', 'вкладка «Кухня»');
await check('.rooms__tab[data-room="bedroom"]', 'вкладка «Спальня»');
await check('.rooms__tab[data-room="terrace"]', 'вкладка «Терраса»');
await check('.rooms__tab[data-room="living"]', 'вкладка «Гостиная»');
await check('.pin.is-on .pin__pill', 'выноска раскрывается');
await check('.pin.is-on .pin__pill', 'выноска закрывается');
await check('.nav a[href="#team"]', 'меню → студия');
await check('.send', 'кнопка формы (пустая → ошибка)');

// вращения быть не должно
const spin = await p.evaluate(() => [...document.querySelectorAll('*')]
  .filter(e => { const a = getComputedStyle(e).animationName; return a && a !== 'none'; })
  .map(e => e.className.toString().slice(0,30)));
console.log('\nвращающиеся элементы:', spin.length ? spin : 'нет');
console.log(errs.length ? 'ОШИБКИ: ' + errs.join('; ') : 'ошибок нет');
await b.close();
