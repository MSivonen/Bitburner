/** @param {NS} ns */
export async function main(ns) {
	var ram = ns.args[0];
	var targetArray = ns.args[1].split(",");

	ns.tprint("Servers with " + ram + "GB RAM cost " + ns.getPurchasedServerCost(ram) + " moneys each.");

	var i = 0;

	while (i < ns.getPurchasedServerLimit()) {

		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {

			var randServer = Math.floor(Math.random() * targetArray.length);
			if (randServer > targetArray.length - 1) randServer = targetArray.length - 1;
			var hackTarget = targetArray[randServer];

			var growOrWeak = Math.floor(Math.random() * 2);
			if (growOrWeak > 1) growOrWeak = 1;

			var hackingServer = ns.purchaseServer("perkele" + i, ram);

			if (growOrWeak == 0) {
				var hackRam = ns.getScriptRam("/randomJS/grow.js");
				await ns.scp("/randomJS/grow.js", hackingServer);
				var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
				var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;
				var threads = Math.floor((ns.getServerMaxRam(hackingServer)) / hackRam);
				ns.exec("/randomJS/grow.js", hackingServer, threads, hackTarget, moneyThresh, securityThresh);
				ns.tprint("Purchased server number " + i + " with " + ram + "GB RAM at cost " + ns.getPurchasedServerCost(ram) + " moneys. Running GROW.");
			}
			if (growOrWeak == 1) {
				await ns.scp("/randomJS/weaken.js", hackingServer);
				var hackRam = ns.getScriptRam("/randomJS/weaken.js");
				var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
				var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;
				var threads = Math.floor((ns.getServerMaxRam(hackingServer)) / hackRam);
				ns.exec("/randomJS/weaken.js", hackingServer, threads, hackTarget, moneyThresh, securityThresh);
				ns.tprint("Purchased server number " + i + " with " + ram + "GB RAM at cost " + ns.getPurchasedServerCost(ram) + " moneys. Running WEAK.");
			}

			++i;
		}
		await ns.sleep(5000);
	}
}