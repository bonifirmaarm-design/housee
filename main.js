/* ГРАНЬ — поведение страницы.
   Одна спокойная сцена на загрузке, остальное — ответ на действие. */
(function () {
  'use strict';

  var root  = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js');
  // бургер имеет право появиться только там, где панель действительно
  // откроется: иначе на старом телефоне он был бы мёртвой кнопкой,
  // а разделов в шапке уже не было бы
  if (window.HTMLDialogElement && HTMLDialogElement.prototype.showModal) root.classList.add('dlg');

  /* ---------- 1. Выход первого экрана ---------- */
  function open() {
    if (still.matches) { root.classList.add('is-lit'); return; }
    root.classList.add('is-armed');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-lit'); });
    });
  }
  if (document.fonts && document.fonts.ready) {
    var late = setTimeout(open, 700);
    document.fonts.ready.then(function () { clearTimeout(late); open(); });
  } else { open(); }

  /* ---------- 2. Плавный переход по якорям ---------- */
  /* Родной scroll-behavior: smooth растягивает ход на всю дистанцию, и на
     странице в десять тысяч пикселей переход из меню в «Контакты» полз
     через всю её высоту. Здесь длительность постоянная: и короткий, и
     длинный прыжок занимают одно и то же время, поэтому ход остаётся
     плавным, но никогда не превращается в ползание. */
  var GLIDE = 620;
  var gliding = 0;

  function stopGlide() { if (gliding) { cancelAnimationFrame(gliding); gliding = 0; } }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, stopGlide, { passive: true });
  });

  function glideTo(target, id) {
    var from = window.scrollY;
    var max  = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var to   = Math.min(max, Math.max(0, Math.round(target.getBoundingClientRect().top + from)));
    function land() { if (id) history.replaceState(null, '', '#' + id); }

    stopGlide();
    if (still.matches || Math.abs(to - from) < 2) { window.scrollTo(0, to); land(); return; }

    var t0 = 0;
    gliding = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / GLIDE);
      window.scrollTo(0, from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) { gliding = requestAnimationFrame(step); } else { gliding = 0; land(); }
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    glideTo(target, id);
  });

  /* ---------- 3. Комнаты: вкладки, «капля», выноски ---------- */
  var rooms = document.querySelector('.rooms');

  if (rooms) {
    var tabs   = Array.prototype.slice.call(rooms.querySelectorAll('.rooms__t'));
    var blob   = rooms.querySelector('.rooms__blob');
    var drop   = rooms.querySelector('.rooms__drop');
    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    var pins   = Array.prototype.slice.call(document.querySelectorAll('.pin'));
    var pills  = Array.prototype.slice.call(document.querySelectorAll('.pin__b'));
    var live   = tabs[0];
    var timer  = null;

    // высоту задаём явно: на узком экране ряд переносится, и «капля»
    // ростом с весь блок вкладок растягивалась на обе строки
    function seat(tab, glide) {
      if (!blob || !tab) return;
      var w = tab.offsetWidth, h = tab.offsetHeight, x = tab.offsetLeft, y = tab.offsetTop;
      if (glide && !still.matches && drop) {
        drop.style.width = blob.style.width;
        drop.style.height = blob.style.height;
        drop.style.transform = blob.style.transform;
        drop.classList.add('is-out');
        window.setTimeout(function () {
          drop.style.width = w + 'px';
          drop.style.height = h + 'px';
          drop.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        }, 20);
        window.setTimeout(function () { drop.classList.remove('is-out'); }, 470);
      }
      blob.style.width = w + 'px';
      blob.style.height = h + 'px';
      blob.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }

    function showPins(room) {
      window.clearTimeout(timer);
      pins.forEach(function (p) { p.classList.remove('is-on'); });
      timer = window.setTimeout(function () {
        pins.forEach(function (p) { if (p.dataset.room === room) p.classList.add('is-on'); });
      }, still.matches ? 0 : 380);
    }

    function pick(tab, glide) {
      if (!tab || tab === live) return;
      var room = tab.dataset.room;
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      slides.forEach(function (s) { s.classList.toggle('is-on', s.dataset.room === room); });
      pills.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      layer();
      showPins(room);
      seat(tab, glide);
      live = tab;
    }

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.classList.contains('is-on') ? 0 : -1;
      tab.addEventListener('click', function () { pick(tab, true); });
      tab.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus(); pick(next, true);
      });
    });

    // раскрытую выноску поднимаем над соседней, а соседнюю уводим во второй
    // слой: иначе свёрнутая пилюля накрывает раскрытую и съедает её текст
    var stage = document.querySelector('.stage');
    function layer() {
      var any = false;
      pins.forEach(function (pn) {
        var on = pn.querySelector('.pin__b').getAttribute('aria-expanded') === 'true';
        pn.classList.toggle('is-open', on);
        if (on) any = true;
      });
      if (stage) stage.classList.toggle('is-telling', any);
    }

    // тап по самому кадру сворачивает раскрытую выноску. Без этого выхода
    // из раскрытой в соседнюю не перейти: раскрытая пилюля перекрывает
    // соседнюю почти целиком, и нажать по ней просто некуда.
    if (stage) stage.addEventListener('click', function (e) {
      if (e.target.closest('.pin')) return;
      pills.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      layer();
    });

    // выноска раскрывает подробность; открыта всегда одна
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var open = pill.getAttribute('aria-expanded') === 'true';
        pills.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
        pill.setAttribute('aria-expanded', open ? 'false' : 'true');
        layer();
      });
    });

    var settle = function () { seat(live, false); };
    settle();
    showPins(live.dataset.room);
    window.addEventListener('resize', settle);
    window.addEventListener('load', settle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  }

  /* ---------- 4. Меню на телефоне ---------- */
  var burger = document.querySelector('.bar .burger');
  var menu   = document.getElementById('menu');
  var narrow = window.matchMedia('(max-width: 760px)');

  if (burger && menu && typeof menu.showModal === 'function') {
    var lock = document.documentElement;
    var jump = false;   // закрылись переходом по ссылке — фокус не возвращаем

    // Ход панели целиком на CSS (см. allow-discrete в styles.css), поэтому
    // здесь нет ни таймеров, ни ожидания transitionend: close() исполняется
    // сразу и не может не исполниться.
    // шапка панели должна встать ровно на шапку страницы. Диалог в верхнем
    // слое считается от экрана, а страница — от отступа, который обёртка
    // (в артефакте — под «чёлку») кладёт на :root. Измеряем его каждый раз:
    // при повороте телефона он меняется.
    function seatBar() {
      var r = getComputedStyle(lock), bd = getComputedStyle(document.body);
      var top = (parseFloat(r.paddingTop) || 0) + (parseFloat(bd.paddingTop) || 0);
      var bot = (parseFloat(r.paddingBottom) || 0) + (parseFloat(bd.paddingBottom) || 0);
      menu.style.setProperty('--safe-top', top + 'px');
      menu.style.setProperty('--safe-bottom', bot + 'px');
    }

    function raise() {
      jump = false;
      seatBar();
      burger.setAttribute('aria-expanded', 'true');
      lock.classList.add('is-menu');
      if (!menu.open) { menu.showModal(); menu.focus({ preventScroll: true }); }
    }
    function drop() { if (menu.open) menu.close(); }
    // по ссылке закрываем так же, но фокус потом не возвращаем: focus()
    // прокручивает к элементу и утащил бы страницу обратно наверх
    function cut()  { jump = true; if (menu.open) menu.close(); }

    burger.addEventListener('click', raise);
    menu.querySelector('[data-close]').addEventListener('click', drop);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', cut); });
    menu.addEventListener('close', function () {
      burger.setAttribute('aria-expanded', 'false');
      lock.classList.remove('is-menu');
      if (!jump) burger.focus({ preventScroll: true });
    });
    // экран стал широким — разделы снова стоят в шапке, панель здесь лишняя
    narrow.addEventListener('change', function (e) { if (!e.matches) cut(); });
    // страховка: если панель почему-то не открыта, прокрутка обязана быть
    // свободной. Иначе застрявший замок выглядит как намертво повисший сайт.
    window.addEventListener('pageshow', function () {
      if (!menu.open) lock.classList.remove('is-menu');
    });
  }

  /* ---------- 5. Окно проекта ---------- */
  var sheet = document.getElementById('sheet');

  if (sheet && typeof sheet.showModal === 'function') {
    var sImg  = document.getElementById('sheet-img');
    var sName = document.getElementById('sheet-name');
    var sSpec = document.getElementById('sheet-spec');
    var sText = document.getElementById('sheet-text');
    var opener = null;

    document.querySelectorAll('[data-img]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        sImg.src = btn.dataset.img;
        sImg.alt = btn.dataset.alt || '';
        sName.textContent = btn.dataset.name;
        sSpec.textContent = btn.dataset.spec;
        sText.textContent = btn.dataset.text;
        sheet.scrollTop = 0;
        sheet.showModal();
        sheet.focus({ preventScroll: true });   // не на крестик: иначе он обводится рамкой
      });
    });

    var away = false;   // ушли по кнопке к форме — фокус на карточку не возвращаем

    sheet.querySelector('.sheet__x').addEventListener('click', function () { sheet.close(); });
    // «Хочу такой же» закрывает окно и уводит к форме. Возврат фокуса на
    // карточку прокручивал страницу обратно к ней, и переход не срабатывал
    sheet.querySelector('.btn').addEventListener('click', function () { away = true; sheet.close(); });
    // диалог закрывается синхронно, но ход к форме считает позиции уже после:
    // пока окно открыто, прокрутка страницы заблокирована самим диалогом

    // клик мимо карточки закрывает окно
    sheet.addEventListener('click', function (e) {
      if (e.target !== sheet) return;
      var b = sheet.getBoundingClientRect();
      if (e.clientY < b.top || e.clientY > b.bottom || e.clientX < b.left || e.clientX > b.right) sheet.close();
    });
    sheet.addEventListener('close', function () {
      if (opener && !away) opener.focus({ preventScroll: true });
      away = false;
    });
  }

  /* ---------- 6. Форма ---------- */
  var form = document.getElementById('lead');

  if (form) {
    var say = document.getElementById('lead-status');
    var send = form.querySelector('button[type="submit"]');
    var wording = send ? send.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!say) return;
      var name = form.elements.name.value.trim();
      var how  = form.elements.contact.value.trim();
      say.classList.remove('is-bad');

      if (!name) {
        say.classList.add('is-bad');
        say.textContent = 'Не хватает имени — без него не поймём, к кому обращаться.';
        form.elements.name.focus(); return;
      }
      if (!how) {
        say.classList.add('is-bad');
        say.textContent = 'Не хватает телефона или почты — иначе ответ некуда отправить.';
        form.elements.contact.focus(); return;
      }

      if (send) { send.disabled = true; send.textContent = 'Отправляем'; }
      window.setTimeout(function () {
        say.textContent = name + ', участок у нас. Ответим в течение рабочего дня.';
        form.reset();
        if (send) { send.disabled = false; send.textContent = wording; }
      }, 550);
    });
  }
})();
