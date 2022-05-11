/** @param {NS} ns */
export async function main(ns) {
//	var hackTarget = "rothman-uni";
	var hackTarget = "johnson-ortho";
//	var hackTarget = "nectar-net";
	var hackRam = ns.getScriptRam("/jsScripts/otherHack.js");
	var serverRam = 4096;
	var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
	var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;

	var servers = ns.read("/jsScripts/servers.txt").split(",");

	ns.exec("/jsScripts/purchaseServers.js", "home", 1, serverRam, hackTarget);

	for (var i = 0; i < servers.length; i++) {
		var target = servers[i];
		if (target != "home") {
			await ns.scp("/jsScripts/otherHack.js", target);
			await ns.exec("/jsScripts/ports.js", "home", 1, target, hackTarget, moneyThresh, securityThresh);
			await ns.sleep(100);
		}
	}
}