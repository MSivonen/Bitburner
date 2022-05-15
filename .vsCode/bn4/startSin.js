import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"

const imports = `
import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"
import { killAllButThis } from "/lib/includes.js"
import { connecter } from "/lib/includes.js"
`

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
	/** @param 0=murder, 1=job */
	let murderOrJob = 0;
	const wantAugsInstalled = true;
	/**Path for dynamic scripts */
	const path = "/bn4/dynScripts/"
	const wantGang = true;
	ns.tail();
	let paused = false,
		doc = globalThis["document"];
	ns.disableLog("ALL");
	let draggables = doc.querySelectorAll(".react-draggable");
	let logWindow = draggables[draggables.length - 1]; // Reference to the full log window, not just the log area. Needed because the buttons aren't in the log area.

	let killButton = logWindow.querySelector("button");
	let pauseButton = killButton.cloneNode(); //copies the kill button for styling purposes
	pauseButton.addEventListener("click", () => {
		paused = !paused;
		pauseButton.innerText = paused ? "Unpause" : "Pause";
	})
	pauseButton.innerText = "Pause";
	killButton.insertAdjacentElement("beforeBegin", pauseButton);



	ns.clearLog();
	const sin = eval("ns.singularity");
	let servers = getServersWithRam(ns);
	if (wantGang && ns.heart.break() < -54000) ns.exec("/gang/thugGang.js", "home");
	ns.exec("/ver6/ver6.js", "home");
	let boughtAug = false;
	let prevJobTime = ns.getTimeSinceLastAug() - 5000;
	let timer = 0;
	let timeToWaitForAugs = 300 * 1000;
	const gangServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];
	let files = [
		"/bn4/homicide.js",
		"/bn4/mug.js",
		"/bn4/buyHomeRam.js",
		"/bn4/faction.js"
	];
	let sleeveText = [],
		activityText = [],
		logA = ["", "", "", "", ""];


	const dynFunctions = [
		`//backdoors
		const gangServers = ["CSEC",
		 "avmnite-02h",
		  "I.I.I.I",
		   "run4theh111z",
		    "The-Cave", 
			"w0r1d_d43m0n",
			"ecorp",
			"megacorp",
			"blade",
			"clarkinc",
			"omnitek",
			"4sigma",
			"kuai-gong",
			"fulcrumassets",
			"omnia"
			];
			for (let server of gangServers) {
			if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
				&& !ns.getServer(server).backdoorInstalled
				&& ns.hasRootAccess(server)
				&& !server.startsWith("perke")) { //PURCHASED SERVER
				connecter(ns, server);
				if (server == "w0r1d_d43m0n") {
					break;
					let time = ns.getPlayer().totalPlaytime;
					await ns.write("lastBNend.txt", time, "w");
				}
				ns.tprint("Installing backdoor on " + server);
				await ns.singularity.installBackdoor();
				break;
			}
		}`
		,

		`//joinFactions
		for (let fact of ns.singularity.checkFactionInvitations()) {
			ns.singularity.joinFaction(fact);
		}`
		,

		`//buyHomeRam
		for (let server of getServersWithRam(ns)) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/buyHomeRam.js")) {
				if (ns.singularity.getUpgradeHomeRamCost() * 2 < ns.getServerMoneyAvailable("home")) {
					ns.exec("/bn4/buyHomeRam.js", server);
					ns.print("Bought homeram");
					return;
				}
			}
		}`


	]

	for (let dynFunc of dynFunctions) {
		await writeScript(dynFunc);
	}

	ns.tail();
	while (true) {
		while (paused) {
			await ns.sleep(100);
		}

		runFunc("joinFactions");
		runFunc("backdoors");
		runFunc("buyHomeRam");

		await copyProgs();
		buyDarkweb();
		getAugs();
		startGang();
		sleeves();
		await idle();
		updateTail();
		await ns.sleep(300)
	}

	function updateTail() {

		ns.clearLog();
		if (logA.length > 5) logA.splice(5);

		ns.print("=============MAIN===============")
		for (let i = 0; i < 3; i++) {
			if (activityText[i]) ns.print(activityText[i]);
			else ns.print("");
		}
		ns.print("=============SLEEVES============")
		for (let i = 0; i < 8; i++) {
			if (sleeveText[i]) ns.print(sleeveText[i]);
			else ns.print("");
		}
		ns.print("=============LOG================")
		for (let i = 0; i < 5; i++) {
			if (logA[i]) ns.print(logA[i]);
			else ns.print("");
		}
	}

	function sleeves() {
		sleeveText = [];
		let sleeveTasks = [
			"setToFactionWork",
			"setToCompanyWork"
		],
			excludedFactions = [];

		for (let i = 0; i < sleeveFactions.length; i++)
			if (ns.getPlayer().inGang)
				if (sleeveFactions[i] == ns.gang.getGangInformation().faction)
					sleeveFactions.splice(i, 1);

		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (ns.sleeve.getSleeveStats(i).sync < 50 && !ns.gang.inGang()) {
				ns.sleeve.setToSynchronize(i);
				sleeveText.push("Sleeve " + i + " syncing");
				continue;
			}

			if (ns.sleeve.getSleeveStats(i).sync < 100 && !ns.gang.inGang()) {
				murderOrJob = 0;
			}

			if (ns.sleeve.getSleeveStats(i).sync < 100 && ns.gang.inGang()) {
				ns.sleeve.setToSynchronize(i);
				sleeveText.push("Sleeve " + i + " syncing");
				continue;
			}

			if (ns.sleeve.getInformation(i).city != "Aevum")
				if (!ns.sleeve.travel(i, "Aevum")) {
					ns.tprint("ERROR not enough money for sleeve to travel to Aevum")
					continue;
				}

			if (ns.sleeve.getSleeveStats(i).strength < 70) {
				ns.sleeve.setToGymWorkout(i, "Crush Fitness Gym", "Strength");
				sleeveText.push("Sleeve" + i + " training strength: " + ns.sleeve.getSleeveStats(i).strength + "/70");
				continue;
			}
			if (ns.sleeve.getSleeveStats(i).agility < 30) {
				ns.sleeve.setToGymWorkout(i, "Crush Fitness Gym", "Agility");
				sleeveText.push("Sleeve" + i + " training agility: " + ns.sleeve.getSleeveStats(i).agility + "/30");
				continue;
			}
			if (ns.sleeve.getSleeveStats(i).defense < 50) {
				ns.sleeve.setToGymWorkout(i, "Crush Fitness Gym", "defense");
				sleeveText.push("Sleeve" + i + " training defense: " + ns.sleeve.getSleeveStats(i).defense + "/50");
				continue;
			}
			if (ns.sleeve.getSleeveStats(i).dexterity < 30) {
				ns.sleeve.setToGymWorkout(i, "Crush Fitness Gym", "Dexterity");
				sleeveText.push("Sleeve" + i + " training dexterity: " + ns.sleeve.getSleeveStats(i).dexterity + "/30");
				continue;
			}
			if (murderOrJob == 0) {
				//if (ns.sleeve.getSleeveStats(i).strength < 70) {
				//	ns.sleeve.setToCommitCrime(i, "mug someone");
				//	sleeveText.push("Sleeve" + i + " is a mug");
				//	continue;
				//}
				//else{
				ns.sleeve.setToCommitCrime(i, "homicide");
				sleeveText.push("Sleeve" + i + " is homiciding");
				continue;
			}
			else if (murderOrJob == 1) {
				if (ns.sleeve.getSleeveStats(i).hacking < 30) {
					ns.sleeve.setToUniversityCourse(i, "summit university", "Algorithms");
					sleeveText.push("Sleeve" + i + " is studying algorithms");
					continue;
				}

				let sleeveFaction = getBestFaction(excludedFactions);
				if (sleeveFaction != "nope") {
					ns.sleeve.setToFactionWork(i, sleeveFaction, "hacking contracts");
					excludedFactions.push(sleeveFaction);
				}

				if (ns.getPlayer().isWorking) {
					if (ns.getPlayer().workType == "Working for Faction") {
						ns.sleeve.setToFactionWork(i, ns.getPlayer().currentWorkFactionName, "hacking contracts");
						sleeveText.push("Sleeve" + i + " is hacking for " + ns.getPlayer().currentWorkFactionName);
					}
					else if (ns.getPlayer().workType == "Working for Company") {
						ns.sleeve.setToCompanyWork(i, ns.getPlayer().companyName);
						ns.print("Sleeve" + i + " is working at " + ns.getPlayer().companyName);
						sleeveText.push("Sleeve" + i + " is working at " + ns.getPlayer().companyName);
					}
				}
			}
		}
	}


	function getBestFaction(exclude = []) {	//find the aug that needs the least rep to get
		const gangFact = ns.gang.getGangInformation().faction;
		let bestAugOfEachFaction = [];
		let wantedAugs = [
			"company_rep_mult",
			"faction_rep_mult",
			"hacki"
		];
		const gangAugs = [
			"strength",
			"defense",
			"dexterity",
			"agility"
		];

		if (wantGang) wantedAugs.push(...gangAugs);

		for (let fact of ns.getPlayer().factions) {
			if (fact == gangFact || exclude.includes(fact)) continue;
			let bestAug = {
				repNeeded: 99e99
			}
			let augs = ns.singularity.getAugmentationsFromFaction(fact);

			for (let aug of augs) {
				let thisAug = {
					faction: fact,
					currentRep: ns.singularity.getFactionRep(fact),
					currentFav: ns.singularity.getFactionFavor(fact),
					name: aug,
					repCost: ns.singularity.getAugmentationRepReq(aug),
					owned: false,
					dontBuy: true,
					repNeeded: 0
				}
				thisAug.repNeeded = (thisAug.repCost - thisAug.currentRep) / ((thisAug.currentFav + 100) / 100); //rep needed for cheapest aug
				let tempArr = Object.keys(ns.singularity.getAugmentationStats(aug)); //get aug stat names
				for (let text of tempArr) {
					for (let want of wantedAugs) {
						if (text.startsWith(want)) {
							thisAug.dontBuy = false;
						}
					}
				}
				if (thisAug.name == "Neuroreceptor Management Implant"
					|| thisAug.name == "The Red Pill"
					|| thisAug.name == "CashRoot Starter Kit") thisAug.dontBuy = false;
				/* all augs without stats:
					that.js: The Red Pill
					that.js: CashRoot Starter Kit
					that.js: Neuroreceptor Management Implant
					that.js: The Red Pill
					that.js: The Blade's Simulacrum
					that.js: SoA - phyzical WKS harmonizer
					that.js: SoA - Might of Ares
					that.js: SoA - Wisdom of Athena
					that.js: SoA - Chaos of Dionysus
					that.js: SoA - Beauty of Aphrodite
					that.js: SoA - Trickery of Hermes
					that.js: SoA - Flood of Poseidon
					that.js: SoA - Hunt of Artemis
					that.js: SoA - Knowledge of Apollo
				*/
				for (let myAug of ns.singularity.getOwnedAugmentations(true)) {	//true = include purchsed but not installed augs
					if (aug == myAug) thisAug.owned = true;
				}
				if (thisAug.owned) thisAug.dontBuy = true; //exclude owned augs
				if (thisAug.repNeeded <= bestAug.repNeeded && thisAug.repNeeded > 0 && !thisAug.dontBuy) bestAug = thisAug;
			}
			bestAugOfEachFaction.push(bestAug);	//push the best aug of this faction
		}
		let bestScore = 99e99;
		let bestOfBest = {
			error: true
		};
		for (let aug of bestAugOfEachFaction) {
			if (aug.repNeeded < bestScore) { //find the best faction
				bestScore = aug.repNeeded;
				bestOfBest = aug;
			}
		}
		if (bestOfBest.error) return ("Nope");
		activityText[2] = `${bestOfBest.faction}, ${bestOfBest.name}, rep needed: ${Math.floor(bestOfBest.repNeeded)}`;
		return (bestOfBest.faction); //return faction name
	}

	function runFunc(func) {
		let fileName = path + func + ".js";
		for (let server of servers) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam(fileName)
				&& !ns.isRunning(fileName, "home")) {
				ns.exec(fileName, server);
			} break;
		}
	}

	async function writeScript(func) {
		let fileName = func.substring(func.indexOf("/") + 2, func.indexOf("\n"));
		const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
		const toWrite = imports + startOfFile + func + "\n}";
		const name = path + fileName + ".js";
		await ns.write(name, toWrite, "w");
	}

	async function idle() {
		let daedalus, redPill;
		for (let aug of ns.singularity.getOwnedAugmentations()) {
			if (aug == "The Red Pill") redPill = true;
		}
		for (let fact of ns.getPlayer().factions) {
			if (fact == "Daedalus") daedalus = true;
		}
		if (!redPill && daedalus && !sin.isBusy()) {
			ns.singularity.workForFaction("Daedalus", "Hacking contracts", false);
			activityText[0] = "Hacking for daedalus";
		}

		else if ((wantGang && (!ns.gang.inGang()) && !sin.isBusy())) {
			murder();
		}
		else if (ns.getPlayer().factions.length != 0 && (!wantGang || ns.gang.inGang()) && prevJobTime + 5000 < ns.getTimeSinceLastAug()) {
			prevJobTime = ns.getTimeSinceLastAug();
			let bestFact = getBestFaction();
			if (bestFact != "Nope") {
				ns.singularity.workForFaction(getBestFaction(), "Hacking contracts", false);
				activityText[0] = "Working for " + getBestFaction();
			}
		}
		if (!sin.isBusy() && (!wantGang || ns.gang.inGang())) await doHacking();
	}

	async function copyProgs() {
		for (let serv of getServers(ns)) {
			for (let file of files) {
				await ns.scp(file, serv);
			}
		}
	}

	function startGang() {
		if (wantGang && !ns.isRunning("/gang/thugGang.js", "home") && ns.heart.break() < -54000 && !boughtAug) {
			logA.push("Create gang");
			ns.gang.createGang("Slum Snakes");
			ns.exec("/gang/thugGang.js", "home");
		}
	}

	function getAugs() {
		for (let fact of ns.getPlayer().factions) {
			let augs = ns.singularity.getAugmentationsFromFaction(fact);
			for (let aug of augs) {
				let dontBuy = false;
				let tempArr = Object.keys(ns.singularity.getAugmentationStats(aug));
				for (let text of tempArr) {
					if (text.startsWith("hacknet")) {
						dontBuy = true;
					}
				}

				if (!dontBuy || (!aug.startsWith("NeuroFlux Govern") || boughtAug))
					if (ns.singularity.purchaseAugmentation(fact, aug)) {
						boughtAug = true;
						timer = ns.getTimeSinceLastAug();
						ns.exec("/test/fireworks.js", "home", 1);
					}
			}
		}
		if (wantAugsInstalled) {
			if (boughtAug && timer + timeToWaitForAugs < ns.getTimeSinceLastAug())
				ns.exec("/bn4/restart.js", "home");
			if (boughtAug) logA.push("Restarting in " + Math.floor((timer + timeToWaitForAugs - ns.getTimeSinceLastAug()) / 1000) + "s");
			if (boughtAug && ns.isRunning("/gang/thugGang.js", "home")) ns.kill("/gang/thugGang.js", "home");
			if (boughtAug && ns.isRunning("/lib/purchaseServers.js", "home")) ns.kill("/lib/purchaseServers.js", "home");
		}
	}

	/* 	async function backdoors() {
			for (let server of gangServers) {
				if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
					&& !ns.getServer(server).backdoorInstalled
					&& ns.hasRootAccess(server)
					&& !server.startsWith("perke")) { //PURCHASED SERVER
					connecter(server);
					if (server == "w0r1d_d43m0n") {
						let time = ns.getPlayer().totalPlaytime;
						await ns.write("lastBNend.txt", time, "w");
					}
					ns.print("Installing backdoor on " + server);
					await ns.singularity.installBackdoor();
					break;
				}
			}
		} */

	function buyDarkweb() {
		if (ns.getServerMoneyAvailable("home") > 200000) ns.singularity.purchaseTor();

		let dwProgs = ns.singularity.getDarkwebPrograms();
		for (let prog of dwProgs) {
			if (ns.singularity.getDarkwebProgramCost(prog) < ns.getServerMoneyAvailable("home")) {
				if (!ns.fileExists(prog, "home")) if (ns.singularity.purchaseProgram(prog)) logA.push("Bought " + prog);
			}
		}
	}

	/* 	function faction() {
			for (let server of servers) {
				if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/faction.js")) {
					ns.exec("/bn4/faction.js", server);
					break;
				}
			}
		} */

	/* 	function buyHomeRam() {
			for (let server of servers) {
				if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/buyHomeRam.js")) {
					if (ns.singularity.getUpgradeHomeRamCost() * 2 < ns.getServerMoneyAvailable("home")) {
						ns.exec("/bn4/buyHomeRam.js", server);
						ns.print("Bought homeram");
						return;
					}
				}
			}
		} */

	function murder() {
		for (let server of servers) {
			if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/homicide.js")) {
				if (ns.getPlayer().strength > 74) {
					activityText[0] = "Main is homiciding";
					ns.exec("/bn4/homicide.js", server);
				}
				else {
					ns.exec("/bn4/mug.js", server);
					activityText[0] = "Main is a mug";
				}
				activityText[1] = "Karma: " + (ns.heart.break()).toFixed(2);
				return;
			}
		}
		logA.push("WARN Not enough ram for murder.js");
	}

	async function doHacking() {
		let tempSkill = 0;
		let foundServ = "n00dles";
		for (let serv of getServersWithMoney(ns)) {
			if (ns.getServerRequiredHackingLevel(serv) > tempSkill && ns.hasRootAccess(serv)) {
				tempSkill = ns.getServerRequiredHackingLevel(serv);
				//if (tempSkill <= ns.getHackingLevel()) foundServ = serv;
			}
		}
		connecter(foundServ);
		activityText[0] = "hacking " + foundServ;
		if (ns.hasRootAccess(foundServ)) await ns.singularity.manualHack();
	}

	function connecter(targ) {
		ns.singularity.connect("home");
		let target = targ;
		let paths = { "home": "" };
		let queue = Object.keys(paths);
		let name;
		let pathToTarget = [];
		while ((name = queue.shift())) {
			let path = paths[name];
			let scanRes = ns.scan(name);
			for (let newSv of scanRes) {
				if (paths[newSv] === undefined) {
					queue.push(newSv);
					paths[newSv] = `${path},${newSv}`;
					if (newSv == target)
						pathToTarget = paths[newSv].substr(1).split(",");
				}
			}
		}
		pathToTarget.forEach(server => ns.singularity.connect(server));
	}
}