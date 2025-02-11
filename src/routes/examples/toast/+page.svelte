<script lang="ts">
  import { onMount } from 'svelte';

  import { setToastState, getToastState } from '$lib/toast/toast-state.svelte';
  import Toaster from '$lib/toast/Toaster.svelte';
  import ResizableWindow from '$lib/resizable-window/ResizableWindow.svelte';

  import { toStyle } from '$lib/utils';

  setToastState();
  const toastState = getToastState();

  let title = $state('');
  let message = $state('');
  let titleInput = $state<HTMLInputElement | null>(null);
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>Toast!</h1>
<div class="toast-overlay">
  <Toaster />
</div>

<div>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      toastState.add(title, message);
      title = '';
      message = '';
      titleInput?.focus();
    }}

    class="toaster-form"
  >
    <div class="flex flex-col gap-1">
      <label for="title">Title</label>
      <input
        type="text"
        id="title"
        class="rounded-md border border-gray-800"
        bind:value={title}
        bind:this={titleInput}
        />
    </div>

    <div class="flex flex-col gap-1">
      <label for="message">Message</label>
      <input
        type="text"
        id="message"
        class="rounded-md border border-gray-800"
        bind:value={message}
        />
    </div>

    <button class="rounded-md bg-gray-300 p-1"> Add toast! </button>
  </form>
</div>

<style>
  .toast-overlay {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
  }

  button {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid black;
    cursor: pointer;
  }
  .toaster-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 400px;
    border: 1px solid black;
    border-radius: 5px;
    padding: 1rem;
  }
</style>