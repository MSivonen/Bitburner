import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"


/*TASKS
"Unassigned"
"Ransomware"
"Phishing"
"Identity Theft"
"DDoS Attacks"
"Plant Virus"
"Fraud & Counterfeiting"
"Money Laundering"
"Cyberterrorism"
"Ethical Hacking"
"Vigilante Justice"
"Train Combat"
"Train Hacking"
"Train Charisma"
"Territory Warfare"

*/


/** @param {NS} ns */
export async function main(ns) {
	let maxWantedPenalty = 0.9;

	let wanted = 0;
	ns.clearLog();
	class Member {
		constructor(name, role = "empty", startTime = randomInt(5000)) {
			this.name = name;
			this.task = "Train Hacking";
			this.str = ns.gang.getMemberInformation(this.name).str;
			this.hacking = ns.gang.getMemberInformation(this.name).hack;
			this.role = this.hacking + this.str > 100 ? role : "newRole";
			this.prevAscend = ns.getTimeSinceLastAug() - 10000;
			this.checkRole();
			this.startTime = startTime;
			this.prevChange = this.startTime + ns.getTimeSinceLastAug();
			this.ownedEquipmentA = [];
			this.showInfo();
		}

		update() {
			this.setTask();
			this.buyItems();
			this.ascend();
		}

		async ascend() {
			if (this.prevAscend + 10000 < ns.getTimeSinceLastAug()) {
				if (ns.gang.getAscensionResult(this.name).hack > 1.5 || ns.gang.getAscensionResult(this.name).str > 1.5) {
					ns.gang.ascendMember(this.name);
					ns.print(this.name + " ascended");
					this.prevAscend = ns.getTimeSinceLastAug();
				}
			}
		}

		checkRole() {
			for (let i = 0; i < memberNames.length; i++) {
				if (this.name == memberNames[i]) {
					if (i % 3 == 0) {
						this.role = "muscle";
					} else this.role = "hacker";
				}
			}
		}

		oldcheckRole() {
			let hackers = 0;
			let muscles = 0;
			for (let mem of members) {
				if (mem.hack > mem.str) hackers++;
				else if (mem.hack < mem.str) muscles++;
			}
			ns.tprint("Muscles: " + muscles + " Hackers: " + hackers);
			if (this.role == "newRole") {
				ns.sleep(2000);
				this.role = hackers > muscles * 3 ? "muscle" : "hacker";
			} else {
				this.role = this.hacking > 200 ? "hacker" : "muscle";
			}
		}

		setTask() {
			wanted = ns.gang.getGangInformation().wantedPenalty < maxWantedPenalty ? 1 : wanted;
			wanted = ns.gang.getGangInformation().wantedPenalty > 0.95 ? 0 : wanted;
			wanted = ns.gang.getGangInformation().wantedLevel < 2 ? 0 : wanted;
			if (ns.getTimeSinceLastAug() % 100000 < 10000 + this.startTime) {
				if (this.role == "muscle") this.task = "Train Combat";
				else if (this.role == "hacker") {
					if (this.prevChange < ns.getTimeSinceLastAug()) {
						let tempTask = randomInt(1);
						this.task = tempTask == 0 ? "Train Hacking" : "Train Charisma";
						this.prevChange = ns.getTimeSinceLastAug() + 10000;
					}
				}
			} else {
				if (wanted && this.prevChange < ns.getTimeSinceLastAug()) {
					this.task = this.role == "hacker" ? "Ethical Hacking" : "Vigilante Justice";
					this.prevChange = 5000 + this.startTime + ns.getTimeSinceLastAug();

				} else if (!wanted && this.prevChange < ns.getTimeSinceLastAug()) {
					//					let randTasks = ["Ransomware", "Phishing", "Identity Theft", "DDoS Attacks", "Plant Virus", "Fraud & Counterfeiting", "Money Laundering", "Cyberterrorism"];
					let randTasks = ["Money Laundering", "Cyberterrorism"];
					let randTask = randTasks[randomInt(randTasks.length - 1)];
					this.task = this.role == "hacker" ? randTask : "Territory Warfare";
					this.prevChange = 5000 + this.startTime + ns.getTimeSinceLastAug();
				}
			}
			ns.gang.setMemberTask(this.name, this.task);
		}

		buyItems() {
			for (let equ of this.getWantedItems()) {
				if (ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equ)) {
					ns.gang.purchaseEquipment(this.name, equ);
					ns.print("Bought " + equ + " for " + this.name + ".");
				}
			}
		}

		getWantedItems() {
			this.ownedEquipmentA = [];
			let tempA = ns.gang.getMemberInformation(this.name);
			for (let temp of tempA.upgrades) {
				this.ownedEquipmentA.push(temp);
			}
			for (let temp of tempA.augmentations) {
				this.ownedEquipmentA.push(temp);
			}
			let tempArr = [];
			for (let equ of allEquipmentsOA) {
				if ((equ.type == "Rootkit" || equ.type == "Augmentation")
					&& this.role == "hacker"
					&& !this.ownedEquipmentA.find(e => { return e == equ.name })) {
					tempArr.push(equ.name);
				} else if ((equ.type == "Weapon" || equ.type == "Armor" || equ.type == "Vehicle" || equ.type == "Augmentation")
					&& this.role == "muscle"
					&& !this.ownedEquipmentA.find(e => { return e == equ.name }))
					tempArr.push(equ.name);
			}
			return tempArr;
		}

		showInfo() {
			ns.tprint(this.name);
			ns.tprint(this.role);
			ns.tprint("hacking: " + ns.gang.getMemberInformation(this.name).hack);
			ns.tprint("strength: " + ns.gang.getMemberInformation(this.name).str);
		}
	}


	ns.disableLog("ALL");
	let memberNames = ns.gang.getMemberNames();
	let members = [];
	let allEquipmentsOA = [];

	ns.tail();
	for (let i = 0; i < memberNames.length; i++) {
		members[i] = new Member(memberNames[i]);
	}
	ns.clearLog();
	let equipmentA = [];
	equipmentA = ns.gang.getEquipmentNames();
	for (let equ of equipmentA) {
		let tempEquipment = {
			name: equ,
			cost: ns.gang.getEquipmentCost(equ),
			type: ns.gang.getEquipmentType(equ)
		}
		allEquipmentsOA.push(tempEquipment);
	}
	printArray(ns, allEquipmentsOA);


	//======================================================================MAIN LOOP======================================================================
	//======================================================================MAIN LOOP======================================================================
	while (true) {
		if (ns.gang.canRecruitMember()) {
			memberNames.push(randomName());
			ns.gang.recruitMember(memberNames[memberNames.length - 1]);
			let ukko = new Member(memberNames[memberNames.length - 1]);
			members.push(ukko);
		}

		for (let member of members) {
			member.update();
		}

		warfare();
		await ns.sleep(25);
	}
	//======================================================================MAIN LOOP======================================================================
	//======================================================================MAIN LOOP======================================================================

	function warfare() {
		let otherGangs = ns.gang.getOtherGangInformation();
		let myGang = ns.gang.getGangInformation();
		for (let gname in otherGangs) {
			let winPerc = 1;
			if (gname != myGang["faction"]) {
				let tempWinPerc = ns.gang.getChanceToWinClash(gname);
				winPerc = Math.min(tempWinPerc, winPerc);
			}
		}
		if (winPerc > 0.55) ns.gang.setTerritoryWarfare(true);
		else ns.gang.setTerritoryWarfare(false);
	}

	function randomName() {
		let name = "";
		let nameLength = 3 + randomInt(5);
		let vowels = ["e", "y", "u", "i", "o", "a"]
		let consonants = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
		let prev = randomInt(3);
		for (let i = 0; i < nameLength; i++) {
			let consIndex = randomInt(consonants.length - 1);
			let vowIndex = randomInt(vowels.length - 1);
			if (prev % 4 < 2) {
				name += consonants[consIndex];
				prev += 1 + randomInt(1);
			} else {
				name += vowels[vowIndex];
				prev += 1 + randomInt(1);
			}

		}
		name = name[0].toUpperCase() + name.substring(1)
		return name;
	}


}

/**Random int between 0 and val * @param val {number} max value */
function randomInt(val = 1) {
	return Math.round(Math.random() * val);
}