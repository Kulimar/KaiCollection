// Background music: loops, fades in over 2s to the slider volume (30% default).
// Browsers block audible autoplay until a user gesture, so we try
// immediately and otherwise wait for the first interaction.
// The floating control tap-mutes; hover/focus expands the volume slider.
(function () {
  'use strict';

  var FADE_MS = 2000;

  var music = new Audio('audio/eMastered_WooSong.mp3');
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0;

  var toggleBtn = document.getElementById('music-toggle');
  var slider = document.getElementById('music-slider');

  var userVolume = slider ? slider.value / 100 : 0.3;
  var started = false;
  var fading = false;

  function updateIcon() {
    var silent = music.muted || userVolume === 0;
    toggleBtn.textContent = silent ? '🔇' : '🔊';
    toggleBtn.setAttribute('aria-pressed', String(music.muted));
    toggleBtn.setAttribute('aria-label', music.muted ? 'Unmute music' : 'Mute music');
  }

  function fadeIn() {
    fading = true;
    var start = performance.now();
    function step(now) {
      var t = Math.min((now - start) / FADE_MS, 1);
      music.volume = userVolume * t;
      if (t < 1) { requestAnimationFrame(step); } else { fading = false; }
    }
    requestAnimationFrame(step);
  }

  function removeGestureListeners() {
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (evt) {
      document.removeEventListener(evt, startOnGesture);
    });
  }

  function start() {
    if (started) return Promise.resolve();
    return music.play().then(function () {
      started = true;
      removeGestureListeners();
      fadeIn();
    });
  }

  function startOnGesture() {
    start().catch(function () { /* keep waiting for another gesture */ });
  }

  // Try autoplay right away; if the browser blocks it, arm gesture listeners.
  start().catch(function () {
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (evt) {
      document.addEventListener(evt, startOnGesture);
    });
  });

  if (toggleBtn && slider) {
    toggleBtn.addEventListener('click', function () {
      music.muted = !music.muted;
      updateIcon();
    });

    slider.addEventListener('input', function () {
      userVolume = slider.value / 100;
      if (userVolume > 0 && music.muted) music.muted = false;
      if (started && !fading) music.volume = userVolume;
      updateIcon();
    });

    updateIcon();
  }
})();
