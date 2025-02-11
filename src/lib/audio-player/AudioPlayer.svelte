<script module>
  // Example from https://svelte.dev/tutorial/svelte/module-exports
  let current;

  export function stopAll() {
    current?.pause();
  }
</script>

<script>
  let { src, title, artist } = $props();

  let time = $state(0);
  let duration = $state(0);
  let paused = $state(true);

  function format(time) {
    if (isNaN(time)) return '...';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }
</script>

<div class={['player', { paused }]}>
  <audio
    {src}
    bind:currentTime={time}
    bind:duration
    bind:paused
    onplay={(e) => {
      const audio = e.currentTarget;

      if (audio !== current) {
        current?.pause();
        current = audio;
      }
    }}
    onended={() => {
      time = 0;
    }}
  ></audio>

  <button
    class="play"
    aria-label={paused ? 'play' : 'pause'}
    onclick={() => paused = !paused}
  ></button>

  <div class="info">
    <div class="description">
      <strong>{title}</strong> /
      <span>{artist}</span>
    </div>

    <div class="time">
      <span>{format(time)}</span>
      <div
        class="slider"
        onpointerdown={e => {
          const div = e.currentTarget;

          function seek(e) {
            const { left, width } = div.getBoundingClientRect();

            let p = (e.clientX - left) / width;
            if (p < 0) p = 0;
            if (p > 1) p = 1;

            time = p * duration;
          }

          seek(e);

          window.addEventListener('pointermove', seek);

          window.addEventListener('pointerup', () => {
            window.removeEventListener('pointermove', seek);
          }, {
            once: true
          });
        }}
      >
        <div class="progress" style="--progress: {time / duration}%"></div>
      </div>
      <span>{duration ? format(duration) : '--:--'}</span>
    </div>
  </div>
</div>

<style>
  .player {
    display: grid;
    grid-template-columns: 2.5em 1fr;
    align-items: center;
    gap: 1em;
    padding: 0.5em 1em 0.5em 0.5em;
    border-radius: 2em;
    background: var(--bg-1);
    transition: filter 0.2s;
    color: var(--fg-3);
    user-select: none;

    --button-bg-color: hsl(0, 0%, 100%);
    --slider-bg-color: hsl(206, 20%, 90%);
    --progress-bg-color: hsl(206, 20%, 80%);
    --button-text-color: hsl(0, 0%, 13%);
    --button-bg-color: hsl(208, 77%, 47%);
    --button-hover-bg-color: hsl(208, 77%, 55%);
    --button-active-bg-color: hsl(208, 77%, 40%);
  }

  .player:not(.paused) {
    color: var(--button-text-color);
    filter: drop-shadow(0.5em 0.5em 1em rgba(0,0,0,0.1));
  }

  button {
    width: 100%;
    aspect-ratio: 1;
    color: var(--button-bg-color);
    background-color: var(--button-bg-color);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    border-radius: 50%;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 50%;
  }

  button:hover {
    background-color: var(--button-hover-bg-color);
  }

  button:active {
    background-color: var(--button-active-bg-color);
  }

  :is(button, button:hover, button:active):disabled {
    background-color: var(--button-bg-color);
    filter: grayscale(1);
    opacity: 0.4;
  }

  [aria-label="pause"] {
    background-image: url(./pause.svg);
  }

  [aria-label="play"] {
    background-image: url(./play.svg);
  }

  .info {
    overflow: hidden;
  }

  .description {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .time {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .time span {
    font-size: 0.7em;
  }

  .slider {
    flex: 1;
    height: 0.5em;
    background: var(--slider-bg-color);
    border-radius: 0.5em;
    overflow: hidden;
  }

  .progress {
    width: calc(100 * var(--progress));
    height: 100%;
    background: var(--progress-bg-color);
  }
</style>