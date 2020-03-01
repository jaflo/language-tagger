<script>
  import { db } from "./shared.js";

  let output = "";
  let corpus = "";

  function fetchAll() {
    output = corpus = "Loading...";
    db.collection("articles")
      .get()
      .then(querySnapshot => {
        output = corpus = "";
        querySnapshot.forEach(doc => {
          const data = doc.data();
          corpus += `${doc.id}\t${data.original}\n`;
          data.words.forEach((w, i) => {
            let votes = [];
            let voteCounts = {};
            for (const annotator in data.labels) {
              if (data.labels.hasOwnProperty(annotator)) {
                const vote = data.labels[annotator];
                votes.push(vote[i]);
                if (!(vote[i] in voteCounts)) voteCounts[vote[i]] = 0;
                voteCounts[vote[i]]++;
              }
            }
            let highestCount = 0;
            let highestVoted = "null";
            for (const vote in voteCounts) {
              if (voteCounts.hasOwnProperty(vote)) {
                const count = voteCounts[vote];
                if (count > highestCount) {
                  highestCount = count;
                  highestVoted = vote;
                } else if (count == highestCount) {
                  highestVoted = "null";
                }
              }
            }
            output += `${doc.id}\t${w.complete}\t`;
            output += `${votes.join("\t")}\t${highestVoted}\n`;
          });
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }
</script>

<style>
  div {
    margin: 1em;
  }
</style>

<div>
  <textarea cols="30" rows="10">{output}</textarea>
  <textarea cols="30" rows="10">{corpus}</textarea>
  <button on:click={fetchAll}>Fetch all</button>
</div>
