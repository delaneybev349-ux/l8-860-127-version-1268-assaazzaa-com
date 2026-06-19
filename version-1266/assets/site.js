(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mainNav.classList.contains('is-open'));
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    const scope = panel.parentElement || document;
    const grid = scope.querySelector('[data-movie-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];
    const searchInput = panel.querySelector('[data-search-input]');
    const typeFilter = panel.querySelector('[data-type-filter]');
    const yearFilter = panel.querySelector('[data-year-filter]');
    let emptyBox = null;

    function ensureEmptyBox() {
      if (!grid) {
        return null;
      }
      if (!emptyBox) {
        emptyBox = document.createElement('div');
        emptyBox.className = 'no-results';
        emptyBox.textContent = '没有匹配影片';
        emptyBox.hidden = true;
        grid.appendChild(emptyBox);
      }
      return emptyBox;
    }

    function applyFilters() {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const typeValue = typeFilter ? typeFilter.value : '';
      const yearValue = yearFilter ? yearFilter.value : '';
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const typeMatch = !typeValue || card.dataset.type === typeValue;
        const yearMatch = !yearValue || card.dataset.year === yearValue;
        const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        const show = typeMatch && yearMatch && keywordMatch;
        card.hidden = !show;
        if (show) {
          visibleCount += 1;
        }
      });

      const box = ensureEmptyBox();
      if (box) {
        box.hidden = visibleCount !== 0;
      }
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  window.startMoviePlayer = function (videoId, buttonId, coverId, streamUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const cover = document.getElementById(coverId);
    let attached = false;
    let hls = null;

    if (!video || !button || !cover || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function beginPlay() {
      attachStream();
      cover.classList.add('is-hidden');
      video.controls = true;
      const playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    button.addEventListener('click', beginPlay);
    cover.addEventListener('click', beginPlay);
    cover.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        beginPlay();
      }
    });
    video.addEventListener('click', function () {
      if (!attached) {
        beginPlay();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
