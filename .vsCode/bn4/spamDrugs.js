/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	while (true) {
		if (!ns.singularity.isBusy()) {
			ns.singularity.commitCrime("Deal Drugs");
		}
		await ns.sleep(10);
	}
}