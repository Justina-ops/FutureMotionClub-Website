document.addEventListener("DOMContentLoaded", () => {

    const music = document.getElementById("bgMusic");
    const musicBtn = document.getElementById("musicBtn");

    const volumeOnIcon = document.getElementById("volumeOnIcon");
    const volumeOffIcon = document.getElementById("volumeOffIcon");

    if (!music || !musicBtn) return;

    function showMusicOn() {
        volumeOnIcon.style.display = "block";
        volumeOffIcon.style.display = "none";
        musicBtn.setAttribute("aria-label", "Turn music off");
    }

    function showMusicOff() {
        volumeOnIcon.style.display = "none";
        volumeOffIcon.style.display = "block";
        musicBtn.setAttribute("aria-label", "Turn music on");
    }

    const musicEnabled = localStorage.getItem("musicEnabled") === "true";

    if (musicEnabled) {
        music.volume = 0.3;

        music.play()
            .then(() => {
                showMusicOn();
            })
            .catch(() => {
                showMusicOff();
            });

    } else {
        showMusicOff();
    }

    musicBtn.addEventListener("click", () => {

        if (music.paused) {

            music.volume = 0.3;

            music.play().then(() => {
                localStorage.setItem("musicEnabled", "true");
                showMusicOn();
            });

        } else {

            music.pause();
            localStorage.setItem("musicEnabled", "false");
            showMusicOff();

        }
    });

});