<script lang="ts">
  import { getToastState } from "./toast-state.svelte";
  import Toast from "./Toast.svelte";

  import { fly } from "svelte/transition";

  const toastState = getToastState();

</script>

<div class="toast-overlay">
  {#each toastState.toasts as toast}
    <div transition:fly={{ y: -20, duration:300 }}>
      <Toast {toast} />
    </div>
  {/each}
</div>

<style>
  .toast-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
