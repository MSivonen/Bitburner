/** @param {import('../.').NS} ns */
export async function main(ns) {
	ns.tprint("Karma:         " + ns.heart.break());
	ns.tprint("People killed: " + ns.getPlayer().numPeopleKilled)
}