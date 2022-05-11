import { getServers } from "/lib/includes.js"
/** @param {NS} ns */
export async function main(ns) {
	var servers = getServers(ns);
	for (var i = 0; i < servers.length; i++) {
		if (servers[i] != "home") ns.killall(servers[i]);
	}
	ns.killall("home");
}