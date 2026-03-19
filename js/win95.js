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
        calculator: true,
        noMaximize: true
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
        title: '🔍 Building the foundation to understand Torre\'s users',
        icon: '🔍', label: 'User Interviews',
        width: 760, height: 520,
        caseStudy: true
      },
      'decor-wmp': {
        title: '▶️ Windows Media Player',
        icon: '▶️', label: 'Media Player',
        width: 600, height: 480,
        mediaPlayer: true
      },
      'case-study-onboarding': {
        title: '🚀 New onboarding to increase retention',
        icon: '🚀', label: 'Onboarding',
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
            '<div class="cs-nav-center"><div class="cs-dots"></div><span class="cs-counter">1 / 5</span></div>' +
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
      } else if (cfg.mediaPlayer) {
        bodyHTML =
          '<div class="wmp-body">' +
            '<div class="wmp-left">' +
              '<div class="wmp-canvas-wrap"><canvas class="wmp-canvas"></canvas></div>' +
              '<div class="wmp-now-playing">' +
                '<div class="wmp-now-title">Ready</div>' +
                '<div class="wmp-now-artist"></div>' +
              '</div>' +
            '</div>' +
            '<div class="wmp-playlist-panel">' +
              '<div class="wmp-playlist"></div>' +
            '</div>' +
          '</div>' +
          '<div class="wmp-controls">' +
            '<div class="wmp-btns">' +
              '<button class="wmp-btn wmp-btn-prev" title="Previous"><span class="material-icons">skip_previous</span></button>' +
              '<button class="wmp-btn wmp-btn-play" title="Play / Pause"><span class="material-icons wmp-play-icon">play_arrow</span></button>' +
              '<button class="wmp-btn wmp-btn-next" title="Next"><span class="material-icons">skip_next</span></button>' +
              '<button class="wmp-btn wmp-btn-vol" title="Unmute"><span class="material-icons">volume_off</span><span class="wmp-vol-label">Sound Off</span></button>' +
            '</div>' +
            '<div class="wmp-right">' +
              '<select class="wmp-viz-select">' +
                '<option value="bars">Equalizer bars</option>' +
                '<option value="blobs">Bouncing blobs</option>' +
                '<option value="wave">Waveform line</option>' +
              '</select>' +
            '</div>' +
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
                      cfg.mediaPlayer          ? 'win95-window spa-window media-player-window' :
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
      } else if (cfg.notepad || cfg.mediaPlayer) {
        win.innerHTML = titleBarHTML + menuBarHTML + '<div class="window-body">' + bodyHTML + '</div>';
      } else {
        win.innerHTML = titleBarHTML + menuBarHTML +
          '<div class="window-body">' + bodyHTML + '</div>' +
          '<div class="status-bar"><span class="status-bar-field">Last updated 19/03/2026</span></div>';
      }

      container.appendChild(win);
      windows[id] = { el: win, minimized: false, maximized: false, prevState: null };


      addTaskbarBtn(id, cfg);
      setupWindowEvents(id);
      if (cfg.noMaximize) {
        var maxBtn = win.querySelector('.spa-btn-maximize');
        if (maxBtn) maxBtn.disabled = true;
      }
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
        if (configs[id] && configs[id].noMaximize) return;
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

        var onboardingBtn = win.querySelector('[data-case-study="onboarding"]');
        if (onboardingBtn) {
          onboardingBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openWindow('case-study-onboarding');
          });
        }

        var shareBtn = win.querySelector('#share-portfolio-btn');
        if (shareBtn) {
          shareBtn.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href).then(function () {
              var orig = shareBtn.textContent;
              shareBtn.textContent = 'URL copied to clipboard';
              setTimeout(function () { shareBtn.textContent = orig; }, 3000);
            });
          });
        }
      }

      if (id === 'case-study-onboarding') {
        var slidePanel = win.querySelector('.cs-slide-panel');
        var dotsEl     = win.querySelector('.cs-dots');
        var counterEl  = win.querySelector('.cs-counter');
        var prevBtn    = win.querySelector('.cs-prev-btn');
        var nextBtn    = win.querySelector('.cs-next-btn');
        var current    = 0;

        function renderSlide(i) {
          current = i;
          slidePanel.innerHTML = onboardingSlides[i];
          counterEl.textContent = (i + 1) + ' / ' + onboardingSlides.length;
          prevBtn.disabled = (i === 0);
          nextBtn.disabled = (i === onboardingSlides.length - 1);
          dotsEl.querySelectorAll('.cs-dot').forEach(function (dot, idx) {
            dot.classList.toggle('active', idx === i);
          });
        }

        onboardingSlides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.className = 'cs-dot';
          dot.title = 'Slide ' + (i + 1);
          dot.addEventListener('click', function () { renderSlide(i); });
          dotsEl.appendChild(dot);
        });

        prevBtn.addEventListener('click', function () { if (current > 0) renderSlide(current - 1); });
        nextBtn.addEventListener('click', function () { if (current < onboardingSlides.length - 1) renderSlide(current + 1); });

        document.addEventListener('keydown', function (e) {
          if (!windows['case-study-onboarding'] || windows['case-study-onboarding'].minimized) return;
          if (e.key === 'ArrowLeft'  && current > 0)                        renderSlide(current - 1);
          if (e.key === 'ArrowRight' && current < onboardingSlides.length - 1) renderSlide(current + 1);
        });

        renderSlide(0);
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

      if (id === 'decor-wmp') {
        var canvas      = win.querySelector('.wmp-canvas');
        var playBtn     = win.querySelector('.wmp-btn-play');
        var prevBtn     = win.querySelector('.wmp-btn-prev');
        var nextBtn     = win.querySelector('.wmp-btn-next');
        var volBtn      = win.querySelector('.wmp-btn-vol');
        var nowTitle    = win.querySelector('.wmp-now-title');
        var nowArtist   = win.querySelector('.wmp-now-artist');
        var vizSel      = win.querySelector('.wmp-viz-select');
        var ctx         = canvas.getContext('2d');
        var playing     = false;
        var raf         = null;
        var vizMode     = 'bars';
        var t           = 0;
        var playIcon;

        var volMuted = true;
        var playlistEl = win.querySelector('.wmp-playlist');
        var audio = new Audio();
        audio.preload = 'none';
        audio.muted = true;
        var currentTrack = 0;

        var playlist = [
          'Chiddy Bang - Opposite of Adults.mp3.mp3',
          'Fall Out Boy - Sugar, Were Goin Down [Album Version].mp3',
          'Flashing Lights - Kanye West.mp3',
          'Forever - Drake, Lil Wayne, Kanye West, Eminem.mp3',
          'LMFAO - Yes.mp3.mp3',
          "Lil' Wayne - A Milli.mp3",
          'Mac Miller - Kool Aid and Frozen Pizza.mp3',
          'Not Now - blink-182.mp3',
          'Numb : Encore (Official Audio) - Linkin Park & JAY-Z.mp3',
          'Panic At The Disco - I Write Sins Not Tragedies (Remastered).mp3',
          'R. Kelly Ft. Wisin  Yandel - Burn It Up (HQ Audio).mp3',
          'Snoop Dogg Ft. Pharrell - Drop It Like Its Hot (Radio Edit).mp3',
          'Verme - Baby Ranks ft. Notch.mp3',
          'Zion - Zundada [The Perfect Melody].mp3'
        ];

        function trackName(f) {
          return f.replace(/\.mp3$/i, '').replace(/\.mp3$/i, '');
        }

        function loadTrack(i) {
          currentTrack = i;
          var name = trackName(playlist[i]);
          nowTitle.textContent  = name;
          nowArtist.textContent = '';
          var items = playlistEl.querySelectorAll('.wmp-playlist-item');
          items.forEach(function (el, idx) { el.classList.toggle('active', idx === i); });
          if (items[i]) items[i].scrollIntoView({ block: 'nearest' });
        }

        function startPlay() {
          if (!playIcon) playIcon = win.querySelector('.wmp-play-icon');
          audio.src = 'musica-porta/' + encodeURIComponent(playlist[currentTrack]);
          if (volMuted) {
            volMuted = false;
            audio.muted = false;
            volBtn.querySelector('.material-icons').textContent = 'volume_up';
            volBtn.querySelector('.wmp-vol-label').textContent  = 'Sound On';
            volBtn.title = 'Mute';
          }
          var p = audio.play();
          if (p && p.catch) p.catch(function () { pausePlay(); });
          playing = true;
          playIcon.textContent = 'pause';
          playBtn.title = 'Pause';
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          syncCanvas(); tick();
        }

        function pausePlay() {
          if (!playIcon) playIcon = win.querySelector('.wmp-play-icon');
          audio.pause();
          playing = false;
          playIcon.textContent = 'play_arrow';
          playBtn.title = 'Play';
          if (raf) { cancelAnimationFrame(raf); raf = null; }
        }

        audio.addEventListener('ended', function () {
          if (currentTrack < playlist.length - 1) {
            loadTrack(currentTrack + 1);
            startPlay();
          } else {
            pausePlay();
          }
        });

        // --- Bar state ---
        var BAR_N   = 40;
        var heights = new Float32Array(BAR_N);
        var targets = new Float32Array(BAR_N);

        // --- Blob state ---
        function makeBlobs(w, h) {
          return Array.from({ length: 7 }, function (_, i) {
            return {
              x: Math.random() * w, y: Math.random() * h,
              vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
              r: 25 + Math.random() * 35,
              hue: (i / 7) * 360,
              phase: Math.random() * Math.PI * 2
            };
          });
        }
        var blobs = [];

        function syncCanvas() {
          var wrap = win.querySelector('.wmp-canvas-wrap');
          canvas.width  = wrap.offsetWidth  || 480;
          canvas.height = wrap.offsetHeight || 240;
          blobs = makeBlobs(canvas.width, canvas.height);
        }
        syncCanvas();

        function clearCanvas() {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        clearCanvas();

        function drawBars() {
          var w = canvas.width, h = canvas.height;
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
          var barW = w / BAR_N;
          for (var i = 0; i < BAR_N; i++) {
            if (Math.random() < 0.041) targets[i] = (0.15 + Math.random() * 0.85) * h;
            heights[i] += (targets[i] - heights[i]) * 0.092;
            targets[i] *= 0.96;
            var bh = Math.max(2, heights[i]);
            var grad = ctx.createLinearGradient(0, h, 0, h - bh);
            grad.addColorStop(0,   '#00dd44');
            grad.addColorStop(0.6, '#00aaff');
            grad.addColorStop(1,   '#cc44ff');
            ctx.fillStyle = grad;
            ctx.fillRect(i * barW + 1, h - bh, barW - 2, bh);
          }
        }

        function drawBlobs() {
          var w = canvas.width, h = canvas.height;
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(0, 0, w, h);
          blobs.forEach(function (b) {
            b.x += b.vx; b.y += b.vy;
            if (b.x < 0 || b.x > w) b.vx *= -1;
            if (b.y < 0 || b.y > h) b.vy *= -1;
            var r = b.r * (0.8 + 0.2 * Math.sin(t * 0.04 + b.phase));
            var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
            grad.addColorStop(0,   'hsla(' + b.hue + ',100%,70%,0.9)');
            grad.addColorStop(0.5, 'hsla(' + b.hue + ',100%,50%,0.4)');
            grad.addColorStop(1,   'hsla(' + b.hue + ',100%,30%,0)');
            ctx.beginPath();
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            b.hue = (b.hue + 0.3) % 360;
          });
        }

        function drawWave() {
          var w = canvas.width, h = canvas.height;
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
          // filled area under the wave
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (var x = 0; x <= w; x++) {
            var y = h / 2
              + Math.sin(x * 0.025 + t * 0.026)  * h * 0.22
              + Math.sin(x * 0.06  - t * 0.016)  * h * 0.08
              + Math.sin(x * 0.012 + t * 0.010)  * h * 0.12;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          var fillGrad = ctx.createLinearGradient(0, h / 2 - h * 0.3, 0, h);
          fillGrad.addColorStop(0, 'rgba(0,180,255,0.3)');
          fillGrad.addColorStop(1, 'rgba(0,60,160,0.04)');
          ctx.fillStyle = fillGrad;
          ctx.fill();
          // glowing line on top
          ctx.beginPath();
          ctx.strokeStyle = '#00eeff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00eeff';
          ctx.shadowBlur = 10;
          for (var x = 0; x <= w; x++) {
            var y = h / 2
              + Math.sin(x * 0.025 + t * 0.026)  * h * 0.22
              + Math.sin(x * 0.06  - t * 0.016)  * h * 0.08
              + Math.sin(x * 0.012 + t * 0.010)  * h * 0.12;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        function tick() {
          if (!playing) return;
          t++;
          if      (vizMode === 'bars')  drawBars();
          else if (vizMode === 'blobs') drawBlobs();
          else if (vizMode === 'wave')  drawWave();
          raf = requestAnimationFrame(tick);
        }

        playBtn.addEventListener('click', function () {
          if (playing) pausePlay(); else startPlay();
        });

        prevBtn.addEventListener('click', function () {
          loadTrack(currentTrack > 0 ? currentTrack - 1 : playlist.length - 1);
          if (playing) startPlay();
        });

        nextBtn.addEventListener('click', function () {
          loadTrack(currentTrack < playlist.length - 1 ? currentTrack + 1 : 0);
          if (playing) startPlay();
        });

        volBtn.addEventListener('click', function () {
          volMuted = !volMuted;
          audio.muted = volMuted;
          volBtn.querySelector('.material-icons').textContent = volMuted ? 'volume_off' : 'volume_up';
          volBtn.querySelector('.wmp-vol-label').textContent  = volMuted ? 'Sound Off' : 'Sound On';
          volBtn.title = volMuted ? 'Unmute' : 'Mute';
        });

        vizSel.addEventListener('change', function () {
          vizMode = vizSel.value;
          if (vizMode === 'blobs') blobs = makeBlobs(canvas.width, canvas.height);
          if (!playing) clearCanvas();
        });

        // Build playlist UI
        playlist.forEach(function (f, i) {
          var item = document.createElement('div');
          item.className = 'wmp-playlist-item';
          item.textContent = (i + 1) + '.  ' + trackName(f);
          item.addEventListener('click', function () {
            loadTrack(i);
            startPlay();
          });
          playlistEl.appendChild(item);
        });

        // Stop audio and animation when window is closed
        win.querySelector('.spa-btn-close').addEventListener('click', function () {
          audio.pause();
          audio.src = '';
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          playing = false;
        }, true);

        // Load first track but don't auto-play
        loadTrack(0);
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

    var imgPlaceholder = '<div style="overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);background:#d4d0c8;display:flex;align-items:center;justify-content:center;color:#808080;font-style:italic;min-height:120px">Image placeholder</div>';

    var onboardingSlides = [
      // Slide 1 — Intro
      '<h2 class="slide-title">Executive Summary</h2>' +
      '<div style="display:flex;gap:8px;align-items:stretch">' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0">' +
          '<div class="panel-sunken">' +
            '<h3>Summary</h3>' +
            '<p style="margin:0">Talent seekers were dropping off early because Torre\'s platform was complex and overwhelming. Designed a self-guided product tour covering Torre\'s three core flows, resulting in a 7% retention increase and 14% improvement in positive user feedback.</p>' +
          '</div>' +
          '<div class="panel-sunken">' +
            '<h3>Role, tools &amp; stakeholders</h3>' +
            '<p><strong>Role:</strong> Product Designer</p>' +
            '<p><strong>Collaborators:</strong> Product Manager, Engineering, Operations, Data Analytics</p>' +
            '<p style="margin:0"><strong>Tools:</strong> Figma, Maze, Metabase</p>' +
          '</div>' +
        '</div>' +
        '<div style="flex:1;min-width:0;overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);background:#d4d0c8;display:flex;align-items:center;justify-content:center;color:#808080;font-style:italic">Image placeholder</div>' +
      '</div>',

      // Slide 2 — Context & Problem
      '<h2 class="slide-title">Context &amp; Problem</h2>' +
      '<div class="panel-sunken">' +
        '<p>At a weekly metrics review, two red flags came up regarding talent seeker engagement:</p>' +
        '<ol style="margin:0 0 8px 18px">' +
          '<li style="margin-bottom:4px"><strong>Activation time was too long:</strong> talent seekers weren\'t interacting with their job postings after publishing them.</li>' +
          '<li><strong>Drop-off rate was too high:</strong> most talent seekers never posted a second job.</li>' +
        '</ol>' +
        '<p style="margin:0">Research confirmed the root cause: talent seekers found the platform complex, overwhelming, and struggled to see how its features could make their recruiting process more efficient.</p>' +
      '</div>' +
      '<div style="margin-top:8px">' + imgPlaceholder + '</div>',

      // Slide 3 — Solution Overview
      '<h2 class="slide-title">Solution Overview</h2>' +
      '<div class="panel-sunken">' +
        '<p>We needed something scalable and automated — no manual walkthroughs, no extra load on Operations. After reviewing how other complex platforms onboarded users, we aligned on a <strong>self-guided product tour</strong> covering the three most important flows:</p>' +
        '<ol style="margin:0 0 0 18px">' +
          '<li style="margin-bottom:4px">Posting a job</li>' +
          '<li style="margin-bottom:4px">Reviewing a pipeline of candidates</li>' +
          '<li>Reviewing a candidate profile</li>' +
        '</ol>' +
      '</div>' +
      '<div style="margin-top:8px">' + imgPlaceholder + '</div>',

      // Slide 4 — Key Steps & Decisions
      '<h2 class="slide-title">Key Steps &amp; Decisions</h2>' +
      '<div class="panel-sunken">' +
        '<ol style="margin:0 0 0 18px;line-height:1.5">' +
          '<li style="margin-bottom:6px"><strong>Research:</strong> Gathered insights from talent seekers across funnel stages — most didn\'t understand how Torre\'s features could help them recruit. It was not a feature problem, it was a communication problem.</li>' +
          '<li style="margin-bottom:6px"><strong>Choosing the format:</strong> Considered a knowledge base and a task completion list, but landed on a self-guided tour — progressive, faster to implement, trackable by step, and harder to ignore.</li>' +
          '<li style="margin-bottom:6px"><strong>Third-party vs. in-house (and a U-turn):</strong> Planned to use Chameleon, but branding constraints and a surprise POC from an engineer led us to build in-house — faster, fully aligned with the design system, and cost-free. The pivot cost three days.<br><em>Learning: keep the whole squad in the loop. Good ideas can come from anywhere.</em></li>' +
          '<li><strong>Skipping usability testing intentionally:</strong> Given the tight deadline and well-established UX patterns, a usability test wasn\'t necessary. Instead, ran a thorough QA process in a feature-flag environment to validate transitions, hotspot positioning, and tour behavior.</li>' +
        '</ol>' +
      '</div>',

      // Slide 5 — Impact & Learnings
      '<h2 class="slide-title">Impact &amp; Learnings</h2>' +
      '<div class="metric-cards">' +
        '<div class="metric-card"><span class="metric-value">+7%</span><span class="metric-label">talent seeker retention (users returning to post a second job)</span></div>' +
        '<div class="metric-card"><span class="metric-value">+14%</span><span class="metric-label">positive experience feedback (NPS surveys)</span></div>' +
        '<div class="metric-card"><span class="metric-value">37%</span><span class="metric-label">product tour completion rate — main area for improvement</span></div>' +
        '<div class="metric-card"><span class="metric-label">Activation time remained too variable to attribute to this effort directly</span></div>' +
      '</div>' +
      '<div class="panel-sunken" style="margin-top:8px">' +
        '<h3>Learnings</h3>' +
        '<ol style="margin:0 0 0 18px">' +
          '<li style="margin-bottom:5px">Keep all engineers in the squad engaged because good ideas can come from anywhere, and surprises mid-project are avoidable.</li>' +
          '<li style="margin-bottom:5px">Sometimes \'genius design\' is a valid call under constraints, but it\'s the exception, not the rule.</li>' +
          '<li>When a metric stays inconclusive, raise a flag. This builds credibility towards the experiment, rather than undermining it.</li>' +
        '</ol>' +
      '</div>' +
      '<div class="panel-sunken" style="margin-top:8px">' +
        '<h3>Update</h3>' +
        '<p style="margin:0">⚠️ New version release estimated in Q3-2025 to improve completion rate and highlight new platform features.</p>' +
      '</div>'
    ];

    var csSlides = [
      // Slide 1 — Intro (two-column layout)
      '<h2 class="slide-title">Executive Summary</h2>' +
      '<div style="display:flex;gap:8px;align-items:stretch">' +
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
        '<div style="flex:1;min-width:0;overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)">' +
          '<img src="references/project1/Pic 1 - Case 1.png" style="width:100%;height:100%;object-fit:cover;display:block">' +
        '</div>' +
      '</div>',

      // Slide 2 — Context & problem
      '<h2 class="slide-title">Context &amp; Problem</h2>' +
      '<div class="panel-sunken">' +
        '<p>At Torre, user interviews were central to product decisions, but <strong>the research process was broken</strong> in three ways:</p>' +
        '<ol style="margin:0 0 8px 18px">' +
          '<li style="margin-bottom:4px"><strong>No structure:</strong> insights were hard to compare across interviews or over time.</li>' +
          '<li style="margin-bottom:4px"><strong>Poor knowledge transfer:</strong> onboarding new team members meant starting from scratch.</li>' +
          '<li><strong>Misaligned questions:</strong> interviews were tailored by user type, but not by funnel stage — missing critical nuance.</li>' +
        '</ol>' +
        '<p style="margin:0">As a result, valuable insights were getting lost, and product decision-making was suffering.</p>' +
      '</div>' +
      '<div style="margin-top:8px;min-height:120px;overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)">' +
        '<img src="references/project1/Pic 3 - Case 1.png" style="width:100%;height:100%;object-fit:cover;display:block">' +
      '</div>',

      // Slide 3 — Solution overview
      '<h2 class="slide-title">Solution Overview</h2>' +
      '<div class="panel-sunken">' +
        '<p style="margin:0">Before running interviews, we needed to fix the process itself. I collaborated with the Design team to develop <strong>MOVERS</strong> (Monthly Values and Exploratory Research Sessions), Torre\'s first standardized UX research guidelines. Only then did we put them to the test, running structured interviews with talent seekers across multiple segments.</p>' +
      '</div>' +
      '<div style="margin-top:8px;min-height:120px;overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)">' +
        '<img src="references/project1/Pic 2 - Case 1.png" style="width:100%;height:100%;object-fit:cover;display:block">' +
      '</div>',

      // Slide 4 — Key steps & decisions
      '<h2 class="slide-title">Key steps &amp; decisions</h2>' +
      '<div class="panel-sunken">' +
        '<ol style="margin:0 0 0 18px">' +
          '<li style="margin-bottom:5px"><strong>Research &amp; align:</strong> Studied The Mom Test, Inspired, NNG articles.</li>' +
          '<li style="margin-bottom:5px"><strong>Build MOVERS:</strong> 4 phases — pre-interview setup, interview structure, value-finding experiments, post-interview docs.</li>' +
          '<li style="margin-bottom:5px"><strong>Segment, then interview:</strong> Users segmented by service type and funnel stage.</li>' +
          '<li style="margin-bottom:5px"><strong>Recruiting:</strong> No incentives to avoid bias — lots of cold outreach.</li>' +
          '<li style="margin-bottom:5px"><strong>Report by segment:</strong> Value perception, personas, testimonials, and product opportunities per segment.</li>' +
        '</ol>' +
      '</div>' +
      '<div style="margin-top:8px;min-height:120px;overflow:hidden;border-radius:2px;border:1px solid #7f9db9;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)">' +
        '<img src="references/project1/Pic 4 - Case 1.png" style="width:100%;height:100%;object-fit:cover;display:block">' +
      '</div>',

      // Slide 5 — Impact & Learnings
      '<h2 class="slide-title">Impact &amp; Learnings</h2>' +
      '<div class="metric-cards">' +
      '<div class="metric-card"><span class="metric-value">31</span><span class="metric-label">experiments added to the product roadmap</span></div>' +
      '<div class="metric-card"><span class="metric-value">12</span><span class="metric-label">user personas created</span></div>' +
      '<div class="metric-card"><span class="metric-value">10</span><span class="metric-label">testimonials collected</span></div>' +
      '<div class="metric-card"><span class="metric-label"><strong>MOVERS</strong> became part of onboarding for AMs &amp; Customer Service</span></div>' +
      '</div>' +
      '<div class="panel-sunken" style="margin-top:8px">' +
        '<h3>Learnings</h3>' +
        '<ol style="margin:0 0 0 18px">' +
          '<li style="margin-bottom:5px">Fixing the process before running research paid off — findings were comparable and spread to other teams.</li>' +
          '<li style="margin-bottom:5px">Recruiting without incentives is harder than it sounds — build the pipeline early and lean on referrals.</li>' +
          '<li style="margin-bottom:5px">Focus on listening during interviews, notes can wait. Multi-tasking leads to missed insights.</li>' +
        '</ol>' +
      '</div>'
    ];


  });
})();
