/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	while (true) {
		ns.tail();
		if (!ns.singularity.isBusy()) {
			if (ns.getPlayer().strength >= 80) ns.singularity.commitCrime("Homicide");
			if (ns.getPlayer().strength < 80) ns.singularity.commitCrime("Mug Someone");
		}
		await ns.sleep(10);
	}
}