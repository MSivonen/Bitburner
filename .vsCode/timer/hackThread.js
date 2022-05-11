/** @param {NS} ns */
export async function main(ns) {
	const weakTimer = ns.args[0];
	const growTimer = ns.args[1];
	const hackTimer = ns.args[2];
	const weakThreads = ns.args[3];
	const growThreads = ns.args[4];
	const hackThreads = ns.args[5];
	const target = ns.args[6];
	const startTime = ns.getTimeSinceLastAug();
	var prevTime = ns.getTimeSinceLastAug();
	var hacked = false;

	if (weakThreads > 0) ns.exec("/lib/weak.js", "home", weakThreads, target, ns.getTimeSinceLastAug());

	while (!hacked) {
		if (ns.getTimeSinceLastAug() > growTimer && grown != 1 && growThreads > 0) {
			ns.exec("/lib/grow.js", "home", growThreads, target, ns.getTimeSinceLastAug());
			var grown = true;
		}
		if (ns.getTimeSinceLastAug() > hackTimer && hacked != 1 && hackThreads > 0) {
			ns.exec("/lib/hack.js", "home", hackThreads, target, ns.getTimeSinceLastAug());
			var hacked = true;
		}
		await ns.sleep(50);
	}
}