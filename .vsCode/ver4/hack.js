/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	const hackTimer = ns.args[1];

	while (ns.getTimeSinceLastAug() < hackTimer) await ns.sleep(50);
	await ns.hack(target);
}