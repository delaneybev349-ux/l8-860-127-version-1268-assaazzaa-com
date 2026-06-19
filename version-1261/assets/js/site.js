(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = nextIndex % slides.length;
      if (index < 0) {
        index = slides.length - 1;
      }
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var queryInput = document.querySelector("[data-query-input]");
    var typeSelect = document.querySelector("[data-type-select]");
    var yearSelect = document.querySelector("[data-year-select]");
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);

    if (queryInput) {
      queryInput.value = readQuery();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        var itemType = item.getAttribute("data-type") || "";
        var itemYear = item.getAttribute("data-year") || "";
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (type && itemType !== type) {
          ok = false;
        }
        if (year && itemYear !== year) {
          ok = false;
        }
        item.classList.toggle("is-hidden", !ok);
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play]");
      var url = player.getAttribute("data-url");
      var hls = null;
      var prepared = false;

      function prepare() {
        if (prepared || !video || !url) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          return;
        }
        video.src = url;
      }

      function play() {
        prepare();
        player.classList.add("is-started");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            player.classList.remove("is-started");
          });
        }
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-started");
        });
        video.addEventListener("pause", function () {
          if (!video.currentTime) {
            player.classList.remove("is-started");
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  onReady(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
