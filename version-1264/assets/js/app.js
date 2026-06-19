document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-nav-panel");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        var schedule = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
        var keywordInput = filterPanel.querySelector("[data-filter-keyword]");
        var typeSelect = filterPanel.querySelector("[data-filter-type]");
        var yearSelect = filterPanel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || title.indexOf(keyword) !== -1;
                var matchType = !type || cardType === type;
                var matchYear = !year || cardYear === year;
                card.style.display = matchKeyword && matchType && matchYear ? "" : "none";
            });
        };

        [keywordInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var status = document.querySelector("[data-search-status]");
        var formInput = document.querySelector(".search-page-form input[name='q']");
        if (formInput) {
            formInput.value = query;
        }
        var results = [];
        if (query) {
            var q = query.toLowerCase();
            results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                return item.title.toLowerCase().indexOf(q) !== -1 ||
                    item.summary.toLowerCase().indexOf(q) !== -1 ||
                    item.tags.toLowerCase().indexOf(q) !== -1 ||
                    item.region.toLowerCase().indexOf(q) !== -1 ||
                    item.type.toLowerCase().indexOf(q) !== -1;
            });
        }
        if (status) {
            status.textContent = query ? "关键词 “" + query + "” 找到 " + results.length + " 部影片" : "输入关键词后即可搜索全站影片";
        }
        searchRoot.innerHTML = "";
        if (!query) {
            searchRoot.innerHTML = '<div class="no-results">请输入影片名称、题材、地区或类型进行搜索。</div>';
        } else if (!results.length) {
            searchRoot.innerHTML = '<div class="no-results">未找到相关影片，换个关键词再试。</div>';
        } else {
            var grid = document.createElement("div");
            grid.className = "movie-grid";
            results.slice(0, 240).forEach(function (item) {
                var article = document.createElement("article");
                article.className = "movie-card";
                article.innerHTML = '<a href="' + item.href + '" aria-label="观看 ' + escapeHtml(item.title) + '">' +
                    '<div class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="type-pill">' + escapeHtml(item.type) + '</span></div>' +
                    '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.summary) + '</p><div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div></div>' +
                    '</a>';
                grid.appendChild(article);
            });
            searchRoot.appendChild(grid);
        }
    }
});

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
