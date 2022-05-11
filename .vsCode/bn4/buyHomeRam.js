/** @param {NS} ns */
export async function main(ns) {
	await ns.sleep(10);
	ns.singularity.upgradeHomeRam();
}