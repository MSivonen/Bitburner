import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
	from "lib/includes.js"


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
/** @param {import('../.').NS} ns */
export async function main(ns) {
	while (!ns.gang.inGang()) {
		if (ns.gang.createGang("Slum Snakes")) break;
		await ns.sleep(1000);
		ns.print("Not in gang. Waiting...");
	}

	let maxWantedPenalty = 0.9;
	let trainings = ["Train Combat", "Train Combat", "Train Hacking", "Train Charisma"];
	let crimes = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism"];
	let niceThings = ["Vigilante Justice", "Vigilante Justice"]; //two of these, because of random selection and I'm lazy
	let wanted = 0;
	let warFareTimer = { temp: ns.gang.getOtherGangInformation()["The Black Hand"].power, detected: 0 };
	ns.clearLog();
	class Member {
		constructor(name, role = "empty", startTime = randomInt(5000)) {
			this.name = name;
			this.task = "Train Hacking";
			this.str = ns.gang.getMemberInformation(this.name).str;
			this.hacking = ns.gang.getMemberInformation(this.name).hack;
			this.role = this.hacking + this.str > 100 ? role : "newRole";
			this.prevAscend = ns.getTimeSinceLastAug() - 10000;
			this.startTime = startTime;
			this.prevChange = this.startTime + ns.getTimeSinceLastAug();
			this.ownedEquipmentA = [];
			//this.showInfo();
		}

		update() {
			this.setTask();
			this.buyItems();
			this.ascend();
		}

		async ascend() {
			if (this.prevAscend + 10000 < ns.getTimeSinceLastAug()) {
				if (!ns.gang.getAscensionResult(this.name)) return;
				if (ns.gang.getAscensionResult(this.name).hack > 1.2 || ns.gang.getAscensionResult(this.name).str > 1.2) {
					ns.gang.ascendMember(this.name);
					ns.print(this.name + " ascended");
					this.prevAscend = ns.getTimeSinceLastAug();
				}
			}
		}

		setTask() {
			if (warFareTimer.detected != 0 &&
				(ns.getTimeSinceLastAug() - warFareTimer.detected) % 20000 > 19750 ||
				(ns.getTimeSinceLastAug() - warFareTimer.detected) % 20000 < 250) {
				this.task = "Territory Warfare";
				this.prevChange = 0;
				ns.print(this.name + " is doing " + this.task);
			}
			else {
				wanted = ns.gang.getGangInformation().wantedPenalty < maxWantedPenalty ? 1 : wanted;
				wanted = ns.gang.getGangInformation().wantedPenalty > 0.95 ? 0 : wanted;
				wanted = ns.gang.getGangInformation().wantedLevel < 2 ? 0 : wanted;
				if (ns.gang.getMemberInformation(this.name).str < 100 || ns.getTimeSinceLastAug() % 100000 < 10000 + this.startTime) { //do training
					if (this.prevChange < ns.getTimeSinceLastAug()) {
						let tempTask = randomInt(2);
						this.task = trainings[tempTask];
						ns.print(this.name + " is training " + this.task);
						this.prevChange = ns.getTimeSinceLastAug() + 10000;
					}
				}
				else {
					if (wanted && this.prevChange < ns.getTimeSinceLastAug()) {
						this.task = niceThings[randomInt(niceThings.length - 1)];
						this.prevChange = 5000 + this.startTime + ns.getTimeSinceLastAug();
						ns.print(this.name + " is doing " + this.task);
					} else if (!wanted && this.prevChange < ns.getTimeSinceLastAug()) {
						let tempTask = Math.round(ns.gang.getMemberInformation(this.name).str / 35);
						tempTask = Math.min(tempTask, crimes.length - 1);
						if (tempTask < 2) this.task = trainings[randomInt(2)];
						else {
							tempTask = tempTask - 2 + randomInt(2);
							this.task = crimes[tempTask];
						}
						ns.print(this.name + " is doing crime: " + this.task);
						this.prevChange = 5000 + this.startTime + ns.getTimeSinceLastAug();
					}
				}
			}
			ns.gang.setMemberTask(this.name, this.task);
		}

		buyItems() {
			for (let equ of this.getWantedItems()) {
				if (ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equ) * 4) {
					ns.gang.purchaseEquipment(this.name, equ);
					ns.print("Bought " + equ + " for " + this.name + ".");
				}
			}
		}

		getWantedItems() {
			this.ownedEquipmentA = [...ns.gang.getMemberInformation(this.name).upgrades,
			...ns.gang.getMemberInformation(this.name).augmentations];
			let tempArr = [];
			for (let equ of allEquipmentsOA) {
				if ((equ.type == "Rootkit" || equ.type == "Augmentation")
					//&& this.role == "hacker"
					&& !this.ownedEquipmentA.find(e => { return e == equ.name })) {
					tempArr.push(equ.name);
				} else if ((equ.type == "Weapon" || equ.type == "Armor" || equ.type == "Vehicle" || equ.type == "Augmentation")
					//&& this.role == "muscle"
					&& !this.ownedEquipmentA.find(e => { return e == equ.name }))
					tempArr.push(equ.name);
			}
			return tempArr;
		}

		showInfo() {
			ns.tprint(this.name);
			ns.tprint("hacking: " + ns.gang.getMemberInformation(this.name).hack);
			ns.tprint("strength: " + ns.gang.getMemberInformation(this.name).str);
		}
	}


	ns.disableLog("ALL");
	let members = [];
	let allEquipmentsOA = [];

	for (const guy of ns.gang.getMemberNames()) {
		members.push(new Member(guy));
	}
	ns.clearLog();
	for (let equ of ns.gang.getEquipmentNames()) {
		allEquipmentsOA.push({
			name: equ,
			cost: ns.gang.getEquipmentCost(equ),
			type: ns.gang.getEquipmentType(equ)
		});
	}


	//======================================================================MAIN LOOP======================================================================
	//======================================================================MAIN LOOP======================================================================
	while (true) {
		checkRecruits();
		members.forEach(member => member.update());
		warfare();
		await ns.sleep(25);
	}
	//======================================================================MAIN LOOP======================================================================
	//======================================================================MAIN LOOP======================================================================

	function checkRecruits() {
		if (members.length > ns.gang.getMemberNames().length)
			members = members.filter(member => ns.gang.getMemberNames().includes(member.name));

		if (ns.gang.recruitMember(randomName())) {
			members.push(new Member(ns.gang.getMemberNames().pop()));
		}
	}

	function warfare() {
		if (warFareTimer.detected == 0) {
			if (warFareTimer.temp != ns.gang.getOtherGangInformation()["The Black Hand"].power) {
				warFareTimer.detected = ns.getTimeSinceLastAug();
			}
			else warFareTimer.temp = ns.gang.getOtherGangInformation()["The Black Hand"].power;
		}

		let otherGangs = ns.gang.getOtherGangInformation();
		let myGang = ns.gang.getGangInformation();
		let winPerc = 1;
		for (let gname in otherGangs) {
			if (gname != myGang["faction"]) {
				let tempWinPerc = ns.gang.getChanceToWinClash(gname);
				winPerc = Math.min(tempWinPerc, winPerc);
			}
		}
		if (winPerc > 0.45) ns.gang.setTerritoryWarfare(true);
		else ns.gang.setTerritoryWarfare(false);
	}

	function randomName() {
		let name = "";
		let nameLength = 3 + randomInt(5);
		let vowels = ["e", "y", "u", "i", "o", "a"]
		let consonants = ["w", "r", "t", "p", "s", "d", "f", "g", "h", "j", "k", "l", "c", "v", "b", "n", "m"];
		let prev = randomInt(3);
		for (let i = 0; i < nameLength; i++) {
			if (prev % 4 < 2) {
				name += consonants[randomInt(consonants.length - 1)];
				prev += 1 + randomInt(1);
			} else {
				name += vowels[randomInt(vowels.length - 1)];
				prev += 1 + randomInt(1);
			}
		}
		name = name[0].toUpperCase() + name.substring(1)
		return name;
	}
}