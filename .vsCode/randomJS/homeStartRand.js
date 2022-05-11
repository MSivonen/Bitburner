/** @param {NS} ns */
export async function main(ns) {
	var targetArray = ns.read("/randomJS/targetArray.txt").split(",");
	await ns.sleep(5000);
	var hackRam = ns.getScriptRam("/randomJS/homeHackRandom.js");

	var maxThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 8) / hackRam);
	var threadsPerInstance = Math.floor(maxThreads / targetArray.length);

	for (var i = 0; i < targetArray.length; i++) {
		var hackTarget = targetArray[i];
		var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
		var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;
		if (threadsPerInstance > 0) ns.exec("/randomJS/homeHackRandom.js", "home", threadsPerInstance, hackTarget, moneyThresh, securityThresh,);
		ns.tprint("Starting at home, targeting " + hackTarget);
		await ns.sleep(100);
	}
}