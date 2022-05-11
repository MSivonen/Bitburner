import { getServersWithRam } from "/lib/IgetServersWithRam.js"
/** @param {NS} ns */
export async function main(ns) {
	ns.exec("/lib/n00bports.js", "home", 1);
	//var targetArray = ["nectar-net", "joesguns"];
	var targetArray = ["n00dles"];
	//if (ns.hasRootAccess("omega-net")) targetArray.push("omega-net");
	await ns.write("/randomJS/targetArray.txt", targetArray, "w");	//var targetArray = ["nectar-net"];
	var serverRam = 8192;
	var servers = [];
	servers = getServersWithRam(ns);
	var growing = 0;
	var weaking = 0;
	var arrayText = targetArray.toString();
	//ns.exec("/randomJS/purchaseRandomServers.js", "home", 1, serverRam, arrayText);

	for (var i = 0; i < servers.length; i++) {

		var hackingServer = servers[i];
		if (hackingServer != "home") {

			var randServer = Math.floor(Math.random() * targetArray.length);
			if (randServer > targetArray.length - 1) randServer = targetArray.length - 1;
			var hackTarget = targetArray[randServer];

			var growOrWeak = Math.floor(Math.random() * 2);
			if (growOrWeak > 1) growOrWeak = 1;

			if (growOrWeak == 0) {
				growing++;
			}
			if (growOrWeak == 1) {
				weaking++;
			}

			if (growOrWeak == 0) {
				var hackRam = ns.getScriptRam("/randomJS/grow.js");
				await ns.scp("/randomJS/grow.js", hackingServer);
				var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
				var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;
			}
			if (growOrWeak == 1) {
				await ns.scp("/randomJS/weaken.js", hackingServer);
				var hackRam = ns.getScriptRam("/randomJS/weaken.js");
				var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
				var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;
			}

			if (ns.hasRootAccess(hackingServer)) ns.exec("/randomJS/portsRand.js", "home", 1, hackingServer, hackTarget, moneyThresh, securityThresh, growOrWeak);
			await ns.sleep(100);
		}
	}
	ns.exec("/randomJS/homeStartRand.js", "home", 1);
	ns.tprint("INFO Servers executing grow: " + growing);
	ns.tprint("INFO Servers executing weak: " + weaking);
}