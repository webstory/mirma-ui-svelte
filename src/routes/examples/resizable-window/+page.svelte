<script lang="ts">
  import { onMount, createRawSnippet } from 'svelte';

  import ResizableWindow from '$lib/resizable-window/ResizableWindow.svelte';

  import { toStyle } from '$lib/utils';

  let title = $state('');
  let message = $state('');
  let titleInput = $state<HTMLInputElement | null>(null);

  let dialogOpened = $state(true);
</script>

<svelte:head>
  <title>Multiple Windows</title>
</svelte:head>

<ResizableWindow
  show={dialogOpened}
  style={toStyle({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width : '400px',
    height: '400px',
    })}
  title="Resizable Window"
  onClose={() => dialogOpened = false}
  >
  <div>
    <p>Content</p>
  </div>
</ResizableWindow>

<ResizableWindow
  show={true}
  style={toStyle({
    position: 'absolute',
    top: '300px',
    left: '1000px',
    width : '400px',
    height: '400px',
    })}
  title="Resizable Window2"
  onClose={() => dialogOpened = false}
  >
  <div>
    <p>Content</p>
  </div>
</ResizableWindow>

<button onclick={() => dialogOpened = true}>Open Dialog</button>

<style>
  button {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid black;
    cursor: pointer;
  }
</style>