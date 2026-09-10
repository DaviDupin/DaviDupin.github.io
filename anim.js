/* Animações dos cards de case, portadas do canvas do Claude Design.
   Cada animação desenha num palco fixo de 1408x880 que é escalado para o host. */
(function () {
  'use strict';

  var STAGE_W = 1408;
  var STAGE_H = 880;

  function el(tag, parent, cssText) {
    var node = document.createElement(tag);
    if (cssText) node.style.cssText = cssText;
    if (parent) parent.appendChild(node);
    return node;
  }

  function svg(parent, markup) {
    var wrap = document.createElement('div');
    wrap.innerHTML = markup;
    var node = wrap.firstElementChild;
    parent.appendChild(node);
    return node;
  }

  /* Escala o palco de 1408px para a largura real do host. */
  function fitStage(host, stage) {
    function apply() {
      var w = host.clientWidth;
      if (!w) return;
      stage.style.transform = 'scale(' + (w / STAGE_W) + ')';
    }
    apply();
    if (window.ResizeObserver) new ResizeObserver(apply).observe(host);
    else window.addEventListener('resize', apply);
  }

  function makeStage(host, background) {
    host.style.cssText = 'position: absolute; inset: 0; overflow: hidden; background: ' + background + ';';
    var stage = el('div', host,
      'position: absolute; left: 0; top: 0; width: ' + STAGE_W + 'px; height: ' + STAGE_H + 'px; transform-origin: 0 0;');
    fitStage(host, stage);
    return stage;
  }

  /* ------------------------------------------------------- case 1: financeiro */

  function financeiro(host, opts) {
    var SPEED = 1, k = 1 / SPEED;
    var B = '#0092fd', DEEP = '#123B5E', RED = '#E05B4B', GREEN = '#2E8B72';
    var GOLD = '#FFC01E', GOLD_L = '#FFDC57', GOLD_D = '#EF9308';
    var EASE = 'cubic-bezier(0.16,0.9,0.24,1)';
    var BOUNCE = 'cubic-bezier(0.28,1.4,0.5,1)';

    var stage = makeStage(host, '#FBFCFE');

    /* modelo -------------------------------------------------------------- */
    var COLS = 7, ROWS = 9, X0 = 81, Y0 = 143, CW = 178, CH = 66;
    var cells = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var head = r === 0;
        var j = Math.abs(Math.sin((r * 7.3 + c * 3.1 + 1) * 12.9898));
        cells.push({
          head: head, c0: c === 0, r0: r === 0, cN: c === COLS - 1, rN: r === ROWS - 1,
          x: c * CW, y: r * CH, w: CW, h: CH,
          barW: head ? 48 : Math.round(44 + j * 78),
          rank: (r + c) * 100 + c
        });
      }
    }
    cells.slice().sort(function (a, b) { return a.rank - b.rank; })
      .forEach(function (cell, i) { cell.order = i; });

    var CARDS = [[80,128,400,190],[504,128,400,190],[80,342,188,190],[292,342,188,190],[504,342,400,190],[80,556,824,196],[928,128,400,624]]
      .map(function (d) {
        return { x: d[0] - X0, y: d[1] - Y0, w: d[2], h: d[3], cx: d[0] - X0 + d[2] / 2, cy: d[1] - Y0 + d[3] / 2 };
      });

    cells.forEach(function (cell) {
      var px = cell.x + cell.w / 2, py = cell.y + cell.h / 2;
      var best = CARDS[0], bd = Infinity;
      CARDS.forEach(function (t) {
        var d = (t.cx - px) * (t.cx - px) + (t.cy - py) * (t.cy - py);
        if (d < bd) { bd = d; best = t; }
      });
      cell.t = best;
    });

    var stacks = [
      { cx: 198, w: 172, count: 12, base: 148, z: 1 },
      { cx: 116, w: 146, count: 8, base: 104, z: 30 },
      { cx: 284, w: 136, count: 6, base: 90, z: 50 }
    ];
    var coins = [];
    stacks.forEach(function (s, si) {
      var eH = Math.round(s.w * 0.30), T = Math.round(s.w * 0.155), step = Math.round(T * 0.94);
      for (var i = 0; i < s.count; i++) {
        var jx = Math.round(Math.sin((si * 5.7 + i * 2.3 + 1) * 4.7) * (s.w * 0.035));
        coins.push({ si: si, z: s.z + i, w: s.w, eH: eH, T: T, x: Math.round(s.cx - s.w / 2) + jx, y: s.base + i * step });
      }
    });
    coins.sort(function (a, b) { return a.y - b.y || a.si - b.si; });

    /* DOM ------------------------------------------------------------------ */
    var WEB_SVG = '<svg viewBox="3 3 26 26" width="190" height="190" fill="none" stroke="rgba(18,59,94,0.32)" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="3,3 29,3 29,29"></polyline><line x1="8" y1="24" x2="29" y2="3"></line>' +
      '<path d="M5,3c5.5,0,10,4.5,10,10c0,2.3-0.8,4.3-2,6"></path>' +
      '<path d="M13,19c1.7-1.3,3.8-2,6-2c5.5,0,10,4.5,10,10"></path>' +
      '<path d="M15,3c3.2,0,5.8,2.6,5.8,5.8c0,1.3-0.4,2.5-1.2,3.5"></path>' +
      '<path d="M19.7,12.3c1-0.7,2.2-1.2,3.5-1.2c3.2,0,5.8,2.6,5.8,5.8"></path></svg>';

    var SPIDER_SVG = '<svg viewBox="0 0 512 512" width="96" height="96" fill="#123B5E" aria-hidden="true" style="display: block; transform: scaleY(-1); filter: drop-shadow(0 -10px 16px rgba(15,32,49,0.22));"><path d="M405.295,255.128l-80.064-18.658l81.293-6.766l64.205-64.92l24.038-104.024l-17.533-3.906l-28.781,95.496l-53.08,52.434l-85.949,7.15l74.057-30.577l29.922-84.981L395.443,0l-17.681,3.078l10.723,90.684l-23.863,67.744l-60.613,25.023c-2.346-13.985-4.987-22.738-4.987-22.738l5.38-24.806l-16.139-32.46l-21.508,3.828l10.758,20.995l-5.388,24.804h-32.268l-5.371-24.804l10.75-20.995l-21.509-3.828l-16.138,32.46l5.379,24.806c0,0-2.642,8.753-4.978,22.738l-60.621-25.023l-23.864-67.744L134.23,3.078L116.548,0l-17.97,96.378l29.932,84.981l74.066,30.577l-85.958-7.15L63.53,152.352L34.758,56.855l-17.525,3.906l24.029,104.024l64.205,64.92l81.303,6.766l-80.073,18.658L46.86,320.912L33.197,425.614l17.647,3.235v-0.008l18.606-95.732l49.54-54.475l58.755-13.688l-58.25,38.092l-15.58,130.555L148.032,512l15.685-9.181l-34.796-74.301l13.121-109.987l67.597-44.186c0.47,1.962,0.977,3.932,1.526,5.902c-69.916,66.82-57.36,194.707,44.823,194.707c102.201,0,114.756-127.886,44.832-194.707c0.549-1.97,1.063-3.941,1.534-5.902l67.597,44.186l13.112,109.987l-34.788,74.301L363.968,512l44.109-78.408l-15.589-130.555l-58.242-38.092l58.747,13.688l49.54,54.475l18.606,95.732v0.008l17.656-3.235l-13.672-104.703L405.295,255.128z"></path></svg>';

    var sheetEl = el('div', stage);
    var cellEls = cells.map(function () {
      var d = el('div', sheetEl);
      return { box: d, bar: el('span', d) };
    });

    var webTL = el('div', stage); svg(webTL, WEB_SVG);
    var webBR = el('div', stage); svg(webBR, WEB_SVG);

    var spiderEl = el('div', stage);
    var threadEl = el('span', spiderEl);
    svg(spiderEl, SPIDER_SVG);

    function metricCard(iconName) {
      var card = el('div', stage);
      var icon = el('span', card); icon.textContent = iconName;
      var value = el('span', card);
      var label = el('span', card);
      var wrap = el('div', card);
      var bars = [0, 1, 2, 3, 4].map(function () { return el('div', wrap); });
      return { card: card, icon: icon, value: value, label: label, wrap: wrap, bars: bars };
    }

    var expense = metricCard('trending_down');
    var revenue = metricCard('trending_up');

    var calCard = el('div', stage);
    var calIcon = el('span', calCard); calIcon.textContent = 'calendar_month';
    var calGrid = el('div', calCard);
    var calDots = [0,1,2,3,4,5,6,7,8,9,10,11].map(function () { return el('span', calGrid); });

    var filterCard = el('div', stage);
    var filterIcon = el('span', filterCard); filterIcon.textContent = 'filter_alt';
    var filterRows = [0, 1, 2].map(function () {
      var track = el('div', filterCard);
      return { track: track, fill: el('span', track), knob: el('span', track) };
    });

    var gaugeCard = el('div', stage);
    var gaugeIcon = el('span', gaugeCard); gaugeIcon.textContent = 'speed';
    var gaugeWrap = el('div', gaugeCard);
    var gaugeRing = el('div', gaugeWrap);
    var gaugeFill = el('div', gaugeWrap);
    var gaugeHole = el('div', gaugeWrap);
    var needlePivot = el('div', gaugeWrap);
    var needle = el('span', needlePivot);
    var needleCap = el('span', gaugeCard);

    var listCard = el('div', stage);
    var listRows = [0, 1, 2, 3].map(function () {
      var row = el('div', listCard);
      return { row: row, dot: el('span', row), line: el('span', row), amount: el('span', row) };
    });

    var coinCard = el('div', stage);
    var coinEls = coins.map(function () {
      var d = el('div', coinCard);
      return { box: d, bottom: el('span', d), side: el('span', d), face: el('span', d), inner: el('span', d) };
    });

    /* render --------------------------------------------------------------- */
    var phase = 0, revealed = 0;

    function card(x, y, w, h, delay, dash, exiting) {
      var od = (200 + (800 - delay) * 0.22) * k;
      return 'position: absolute; left: ' + x + 'px; top: ' + y + 'px; width: ' + w + 'px; height: ' + h +
        'px; box-sizing: border-box; border-radius: 26px; background: #FFFFFF; border: 1px solid rgba(18,59,94,0.12); box-shadow: 0 18px 38px rgba(15,32,49,0.09); opacity: ' +
        (dash ? 1 : 0) + '; transform: scale(' + (dash ? 1 : exiting ? 0.94 : 1) + '); transform-origin: 50% 50%; transition: ' +
        (exiting
          ? 'opacity ' + (380 * k) + 'ms ease ' + od + 'ms, transform ' + (520 * k) + 'ms ' + EASE + ' ' + od + 'ms'
          : 'opacity ' + (450 * k) + 'ms ease ' + (delay + 780) * k + 'ms, transform 0ms') + ';';
    }

    var METRIC_ICON = "position: absolute; left: 28px; top: 26px; display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 16px; font-family: 'Material Symbols Rounded'; font-size: 30px;";
    var SMALL_ICON = "position: absolute; left: 24px; top: 22px; color: " + DEEP + "; font-family: 'Material Symbols Rounded'; font-size: 28px; opacity: 0.7;";
    var BARS_WRAP = 'position: absolute; right: 28px; top: 32px; display: flex; align-items: flex-end; gap: 9px; width: 150px; height: 112px;';

    function render() {
      var dash = phase >= 2 && phase <= 3;
      var morph = phase >= 2;
      var exiting = phase === 4;
      var perf = phase === 3;

      sheetEl.style.cssText = 'position: absolute; left: 81px; top: 143px; width: ' + (COLS * CW) + 'px; height: ' + (ROWS * CH) +
        'px; border-radius: 26px; overflow: ' + (phase <= 1 ? 'hidden' : 'visible') + '; box-sizing: border-box; opacity: ' +
        (phase >= 3 || phase === 4 ? 0 : 1) + '; filter: saturate(' + (phase === 1 ? 0.2 : 1) + '); transition: opacity ' +
        (phase === 0 ? 0 : 400 * k) + 'ms ease, filter ' + (1000 * k) + 'ms ease;';

      cells.forEach(function (cell, i) {
        var on = cell.order < revealed;
        var md = (260 + (cell.order % 9) * 26) * k;
        var radius = morph ? '26px'
          : (cell.r0 && cell.c0 ? 26 : 0) + 'px ' + (cell.r0 && cell.cN ? 26 : 0) + 'px ' +
            (cell.rN && cell.cN ? 26 : 0) + 'px ' + (cell.rN && cell.c0 ? 26 : 0) + 'px';

        cellEls[i].box.style.cssText = 'position: absolute; left: ' + (morph ? cell.t.x : cell.x) + 'px; top: ' +
          (morph ? cell.t.y : cell.y) + 'px; width: ' + (morph ? cell.t.w : cell.w) + 'px; height: ' +
          (morph ? cell.t.h : cell.h) + 'px; box-sizing: border-box; display: flex; align-items: center; padding-left: 22px; overflow: hidden; border: 1px solid ' +
          (morph ? 'rgba(18,59,94,0.12)' : 'rgba(18,59,94,0.14)') + '; border-left-width: ' + (morph || cell.c0 ? 1 : 0) +
          'px; border-top-width: ' + (morph || cell.r0 ? 1 : 0) + 'px; border-radius: ' + radius + '; background: ' +
          (morph ? '#FFFFFF' : (cell.head ? B : 'rgba(255,255,255,0.94)')) + '; opacity: ' + (on ? 1 : 0) +
          '; transform: scale(' + (on ? 1 : 0.88) + '); transform-origin: 20% 50%; transition: ' +
          (morph
            ? 'left ' + (860 * k) + 'ms ' + EASE + ' ' + md + 'ms, top ' + (860 * k) + 'ms ' + EASE + ' ' + md +
              'ms, width ' + (860 * k) + 'ms ' + EASE + ' ' + md + 'ms, height ' + (860 * k) + 'ms ' + EASE + ' ' + md +
              'ms, border-radius ' + (700 * k) + 'ms ease ' + md + 'ms, background ' + (500 * k) + 'ms ease ' + md + 'ms, '
            : '') + 'opacity ' + (300 * k) + 'ms ease, transform ' + (420 * k) + 'ms cubic-bezier(0.22,1,0.32,1);';

        cellEls[i].bar.style.cssText = 'display: block; flex: none; width: ' + (morph ? 0 : cell.barW) + 'px; height: ' +
          (cell.head ? 12 : 10) + 'px; border-radius: 999px; background: ' +
          (cell.head ? 'rgba(255,255,255,0.85)' : 'rgba(18,59,94,0.2)') + '; opacity: ' + (morph ? 0 : 1) +
          '; transition: width ' + (500 * k) + 'ms ' + EASE + ', opacity ' + (280 * k) + 'ms ease;';
      });

      webTL.style.cssText = 'position: absolute; left: 0; top: 0; width: 190px; height: 190px; z-index: 4; transform: scaleX(-1); opacity: ' +
        (phase === 1 ? 1 : 0) + '; transition: opacity ' + (700 * k) + 'ms ease ' + (phase === 1 ? 300 * k : 0) + 'ms;';
      webBR.style.cssText = 'position: absolute; right: 0; bottom: 0; width: 190px; height: 190px; z-index: 4; transform: scaleY(-1); opacity: ' +
        (phase === 1 ? 1 : 0) + '; transition: opacity ' + (700 * k) + 'ms ease ' + (phase === 1 ? 480 * k : 0) + 'ms;';

      spiderEl.style.cssText = 'position: absolute; left: 304px; top: ' + (phase === 1 ? 205 : -140) +
        'px; width: 96px; height: 96px; z-index: 5; opacity: ' + (phase === 1 ? 1 : 0) + '; transition: top ' +
        (1500 * k) + 'ms ' + BOUNCE + ', opacity ' + (450 * k) + 'ms ease;';
      threadEl.style.cssText = 'position: absolute; left: 47px; bottom: 74px; width: 3px; height: 560px; background: linear-gradient(to bottom, rgba(18,59,94,0.15) 0%, rgba(18,59,94,0.6) 40%, rgba(18,59,94,0.85) 100%);';

      expense.card.style.cssText = card(80, 128, 400, 190, 240, dash, exiting);
      expense.icon.style.cssText = METRIC_ICON + ' background: rgba(224,91,75,0.12); color: ' + RED + ';';
      expense.value.style.cssText = 'position: absolute; left: 28px; top: 106px; height: 24px; width: ' +
        (perf ? 72 : dash ? 150 : 0) + 'px; border-radius: 999px; background: ' + RED + '; transition: width ' +
        (1400 * k) + 'ms ' + EASE + ' ' + (perf ? 240 : 620) * k + 'ms;';
      expense.label.style.cssText = 'position: absolute; left: 28px; top: 144px; height: 12px; width: ' + (dash ? 92 : 0) +
        'px; border-radius: 999px; background: rgba(18,59,94,0.2); transition: width ' + (700 * k) + 'ms ' + EASE + ' ' + (740 * k) + 'ms;';
      expense.wrap.style.cssText = BARS_WRAP;
      [84, 72, 90, 66, 96].forEach(function (h, i) {
        expense.bars[i].style.cssText = 'flex: 1 1 0; border-radius: 8px 8px 3px 3px; background: ' + RED + '; opacity: ' +
          (0.34 + i * 0.14).toFixed(2) + '; height: ' + (perf ? [38, 31, 25, 19, 13][i] : dash ? h : 8) + '%; transition: height ' +
          (1100 * k) + 'ms ' + EASE + ' ' + ((perf ? 280 : 680) + i * 70) * k + 'ms;';
      });

      revenue.card.style.cssText = card(504, 128, 400, 190, 360, dash, exiting);
      revenue.icon.style.cssText = METRIC_ICON + ' background: rgba(46,139,114,0.12); color: ' + GREEN + ';';
      revenue.value.style.cssText = 'position: absolute; left: 28px; top: 106px; height: 24px; width: ' +
        (perf ? 150 : dash ? 76 : 0) + 'px; border-radius: 999px; background: ' + GREEN + '; transition: width ' +
        (1500 * k) + 'ms ' + EASE + ' ' + (perf ? 280 : 700) * k + 'ms;';
      revenue.label.style.cssText = 'position: absolute; left: 28px; top: 144px; height: 12px; width: ' + (dash ? 92 : 0) +
        'px; border-radius: 999px; background: rgba(18,59,94,0.2); transition: width ' + (700 * k) + 'ms ' + EASE + ' ' + (820 * k) + 'ms;';
      revenue.wrap.style.cssText = BARS_WRAP;
      [26, 34, 30, 44, 38].forEach(function (h, i) {
        revenue.bars[i].style.cssText = 'flex: 1 1 0; border-radius: 8px 8px 3px 3px; background: ' + GREEN + '; opacity: ' +
          (0.34 + i * 0.14).toFixed(2) + '; height: ' + (perf ? [50, 62, 74, 86, 100][i] : dash ? h : 8) + '%; transition: height ' +
          (1100 * k) + 'ms ' + EASE + ' ' + ((perf ? 320 : 800) + i * 70) * k + 'ms;';
      });

      calCard.style.cssText = card(80, 342, 188, 190, 480, dash, exiting);
      calIcon.style.cssText = SMALL_ICON;
      calGrid.style.cssText = 'position: absolute; left: 24px; right: 24px; bottom: 26px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px;';
      calDots.forEach(function (dot, i) {
        dot.style.cssText = 'height: 17px; border-radius: 6px; background: ' +
          (perf && (i === 5 || i === 9) ? B : 'rgba(18,59,94,0.14)') + '; transition: background ' + (600 * k) + 'ms ease ' + (500 + i * 40) * k + 'ms;';
      });

      filterCard.style.cssText = card(292, 342, 188, 190, 560, dash, exiting);
      filterIcon.style.cssText = SMALL_ICON;
      filterRows.forEach(function (row, i) {
        var p = perf ? [0.74, 0.34, 0.6][i] : [0.24, 0.6, 0.18][i];
        var delay = perf ? (400 + i * 120) * k : 0;
        row.track.style.cssText = 'position: absolute; left: 26px; right: 26px; top: ' + (86 + i * 34) +
          'px; height: 8px; border-radius: 999px; background: rgba(18,59,94,0.13);';
        row.fill.style.cssText = 'position: absolute; left: 0; top: 0; bottom: 0; width: ' + (p * 100).toFixed(0) +
          '%; border-radius: 999px; background: ' + B + '; opacity: 0.45; transition: width ' + (1200 * k) + 'ms ' + EASE + ' ' + delay + 'ms;';
        row.knob.style.cssText = 'position: absolute; top: -6px; left: ' + (p * 100).toFixed(0) +
          '%; width: 20px; height: 20px; margin-left: -10px; border-radius: 999px; background: #FFFFFF; border: 3px solid ' + B +
          '; box-shadow: 0 4px 10px rgba(15,32,49,0.18); transition: left ' + (1200 * k) + 'ms ' + EASE + ' ' + delay + 'ms;';
      });

      var gaugeP = perf ? 0.82 : 0.12;
      var gaugeDelay = (perf ? 400 : 880) * k;
      gaugeCard.style.cssText = card(504, 342, 400, 190, 640, dash, exiting);
      gaugeIcon.style.cssText = SMALL_ICON;
      gaugeWrap.style.cssText = 'position: absolute; left: 50%; bottom: 30px; width: 240px; height: 126px; margin-left: -120px; overflow: hidden;';
      gaugeRing.style.cssText = 'position: absolute; left: 0; top: 0; width: 240px; height: 240px; border-radius: 999px; background: rgba(18,59,94,0.12);';
      gaugeFill.style.cssText = 'position: absolute; left: 0; top: 0; width: 240px; height: 240px; border-radius: 999px; background: ' + B +
        '; clip-path: inset(0 0 0 50%); transform: rotate(' + (90 + 180 * gaugeP).toFixed(2) + 'deg); transition: transform ' +
        (1700 * k) + 'ms cubic-bezier(0.34,1.18,0.42,1) ' + gaugeDelay + 'ms;';
      gaugeHole.style.cssText = 'position: absolute; left: 30px; top: 30px; width: 180px; height: 180px; border-radius: 999px; background: #FFFFFF;';
      needlePivot.style.cssText = 'position: absolute; left: 120px; top: 120px; width: 0; height: 0; transform: rotate(' +
        (-90 + gaugeP * 180).toFixed(1) + 'deg); transition: transform ' + (1700 * k) + 'ms cubic-bezier(0.34,1.18,0.42,1) ' + gaugeDelay + 'ms;';
      needle.style.cssText = 'position: absolute; left: -4px; bottom: 0; width: 8px; height: 86px; border-radius: 999px 999px 3px 3px; background: ' +
        DEEP + '; transform-origin: bottom center;';
      needleCap.style.cssText = 'position: absolute; left: 50%; bottom: 25px; width: 22px; height: 22px; margin: 0 0 0 -11px; border-radius: 999px; background: #FFFFFF; border: 3px solid ' + DEEP + ';';

      listCard.style.cssText = card(80, 556, 824, 196, 720, dash, exiting) +
        ' padding: 26px 30px; display: flex; flex-direction: column; justify-content: space-between;';
      listRows.forEach(function (row, i) {
        row.row.style.cssText = 'display: flex; align-items: center; gap: 18px;';
        row.dot.style.cssText = 'width: 12px; height: 12px; flex: none; border-radius: 999px; background: ' +
          (perf && i < 2 ? B : 'rgba(18,59,94,0.26)') + '; transition: background ' + (600 * k) + 'ms ease ' + (600 + i * 100) * k + 'ms;';
        row.line.style.cssText = 'flex: 1 1 auto; height: 12px; border-radius: 999px; background: rgba(18,59,94,0.13);';
        row.amount.style.cssText = 'flex: none; height: 12px; width: ' +
          (dash ? (perf ? [146, 124, 102, 86][i] : [90, 74, 108, 62][i]) : 0) + 'px; border-radius: 999px; background: ' +
          (perf ? GREEN : 'rgba(18,59,94,0.32)') + '; transition: width ' + (1100 * k) + 'ms ' + EASE + ' ' +
          ((perf ? 480 : 880) + i * 90) * k + 'ms, background ' + (700 * k) + 'ms ease;';
      });

      coinCard.style.cssText = card(928, 128, 400, 624, 800, dash, exiting) + ' overflow: hidden;';
      var shown = perf ? coins.length : dash ? 4 : 0;
      coins.forEach(function (coin, n) {
        var on = n < shown;
        var delay = (perf ? 400 + n * 52 : 930 + n * 64) * k;
        coinEls[n].box.style.cssText = 'position: absolute; left: ' + coin.x + 'px; bottom: ' + (on ? coin.y : coin.y + 320) +
          'px; width: ' + coin.w + 'px; height: ' + (coin.eH + coin.T) + 'px; z-index: ' + coin.z + '; opacity: ' + (on ? 1 : 0) +
          '; transform: rotate(' + (on ? 0 : -6) + 'deg); filter: drop-shadow(0 4px 6px rgba(15,32,49,0.10)); transition: bottom ' +
          (900 * k) + 'ms ' + BOUNCE + ' ' + delay + 'ms, opacity ' + (260 * k) + 'ms ease ' + delay + 'ms, transform ' +
          (900 * k) + 'ms ' + BOUNCE + ' ' + delay + 'ms;';
        coinEls[n].bottom.style.cssText = 'position: absolute; left: 0; top: ' + coin.T + 'px; width: ' + coin.w + 'px; height: ' + coin.eH + 'px; border-radius: 50%; background: ' + GOLD_D + ';';
        coinEls[n].side.style.cssText = 'position: absolute; left: 0; top: ' + Math.round(coin.eH / 2) + 'px; width: ' + coin.w + 'px; height: ' + coin.T + 'px; background: ' + GOLD_D + ';';
        coinEls[n].face.style.cssText = 'position: absolute; left: 0; top: 0; width: ' + coin.w + 'px; height: ' + coin.eH + 'px; border-radius: 50%; background: ' + GOLD + ';';
        coinEls[n].inner.style.cssText = 'position: absolute; left: ' + Math.round(coin.w * 0.11) + 'px; top: ' + Math.round(coin.eH * 0.17) +
          'px; width: ' + Math.round(coin.w * 0.78) + 'px; height: ' + Math.round(coin.eH * 0.66) + 'px; border-radius: 50%; background: ' + GOLD_L + ';';
      });
    }

    /* timeline -------------------------------------------------------------- */
    var timers = [], interval = null;

    function stop() {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      timers = [];
    }

    function start() {
      stop();
      phase = 0; revealed = 0;
      render();
      interval = setInterval(function () {
        if (revealed >= cells.length) return;
        revealed++;
        render();
      }, 22 * k);
      timers.push(setTimeout(function () { clearInterval(interval); phase = 1; revealed = cells.length; render(); }, 1600 * k));
      timers.push(setTimeout(function () { phase = 2; render(); }, 4400 * k));
      timers.push(setTimeout(function () { phase = 3; render(); }, 6800 * k));
      timers.push(setTimeout(function () { phase = 4; revealed = 0; render(); }, 13400 * k));
      timers.push(setTimeout(start, 14800 * k));
    }

    if (opts.reduced) { phase = 3; revealed = cells.length; render(); return { start: function () {}, stop: function () {} }; }
    render();
    return { start: start, stop: stop };
  }

  /* ------------------------------------------------------ case 2: biblioteca */

  function biblioteca(host, opts) {
    var SPEED = 1, k = 1 / SPEED;
    var A = '#9D36F8', BLUE = '#2F6FA8', DEEP = '#2A4C6D', SOFT = '#5B94BF', GREEN = '#2E8B72';
    var RY = 296, RH = 268, BY = 592, BH = 152;

    var stage = makeStage(host, '#FBFCFE');
    el('div', stage, 'position: absolute; inset: 0; background-image: radial-gradient(rgba(42,76,109,0.1) 2px, transparent 2px); background-size: 48px 48px;');

    var panels = [
      { x: 80, y: RY, w: 482, h: RH },
      { x: 590, y: RY, w: 220, h: RH },
      { x: 838, y: RY, w: 490, h: RH },
      { x: 80, y: BY, w: 1248, h: BH }
    ];

    var icons = ['add', 'download', 'arrow_outward', 'visibility', 'notifications', 'delete', 'check_box', 'search'];
    var iconColors = [BLUE, DEEP, A, SOFT, A, BLUE, GREEN, DEEP];
    var items = [];

    icons.forEach(function (name, i) {
      var col = i % 4, row = Math.floor(i / 4);
      items.push({
        text: name,
        slot: { x: 80 + 40 + col * 106, y: RY + 39 + row * 106 }, w: 84, h: 84,
        base: "width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; border-radius: 22px; background: #FFFFFF; border: 1px solid rgba(42,76,109,0.14); box-shadow: 0 12px 26px rgba(15,32,49,0.09); font-family: 'Material Symbols Rounded'; font-size: 42px; color: " + iconColors[i] + ";"
      });
    });

    [[96, 0, DEEP], [64, 120, '#22262A']].forEach(function (d) {
      var size = d[0], dy = d[1], color = d[2];
      items.push({
        text: 'Aa',
        slot: { x: 634, y: RY + 42 + dy }, w: Math.round(size * 1.16), h: size,
        base: "font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.03em; line-height: 1; font-size: " + size + "px; color: " + color + ";"
      });
    });

    [DEEP, BLUE, A, GREEN].forEach(function (c, i) {
      items.push({
        text: '',
        slot: { x: 838 + 39 + i * 108, y: RY + 40 }, w: 88, h: 188,
        base: 'width: 88px; height: 188px; border-radius: 24px; background: ' + c + '; box-shadow: 0 16px 32px rgba(15,32,49,0.14);'
      });
    });

    var CY = BY + BH / 2;
    [
      { text: 'Button', x: 124, h: 68, w: 166, base: 'padding: 0 40px; height: 68px; display: flex; align-items: center; border-radius: 999px; background: ' + DEEP + '; color: #FFFFFF; font-size: 24px; font-weight: 600; box-shadow: 0 14px 30px rgba(42,76,109,0.26);' },
      { text: 'Button', x: 349, h: 68, w: 170, base: 'padding: 0 40px; height: 68px; display: flex; align-items: center; border-radius: 999px; background: #FFFFFF; border: 2px solid ' + DEEP + '; color: ' + DEEP + '; font-size: 24px; font-weight: 600;' },
      { text: '● Tag', x: 574, h: 56, w: 142, base: 'padding: 0 30px; height: 56px; display: flex; align-items: center; gap: 10px; border-radius: 999px; background: rgba(157,54,248,0.1); border: 2px solid ' + A + '; color: ' + A + '; font-size: 21px; font-weight: 600;' },
      { text: '', x: 761, h: 68, w: 380, base: 'width: 380px; height: 68px; border-radius: 20px; background: #FFFFFF; border: 2px solid rgba(42,76,109,0.2);' },
      { text: '', x: 1198, h: 46, w: 84, base: 'width: 84px; height: 46px; border-radius: 999px; background: radial-gradient(circle 17px at 61px 23px, #FFFFFF 98%, rgba(255,255,255,0) 100%), ' + A + '; box-shadow: 0 10px 22px rgba(157,54,248,0.3);' }
    ].forEach(function (c) {
      items.push({ text: c.text, w: c.w, h: c.h, slot: { x: c.x, y: Math.round(CY - c.h / 2) }, base: c.base });
    });

    var order = [11, 3, 17, 8, 0, 14, 6, 19, 2, 15, 9, 5, 18, 1, 12, 7, 16, 4, 10];
    items.forEach(function (it, i) {
      var sl = order[i % order.length];
      var col = sl % 5, row = Math.floor(sl / 5);
      var jitter = function (n) { return ((Math.sin((i + 1) * n) + 1) / 2 - 0.5) * 2; };
      it.scatter = {
        x: 150 + col * 240 + jitter(12.9898) * 60,
        y: 170 + row * 180 + jitter(78.233) * 52,
        rot: jitter(43.7585) * 10
      };
    });

    /* afasta só o que realmente se sobrepõe — as posições ficam propositalmente desalinhadas */
    var PAD = 26;
    for (var pass = 0; pass < 60; pass++) {
      var moved = false;
      for (var i = 0; i < items.length; i++) {
        for (var n = i + 1; n < items.length; n++) {
          var a = items[i].scatter, b = items[n].scatter;
          var aw = items[i].w / 2 + items[n].w / 2 + PAD;
          var ah = items[i].h / 2 + items[n].h / 2 + PAD;
          var dx = (b.x + items[n].w / 2) - (a.x + items[i].w / 2);
          var dy = (b.y + items[n].h / 2) - (a.y + items[i].h / 2);
          var ox = aw - Math.abs(dx), oy = ah - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          if (ox < oy) {
            var pushX = (ox / 2 + 0.5) * (dx < 0 ? -1 : 1);
            a.x -= pushX; b.x += pushX;
          } else {
            var pushY = (oy / 2 + 0.5) * (dy < 0 ? -1 : 1);
            a.y -= pushY; b.y += pushY;
          }
        }
      }
      items.forEach(function (it) {
        it.scatter.x = Math.min(1328 - it.w, Math.max(80, it.scatter.x));
        it.scatter.y = Math.min(830 - it.h, Math.max(70, it.scatter.y));
      });
      if (!moved) break;
    }
    items.forEach(function (it) { it.scatter.x = Math.round(it.scatter.x); it.scatter.y = Math.round(it.scatter.y); });

    /* DOM ------------------------------------------------------------------- */
    var titleBar = el('div', stage);
    var titleDot = el('span', titleBar);
    var titleText = el('span', titleBar);
    var panelEls = panels.map(function () { return el('div', stage); });
    var itemEls = items.map(function (it) {
      var node = el('div', stage);
      node.textContent = it.text;
      return node;
    });

    var phase = 0, revealed = 0;

    function render() {
      var organized = phase === 2;

      titleBar.style.cssText = 'position: absolute; left: 80px; top: 136px; width: 1248px; height: 116px; box-sizing: border-box; display: flex; align-items: center; gap: 34px; padding: 0 40px; border-radius: 30px; background: ' +
        A + '; box-shadow: 0 20px 44px rgba(157,54,248,0.28); opacity: ' + (organized ? 1 : 0) + '; transform: scale(' +
        (organized ? 1 : 0.97) + ') translateY(' + (organized ? 0 : -8) + 'px); transform-origin: left center; transition: opacity ' +
        (900 * k) + 'ms ease ' + (560 * k) + 'ms, transform ' + (1000 * k) + 'ms cubic-bezier(0.16,0.9,0.24,1) ' + (560 * k) + 'ms;';
      titleDot.style.cssText = 'width: 68px; height: 68px; flex: none; border-radius: 999px; background: rgba(255,255,255,0.28);';
      titleText.style.cssText = 'height: 26px; flex: none; width: ' + (organized ? 620 : 0) +
        'px; border-radius: 999px; background: #FFFFFF; opacity: 0.92; transition: width ' + (1200 * k) + 'ms cubic-bezier(0.16,0.9,0.24,1) ' + (1150 * k) + 'ms;';

      panels.forEach(function (p, i) {
        panelEls[i].style.cssText = 'position: absolute; left: ' + p.x + 'px; top: ' + p.y + 'px; width: ' + p.w + 'px; height: ' + p.h +
          'px; border-radius: 30px; background: rgba(42,76,109,0.055); border: 1px solid ' +
          (organized ? 'rgba(42,76,109,0.22)' : 'rgba(42,76,109,0)') + '; box-shadow: ' +
          (organized ? '0 24px 50px rgba(15,32,49,0.07)' : 'none') + '; opacity: ' + (organized ? 1 : 0) + '; transform: scale(' +
          (organized ? 1 : 0.97) + '); transition: opacity ' + (900 * k) + 'ms ease ' + (i * 110 + 200) * k + 'ms, transform ' +
          (1000 * k) + 'ms cubic-bezier(0.16,0.9,0.24,1) ' + (i * 110 + 200) * k + 'ms, border-color ' + (900 * k) + 'ms ease, box-shadow ' + (900 * k) + 'ms ease;';
      });

      items.forEach(function (it, i) {
        var on = i < revealed;
        var pos = organized ? it.slot : it.scatter;
        var rot = organized ? 0 : it.scatter.rot;
        var dur = phase === 0 ? 480 * k : organized ? 1500 * k : 900 * k;
        var delay = organized ? i * 55 * k : 0;
        var ease = organized ? 'cubic-bezier(0.16,0.9,0.24,1)' : 'cubic-bezier(0.2,0.9,0.25,1)';
        itemEls[i].style.cssText = 'position: absolute; left: ' + Math.round(pos.x) + 'px; top: ' + Math.round(pos.y) + 'px; ' + it.base +
          ' opacity: ' + (on ? 1 : 0) + '; transform: rotate(' + rot.toFixed(2) + 'deg) scale(' + (on ? 1 : 0.62) + ');' +
          ' transition: left ' + dur + 'ms ' + ease + ' ' + delay + 'ms, top ' + dur + 'ms ' + ease + ' ' + delay +
          'ms, transform ' + dur + 'ms ' + ease + ' ' + delay + 'ms, opacity ' + (phase === 0 ? 520 * k : 620 * k) + 'ms ease ' + delay + 'ms;';
      });
    }

    var timers = [], interval = null;

    function stop() {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      timers = [];
    }

    function start() {
      stop();
      phase = 1; revealed = 0;
      render();
      interval = setInterval(function () {
        if (revealed >= items.length) return;
        revealed++;
        render();
      }, 150 * k);
      timers.push(setTimeout(function () { clearInterval(interval); phase = 2; revealed = items.length; render(); }, 3300 * k));
      timers.push(setTimeout(function () { phase = 0; revealed = 0; render(); }, 9200 * k));
      timers.push(setTimeout(start, 10200 * k));
    }

    if (opts.reduced) { phase = 2; revealed = items.length; render(); return { start: function () {}, stop: function () {} }; }
    render();
    return { start: start, stop: stop };
  }

  /* ------------------------------------------------------------ case 3: horu */

  function horu(host, opts) {
    var SPEED = 1.5, k = 1 / SPEED;
    var LOGO_PATH = 'M569.196 451.895L318.892 29.0554C311.15 15.977 292.225 15.9717 284.476 29.0458L33.8395 451.907C23.7362 468.953 41.9109 488.736 59.7503 480.111L292.981 367.345C298.483 364.684 304.9 364.686 310.401 367.349L543.271 480.084C561.105 488.718 579.289 468.946 569.196 451.895Z';

    var stage = makeStage(host, '#000E23');
    stage.style.background = '#000E23';

    var fillEl = el('div', stage);
    svg(fillEl, '<svg viewBox="0 0 603 589" width="2800" height="2735" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs><linearGradient id="horuFillG" x1="301.5" y1="0" x2="301.5" y2="589" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#004183"></stop><stop offset="1" stop-color="#011A43"></stop></linearGradient></defs>' +
      '<path d="' + LOGO_PATH + '" fill="url(#horuFillG)"></path><circle cx="302" cy="518" r="71" fill="url(#horuFillG)"></circle></svg>');

    var outlineWrap = el('div', stage, 'position: absolute; left: 50%; top: 50%; width: 2800px; height: 2735px; margin: -1367px 0 0 -1400px; z-index: 2;');
    var outlineSvg = svg(outlineWrap, '<svg viewBox="0 0 603 589" width="2800" height="2735" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="' + LOGO_PATH + '"></path><circle cx="302" cy="518" r="71"></circle></svg>');
    var outlineShapes = outlineSvg.querySelectorAll('path, circle');

    var ringsWrap = el('div', stage, 'position: absolute; left: 50%; top: 50%; width: 0; height: 0; z-index: 3;');
    var ringEls = [0, 1, 2].map(function (i) {
      var d = el('div', ringsWrap);
      svg(d, '<svg viewBox="0 0 603 589" width="280" height="273" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs><linearGradient id="horuRingG' + i + '" x1="0" y1="0" x2="0" y2="589" gradientUnits="userSpaceOnUse">' +
        '<stop stop-color="#7FE9FF"></stop><stop offset="1" stop-color="#22A7FF"></stop></linearGradient></defs>' +
        '<path d="' + LOGO_PATH + '" stroke="url(#horuRingG' + i + ')" stroke-width="1.8" stroke-linejoin="round"></path>' +
        '<circle cx="302" cy="518" r="71" stroke="url(#horuRingG' + i + ')" stroke-width="1.8"></circle></svg>');
      return d;
    });

    var orbitEl = el('div', stage);
    var tiltEl = el('div', orbitEl);
    var pulseEl = el('div', tiltEl);
    svg(pulseEl, '<svg viewBox="0 0 603 589" width="280" height="273" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs><linearGradient id="horuLogoG" x1="301.5" y1="0" x2="301.5" y2="589" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#FFFFFF"></stop><stop offset="1" stop-color="#F0F0F0"></stop></linearGradient></defs>' +
      '<path d="' + LOGO_PATH + '" fill="url(#horuLogoG)"></path><circle cx="302" cy="518" r="71" fill="url(#horuLogoG)"></circle></svg>');

    var run = false, filled = false;

    function render() {
      function anim(v) { return run ? 'animation: ' + v + ';' : 'animation: none;'; }

      fillEl.style.cssText = 'position: absolute; left: 50%; top: 50%; width: 2800px; height: 2735px; margin: -1367px 0 0 -1400px; z-index: 1; clip-path: circle(' +
        (filled ? '150%' : '0%') + ' at 50% 50%); transition: clip-path ' + ((filled ? 2200 : 1700) * k) + 'ms cubic-bezier(0.3,0.68,0.2,1);';

      Array.prototype.forEach.call(outlineShapes, function (shape) {
        shape.style.cssText = 'stroke: ' + (filled ? 'rgba(57,70,90,0)' : '#39465A') + '; stroke-width: 1; transition: stroke ' +
          (900 * k) + 'ms ease ' + ((filled ? 500 : 0) * k) + 'ms;';
      });

      ringEls.forEach(function (ring, i) {
        ring.style.cssText = 'position: absolute; left: -140px; top: -136px; width: 280px; height: 273px; opacity: 0; ' +
          anim('horuRing ' + (2400 * k) + 'ms cubic-bezier(0.22,0.8,0.3,1) ' + ((6900 + i * 380) * k) + 'ms 1 both');
      });

      orbitEl.style.cssText = 'position: absolute; left: calc(50% - 140px); top: calc(50% - 136px); width: 280px; height: 273px; z-index: 4; opacity: ' +
        (run ? 1 : 0) + '; ' + anim('horuArc ' + (3600 * k) + 'ms linear 1, horuSettle ' + (2900 * k) +
        'ms cubic-bezier(0.25,0.4,0.2,1) ' + (3600 * k) + 'ms 1 forwards, horuExit ' + (1800 * k) +
        'ms cubic-bezier(0.35,0,0.55,0.55) ' + (14000 * k) + 'ms 1 forwards');

      tiltEl.style.cssText = 'width: 280px; height: 273px; transform: rotate(52deg); ' +
        anim('horuStraighten ' + (1900 * k) + 'ms cubic-bezier(0.32,0.72,0.22,1) ' + (4400 * k) +
        'ms 1 forwards, horuRetilt ' + (900 * k) + 'ms cubic-bezier(0.4,0,0.3,1) ' + (13600 * k) + 'ms 1 forwards');

      pulseEl.style.cssText = 'width: 280px; height: 273px; filter: drop-shadow(0 18px 40px rgba(0,0,0,0.35)); ' +
        anim('horuPulse ' + (1700 * k) + 'ms cubic-bezier(0.3,1.1,0.4,1) ' + (6900 * k) + 'ms 1');
    }

    var timers = [];

    function stop() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function start() {
      stop();
      run = false; filled = false;
      render();
      timers.push(setTimeout(function () { run = true; render(); }, 40));
      timers.push(setTimeout(function () { filled = true; render(); }, 9400 * k));
      timers.push(setTimeout(function () { filled = false; render(); }, 14000 * k));
      timers.push(setTimeout(start, 16400 * k));
    }

    if (opts.reduced) {
      render();
      orbitEl.style.opacity = '1';
      tiltEl.style.transform = 'rotate(0deg)';
      return { start: function () {}, stop: function () {} };
    }
    render();
    return { start: start, stop: stop };
  }

  window.PortfolioAnims = { financeiro: financeiro, biblioteca: biblioteca, horu: horu };
})();
