<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    class: classNames,
    style,
    children,
  } : {
    class?: string;
    style?: string;
    children?: Snippet[];
  } = $props();

  </script>

  <div class={`layers ${classNames}`} {style}>
    {@render children?.()}
  </div>

  <style>
    .layers {
      position: relative;
      margin: 0;
      padding: 0;
      overflow: hidden;
      display: flow-root;
    }

    :global {
      .layers > .layer {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        user-select: none;
        box-sizing: border-box;
      }

      .layers > .layer:first-child {
        position: static;
      }

      .layers > .layer:not(:first-child) {
        position: absolute;
      }

      .layers > .layer.active > * {
        pointer-events: auto;
        user-select: auto;
      }
    }

  </style>