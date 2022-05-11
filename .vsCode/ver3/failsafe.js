/** @param {NS} ns */
export async function main(ns) {
	while (1 == 1) {
		if (!ns.isRunning("/ver3/home.js", "home")) {
			ns.exec("/ver3/home.js", "home");
		}
		await ns.sleep(20000);
	}
}