/** @param {NS} ns */
export async function main(ns) {
	while (ns.getServerMaxRam("home") < 200) {
		ns.hacknet.spendHashes("Sell for Money");
		ns.singularity.upgradeHomeRam();
		await ns.sleep(100);
	}
}