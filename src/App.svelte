<script>
  import { db, categories, label2index } from "./shared.js";
  import {
    loadSample,
    validateSolution,
    getSampleWordCount
  } from "./tutorial.js";
  import Page from "./Page.svelte";
  import Controller from "./Controller.svelte";
  import AddData from "./AddData.svelte";
  import ExportData from "./ExportData.svelte";
  import Instructions from "./Instructions.svelte";

  export let name;

  let position = 0;
  let annotator = null;
  let annotatorId = new URL(window.location.href).searchParams.get("annotator");
  let words = [];
  let docId, docRef;
  let loading = true;
  let newUser = true;
  let metaInfo = null;
  let lastDocLoad = 0;
  let onBoardingStage = 0;
  let hasReadTutorial = false;
  let exporting =
    new URL(window.location.href).searchParams.get("export") !== null;

  if (annotatorId) {
    db.collection("users")
      .doc(annotatorId)
      .get()
      .then(docSnapshot => {
        loading = false;
        if (docSnapshot.exists) {
          newUser = false;
          listenForUserChanges();
          loadDoc();
        }
      });
  }

  function startAnnotating() {
    db.collection("users")
      .doc(annotatorId)
      .set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        wordCount: 0,
        docCount: 0,
        documents: []
      });
    newUser = false;
    listenForUserChanges();
    loadDoc();
  }

  function listenForUserChanges() {
    db.collection("meta")
      .doc("information")
      .get()
      .then(function(doc) {
        if (doc.exists) {
          metaInfo = doc.data();
        }
      });
    db.collection("users")
      .doc(annotatorId)
      .onSnapshot(function(doc) {
        annotator = doc.data();
      });
  }

  function loadDoc() {
    loading = true;
    position = 0;
    words = [];
    db.collection("articles")
      .orderBy("annotatorCount", "desc")
      .get()
      .then(querySnapshot => {
        let candidates = [];
        querySnapshot.forEach(doc => {
          if (doc.data().annotators.indexOf(annotatorId) == -1) {
            candidates.push(doc);
          }
        });
        if (candidates.length > 0) {
          docRef = candidates[Math.floor(Math.random() * candidates.length)];
          docId = docRef.id;
          words = docRef.data().words.map(w => ({
            ...w,
            label: w.word ? "German" : "",
            seen: false
          }));
        } else {
          words = [];
        }
        loading = false;
        lastDocLoad = new Date().getTime();
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  if (words.length > 0) {
    while (!words[position].word) {
      position++;
    }
  }

  function jumpToWord(event) {
    if (words[event.detail.position].word) {
      position = event.detail.position;
    }
  }

  function handleSelect(event, dontContinue) {
    if (position >= words.length) {
      position = words.length - 1;
      return;
    }
    words[position].label = event.detail.label;
    words[position].seen = true;
    if (!dontContinue) forwardOneWord();
  }

  function cycleLabel(shift) {
    let i = 0;
    for (i = 0; i < categories.length; i++) {
      if (words[position].label == categories[i].label) {
        break;
      }
    }
    i += -shift;
    if (i < 0 || i >= categories.length) return;
    handleSelect(
      {
        detail: {
          label: categories[i].label
        }
      },
      true
    );
  }

  function handleKeydown(event) {
    if (event.keyCode == 8 || event.keyCode == 37) backOneWord(); // backspace, left
    if (event.keyCode == 39) forwardOneWord(); // right
    if (event.keyCode == 38) cycleLabel(1); // up
    if (event.keyCode == 40) cycleLabel(-1); // down
    if (event.keyCode == 13) submitLabels(); // enter
  }

  function backOneWord() {
    if (position > 0) {
      position--;
      if (!words[position].word && position > 0) {
        position--;
      }
      while (!words[position].word) {
        position++;
      }
    }
  }

  function forwardOneWord() {
    if (position < words.length) {
      position++;
      while (position < words.length && !words[position].word) {
        position++;
      }
      while (position >= words.length || !words[position].word) {
        position--;
      }
    }
  }

  function submitLabels() {
    if (!words.length) return;
    if (
      !loading && // not currently loading
      lastDocLoad < new Date().getTime() - 1000 * 30 // waited >= 30s
    ) {
      if (confirm("Are you sure you want to submit? This cannot be undone.")) {
        if (newUser) {
          fakeSubmitLabels();
        } else {
          actuallySubmitLabels();
        }
      }
    } else {
      alert("Wait a bit.");
    }
  }

  function startTutorial() {
    words = loadSample();
    onBoardingStage = 1;
  }

  let tutorialErrata = [];
  let accuracy = 0;
  function fakeSubmitLabels() {
    // console.log(JSON.stringify(words.map(w => w.label)));
    const errata = validateSolution(words.map(w => w.label)).map(w => ({
      ...w,
      word: words[w.index].word
    }));
    tutorialErrata = [...tutorialErrata, ...errata];
    words = loadSample();
    position = 0;
    if (words.length == 0) {
      onBoardingStage = 2;
      accuracy = 1 - tutorialErrata.length / getSampleWordCount();
      let unique = {};
      tutorialErrata.forEach(e => {
        unique[e.word + e.expected + e.given] = e;
      });
      tutorialErrata = [];
      for (const key in unique) {
        if (unique.hasOwnProperty(key)) {
          const element = unique[key];
          tutorialErrata.push(element);
        }
      }
      tutorialErrata.sort((a, b) =>
        a.word.toLowerCase() > b.word.toLowerCase()
          ? 1
          : b.word.toLowerCase() > a.word.toLowerCase()
          ? -1
          : 0
      );
    }
  }

  function actuallySubmitLabels() {
    let update = {
      annotatorCount: firebase.firestore.FieldValue.increment(1),
      annotators: firebase.firestore.FieldValue.arrayUnion(annotatorId)
    };
    update["labels." + annotatorId] = words.map(w => w.label);

    db.collection("articles")
      .doc(docId)
      .update(update);

    db.collection("users")
      .doc(annotatorId)
      .update({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        wordCount: firebase.firestore.FieldValue.increment(
          words.filter(w => !!w.word).length
        ),
        docCount: firebase.firestore.FieldValue.increment(1),
        documents: firebase.firestore.FieldValue.arrayUnion(docId)
      });

    loadDoc();
  }
</script>

<style>
  .wrapper {
    display: flex;
  }

  .wrapper > div {
    padding: 1em;
  }

  @media only screen and (max-width: 1000px) {
    .wrapper {
      display: block;
    }
  }

  .left {
    max-height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .left,
  .message {
    width: 100%;
    max-width: 29em;
  }

  .wide.message {
    max-width: 100em;
  }

  .instructions {
    margin-bottom: 1em;
  }

  .message {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 1em;
  }

  .message button {
    margin-top: 1em;
    display: block;
  }

  .progress {
    height: 1em;
    border: 1px solid rgba(0, 0, 0, 0.2);
    margin: 0.5em 0;
  }

  .progress div {
    width: 0;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    transition: width 0.3s ease-in-out;
  }

  table {
    border-spacing: 0;
    width: 100%;
    margin: 1em 0;
  }

  thead {
    font-weight: bold;
  }
</style>

<svelte:window on:keydown={handleKeydown} />

<div class="wrapper">
  {#if annotatorId}
    <div class="left">
      {#if annotator && metaInfo}
        {annotator.wordCount} words annotated
        <div class="progress">
          <div
            style="width:{(annotator.docCount / metaInfo.documents) * 100}%" />
        </div>
      {/if}

      <details class="instructions" open>
        <summary>Instructions</summary>
        <Instructions
          needsConfirm={newUser}
          on:unlock={() => {
            hasReadTutorial = true;
          }} />
        <div>
          You can collapse these instructions by clicking on the arrow at the
          top of this section.
        </div>
      </details>

      <Controller on:select={handleSelect} />

      <details>
        <summary>Debug</summary>
        <pre>
          {JSON.stringify({ annotatorId: annotatorId, docId: docId, position: position, word: words[position] }, null, 2)}
        </pre>
      </details>

      <!-- <details>
        <summary>Add text</summary>
        <AddData />
      </details> -->
    </div>

    <div class="right">
      {#if loading}
        <div class="message">Loading...</div>
      {:else if newUser}
        {#if onBoardingStage == 0}
          <div class="message">
            Please read the instructions on the left carefully. After reading
            the instructions, click the button below to start annotating.
            <button on:click={startTutorial} disabled={!hasReadTutorial}>
              Start annotating
            </button>
          </div>
        {:else if onBoardingStage == 1}
          <Page
            {words}
            {position}
            on:jump={jumpToWord}
            {backOneWord}
            {submitLabels} />
        {:else}
          <div class="wide message">
            You have completed the tutorial with an accuracy of {(accuracy * 100).toFixed(2)}%.
            {#if tutorialErrata.length > 0}
              <table>
                <thead>
                  <tr>
                    <td>Word</td>
                    <td>Your answer</td>
                    <td>Expected answer</td>
                    <td>Explanation</td>
                  </tr>
                </thead>
                <tbody>
                  {#each tutorialErrata as { word, given, expected }}
                    <tr>
                      <td>{word}</td>
                      <td>{given}</td>
                      <td>{expected}</td>
                      <td>{categories[label2index[expected]].subtitle}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {/if}
            {#if accuracy > 0.9}
              <button on:click={startAnnotating}>Start annotating</button>
            {:else}The score is too low to continue.{/if}
          </div>
        {/if}
      {:else if words.length}
        <Page
          {words}
          {position}
          on:jump={jumpToWord}
          {backOneWord}
          {submitLabels}
          url={docRef.data().url} />
      {:else}
        <div class="message">All available documents have been tagged.</div>
      {/if}
    </div>
  {:else if exporting}
    <ExportData />
  {:else}
    <div>Please use the link provided to you to start annotating.</div>
  {/if}
</div>
