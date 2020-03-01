# Language Tagger

A multi-user natural language tagging interface.

This project uses the [Svelte](https://svelte.dev) framework for the front-end and is set up to be deployed on [Firebase](https://firebase.google.com). Data will also be persisted in Firebase using Firestore.

## Get Started

1. Follow the first step of the [setup guide](https://firebase.google.com/docs/web/setup) to set up a new Firebase project.
1. Also set up a [Firestore database](https://firebase.google.com/docs/firestore/quickstart).
1. Follow the Python instructions on that page to create a service account and save the JSON file for later.

## Populate the Database

1. Save the JSON file in this folder (next to populate-firebase.ipynb)
1. Open the Jupyter notebook. The notebook in this project fetches code from the Microsoft Azure Functions documentation. You may need to adjust it for your needs.
1. Run all cells to populate your Firestore database.

## Tagger Setup

1. Get your Firebase credentials from the [console](https://console.firebase.google.com/u/0/) > Settings > Apps and update `tagger/src/firebase.config.js` (you can use the example from `firebase.config.js.example`).
1. Run `npm install` to install the dependencies.
1. Run `npm run dev` to see how everything looks and to make changes.
1. Configure the Firebase project by running `firebase init`.
1. Run `npm run deploy` to deploy the tagger to Firebase.

## Start Tagging

Open the URL Firebase provides you in the output and append `?annotator=ID` where `ID` is a unique string for each annotator. For example: https://tagger-12345.web.app is shown by Firebase, so access using https://tagger-12345.web.app?annotator=laf4085i5l6a8eoz (the string is random is does not need to be stored anywhere).

## Retrieve Results

To export the data you collected in a tabular format, open your URL with the parameter `export` i.e. https://tagger-12345.web.app?export and click `Fetch all`. The program will show the labelled data followed by the corpora. The last column in the first output shows the majority vote for that token. It is the string `null` if there is no majority.
