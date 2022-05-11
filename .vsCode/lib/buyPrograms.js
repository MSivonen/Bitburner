/** @param {NS} ns */
export async function main(ns) {
	var programs = ns.getDarkwebPrograms();
	var money = ns.getServerMoneyAvailable("home");
	var programCosts = [];
	for (let i = 0; i < programs.length; i++) {
		programCosts.push(ns.getDarkwebProgramCost(programs[i]));
	}

	ns.tprint("Programs found:");
	for (let i = 0; i < programs.length; i++) {
		ns.tprint(programs[i] + " cost: " + programCosts[i]);
	}

	while (!done) {
		for (let i = 0; i < programs.length; i++) {
			if (money > programCosts[i] && !ns.fileExists(programs[i])) {
				ns.purchaseProgram(programs[i]);
				ns.tprint("Bought " + programs[i] + " " + programCosts[i] + "$")
			}
		}
		await ns.sleep(1000);
	}
}