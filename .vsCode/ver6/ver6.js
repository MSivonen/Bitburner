import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
	from "/lib/includes.js"




/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {

	let doc = eval("document");
	ns.tail();
	const tailElement = [...doc.querySelectorAll(".react-draggable")].pop();
	tailElement.style.left = "1200px";
	tailElement.style.top = "10px";
	let tailElement2 = tailElement.firstChild;
	tailElement2.style.width = "430px"; //default 500px
	tailElement2.style.height = "500px"; //default 500px


	const
		maxTargets = 15,
		saveMoneyAfterPserv = 3,
		ramNeededForMoreTargets = 10000,
		batchInterval = 150,
		shareServers = ns.gang.inGang() ? 7 : 0,
		useHashes = true;


	ns.disableLog("ALL");
	ns.clearLog();

	let
		singleTarget = "phantasy",
		hackSingleTarget = false,
		target,
		targetsA = [],
		prevTarget,
		allServers = getServers(ns),
		serversWithRam = getServersWithRam(ns),
		serversWithMoney = getServersWithMoney(ns),
		allHacked = false,
		prevTime = ns.getTimeSinceLastAug(),
		moneyToSteal = 0.05,
		homeCores = ns.getServer("home").cpuCores,
		serversOA = [],
		initQRunningOA = [],
		batchDebug = false,
		numberOfTargets = 1,
		logA = [],
		logTargetOA = [],
		logServersA = [],
		firstRun = ns.getTimeSinceLastAug() == ns.getPlayer().playtimeSinceLastBitnode ? true : false;

	const hackFile = "/ver6/hack6.js",
		growFile = "/ver6/grow6.js",
		weakFile = "/ver6/weak6.js",
		allFiles = [weakFile, hackFile, growFile],
		weakRam = ns.getScriptRam(weakFile),
		growRam = ns.getScriptRam(growFile),
		hackRam = ns.getScriptRam(hackFile);

	for (let i = 0; i < 100; i++) {
		logTargetOA.push(
			{ name: "No target", state: "doing nothing" })
	}

	for (const serv of getServers(ns)) {
		await ns.scp(allFiles, serv);
		await ns.sleep();
	}


	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {
		if (prevTime + batchInterval * 5 < ns.getTimeSinceLastAug()) {
			if (!firstRun && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel("phantasy")) singleTarget = "phantasy";
			updateServers();
			buyServers();
			await initPservers();

			if (!allHacked) openPorts2(ns, allServers);
			targetsA = [];
			const totalRam = serversOA.reduce((total, serv) => total + serv.maxRam, 0);
			numberOfTargets = firstRun ? 1 : Math.max(1, Math.min(maxTargets, Math.ceil(totalRam / ramNeededForMoreTargets)));
			moneyToSteal = [
				[0, .01],
				[6000, .02],
				[30000, .04],
				[60000, .08],
				[120000, .25],
				[180000, .3],
				[360000, .75]
			].filter(x => x[0] <= totalRam).pop()[1];
			moneyToSteal = target == "n00dles" ? moneyToSteal * 4 : moneyToSteal;
			moneyToSteal = moneyToSteal > 0.75 ? 0.75 : moneyToSteal;

			logServersA[0] = "Total ram in servers: " + ns.nFormat(serversOA.reduce((total, serv) => total + serv.freeRam, 0) * 1e9, "0.0b") + "/" + ns.nFormat(totalRam * 1e9, "0.0b");
			for (let i = 0; i < numberOfTargets; i++) {
				if (firstRun) hackSingleTarget = true;
				target = hackSingleTarget ? singleTarget : totalRam < ramNeededForMoreTargets ? singleTarget : pickTarget(targetsA);
				if (!ns.hasRootAccess(target)) target = "n00dles";
				if (ns.getServerRequiredHackingLevel(target) > ns.getHackingLevel()) target = "n00dles";
				if (!target) continue;
				logTargetOA[i].name = target;
				// if (target != prevTarget) {
				// 	//kill all hwg scripts							TODO
				// 	ns.tprint("WARN Switched target to " + target);
				// }
				if (prevTarget != target || numberOfTargets == 1) {
					if (ns.getServerMoneyAvailable(target) * 1.05 < ns.getServerMaxMoney(target) ||
						ns.getServerSecurityLevel(target) * .95 > ns.getServerMinSecurityLevel(target)) {
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
			prevTime = ns.getTimeSinceLastAug();
			if (useHashes) {
				if (target) ns.exec("/ver6/ver6hacknet.js", "home", 1, target);
				else ns.exec("/ver6/ver6hacknet.js", "home", 1, "phantasy");
			}
		}
		//ns.tprint("ERROR targetsA: " + targetsA);
		updateServers();

		updateTail();
		await ns.sleep(50);
	}

	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function updateTail() {
		ns.clearLog();
		while (logA.length > 14) logA.splice(0, 1);
		while (logServersA.length > 5) logServersA.splice(0, 1);
		logServersA[3] = "Money to steal: " + moneyToSteal * 100 + "%";

		for (let i = serversOA.length - 1; i >= 0; i--) {
			logServersA[4] = 0;
			if (ns.isRunning("/lib/share.js", serversOA[i].name))
				logServersA[4]++;
			serversOA.splice[i];
		}

		ns.print("=============Servers============")
		ns.print("Home ram: " + ns.getServerMaxRam("home") + "GB");
		for (let i = 0; i < 5; i++) {
			if (logServersA[i]) ns.print(logServersA[i]);
			else ns.print("");
		}
		ns.print("Sharing for faction rep: " + logServersA[4]);
		ns.print("=============TARGETS============")
		for (let i = 0; i < numberOfTargets; i++) {
			ns.print(logTargetOA[i].name + ": " + logTargetOA[i].state);
		}
	}

	function updateServers() {
		serversOA = [];
		for (const serv of getServersWithRam(ns)) {
			if (ns.hasRootAccess(serv)) {
				if ((serv.startsWith("hackn") && ns.getTimeSinceLastAug() % 600000 < 300000) && serv != "hacknet-node-0")
					continue;
				serversOA.push({
					name: serv,
					maxRam: ns.getServerMaxRam(serv),
					freeRam: ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)
				})
				if (serv == "home") {
					serversOA[serversOA.length - 1].freeRam -= 50;
					//ns.tprint(serversOA[serversOA.length - 1].name + " freeram: " + serversOA[serversOA.length - 1].freeRam,
					//	" max: " + ns.getServerMaxRam(serv) + " used: " + ns.getServerUsedRam(serv))
				}
			}
		}
		let tempGB = 0;
		try {
			for (const s of ns.getPurchasedServers())
				tempGB += ns.getServerMaxRam(s);
			tempGB = ns.nFormat(tempGB * 1e9, "0.00b");
			logServersA[1] = ns.getPurchasedServers().length + " personal servers with total ram: " + tempGB;
		}
		catch {
			logServersA[1] = "No servers purchased";
		}
		logServersA[3] = 0;

		objectArraySort(ns, serversOA, "freeRam", "big");
	}

	function initializeTarget(targ) {
		let pids = [];
		for (const serv of serversOA) {
			for (const thing of ns.ps(serv.name)) {
				if (thing.filename.includes(["hack"])) {
					if (Object.values(thing.args).includes(targ)) {
						pids.push(thing.pid)
					}
				}
			}
		}
		pids.sort(function (a, b) { return b - a });
		if (pids.length > 0) ns.kill(...pids.splice(pids.length - 1, 1));

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

			//objectArraySort(ns, serversOA, "freeRam", "big");
			updateServers();

			let maxMoney = ns.getServerMaxMoney(targ),
				currentMoney = ns.getServerMoneyAvailable(targ) + 100,
				minSec = ns.getServerMinSecurityLevel(targ),
				growThreads = Math.ceil(ns.growthAnalyze(targ, Math.max(10000, (maxMoney / currentMoney) * 1.2))),
				secu = ns.getServerSecurityLevel(targ) + ns.growthAnalyzeSecurity(growThreads, targ, 1),
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
			serversOA[0].freeRam -= weakThreads * weakRam;
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
			ns.tprint("Not enough total ram, " + totalScriptRam + "/" + totalServerRam);
			ns.tprint("hack: " + targetO.hackThreads * hackRam);
			ns.tprint("weak1: " + targetO.weak1Threads * weakRam);
			ns.tprint("weak2: " + targetO.weak2Threads * weakRam);
			ns.tprint("grow: " + targetO.growThreads * growRam);
			//targetO = await getTargetObject("n00dles");
		}

		if (freeServerRam < totalScriptRam) return;

		const randomNum = Math.random();
		let killScripts = false;
		for (const shit of ["hack", "weak1", "weak2", "grow"]) {
			updateServers();
			if (serversOA[0] == "hacknet-node-0") {
				await getTargetObject(target, ns.getServer("hacknet-node-0").cpuCores);
				totalScriptRam = targetO.weak1Threads * weakRam
					+ targetO.weak2Threads * weakRam
					+ targetO.growThreads * growRam
					+ targetO.hackThreads * hackRam;
			}
			runShit(shit, targetO);
		}


		function runShit(wgh, targetObj, servRam = serversOA[0].freeRam, serv = serversOA[0].name) {
			if (killScripts) return;
			let runO;
			const targ = targetObj.name,
				id = randomNum;

			switch (wgh) {
				case "weak1":
					runO = {
						threads: targetObj.weak1Threads,
						file: weakFile,
						waitTime: 0,
						execTime: targetObj.weakTime,
						ram: targetObj.weak1Threads * weakRam
					}
					break;

				case "weak2":
					runO = {
						threads: targetObj.weak2Threads,
						file: weakFile,
						waitTime: batchInterval * 2,
						execTime: targetObj.weakTime,
						ram: targetObj.weak1Threads * weakRam
					}
					break;

				case "grow":
					runO = {
						threads: targetObj.growThreads,
						file: growFile,
						waitTime: targetObj.weakTime - targetObj.growTime + batchInterval,
						execTime: targetObj.growTime,
						ram: targetObj.growThreads * growRam
					}
					break;

				case "hack":
					runO = {
						threads: targetObj.hackThreads,
						file: hackFile,
						waitTime: targetObj.weakTime - targetObj.hackTime - batchInterval,
						execTime: targetObj.hackTime,
						ram: targetObj.hackThreads * hackRam
					}
					break;
			}

			if (runO.ram < servRam) {
				ns.exec(runO.file,
					serv,
					runO.threads,
					targetO.name,
					runO.waitTime,
					id,
					runO.execTime,
					batchInterval,
					batchDebug);
			} else {
				logA.push("out of ram to run " + wgh + " " + Math.ceil(runO.ram) + " needed, " + Math.floor(serversOA[0].freeRam) + " free");
				killScripts = true;
			}
		}

		if (killScripts) {
			for (const serv of serversOA) {
				for (const thing of ns.ps(serv.name)) {
					if (Object.values(thing.args).includes(randomNum)) {
						//ns.tprint("Killed " + thing.filename);
						ns.kill(thing.pid);
					}
				}
			} ns.weakenAnalyze
		}


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
			if (minGuess == maxGuess && newMoney >= serverObject.moneyMax) foundThreads = true;
			if (minGuess + 1 == maxGuess && newMoney >= serverObject.moneyMax) foundThreads = true;
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

	function buyServers(maxRam = ns.getPurchasedServerMaxRam()) {
		const maxServers = ns.getPurchasedServerLimit();
		if (maxServers == 0) return;
		let ram,
			biggestServer,
			smallestServer,
			serversOA = [];
		let buy = false;
		let allPservers = ns.getPurchasedServers();
		if (allPservers.length > 0) {
			allPservers.forEach(s => { serversOA.push({ name: s, ram: ns.getServerMaxRam(s) }) });
			biggestServer = serversOA.reduce((prev, current) => {
				return (prev.ram > current.ram) ? prev : current
			});
			smallestServer = serversOA.reduce((prev, current) => {
				return (prev.ram < current.ram) ? prev : current
			});
		}

		if (biggestServer == undefined) ram = 8; //no pservers
		else ram = biggestServer.ram;

		while (ram < maxRam && ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram * 2)) {
			ram *= 2; //increase ram until happy
			buy = true;
		}

		if (buy) {
			if (ram > maxRam) return;
			if (serversOA.length == maxServers) {
				ns.killall(smallestServer.name);
				ns.deleteServer(smallestServer.name);
			}
			let servNumbers = [];
			for (const s of serversOA)
				servNumbers.push(Number(s.name.substring(7)));
			let servNumber = 0;
			for (let i = 0; i < maxServers; i++)
				if (!servNumbers.includes(i)) {
					servNumber = i;
					break;
				}
			if (ns.purchaseServer("perkele" + servNumber, ram) != "")
				ns.tprint("Purchased perkele" + servNumber + " with " + ram + "GB of ram.");
			else ns.tprint("ERROR something went wrong purchasing server. Perkele. Money needed: " +
				ns.nFormat(ns.getPurchasedServerCost(ram), "0.00a"));
		}
	}

	async function initPservers() {
		updateServers();
		let allPservers = ns.getPurchasedServers();

		for (let i = 1; i < Math.min(shareServers, allPservers.length / 2); i++) {
			if (!ns.fileExists("/lib/share.js", allPservers[i]))
				await ns.scp("/lib/share.js", allPservers[i]);
			if (!ns.isRunning("/lib/share.js", allPservers[i])) {
				let threads = Math.floor(ns.getServerMaxRam(allPservers[i]) / ns.getScriptRam("/lib/share.js", allPservers[i]));
				if (threads) ns.exec("/lib/share.js", allPservers[i], threads);
			}
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
	function openPorts2(ns, servers) {
		let hacked = 0;
		let progs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
		const ownedProgs = progs.filter((x) => ns.fileExists(x));
		for (const serv of servers) {
			for (const prog of ownedProgs) {
				switch (prog) {
					case "brutessh.exe": ns.brutessh(serv); break;
					case "ftpcrack.exe": ns.ftpcrack(serv); break;
					case "relaysmtp.exe": ns.relaysmtp(serv); break;
					case "httpworm.exe": ns.httpworm(serv); break;
					case "sqlinject.exe": ns.sqlinject(serv); break;
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