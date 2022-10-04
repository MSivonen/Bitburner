import { killAllButThis } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	let paused = false,
		doc = globalThis["document"];
	ns.disableLog("ALL");
	let draggables = doc.querySelectorAll(".react-draggable");
	let logWindow = draggables[draggables.length - 1]; // Reference to the full log window, not just the log area. Needed because the buttons aren't in the log area.

	let killButton = logWindow.querySelector("button");
	let quitButton = killButton.cloneNode(); //copies the kill button for styling purposes
	quitButton.addEventListener("click", () => {
		paused = !paused;
	})
	quitButton.innerText = "Quit unrandomizing";
	killButton.insertAdjacentElement("beforeBegin", quitButton);

	killAllButThis(ns);
	ns.singularity.commitCrime("Mug Someone");

	let tempFloor = Math.floor;
	let tempRandom = Math.random;
	Math.floor = (number) => { return 1 }; Math.random = () => { return 0 };
	for (let i = 0; i < 10; i++)ns.print(Math.floor(100 * Math.random()));
	while (!paused && ns.getServerMoneyAvailable("home") < 9999999999) {
		await ns.sleep(1000);
	}
	Math.floor = tempFloor;
	Math.random = tempRandom;
	for (let i = 0; i < 10; i++)ns.print(Math.floor(100 * Math.random()));
}