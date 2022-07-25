/** @param {NS} ns */

import { killAllButThis } from "/lib/includes";
import { objectArraySort } from "/lib/includes";
import { printArray } from "/lib/includes";

/** @param {import("../.").NS} ns */
export async function main(ns) {
	ns.run("/ver6/ver6.js");
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
		ns.singularity.upgradeHomeRam();
		if (ns.getServerMaxRam("home") > 200 && !ns.isRunning("/hacknet/hackNet.js", "home")) ns.run("/hacknet/hackNet.js");


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
				let agi = 40, str = 60, dex = 40, def = 40;

				if (i < 4) {
					ns.sleeve.setToCommitCrime(slvNum, "homicide");
					task = "\nHomicide";
				} else {

					if (ns.sleeve.getInformation(slvNum).city != "Sector-12")
						if (!ns.sleeve.travel(slvNum, "Sector-12")) {
							logA.push("ERROR not enough money for sleeve " + slvNum + " to travel to Sector-12")
							continue;
						}


					if (ns.sleeve.getSleeveStats(slvNum).agility < agi) {
						ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Agility");
						task = "\nTraining agi";
					}
					if (ns.sleeve.getSleeveStats(slvNum).defense < def) {
						ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "defense");
						task = "\nTraining def";
					}
					if (ns.sleeve.getSleeveStats(slvNum).dexterity < dex) {
						ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Dexterity");
						task = "\nTraining dex";
					}
					if (ns.sleeve.getSleeveStats(slvNum).strength < str) {
						ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Strength");
						task = "\nTraining str";
					}
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
			killAllButThis(ns);
			ns.spawn("/bn4/startSin.js")
		}
		await ns.sleep(100);
	}
}