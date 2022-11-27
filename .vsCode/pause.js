/** @param {NS} ns */
export async function main(ns) {
	while (ns.getServerMaxRam("home") < 200) {
		await ns.sleep(1000);
	}
}