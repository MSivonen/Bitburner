/** @param {NS} ns */
export async function main(ns) {


	// How much RAM each purchased server will have. In this case, it'll
	// be 8GB.
	var ram = ns.args[0];
	var hackTarget = ns.args[1];

	var hackRam = ns.getScriptRam("/jsScripts/otherHack.js");
	var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
	var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.03;

	ns.tprint("Servers with " + ram + "GB RAM cost " + ns.getPurchasedServerCost(ram) + " moneys each.");

	// Iterator we'll use for our loop
	var i = 0;

	// Continuously try to purchase servers until we've reached the maximum
	// amount of servers
	while (i < ns.getPurchasedServerLimit()) {
		// Check if we have enough money to purchase a server
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
			// If we have enough money, then:
			//  1. Purchase the server
			//  2. Copy our hacking script onto the newly-purchased server
			//  3. Run our hacking script on the newly-purchased server with 3 threads
			//  4. Increment our iterator to indicate that we've bought a new server
			var hostname = ns.purchaseServer("perkele" + i, ram);
			await ns.scp("/jsScripts/otherHack.js", hostname);
			var threads = Math.floor((ns.getServerMaxRam(hostname)) / hackRam);
			ns.exec("/jsScripts/otherHack.js", hostname, threads, hackTarget, moneyThresh, securityThresh, hostname);
			++i;
			ns.tprint("Purchased server number " + i);
		}
		await ns.sleep(5000);
	}
}