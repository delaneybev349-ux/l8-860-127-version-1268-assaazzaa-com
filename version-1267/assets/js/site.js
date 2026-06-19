document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('#mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var sliders = document.querySelectorAll('.hero-slider');
    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dots button'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    });

    var filterForms = document.querySelectorAll('[data-filter-panel]');
    filterForms.forEach(function (panel) {
        var scopeSelector = panel.getAttribute('data-filter-panel');
        var scope = document.querySelector(scopeSelector) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = document.querySelector(panel.getAttribute('data-empty-target'));
        var inputs = Array.prototype.slice.call(panel.querySelectorAll('input, select'));
        var resetButton = panel.querySelector('[data-reset-filter]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var queryInput = panel.querySelector('[name="q"]');
            var regionInput = panel.querySelector('[name="region"]');
            var typeInput = panel.querySelector('[name="type"]');
            var yearInput = panel.querySelector('[name="year"]');
            var query = normalize(queryInput && queryInput.value);
            var region = normalize(regionInput && regionInput.value);
            var type = normalize(typeInput && typeInput.value);
            var year = normalize(yearInput && yearInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
                    matched = false;
                }
                if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
                    matched = false;
                }
                if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
                    matched = false;
                }
                card.classList.toggle('hide-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', applyFilter);
            input.addEventListener('change', applyFilter);
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                inputs.forEach(function (input) {
                    input.value = '';
                });
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        var queryInput = panel.querySelector('[name="q"]');
        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }
        applyFilter();
    });
});