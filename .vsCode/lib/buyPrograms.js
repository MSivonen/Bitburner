/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	ns.singularity.purchaseTor();
	for (const prog of ns.singularity.getDarkwebPrograms()) {
		ns.singularity.purchaseProgram(prog);
	}
}