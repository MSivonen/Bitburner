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
		prevTarget,
		allServers = getServers(ns),
		serversWithRam = getServersWithRam(ns),
		serversWithMoney = getServersWithMoney(ns),
		allHacked = false,
		prevTime = ns.getTimeSinceLastAug(),
		moneyToSteal = 0.5,
		homeCores = 1,//ns.getServer("home").cpuCores;
		serversOA = [],
		initQRunningOA = [],
		batchDebug = false;

	const hackFile = "/ver6/hack6.js",
		growFile = "/ver6/grow6.js",
		weakFile = "/ver6/weak6.js",
		allFiles = [weakFile, hackFile, growFile],
		weakRam = ns.getScriptRam(weakFile),
		growRam = ns.getScriptRam(growFile),
		hackRam = ns.getScriptRam(hackFile),
		batchInterval = 100,
		shareServers = 7;


	for (const serv of getServers(ns)) {
		await ns.scp(allFiles, serv);
	}



	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {
		if (prevTime + 1000 < ns.getTimeSinceLastAug()) {
			await buyServers(3);
			if (!allHacked) await openPorts2(ns, allServers);
			target = pickTarget();
			if (target != prevTarget) {
				//kill all hwg scripts							TODO
				ns.tprint("WARN Switched target to " + target);
			}
			prevTarget = target;
			if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) ||
				ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target))
				initializeTarget(target);
			else badger(target);
			//share
		}

		//	updateTail();

		await ns.sleep(400);
	}
	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function updateServers() {
		serversOA = [];
		for (const serv of serversWithRam) {
			if (ns.hasRootAccess(serv)) {
				serversOA.push({
					name: serv,
					maxRam: ns.getServerMaxRam(serv),
					freeRam: ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)
				})
			}
		}

		for (let i = serversOA.length - 1; i >= 0; i--) {
			try {
				const [fullMatch, serverNumber] = serversOA[i].name.match(/perkele(\d+)/);
				if (Number(serverNumber) < shareServers)
					serversOA.splice[i];
			}
			catch { }
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
		ns.print("ERROR Running init: " + targ + ". Money: " + ns.nFormat(ns.getServerMoneyAvailable(targ), "0a") + "/" + ns.nFormat(ns.getServerMaxMoney(targ), "0a"));

		updateServers(); //get servers and sort them by freeram, biggest first

		let maxMoney = ns.getServerMaxMoney(targ),
			currentMoney = ns.getServerMoneyAvailable(targ),
			minSec = ns.getServerMinSecurityLevel(targ),
			growThreads = Math.ceil(ns.growthAnalyze(targ, maxMoney / currentMoney)),
			secu = ns.getServerSecurityLevel(targ) + ns.growthAnalyzeSecurity(growThreads, targ, 1),
			weakThreads = Math.ceil((secu - minSec) / ns.weakenAnalyze(1));

		if (!growThreads && !weakThreads) {
			ns.tprint("WARN Server " + targ + " already güüd.");
			return;
		}

		while (growThreads * growRam > serversOA[0].freeRam) //if it doesn't fit on biggest server
			growThreads--;
		if (growThreads) {
			ns.exec(growFile, serversOA[0].name, growThreads, targ, 1);
			//ns.tprint("Init growing " + targ + ", threads: " + growThreads + " hacserver: " + serversOA[0].name);
			serversOA[0].freeRam -= growThreads * growRam;
		}

		objectArraySort(ns, serversOA, "freeRam", "big");

		while (weakThreads * weakRam > serversOA[0].freeRam) //if it doesn't fit on biggest server
			weakThreads--;
		if (weakThreads) {
			ns.exec(weakFile, serversOA[0].name, weakThreads, targ, 1);
			//ns.tprint("Init weaking " + targ + ", threads: " + weakThreads + " time: " + ns.getWeakenTime(targ));
		}

		if (growThreads || weakThreads)
			initQRunningOA.push({ name: targ, endTime: ns.getWeakenTime(targ) + ns.getTimeSinceLastAug() });
		else ns.tprint("ERROR Not enough ram to init server " + targ);
	}

	function badger(targ) {
		let targetO = getTargetObject(targ);
		let totalScriptRam = targetO.weak1Threads * weakRam
			+ targetO.weak2Threads * weakRam
			+ targetO.growThreads * growRam
			+ targetO.hackThreads * hackRam;
		updateServers();
		let totalServerRam = serversOA.reduce((total, serv) => total + serv.maxRam, 0);
		let freeServerRam = serversOA.reduce((total, serv) => total + serv.freeRam, 0);
		if (totalServerRam * .8 < totalScriptRam) {
			ns.alert("Not enough ram to run batch.\nMake a function to reduce target to shittier one.\nRam needed: " + totalScriptRam + ", you have: " + totalServerRam);
			ns.exit();
		}

		if (freeServerRam < totalScriptRam) return;

		ns.print("Running batch: " + targ);

		//args=target, sleep, random, scriptTime, batcInterval, debug on
		if (targetO.weak1Threads < serversOA[0].freeRam) {
			ns.exec(weakFile, serversOA[0].name, targetO.weak1Threads, targetO.name, 0, Math.random(), targetO.weakTime, batchInterval, batchDebug);
			serversOA[0].freeRam -= targetO.weak1Threads * weakRam;
		} else ns.tprint("ERROR out of ram trying to run weak1!");
		updateServers();
		if (targetO.weak2Threads < serversOA[0].freeRam) {
			ns.exec(weakFile, serversOA[0].name, targetO.weak2Threads, targetO.name, batchInterval * 2, Math.random(), targetO.weakTime, batchInterval, batchDebug);
			serversOA[0].freeRam -= targetO.weak2Threads * weakRam;
		} else ns.tprint("ERROR out of ram trying to run weak2!");
		updateServers();
		if (targetO.growThreads < serversOA[0].freeRam) {
			ns.exec(growFile, serversOA[0].name, targetO.growThreads, targetO.name, targetO.weakTime - targetO.growTime + batchInterval, Math.random(), targetO.growTime, batchInterval, batchDebug);
			serversOA[0].freeRam -= targetO.growThreads * growRam;
		} else ns.tprint("ERROR out of ram trying to run grow!");
		updateServers();
		if (targetO.hackThreads < serversOA[0].freeRam) {
			ns.exec(hackFile, serversOA[0].name, targetO.hackThreads, targetO.name, targetO.weakTime - targetO.hackTime - batchInterval, Math.random(), targetO.hackTime, batchInterval, batchDebug);
			serversOA[0].freeRam -= targetO.hackThreads * hackRam;
		} else ns.tprint("ERROR out of ram trying to run hack!");
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

	function getTargetObject(targetServ, numCores = 1) {
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
			prevThreads = threads; //previous guess
			let serverGrowth = ns.formulas.hacking.growPercent(serverObject, threads, playerObject, numCores);
			newMoney = (serverObject.moneyAvailable + threads) * serverGrowth;
			if (!foundBiggest && newMoney < serverObject.moneyMax) maxGuess *= 16; else foundBiggest = true; //first find a too big number
			if (newMoney >= serverObject.moneyMax) { //if too much threads, set maxGuess to this and lower the guess
				maxGuess = threads - 1;
				threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
			} else {//if not enough threads, set minGuess to this and raise the guess
				minGuess = threads + 1;
				threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
			}
		}


		targetO.growThreads = Math.max(1, Math.ceil(threads));
		targetO.growTime = Math.ceil(ns.formulas.hacking.growTime(serverObject, playerObject));

		targetO.hackThreads = Math.max(1, Math.floor(
			moneyToSteal / ns.formulas.hacking.hackPercent(serverObject, playerObject) /
			ns.formulas.hacking.hackChance(serverObject, playerObject)));
		targetO.hackTime = Math.ceil(ns.formulas.hacking.hackTime(serverObject, playerObject));

		targetO.weak1Threads = Math.max(1, Math.ceil(
			ns.hackAnalyzeSecurity(targetO.hackThreads, targetServ)
			/ ns.weakenAnalyze(1, numCores)));

		targetO.weak2Threads = Math.max(1, Math.ceil(
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
			ram = ns.getServerMaxRam("perkele0") * 2, ram; //set ram to current ram
		}

		while (ram < maxRam && ns.getServerMoneyAvailable("home") / moneyToSpend > ns.getPurchasedServerCost(ram) * maxServers) {
			ram *= 2; //increase ram until happy
			buy = true;
		}

		if (buy) { //don't buy potatoes

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

		updateServers();

		for (let i = serversOA.length - 1; i >= 0; i--) {
			try {
				const [fullMatch, serverNumber] = serversOA[i].name.match(/perkele(\d+)/);
				if (Number(serverNumber) < shareServers)
					if (!ns.fileExists("/lib/share.js", serversOA[i].name)) await ns.scp("/lib/share.js", serversOA[i].name);
				if (!ns.isRunning("/lib/share.js", serversOA[i].name)) {
					let threads = Math.floor(ns.getServerMaxRam(serversOA[i].name) / ns.getScriptRam("/lib/share.js", serversOA[i].name));
					if (threads) ns.exec("/lib/share.js", serversOA[i].name, threads);
					serversOA.splice[i];
				}
			}
			catch { }
		}
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