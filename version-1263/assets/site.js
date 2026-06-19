(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        const search = filterPanel.querySelector('[data-filter-search]');
        const region = filterPanel.querySelector('[data-filter-region]');
        const year = filterPanel.querySelector('[data-filter-year]');
        const cards = Array.from(document.querySelectorAll('.js-filter-card'));

        const applyFilters = function () {
            const q = search ? search.value.trim().toLowerCase() : '';
            const r = region ? region.value.trim() : '';
            const y = year ? year.value.trim() : '';

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const cardRegion = card.getAttribute('data-region') || '';
                const cardYear = card.getAttribute('data-year') || '';
                const matchSearch = !q || text.indexOf(q) !== -1;
                const matchRegion = !r || cardRegion.indexOf(r) !== -1;
                const matchYear = !y || cardYear === y;
                card.classList.toggle('is-filter-hidden', !(matchSearch && matchRegion && matchYear));
            });
        };

        [search, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }
}());

function initializeMoviePlayer(source) {
    const video = document.getElementById('movieVideo');
    const button = document.getElementById('playButton');
    let loaded = false;
    let hlsInstance = null;

    if (!video || !source) {
        return;
    }

    const load = function () {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    };

    const play = function () {
        load();
        if (button) {
            button.classList.add('is-hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    };

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    video.addEventListener('error', function () {
        if (hlsInstance && hlsInstance.destroy) {
            hlsInstance.destroy();
        }
    });
}
