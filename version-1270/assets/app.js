(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var isHidden = mobilePanel.hasAttribute("hidden");
                if (isHidden) {
                    mobilePanel.removeAttribute("hidden");
                    menuButton.setAttribute("aria-expanded", "true");
                    menuButton.textContent = "×";
                } else {
                    mobilePanel.setAttribute("hidden", "");
                    menuButton.setAttribute("aria-expanded", "false");
                    menuButton.textContent = "☰";
                }
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var currentSlide = 0;
        var slideTimer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === currentSlide);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === currentSlide);
            });
        }

        function startSlides() {
            if (slides.length < 2) {
                return;
            }
            slideTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (slideTimer) {
                    window.clearInterval(slideTimer);
                }
                showSlide(index);
                startSlides();
            });
        });

        startSlides();

        var queryInput = document.getElementById("siteSearchInput");
        if (queryInput) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            queryInput.value = initialQuery;
        }

        var pageFilterInputs = Array.prototype.slice.call(document.querySelectorAll(".inline-filter, #siteSearchInput"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        var activeButtonValue = "";

        function filterCards() {
            var typed = pageFilterInputs.map(function (input) {
                return normalize(input.value);
            }).filter(Boolean).join(" ");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filterable] .movie-card, [data-filterable] .horizontal-card"));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matchesTyped = !typed || typed.split(/\s+/).every(function (part) {
                    return haystack.indexOf(part) !== -1;
                });
                var matchesButton = !activeButtonValue || haystack.indexOf(normalize(activeButtonValue)) !== -1;
                var show = matchesTyped && matchesButton;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            var empty = document.querySelector(".empty-state");
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        pageFilterInputs.forEach(function (input) {
            input.addEventListener("input", filterCards);
        });

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                activeButtonValue = button.getAttribute("data-filter") || "";
                filterCards();
            });
        });

        if (pageFilterInputs.length || filterButtons.length) {
            filterCards();
        }

        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playOverlay");

        if (video && overlay) {
            var streamUrl = overlay.getAttribute("data-url");
            var prepared = false;
            var hlsInstance = null;

            function hideOverlay() {
                overlay.classList.add("is-hidden");
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            function prepareVideo() {
                if (!streamUrl) {
                    return;
                }
                hideOverlay();
                if (prepared) {
                    playVideo();
                    return;
                }
                prepared = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    playVideo();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    return;
                }

                video.src = streamUrl;
                playVideo();
            }

            overlay.addEventListener("click", prepareVideo);
            video.addEventListener("click", function () {
                if (!prepared) {
                    prepareVideo();
                }
            });
            video.addEventListener("play", hideOverlay);
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
