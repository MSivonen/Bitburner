/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.read("/jsScripts/servers.txt").split(",");
	for (var i = 0; i < servers.length; i++) {
		await ns.installBackdoor(servers[i]);
		ns.tprint("Installed backdoor on" + servers[i]);
	}
}