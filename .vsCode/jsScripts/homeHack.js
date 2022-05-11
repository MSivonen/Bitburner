/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	var moneyThresh = ns.args[1];
	var securityThresh = ns.args[2];
	var thisServer = ns.args[3];

	while (true) {

		if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);
		} else {
			ns.tprint(thisServer + " hacking!");
			await ns.hack(target);
		}
	}
}