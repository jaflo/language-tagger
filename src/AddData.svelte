<script>
  import { db, splitText } from "./shared.js";

  let text = "";

  function addText() {
    db.collection("articles").add({
      original: text,
      url: "WEB_IMPORT",
      words: splitText(text),
      annotatorCount: 0,
      annotators: []
    });
  }
</script>

<textarea bind:value={text} cols="30" rows="10" />
<button on:click={addText}>Add</button>
