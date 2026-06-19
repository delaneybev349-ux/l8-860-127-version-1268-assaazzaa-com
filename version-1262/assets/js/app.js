(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const topSearch = document.querySelector('.top-search');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      if (topSearch) {
        topSearch.classList.toggle('is-open');
      }
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  const localInput = document.querySelector('[data-local-search]');
  const localType = document.querySelector('[data-local-type]');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const empty = document.querySelector('.empty-state');

  const normalize = function (value) {
    return (value || '').toString().toLowerCase().trim();
  };

  const runFilter = function () {
    if (!cards.length || (!localInput && !localType)) {
      return;
    }
    const query = normalize(localInput ? localInput.value : '');
    const type = normalize(localType ? localType.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      const queryMatch = !query || haystack.indexOf(query) !== -1;
      const typeMatch = !type || haystack.indexOf(type) !== -1;
      const match = queryMatch && typeMatch;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });

    document.body.classList.toggle('has-empty-result', visible === 0);
    if (empty) {
      empty.style.display = visible === 0 ? 'block' : 'none';
    }
  };

  if (localInput) {
    localInput.addEventListener('input', runFilter);
  }

  if (localType) {
    localType.addEventListener('change', runFilter);
  }

  const queryParams = new URLSearchParams(window.location.search);
  const initialQuery = queryParams.get('q');
  if (initialQuery && localInput) {
    localInput.value = initialQuery;
    runFilter();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play]');
    const stream = player.getAttribute('data-stream');
    let attached = false;
    let hlsInstance = null;

    const attach = function () {
      if (!video || !stream || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    };

    const start = function () {
      attach();
      player.classList.add('is-playing');
      if (video) {
        video.play().catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
