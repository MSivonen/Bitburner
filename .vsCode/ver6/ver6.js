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
	ns.clearLog();
	let target,
		targetsA = [],
		prevTarget,
		allServers = getServers(ns),
		serversWithRam = getServersWithRam(ns),
		serversWithMoney = getServersWithMoney(ns),
		allHacked = false,
		prevTime = ns.getTimeSinceLastAug(),
		moneyToSteal = 0.05,
		homeCores = 1,//ns.getServer("home").cpuCores;
		serversOA = [],
		initQRunningOA = [],
		batchDebug = false,
		numberOfTargets = 1,
		logA = [],
		logTargetOA = [],
		logServersA = [];

	const hackFile = "/ver6/hack6.js",
		growFile = "/ver6/grow6.js",
		weakFile = "/ver6/weak6.js",
		allFiles = [weakFile, hackFile, growFile],
		weakRam = ns.getScriptRam(weakFile),
		growRam = ns.getScriptRam(growFile),
		hackRam = ns.getScriptRam(hackFile),
		batchInterval = 100,
		shareServers = ns.gang.inGang() ? 7 : 0,
		ramNeededForMoreTargets = 10000,
		maxTargets = 5,
		saveMoneyAfterPserv = 3;

	for (let i = 0; i < 100; i++) {
		logTargetOA.push(
			{ name: "No target", state: "doing nothing" })
	}

	for (const serv of getServers(ns)) {
		await ns.scp(allFiles, serv);
	}


	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {
		if (prevTime + 1000 < ns.getTimeSinceLastAug()) {
			updateServers();
			await buyServers(saveMoneyAfterPserv);
			if (!allHacked) await openPorts2(ns, allServers);
			targetsA = [];
			const totalRam = serversOA.reduce((total, serv) => total + serv.maxRam, 0);
			numberOfTargets = Math.min(maxTargets, Math.ceil(totalRam / ramNeededForMoreTargets));
			moneyToSteal = totalRam > 6000 ? 0.1 : 0.05;
			logServersA[0] = "Total ram in servers: " + ns.nFormat(serversOA.reduce((total, serv) => total + serv.freeRam, 0) * 1e9, "0.0b") + "/" + ns.nFormat(totalRam * 1e9, "0.0b");
			for (let i = 0; i < numberOfTargets; i++) {
				target = totalRam < ramNeededForMoreTargets ? "n00dles" : pickTarget(targetsA);
				logTargetOA[i].name = target;
				// if (target != prevTarget) {
				// 	//kill all hwg scripts							TODO
				// 	ns.tprint("WARN Switched target to " + target);
				// }
				if (prevTarget != target || numberOfTargets == 1) {
					if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) ||
						ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
						initializeTarget(target);
						logTargetOA[i].state = "Initialising, " + ns.nFormat(ns.getServerMoneyAvailable(target), "0.0a") + "/" + ns.nFormat(ns.getServerMaxMoney(target), "0.0a");
					}
					else {
						await badger(target);
						logTargetOA[i].state = "Batching";
					}
					targetsA.push(target);
				}
				prevTarget = target;
			}
		}
		//ns.tprint("ERROR targetsA: " + targetsA);
		updateTail();
		await ns.sleep(500);
	}
	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function updateTail() {
		ns.clearLog();
		if (logA.length > 15) logA.splice(0, 1);
		if (logServersA.length > 5) logServersA.splice(0, 1);
		logServersA[3] = "Money to steal: " + moneyToSteal * 100 + "%";

		ns.print("=============MAIN===============")
		ns.print("");
		ns.print("");
		ns.print("=============Servers============")
		for (let i = 0; i < 5; i++) {
			if (logServersA[i]) ns.print(logServersA[i]);
			else ns.print("");
		}
		ns.print("Sharing for faction rep: " + logServersA[3]);
		ns.print("=============TARGETS============")
		for (let i = 0; i < numberOfTargets; i++) {
			ns.print(logTargetOA[i].name + ": " + logTargetOA[i].state);
		}
		ns.print("=============LOG================")
		for (let i = 0; i < 15; i++) {
			if (logA[i]) ns.print(logA[i]);
			else ns.print("");
		}
	}

	function updateServers() {
		serversOA = [];
		for (const serv of getServersWithRam(ns)) {
			if (ns.hasRootAccess(serv)) {
				serversOA.push({
					name: serv,
					maxRam: ns.getServerMaxRam(serv),
					freeRam: ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)
				})
				if (serv == "home") serversOA.freeRam -= 24;
			}
		}
		let moneyTXT;
		let tempGB;
		try {
			tempGB = ns.getServerMaxRam("perkele0")
			moneyTXT = ns.nFormat(ns.getPurchasedServerCost(tempGB * 2) * ns.getPurchasedServerLimit(), "0.00a");
			tempGB = ns.nFormat(tempGB * 1e9, "0b");
			logServersA[1] = ns.getPurchasedServers().length + " personal servers: " + tempGB;
			logServersA[2] = "Next servers: " + moneyTXT + " moneys total.";
		}
		catch {
			moneyTXT = 0
			logServersA[1] = "No servers purchased";
			logServersA[2] = "";
		}
		logServersA[3] = 0;
		for (let i = serversOA.length - 1; i >= 0; i--) {
			if (ns.isRunning("/lib/share.js", serversOA[i].name))
				logServersA[3]++;
			serversOA.splice[i];
		}

		objectArraySort(ns, serversOA, "freeRam", "big");
	}

	function initializeTarget(targ) {
		for (let i = initQRunningOA.length - 1; i >= 0; i--) {
			if (initQRunningOA.length > 0) {
				if (initQRunningOA[i].endTime < ns.getTimeSinceLastAug()) {
					initQRunningOA.splice(i, 1);
					continue;
				}
				if (initQRunningOA[i].name == targ) return;
			}
		}


		for (let i = 0; i < serversOA.length; i++) {
			let didntFit = false;

			objectArraySort(ns, serversOA, "freeRam", "big");

			let maxMoney = ns.getServerMaxMoney(targ),
				currentMoney = ns.getServerMoneyAvailable(targ),
				minSec = ns.getServerMinSecurityLevel(targ),
				growThreads = Math.ceil(ns.growthAnalyze(targ, maxMoney / currentMoney) * 1.2),
				secu = ns.getServerSecurityLevel(targ) + ns.growthAnalyzeSecurity(growThreads, targ, 1) * 1.2,
				weakThreads = Math.ceil((secu - minSec) / ns.weakenAnalyze(1));

			if (!growThreads && !weakThreads) {
				logA.push("WARN Server " + targ + " already güüd.");
				return;
			}

			while (growThreads * growRam > serversOA[0].freeRam) { //if it doesn't fit on biggest server
				growThreads--;
				didntFit = true;
				if (growThreads == 0) {
					logA.push("ERROR Not enough ram to init server " + targ);
					return;
				}
			}
			if (growThreads) ns.exec(growFile, serversOA[0].name, growThreads, targ, 1);
			//ns.tprint("Init growing " + targ + ", threads: " + growThreads + " hacserver: " + serversOA[0].name);
			serversOA[0].freeRam -= growThreads * growRam;

			objectArraySort(ns, serversOA, "freeRam", "big");

			while (weakThreads * weakRam > serversOA[0].freeRam) { //if it doesn't fit on biggest server
				weakThreads--;
				didntFit = true;
				if (weakThreads == 0) {
					logA.push("ERROR Not enough ram to init server " + targ);
					return;
				}
			}
			if (weakThreads) ns.exec(weakFile, serversOA[0].name, weakThreads, targ, 1);
			//ns.tprint("Init weaking " + targ + ", threads: " + weakThreads + " time: " + ns.getWeakenTime(targ));

			initQRunningOA.push({ name: targ, endTime: ns.getWeakenTime(targ) + ns.getTimeSinceLastAug() });
			if (!didntFit) return;
		}
	}

	async function badger(targ) {
		let targetO = await getTargetObject(targ);
		let totalScriptRam = targetO.weak1Threads * weakRam
			+ targetO.weak2Threads * weakRam
			+ targetO.growThreads * growRam
			+ targetO.hackThreads * hackRam;
		//objectArraySort(serversOA, "freeRam", "big");
		updateServers();
		let totalServerRam = serversOA.reduce((total, serv) => total + serv.maxRam, 0);
		let freeServerRam = serversOA.reduce((total, serv) => total + serv.freeRam, 0);
		if (totalServerRam * .8 < totalScriptRam) {
			ns.alert("Not enough ram to run batch.\nMake a function to reduce target to shittier one.\nRam needed: " + totalScriptRam + ", you have: " + totalServerRam);
			ns.exit();
		}

		if (freeServerRam < totalScriptRam) return;

		//args=target, sleep, random, scriptTime, batcInterval, debug on
		if (targetO.weak1Threads * weakRam < serversOA[0].freeRam) {
			ns.exec(weakFile, serversOA[0].name, targetO.weak1Threads, targetO.name, 0, Math.random(), targetO.weakTime, batchInterval, batchDebug);
		} else logA.push("out of ram to run weak1! " + Math.ceil(targetO.weak1Threads * weakRam) + " needed, " + Math.floor(serversOA[0].freeRam) + " free");
		updateServers();
		//objectArraySort(serversOA, "freeRam", "big");
		if (targetO.weak2Threads * weakRam < serversOA[0].freeRam) {
			ns.exec(weakFile, serversOA[0].name, targetO.weak2Threads, targetO.name, batchInterval * 2, Math.random(), targetO.weakTime, batchInterval, batchDebug);
		} else logA.push("out of ram to run weak2! " + Math.ceil(targetO.weak2Threads * weakRam) + " needed, " + Math.floor(serversOA[0].freeRam) + " free");
		//objectArraySort(serversOA, "freeRam", "big");
		updateServers();
		if (targetO.growThreads * growRam < serversOA[0].freeRam) {
			ns.exec(growFile, serversOA[0].name, targetO.growThreads, targetO.name, targetO.weakTime - targetO.growTime + batchInterval, Math.random(), targetO.growTime, batchInterval, batchDebug);
		} else logA.push("out of ram to run grow! " + Math.ceil(targetO.growThreads * growRam) + " needed, " + Math.floor(serversOA[0].freeRam) + " free");
		//objectArraySort(serversOA, "freeRam", "big");
		updateServers();
		if (targetO.hackThreads * hackRam < serversOA[0].freeRam) {
			ns.exec(hackFile, serversOA[0].name, targetO.hackThreads, targetO.name, targetO.weakTime - targetO.hackTime - batchInterval, Math.random(), targetO.hackTime, batchInterval, batchDebug);
		} else logA.push("out of ram to run hack! " + Math.ceil(targetO.hackThreads * hackRam) + " needed, " + Math.floor(serversOA[0].freeRam) + " free");
		/* 		
		todo:
		V-check total ram vs total scripts ram
			V-If the whole shit doesn't fit, and no batches are running, reduce moneyToSteal or target
			X-check biggest serversWithRam, if all runs fit there
				V-if not, if biggest script fits?
				-if not, reduce threads until it fits
				V-shove the next biggest script to next biggest serv, etc
					XV-if all fits somewhere, run them with delays as args
						if something didn't fit somewhere, reduce moneyToSteal and try again */
	}

	async function getTargetObject(targetServ, numCores = 1) {
		const playerObject = ns.getPlayer(),
			serverObject = ns.getServer(targetServ);

		let newMoney = 0,
			prevThreads,
			minGuess = 1,
			maxGuess = 2,
			foundBiggest = false,
			threads = 1,
			foundThreads = false,
			targetO = {
				name: targetServ,
				growThreads: 0,
				weak1Threads: 0,
				weak2Threads: 0,
				hackThreads: 0,
				growTime: 0,
				weakTime: 0,
				hackTime: 0,
			};

		//ns.tprint("ERROR: " + targetServ);

		serverObject.hackDifficulty = serverObject.minDifficulty;
		serverObject.moneyAvailable = serverObject.moneyMax * (1 - moneyToSteal);
		while (!foundThreads) { //binary search for number of growThreads
			if (minGuess == maxGuess) foundThreads = true;
			if (minGuess + 1 == maxGuess) foundThreads = true;
			prevThreads = threads; //previous guess
			let serverGrowth = ns.formulas.hacking.growPercent(serverObject, threads, playerObject, numCores);
			newMoney = (serverObject.moneyAvailable + threads) * serverGrowth;
			if (!foundBiggest && newMoney < serverObject.moneyMax) maxGuess *= 16; else foundBiggest = true; //first find a too big number
			if (newMoney >= serverObject.moneyMax) { //if too much threads, set maxGuess to this and lower the guess
				maxGuess = threads;
				threads = Math.floor(minGuess + (maxGuess - minGuess) / 2);
			} else {//if not enough threads, set minGuess to this and raise the guess
				minGuess = threads;
				threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
				threads++;
			}
		}


		targetO.growThreads = Math.max(2, Math.ceil(threads * 1.2));
		targetO.growTime = Math.ceil(ns.formulas.hacking.growTime(serverObject, playerObject));

		targetO.hackThreads = Math.max(1, Math.floor(
			moneyToSteal / ns.formulas.hacking.hackPercent(serverObject, playerObject) /
			ns.formulas.hacking.hackChance(serverObject, playerObject)));
		targetO.hackTime = Math.ceil(ns.formulas.hacking.hackTime(serverObject, playerObject));

		targetO.weak1Threads = Math.max(2, Math.ceil(
			ns.hackAnalyzeSecurity(targetO.hackThreads * 1.2, targetServ)
			/ ns.weakenAnalyze(1, numCores)
		));

		targetO.weak2Threads = Math.max(2, Math.ceil(
			(serverObject.hackDifficulty + (targetO.growThreads * 0.004)) / 0.05));

		// targetO.weak2Threads = Math.max(1, Math.ceil(
		// 	ns.growthAnalyzeSecurity(targetO.growThreads, targetServ, numCores)
		// 	/ ns.weakenAnalyze(1, numCores)));
		targetO.weakTime = Math.ceil(ns.formulas.hacking.weakenTime(serverObject, playerObject));

		return targetO;
	}

	/**@param moneyToSpend {number} 2 = use 1/2 of money, 4 = use 1/4 of money etc... ROUNDED UP, up to 2/2, 2/4 etc*/
	async function buyServers(moneyToSpend = 2, maxRam = ns.getPurchasedServerMaxRam()) {
		const maxServers = ns.getPurchasedServerLimit();
		let ram = 4; //min ram to have
		let buy = false;

		if (ns.serverExists("perkele0")) {
			if (maxRam <= ns.getServerMaxRam("perkele0")) return;
			ram = ns.getServerMaxRam("perkele0") * 2, ram; //set ram to current ram
		}
		while (ram < maxRam && ns.getServerMoneyAvailable("home") / moneyToSpend > ns.getPurchasedServerCost(ram) * maxServers) {
			ram *= 2; //increase ram until happy
			buy = true;
			await ns.sleep(1);
		}

		if (buy) { //don't buy potatoes
			if (ram > maxRam) return;
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
			logA.push("Purchased " + bought + " servers");
		}

		updateServers();

		for (let i = serversOA.length - 1; i >= 0; i--) {
			try {
				const [fullMatch, serverNumber] = serversOA[i].name.match(/perkele(\d+)/);
				if (Number(serverNumber) < shareServers) {
					if (!ns.fileExists("/lib/share.js", serversOA[i].name)) await ns.scp("/lib/share.js", serversOA[i].name);
					if (!ns.isRunning("/lib/share.js", serversOA[i].name)) {
						let threads = Math.floor(ns.getServerMaxRam(serversOA[i].name) / ns.getScriptRam("/lib/share.js", serversOA[i].name));
						if (threads) ns.exec("/lib/share.js", serversOA[i].name, threads);
						serversOA.splice[i];
					}
				}
			}
			catch { }
		}
	}

	function pickTarget(exclude = []) {//find the highest level target with hacking level at most half of player's hacking level
		let targ = {
			name: "n00dles",
			level: 1
		}
		for (const serv of serversWithMoney) {
			if (ns.getServerRequiredHackingLevel(serv) < ns.getHackingLevel() / 2
				&& ns.getServerRequiredHackingLevel(serv) > targ.level
				&& !exclude.includes(serv)
				&& ns.hasRootAccess(serv)) {
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