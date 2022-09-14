/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	await ns.grow(ns.args[0],{stock:true});
}