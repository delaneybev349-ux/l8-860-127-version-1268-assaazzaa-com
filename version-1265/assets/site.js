(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.classList.toggle('open');
    });
  }

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function fillFilterOptions(cards, selector, getter) {
    var select = document.querySelector(selector);

    if (!select) {
      return;
    }

    var values = cards
      .map(getter)
      .filter(Boolean)
      .filter(function (value, position, array) {
        return array.indexOf(value) === position;
      })
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      });

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var keyword = document.querySelector('[data-filter-keyword]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var count = document.querySelector('[data-visible-count]');

    fillFilterOptions(cards, '[data-filter-region]', function (card) {
      return card.getAttribute('data-region');
    });
    fillFilterOptions(cards, '[data-filter-type]', function (card) {
      return card.getAttribute('data-type');
    });
    fillFilterOptions(cards, '[data-filter-year]', function (card) {
      return card.getAttribute('data-year');
    });

    function apply() {
      var query = keyword ? keyword.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          matched = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          matched = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function loadHlsVideo(video, source, statusElement) {
    if (!source) {
      if (statusElement) {
        statusElement.textContent = '未找到播放源。';
      }
      return Promise.reject(new Error('No video source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return video.play();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      video._hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);

      return new Promise(function (resolve, reject) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(resolve).catch(reject);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error(data.type || 'HLS fatal error'));
          }
        });
      });
    }

    video.src = source;
    return video.play();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.js-video-player'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var status = shell.querySelector('.player-status');
      var source = shell.getAttribute('data-video-url');

      if (!video || !button) {
        return;
      }

      button.addEventListener('click', function () {
        shell.classList.add('playing');
        if (status) {
          status.textContent = '正在初始化 HLS 播放器...';
        }

        loadHlsVideo(video, source, status)
          .then(function () {
            if (status) {
              status.textContent = '播放已开始。';
            }
          })
          .catch(function () {
            shell.classList.remove('playing');
            if (status) {
              status.textContent = '播放器加载失败，请检查网络或播放源。';
            }
          });
      });
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title), '">',
      '<a class="movie-card-link" href="', escapeHtml(movie.file), '">',
      '<div class="poster-wrap">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '封面" loading="lazy" onerror="this.parentElement.classList.add(\'is-missing\'); this.remove();">',
      '<span class="poster-fallback-text">热播日韩剧</span>',
      '<span class="type-badge">', escapeHtml(movie.type), '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>', escapeHtml(movie.title), '</h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="movie-meta-row"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.year), '</span></div>',
      '<div class="tag-row">', tags, '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-page-input]');
    var summary = document.querySelector('[data-search-summary]');

    if (!results || !input || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render() {
      var query = input.value.trim().toLowerCase();

      if (!query) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '请输入关键词开始搜索。';
        }
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      if (summary) {
        summary.textContent = matched.length ? '已显示前 ' + matched.length + ' 条搜索结果。' : '没有找到匹配的影片，请更换关键词。';
      }
    }

    input.addEventListener('input', render);
    render();
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
