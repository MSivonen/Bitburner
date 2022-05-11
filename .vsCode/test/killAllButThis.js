import { getServers } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	var servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (servers[i] != "home") ns.killall(servers[i]);
	}
	let notThis = ns.ps("home");
	//ns.tprint(notThis);
	for (let i = notThis.length - 1; i >= 0; i--) {

		if (ns.getRunningScript().filename != notThis[i].filename) {
			ns.tprint(notThis[i]);
			//ns.tprint(notThis[i].filename, ns.getHostname(), ...ns.args);
			ns.kill(notThis[i].filename, ns.getHostname(), ...notThis[i].args);
		}
	}
	while(true){
		await ns.sleep(100);
	}
}