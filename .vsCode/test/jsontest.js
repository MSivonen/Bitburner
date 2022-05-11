import { printArray } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	let thisAug = [
		{
			faction: "Hello",
			currentRep: 123,
			name: "world",
		},
		{
			faction: "asdad",
			currentRep: 2333,
			name: "woddddrld",
		}
	];

	await writeToJSON(thisAug); //write the variable to the default JSON file
	let sharedjson = await readFromJSON(); //read default JSON file to variable
	for (let obj of sharedjson) { ns.tprint(obj); } //print the contents
	sharedjson[0].name = "not world"; //change something
	await writeToJSON(sharedjson, "/test/editedJSONtest.txt"); //write the changed variable to specified JSON file
	sharedjson = await readFromJSON("/test/editedJSONtest.txt"); //read specified JSON file to variable
	for (let obj of sharedjson) { ns.tprint(obj); } //print the contents

	async function readFromJSON(filename = "/test/jsontest.txt") {
		let readed = await ns.read(filename);
		return JSON.parse(readed);
	}

	async function writeToJSON(jsonObject, filename = "/test/jsontest.txt") {
		let toWrite = JSON.stringify(jsonObject);
		await ns.write(filename, toWrite, "w");
	}
}