import { getServers } from "/lib/IgetServers.js"

/** @param {NS} ns 
 * @return {array} Array with server names that have more than 3GB of ram
 */
export function getServersWithRam(ns, ram = 3) {
	let targetArray = [];
	let servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (ns.getServerMaxRam(servers[i]) >= ram) {
			targetArray.push(servers[i]);
		}
	}
	return targetArray;
}