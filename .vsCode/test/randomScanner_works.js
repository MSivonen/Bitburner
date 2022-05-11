/** @param {NS} ns */
export async function main(ns) {
	async function randomScanner(serv = "home", found = []) {
		ns.disableLog("ALL");
		if (found.length == 96) return (found)
		await ns.sleep(0);
		if (!found.includes(serv)) found.push(serv);
		let scanned = ns.scan(serv);
		ns.clearLog();
		let left = 96 - found.length;
		ns.print("Found " + found.length + " servers, " + left + " to find...");
		let nextInd = Math.round(Math.random() * (scanned.length-1 + .9999) - .5);
		ns.print("max: " + scanned.length + " next: " + nextInd);
		await randomScanner(scanned[nextInd], found);
	}
	ns.tail();
	ns.tprint(await randomScanner());
}