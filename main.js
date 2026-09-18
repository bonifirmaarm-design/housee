/* ГРАНЬ — поведение страницы.
   Одна спокойная сцена на загрузке, остальное — ответ на действие. */
(function () {
  'use strict';

  var root  = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js');

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

  /* ---------- 2. Комнаты: вкладки, «капля», выноски ---------- */
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

    function seat(tab, glide) {
      if (!blob || !tab) return;
      var w = tab.offsetWidth, x = tab.offsetLeft, y = tab.offsetTop;
      if (glide && !still.matches && drop) {
        drop.style.width = blob.style.width;
        drop.style.transform = blob.style.transform;
        drop.classList.add('is-out');
        window.setTimeout(function () {
          drop.style.width = w + 'px';
          drop.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        }, 20);
        window.setTimeout(function () { drop.classList.remove('is-out'); }, 470);
      }
      blob.style.width = w + 'px';
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

    // выноска раскрывает подробность; открыта всегда одна
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var open = pill.getAttribute('aria-expanded') === 'true';
        pills.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
        pill.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });

    var settle = function () { seat(live, false); };
    settle();
    showPins(live.dataset.room);
    window.addEventListener('resize', settle);
    window.addEventListener('load', settle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  }

  /* ---------- 3. Окно проекта ---------- */
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
      });
    });

    sheet.querySelector('.sheet__x').addEventListener('click', function () { sheet.close(); });
    sheet.querySelector('.btn').addEventListener('click', function () { sheet.close(); });

    // клик мимо карточки закрывает окно
    sheet.addEventListener('click', function (e) {
      if (e.target !== sheet) return;
      var b = sheet.getBoundingClientRect();
      if (e.clientY < b.top || e.clientY > b.bottom || e.clientX < b.left || e.clientX > b.right) sheet.close();
    });
    sheet.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- 4. Форма ---------- */
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
