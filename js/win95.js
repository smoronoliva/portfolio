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
        title: '👤 About Me',
        icon: '👤', label: 'About Me',
        width: 680
      },
      projects: {
        title: '🏗️ Projects',
        icon: '🏗️', label: 'Projects',
        width: 720
      },
      experience: {
        title: '💼 Experience',
        icon: '💼', label: 'Experience',
        width: 680, height: 560
      },
      contact: {
        title: '✉️ Contact',
        icon: '✉️', label: 'Contact',
        width: 480
      },
      'photo-bocas-del-toro': { title: '🖼️ Bocas del Toro', icon: '🖼', label: 'Bocas del Toro', width: 700, height: 520, photo: true, src: 'references/about-me/Bocas del Toro.JPG', caption: 'They see me floating, they hating...' },
      'photo-morocco':        { title: '🖼️ Morocco',        icon: '🖼', label: 'Morocco',        width: 700, height: 520, photo: true, src: 'references/about-me/Morocco.JPG',           caption: 'Enjoying the view from a Moroccan fortress.' },
      'photo-cusco':          { title: '🖼️ Machu Picchu',   icon: '🖼', label: 'Machu Picchu',   width: 700, height: 520, photo: true, src: 'references/about-me/Machu Picchu.jpeg',     caption: 'Couldn\'t leave Peru without visiting this magical place.' },
      'photo-santa-marta':    { title: '🖼️ Valencia',       icon: '🖼', label: 'Valencia',       width: 700, height: 520, photo: true, src: 'references/about-me/Valencia.JPG',          caption: 'One of the reasons why I love this city.' },
      'photo-costa-rica':     { title: '🖼️ Costa Rica',     icon: '🖼', label: 'Costa Rica',     width: 700, height: 520, photo: true, src: 'references/about-me/Costa Rica.jpeg',      caption: 'Biking through the coastline in Puerto Viejo.' },
      'photo-jungle-trek':    { title: '🖼️ Santa Marta',    icon: '🖼', label: 'Santa Marta',    width: 700, height: 520, photo: true, src: 'references/about-me/Jungle trek.jpeg',     caption: 'Had a fever, but still, the best trek of my life.' },
      'photo-jiu-jitsu':      { title: '🖼️ Jiu Jitsu',      icon: '🖼', label: 'Jiu Jitsu',      width: 700, height: 520, photo: true, src: 'references/about-me/Jiu Jitsu.jpeg',       caption: 'Me and my longtime jiujitsu friends after receiving my purple belt.' },
      'photo-sporting-cristal': { title: '🖼️ Sporting Cristal', icon: '🖼', label: 'Sporting Cristal', width: 700, height: 520, photo: true, src: 'references/about-me/Sporting Cristal.jpeg', caption: 'First year working at the club and we won the league!' },
      'decor-calculator': {
        title: '🧮 Calculator',
        icon: '🧮', label: 'Calculator',
        width: 224,
        calculator: true
      },
      'decor-paint': {
        title: 'Untitled - Paint',
        icon: '🎨', label: 'Paint',
        width: 600, height: 500,
        drawing: true,
        images: [
          { src: 'references/drawings/Angry Goober.png',   name: 'Angry Goober',   caption: 'Sometimes I draw random stuff.' },
          { src: 'references/drawings/Doodle Goku.png',    name: 'Doodle Goku',    caption: 'Sometimes I draw random stuff.' },
          { src: 'references/drawings/MF Doomed.png',      name: 'MF Doomed',      caption: 'Sometimes I draw random stuff.' },
          { src: 'references/drawings/Notorious K.I.D..png', name: 'Notorious K.I.D.', caption: 'Sometimes I draw random stuff.' },
          { src: 'references/drawings/Pixel Doom.png',     name: 'Pixel Doom',     caption: 'Sometimes I draw random stuff.' }
        ]
      },
      'decor-notepad': {
        title: '📝 Milestones.txt \u2014 Notepad',
        icon: '📝', label: 'Notepad',
        width: 580, height: 420,
        notepad: true,
        content: '20 Milestones for the Future - Autobiography Project\nDecember 2010\n\n1. Get married\n2. Visit Barcelona \u2705\n3. Attend the UEFA Champions League final\n4. Have my own restaurant\n5. Go to study cuisine at Paris\n6. Graduate as an administrator in the Universidad del Pacifico \u2705\n7. Have my own car \u2705\n8. Move out of the house of my mum to live by myself \u2705\n9. Go to Las Vegas\n10. Learn to play the drums\n11. Meet Ronaldinho\n12. Create my own song \u2705\n13. Be an actionist of Football Club Barcelona\n14. Paint my own graffiti\n15. Write my own book\n16. Have my own bar\n17. Get a tattoo \u2705\n18. Watch my brother play his first professional football match \u274c (doesn\'t play anymore)\n19. Have kids\n20. Own a Ford Mustang with racing stripes\n\nUpdated March 2026'
      },
      'case-study-user-interviews': {
        title: '🔍 Uncovering perceived value via user interviews',
        icon: '🔍', label: 'User Interviews',
        width: 760, height: 520,
        caseStudy: true
      }
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

      // Center in viewport (taskbar is 30px at bottom)
      var posX = Math.round((window.innerWidth  - cfg.width)         / 2);
      var posY = Math.round((window.innerHeight - 30 - (cfg.height || 400)) / 2);
      posX = Math.max(0, posX);
      posY = Math.max(0, posY);

      // Pull content from <template> or build inline for photos / case studies
      var bodyHTML;
      if (cfg.photo) {
        bodyHTML = '<div class="photo-viewer-full"><img src="' + cfg.src + '" alt="' + cfg.label + '"></div>' +
                   '<div class="photo-caption">' + cfg.caption + '</div>';
      } else if (cfg.drawing) {
        var drawing = cfg.images[Math.floor(Math.random() * cfg.images.length)];
        bodyHTML = '<div class="photo-viewer-full"><img src="' + drawing.src + '" alt="' + drawing.name + '"></div>' +
                   '<div class="photo-caption">' + drawing.caption + '</div>';
      } else if (cfg.caseStudy) {
        bodyHTML =
          '<div class="cs-slide-panel"></div>' +
          '<div class="case-study-footer">' +
            '<button class="btn cs-prev-btn" disabled>&#9664; Prev</button>' +
            '<div class="cs-nav-center"><div class="cs-dots"></div><span class="cs-counter">1 / 7</span></div>' +
            '<button class="btn cs-next-btn">Next &#9654;</button>' +
          '</div>';
      } else if (cfg.notepad) {
        bodyHTML = '<textarea class="notepad-area" spellcheck="false">' + cfg.content + '</textarea>';
      } else if (cfg.calculator) {
        bodyHTML =
          '<div class="calc-buttons">' +
            '<div class="calc-display calc-span5"><input class="calc-screen" type="text" readonly value="0"></div>' +
            '<button class="calc-btn calc-btn-action calc-span3" data-action="backspace">Backspace</button>' +
            '<button class="calc-btn calc-btn-action" data-action="ce">CE</button>' +
            '<button class="calc-btn calc-btn-action" data-action="c">C</button>' +
            '<button class="calc-btn calc-btn-num" data-val="7">7</button>' +
            '<button class="calc-btn calc-btn-num" data-val="8">8</button>' +
            '<button class="calc-btn calc-btn-num" data-val="9">9</button>' +
            '<button class="calc-btn calc-btn-op" data-op="/">&divide;</button>' +
            '<button class="calc-btn calc-btn-fn" data-action="sqrt">sqrt</button>' +
            '<button class="calc-btn calc-btn-num" data-val="4">4</button>' +
            '<button class="calc-btn calc-btn-num" data-val="5">5</button>' +
            '<button class="calc-btn calc-btn-num" data-val="6">6</button>' +
            '<button class="calc-btn calc-btn-op" data-op="*">&times;</button>' +
            '<button class="calc-btn calc-btn-fn" data-action="percent">%</button>' +
            '<button class="calc-btn calc-btn-num" data-val="1">1</button>' +
            '<button class="calc-btn calc-btn-num" data-val="2">2</button>' +
            '<button class="calc-btn calc-btn-num" data-val="3">3</button>' +
            '<button class="calc-btn calc-btn-op" data-op="-">&minus;</button>' +
            '<button class="calc-btn calc-btn-fn" data-action="reciprocal">1/x</button>' +
            '<button class="calc-btn calc-btn-num" data-val="0">0</button>' +
            '<button class="calc-btn calc-btn-fn" data-action="negate">+/-</button>' +
            '<button class="calc-btn calc-btn-num" data-val=".">.</button>' +
            '<button class="calc-btn calc-btn-op" data-op="+">+</button>' +
            '<button class="calc-btn calc-btn-eq" data-action="eq">=</button>' +
          '</div>';
      } else {
        var tpl = document.getElementById('tpl-' + id);
        bodyHTML = tpl ? tpl.innerHTML : '<p>Content not found.</p>';
      }

      // Build window DOM
      var win = document.createElement('div');
      win.className = cfg.photo || cfg.drawing ? 'win95-window spa-window photo-window' :
                      cfg.caseStudy            ? 'win95-window spa-window case-study-spa-window' :
                      cfg.notepad              ? 'win95-window spa-window notepad-window' :
                      cfg.calculator           ? 'win95-window spa-window calculator-window' :
                                                 'win95-window spa-window';
      win.id        = 'win-' + id;
      win.style.left  = posX + 'px';
      win.style.top   = posY + 'px';
      if (cfg.width) win.style.width = cfg.width + 'px';
      if (cfg.height) win.style.height = cfg.height + 'px';

      var winTitle = cfg.drawing ? '🎨 ' + drawing.name + ' - Paint' : cfg.title;
      var titleBarHTML =
        '<div class="title-bar spa-title-bar">' +
          '<span class="title-bar-text">' + winTitle + '</span>' +
          '<div class="title-bar-controls">' +
            '<button class="title-bar-btn spa-btn-minimize" title="Minimize"><img src="references/window-icons/Minimize.png" alt="Minimize"></button>' +
            '<button class="title-bar-btn spa-btn-maximize" title="Maximize"><img src="references/window-icons/Maximize.png" alt="Maximize"></button>' +
            '<button class="title-bar-btn spa-btn-close"    title="Close"><img src="references/window-icons/Close.png" alt="Close"></button>' +
          '</div>' +
        '</div>';

      var menuBarHTML =
        '<div class="menu-bar">' +
          '<span class="menu-bar-item">Edit</span>' +
          '<span class="menu-bar-item">View</span>' +
          '<span class="menu-bar-item">Help</span>' +
        '</div>';

      if (cfg.photo || cfg.drawing) {
        win.innerHTML = titleBarHTML + menuBarHTML + '<div class="window-body">' + bodyHTML + '</div>';
      } else if (cfg.calculator) {
        win.innerHTML = titleBarHTML + menuBarHTML + '<div class="window-body">' + bodyHTML + '</div>';
      } else if (cfg.notepad) {
        win.innerHTML = titleBarHTML + menuBarHTML + '<div class="window-body">' + bodyHTML + '</div>';
      } else {
        win.innerHTML = titleBarHTML + menuBarHTML +
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
      if (id === 'about') {
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

      if (id === 'projects') {
        var csBtn = win.querySelector('[data-case-study="user-interviews"]');
        if (csBtn) {
          csBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openCaseStudy();
          });
        }
      }

      if (id === 'case-study-user-interviews') {
        var slidePanel = win.querySelector('.cs-slide-panel');
        var dotsEl     = win.querySelector('.cs-dots');
        var counterEl  = win.querySelector('.cs-counter');
        var prevBtn    = win.querySelector('.cs-prev-btn');
        var nextBtn    = win.querySelector('.cs-next-btn');
        var current    = 0;

        function renderSlide(i) {
          current = i;
          slidePanel.innerHTML = csSlides[i];
          counterEl.textContent = (i + 1) + ' / ' + csSlides.length;
          prevBtn.disabled = (i === 0);
          nextBtn.disabled = (i === csSlides.length - 1);
          dotsEl.querySelectorAll('.cs-dot').forEach(function (dot, idx) {
            dot.classList.toggle('active', idx === i);
          });
        }

        csSlides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.className = 'cs-dot';
          dot.title = 'Slide ' + (i + 1);
          dot.addEventListener('click', function () { renderSlide(i); });
          dotsEl.appendChild(dot);
        });

        prevBtn.addEventListener('click', function () { if (current > 0) renderSlide(current - 1); });
        nextBtn.addEventListener('click', function () { if (current < csSlides.length - 1) renderSlide(current + 1); });

        document.addEventListener('keydown', function (e) {
          if (!windows['case-study-user-interviews'] || windows['case-study-user-interviews'].minimized) return;
          if (e.key === 'ArrowLeft'  && current > 0)                   renderSlide(current - 1);
          if (e.key === 'ArrowRight' && current < csSlides.length - 1) renderSlide(current + 1);
        });

        renderSlide(0);
      }

      if (id === 'decor-calculator') {
        var screen          = win.querySelector('.calc-screen');
        var currentVal      = '0';
        var prevVal         = null;
        var operator        = null;
        var waitingForNext  = false;

        function updateDisplay(v) { screen.value = v; }

        function calculate(a, b, op) {
          var result;
          if (op === '+') result = a + b;
          if (op === '-') result = a - b;
          if (op === '*') result = a * b;
          if (op === '/') result = b !== 0 ? a / b : 'Error';
          if (typeof result === 'number') {
            result = parseFloat(result.toPrecision(12));
          }
          return String(result);
        }

        win.querySelectorAll('.calc-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var val    = btn.dataset.val;
            var op     = btn.dataset.op;
            var action = btn.dataset.action;

            if (val !== undefined) {
              if (val === '.' && currentVal.includes('.') && !waitingForNext) return;
              if (waitingForNext) {
                currentVal = val === '.' ? '0.' : val;
                waitingForNext = false;
              } else {
                currentVal = currentVal === '0' && val !== '.' ? val : currentVal + val;
              }
              updateDisplay(currentVal);

            } else if (op) {
              if (operator && !waitingForNext) {
                currentVal = calculate(parseFloat(prevVal), parseFloat(currentVal), operator);
                if (currentVal === 'Error') { operator = null; prevVal = null; waitingForNext = false; updateDisplay('Error'); return; }
                updateDisplay(currentVal);
              }
              prevVal = currentVal;
              operator = op;
              waitingForNext = true;

            } else if (action === 'eq') {
              if (operator && !waitingForNext) {
                currentVal = calculate(parseFloat(prevVal), parseFloat(currentVal), operator);
                operator = null;
                prevVal  = null;
                waitingForNext = false;
                updateDisplay(currentVal);
              }

            } else if (action === 'sqrt') {
              var n = parseFloat(currentVal);
              currentVal = n < 0 ? 'Error' : String(parseFloat(Math.sqrt(n).toPrecision(12)));
              waitingForNext = false;
              updateDisplay(currentVal);

            } else if (action === 'percent') {
              var pct = prevVal !== null ? parseFloat(prevVal) * parseFloat(currentVal) / 100 : parseFloat(currentVal) / 100;
              currentVal = String(parseFloat(pct.toPrecision(12)));
              waitingForNext = false;
              updateDisplay(currentVal);

            } else if (action === 'reciprocal') {
              var rv = parseFloat(currentVal);
              currentVal = rv === 0 ? 'Error' : String(parseFloat((1 / rv).toPrecision(12)));
              waitingForNext = false;
              updateDisplay(currentVal);

            } else if (action === 'negate') {
              if (currentVal !== '0' && currentVal !== 'Error') {
                currentVal = currentVal.charAt(0) === '-' ? currentVal.slice(1) : '-' + currentVal;
                updateDisplay(currentVal);
              }

            } else if (action === 'c') {
              currentVal = '0'; prevVal = null; operator = null; waitingForNext = false;
              updateDisplay(currentVal);

            } else if (action === 'ce') {
              currentVal = '0';
              updateDisplay(currentVal);

            } else if (action === 'backspace') {
              if (!waitingForNext && currentVal !== 'Error') {
                currentVal = currentVal.length > 1 ? currentVal.slice(0, -1) : '0';
                updateDisplay(currentVal);
              }
            }
          });
        });
      }
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
      'decor-wmp':        { left: 16,  top: 280 },
      'decor-paint':      { left: 16,  top: 382 },
      'decor-msn':        { left: 16,  top: 470 },
      'decor-nfs':        { left: 16,  top: 558 },
      'decor-aoe':        { left: 16,  top: 646 },
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
        if (id === 'decor-recycle') {
          showMessageBox('Recycle Bin', 'There is no trash in this portfolio.');
        } else if (id) {
          openWindow(id);
        }
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
        var top = marginTop;
        ids.forEach(function (id) {
          savedIcons[id] = { left: 16 + col * colW, top: top };
          var el = document.querySelector('[data-window="' + id + '"]');
          top += (el ? el.offsetHeight : 72) + 20;
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

    /* ── Message Box ─────────────────────────────────────── */
    var msgBox      = document.getElementById('msg-box');
    var msgBoxTitle = document.getElementById('msg-box-title');
    var msgBoxText  = document.getElementById('msg-box-text');

    function showMessageBox(title, message) {
      msgBoxTitle.textContent = title;
      msgBoxText.textContent  = message;
      msgBox.classList.remove('hidden');
    }

    function hideMsgBox() { msgBox.classList.add('hidden'); }

    document.getElementById('msg-box-close').addEventListener('click', hideMsgBox);
    document.getElementById('msg-box-ok').addEventListener('click', hideMsgBox);
    document.addEventListener('keydown', function (e) {
      if (!msgBox.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Enter')) hideMsgBox();
    });

    /* ── Case Study Slideshow ────────────────────────────── */
    function openCaseStudy() { openWindow('case-study-user-interviews'); }

    var csSlides = [
      // Slide 1 — Intro (two-column layout)
      '<h2 class="slide-title">Building the research foundation to understand Torre\'s users</h2>' +
      '<div style="display:flex;gap:8px">' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0">' +
          '<div class="panel-sunken">' +
            '<h3>Summary</h3>' +
            '<p style="margin:0">Co-developed \'MOVERS\', Torre\'s first structured UX research guidelines, to fix inconsistent, hard-to-compare user interviews. Then used them in practice, gathering insights from 30 talent seekers that led to 31 new proposed experiments, 12 user personas, and 10 testimonials.</p>' +
          '</div>' +
          '<div class="panel-sunken">' +
            '<h3>Role, tools &amp; stakeholders</h3>' +
            '<p><strong>Role:</strong> UX Researcher</p>' +
            '<p><strong>Collaborators:</strong> Design team, Operations, Sales, Account Managers</p>' +
            '<p style="margin:0"><strong>Tools:</strong> Zoom, Notion, pen &amp; paper</p>' +
          '</div>' +
        '</div>' +
        '<div style="flex:1;min-width:0;min-height:140px;background:#d4d0c8;border:2px dashed #7f9db9;border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:Tahoma,Arial,sans-serif;font-size:11px;color:#888">' +
          'Image' +
        '</div>' +
      '</div>',

      // Slide 2 — Context & problem
      '<h2 class="slide-title">Building the research foundation to understand Torre\'s users</h2>' +
      '<div class="panel-sunken" style="padding:0;overflow:hidden">' +
        '<div style="padding:8px 10px"><h3>Context &amp; problem</h3><p style="margin:0">At Torre, user interviews were central to product decisions, but the process was broken in three ways.</p></div>' +
        '<div style="border-top:1px solid #b5b0a0;padding:8px 10px"><h3>Issue No.1</h3><p style="margin:0">No structure: insights were hard to compare across interviews or over time.</p></div>' +
        '<div style="border-top:1px solid #b5b0a0;padding:8px 10px"><h3>Issue No.2</h3><p style="margin:0">Poor knowledge transfer: onboarding new team members meant starting from scratch.</p></div>' +
        '<div style="border-top:1px solid #b5b0a0;padding:8px 10px"><h3>Issue No.3</h3><p style="margin:0">Misaligned questions: interviews were tailored by user type, but not by funnel stage, missing critical nuance.</p></div>' +
        '<div style="border-top:1px solid #b5b0a0;padding:8px 10px"><h3>The result</h3><p style="margin:0">Valuable insights were getting lost, and decision-making was suffering for it.</p></div>' +
      '</div>',

      // Slide 3 — Context & problem
      '<h2 class="slide-title">Context &amp; problem</h2>' +
      '<p>At Torre, user interviews were central to product decisions, but the process was broken in three ways:</p>' +
      '<ol style="margin:8px 0 0 18px">' +
      '<li style="margin-bottom:5px"><strong>No structure:</strong> insights were hard to compare across interviews or over time.</li>' +
      '<li style="margin-bottom:5px"><strong>Poor knowledge transfer:</strong> onboarding new team members meant starting from scratch.</li>' +
      '<li style="margin-bottom:5px"><strong>Misaligned questions:</strong> interviews were tailored by user type, but not by funnel stage — missing critical nuance.</li>' +
      '</ol>' +
      '<p style="margin-top:10px"><strong>Result:</strong> valuable insights were getting lost, and decision-making was suffering.</p>',

      // Slide 4 — Solution overview
      '<h2 class="slide-title">Solution overview</h2>' +
      '<p>Before running interviews, we needed to fix the process itself. I collaborated with the Design team to develop <strong>MOVERS</strong> (Monthly Values and Exploratory Research Sessions), Torre\'s first standardized UX research guidelines. Only then did we put them to the test, running structured interviews with talent seekers across multiple segments.</p>',

      // Slide 5 — Key steps & decisions
      '<h2 class="slide-title">Key steps &amp; decisions</h2>' +
      '<ol style="margin:0 0 0 18px">' +
      '<li style="margin-bottom:5px"><strong>Research &amp; align:</strong> Studied The Mom Test, Inspired, NNG articles.</li>' +
      '<li style="margin-bottom:5px"><strong>Build MOVERS:</strong> 4 phases — pre-interview setup, interview structure, value-finding experiments, post-interview docs.</li>' +
      '<li style="margin-bottom:5px"><strong>Segment, then interview:</strong> Users segmented by service type and funnel stage.</li>' +
      '<li style="margin-bottom:5px"><strong>Recruiting:</strong> No incentives to avoid bias — lots of cold outreach.</li>' +
      '<li style="margin-bottom:5px"><strong>Report by segment:</strong> Value perception, personas, testimonials, and product opportunities per segment.</li>' +
      '</ol>',

      // Slide 6 — Impact
      '<h2 class="slide-title">Impact</h2>' +
      '<div class="metric-cards">' +
      '<div class="metric-card"><span class="metric-value">31</span><span class="metric-label">experiments added to the product roadmap</span></div>' +
      '<div class="metric-card"><span class="metric-value">12</span><span class="metric-label">user personas created</span></div>' +
      '<div class="metric-card"><span class="metric-value">10</span><span class="metric-label">testimonials collected</span></div>' +
      '<div class="metric-card"><span class="metric-label"><strong>MOVERS</strong> became part of onboarding for AMs &amp; Customer Service</span></div>' +
      '</div>',

      // Slide 7 — Learnings
      '<h2 class="slide-title">Learnings</h2>' +
      '<ol style="margin:0 0 0 18px">' +
      '<li style="margin-bottom:5px">Fixing the process before running research paid off — findings were comparable and spread to other teams.</li>' +
      '<li style="margin-bottom:5px">Recruiting without incentives is harder than it sounds — build the pipeline early and lean on referrals.</li>' +
      '<li style="margin-bottom:5px">Focus on listening during interviews, notes can wait. Multi-tasking leads to missed insights.</li>' +
      '</ol>'
    ];


  });
})();
