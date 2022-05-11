/** @param {NS} ns */
export async function main(ns) {
	for (let fact of ns.singularity.checkFactionInvitations()) {
		ns.singularity.joinFaction(fact);
	}
}