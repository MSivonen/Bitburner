/** @param {NS} ns */
export async function main(ns) {

	const whatthefff = `function whatthefff() {
		ns.tprint("testing testing");
	}`

	testi(whatthefff);

	function testi(funcName) {
		ns.tprint(funcName.substring(funcName.indexOf(" ") + 1, funcName.indexOf("(")) + ": " + funcName);
	}
}