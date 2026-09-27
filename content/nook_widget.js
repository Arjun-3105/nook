/**
 * Nook Widget v3 — Pure CSS 3D animated creature.
 * No images. Creature is built from CSS gradients + SVG inline.
 * Emotions controlled via JS class mutations.
 */
(function () {
  'use strict';

  // ── Hard-skip sensitive domains ──────────────────────────────────
  // No creature on banking, auth, payments, or government pages.
  // Pattern-matched on hostname so all subdomains are covered.
  const SKIP_PATTERNS = [
    'paypal', 'stripe', 'bank', 'banking',
    'wellsfargo', 'chase.com', 'bankofamerica', 'citibank',
    'barclays', 'hsbc', 'schwab', 'fidelity', 'capitalone',
    'accounts.google.com', 'login.microsoftonline', 'auth0.com',
    'okta.com', 'onelogin.com', 'signin.aws.amazon', 'console.aws',
    'mail.google.com', 'outlook.live.com', 'protonmail',
    'healthcare.gov', 'irs.gov', 'passport.',
  ];
  if (!location.href.startsWith('http')) return;
  if (SKIP_PATTERNS.some(p => location.hostname.includes(p))) return;
  if (document.getElementById('nook-root')) return;

  // ── Site personality ─────────────────────────────────────────────
  const SITE_VIBES = {
    'youtube.com':          { emotion: 'curious',   speech: 'Ooh, a video? Just one? 👀' },
    'twitter.com':          { emotion: 'excited',   speech: 'The feed never ends, huh? 🐦' },
    'x.com':                { emotion: 'excited',   speech: 'The feed never ends, huh? 🐦' },
    'reddit.com':           { emotion: 'sleepy',    speech: 'Just one more scroll... 😴' },
    'github.com':           { emotion: 'proud',     speech: "Coding! I'll keep your place 💻" },
    'notion.so':            { emotion: 'happy',     speech: 'Taking notes? Good idea. 📝' },
    'figma.com':            { emotion: 'curious',   speech: 'Creating something? I love this 🎨' },
    'stackoverflow.com':    { emotion: 'curious',   speech: 'Looking for answers... you got this 🔍' },
    'wikipedia.org':        { emotion: 'excited',   speech: 'Learning something new! 🌱' },
    'news.ycombinator.com': { emotion: 'curious',   speech: 'Always something interesting here 🧠' },
  };
  function getSiteVibe() {
    const h = location.hostname.replace('www.', '');
    return SITE_VIBES[h] || null;
  }

  // ── Shadow DOM ───────────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'nook-root';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;';
  document.body.appendChild(host);
  const S = host.attachShadow({ mode: 'open' });

  S.innerHTML = `
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    /* ═══════════════════════════════════
       PILL BUTTON
    ═══════════════════════════════════ */
    .pill {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: #fff;
      border: 2.5px solid #e0dbd3;
      box-shadow: 0 4px 18px rgba(0,0,0,.14), 0 1px 5px rgba(0,0,0,.08);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      transition: transform .25s cubic-bezier(.34,1.56,.64,1),
                  box-shadow .15s ease;
      user-select: none;
    }
    .pill:hover  { transform: scale(1.12) translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,.18); }
    .pill:active { transform: scale(.95); }

    /* notification dot */
    .dot {
      position: absolute; top: 1px; right: 1px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #f59e0b; border: 2.5px solid #fff;
      display: none;
      animation: dot-pop .3s cubic-bezier(.34,1.56,.64,1) forwards;
    }
    .dot.show { display: block; }
    @keyframes dot-pop { from{transform:scale(0)} to{transform:scale(1)} }

    /* ═══════════════════════════════════
       3-D CSS CREATURE
       perspective container keeps the 3D
    ═══════════════════════════════════ */
    .creature-wrap {
      width: 44px; height: 44px;
      perspective: 180px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }

    .body {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle at 36% 30%, #ffffff 0%, #f5ede0 55%, #e8d6be 100%);
      box-shadow:
        inset -4px -4px 8px rgba(180,140,90,.25),
        inset 3px 3px 6px rgba(255,255,255,.9),
        0 6px 16px rgba(100,70,20,.18),
        0 2px 5px rgba(100,70,20,.12);
      position: relative;
      transform-style: preserve-3d;
      transform: rotateX(8deg);
      transition: transform .35s cubic-bezier(.34,1.56,.64,1);
      animation: body-breathe 3.8s ease-in-out infinite;
    }
    @keyframes body-breathe {
      0%,100%{ transform: rotateX(8deg) scaleY(1);   }
      50%    { transform: rotateX(8deg) scaleY(1.04); }
    }

    /* Face layer sits on the front of the sphere */
    .face {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 0;
    }

    /* Eyes */
    .eyes {
      display: flex; gap: 8px;
      margin-top: 4px;
      transition: all .3s ease;
    }
    .eye {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #2d1f0e;
      position: relative;
      transition: all .3s ease;
    }
    /* eye shine */
    .eye::after {
      content: '';
      position: absolute; top: 1px; left: 1px;
      width: 2px; height: 2px;
      border-radius: 50%;
      background: rgba(255,255,255,.85);
    }

    /* Mouth */
    .mouth {
      width: 12px; height: 6px;
      border-radius: 0 0 10px 10px;
      border: 2px solid #2d1f0e;
      border-top: none;
      margin-top: 3px;
      transition: all .3s ease;
    }

    /* Cheeks */
    .cheeks {
      position: absolute;
      bottom: 9px;
      width: 100%; display: flex; justify-content: space-between;
      padding: 0 5px;
    }
    .cheek {
      width: 8px; height: 5px;
      border-radius: 50%;
      background: rgba(255,150,130,.35);
      transition: opacity .3s ease;
    }

    /* Sprout on top — green leaf stalk */
    .sprout {
      position: absolute;
      top: -10px; left: 50%;
      transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center;
    }
    .sprout-stem {
      width: 2.5px; height: 8px;
      background: #4ade80;
      border-radius: 2px;
    }
    .sprout-leaf {
      width: 14px; height: 10px;
      background: radial-gradient(ellipse at 40% 40%, #86efac, #22c55e);
      border-radius: 60% 40% 40% 60% / 60% 60% 40% 40%;
      box-shadow: 0 2px 6px rgba(34,197,94,.3);
      animation: leaf-sway 3.8s ease-in-out infinite;
      transform-origin: bottom center;
    }
    @keyframes leaf-sway {
      0%,100%{ transform: rotate(-6deg); }
      50%    { transform: rotate(6deg);  }
    }

    /* ─── Emotion states ─── */

    /* happy: default – bright open eyes */
    .creature-wrap.happy .eye        { width:6px; height:6px; border-radius:50%; }
    .creature-wrap.happy .mouth      { border-radius: 0 0 12px 12px; width: 14px; }

    /* sleepy: half-closed eyes + small mouth + leaf blanket */
    .creature-wrap.sleepy .eye       { height: 3px; border-radius: 3px 3px 0 0; background: #3d2a14; }
    .creature-wrap.sleepy .eye::after{ display:none; }
    .creature-wrap.sleepy .mouth     { width: 8px; height: 4px; border-radius: 0 0 6px 6px; }
    .creature-wrap.sleepy .body      { animation: sleepy-sag 4s ease-in-out infinite; }
    @keyframes sleepy-sag {
      0%,100%{ transform: rotateX(14deg) scaleY(.98); }
      50%    { transform: rotateX(10deg) scaleY(1.01); }
    }
    .creature-wrap.sleepy .leaf-sway { animation-duration: 6s; }

    /* Sleepy z Z Z snore animation */
    .snore-zzz, .head-snore-zzz {
      position: absolute;
      top: -14px; right: -6px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 800;
      font-size: 11px;
      color: #6366f1;
      opacity: 0;
      pointer-events: none;
      display: none;
      z-index: 20;
    }
    .head-snore-zzz { top: -16px; right: -8px; font-size: 13px; }
    .creature-wrap.sleepy .snore-zzz,
    .head-creature-wrap.sleepy .head-snore-zzz {
      display: block;
      animation: snore-float 2.8s ease-in-out infinite;
    }
    @keyframes snore-float {
      0%   { opacity: 0; transform: translate(0, 4px) scale(0.7); }
      40%  { opacity: 0.95; transform: translate(4px, -6px) scale(1); }
      80%  { opacity: 0.6; transform: translate(8px, -15px) scale(1.2); }
      100% { opacity: 0; transform: translate(10px, -22px) scale(1.3); }
    }

    /* Leaf blanket tucked over bottom half */
    .leaf-blanket, .head-leaf-blanket {
      position: absolute;
      bottom: -2px; left: 50%;
      transform: translateX(-50%);
      width: 36px; height: 16px;
      background: radial-gradient(ellipse at 50% 100%, #22c55e, #15803d);
      border-radius: 12px 12px 18px 18px;
      box-shadow: 0 -2px 5px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.4);
      display: none;
      z-index: 10;
    }
    .head-leaf-blanket { width: 46px; height: 20px; bottom: -3px; }
    .creature-wrap.sleepy .leaf-blanket,
    .head-creature-wrap.sleepy .head-leaf-blanket {
      display: block;
      animation: blanket-breathe 4s ease-in-out infinite;
    }
    @keyframes blanket-breathe {
      0%,100% { transform: translateX(-50%) scaleY(1); }
      50%     { transform: translateX(-50%) scaleY(1.08); }
    }

    /* Sleep Card */
    .card.sleep {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      border-color: #4338ca;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(49,46,129,0.25);
    }
    .card.sleep .card-title { color: #f8fafc; }
    .card.sleep .card-sub   { color: #c7d2fe; }
    .card-btn.sleep { background: #6366f1; color: #ffffff; }
    .card-btn.sleep:hover { background: #4f46e5; }

    /* curious: one eye bigger, head tilt */
    .creature-wrap.curious .body     { animation: tilt-bob 3s ease-in-out infinite; }
    @keyframes tilt-bob {
      0%,100%{ transform: rotateX(8deg) rotateZ(-5deg);  }
      50%    { transform: rotateX(8deg) rotateZ(5deg);   }
    }
    .creature-wrap.curious .eyes     { gap: 9px; }

    /* excited: bouncy */
    .creature-wrap.excited .body     { animation: excited-bounce .55s cubic-bezier(.34,1.56,.64,1) 3 both; }
    @keyframes excited-bounce {
      0%   { transform: rotateX(8deg) translateY(0)   scale(1);    }
      40%  { transform: rotateX(8deg) translateY(-8px) scale(1.06); }
      70%  { transform: rotateX(8deg) translateY(-3px) scale(1.02); }
      100% { transform: rotateX(8deg) translateY(0)   scale(1);    }
    }
    .creature-wrap.excited .mouth    { width:16px; height:8px; border-color:#1a3d2c; }
    .creature-wrap.excited .cheek    { opacity:1; background: rgba(255,120,100,.5); }

    /* concerned: slight shake */
    .creature-wrap.concerned .body   { animation: concerned-shake .35s ease-in-out 4 both; }
    @keyframes concerned-shake {
      0%,100%{ transform: rotateX(8deg) rotateZ(0);    }
      25%    { transform: rotateX(8deg) rotateZ(-3deg); }
      75%    { transform: rotateX(8deg) rotateZ(3deg);  }
    }
    .creature-wrap.concerned .eye    { width:5px; height:7px; border-radius: 40%; }
    .creature-wrap.concerned .mouth  { border-radius: 10px 10px 0 0; border-top: 2px solid #2d1f0e; border-bottom:none; width:10px; height:5px; margin-top: 4px; }

    /* proud: puffed up with glow */
    .creature-wrap.proud .body       {
      animation: proud-pulse 2.5s ease-in-out infinite;
      box-shadow:
        inset -4px -4px 8px rgba(180,140,90,.25),
        inset 3px 3px 6px rgba(255,255,255,.9),
        0 0 18px rgba(74,222,128,.45),
        0 6px 16px rgba(100,70,20,.18);
    }
    @keyframes proud-pulse {
      0%,100%{ transform: rotateX(8deg) scale(1);    }
      50%    { transform: rotateX(8deg) scale(1.06); }
    }
    .creature-wrap.proud .mouth      { width:18px; height:9px; border-color:#155724; }

    /* sad: droopy */
    .creature-wrap.sad .eye          { height:5px; border-radius:50% 50% 0 0; }
    .creature-wrap.sad .mouth        { border-radius: 10px 10px 0 0; border-top: 2px solid #2d1f0e; border-bottom:none; margin-top:5px; width:10px; height:5px; }
    .creature-wrap.sad .body         { animation: sad-droop 5s ease-in-out infinite; }
    @keyframes sad-droop {
      0%,100%{ transform: rotateX(14deg) scaleY(.97); }
      50%    { transform: rotateX(12deg) scaleY(1);   }
    }

    /* ─── Panel ────────────────────────────────── */
    .panel {
      position: absolute; bottom: 70px; right: 0;
      width: 316px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.07);
      overflow: hidden;
      display: none; flex-direction: column;
      transform-origin: bottom right;
    }
    .panel.open {
      display: flex;
      animation: panel-in .28s cubic-bezier(.16,1,.3,1) forwards;
    }
    .panel.closing {
      display: flex;
      animation: panel-out .2s ease forwards;
    }
    @keyframes panel-in  { from{opacity:0;transform:scale(.84) translateY(10px)} to{opacity:1;transform:none} }
    @keyframes panel-out { from{opacity:1;transform:none} to{opacity:0;transform:scale(.88) translateY(8px)} }

    /* panel head */
    .p-head {
      display: flex; align-items: flex-end; gap: 12px;
      padding: 14px 16px 12px;
      background: linear-gradient(135deg, #f5f0e8, #edf5ed);
      border-bottom: 1px solid #e8e2d8;
    }

    /* 3D creature in head — larger */
    .head-creature-wrap {
      width: 58px; height: 58px;
      perspective: 220px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .head-body {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: radial-gradient(circle at 36% 30%, #ffffff 0%, #f5ede0 55%, #e8d6be 100%);
      box-shadow:
        inset -5px -5px 10px rgba(180,140,90,.25),
        inset 4px 4px 8px rgba(255,255,255,.9),
        0 8px 20px rgba(100,70,20,.2), 0 2px 6px rgba(100,70,20,.12);
      position: relative;
      transform: rotateX(8deg);
      animation: body-breathe 3.8s ease-in-out infinite;
    }
    .head-face { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0; }
    .head-eyes { display:flex;gap:10px;margin-top:5px;transition:all .3s ease; }
    .head-eye {
      width:7px; height:7px; border-radius:50%; background:#2d1f0e; position:relative;
      transition: all .3s ease;
    }
    .head-eye::after { content:'';position:absolute;top:1px;left:1px;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.85); }
    .head-mouth { width:14px;height:7px;border-radius:0 0 12px 12px;border:2.5px solid #2d1f0e;border-top:none;margin-top:4px;transition:all .3s ease; }
    .head-cheeks { position:absolute;bottom:11px;width:100%;display:flex;justify-content:space-between;padding:0 7px; }
    .head-cheek  { width:10px;height:6px;border-radius:50%;background:rgba(255,150,130,.35);transition:opacity .3s ease; }
    .head-sprout { position:absolute;top:-13px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center; }
    .head-sprout-stem  { width:3px;height:10px;background:#4ade80;border-radius:2px; }
    .head-sprout-leaf  { width:18px;height:13px;background:radial-gradient(ellipse at 40% 40%,#86efac,#22c55e);border-radius:60% 40% 40% 60%/60% 60% 40% 40%;box-shadow:0 2px 8px rgba(34,197,94,.3);animation:leaf-sway 3.8s ease-in-out infinite;transform-origin:bottom center; }

    .speech-wrap { flex:1; }
    .speech-bubble {
      background:#fff;
      border-radius:14px 14px 14px 4px;
      padding:9px 13px;
      font-size:12.5px;font-weight:500;color:#334155;line-height:1.45;
      box-shadow:0 2px 12px rgba(0,0,0,.09);
      min-height:42px;position:relative;
    }
    .speech-bubble::after {
      content:'';position:absolute;bottom:-1px;left:-7px;
      border:7px solid transparent;
      border-right-color:#fff;border-bottom-color:#fff;
    }
    .speech-cursor {
      display:inline-block;width:2px;height:13px;background:#2d6a4f;margin-left:1px;
      vertical-align:middle;animation:blink-c .8s step-end infinite;
    }
    @keyframes blink-c{0%,100%{opacity:1}50%{opacity:0}}
    .emotion-tag { position:absolute;top:10px;right:12px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em; }

    /* panel body */
    .p-body {
      padding:10px 12px 12px;
      display:flex;flex-direction:column;gap:7px;
      max-height:260px;overflow-y:auto;
    }
    .p-body::-webkit-scrollbar{width:3px}
    .p-body::-webkit-scrollbar-thumb{background:#e2ddd6;border-radius:3px}

    /* cards */
    .card {
      border-radius:13px;padding:10px 12px;
      display:flex;align-items:center;gap:10px;
      flex-wrap:wrap;
      cursor:pointer;border:1px solid transparent;
      transition:transform .15s ease,background .12s ease,box-shadow .15s ease,opacity .25s ease;
      animation:card-in .25s cubic-bezier(.16,1,.3,1) both;
    }
    .card:hover{transform:translateY(-1px)}
    @keyframes card-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    .card.return  {background:#f0fdf4;border-color:#86efac;box-shadow:0 2px 8px rgba(45,106,79,.1)}
    .card.return:hover{background:#dcfce7}
    .card.stale   {background:#fffbeb;border-color:#fcd34d;box-shadow:0 2px 8px rgba(245,158,11,.08)}
    .card.stale:hover{background:#fef3c7}
    .card.session {background:#f0f4ff;border-color:#a5b4fc;box-shadow:0 2px 8px rgba(99,102,241,.1)}
    .card.session:hover{background:#e0e7ff}
    .card.decay   {background:#fff7ed;border-color:#fdba74;box-shadow:0 2px 8px rgba(249,115,22,.08)}
    .card.decay:hover{background:#ffedd5}
    .card-icon{font-size:20px;flex-shrink:0}
    .card-text{flex:1;min-width:0}
    .card-title{font-size:12px;font-weight:700;color:#1e293b}
    .card-sub{font-size:11px;color:#64748b;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .card-btn{flex-shrink:0;border:none;font-size:11px;font-weight:700;padding:5px 10px;border-radius:8px;cursor:pointer;transition:background .12s ease}
    .card-btn.green{background:#2d6a4f;color:#fff}.card-btn.green:hover{background:#245438}
    .card-btn.amber{background:#d97706;color:#fff}.card-btn.amber:hover{background:#b45309}
    .card-btn.indigo{background:#4f46e5;color:#fff}.card-btn.indigo:hover{background:#4338ca}
    .card-btn.emerald{background:#059669;color:#fff}.card-btn.emerald:hover{background:#047857}
    .card-btn.blue{background:#2563eb;color:#fff}.card-btn.blue:hover{background:#1d4ed8}
    .card-btn.purple{background:#7c3aed;color:#fff}.card-btn.purple:hover{background:#6d28d9}

    .session-name-row{display:none;align-items:center;gap:6px;margin-top:6px;width:100%}
    .session-input{flex:1;border:1px solid #c7d2fe;border-radius:7px;padding:5px 8px;font-size:11px;color:#1e293b;background:#fff;outline:none}
    .session-input:focus{border-color:#818cf8;box-shadow:0 0 0 2px rgba(129,140,248,.2)}
    .session-confirm{background:#4f46e5;color:#fff;border:none;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer}

    .tab-intent-row{display:none;align-items:center;gap:6px;margin-top:6px;width:100%}
    .intent-inline-input{flex:1;border:1px solid #a7f3d0;border-radius:7px;padding:5px 8px;font-size:11px;color:#064e3b;background:#fff;outline:none}
    .intent-inline-input:focus{border-color:#10b981;box-shadow:0 0 0 2px rgba(16,185,129,.2)}
    .intent-inline-confirm{background:#059669;color:#fff;border:none;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer}
    .intent-inline-confirm:hover{background:#047857}
    .empty{text-align:center;padding:14px 8px;font-size:12px;color:#94a3b8}

    /* footer */
    .p-footer{padding:8px 12px 11px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f1f5f9;background:#fafafa}
    .footer-brand{font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:.06em}
    .hide-btn{background:none;border:none;font-size:11px;color:#94a3b8;cursor:pointer;padding:3px 5px;border-radius:5px;transition:all .12s ease}
    .hide-btn:hover{color:#475569;background:#f1f5f9}
  </style>

  <!-- ■ Pill -->
  <div class="pill" id="pill">
    <div class="creature-wrap happy" id="pillCreature">
      <div class="body">
        <div class="sprout"><div class="sprout-stem"></div><div class="sprout-leaf"></div></div>
        <div class="face">
          <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
          <div class="mouth"></div>
        </div>
        <div class="cheeks"><div class="cheek"></div><div class="cheek"></div></div>
        <div class="leaf-blanket"></div>
        <div class="snore-zzz">z Z Z</div>
      </div>
    </div>
    <div class="dot" id="dot"></div>
  </div>

  <!-- ■ Panel -->
  <div class="panel" id="panel">
    <div class="p-head">
      <!-- larger 3D creature in panel head -->
      <div class="head-creature-wrap" id="headCreatureWrap">
        <div class="head-body" id="headBody">
          <div class="head-sprout"><div class="head-sprout-stem"></div><div class="head-sprout-leaf"></div></div>
          <div class="head-face">
            <div class="head-eyes"><div class="head-eye" id="hEyeL"></div><div class="head-eye" id="hEyeR"></div></div>
            <div class="head-mouth" id="hMouth"></div>
          </div>
          <div class="head-cheeks"><div class="head-cheek" id="hChkL"></div><div class="head-cheek" id="hChkR"></div></div>
          <div class="head-leaf-blanket"></div>
          <div class="head-snore-zzz">z Z Z</div>
        </div>
      </div>
      <div class="speech-wrap">
        <div class="speech-bubble">
          <span id="speechText"></span><span class="speech-cursor" id="cursor"></span>
        </div>
      </div>
      <div class="emotion-tag" id="emotionTag">calm</div>
    </div>

    <div class="p-body" id="panelBody"></div>

    <div class="p-footer">
      <span class="footer-brand">🌱 NOOK</span>
      <button class="hide-btn" id="hideBtn">Hide ✕</button>
    </div>
  </div>
  `;

  // ── Refs ──────────────────────────────────────────────────────
  const pill        = S.getElementById('pill');
  const pillCr      = S.getElementById('pillCreature');
  const dot         = S.getElementById('dot');
  const panel       = S.getElementById('panel');
  const headBody    = S.getElementById('headBody');
  const hEyeL       = S.getElementById('hEyeL');
  const hEyeR       = S.getElementById('hEyeR');
  const hMouth      = S.getElementById('hMouth');
  const hChkL       = S.getElementById('hChkL');
  const hChkR       = S.getElementById('hChkR');
  const speechText  = S.getElementById('speechText');
  const cursor      = S.getElementById('cursor');
  const emotionTag  = S.getElementById('emotionTag');
  const panelBody   = S.getElementById('panelBody');
  const hideBtn     = S.getElementById('hideBtn');

  let open = false, typeTimer = null, pagePos = null;

  // ── Hidden state via chrome.storage (global, not per-origin) ─────
  // localStorage is per-domain — hiding on github.com wouldn't hide on youtube.com.
  // chrome.storage.local is extension-global, which is what we want.
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get('nook_widget_hidden', (res) => {
      if (res.nook_widget_hidden) host.style.display = 'none';
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.nook_widget_hidden) {
        if (!changes.nook_widget_hidden.newValue) {
          host.style.display = 'block';
        }
      }
    });
  }

  // ── Runtime message listener ──────────────────────────────────
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'SHOW_NOOK_WIDGET') {
        host.style.display = 'block';
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove('nook_widget_hidden');
        }
        openPanel();
        sendResponse({ success: true });
        return true;
      }
      if (msg.type === 'SCROLL_AND_HIGHLIGHT') {
        triggerResumeHighlight(msg.scrollY, msg.percentage, msg.title);
        sendResponse({ success: true });
        return true;
      }
    });
  }

  // ── Pill click ────────────────────────────────────────────────
  pill.addEventListener('click', () => open ? closePanel() : openPanel());

  function openPanel()  { open=true;  panel.classList.remove('closing'); panel.classList.add('open'); buildPanel(); }
  function closePanel() { open=false; panel.classList.add('closing'); panel.classList.remove('open'); setTimeout(()=>panel.classList.remove('closing'),220); }

  hideBtn.addEventListener('click', () => {
    closePanel(); host.style.display = 'none';
    // Save globally — creature disappears on ALL pages until restored
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ nook_widget_hidden: true });
    }
  });

  // ── Creature Poke Interaction ─────────────────────────────────
  const headCreatureWrap = S.querySelector('.head-creature-wrap');
  if (headCreatureWrap) {
    const cuteReactions = [
      { emotion: 'excited', speech: 'Hehe, that tickles! 🌱' },
      { emotion: 'proud', speech: 'Keeping your browser cozy & tidy! ✨' },
      { emotion: 'curious', speech: 'Whatcha working on today? 🔍' },
      { emotion: 'happy', speech: 'Always here in your corner! 💚' }
    ];
    let reactIdx = 0;
    headCreatureWrap.style.cursor = 'pointer';
    headCreatureWrap.title = 'Poke Nook!';
    headCreatureWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = cuteReactions[reactIdx % cuteReactions.length];
      reactIdx++;
      setEmotion(r.emotion, r.speech);
    });
  }

  // ── Set emotion ───────────────────────────────────────────────
  function setEmotion(name, speech) {
    // Pill creature class
    pillCr.className = `creature-wrap ${name}`;
    headCreatureWrap?.classList.toggle('sleepy', name === 'sleepy');

    // Head eyes/mouth override per emotion
    hEyeL.style.cssText = hEyeR.style.cssText = '';
    hMouth.style.cssText = '';
    hChkL.style.opacity = hChkR.style.opacity = '';
    headBody.style.cssText = '';

    const emo = {
      happy:     () => {},
      sleepy:    () => {
        const isRabbit = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com', 'twitch.tv', 'tiktok.com'].some(d => location.hostname.includes(d));
        if (isRabbit) {
          // One eye peeking! Left eye drowsy line, right eye peeking round
          hEyeL.style.height='2.5px'; hEyeL.style.borderRadius='3px 3px 0 0';
          hEyeR.style.width='6.5px';  hEyeR.style.height='6.5px'; hEyeR.style.borderRadius='50%';
          hMouth.style.width='9px';   hMouth.style.height='4px';
        } else {
          [hEyeL, hEyeR].forEach(e => { e.style.height='3px'; e.style.borderRadius='3px 3px 0 0'; });
          hMouth.style.width='8px'; hMouth.style.height='4px';
        }
      },
      curious:   () => { hEyeL.style.width='9px'; hEyeL.style.height='9px'; },
      excited:   () => {
        hMouth.style.width='18px'; hMouth.style.height='9px';
        hChkL.style.opacity='1'; hChkR.style.opacity='1';
        headBody.style.animation='excited-bounce .55s cubic-bezier(.34,1.56,.64,1) 3 both';
      },
      concerned: () => {
        [hEyeL, hEyeR].forEach(e => { e.style.width='5px'; e.style.height='8px'; e.style.borderRadius='40%'; });
        hMouth.style.borderRadius='10px 10px 0 0'; hMouth.style.borderTop='2.5px solid #2d1f0e'; hMouth.style.borderBottom='none'; hMouth.style.width='10px';
        headBody.style.animation='concerned-shake .35s ease-in-out 4 both';
      },
      proud:     () => {
        hMouth.style.width='20px'; hMouth.style.height='10px';
        headBody.style.boxShadow='inset -5px -5px 10px rgba(180,140,90,.25),inset 4px 4px 8px rgba(255,255,255,.9),0 0 22px rgba(74,222,128,.5),0 8px 20px rgba(100,70,20,.2)';
      },
      sad:       () => {
        [hEyeL, hEyeR].forEach(e => { e.style.borderRadius='50% 50% 0 0'; e.style.height='5px'; });
        hMouth.style.borderRadius='10px 10px 0 0'; hMouth.style.borderTop='2.5px solid #2d1f0e'; hMouth.style.borderBottom='none'; hMouth.style.marginTop='6px';
      },
    };
    (emo[name] || emo.happy)();
    emotionTag.textContent = name;
    dot.classList.toggle('show', ['concerned','curious','excited','sad'].includes(name));
    typewrite(speech);
  }

  // ── Typewriter ────────────────────────────────────────────────
  function typewrite(text) {
    clearTimeout(typeTimer);
    speechText.textContent = '';
    cursor.style.display = 'inline-block';
    let i = 0;
    const tick = () => {
      if (i < text.length) { speechText.textContent += text[i++]; typeTimer = setTimeout(tick, 20 + Math.random()*16); }
      else setTimeout(()=>{ cursor.style.display='none'; }, 1000);
    };
    tick();
  }

  // ── Jump Back / Resume Glow & Smooth Scroll ───────────────────
  function triggerResumeHighlight(targetY, pct, title) {
    if (typeof targetY === 'number') {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(() => {
        if (Math.abs(window.scrollY - targetY) > 60) {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 350);
    }

    document.getElementById('nook-resume-beam')?.remove();
    document.getElementById('nook-resume-pill')?.remove();
    document.getElementById('nook-resume-anim')?.remove();

    const beam = document.createElement('div');
    beam.id = 'nook-resume-beam';
    beam.style.cssText = `
      position: fixed;
      top: 32%;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, #10b981 25%, #34d399 50%, #10b981 75%, transparent 100%);
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.85), 0 0 32px rgba(16, 185, 129, 0.45);
      z-index: 2147483640;
      pointer-events: none;
      animation: nookBeamFade 2.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    const pill = document.createElement('div');
    pill.id = 'nook-resume-pill';
    pill.style.cssText = `
      position: fixed;
      top: calc(32% + 12px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(8px);
      color: #ecfdf5;
      padding: 7px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.4);
      z-index: 2147483641;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      animation: nookPillFade 3.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    pill.innerHTML = `<span>📖</span> <span>Resumed reading · <strong>${pct || 0}% read</strong></span>`;

    const animStyle = document.createElement('style');
    animStyle.id = 'nook-resume-anim';
    animStyle.textContent = `
      @keyframes nookBeamFade {
        0% { opacity: 0; transform: scaleY(0.4); }
        15% { opacity: 1; transform: scaleY(1.5); }
        70% { opacity: 1; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(0.2); }
      }
      @keyframes nookPillFade {
        0% { opacity: 0; transform: translate(-50%, 8px) scale(0.95); }
        15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        75% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -6px) scale(0.96); }
      }
    `;

    document.head.appendChild(animStyle);
    document.body.appendChild(beam);
    document.body.appendChild(pill);

    setTimeout(() => {
      beam.remove();
      pill.remove();
      animStyle.remove();
    }, 3200);

    setEmotion('excited', `Welcome back! Picked up at ${pct || 0}% 📖`);
  }

  // ── Build panel ───────────────────────────────────────────────
  function buildPanel() {
    panelBody.innerHTML = '';

    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currPct = Math.min(100, Math.round((window.scrollY / scrollMax) * 100));

    // 1. Reading Return Point / Scroll Bookmark
    if (pagePos && pagePos.scrollY > 150) {
      const ago = fmtAgo(Date.now() - pagePos.timestamp);
      addCard('return', '📖', 'You left off here', `${ago} ago · ${pagePos.percentage || 0}% through`,
        'Resume ↗', 'emerald', () => {
          triggerResumeHighlight(pagePos.scrollY, pagePos.percentage, document.title);
          closePanel();
        });
    } else {
      addCard('return', '📖', 'Mark Reading Point', `Currently at ${currPct}% scroll depth`,
        'Save 📍', 'green', () => {
          pagePos = {
            url: location.href,
            title: document.title,
            scrollY: window.scrollY,
            percentage: currPct,
            timestamp: Date.now()
          };
          chrome.runtime?.sendMessage({ type: 'RECORD_PAGE_POSITION', data: pagePos });
          triggerResumeHighlight(window.scrollY, currPct, document.title);
          buildPanel();
        });
    }

    if (typeof chrome === 'undefined' || !chrome.runtime) {
      setEmotion('happy', 'All quiet for now. ✨');
      return;
    }

    // 2. Fetch Tab Summary to populate companion actions
    chrome.runtime.sendMessage({ type: 'GET_TAB_SUMMARY' }, res => {
      if (!res) return;

      const intents = res.tabIntents || {};
      const thisIntent = intents[location.href]?.intent || '';

      // Tab Mission Note
      const intentCard = addCard('session', '🎯',
        thisIntent ? `Mission: "${thisIntent}"` : 'Tab Mission Note',
        thisIntent ? 'Click to edit your 1-line tab purpose' : 'Why did I open this? (1-line intent)',
        thisIntent ? 'Edit ✏️' : 'Add Note +', 'blue', () => {
          intentRow.style.display = intentRow.style.display === 'flex' ? 'none' : 'flex';
          if (intentRow.style.display === 'flex') {
            intentRow.querySelector('.intent-inline-input').focus();
          }
        });

      const intentRow = document.createElement('div');
      intentRow.className = 'tab-intent-row';
      intentRow.innerHTML = `
        <input class="intent-inline-input" value="${thisIntent.replace(/"/g, '&quot;')}" placeholder="Why did you open this tab?" />
        <button class="intent-inline-confirm">Save</button>
      `;
      intentCard.appendChild(intentRow);

      const input = intentRow.querySelector('.intent-inline-input');
      const saveBtn = intentRow.querySelector('.intent-inline-confirm');

      input.addEventListener('click', e => e.stopPropagation());
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') saveBtn.click();
      });
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const note = input.value.trim();
        chrome.runtime.sendMessage({
          type: 'SET_TAB_INTENT',
          url: location.href,
          title: document.title,
          intent: note
        }, () => {
          setEmotion('excited', note ? `Remembered: "${note.slice(0, 22)}"! 🎯` : 'Cleared intent note 🌱');
          buildPanel();
        });
      });

      // Priority Spotlight Focus Mode
      const isSpotlight = res.activeSpotlight && res.activeSpotlight.activeTabUrl === location.href;
      addCard('return', '⚡',
        isSpotlight ? 'Spotlight Focus Active' : 'Spotlight Priority Focus',
        isSpotlight ? 'Active priority focus on this tab' : 'Lock in without closing other tabs',
        isSpotlight ? 'Done ✓' : 'Focus Tab', 'emerald', () => {
          if (isSpotlight) {
            chrome.runtime.sendMessage({ type: 'COMPLETE_SPOTLIGHT' }, () => {
              setEmotion('proud', 'Spotlight complete! Great focus 🎉');
              buildPanel();
            });
          } else {
            const goal = thisIntent || document.title;
            chrome.runtime.sendMessage({
              type: 'SET_SPOTLIGHT',
              spotlight: {
                title: goal,
                goal: goal,
                activeTabUrl: location.href,
                tabUrls: [location.href]
              }
            }, () => {
              setEmotion('excited', 'Focus locked onto this page! 🎯');
              buildPanel();
            });
          }
        });

      // Accordion Fold
      const groupsCount = res.groupsCount || 0;
      const isFolded = res.allGroupsCollapsed;
      addCard('session', isFolded ? '📂' : '📁',
        isFolded ? 'Unfold Tab Groups' : 'Accordion Fold Groups',
        groupsCount > 0 ? `${groupsCount} active group(s) in tab bar` : 'Compact tab bar while keeping tabs alive',
        isFolded ? 'Unfold' : 'Fold', 'indigo', () => {
          chrome.runtime.sendMessage({ type: 'TOGGLE_FOLD_GROUPS' }, (fRes) => {
            if (fRes?.success) {
              setEmotion('proud', fRes.collapsed ? 'Folded tab groups! Tidy tab bar ✨' : 'Tab groups unfolded! 📂');
              buildPanel();
            } else {
              setEmotion('curious', fRes?.reason || 'Group tabs by site first to fold!');
            }
          });
        });

      // Site Groups
      const siteGroups = res.siteGroups || [];
      const currentSiteGroup = siteGroups.find(s => location.hostname.includes(s.domain));
      if (currentSiteGroup && currentSiteGroup.count >= 2) {
        addCard('session', '🌐', `Group "${currentSiteGroup.title}" (${currentSiteGroup.count} tabs)`, `Organize all ${currentSiteGroup.domain} tabs together`, 'Group Site', 'indigo', () => {
          chrome.runtime.sendMessage({ type: 'GROUP_SPECIFIC_SITE', domain: currentSiteGroup.domain });
          setEmotion('proud', `Grouped ${currentSiteGroup.count} tabs on ${currentSiteGroup.title}! 🌐`);
          buildPanel();
        });
      }

      // Tab Bankruptcy / Clean Slate
      const totalTabs = res.totalTabs || 0;
      if (totalTabs >= 4) {
        addCard('stale', '🍃', `Tab Clean Slate (${totalTabs} tabs)`, 'Archive open tabs safely with 1-click restore', 'Tuck Away', 'amber', () => {
          chrome.runtime.sendMessage({ type: 'DECLARE_BANKRUPTCY' }, (bRes) => {
            if (bRes?.success) {
              setEmotion('proud', `Tucked ${bRes.count} tabs away safely! 🍃`);
              buildPanel();
            }
          });
        });
      }

      // Late-Night Sleep
      const hour = new Date().getHours();
      const isLateNight = hour >= 23 || hour < 6;
      const isRabbitHole = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com', 'twitch.tv', 'tiktok.com', 'instagram.com'].some(d => location.hostname.includes(d));
      if (isLateNight && isRabbitHole) {
        addCard('sleep', '🛌', 'Save for Tomorrow Morning', 'Tuck this tab away & rest with zero guilt', 'Save & Sleep', 'amber', () => {
          chrome.runtime.sendMessage({
            type: 'SAVE_FOR_MORNING',
            data: { url: location.href, title: document.title, percentage: pagePos?.percentage || 0 }
          }, () => {
            setEmotion('sleepy', 'Saved for tomorrow morning! Sweet dreams 🌙');
            setTimeout(() => window.close(), 600);
          });
        });
      }

      adaptCreature(res.staleTabs?.length || 0, res.clusters?.length || 0, siteGroups.length, totalTabs);
      checkEmpty();
    });

    // Bookmarks Lifecycle
    chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS_LIFECYCLE' }, res => {
      if (!res?.bookmarks) return;
      res.bookmarks.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen).slice(0, 1).forEach(b => {
        const leaf = b.stage === 'decayed' ? '🥀' : '🍂';
        addCard('decay', leaf, b.title?.slice(0, 32) || 'Forgotten bookmark', `${b.ageDays}d forgotten · ${b.domain || ''}`,
          'Revive', 'green', () => {
            chrome.runtime.sendMessage({ type: 'REVIVE_BOOKMARK', id: b.id, url: b.url });
            setEmotion('excited', `Revived! Fresh leaf sprout for "${(b.title || 'bookmark').slice(0, 18)}" 🌱`);
            buildPanel();
          });
      });
    });
  }

  function checkEmpty() {
    if (!panelBody.children.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = "Nothing pressing. You're all caught up ✨";
      panelBody.appendChild(e);
    }
  }

  function addCard(type,icon,title,sub,label,color,onClick) {
    const el=document.createElement('div'); el.className=`card ${type}`;
    el.innerHTML=`<span class="card-icon">${icon}</span><div class="card-text"><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div><button class="card-btn ${color}">${label}</button>`;
    if(onClick) {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.session-name-row') || e.target.closest('.tab-intent-row')) return;
        onClick(e);
      });
      el.querySelector('.card-btn').addEventListener('click', e=>{ e.stopPropagation(); onClick(e); });
    }
    panelBody.appendChild(el);
    return el;
  }

  function adaptCreature(stale, clusters, siteGroups = 0, total = 0) {
    const hour = new Date().getHours();
    const isLateNight = hour >= 23 || hour < 6;
    const isRabbitHole = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com', 'twitch.tv', 'tiktok.com'].some(d => location.hostname.includes(d));

    if (isLateNight && isRabbitHole) {
      setEmotion('sleepy', 'Still scrolling? Go to sleep, I\'ll save this for tomorrow 🛌');
    } else if (isLateNight) {
      setEmotion('sleepy', 'z Z Z... resting under my leaf blanket 😴');
    } else if (pagePos?.scrollY > 300) {
      setEmotion('excited', 'Pick up where you left off? 📖');
    } else if (total >= 15) {
      setEmotion('concerned', `Holding ${total} tabs... Declare Bankruptcy? 🍃`);
    } else if (stale >= 8) {
      setEmotion('concerned', `${stale} tabs are piling up...`);
    } else if (clusters > 0) {
      setEmotion('curious', 'I found a focus session forming! 🗂️');
    } else if (siteGroups > 0) {
      setEmotion('curious', 'Multiple tabs on the same site! 🌐');
    } else {
      const vibe = getSiteVibe();
      if (vibe) setEmotion(vibe.emotion, vibe.speech);
      else setEmotion('happy', 'All quiet for now. ✨');
    }
  }

  // ── Init ──────────────────────────────────────────────────────
  if (typeof chrome!=='undefined'&&chrome.runtime) {
    chrome.runtime.sendMessage({type:'GET_PAGE_POSITION',url:location.href}, pos=>{
      if(pos&&pos.scrollY>300){
        const mins=Math.round((Date.now()-pos.timestamp)/60000);
        if(mins>=2){ pagePos=pos; setEmotion('excited','You left off here — resume? 📖'); return; }
      }
      chrome.runtime.sendMessage({type:'GET_TAB_SUMMARY'}, res=>{
        adaptCreature(res?.staleTabs?.length||0, res?.clusters?.length||0, res?.siteGroups?.length||0, res?.totalTabs||0);
      });
    });
  } else {
    const v=getSiteVibe(); if(v) setEmotion(v.emotion,v.speech); else typewrite('All quiet for now. ✨');
  }

  // ── Scroll tracking ───────────────────────────────────────────
  let st=null;
  window.addEventListener('scroll',()=>{
    if(window.scrollY<200) return;
    clearTimeout(st);
    st=setTimeout(()=>{
      if(typeof chrome==='undefined'||!chrome.runtime) return;
      const h=document.documentElement.scrollHeight-window.innerHeight;
      chrome.runtime.sendMessage({type:'RECORD_PAGE_POSITION',data:{
        url:location.href,title:document.title,
        scrollY:window.scrollY,
        percentage:h>0?Math.round(window.scrollY/h*100):0,
        timestamp:Date.now()
      }});
    },1500);
  },{passive:true});

  function fmtAgo(ms) {
    const m=Math.round(ms/60000);
    return m<60?`${m}m`:m<1440?`${Math.round(m/60)}h`:`${Math.round(m/1440)}d`;
  }
})();
