//Created: 09.05.2022 07:33:47
//Last modified: 19.10.2022 19:21:01

/*import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
	from "lib/includes.js"*/

export const col = {
	"r": "\x1b[31m",
	"g": "\x1b[32m",
	"b": "\x1b[34m",
	"c": "\x1b[36m",
	"m": "\x1b[35m",
	"y": "\x1b[33m",
	"bk": "\x1b[30m",
	"w": "\x1b[37m",
	"off": "\x1b[0m",
	"bold": "\x1b[1m",
	"underline": "\x1b[4m"
}

export function getBestFaction(ns, excluded = ["Church of the Machine God"], wantHackNet = true, firstRun = false) {	//find the aug that needs the least rep to get
	if (firstRun) {
		if (ns.getPlayer().factions.includes("NiteSec") &&
			!ns.singularity.getAugmentationsFromFaction("NiteSec").every(e => {
				return ns.singularity.getOwnedAugmentations(true).includes(e); //player doesn't have them all
			})) {
			const augs = ns.singularity.getAugmentationsFromFaction("NiteSec").filter(e => {
				return !ns.singularity.getOwnedAugmentations(true).includes(e);
			});
			if (augs.length != 0)
				if (ns.singularity.getAugmentationRepReq(augs[augs.length - 1]) > ns.singularity.getFactionRep("NiteSec"))
					return ({ faction: "NiteSec", aug: augs.pop() });
		}
	}
	const gangFact = ns.gang.inGang() ? ns.gang.getGangInformation().faction : null;
	let bestAugOfEachFaction = [];
	let wantedAugs = [
		"company_rep",
		"faction_rep",
		"hacki"
	];
	const gangAugs = [
		"strength",
		"defense",
		"dexterity",
		"agility"
	],
		hackNetAugs = [
			"hacknet"
		];

	if (!ns.gang.inGang()) wantedAugs.push(...gangAugs);
	if (wantHackNet) wantedAugs.push(...hackNetAugs);
	for (let fact of ns.getPlayer().factions) {
		if (fact == gangFact || excluded.includes(fact)) continue;
		let bestAug = {
			repNeeded: 99e99
		}
		let augs = ns.singularity.getAugmentationsFromFaction(fact);

		//if (ns.sleeve.getInformation(i).jobs)
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

			for (let augStat of Object.keys(ns.singularity.getAugmentationStats(aug))) {
				for (const want of wantedAugs)
					if (augStat.startsWith(want))
						if (ns.singularity.getAugmentationStats(aug)[augStat] > 1)
							thisAug.dontBuy = false;
			}


			/*	for (let text of Object.keys(ns.singularity.getAugmentationStats(aug))) {//get aug stat names
					for (let want of wantedAugs) {
						if (text.startsWith(want)) {
							thisAug.dontBuy = false;
						}
					}
				}*/
			if (thisAug.name == "Neuroreceptor Management Implant"
				|| thisAug.name == "The Red Pill"
				|| thisAug.name == "CashRoot Starter Kit") thisAug.dontBuy = false;
			if (thisAug.name.startsWith("Neuroflux")) thisAug.dontBuy = true;
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
	return ({ faction: bestOfBest.faction, aug: bestOfBest.name }); //return faction name and aug name
}

export async function openPorts2(ns, servers) {
	let hacked = 0;
	let progs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe", "dsfsd"];
	const ownedProgs = progs.filter((x) => ns.fileExists(x));
	for (const serv of servers) {
		for (const prog of ownedProgs) {
			switch (prog) {
				case "brutessh.exe":
					ns.brutessh(serv);
					break;
				case "ftpcrack.exe":
					ns.ftpcrack(serv);
					break;
				case "relaysmtp.exe":
					ns.relaysmtp(serv);
					break;
				case "httpworm.exe":
					ns.httpworm(serv);
					break;
				case "sqlinject.exe":
					ns.sqlinject(serv);
					break;
			}
		}
		if (ns.getServerNumPortsRequired(serv) <= ownedProgs.length) {
			ns.nuke(serv);
			hacked++;
		}
	}
	if (hacked == servers.length) allHacked = true;
}

/** @param {import('../.').NS} ns */
export function readFromJSON(ns, filename = "/test/jsontest.txt") {
	ns.scp(filename, ns.getServer().hostname, "home")
	return JSON.parse(ns.read(filename));
}

/** @param {import('../.').NS} ns */
export function writeToJSON(ns, jsonObject, filename = "/test/jsontest.txt") {
	ns.write(filename, JSON.stringify(jsonObject), "w");
	ns.scp(filename, "home");
}

/**Map input value to output range. 
 * @example map(5, 0, 10, 0, 100) -> outputs 50*/
export function map(number, inMin, inMax, outMin, outMax) {
	return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**Random int between minVal and maxVal
 * @param minVal {number} minimum value 
 * @param maxVal {number} maximum value */
export function randomInt(minVal = 0, maxVal) {
	if (!maxVal) { maxVal = minVal; minVal = 0; }
	return minVal + Math.floor((Math.random()) * (maxVal + .9999 - minVal));
}

export function connecter(ns, targ) {
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

export function printArray(ns, thisArray, log = "terminal") {
	let printFunc = ns.tprint;
	if (log == "tail") printFunc = ns.print;

	if (typeof thisArray == "number") {
		printFunc("\x1b[38;5;79mPrintArray printing a number: " + thisArray);
	} else if (typeof thisArray == "string") {
		printFunc("\x1b[38;5;79mPrintArray printing a string: " + thisArray);
	} else if (typeof thisArray !== 'object') {
		printFunc("\x1b[35mPrintArray tried to print undefined or something:\n\x1b[41m" + (new Error().stack));
	} else if (thisArray[Symbol.iterator]) {
		for (const value of thisArray) {
			printFunc(value);
		}
	} else {
		for (const [key, value] of Object.entries(thisArray)) {
			printFunc(`${key}: ${value}`);
		}
	}
}

export function killAllButThis(ns) {
	var servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (servers[i] != "home") ns.killall(servers[i]);
	}
	let notThis = ns.ps("home");
	for (let i = notThis.length - 1; i >= 0; i--) {

		if (ns.getRunningScript().filename != notThis[i].filename) {
			ns.tprint(notThis[i]);
			ns.kill(notThis[i].filename, ns.getHostname(), ...notThis[i].args);
		}
	}
}

export function openPorts(ns, openPortsServers, files = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"]) {
	for (let serv of openPortsServers) {
		ns.exec("/lib/ports.js", "home", 1, serv, ...files);
	}
}

/**Sort array of objects by some value
 * @param thisArray {array} array name
 * @param value {string} object's value to sort by
 * @param big {"big"|"small"} biggest or smallest first
 * @example objectArraySort(serversObjectArray, "freeRam", "big|small");
 */
export function objectArraySort(ns, thisArray, value, big) { 
	if (big == "big") thisArray.sort((c1, c2) => (c1[value] < c2[value]) ? 1 : (c1[value] > c2[value]) ? -1 : 0);//biggest first
	if (big == "small") thisArray.sort((c1, c2) => (c1[value] > c2[value]) ? 1 : (c1[value] < c2[value]) ? -1 : 0);//smallest first
}

/** @param {NS} ns @param seconds @return HH:MM:SS*/
export function secondsToHMS(ns, s) {
	return ns.nFormat(s, '00:00:00');
}

export const getServers = (ns, a = new Set(["home"])) => {
	a.forEach(s => ns.scan(s).map(s => a.add(s)));
	return [...a];
};

/**@param {NS} ns @return {array} Array with server names that have more than 3GB of ram */
export const getServersWithRam = (ns, ram = 3) => getServers(ns).filter(a => ns.getServerMaxRam(a) >= ram);


/** @param {NS} ns @return {array} Array with server names that have money*/
export function getServersWithMoney(ns, targetArray = []) {
	let servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (ns.getServerMaxMoney(servers[i]) > 1000 && servers[i] != "home" && servers[i] != "fulcrumassets") {
			targetArray.push(servers[i]);
		}
	}
	return targetArray;
}