/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	var moneyThresh = ns.args[1];
	var securityThresh = ns.args[2];
	var thisServer = ns.args[3];

	while (true) {

		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);
		} 
		await ns.sleep(100);
	}
}