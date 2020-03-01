<script>
  import ConfirmationBox from "./ConfirmationBox.svelte";
  import { createEventDispatcher } from "svelte";

  export let needsConfirm = true;

  let confirmIndex = 0;
  let confirmations = {};
  const dispatch = createEventDispatcher();

  function checkboxChange(e) {
    confirmations[e.detail.counter] = e.detail.value;
    for (let i = 0; i < confirmIndex; i++) {
      if (!confirmations[i]) return;
    }
    dispatch("unlock");
    needsConfirm = false;
  }
</script>

<style>
  div {
    margin-bottom: 1em;
  }
</style>

<div>
  <h2>Overview</h2>
  You will be shown several passages from German developer documentation written
  by Microsoft for one of their products called Azure Functions. You do not need
  a technical background to complete this task. The data collected will be used
  to train and assess language models that deal with multilingual data. Please
  complete this task on a computer.
</div>
<ConfirmationBox
  {needsConfirm}
  on:change={checkboxChange}
  counter={confirmIndex++} />
<div>
  <h2>How to use</h2>
  Tag each word by
  <ul>
    <li>clicking on a button below, or</li>
    <li>pressing the matching letter on your keyboard, or</li>
    <li>using the numbers 1-6 on your keyboard.</li>
  </ul>
  <ConfirmationBox
    {needsConfirm}
    on:change={checkboxChange}
    counter={confirmIndex++} />
  By default everything is tagged as German, you can jump to specific words by
  <strong>clicking.</strong>
  Use
  <strong>backspace</strong>
  or
  <strong>arrow keys</strong>
  to move through words. Press
  <strong>enter</strong>
  to save and continue. You can close the page between passages and resume at a
  later point, completing the task in multiple sessions. Move your mouse here
  and scroll to view all instructions.
</div>
<ConfirmationBox
  {needsConfirm}
  on:change={checkboxChange}
  counter={confirmIndex++} />
<div>
  <h2>Evaluation criteria</h2>
  Prioritize labels farther up the list. So if something is both a named entity
  and other, then pick the first. Use the following criteria to label words:
  <ul>
    <li>
      Is it a company, place, person, product, etc.?
      <b>Named entity</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
    <li>
      Does the word seem English, but is conjugated in German? Like scrollen?
      <b>Mixed</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
    <li>
      Is this an English word, but is is capitalized as a German word (der
      Computer) or spelled German (klicken)?
      <b>Integrated</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
    <li>
      You would only find this word in German in this context?
      <b>German</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
    <li>
      You would only find this word in English in this context?
      <b>English</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
    <li>
      Is it none of those? Like a number, foreign word, filename?
      <b>Other</b>
      <ConfirmationBox
        {needsConfirm}
        on:change={checkboxChange}
        counter={confirmIndex++} />
    </li>
  </ul>
  If you are unsure, you can search
  <i>Duden</i>
  or
  <i>Digitale Wörterbuch der deutschen Sprache</i>
  (DWDS) using the buttons below the text.
</div>
<ConfirmationBox
  {needsConfirm}
  on:change={checkboxChange}
  counter={confirmIndex++} />
