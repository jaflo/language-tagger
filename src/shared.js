import { firebaseConfig } from "./firebase.config.js";

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

export const colors = {
	"Named Entity": "#ffffcc",
	German: "#a1dab4",
	Integrated: "#41b6c4",
	Mixed: "#2c7fb8",
	English: "#253494",
	Other: "#000000"
};

export const categories = [
	{
		label: "Named Entity",
		subtitle: "companies, people, places, etc.",
		examples: [
			"bei <u>Google</u>",
			"Obama",
			"in <u>Paris</u>",
			"Azure",
			"Functions"
		]
	},
	{
		label: "German",
		examples: ["schreibt", "der <u>Klimawandel</u>", "breitere"]
	},
	{
		label: "Integrated",
		subtitle: "capitalization and spelling changes",
		examples: [
			"klicken",
			"das <u>Item</u>",
			"das <u>Meeting</u>",
			"der <u>Computer</u>"
		]
	},
	{
		label: "Mixed",
		subtitle: "clear boundary between languages",
		examples: ["scroll|en", "implement|ieren", "der <u>Blog|beitrag</u>"]
	},
	{
		label: "English",
		subtitle: "no mixing or spelling changes",
		examples: [
			"the <u>tablet</u>",
			"the <u>data</u>",
			"the <u>corruption</u>"
		]
	},
	{
		label: "Other",
		subtitle:
			"numbers, file names, abbreviations, acronym, avoid if possible",
		examples: ["2019", "file.exe", "2.x", "API"]
	}
];

let label2index = {};
for (let i = 0; i < categories.length; i++) {
	label2index[categories[i].label] = i;
}
export { label2index };

export function splitText(text) {
	const allWords = text
		.split(/([^A-Za-zÀ-ž0-9]+)/)
		.map(w => {
			const base = w.replace(/[^A-Za-zÀ-ž0-9]*/, "");
			return {
				complete: w,
				word: base
			};
		})
		.filter(w => !!w.complete);

	let words = [];

	for (let i = 0; i < allWords.length; i++) {
		const word = allWords[i];

		const followedByBlank =
			i < allWords.length - 1 && allWords[i + 1].complete == " ";

		if (followedByBlank) i++;

		words.push({
			...word,
			addBlank: followedByBlank
		});
	}

	return words;
}
