import { setPlaying, setDirection, setSpinDuration } from '../flag/flag.js';

let bpm = 60;
let playing = false;
let direction = 'ccw';

function updateSpinDuration() {
  const ms = Math.round(60000 / bpm);
  document.documentElement.style.setProperty('--spin-duration', `${ms}ms`);
  setSpinDuration(ms);
}

function setBpm(value, input) {
  bpm = Math.max(30, Math.min(240, Math.round(value)));
  input.value = bpm;
  updateSpinDuration();
}

export function initBpm() {
  const bpmInput = document.getElementById('bpm-value');
  const bpmUp = document.getElementById('bpm-up');
  const bpmDown = document.getElementById('bpm-down');
  const playBtn = document.getElementById('play-btn');
  const playIcon = document.getElementById('play-icon');
  const dirCcw = document.getElementById('dir-ccw');
  const dirCw = document.getElementById('dir-cw');

  updateSpinDuration();

  bpmUp.addEventListener('click', () => {
    setBpm(bpm + 5, bpmInput);
  });

  bpmDown.addEventListener('click', () => {
    setBpm(bpm - 5, bpmInput);
  });

  bpmInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      bpmInput.blur();
    }
  });

  bpmInput.addEventListener('blur', () => {
    const val = parseInt(bpmInput.value, 10);
    if (!isNaN(val)) {
      setBpm(val, bpmInput);
    } else {
      bpmInput.value = bpm;
    }
  });

  bpmInput.addEventListener('focus', () => {
    bpmInput.select();
  });

  playBtn.addEventListener('click', () => {
    playing = !playing;
    setPlaying(playing);
    playBtn.classList.toggle('is-playing', playing);
    playIcon.innerHTML = playing ? '&#9632;' : '&#9654;';
    playBtn.setAttribute('aria-label', playing ? 'Stop' : 'Play');
  });

  dirCcw.addEventListener('click', () => {
    if (direction === 'ccw') return;
    direction = 'ccw';
    dirCcw.classList.add('active');
    dirCw.classList.remove('active');
    setDirection('ccw');
  });

  dirCw.addEventListener('click', () => {
    if (direction === 'cw') return;
    direction = 'cw';
    dirCw.classList.add('active');
    dirCcw.classList.remove('active');
    setDirection('cw');
  });
}
