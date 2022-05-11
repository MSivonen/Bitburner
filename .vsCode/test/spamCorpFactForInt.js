/** @param {NS} ns */
export async function main(ns) {
	//ns.tail();
/* 	while (ns.singularity.checkFactionInvitations().length == 0 && !ns.args[0]) { //give an arg to instaboot
		await ns.sleep(100);
	} */
	for (let fact of ns.singularity.checkFactionInvitations()) {
		ns.singularity.joinFaction(fact);
	}
	ns.singularity.softReset("/test/spamCorpFactForInt.js");
}