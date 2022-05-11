/** @param {NS} ns */
export async function main(ns) {
	var hackTarget = ns.args[0];
	var moneyThresh = ns.args[1];
	var securityThresh = ns.args[2];
	var totalStolen = 0;
	while (true) {

		if (ns.getServerSecurityLevel(hackTarget) > securityThresh) {
			await ns.weaken(hackTarget);
		}
		else if (ns.getServerMoneyAvailable(hackTarget) < moneyThresh) {
			await ns.grow(hackTarget);
		}
		else {
			var money = ns.getServerMoneyAvailable(hackTarget);
			ns.tprint("INFO Hacking " + hackTarget + ". Money on server: " + (money / 1000000).toFixed(1)+"M");
			await ns.hack(hackTarget);
			money = money - ns.getServerMoneyAvailable(hackTarget);
			totalStolen += money;
			var moneyText = (money / 1000000).toFixed(1);
			var totalStolenText = (totalStolen / 1000000).toFixed(1);
			ns.tprint("ERROR  " + moneyText + "M stolen from " + hackTarget + ". Total: " + totalStolenText + "M");
		}
		await ns.sleep(100);
	}

}