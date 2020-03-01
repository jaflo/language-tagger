<script>
  import { colors, categories } from "./shared.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let char2cat = {};

  categories.forEach((c, i) => {
    char2cat[c.label[0].toLowerCase()] = i + 1;
  });

  function handleKeydown(event) {
    const number = char2cat[event.key] || parseInt(event.key);
    if (number > 0 && number <= categories.length) {
      dispatch("select", {
        label: categories[number - 1].label
      });
    }
  }

  function createClickHandler(label) {
    return () => {
      dispatch("select", {
        label: label
      });
    };
  }
</script>

<style>
  button {
    display: flex;
    text-align: left;
    width: 100%;
    align-items: center;
  }

  .number {
    padding: 0.6em;
    margin-right: 1em;
    text-align: center;
    line-height: 1;
    font-weight: bold;
    border-radius: 9em;
  }

  .number span {
    color: #333;
    background-color: #f4f4f4;
    width: 1em;
    height: 1em;
    padding: 0.4em;
    display: inline-block;
    border-radius: 9em;
  }

  .examples {
    display: block;
    font-style: italic;
  }
</style>

<svelte:window on:keydown={handleKeydown} />

<div id="controller">
  {#each categories as { label, subtitle, examples }, i}
    <button on:click={createClickHandler(label)}>
      <div class="number" style="background:{colors[label]}">
        <span>{label[0]}</span>
      </div>
      <div class="text">
        <strong>{label}</strong>
        {subtitle || ''}
        <div class="examples">
          {@html examples.join(', ')}
        </div>
      </div>
    </button>
  {/each}
</div>
