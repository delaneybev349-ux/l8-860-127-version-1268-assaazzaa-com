import { H as Hls } from "./hls.js";

const players = document.querySelectorAll(".video-player");

const startPlayer = (video, button) => {
    const source = video.dataset.source;
    if (!source) {
        return;
    }

    if (!video.dataset.ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = source;
        }
        video.dataset.ready = "true";
    }

    button?.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
            button?.classList.remove("is-hidden");
        });
    }
};

players.forEach((video) => {
    const box = video.closest(".player-box");
    const button = box?.querySelector(".player-start");

    button?.addEventListener("click", () => startPlayer(video, button));
    video.addEventListener("click", () => startPlayer(video, button));
    video.addEventListener("play", () => button?.classList.add("is-hidden"));
    video.addEventListener("pause", () => {
        if (video.currentTime === 0 || video.ended) {
            button?.classList.remove("is-hidden");
        }
    });
});
