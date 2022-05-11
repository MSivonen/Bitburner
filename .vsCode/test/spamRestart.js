/** @param {NS} ns */
export async function main(ns) {
	await ns.sleep(5000);
	ns.singularity.softReset("/test/spamRestart.js");
}