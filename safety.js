/* safety.js — segurança e robustez
   1) Tratamento global de erros: nunca deixa a criança numa tela quebrada; guarda um registro curto no aparelho.
   2) "Pergunta para adultos": quem ainda não criou o PIN precisa resolver uma conta antes de criá-lo.
   3) Convite de primeira abertura para um responsável criar o PIN. */
(function () {
  'use strict';
  var LOG_KEY = 'eloErrLog', PROMPT_KEY = 'eloParentPrompt';
  var lastShown = 0, shownCount = 0;

  function css() {
    if (document.getElementById('eloSafetyCss')) return;
    var s = document.createElement('style'); s.id = 'eloSafetyCss';
    s.textContent = '.esWrap{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(46,28,78,.62);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
      '.esCard{box-sizing:border-box;width:min(100%,460px);max-height:100%;overflow:auto;background:#fff;border-radius:24px;padding:16px 18px;box-shadow:0 18px 44px rgba(30,16,60,.4);text-align:center;color:#3a2551}' +
      '.esCard h2{margin:0 0 6px;font-size:18px}.esCard p{margin:0 0 10px;font-size:13px;line-height:1.45;color:#5b4a73}.esBig{font-size:40px;line-height:1.1}' +
      '.esRow{display:flex;gap:8px;margin-top:8px}.esBtn{flex:1;min-height:48px;border:0;border-radius:16px;font-size:14px;font-weight:800;cursor:pointer;background:#f0e8ff;color:#6b4c9a}.esBtn.main{background:linear-gradient(135deg,#ff6fae,#9a7cf0);color:#fff}' +
      '.esQ{font-size:22px;font-weight:900;margin:2px 0 6px}.esDisp{height:44px;line-height:44px;border-radius:14px;background:#f5f0ff;font-size:24px;font-weight:900;letter-spacing:4px;margin-bottom:8px}' +
      '.esPad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.esKey{min-height:46px;border:0;border-radius:14px;background:#f0e8ff;font-size:20px;font-weight:900;color:#4a2f72;cursor:pointer}.esKey.ok{background:linear-gradient(135deg,#ff6fae,#9a7cf0);color:#fff;font-size:15px}' +
      '.esShake{animation:esShake .35s}@keyframes esShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';
    document.head.appendChild(s);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function modal(id) { css(); var old = document.getElementById(id); if (old) old.remove(); var w = el('div', 'esWrap'); w.id = id; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); document.body.appendChild(w); return w; }

  /* ---------- 1) erros ---------- */
  function record(msg, src) {
    try {
      var a = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      a.unshift({ t: Date.now(), m: String(msg || '').slice(0, 200), s: String(src || '').slice(0, 80), v: self.ELO_APP_VERSION || '' });
      localStorage.setItem(LOG_KEY, JSON.stringify(a.slice(0, 10)));
    } catch (_) {}
  }
  var NOISE = /ResizeObserver|Script error|NotAllowedError|AbortError|The play\(\) request|Non-Error promise rejection|play\(\) failed|The operation was aborted/i;
  function showError() {
    var n = Date.now();
    if (n - lastShown < 15000 || shownCount >= 3 || !document.body) return;
    lastShown = n; shownCount++;
    var w = modal('eloErrorModal'), c = el('div', 'esCard');
    c.innerHTML = '<div class="esBig">🙈</div><h2>Ops! Algo não saiu como esperado</h2><p>Não se preocupe: o progresso está guardado. Vamos voltar para o início?</p>';
    var r = el('div', 'esRow'), b1 = el('button', 'esBtn', 'Continuar aqui'), b2 = el('button', 'esBtn main', '🏠 Voltar ao início');
    b1.type = b2.type = 'button';
    b1.onclick = function () { w.remove(); };
    b2.onclick = function () { w.remove(); try { if (typeof window.openPanel === 'function') window.openPanel('homePanel', 'home'); else location.reload(); } catch (_) { location.reload(); } };
    r.appendChild(b1); r.appendChild(b2); c.appendChild(r); w.appendChild(c);
  }
  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window) return;                    // falha de recurso (imagem/arquivo): não é erro de código
    var msg = e.message || '';
    record(msg, (e.filename || '') + ':' + (e.lineno || ''));
    if (NOISE.test(msg)) return;
    showError();
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason, msg = (r && r.message) || String(r || ''), name = (r && r.name) || '';
    record(msg, 'promise');
    if (NOISE.test(msg) || NOISE.test(name) || !(r instanceof Error)) return;
    showError();
  });

  /* ---------- 2) pergunta para adultos ---------- */
  var gateFails = 0, gateLockUntil = 0;
  function gate(onPass) {
    var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4), c = 11 + Math.floor(Math.random() * 9), ans = String(a * b + c);
    var w = modal('eloGateModal'), card = el('div', 'esCard'), typed = '';
    var title = el('h2', '', '🔐 Pergunta para adultos'), txt = el('p', '', 'Para continuar, um adulto precisa resolver esta conta:');
    var q = el('div', 'esQ', a + ' × ' + b + ' + ' + c + ' = ?'), disp = el('div', 'esDisp', '&nbsp;'), msg = el('p', '', '');
    var pad = el('div', 'esPad');
    function refresh() { disp.innerHTML = typed ? typed : '&nbsp;'; }
    function press(d) {
      if (Date.now() < gateLockUntil) { msg.textContent = 'Aguarde alguns segundos e tente de novo.'; return; }
      if (d === 'del') typed = typed.slice(0, -1);
      else if (d === 'ok') {
        if (typed === ans) { w.remove(); if (onPass) onPass(); return; }
        gateFails++; typed = ''; card.classList.remove('esShake'); void card.offsetWidth; card.classList.add('esShake');
        if (gateFails >= 3) { gateFails = 0; gateLockUntil = Date.now() + 30000; msg.textContent = 'Resposta incorreta. Aguarde 30 segundos.'; w.remove(); setTimeout(function () { gate(onPass); }, 30000); return; }
        msg.textContent = 'Não foi dessa vez. Tente de novo!';
      } else if (typed.length < 3) typed += d;
      refresh();
    }
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach(function (k) {
      var bt = el('button', 'esKey' + (k === 'ok' ? ' ok' : ''), k === 'del' ? '⌫' : k === 'ok' ? 'Confirmar' : k);
      bt.type = 'button'; bt.setAttribute('aria-label', k === 'del' ? 'Apagar' : k === 'ok' ? 'Confirmar' : k); bt.onclick = function () { press(k); }; pad.appendChild(bt);
    });
    var cancel = el('button', 'esBtn', 'Voltar'); cancel.type = 'button'; cancel.onclick = function () { w.remove(); };
    var row = el('div', 'esRow'); row.appendChild(cancel);
    card.appendChild(title); card.appendChild(txt); card.appendChild(q); card.appendChild(disp); card.appendChild(pad); card.appendChild(msg); card.appendChild(row); w.appendChild(card);
  }
  window.eloParentGate = gate;

  /* ---------- 3) convite de primeira abertura ---------- */
  function promptModal() {
    var w = modal('eloSafetyModal'), c = el('div', 'esCard');
    c.innerHTML = '<div class="esBig">👋</div><h2>Olá, responsável!</h2><p>Crie um PIN de 4 dígitos para proteger a Área dos Pais, os links externos e os lembretes. Leva só 10 segundos.</p>';
    var r = el('div', 'esRow'), later = el('button', 'esBtn', 'Mais tarde'), now = el('button', 'esBtn main', '🔐 Criar PIN agora');
    later.type = now.type = 'button';
    later.onclick = function () { w.remove(); };
    now.onclick = function () { w.remove(); if (typeof window.requestParentAccess === 'function') window.requestParentAccess(function () {}, 'Crie um PIN de 4 dígitos para os responsáveis.'); };
    r.appendChild(later); r.appendChild(now); c.appendChild(r); w.appendChild(c);
  }
  function firstRun() {
    try {
      if (typeof hasParentPin !== 'function' || hasParentPin()) return;
      var n = Number(localStorage.getItem(PROMPT_KEY) || 0); if (n >= 3) return;
      var tries = 0, iv = setInterval(function () {
        tries++; if (tries > 24) { clearInterval(iv); return; }
        var home = document.getElementById('homePanel'); if (!home || !home.classList.contains('active')) return;
        if (document.getElementById('eloSafetyModal') || document.getElementById('eloGateModal') || document.getElementById('eloErrorModal')) return;
        var tut = false, bs = document.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) { if (bs[i].offsetParent !== null && /Pular tutorial/.test(bs[i].textContent || '')) { tut = true; break; } }
        if (tut) return;
        clearInterval(iv); localStorage.setItem(PROMPT_KEY, String(n + 1)); promptModal();
      }, 2500);
    } catch (_) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var orig = window.requestParentAccess;
    if (typeof orig === 'function' && !orig.__gated) {
      var wrapped = function () {
        var self = this, args = arguments;
        try { if (typeof hasParentPin === 'function' && !hasParentPin() && !(typeof parentUnlocked === 'function' && parentUnlocked())) return gate(function () { orig.apply(self, args); }); } catch (_) {}
        return orig.apply(this, arguments);
      };
      wrapped.__gated = true; window.requestParentAccess = wrapped;
    }
    try { var m = (window.ELO_LEGAL || {}).email; if (m) document.querySelectorAll('.contactMail').forEach(function (e) { e.innerHTML = 'E-mail para dúvidas e pedidos sobre privacidade: <a href="mailto:' + m + '">' + m + '</a>.'; }); } catch (_) {}
    firstRun();
  });
  window.EloSafety = { record: record, gate: gate };
})();
