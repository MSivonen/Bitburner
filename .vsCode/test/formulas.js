/** @param {NS} ns */
export async function main(ns) {
	let tempServ = ns.getServerMinSecurityLevel("n00dles");
	ns.tprint(tempServ);
}