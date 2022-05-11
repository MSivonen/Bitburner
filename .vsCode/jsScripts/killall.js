/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.read("/jsScripts/servers.txt").split(",");
	for (var i = 0; i < servers.length - 1; i++) {
		if (servers[i] != "home") ns.killall(servers[i]);
	}
	ns.killall("home");

}