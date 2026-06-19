const onReady = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

const setupMobileMenu = () => {
    const button = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
        return;
    }
    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
};

const setupFilter = () => {
    const inputs = document.querySelectorAll('[data-filter-input]');
    inputs.forEach((input) => {
        const section = input.closest('section') || document;
        const cards = Array.from(section.querySelectorAll('[data-filter-text]'));
        const empty = section.querySelector('[data-empty-state]');
        input.addEventListener('input', () => {
            const keyword = input.value.trim().toLowerCase();
            let visibleCount = 0;
            cards.forEach((card) => {
                const text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                const matched = !keyword || text.includes(keyword);
                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        });
    });
};

const setupHeroSlider = () => {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
        return;
    }
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
        return;
    }
    let activeIndex = 0;
    let timer = null;
    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle('is-active', current === activeIndex);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle('is-active', current === activeIndex);
        });
    };
    const start = () => {
        timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };
    const restart = () => {
        window.clearInterval(timer);
        start();
    };
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            activate(Number(dot.getAttribute('data-hero-dot')) || 0);
            restart();
        });
    });
    start();
};

window.setupPlayer = (source) => {
    const video = document.querySelector('[data-player]');
    const cover = document.querySelector('[data-player-cover]');
    if (!video || !source) {
        return;
    }
    let loaded = false;
    const start = async () => {
        if (!loaded) {
            loaded = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                const Hls = window.Hls;
                if (Hls && Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
        }
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };
    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', () => {
        if (!loaded || video.paused) {
            start();
        }
    });
};

onReady(() => {
    setupMobileMenu();
    setupFilter();
    setupHeroSlider();
});
