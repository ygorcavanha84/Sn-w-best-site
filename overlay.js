(function () {
  'use strict';

  var LANG_KEY = 'rc2_lang';
  var NICK_KEY = 'snow_nick';

  /* ── Sound ─────────────────────────────────────────── */
  var audio = null;
  function playClick() {
    try {
      if (!audio) {
        audio = new Audio('/click-sound.mp3');
        audio.volume = 0.5;
      }
      audio.currentTime = 0;
      audio.play().catch(function () {});
    } catch (e) {}
  }

  /* ── Token enforcement ─────────────────────────────── */
  var tokenGeneratedInSession = false;

  var WARN_MSGS = {
    en: 'Generate a token first to access the game.',
    es: 'Genera un token primero para acceder al juego.',
    pt: 'Gere um token primeiro para acessar o jogo.',
    ru: 'Сначала создайте токен, чтобы войти в игру.',
  };

  function showWarning() {
    var lang = localStorage.getItem(LANG_KEY) || 'en';
    var msg = WARN_MSGS[lang] || WARN_MSGS.en;
    var existing = document.getElementById('rc-token-warning');
    if (existing) return;
    var warn = document.createElement('div');
    warn.id = 'rc-token-warning';
    warn.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'background:#1c2028', 'border:1px solid #ef4444', 'color:#fca5a5',
      'font-size:13px', 'font-weight:600', 'padding:10px 20px',
      'border-radius:12px', 'z-index:999999', 'white-space:nowrap',
      'box-shadow:0 4px 20px rgba(0,0,0,.6)',
      'font-family:Inter,sans-serif',
    ].join(';');
    warn.textContent = msg;
    document.body.appendChild(warn);
    setTimeout(function () { warn.remove(); }, 2800);
  }

  /* ── Language overlay logic ─────────────────────────── */
  function dismissOverlay(lang) {
    localStorage.setItem(LANG_KEY, lang);
    var overlay = document.getElementById('rc-lang-overlay');
    if (overlay) {
      overlay.style.animation = 'rc-fadeout .2s ease forwards';
      setTimeout(function () { overlay.classList.add('rc-hidden'); }, 210);
    }
  }

  /* ── Welcome toast ──────────────────────────────────── */
  function showWelcomeToast(nick) {
    var existing = document.getElementById('snow-welcome-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'snow-welcome-toast';
    toast.textContent = 'Bem vindo ao SNØW BEST CONDOS, ' + nick + ' 👋';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 350);
    }, 4000);
  }

  /* ── Entry overlay ──────────────────────────────────── */
  function createEntryOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'snow-entry-overlay';

    overlay.innerHTML = [
      '<div id="snow-entry-box">',
        '<div id="snow-entry-logo">❄️</div>',
        '<div id="snow-entry-title">SNØW BEST CONDOS</div>',
        '<div id="snow-entry-sub">Bem vindo! Insira seu nick do Roblox para entrar.</div>',
        '<label id="snow-entry-label" for="snow-entry-input">Nick do Roblox</label>',
        '<input id="snow-entry-input" type="text" placeholder="Seu usuário no Roblox" autocomplete="off" spellcheck="false" maxlength="20" />',
        '<button id="snow-entry-btn" disabled>Entrar</button>',
      '</div>',
    ].join('');

    document.body.appendChild(overlay);

    var input = document.getElementById('snow-entry-input');
    var btn   = document.getElementById('snow-entry-btn');

    input.addEventListener('input', function () {
      btn.disabled = input.value.trim().length < 3;
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !btn.disabled) confirmEntry();
    });

    btn.addEventListener('click', function () {
      if (!btn.disabled) confirmEntry();
    });

    function confirmEntry() {
      var nick = input.value.trim();
      if (!nick) return;
      playClick();
      localStorage.setItem(NICK_KEY, nick);
      overlay.classList.add('snow-hiding');
      setTimeout(function () {
        overlay.remove();
        showWelcomeToast(nick);
      }, 460);
    }

    setTimeout(function () { input.focus(); }, 100);
  }

  /* ── Init entry on load ─────────────────────────────── */
  function initEntry() {
    var savedNick = localStorage.getItem(NICK_KEY);
    if (savedNick) {
      showWelcomeToast(savedNick);
    } else {
      createEntryOverlay();
    }
  }

  /* ── MutationObserver: sound + token enforcement ───── */
  var observer = new MutationObserver(function () {
    document.querySelectorAll('button:not([data-rc-s]), a:not([data-rc-s])').forEach(function (el) {
      el.setAttribute('data-rc-s', '1');
      el.addEventListener('click', playClick);
    });

    document.querySelectorAll('[data-testid="button-access-game"]:not([data-rc-e])').forEach(function (el) {
      el.setAttribute('data-rc-e', '1');
      el.addEventListener('click', function (e) {
        if (!tokenGeneratedInSession) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showWarning();
        }
      }, true);
    });

    document.querySelectorAll('[data-testid="button-generate-token"]:not([data-rc-t])').forEach(function (el) {
      el.setAttribute('data-rc-t', '1');
      el.addEventListener('click', function () {
        tokenGeneratedInSession = true;
      });
    });
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    if (
      (t.tagName === 'BUTTON' && t.dataset && t.dataset.testid === 'button-close-modal') ||
      t.id === 'rc-lang-overlay'
    ) {
      tokenGeneratedInSession = false;
    }
  }, true);

  document.querySelectorAll('#rc-lang-overlay .rc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playClick();
      dismissOverlay(btn.dataset.lang);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEntry);
  } else {
    initEntry();
  }

})();
