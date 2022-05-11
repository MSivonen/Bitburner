//import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	let paused = false,
		casino = false,
		doc = globalThis["document"];
	ns.disableLog("ALL");
	let draggables = doc.querySelectorAll(".react-draggable");
	let logWindow = draggables[draggables.length - 1]; // Reference to the full log window, not just the log area. Needed because the buttons aren't in the log area.

	let killButton = logWindow.querySelector("button");
	let pauseButton = killButton.cloneNode(); //copies the kill button for styling purposes
	let casinoButton = killButton.cloneNode();
	pauseButton.addEventListener("click", () => {
		paused = !paused;
		pauseButton.innerText = paused ? "Unpause" : "Pause";
		//ns.print(paused ? "Script is now paused" : "Script is now unpaused")
	})
	casinoButton.addEventListener("click", () => {
		casino = !casino;
		casinoButton.innerText = casino ? "Going to casino" : "Go to casino?";
	})
	casinoButton.innerText = "Go to casino?";
	pauseButton.innerText = "Pause";
	killButton.insertAdjacentElement("beforeBegin", pauseButton);
	pauseButton.insertAdjacentElement("beforeBegin", casinoButton);


	ns.exec("/randomJS/startPaskaa.js", "home");

	let servers = getServersWithRam(ns);
	let files = [
		"/bn4/homicide.js",
		"/bn4/mug.js",
		"/bn4/buyHomeRam.js",
		"/bn4/faction.js"
	];

	for (let s of getServers(ns)) {
		for (let file of files) {
			await ns.scp(file, s);
		}
	}

	function murder() {
		for (let server of servers) {
			if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/homicide.js")) {
				if (ns.getPlayer().strength > 100) ns.exec("/bn4/homicide.js", server);
				else ns.exec("/bn4/mug.js", server);
				return;
			}
		}
		ns.print("not enough ram for murder.js");
	}



	while (true) {
		if (!ns.singularity.isBusy()) murder();
		if (casino && ns.getServerMoneyAvailable("home") > 200000) {
			ns.singularity.travelToCity("Aevum");
			ns.print("ERROR GO TO CASINO AND EARN SOME MONEY");
			ns.exec("/lib/casino.js", "home");
			ns.exit();
		}
		await ns.sleep(10);
	}
}