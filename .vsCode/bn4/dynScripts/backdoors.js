
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
//backdoors
		const gangServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];
			for (let server of gangServers) {
			if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
				&& !ns.getServer(server).backdoorInstalled
				&& ns.hasRootAccess(server)
				&& !server.startsWith("perke")) { //PURCHASED SERVER
				connecter(ns, server);
				if (server == "w0r1d_d43m0n") {
					break;
					let time = ns.getPlayer().totalPlaytime;
					await ns.write("lastBNend.txt", time, "w");
				}
				ns.tprint("Installing backdoor on " + server);
				await ns.singularity.installBackdoor();
				break;
			}
		}
}