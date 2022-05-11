import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns, homeReservedRam = 32) {
	ns.disableLog("ALL");
	//ns.exec("/lib/begin.js", "home");
	while (ns.isRunning("/lib/begin.js", "home")) {
		await ns.sleep(100);
	}
	ns.exec("/lib/purchaseServers.js", "home");
	const cores = 1;
	const filterServ = 9900; //remove servers with more than this hack skill needed
	const moneyThresh = 0.3; //don't hack if money is less than this %
	const weakThresh = 1.5; //don't hack if security is more than this %
	const moneyToSteal = 0.25;
	const spamDifficulty = 800; //Spam scripts if required hacking level is less than this

	const weakFile = "/ver4/weak.js";
	const growFile = "/ver4/grow.js";
	const hackFile = "/ver4/hack.js";
	const weakRam = ns.getScriptRam(weakFile);
	const hackRam = ns.getScriptRam(hackFile);
	const growRam = ns.getScriptRam(growFile);
	const scriptstxt = weakFile + growFile + hackFile;
	const totalScriptRam = weakRam + growRam + hackRam;

	var allHacked = false;
	var timeArray = [];
	var prevMoney = ns.getServerMoneyAvailable("home");
	var moneyAtStart = ns.getServerMoneyAvailable("home");
	var prevTime = ns.getTimeSinceLastAug() - 1111;
	let prevTailTime = ns.getTimeSinceLastAug();
	var startTime = ns.getTimeSinceLastAug();
	var runningScripts = [];
	var allServers = getServers(ns);
	var targets = ["n00dles"];// getServersWithMoney(ns);
	//var targets = getServersWithMoney(ns);
	var validTargetObjects = [];
	var growTargets = [];
	var weakTargets = [];
	var hacktargets = [];
	/**List of servers with RAM */
	var servers = getServersWithRam(ns, 8);
	/**hacking servers
	 * 					@name: serv.name,
	*				@runWeak: threads,
	*				@runGrow: threads,
	*				@runHack: threads
	 */
	var serversQueue = [];
	let spamQueue = [];

	/**List of server objects with RAM
	 * @param {array} serverObject
	 */
	var serverObjects = [];
	for (let i = 0; i < servers.length; i++) {
		let serverObject = {
			name: servers[i],
			maxRam: ns.getServerMaxRam(servers[i]),
			freeRam: 0,
			queueRam: 0,
			runWeak: 0,
			runGrow: 0,
			runHack: 0
			//queue: [server, weak, threads]
		}
		if (servers[i] == "home") serverObject.freeRam -= homeReservedRam;
		if (ns.hasRootAccess(servers[i])) serverObjects.push(serverObject);
	}


	objectArraySort(ns, serverObjects, "maxRam", "big");

	var allTargetObjects = [];
	for (let i = 0; i < targets.length; i++) {
		var tempObject = {
			name: targets[i],
			maxMoney: ns.getServerMaxMoney(targets[i]),
			growThreadsNeeded: 0,
			hackThreadsNeeded: 0,
			weakThreadsNeeded: 0,
			weakingTime: 0,
			growingTime: 0,
			hackingTime: 0,
			growTimeOffset: 0,
			hackTimeOffset: 0,
			hackDifficulty: ns.getServerRequiredHackingLevel(targets[i])
		}
		allTargetObjects.push(tempObject);
	}
	filterTargets(filterServ); //remove target if required hacking level is too high
	objectArraySort(ns, allTargetObjects, "maxMoney", "small");
	ns.tail();

	// let tempServerObject = {
	// 	target: "n00dles",
	// }
	// serversQueue.push(tempServerObject);

	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {
		if (prevTime + 1000 < ns.getTimeSinceLastAug()) {
			if (!allHacked) openPorts();
			validTargetObjects = [];
			validTargetObjects = analyzeTargetsLevel(allTargetObjects);
			getThreads();
			await updateServers();
			giveJobs();
			spamJobs();
			await runThreads();
			checkRunning();
			prevTime = ns.getTimeSinceLastAug();
		}

		updateTail();

		await ns.sleep(25);
	}
	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function openPorts() {
		let noRoot = 0;
		for (let serv of allServers) {
			if (!ns.hasRootAccess(serv)) {
				noRoot++;
				if (!serv.startsWith("perkele") && serv != "home") {
					let openPorts = 0;
					if (ns.fileExists("brutessh.exe")) {
						openPorts++;
						ns.brutessh(serv);
					}
					if (ns.fileExists("ftpcrack.exe")) {
						openPorts++;
						ns.ftpcrack(serv);
					}
					if (ns.fileExists("relaysmtp.exe")) {
						openPorts++;
						ns.relaysmtp(serv);
					}
					if (ns.fileExists("httpworm.exe")) {
						openPorts++;
						ns.httpworm(serv);
					}
					if (ns.fileExists("sqlinject.exe")) {
						openPorts++;
						ns.sqlinject(serv);
					}
					if (ns.getServerNumPortsRequired(serv) <= openPorts) ns.nuke(serv);
				}
			}
		}
		if (noRoot == 0) allHacked = true;
	}

	function filterTargets(hackLevel) {
		//time *= 1000;
		for (let i = allTargetObjects.length - 1; i >= 0; i--) {
			if (ns.getServerRequiredHackingLevel(allTargetObjects[i].name) > hackLevel)
				allTargetObjects.splice(i, 1);
		}
	}

	function checkRunning() {
		for (let i = runningScripts.length - 1; i >= 0; i--) {
			if (!ns.isRunning(runningScripts[i].file,
				runningScripts[i].hackServer,
				runningScripts[i].target,
				runningScripts[i].args)) {
				runningScripts.splice(i, 1);
			}
		}
	}

	function updateTail() {
		ns.clearLog();
		let tempFreeRam = 0;
		let tempTotalRam = 0;
		for (let serv of serverObjects) {
			tempFreeRam += serv.freeRam;
			tempTotalRam += serv.maxRam;
		}
		if (prevTailTime + 1000 <= ns.getTimeSinceLastAug()) {
			timeArray.push(ns.getServerMoneyAvailable("home") - prevMoney);
			prevMoney = ns.getServerMoneyAvailable("home");
			prevTailTime = Math.floor(ns.getTimeSinceLastAug() / 1000) * 1000;
		}
		if (timeArray.length > 60) {
			timeArray.splice(0, 1);
		}
		let tempMoney = 0;
		for (var i = 0; i < timeArray.length; i++) {
			tempMoney += timeArray[i];
		}
		let moneyPerSec = tempMoney / timeArray.length;
		objectArraySort(ns, validTargetObjects, "maxMoney", "big");



		ns.clearLog();
		let prevTarget = "";
		ns.print("       ┌───────────────┬───────┬───────┬───┬───┬───┐");
		ns.print("       │    Server     │Money% │ Secu% │Wea│Gro│Hac│");
		ns.print("       ├───────────────┼───────┼───────┼───┼───┼───┤");
		for (let i = 0; i < validTargetObjects.length; i++) {
			if (prevTarget != validTargetObjects[i].name) {
				let warn = "     ";
				let mani = ns.getServerMoneyAvailable(validTargetObjects[i].name);
				let maxMani = ns.getServerMaxMoney(validTargetObjects[i].name);
				let secu = ns.getServerSecurityLevel(validTargetObjects[i].name);
				let minSecu = ns.getServerMinSecurityLevel(validTargetObjects[i].name);
				let namee = validTargetObjects[i].name + "               ";
				let maniPercent = mani / maxMani * 100;
				let secuPercent = secu / minSecu * 100;
				if (maniPercent < moneyThresh * 100 || secuPercent > weakThresh * 100) warn = "ERROR";
				maniPercent = maniPercent.toFixed(0) + "   ";
				secuPercent = secuPercent.toFixed(0) + "   ";

				let weakNumber = 0;
				for (let t of runningScripts) {
					if (t.target == validTargetObjects[i].name && t.file == weakFile) weakNumber++;
				}
				weakNumber = weakNumber.toFixed(0) + "   ";

				let hackNumber = 0;
				for (let t of runningScripts) {
					if (t.target == validTargetObjects[i].name && t.file == hackFile) hackNumber++;
				}
				hackNumber = hackNumber.toFixed(0) + "   ";

				let growNumber = 0;
				for (let t of runningScripts) {
					if (t.target == validTargetObjects[i].name && t.file == growFile) growNumber++;
				}
				growNumber = growNumber.toFixed(0) + "   ";

				ns.print(warn + "  │" +
					namee.substring(0, 15) + "│" +
					" $" + maniPercent.substring(0, 3) +
					"% │ s" + secuPercent.substring(0, 3) + "% │" +
					"" + weakNumber.substring(0, 3) + "│" +
					"" + growNumber.substring(0, 3) + "│" +
					"" + hackNumber.substring(0, 3) + "│"
				);

				prevTarget = validTargetObjects[i].name;
			}

		}
		ns.print("       └───────────────┴───────┴───────┴───┴───┴───┘");
		ns.print("Money per second: " + moneyPerSec.toExponential(2));
		ns.print("Scripts running: " + runningScripts.length);
		let freegb = "GB";
		let totalgb = "GB";
		let perce = tempFreeRam / tempTotalRam * 100;
		if (tempTotalRam > 10000000) {
			tempTotalRam /= 1000000;
			totalgb = "PB";
		} if (tempTotalRam > 10000) {
			tempTotalRam /= 1000;
			totalgb = "TB";
		}
		if (tempFreeRam > 10000000) {
			tempFreeRam /= 1000000;
			freegb = "PB";
		} if (tempFreeRam > 10000) {
			tempFreeRam /= 1000;
			freegb = "TB";
		}

		let memBar = "[";
		for (let i = 0; i < 15; i++) {
			if (perce * 0.15 <= i) memBar += "|";
		}
		for (let i = 0; i < 15; i++) {
			if (perce * 0.15 > i) memBar += "-";
		}
		memBar += "]";

		let decimalFree = tempFreeRam < 100 ? 1 : 0;
		let decimalTotal = tempTotalRam < 100 ? 1 : 0;
		let printTxt = "Free RAM: " + tempFreeRam.toFixed(decimalFree) + freegb + " / " + tempTotalRam.toFixed(decimalTotal) + totalgb + "  " + perce.toFixed(0) + "% " + "       ";

		ns.print(printTxt.substring(0, 35) + memBar);
	}

	/**Is file running somewhere?
	 * @param targ hacking target
	 * @param fileName filename: weakFile/growFile/hackFile
	 */
	function findRunning(targ, fileName) {
		for (let t of runningScripts) {
			if (t.target == targ && t.file == fileName) return true;
		}
		return false;
	}

	async function runThreads() {
		let tempTotalRam = 0;
		objectArraySort(ns, serversQueue, "runGrow", "small");
		for (let serv of serverObjects) {
			tempTotalRam += serv.freeRam * 0.9; //10% safety reserve ram
		}
		let scriptsRam = 0;
		for (let runTarget of serversQueue) {
			scriptsRam += runTarget.runGrow > 0 ? runTarget.runGrow * growRam : 0;
			scriptsRam += runTarget.runWeak > 0 ? runTarget.runWeak * weakRam : 0;
			scriptsRam += runTarget.runHack > 0 ? runTarget.runHack * hackRam : 0;


			if (!ns.fileExists(growFile, runTarget.hackServer)) {
				await ns.scp(growFile, runTarget.hackServer);
			}
			if (runTarget.runGrow > 0) {
				let tempTime = runTarget.growTimeOffset + ns.getTimeSinceLastAug();
				ns.exec(growFile,
					runTarget.hackServer,
					runTarget.runGrow,
					runTarget.target,
					tempTime);
				let tempRun = {
					file: growFile,
					hackServer: runTarget.hackServer,
					target: runTarget.target,
					args: tempTime
				}
				runningScripts.push(tempRun);
			}

			if (!ns.fileExists(weakFile, runTarget.hackServer)) {
				await ns.scp(weakFile, runTarget.hackServer);
			}
			if (runTarget.runWeak > 0) {
				let tempTime = ns.getTimeSinceLastAug();
				ns.exec(weakFile,
					runTarget.hackServer,
					runTarget.runWeak,
					runTarget.target,
					tempTime);
				let tempRun = {
					file: weakFile,
					hackServer: runTarget.hackServer,
					target: runTarget.target,
					args: tempTime
				}
				runningScripts.push(tempRun);
			}

			if (!ns.fileExists(hackFile, runTarget.hackServer)) {
				await ns.scp(hackFile, runTarget.hackServer);
			}
			if (runTarget.runHack > 0) {
				let tempTime = runTarget.hackTimeOffset + ns.getTimeSinceLastAug();
				ns.exec(hackFile,
					runTarget.hackServer,
					runTarget.runHack,
					runTarget.target,
					tempTime);
				let tempRun = {
					file: hackFile,
					hackServer: runTarget.hackServer,
					target: runTarget.target,
					args: tempTime
				}
				runningScripts.push(tempRun);
			}
		}
		serversQueue.splice(0, serversQueue.length);
	}

	function giveJobs() {
		objectArraySort(ns, validTargetObjects, "growThreadsNeeded", "small");
		for (let targ of validTargetObjects) {
			getTimers(targ);
			let toWeak = targ.weakThreadsNeeded;
			let toGrow = targ.growThreadsNeeded;
			let toHack = targ.hackThreadsNeeded;
			/**memory needed to weak */
			let tempWeakMem = targ.weakThreadsNeeded * weakRam;
			/**memory needed to grow */
			let tempGrowMem = targ.growThreadsNeeded * growRam;
			/**memory needed to hack */
			let tempHackMem = targ.hackThreadsNeeded * hackRam;
			/**total free memory in servers */
			let tempTotalRam = 0;
			let tempMoneypercent = (ns.getServerMoneyAvailable(targ.name) / ns.getServerMaxMoney(targ.name));
			let tempSecupercent = (ns.getServerMinSecurityLevel(targ.name) / ns.getServerSecurityLevel(targ.name));
			//read total ram in servers
			for (let serv of serverObjects) {
				tempTotalRam += (serv.freeRam * 0.9); //10% safety reserve ram
			}
			/* 			ns.tprint("total: " + tempTotalRam);
						ns.tprint("weak: " + tempWeakMem);
						ns.tprint("grow: " + tempGrowMem);
						ns.tprint("hack: " + tempHackMem); */

			//Put grow threads in queue
			if (toGrow > 0 && (tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem || toHack == 0)) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsGrow = Math.floor(serv.freeRam / growRam);
					if (fitsGrow <= 0) continue;
					if (tempGrowMem == 0) break;
					if (tempGrowMem <= serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: Math.ceil(tempGrowMem / growRam),
							growTimeOffset: targ.growTimeOffset,
						}
						if (!findRunning(targ.name, growFile)) {
							serv.freeRam -= tempGrowMem;
							tempTotalRam -= tempGrowMem;
							serversQueue.push(tempServerObject);
							tempGrowMem = 0;
						}
						break;
					} else {
						tempGrowMem -= fitsGrow * growRam;
						tempTotalRam -= fitsGrow * growRam;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: fitsGrow,
							growTimeOffset: targ.growTimeOffset,
						}
						if (!findRunning(targ.name, growFile)) {
							serv.freeRam -= tempGrowMem;
							tempTotalRam -= tempGrowMem;
							serversQueue.push(tempServerObject);
						}
					}
				}
			}
			//Put weak threads in queue
			if (toWeak > 0 && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsWeak = Math.floor(serv.freeRam / weakRam);
					if (fitsWeak <= 0) continue;
					if (tempWeakMem == 0) break;
					if (tempWeakMem < serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: Math.ceil(tempWeakMem / weakRam),
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (!findRunning(targ.name, weakFile)) {
							serv.freeRam -= tempWeakMem;
							tempTotalRam -= tempWeakMem;
							tempTotalRam -= tempWeakMem;

							serversQueue.push(tempServerObject);
						}
						tempWeakMem = 0;
						break;
					} else {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: fitsWeak,
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (!findRunning(targ.name, weakFile)) {
							tempWeakMem -= fitsWeak * weakRam;
							serv.freeRam -= fitsWeak * weakRam;
							tempTotalRam -= fitsWeak * weakRam;
							serversQueue.push(tempServerObject);
						}
					}
				}
			}

			//Put hack threads in queue
			if (toHack > 0 && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsHack = Math.floor(serv.freeRam / hackRam);
					if (fitsHack <= 0) continue;
					if (tempHackMem == 0) break;
					if (tempHackMem < serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: Math.ceil(tempHackMem / hackRam),
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (!findRunning(targ.name, hackFile)) {
							serv.freeRam -= tempHackMem;
							tempTotalRam -= tempHackMem;
							serversQueue.push(tempServerObject);
						}
						tempHackMem = 0;
						break;
					} else {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: fitsHack,
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (!findRunning(targ.name, hackFile)) {
							tempHackMem -= fitsHack * hackRam;
							serv.freeRam -= fitsHack * hackRam;
							tempTotalRam -= fitsHack * hackRam;
							serversQueue.push(tempServerObject);
						}
					}
				}
			}
		}
	}

	function spamJobs() {
		objectArraySort(ns, validTargetObjects, "growThreadsNeeded", "small");
		for (let targ of validTargetObjects) {
			getTimers(targ);
			let toWeak = targ.weakThreadsNeeded;
			let toGrow = targ.growThreadsNeeded;
			let toHack = targ.hackThreadsNeeded;
			/**memory needed to weak */
			let tempWeakMem = targ.weakThreadsNeeded * weakRam;
			/**memory needed to grow */
			let tempGrowMem = targ.growThreadsNeeded * growRam;
			/**memory needed to hack */
			let tempHackMem = targ.hackThreadsNeeded * hackRam;
			/**total free memory in servers */
			let tempTotalRam = 0;
			let tempTotalScriptRam = tempWeakMem + tempGrowMem + tempHackMem;
			let tempMoneypercent = (ns.getServerMoneyAvailable(targ.name) / ns.getServerMaxMoney(targ.name));
			let tempSecupercent = (ns.getServerMinSecurityLevel(targ.name) / ns.getServerSecurityLevel(targ.name));
			//read total ram in servers
			for (let serv of serverObjects) {
				tempTotalRam += serv.freeRam * 0.9; //10% safety reserve ram
			}

			//Put grow threads in queue
			if (toGrow > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {

					let shouldSpam = (ns.getServerRequiredHackingLevel(targ.name) < spamDifficulty
						&& toHack > 0
						&& tempTotalScriptRam < tempTotalRam
					);
					/**how many threads fits in hacking server */
					let fitsGrow = Math.floor(serv.freeRam / growRam);
					if (fitsGrow <= 0) continue;
					if (tempGrowMem == 0) break;
					if (tempGrowMem < serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: Math.ceil(tempGrowMem / growRam),
							growTimeOffset: targ.growTimeOffset,
						}
						if (shouldSpam) {
							serv.freeRam -= tempGrowMem;
							tempTotalRam -= tempGrowMem;
							serversQueue.push(tempServerObject);
							tempGrowMem = 0;
						}
						break;
					} else {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: fitsGrow,
							growTimeOffset: targ.growTimeOffset,
						}
						if (shouldSpam) {
							serversQueue.push(tempServerObject);
							tempGrowMem -= fitsGrow * growRam;
							serv.freeRam -= fitsGrow * growRam;
							tempTotalRam -= fitsGrow * growRam;
						}
					}
				}
			}
			//Put weak threads in queue
			if (toWeak > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {

					let shouldSpam = (ns.getServerRequiredHackingLevel(targ.name) < spamDifficulty
						&& toHack > 0
						&& tempTotalScriptRam < tempTotalRam
					);

					/**how many threads fits in hacking server */
					let fitsWeak = Math.floor(serv.freeRam / weakRam);
					if (fitsWeak <= 0) continue;
					if (tempWeakMem == 0) break;
					if (tempWeakMem < serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: Math.ceil(tempWeakMem / weakRam),
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (shouldSpam) {
							serv.freeRam -= tempWeakMem;
							tempTotalRam -= tempWeakMem;
							serversQueue.push(tempServerObject);
							tempWeakMem = 0;
						}
						break;
					} else {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: fitsWeak,
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (shouldSpam) {
							serversQueue.push(tempServerObject);
							tempWeakMem -= fitsWeak * weakRam;
							serv.freeRam -= fitsWeak * weakRam;
							tempTotalRam -= fitsWeak * weakRam;
						}
					}
				}
			}
			//Put hack threads in queue
			if (toHack > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {

					let shouldSpam = (ns.getServerRequiredHackingLevel(targ.name) < spamDifficulty
						&& toHack > 0
						&& tempTotalScriptRam < tempTotalRam
					);
					/**how many threads fits in hacking server */
					let fitsHack = Math.floor(serv.freeRam / hackRam);
					if (fitsHack <= 0) continue;
					if (tempHackMem == 0) break;
					if (tempHackMem < serv.freeRam) {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: Math.ceil(tempHackMem / hackRam),
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (shouldSpam) {
							serv.freeRam -= tempHackMem;
							tempTotalRam -= tempHackMem;
							serversQueue.push(tempServerObject);
							tempHackMem = 0;
						}
						break;
					} else {
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: fitsHack,
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (shouldSpam) {
							tempHackMem -= fitsHack * hackRam;
							serv.freeRam -= fitsHack * hackRam;
							tempTotalRam -= fitsHack * hackRam;
							serversQueue.push(tempServerObject);
						}
					}
				}
			}
		}
	}


	function getTimers(thisTarget) {
		thisTarget.weakingTime = ns.getWeakenTime(thisTarget.name);
		thisTarget.growingTime = ns.getGrowTime(thisTarget.name);
		thisTarget.hackingTime = ns.getHackTime(thisTarget.name);
		thisTarget.growTimeOffset = thisTarget.weakingTime - thisTarget.growingTime - 200;
		thisTarget.hackTimeOffset = thisTarget.weakingTime - thisTarget.hackingTime - 400;
	}

	/**Update servers' free ram */
	async function updateServers() {
		serverObjects.splice(0, serverObjects.length);
		servers = getServersWithRam(ns);
		for (let i = 0; i < servers.length; i++) {
			let serverObject = {
				name: servers[i],
				maxRam: ns.getServerMaxRam(servers[i]),
				freeRam: 0,
				queueRam: 0,
				runWeak: 0,
				runGrow: 0,
				runHack: 0
				//queue: [server, weak, threads]
			}
			if (servers[i] == "home") serverObject.freeRam -= homeReservedRam;
			if (!servers[i].startsWith("perkele1") && ns.hasRootAccess(servers[i])) serverObjects.push(serverObject);
			if (servers[i].startsWith("perkele1")) {
				if (!ns.fileExists("/ver4/share.js", servers[i])) await ns.scp("/ver4/share.js", servers[i]);
				let threads = Math.floor(ns.getServerMaxRam(servers[i]) / ns.getScriptRam("/ver4/share.js", servers[i]));
				if (threads) ns.exec("/ver4/share.js", servers[i], threads);
			}
		}
		for (var server of serverObjects) {
			server.freeRam = ns.getServerMaxRam(server.name) - ns.getServerUsedRam(server.name);
			if (server.name == "home") server.freeRam -= homeReservedRam;
		}
		objectArraySort(ns, serverObjects, "freeRam", "big");
	}

	/**Calculate threads needed for weak/grow/hack */
	function getThreads() {
		for (var target of validTargetObjects) {
			let tempAvail = ns.getServerMoneyAvailable(target.name) * (1 - moneyToSteal);
			if ((ns.getServerMoneyAvailable(target.name) == 0)) tempAvail = ns.getServerMaxMoney(target.name) * 0.01; //avail not less than 1% to prevent div/0 error
			target.growThreadsNeeded =
				Math.ceil(
					ns.growthAnalyze(
						target.name,
						(ns.getServerMaxMoney(target.name) / tempAvail)
					) * 1.2  // % more than optimal
				);

			if (ns.getServerMoneyAvailable(target.name) / ns.getServerMaxMoney(target.name) > moneyThresh &&
				ns.getServerSecurityLevel(target.name) / ns.getServerMinSecurityLevel(target.name) < weakThresh) {
				target.hackThreadsNeeded = Math.floor(
					(moneyToSteal / ns.hackAnalyze(target.name))
					// ns.hackAnalyzeChance(target.name) * 1.3 //10% less than optima
				);
			} else target.hackThreadsNeeded = 0;

			target.weakThreadsNeeded =
				Math.ceil(
					((ns.getServerSecurityLevel(target.name) - ns.getServerMinSecurityLevel(target.name))
						+ (ns.growthAnalyzeSecurity(target.growThreadsNeeded))
						+ ns.hackAnalyzeSecurity(target.hackThreadsNeeded)
					)
					/ ns.weakenAnalyze(1, ns.getServer(target.name).cpuCores)
				);
		}
	}

	/** See if hacking level is enough for target
	 *  @param thisArray {array} array to analyze
	 * @return Target array with good hacking level targets
	 */
	function analyzeTargetsLevel(thisArray) {
		let tempTargets = [];
		let tempPorts = false;
		for (let i = thisArray.length - 1; i >= 0; i--) {
			if (ns.getServerRequiredHackingLevel(thisArray[i].name) <= ns.getHackingLevel() &&
				ns.hasRootAccess(thisArray[i].name)) {
				tempTargets.push(thisArray[i]);
			}
		}
		return tempTargets;
	}
}