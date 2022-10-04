/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	while (!ns.singularity.purchaseTor()) await ns.sleep(1000);
	let loopForever = ns.args[0];
	do {
		for (const prog of ns.singularity.getDarkwebPrograms()) {
			ns.singularity.purchaseProgram(prog);
		}
		await ns.sleep(100);
	} while (loopForever);
}