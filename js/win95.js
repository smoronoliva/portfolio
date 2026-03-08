(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Clock ──────────────────────────────────────────── */
    function updateClock() {
      var el = document.getElementById('taskbar-clock');
      if (!el) return;
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      el.textContent = h + ':' + m;
    }
    updateClock();
    setInterval(updateClock, 1000);

    /* ── Welcome dialog ─────────────────────────────────── */
    var dialog = document.getElementById('welcome-dialog');
    if (dialog) {
      if (!sessionStorage.getItem('welcome-seen')) {
        dialog.classList.remove('hidden');
      }
      function closeDialog() {
        dialog.classList.add('hidden');
        sessionStorage.setItem('welcome-seen', '1');
      }
      var okBtn    = document.getElementById('dialog-ok-btn');
      var closeBtn = document.getElementById('dialog-close-btn');
      if (okBtn)    okBtn.addEventListener('click', closeDialog);
      if (closeBtn) closeBtn.addEventListener('click', closeDialog);
      document.addEventListener('keydown', function (e) {
        if (dialog.classList.contains('hidden')) return;
        if (e.key === 'Enter' || e.key === 'Escape') closeDialog();
      });
    }

    /* ── Window Manager ─────────────────────────────────── */
    var container      = document.getElementById('desktop-windows');
    var taskbarWindows = document.getElementById('taskbar-windows');
    if (!container) return;

    var windows  = {};   // id → { el, minimized, maximized, prevState }
    var highestZ = 100;
    var cascadeCount = 0;

    var configs = {
      about: {
        title: '👤 About Me — Portfolio',
        icon: '👤', label: 'About Me',
        width: 680
      },
      projects: {
        title: '💼 Projects — Portfolio',
        icon: '💼', label: 'Projects',
        width: 720
      },
      experience: {
        title: '📋 Experience — Portfolio',
        icon: '📋', label: 'Experience',
        width: 680
      },
      contact: {
        title: '📧 Contact — Portfolio',
        icon: '📧', label: 'Contact',
        width: 480
      },
      'photo-bocas-del-toro': { title: 'Bocas del Toro', icon: '🖼', label: 'Bocas del Toro', width: 700, height: 520, photo: true, src: 'references/about-me/Bocas del Toro.JPG' },
      'photo-morocco':        { title: 'Morocco',        icon: '🖼', label: 'Morocco',        width: 700, height: 520, photo: true, src: 'references/about-me/Morocco.JPG' },
      'photo-cusco':          { title: 'Cusco',          icon: '🖼', label: 'Cusco',          width: 700, height: 520, photo: true, src: 'references/about-me/Cusco.jpeg' },
      'photo-santa-marta':    { title: 'Santa Marta',    icon: '🖼', label: 'Santa Marta',    width: 700, height: 520, photo: true, src: 'references/about-me/Santa Marta.jpeg' },
      'photo-costa-rica':     { title: 'Costa Rica',     icon: '🖼', label: 'Costa Rica',     width: 700, height: 520, photo: true, src: 'references/about-me/Costa Rica.jpeg' },
      'photo-jungle-trek':    { title: 'Jungle Trek',    icon: '🖼', label: 'Jungle Trek',    width: 700, height: 520, photo: true, src: 'references/about-me/Jungle trek.jpeg' },
      'photo-jiu-jitsu':      { title: 'Jiu Jitsu',      icon: '🖼', label: 'Jiu Jitsu',      width: 700, height: 520, photo: true, src: 'references/about-me/Jiu Jitsu.jpeg' },
      'photo-sporting-cristal': { title: 'Sporting Cristal', icon: '🖼', label: 'Sporting Cristal', width: 700, height: 520, photo: true, src: 'references/about-me/Sporting Cristal.jpeg' }
    };

    /* Focus a window (bring to front) */
    function focusWindow(id) {
      if (!windows[id]) return;
      highestZ++;
      windows[id].el.style.zIndex = highestZ;
      updateTaskbarActive();
    }

    /* Highlight the taskbar button of the topmost visible window */
    function updateTaskbarActive() {
      var topZ = 0, topId = null;
      Object.keys(windows).forEach(function (id) {
        if (windows[id].minimized) return;
        var z = parseInt(windows[id].el.style.zIndex, 10) || 0;
        if (z > topZ) { topZ = z; topId = id; }
      });
      Object.keys(windows).forEach(function (id) {
        var btn = document.getElementById('tbtn-' + id);
        if (btn) btn.classList.toggle('active', id === topId && !windows[id].minimized);
      });
    }

    /* Open or restore/focus an existing window */
    function openWindow(id) {
      var cfg = configs[id];
      if (!cfg) return;

      if (windows[id]) {
        if (windows[id].minimized) restoreWindow(id);
        else focusWindow(id);
        return;
      }

      // Cascade position
      var step = 30;
      var posX = 80  + cascadeCount * step;
      var posY = 60  + cascadeCount * step;
      cascadeCount = (cascadeCount + 1) % 8;

      // Clamp so window starts on-screen
      posX = Math.min(posX, Math.max(0, window.innerWidth  - cfg.width  - 20));
      posY = Math.max(0, posY);

      // Pull content from <template> or build inline for photos
      var bodyHTML;
      if (cfg.photo) {
        bodyHTML = '<div class="photo-viewer-full"><img src="' + cfg.src + '" alt="' + cfg.label + '"></div>';
      } else {
        var tpl = document.getElementById('tpl-' + id);
        bodyHTML = tpl ? tpl.innerHTML : '<p>Content not found.</p>';
      }

      // Build window DOM
      var win = document.createElement('div');
      win.className = cfg.photo ? 'win95-window spa-window photo-window' : 'win95-window spa-window';
      win.id        = 'win-' + id;
      win.style.left  = posX + 'px';
      win.style.top   = posY + 'px';
      win.style.width = cfg.width + 'px';
      if (cfg.height) win.style.height = cfg.height + 'px';

      var titleBarHTML =
        '<div class="title-bar spa-title-bar">' +
          '<span class="title-bar-text">' + cfg.title + '</span>' +
          '<div class="title-bar-controls">' +
            '<button class="title-bar-btn spa-btn-minimize" title="Minimize">_</button>' +
            '<button class="title-bar-btn spa-btn-maximize" title="Maximize"></button>' +
            '<button class="title-bar-btn spa-btn-close"    title="Close">✕</button>' +
          '</div>' +
        '</div>';

      if (cfg.photo) {
        win.innerHTML = titleBarHTML + '<div class="window-body">' + bodyHTML + '</div>';
      } else {
        win.innerHTML = titleBarHTML +
          '<div class="menu-bar">' +
            '<span class="menu-bar-item">File</span>' +
            '<span class="menu-bar-item">View</span>' +
            '<span class="menu-bar-item">Help</span>' +
          '</div>' +
          '<div class="window-body">' + bodyHTML + '</div>' +
          '<div class="status-bar"><span class="status-bar-field">Last updated 08/03/2026</span></div>';
      }

      container.appendChild(win);
      windows[id] = { el: win, minimized: false, maximized: false, prevState: null };

      addTaskbarBtn(id, cfg);
      setupWindowEvents(id);
      initWindowContent(id, win);
      focusWindow(id);
    }

    function closeWindow(id) {
      if (!windows[id]) return;
      windows[id].el.remove();
      delete windows[id];
      removeTaskbarBtn(id);
      updateTaskbarActive();
    }

    function minimizeWindow(id) {
      if (!windows[id]) return;
      windows[id].el.style.display = 'none';
      windows[id].minimized = true;
      updateTaskbarActive();
    }

    function restoreWindow(id) {
      if (!windows[id]) return;
      windows[id].el.style.display = '';
      windows[id].minimized = false;
      focusWindow(id);
    }

    function maximizeWindow(id) {
      if (!windows[id]) return;
      var state = windows[id];
      var win   = state.el;
      var btn   = win.querySelector('.spa-btn-maximize');

      if (state.maximized) {
        win.classList.remove('maximized');
        if (state.prevState) {
          win.style.left   = state.prevState.left;
          win.style.top    = state.prevState.top;
          win.style.width  = state.prevState.width;
          win.style.height = state.prevState.height;
        }
        state.maximized = false;
        if (btn) btn.classList.remove('is-maximized');
      } else {
        state.prevState = {
          left:   win.style.left,
          top:    win.style.top,
          width:  win.style.width,
          height: win.style.height
        };
        win.classList.add('maximized');
        state.maximized = true;
        if (btn) btn.classList.add('is-maximized');
      }
    }

    function setupWindowEvents(id) {
      var win = windows[id].el;

      // Clicking anywhere in the window brings it to front
      win.addEventListener('mousedown', function () {
        focusWindow(id);
      });

      // Control buttons
      win.querySelector('.spa-btn-close').addEventListener('click', function (e) {
        e.stopPropagation();
        closeWindow(id);
      });
      win.querySelector('.spa-btn-minimize').addEventListener('click', function (e) {
        e.stopPropagation();
        minimizeWindow(id);
      });
      win.querySelector('.spa-btn-maximize').addEventListener('click', function (e) {
        e.stopPropagation();
        maximizeWindow(id);
      });

      // Title bar drag
      var titleBar = win.querySelector('.spa-title-bar');
      titleBar.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'BUTTON') return;
        if (windows[id].maximized) return;
        e.preventDefault();

        var startX    = e.clientX;
        var startY    = e.clientY;
        var startLeft = parseInt(win.style.left, 10) || 0;
        var startTop  = parseInt(win.style.top,  10) || 0;

        function onMove(e) {
          var newLeft = startLeft + (e.clientX - startX);
          var newTop  = startTop  + (e.clientY - startY);
          newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - win.offsetWidth));
          newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - win.offsetHeight - 30));
          win.style.left = newLeft + 'px';
          win.style.top  = newTop  + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup',   onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
      });

      // Double-click title bar → maximize / restore
      titleBar.addEventListener('dblclick', function (e) {
        if (e.target.tagName === 'BUTTON') return;
        maximizeWindow(id);
      });
    }

    /* Taskbar button management */
    function addTaskbarBtn(id, cfg) {
      var btn = document.createElement('button');
      btn.className   = 'taskbar-window-btn';
      btn.id          = 'tbtn-' + id;
      btn.textContent = cfg.icon + ' ' + cfg.label;
      btn.addEventListener('click', function () {
        if (!windows[id]) return;
        if (windows[id].minimized) {
          restoreWindow(id);
        } else {
          var myZ = parseInt(windows[id].el.style.zIndex, 10) || 0;
          if (myZ === highestZ) minimizeWindow(id);
          else focusWindow(id);
        }
      });
      taskbarWindows.appendChild(btn);
    }

    function removeTaskbarBtn(id) {
      var btn = document.getElementById('tbtn-' + id);
      if (btn) btn.remove();
    }

    /* ── Window content init ────────────────────────────── */
    function initWindowContent(id, win) {
      if (id !== 'about') return;
      var featured = win.querySelector('.about-featured-img');
      var thumbs   = win.querySelectorAll('.about-thumb');
      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          featured.src = thumb.getAttribute('data-full');
          thumbs.forEach(function (t) { t.classList.remove('active'); });
          thumb.classList.add('active');
        });
      });
    }

    /* ── Desktop icon drag & double-click ───────────────── */
    var icons       = document.querySelectorAll('.desktop-icon');
    var ICON_KEY    = 'desktop-icon-positions';
    var TASKBAR_H   = 30;

    var iconDefaults = {
      // Column 1 — decorative XP icons (x=16)
      'decor-recycle':    { left: 16,  top: 16  },
      'decor-notepad':    { left: 16,  top: 104 },
      'decor-calculator': { left: 16,  top: 192 },
      'decor-paint':      { left: 16,  top: 280 },
      'decor-wmp':        { left: 16,  top: 368 },
      'decor-msn':        { left: 16,  top: 456 },
      'decor-nfs':        { left: 16,  top: 544 },
      'decor-aoe':        { left: 16,  top: 632 },
      // Column 2 — personal photo icons (x=104)
      'photo-bocas-del-toro':  { left: 104, top: 16  },
      'photo-morocco':         { left: 104, top: 104 },
      'photo-cusco':           { left: 104, top: 192 },
      'photo-sporting-cristal':{ left: 104, top: 280 },
      'photo-jiu-jitsu':       { left: 104, top: 368 },
      'photo-santa-marta':     { left: 104, top: 456 },
      'photo-costa-rica':      { left: 104, top: 544 },
      'photo-jungle-trek':     { left: 104, top: 632 },
      // Column 3 — portfolio icons (x=192)
      'about':      { left: 192, top: 16  },
      'projects':   { left: 192, top: 104 },
      'experience': { left: 192, top: 192 },
      'contact':    { left: 192, top: 280 }
    };

    var savedIcons = {};
    try { savedIcons = JSON.parse(localStorage.getItem(ICON_KEY)) || {}; } catch (e) {}

    // Apply saved / default positions
    icons.forEach(function (icon, i) {
      var id  = icon.getAttribute('data-window');
      var pos = savedIcons[id] || iconDefaults[id] || { left: 16, top: 16 + i * 88 };
      icon.style.left = pos.left + 'px';
      icon.style.top  = pos.top  + 'px';
    });

    // Clamp all icons within the visible desktop area
    function clampIcons() {
      icons.forEach(function (icon) {
        var id      = icon.getAttribute('data-window');
        var newLeft = Math.max(0, Math.min(parseInt(icon.style.left, 10) || 0, window.innerWidth  - icon.offsetWidth));
        var newTop  = Math.max(0, Math.min(parseInt(icon.style.top,  10) || 0, window.innerHeight - icon.offsetHeight - TASKBAR_H));
        icon.style.left = newLeft + 'px';
        icon.style.top  = newTop  + 'px';
        if (savedIcons[id]) { savedIcons[id] = { left: newLeft, top: newTop }; }
      });
      try { localStorage.setItem(ICON_KEY, JSON.stringify(savedIcons)); } catch (e) {}
    }
    clampIcons();
    window.addEventListener('resize', clampIcons);

    icons.forEach(function (icon) {
      var id = icon.getAttribute('data-window');

      // Double-click → open window
      icon.addEventListener('dblclick', function () {
        if (id) openWindow(id);
      });

      // Drag
      icon.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();

        var startX    = e.clientX;
        var startY    = e.clientY;
        var startLeft = parseInt(icon.style.left, 10);
        var startTop  = parseInt(icon.style.top,  10);

        icon.classList.add('dragging');

        function onMove(e) {
          var newLeft = startLeft + (e.clientX - startX);
          var newTop  = startTop  + (e.clientY - startY);
          newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - icon.offsetWidth));
          newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - icon.offsetHeight - TASKBAR_H));
          icon.style.left = newLeft + 'px';
          icon.style.top  = newTop  + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup',   onUp);
          icon.classList.remove('dragging');
          savedIcons[id] = {
            left: parseInt(icon.style.left, 10),
            top:  parseInt(icon.style.top,  10)
          };
          try { localStorage.setItem(ICON_KEY, JSON.stringify(savedIcons)); } catch (e) {}
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
      });

      // Keyboard nav
      icon.setAttribute('tabindex', '0');
      icon.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (id) openWindow(id);
        }
      });
    });

    /* ── Start Menu ──────────────────────────────────────── */
    var startBtn  = document.querySelector('.taskbar-start-btn');
    var startMenu = document.getElementById('start-menu');

    startBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', function () {
      startMenu.style.display = 'none';
    });

    function resetIconPositions() {
      var decorIds     = ['decor-recycle', 'decor-notepad', 'decor-calculator', 'decor-paint', 'decor-wmp', 'decor-msn', 'decor-nfs', 'decor-aoe'];
      var photoIds     = ['photo-bocas-del-toro', 'photo-morocco', 'photo-cusco', 'photo-sporting-cristal', 'photo-jiu-jitsu', 'photo-santa-marta', 'photo-costa-rica', 'photo-jungle-trek'];
      var portfolioIds = ['about', 'projects', 'experience', 'contact'];

      var availH    = window.innerHeight - TASKBAR_H;
      var marginTop = 16;
      var colW      = 88;

      function assignCol(ids, col) {
        var step = Math.min(88, Math.floor((availH - marginTop) / ids.length));
        ids.forEach(function (id, i) {
          savedIcons[id] = { left: 16 + col * colW, top: marginTop + i * step };
        });
      }

      savedIcons = {};
      assignCol(decorIds,     0);
      assignCol(photoIds,     1);
      assignCol(portfolioIds, 2);

      try { localStorage.setItem(ICON_KEY, JSON.stringify(savedIcons)); } catch (e) {}

      icons.forEach(function (icon) {
        var id  = icon.getAttribute('data-window');
        var pos = savedIcons[id];
        if (pos) {
          icon.style.left = pos.left + 'px';
          icon.style.top  = pos.top  + 'px';
        }
      });
    }

    document.getElementById('start-reset-icons').addEventListener('click', function () {
      startMenu.style.display = 'none';
      resetIconPositions();
    });

  });
})();
