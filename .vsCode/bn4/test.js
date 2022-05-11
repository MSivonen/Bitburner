import { printArray } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	const test = `//test
	ns.tprint("testing testing");`

	const path = "/bn4/dynScripts/"

	await writeScript(test);
	runFunc("test");

	function runFunc(func) {
		ns.exec(path + func + ".js", "home");
	}

	async function writeScript(func) {
		let fileName = func.substring(func.indexOf("/") + 2, func.indexOf("\n"));
		ns.tprint(fileName);
		const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
		const toWrite = startOfFile + func + "\n}";
		const name = path + fileName + ".js";
		await ns.write(name, toWrite, "w");
	}
}