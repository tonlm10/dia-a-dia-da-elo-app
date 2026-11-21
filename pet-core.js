/* pet-core.js — lógica pura do bichinho, compartilhada entre a página, o service worker e os testes.
   Não acessa DOM, localStorage nem rede. */
(function (root) {
  'use strict';

  var RATES = {
    awake: { hunger: .050, energy: .034, clean: .030, fun: .024, love: .012, study: .025 },
    sleep: { hunger: .025, clean: .012, fun: .008, love: .004, study: .006 },
    sleepEnergy: .72
  };
  var AWAY_MS = Number.MAX_SAFE_INTEGER; // o bichinho nunca desaparece por falta de uso
  var DANGER_MS = Number.MAX_SAFE_INTEGER;
  var MISS_MS = 20 * 3600e3;       // aviso opcional e gentil
  var LOW = 40;                    // abaixo disso a necessidade vira lembrete

  function clamp(n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); }
  function isSleeping(p, now) { return p.lightsOff === true || Number(p.sleepUntil || 0) > now; }

  /* Estima as necessidades em "now" sem alterar o objeto recebido. */
  function estimate(p, now) {
    var q = Object.assign({}, p);
    if (!p || p.stage === 'egg' || p.ranAway) return q;
    var last = Number(p.lastSeen || now), ms = Math.max(0, now - last);
    /* A ausência não causa perda nem necessidades acumuladas: o estado só muda
       um pouco, até o limite de uma hora, para evitar pressão por uso diário. */
    var mins = Math.min(ms / 60000, 60), k;
    if (isSleeping(p, now)) {
      q.energy = clamp(p.energy + mins * RATES.sleepEnergy);
      for (k in RATES.sleep) q[k] = clamp(p[k] - mins * RATES.sleep[k]);
    } else {
      for (k in RATES.awake) q[k] = clamp(p[k] - mins * RATES.awake[k]);
    }
    return q;
  }

  function minutesOfDay(now) { var d = new Date(now); return d.getHours() * 60 + d.getMinutes(); }
  function dayKey(now) { var d = new Date(now); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function inQuiet(now, cfg) {
    var f = Number(cfg.quietFrom), t = Number(cfg.quietTo), m = minutesOfDay(now);
    if (!isFinite(f) || !isFinite(t) || f === t) return false;
    return f > t ? (m >= f || m < t) : (m >= f && m < t);
  }

  var NEEDS = [
    ['hunger', '🥣', 'quer uma comidinha, se você quiser brincar de cuidar'],
    ['clean',  '🫧', 'pode tomar um banho divertido, se quiser'],
    ['energy', '💤', 'pode descansar um pouquinho'],
    ['love',   '💗', 'gosta de receber carinho quando você tiver vontade'],
    ['fun',    '🎾', 'pode brincar com você, se estiver a fim'],
    ['study',  '📚', 'pode aprender algo novo com você']
  ];
  var TITLE = 'Dia a Dia da Elo 🐾';

  /* Decide se há um lembrete a mostrar agora. Retorna {kind,title,body,tag} ou null.
     st  = snapshot do bichinho; cfg = configurações; last = {at,kind,day,count} do último aviso. */
  function computeReminder(st, cfg, now, last) {
    if (!st || !cfg || !cfg.enabled) return null;
    last = last || {};
    if (inQuiet(now, cfg)) return null;
    var gap = Math.max(30, Number(cfg.minGapMin) || 240) * 60000;
    if (last.at && now - last.at < gap) return null;
    var today = dayKey(now), count = last.day === today ? Number(last.count || 0) : 0;
    if (count >= (Number(cfg.maxPerDay) || 3)) return null;

    var name = st.name || 'Seu bichinho';
    var e = estimate(st, now);
    var away = now - Number(st.lastSeen || now);

    if (st.stage === 'egg') {
      var cd = Number(st.eggCooldownMs || 120000);
      if (Number(st.eggCare || 0) < 5 && now - Number(st.lastEggCareAt || 0) >= cd && away >= 2 * 3600e3)
        return { kind: 'egg', tag: 'pet-egg', title: TITLE, body: '🥚 Se quiser, venha dar carinho ao ovinho quando tiver vontade.' };
      return null;
    }
    if (isSleeping(st, now)) {
      if (st.sleepStartedAt && now - Number(st.sleepStartedAt) >= 10 * 3600e3)
        return { kind: 'wake', tag: 'pet-wake', title: TITLE, body: '☀️ ' + name + ' já dormiu bastante! Acenda a luz para ele acordar.' };
      return null;
    }

    var worst = null, i, v;
    for (i = 0; i < NEEDS.length; i++) {
      v = e[NEEDS[i][0]];
      if (v < LOW && (!worst || v < worst.v)) worst = { n: NEEDS[i], v: v };
    }
    if (worst) return { kind: 'need-' + worst.n[0], tag: 'pet-need', title: TITLE, body: worst.n[1] + ' ' + name + ' ' + worst.n[2] + '.' };
    if (away >= MISS_MS)
      return { kind: 'miss', tag: 'pet-miss', title: TITLE, body: '🥰 ' + name + ' deixou um oi carinhoso. Brinque quando quiser.' };
    return null;
  }

  /* Prevê quando o próximo lembrete apareceria se ninguém abrisse o app (passos de 15 min, até 72 h). */
  function nextDueAt(st, cfg, now, last) {
    if (!st || !cfg || !cfg.enabled) return null;
    var t, end = now + 72 * 3600e3;
    for (t = now + 60000; t <= end; t += 15 * 60000) {
      if (computeReminder(st, cfg, t, last)) return t;
    }
    return null;
  }

  var api = {
    RATES: RATES, AWAY_MS: AWAY_MS, LOW: LOW, clamp: clamp, isSleeping: isSleeping, estimate: estimate,
    inQuiet: inQuiet, dayKey: dayKey, computeReminder: computeReminder, nextDueAt: nextDueAt, TITLE: TITLE
  };
  root.EloPetCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
