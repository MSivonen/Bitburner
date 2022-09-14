import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
	from "/lib/includes.js"

/** @param {import("../.").NS} ns */
export async function main(ns) {
	if (ns.gang.inGang() || ns.heart.break() <= -54000) return;
	if (ns.singularity.isBusy())
		while (ns.singularity.getCurrentWork().type == "GRAFTING") {
			print("grafting...");
			ns.sleep(5000);
		}

	ns.singularity.stopAction();

	let logA = [],
		atGym = 0,
		stopped = false;
	ns.disableLog("ALL");
	const homicideStartTime = performance.now();
	const homicideStartKarma = Math.floor(ns.heart.break());
	let prevTime = performance.now() - 30200,
		prevKarma = ns.heart.break(),
		timeLeft = 0,
		prevLogTime = performance.now() - 10000,
		karmaPerSecond = 0;

	while (!ns.gang.inGang() && ns.heart.break() > -54000) {
		ns.singularity.upgradeHomeRam();
		ns.tail();
		ns.clearLog();
		if (performance.now() > prevLogTime + 20000) {
			const currentKarma = Math.abs(ns.heart.break());
			const target = 54000;
			const deltaKarma = currentKarma - Math.abs(prevKarma);
			const deltaTime = (performance.now() - prevLogTime) / 1000;
			const remainingKarma = target - currentKarma;
			const timePerOneKarma = deltaTime / deltaKarma;
			timeLeft = remainingKarma * timePerOneKarma;
			karmaPerSecond = deltaKarma / deltaTime;
			prevKarma = ns.heart.break();
			prevLogTime = performance.now();
		}
		printArray(ns, logA, "tail");
		ns.print("\nKarma per second: " + col.w + karmaPerSecond.toFixed(2));
		ns.print("Making karma for gang :" + col.w + Math.floor(ns.heart.break()) + "/-54000");
		ns.print("Time taken from " + col.w + homicideStartKarma +
			col.off + " karma: " + col.w + ns.nFormat(Math.floor((performance.now() - homicideStartTime) / 1000), "00:00:00"));
		ns.print("Estimatd time left: " + col.w + ns.nFormat(timeLeft, "00:00:00"));

		if (!ns.singularity.isBusy()) {
			if (ns.getPlayer().skills.strength >= 80) ns.singularity.commitCrime("Homicide");
			if (ns.getPlayer().skills.strength < 80) ns.singularity.commitCrime("Mug Someone");
		}
		if (!stopped && ns.getPlayer().skills.strength >= 80) {
			ns.singularity.stopAction();
			stopped = true;
		}
		for (const fact of ns.singularity.checkFactionInvitations())
			ns.singularity.joinFaction(fact);

		if (prevTime + 30200 < performance.now()) {
			logA = [];
			for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
				let task = "";
				let sleevesOA = [];
				for (let slvNum = 0; slvNum < ns.sleeve.getNumSleeves(); slvNum++) {
					sleevesOA.push({
						stats:
							ns.sleeve.getSleeveStats(slvNum).strength +
							ns.sleeve.getSleeveStats(slvNum).agility +
							ns.sleeve.getSleeveStats(slvNum).defense +
							ns.sleeve.getSleeveStats(slvNum).dexterity
						, num: slvNum
						, shock: ns.sleeve.getSleeveStats(slvNum).shock
					});
				}
				objectArraySort(ns, sleevesOA, "stats", "big");
				objectArraySort(ns, sleevesOA, "shock", "small");

				const slvNum = sleevesOA[i].num;
				let agi = 40, str = 60, dex = 40, def = 40;

				if (i < 7) {
					ns.sleeve.setToCommitCrime(slvNum, "homicide");
					task = col.r + "\nHomicide";
				} else
					if (i == 7) {
						ns.sleeve.setToShockRecovery(slvNum);
						task = col.c + "\nGetting shocks";
					} else {

						if (ns.sleeve.getInformation(slvNum).city != "Sector-12")
							if (!ns.sleeve.travel(slvNum, "Sector-12")) {
								logA.push("ERROR not enough money for sleeve " + slvNum + " to travel to Sector-12")
								continue;
							}

						if (ns.sleeve.getSleeveStats(slvNum).agility < agi) {
							ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Agility");
							task = col.y + "\nTraining agi";
						}
						if (ns.sleeve.getSleeveStats(slvNum).defense < def) {
							ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "defense");
							task = col.y + "\nTraining def";
						}
						if (ns.sleeve.getSleeveStats(slvNum).dexterity < dex) {
							ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Dexterity");
							task = col.y + "\nTraining dex";
						}
						if (ns.sleeve.getSleeveStats(slvNum).strength < str) {
							ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Strength");
							task = col.y + "\nTraining str";
						}
					}

				if (task.startsWith("\nTra")) atGym++;

				if (task == "") {
					ns.sleeve.setToCommitCrime(slvNum, "homicide");
					task = col.r + "\nHomicide";
				}
				logA.push("Slv" + slvNum + " str:" + ns.sleeve.getSleeveStats(slvNum).strength + "/" + str +
					" agi:" + ns.sleeve.getSleeveStats(slvNum).agility + "/" + agi +
					" def:" + ns.sleeve.getSleeveStats(slvNum).defense + "/" + def +
					" dex:" + ns.sleeve.getSleeveStats(slvNum).dexterity + "/" + dex
					+ task);
			}
			prevTime = performance.now();
		}

		if (atGym > 0 && ns.hacknet.hashCost("Improve Gym Training") <= ns.hacknet.numHashes())
			ns.hacknet.spendHashes("Improve Gym Training");
		await ns.sleep(100);
	}
}