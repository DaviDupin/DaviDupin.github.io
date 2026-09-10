(function () {
  'use strict';

  var CASE_VIEWS = ['case-1', 'case-2', 'case-3'];
  var IN_PAGE = ['cases', 'sobre', 'contato'];

  var views = {};
  Array.prototype.forEach.call(document.querySelectorAll('.view'), function (node) {
    views[node.dataset.view] = node;
  });

  var siteHeader = document.querySelector('.site-header');

  /* Onde a seção deve parar: logo abaixo do header fixo, com uma folga para o
     título respirar. Recalculado sempre que preciso, porque o painel da hero
     encolhe durante a rolagem e sobe o conteúdo junto. */
  function anchorTop(el) {
    var offset = (siteHeader ? siteHeader.offsetHeight : 0) + 24;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    return Math.min(max, Math.max(0, top));
  }

  function jumpTo(el) {
    window.scrollTo({ top: anchorTop(el), behavior: 'instant' });
    /* Segunda passada: a hero pode ter mudado de tamanho com o salto. */
    requestAnimationFrame(function () {
      window.scrollTo({ top: anchorTop(el), behavior: 'instant' });
    });
  }

  /* Rolagem própria em vez do smooth nativo: o alvo é reavaliado a cada quadro,
     então a hero encolhendo no meio do caminho não vira excesso no final. */
  var glideId = 0;

  function glideTo(el) {
    var start = window.pageYOffset;
    var startedAt = 0;
    var id = ++glideId;

    requestAnimationFrame(function step(now) {
      if (id !== glideId) return;
      if (!startedAt) startedAt = now;

      var p = Math.min(1, (now - startedAt) / 560);
      var eased = 1 - Math.pow(1 - p, 3);

      window.scrollTo({ top: start + (anchorTop(el) - start) * eased, behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step);
    });
  }

  /* Qualquer gesto do visitante cancela a animação em curso. */
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
    window.addEventListener(type, function () { glideId++; }, { passive: true });
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute('href').slice(1);
    if (IN_PAGE.indexOf(id) < 0 || views.home.hidden) return;

    var el = document.getElementById(id);
    if (!el) return;

    event.preventDefault();
    /* replaceState em vez de location.hash: mantém o endereço em dia sem
       disparar o roteador (e o salto seco que ele faria). */
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);

    if (reduced) jumpTo(el); else glideTo(el);
  });

  function route() {
    var target = location.hash.replace(/^#/, '');
    var view = CASE_VIEWS.indexOf(target) > -1 ? target : 'home';

    Object.keys(views).forEach(function (name) {
      views[name].hidden = name !== view;
    });

    if (view !== 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (IN_PAGE.indexOf(target) > -1) {
      var anchor = document.getElementById(target);
      if (anchor) jumpTo(anchor);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  window.addEventListener('hashchange', route);
  route();

  /* O card inteiro é clicável; os links internos continuam funcionando sozinhos. */
  Array.prototype.forEach.call(document.querySelectorAll('.case[data-href]'), function (card) {
    card.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;
      location.hash = card.dataset.href;
    });
  });

  /* Anima só o que está na tela, e nada se o visitante pediu menos movimento. */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('.anim[data-anim]'), function (host) {
    var factory = window.PortfolioAnims[host.dataset.anim];
    if (!factory) return;

    var instance = factory(host, { reduced: reduced });
    if (reduced) return;

    if (!window.IntersectionObserver) { instance.start(); return; }

    var running = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !running) { running = true; instance.start(); }
        else if (!entry.isIntersecting && running) { running = false; instance.stop(); }
      });
    }, { rootMargin: '120px' }).observe(host);
  });

  /* Zoom out da hero: o painel encolhe conforme a rolagem até encaixar nas
     margens do grid do conteúdo (as mesmas do header e das demais seções). */
  (function heroZoom() {
    var hero = document.querySelector('.hero');
    var panel = hero && hero.querySelector('.hero-panel');
    var header = document.querySelector('.site-header');
    if (!hero || !panel || !header || reduced) return;

    var minScale = 1;
    var panelHeight = 0;
    var distance = 1;
    var queued = false;

    function measure() {
      hero.style.setProperty('--hero-scale', '1');
      hero.style.setProperty('--hero-shrink', '0px');

      var width = panel.offsetWidth;
      panelHeight = panel.offsetHeight;
      if (!width) { minScale = 1; return; }

      /* Quanto o painel precisa recuar de cada lado para chegar ao grid. */
      var gridPad = parseFloat(getComputedStyle(header).paddingLeft) || 0;
      var heroPad = parseFloat(getComputedStyle(hero).paddingLeft) || 0;
      var inset = Math.max(gridPad - heroPad, 0);

      minScale = Math.max(0.7, Math.min(1, (width - 2 * inset) / width));
      distance = Math.max(1, Math.min(window.innerHeight * 0.7, panelHeight));
    }

    function update() {
      queued = false;
      if (minScale === 1) return;

      var p = Math.min(1, Math.max(0, window.pageYOffset / distance));
      var eased = p * p * (3 - 2 * p);
      var scale = 1 - (1 - minScale) * eased;

      hero.style.setProperty('--hero-scale', scale.toFixed(4));
      hero.style.setProperty('--hero-shrink', (panelHeight * (1 - scale)).toFixed(2) + 'px');
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }

    function refresh() { measure(); update(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('hashchange', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    refresh();
  })();
})();
