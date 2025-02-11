<script>
  // Example from https://svelte.dev/tutorial/svelte/module-exports
  import AudioPlayer, { stopAll } from '$lib/audio-player/AudioPlayer.svelte';

  const tracks = [
    {
      // https://musopen.org/music/9862-the-blue-danube-op-314/
      src: 'https://sveltejs.github.io/assets/music/strauss.mp3',
      title: 'The Blue Danube Waltz',
      artist: 'Johann Strauss'
    },

    {
      // https://musopen.org/music/43775-the-planets-op-32/
      src: 'https://sveltejs.github.io/assets/music/holst.mp3',
      title: 'Mars, the Bringer of War',
      artist: 'Gustav Holst'
    },

    {
      // https://musopen.org/music/8010-3-gymnopedies/
      src: 'https://sveltejs.github.io/assets/music/satie.mp3',
      title: 'Gymnopédie no. 1',
      artist: 'Erik Satie'
    },

    {
      // https://musopen.org/music/43683-requiem-in-d-minor-k-626/
      src: 'https://sveltejs.github.io/assets/music/mozart.mp3',
      title: 'Requiem in D minor, K. 626 - III. Sequence - Lacrymosa',
      artist: 'Wolfgang Amadeus Mozart'
    }
  ];
</script>

<div class="centered">
  {#each tracks as track}
    <AudioPlayer {...track} />
  {/each}

  <button onclick={stopAll}>
    stop all
  </button>
</div>

<style>
  .centered {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    gap: 0.5em;
    max-width: 40em;
    margin: 0 auto;
  }

  button {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    background-color: hsl(208, 77%, 47%);
    color: hsl(0, 0%, 100%);
    cursor: pointer;
  }
</style>
