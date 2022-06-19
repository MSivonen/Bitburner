/** @param {NS} ns */

import { objectArraySort } from "/lib/includes";
import { printArray } from "/lib/includes";

/** @param {import("../.").NS} ns */
export async function main(ns) {
	let logA = [],
		atGym = 0;
	let prevTime = -99990;
	ns.disableLog("ALL");
	while (true) {
		ns.tail();
		if (!ns.singularity.isBusy()) {
			if (ns.getPlayer().strength >= 80) ns.singularity.commitCrime("Homicide");
			if (ns.getPlayer().strength < 80) ns.singularity.commitCrime("Mug Someone");
		}

		if (prevTime + 30200 < ns.getTimeSinceLastAug()) {
			logA = [];
			for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
				let task = "";
				let sleevesOA = [];
				for (let slvNum = 0; slvNum < ns.sleeve.getNumSleeves(); slvNum++) {
					sleevesOA.push({ shock: ns.sleeve.getSleeveStats(slvNum).shock, num: slvNum });
				}
				objectArraySort(ns, sleevesOA, "shock", "big");

				const slvNum = sleevesOA[i].num;
				const shock = sleevesOA[i].shock;

				if (i < 1 && shock > 0) {
					logA.push("Sleeve " + slvNum + " shock: " + shock);
					ns.sleeve.setToShockRecovery(slvNum);
					task = "\nShocking";
					continue;
				}

				if (ns.sleeve.getInformation(slvNum).city != "Aevum")
					if (!ns.sleeve.travel(slvNum, "Aevum")) {
						logA.push("ERROR not enough money for sleeve " + slvNum + " to travel to Aevum")
						continue;
					}

				let agi = 90, str = 110, dex = 90, def = 90;

				if (ns.sleeve.getSleeveStats(slvNum).agility < agi) {
					ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Agility");
					task = "\nTraining agi";
				}
				if (ns.sleeve.getSleeveStats(slvNum).defense < def) {
					ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "defense");
					task = "\nTraining def";
				}
				if (ns.sleeve.getSleeveStats(slvNum).dexterity < dex) {
					ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Dexterity");
					task = "\nTraining dex";
				}
				if (ns.sleeve.getSleeveStats(slvNum).strength < str) {
					ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Strength");
					task = "\nTraining str";
				}

				logA.push("Slv" + slvNum + " str:" + ns.sleeve.getSleeveStats(slvNum).strength + "/" + str +
					" agi:" + ns.sleeve.getSleeveStats(slvNum).agility + "/" + agi +
					" def:" + ns.sleeve.getSleeveStats(slvNum).defense + "/" + def +
					" dex:" + ns.sleeve.getSleeveStats(slvNum).dexterity + "/" + dex
					+ task);

				if (task.startsWith("\nTra")) atGym++;

				if (!task.startsWith("\nTra")) {
					ns.sleeve.setToCommitCrime(slvNum, "homicide");
					task = "\nHomicide";
				}
			}
			prevTime = ns.getTimeSinceLastAug();
		}

		if (atGym > 0 && ns.hacknet.hashCost("Improve Gym Training") <= ns.hacknet.numHashes())
			ns.hacknet.spendHashes("Improve Gym Training");

		ns.clearLog();
		printArray(ns, logA, "tail");
		ns.print("\nKarma: " + ns.heart.break());
		if (ns.heart.break() < -54000) {
			ns.exec("/gang/thugGang.js", "home");
			ns.exit();
		}
		await ns.sleep(100);
	}
}