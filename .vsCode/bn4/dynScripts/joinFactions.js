
import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"
import { killAllButThis } from "/lib/includes.js"
import { connecter } from "/lib/includes.js"
/** @param {NS} ns */ 
export async function main(ns) {
//joinFactions
		for (let fact of ns.singularity.checkFactionInvitations()) {
			ns.singularity.joinFaction(fact);
		}
}