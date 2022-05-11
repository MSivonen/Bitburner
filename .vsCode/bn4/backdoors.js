/** @param {NS} ns */
export async function main(ns) {
	ns.tprint("WT");
	await ns.singularity.installBackdoor();
}