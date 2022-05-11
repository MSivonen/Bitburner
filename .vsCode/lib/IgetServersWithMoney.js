import { getServers } from "/lib/IgetServers.js"

/** @param {NS} ns 
 * @return {array} Array with server names that have money
*/
export function getServersWithMoney(ns) {
	let targetArray=[];
	let servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (ns.getServerMaxMoney(servers[i]) > 1000 && servers[i] != "home") {
			targetArray.push(servers[i]);
		}
	}
	return targetArray;
}