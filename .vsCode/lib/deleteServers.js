/** @param {NS} ns */
export async function main(ns) {

	var servers = ns.scan("home");
	for (var i = 0; i < servers.length; i++) {
		if (servers[i].substring(0, 7) == "perkele") {
			ns.killall(servers[i]);
			ns.deleteServer(servers[i]);
		}
	}

}