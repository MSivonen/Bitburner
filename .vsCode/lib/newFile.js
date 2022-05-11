/** @param {NS} ns */
export async function main(ns) {
	await ns.write(ns.args[0], ns.read("/lib/newFileTemplate.js"))
}