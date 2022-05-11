/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	const growTimer = ns.args[1];

	while (ns.getTimeSinceLastAug() < growTimer) await ns.sleep(50);
	await ns.grow(target);
}