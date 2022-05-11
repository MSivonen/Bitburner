import { readFromJSON } from "/lib/includes"
import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
//import { killAllButThis } from "/lib/includes.js"
//import { connecter } from "/lib/includes.js"
import { randomInt } from "/lib/includes.js"
import { map } from "/lib/includes.js"
//import { readFromJSON } from "/lib/includes.js"
//import { writeToJSON } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	let target,
		allServers = getServers(ns),
		serversWithRam = getServersWithRam(ns),
		serversWithMoney = getServersWithMoney(ns),
		allHacked = false,
		prevTime = ns.getTimeSinceLastAug(),
		moneyToSteal = 0.25,
		homeCores = 1;//ns.getServer("home").cpuCores;

	const hackFile = "/ver6/hack6.js",
		weakFile = "/ver6/grow6.js",
		growFile = "/ver6/weak6.js",
		allFiles = [weakFile, hackFile, growFile],
		weakRam = ns.getScriptRam(weakFile),
		growRam = ns.getScriptRam(growFile),
		hackRam = ns.getScriptRam(hackFile);

	for (const serv of getServers(ns)) {
		await ns.scp(allFiles, serv);
	}

	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {
		if (prevTime + 1000 < ns.getTimeSinceLastAug()) {
			if (!allHacked) await openPorts2(ns, allServers);
			target = pickTarget();
			await buyServers(2);
			ns.tprint(target);
			printArray(ns, getTarget(target));
			//		await runThreads();
			//		checkRunning();
			//		prevTime = ns.getTimeSinceLastAug();
		}

		//	updateTail();

		await ns.sleep(2500);
	}
	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function getTarget(serv, numCores = 1) {
		const playerObject = ns.getPlayer(),
			serverObject = ns.getServer(serv);

		let newMoney = 0,
			prevThreads,
			minGuess = 1,
			maxGuess = 2,
			foundBiggest = false,
			threads = 1,
			foundThreads = false,
			targetO = {
				name: serv,
				growThreads: 0,
				weak1Threads: 0,
				weak2Threads: 0,
				hackThreads: 0,
				growTime: 0,
				weakTime: 0,
				hackTime: 0
			};

		ns.tprint("ERROR: " + serv);

		serverObject.hackDifficulty = serverObject.minDifficulty;
		serverObject.moneyAvailable = serverObject.moneyMax * (1 - moneyToSteal);
		while (!foundThreads) {
			if (minGuess == maxGuess) foundThreads = true;
			prevThreads = threads; //previous guess
			let serverGrowth = ns.formulas.hacking.growPercent(serverObject, threads, playerObject, numCores);
			newMoney = (serverObject.moneyAvailable + threads) * serverGrowth;
			if (!foundBiggest && newMoney < serverObject.moneyMax) maxGuess *= 16; else foundBiggest = true; //first find a too big number
			if (newMoney >= serverObject.moneyMax) { //if too much threads, set maxGuess to this and lower the guess
				maxGuess = threads;
				threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
			} else {//if not enough threads, set minGuess to this and raise the guess
				minGuess = threads;
				threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
			}
			minGuess = minGuess + 1 == maxGuess ? maxGuess : minGuess; //offset 1 to make it work
		}

		targetO.growThreads = Math.ceil(threads);
		targetO.growTime = Math.ceil(ns.formulas.hacking.growTime(serverObject, playerObject));

		targetO.hackThreads = Math.floor(
			moneyToSteal / ns.formulas.hacking.hackPercent(serverObject, playerObject) /
			ns.formulas.hacking.hackChance(serverObject, playerObject));
		targetO.hackTime = Math.ceil(ns.getHackTime(serv));

		targetO.weak1Threads = Math.ceil(ns.hackAnalyzeSecurity(targetO.hackThreads, serv) / ns.weakenAnalyze(1, numCores));
		targetO.weak2Threads = Math.ceil(ns.growthAnalyzeSecurity(targetO.growThreads, serv, numCores) / ns.weakenAnalyze(1, numCores));
		targetO.weakTime = Math.ceil(ns.formulas.hacking.weakenTime(serverObject, playerObject));

		return targetO;
	}

	/**@param moneyToSpend {number} 2 = use 1/2 of money, 4 = use 1/4 of money etc... ROUNDED UP, up to 2/2, 2/4 etc*/
	async function buyServers(moneyToSpend = 2, maxRam = ns.getPurchasedServerMaxRam()) {
		const maxServers = ns.getPurchasedServerLimit();
		let ram = 4; //min ram to have
		let buy = false;

		if (ns.serverExists("perkele0")) {
			ram = ns.getServerMaxRam("perkele0") * 2, ram; //set ram to current ram
		}

		while (ram < maxRam && ns.getServerMoneyAvailable("home") / moneyToSpend > ns.getPurchasedServerCost(ram) * maxServers) {
			ram *= 2; //increase ram until happy
			buy = true;
		}

		if (!buy) return; //don't buy potatoes

		for (const serv of ns.getPurchasedServers()) { //delete servers
			ns.killall(serv);
			ns.deleteServer(serv);
		}

		let bought = 0;
		for (let i = 0; i < maxServers; i++) { //buy new servers
			if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) { //double check money, if some other script joinks some of it while this is running
				ns.purchaseServer("perkele" + i, ram);
				bought++;
				await ns.scp(allFiles, "perkele" + i); //copy files to new servers
			}
		}
		let moneyTXT = ns.nFormat(ns.getPurchasedServerCost(ram) * maxServers, "0a");
		ns.tprint("Purchased " + bought + " servers with " + ram + "GB RAM for " + moneyTXT + " moneys total.");
		if (bought < maxServers) ns.alert("Not enough money to buy all servers. MaxServers = " + maxServers + ", bought " + bought + " servers.");
		moneyTXT = ns.nFormat(ns.getPurchasedServerCost(ram) * maxServers * 2, "0a");
		ns.tprint("Next servers will cost " + moneyTXT + " moneys total.");
	}

	function pickTarget() {//find the highest level target with hacking level at most half of player's hacking level
		let targ = {
			name: "n00dles",
			level: 1
		}
		for (const serv of serversWithMoney) {
			if (ns.getServerRequiredHackingLevel(serv) < ns.getHackingLevel() / 2
				&& ns.getServerRequiredHackingLevel(serv) > targ.level) {
				targ.name = serv;
				targ.level = ns.getServerRequiredHackingLevel(serv);
			}
		}
		return (targ.name);
		//todo: add checks for minsec and servers with same req hack lvl
	}

	/** @param {import("../.").NS} ns */
	async function openPorts2(ns, servers) {
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
}