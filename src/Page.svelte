<script>
  import { colors, categories } from "./shared.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function createClickHandler(position) {
    return () => {
      dispatch("jump", {
        position: position
      });
    };
  }

  export let words, position, backOneWord, submitLabels;
  export let url = "";
</script>

<style>
  .page {
    max-width: 40em;
    font-family: Constantia, "Lucida Bright", Lucidabright, "Lucida Serif",
      Lucida, "DejaVu Serif", "Bitstream Vera Serif", "Liberation Serif",
      Georgia, serif;
    margin-bottom: 1em;
  }

  .word {
    display: inline-block;
    margin-left: 0.1em;
    margin-bottom: 1em;
    position: relative;
    cursor: default;
  }

  .selected {
    background: black !important;
    color: white;
    box-shadow: 0 0 0 0.5em black;
    z-index: 2;
  }

  .label {
    position: absolute;
    font-size: 0.6em;
    margin-top: 0.2em;
    top: 100%;
    left: 0;
    right: 0;
    overflow: hidden;
    padding-left: 0.2em;
    white-space: nowrap;
    color: black;
    height: auto;
  }

  .label span {
    mix-blend-mode: difference;
    color: white;
  }

  form,
  button {
    display: inline-block;
  }
</style>

<div class="page">
  {#each words as { complete, label, seen, addBlank }, i}
    <div
      class="word"
      class:seen
      class:selected={i == position}
      class:complete={i <= position}
      on:click={createClickHandler(i)}>
      {complete}
      <div class="label" style="background:{colors[label]}">
        <span>{label}</span>
      </div>
    </div>
    {addBlank ? ' ' : ''}
  {/each}
</div>

<button on:click={backOneWord}>Go one word back</button>
{#if words && words[position]}
  <form
    action="https://www.duden.de/suchen/dudenonline/"
    method="post"
    target="_blank">
    <input
      type="hidden"
      name="search_api_fulltext"
      value={words[position].word} />
    <button>Look up in Duden</button>
  </form>
  <form method="get" action="https://www.dwds.de/" target="_blank">
    <input type="hidden" name="q" value={words[position].word} />
    <button>Look up in DWDS</button>
  </form>
{/if}
<button class="submit" on:click={submitLabels}>Submit</button>
{#if url}
  <a href={url} target="_blank">Source</a>
{/if}
