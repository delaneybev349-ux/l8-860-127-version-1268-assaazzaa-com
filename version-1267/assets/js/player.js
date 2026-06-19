import { H as Hls } from './hls-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.movie-player').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-button');
        var source = video ? video.querySelector('source') : null;
        var url = source ? source.getAttribute('src') : '';
        var ready = false;
        var hls = null;

        function bindSource() {
            if (!video || !url || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = url;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            ready = true;
        }

        function playVideo() {
            bindSource();
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
});