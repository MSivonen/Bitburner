/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	var moneyThresh = ns.args[1];
	var securityThresh = ns.args[2];

	while (true) {
		if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);
		}
		else await ns.sleep(10000);

		await ns.sleep(100);
	}
}