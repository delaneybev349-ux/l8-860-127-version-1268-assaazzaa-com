const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    const header = document.querySelector(".site-header");
    const backTop = document.querySelector(".back-top");
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");

    const updateScroll = () => {
        const scrolled = window.scrollY > 16;
        header?.classList.toggle("is-scrolled", scrolled);
        backTop?.classList.toggle("is-visible", window.scrollY > 520);
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    toggle?.addEventListener("click", () => {
        nav?.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", nav?.classList.contains("is-open"));
    });

    nav?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            document.body.classList.remove("menu-open");
        });
    });

    backTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let currentSlide = 0;
    let timer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    };

    const restartHero = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(() => showSlide(currentSlide + 1), 5200);
        }
    };

    document.querySelector("[data-hero-prev]")?.addEventListener("click", () => {
        showSlide(currentSlide - 1);
        restartHero();
    });

    document.querySelector("[data-hero-next]")?.addEventListener("click", () => {
        showSlide(currentSlide + 1);
        restartHero();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            restartHero();
        });
    });

    showSlide(0);
    restartHero();

    const normalize = (value) => (value || "").toString().trim().toLowerCase();
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const list = document.querySelector("[data-movie-list]");
    const noResults = document.querySelector(".no-results");
    const searchInput = document.querySelector("[data-movie-search]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const typeSelect = document.querySelector("[data-filter-type]");
    const regionSelect = document.querySelector("[data-filter-region]");
    const sortSelect = document.querySelector("[data-sort]");

    const applyFilter = () => {
        const query = normalize(searchInput?.value);
        const year = normalize(yearSelect?.value);
        const type = normalize(typeSelect?.value);
        const region = normalize(regionSelect?.value);
        let visible = 0;

        cards.forEach((card) => {
            const content = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year
            ].join(" "));
            const matched = (!query || content.includes(query))
                && (!year || normalize(card.dataset.year) === year)
                && (!type || normalize(card.dataset.type) === type)
                && (!region || normalize(card.dataset.region).includes(region));
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.style.display = visible ? "none" : "block";
        }
    };

    const applySort = () => {
        if (!list || !sortSelect) {
            return;
        }
        const value = sortSelect.value;
        const sortedCards = [...cards].sort((a, b) => {
            if (value === "year") {
                return Number(b.dataset.yearNumber || 0) - Number(a.dataset.yearNumber || 0);
            }
            if (value === "rating") {
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
            }
            if (value === "views") {
                return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            }
            return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
        });
        sortedCards.forEach((card) => list.appendChild(card));
        applyFilter();
    };

    [searchInput, yearSelect, typeSelect, regionSelect].forEach((control) => {
        control?.addEventListener("input", applyFilter);
        control?.addEventListener("change", applyFilter);
    });

    sortSelect?.addEventListener("change", applySort);

    document.querySelector("[data-hero-search-form]")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const heroInput = event.currentTarget.querySelector("input");
        if (searchInput && heroInput) {
            searchInput.value = heroInput.value;
            applyFilter();
            document.querySelector("#movies")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    applySort();
});
