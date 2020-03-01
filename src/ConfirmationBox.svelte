<script>
  import { createEventDispatcher } from "svelte";

  export let counter, needsConfirm;
  let value = false;
  const identifier = "confirm" + counter;
  const dispatch = createEventDispatcher();

  function forward(event) {
    dispatch("change", {
      value,
      counter
    });
  }
</script>

{#if needsConfirm}
  <label for={identifier}>
    <input
      bind:checked={value}
      on:change={forward}
      type="checkbox"
      id={identifier} />
    I read this section.
  </label>
{/if}
