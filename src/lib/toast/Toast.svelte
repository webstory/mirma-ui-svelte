<script lang="ts">
  import type { Toast } from './types';
  import X from 'phosphor-svelte/lib/X';
  import { getToastState } from './toast-state.svelte';

  import { fade } from "svelte/transition";

  let { toast }: {
    toast: Toast;
  } = $props();

  const toastState = getToastState();

</script>

<div
  class="toast-container"
  transition:fade={{duration: 200}}
>
  <span class="toast-title">{toast.title}</span>
  <span class="toast-message">{toast.message}</span>
  <button class="close-button" onclick={() => toastState.remove(toast.id)}>
    <span class="sr-only">Close toast</span>
    <X class="close-icon" />
  </button>
</div>

<style>
  .toast-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 4rem;
    width: 24rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    background-color: #cfc;
    padding: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .toast-title {
    font-size: 1rem;
  }

  .toast-message {
    font-size: 0.75rem;
  }

  .close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
