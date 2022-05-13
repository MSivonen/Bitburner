import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
	const playerObject = ns.getPlayer(),
		serverObject = ns.getServer("max-hardware");
	ns.tprint(ns.formulas.hacking.hackChance(serverObject, playerObject));

}