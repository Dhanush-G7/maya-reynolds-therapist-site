(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  // Mobile menu
  var btn = $('.menu-btn'), nav = $('#nav'), lbl = $('.lbl', btn);
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    lbl.textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !e.target.closest('.pill')) setMenu(false);
  });
  window.matchMedia('(min-width:1200px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  // Scroll to top (Home link, brand, back-to-top button)
  function goTop(e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('a[href="#top"]').forEach(function (a) { a.addEventListener('click', goTop); });
  var toTop = $('#toTop');
  toTop.addEventListener('click', function () { goTop(); });

  // Header shadow, back-to-top visibility, active nav link
  var header = $('.site-header');
  var links = $$('#nav a[href^="#"]:not(.btn)');
  var map = [], cur = 'top';
  $$('main > section').forEach(function (s) { if (s.id) cur = s.id; map.push({ el: s, id: cur }); });
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > 500);
    var line = y + Math.min(200, window.innerHeight * 0.3), id = 'top';
    map.forEach(function (m) { if (m.el.offsetTop <= line) id = m.id; });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) id = 'contact';
    links.forEach(function (l) {
      var on = l.getAttribute('href') === '#' + id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }
  function req() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Contact form
  var form = $('#form'), status = $('#status');
  function setErr(id, msg) {
    $('#e-' + id).textContent = msg;
    var f = $('#' + id);
    if (msg) { f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', 'e-' + id); }
    else { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }
    return !msg;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#name').value.trim(), email = $('#email').value.trim(), type = $('#type').value;
    var ok = [
      setErr('name', name ? '' : 'Please enter your name.'),
      setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email, like name@example.com.'),
      setErr('type', type ? '' : 'Please choose in-person or telehealth.')
    ];
    if (ok.indexOf(false) !== -1) {
      status.textContent = '';
      $('[aria-invalid="true"]').focus();
      return;
    }
    // No backend: simulate a successful submission
    var submit = form.querySelector('button[type=submit]');
    submit.disabled = true;
    setTimeout(function () {
      status.textContent = 'Thank you, ' + name.split(' ')[0] + '. Your request was received. I\'ll be in touch soon to set up your free consult.';
      form.reset();
      submit.disabled = false;
    }, 600);
  });
})();
