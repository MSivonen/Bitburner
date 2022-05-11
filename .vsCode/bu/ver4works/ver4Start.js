import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns, homeReservedRam = 16) {
	ns.disableLog("ALL");
	const moneyThresh = 0.95;
	const weakThresh = 1.05;
	const spamTime = 10000; //Spam scripts if weaken time is less than this
	const weakFile = "/ver4/weak.js";
	const growFile = "/ver4/grow.js";
	const hackFile = "/ver4/hack.js";
	const weakRam = ns.getScriptRam(weakFile);
	const hackRam = ns.getScriptRam(hackFile);
	const growRam = ns.getScriptRam(growFile);
	const scriptstxt = weakFile + growFile + hackFile;
	const totalScriptRam = weakRam + growRam + hackRam;
	const moneytoSteal = 0.25;


	var runningScripts = [];
	var allServers = getServers(ns);
	//var targets = ["joesguns", "n00dles", "foodnstuff", "computek", "megacorp"];// getServersWithMoney(ns);
	var targets = getServersWithMoney(ns);
	var validTargetObjects = [];
	var growTargets = [];
	var weakTargets = [];
	var hacktargets = [];
	/**List of servers with RAM */
	var servers = getServersWithRam(ns, 16);
	/**hacking servers
	 * 					@name: serv.name,
	*				@runWeak: threads,
	*				@runGrow: threads,
	*				@runHack: threads
	 */
	var serversQueue = [];


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
		serverObjects.push(serverObject);
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
			growingTime: 10,
			hackingTime: 0,
			growTimeOffset: 0,
			hackTimeOffset: 0
		}
		allTargetObjects.push(tempObject);
	}
	filterTargets(120); //remove target if weaktime is more than this many seconds
	objectArraySort(ns, allTargetObjects, "maxMoney", "small");
	ns.tail();

	// let tempServerObject = {
	// 	target: "n00dles",
	// }
	// serversQueue.push(tempServerObject);

	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------
	while (true) {

		validTargetObjects = analyzeTargetsLevel(allTargetObjects);
		getThreads();
		updateServers();
		giveJobs();
		await runThreads();
		checkRunning();
		updateTail();
		await ns.sleep(1000);
	}
	//----------------------------------------MAIN LOOP----------------------------------------MAIN LOOP----------------------------------------

	function filterTargets(time) {
		time *= 1000;
		for (let i = allTargetObjects.length - 1; i >= 0; i--) {
			if (ns.getWeakenTime(allTargetObjects[i].name) > time)
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
		ns.print("runningScripts.length " + runningScripts.length);
		ns.print("serversQueue.length" + serversQueue.length);
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
		for (let serv of serverObjects) {
			tempTotalRam += serv.freeRam * 0.9; //10% safety reserve ram
		}
		let scriptsRam = 0;
		for (let runTarget of serversQueue) {
			scriptsRam += runTarget.runGrow > 0 ? runTarget.runGrow * growRam : 0;
			scriptsRam += runTarget.runWeak > 0 ? runTarget.runWeak * growRam : 0;
			scriptsRam += runTarget.runHack > 0 ? runTarget.runHack * growRam : 0;

			//			if (tempTotalRam > scriptsRam) {

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
			//}
		}
		serversQueue.splice(0, serversQueue.length);
	}

	function addToRunning(obj, args) {

	}

	function giveJobs() {
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

			//read total ram in servers
			for (let serv of serverObjects) {
				tempTotalRam += serv.freeRam * 0.9; //10% safety reserve ram
			}


			//Put grow threads in queue
			if (toGrow > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsGrow = Math.floor(serv.freeRam / growRam);
					if (fitsGrow <= 0) continue;
					if (tempGrowMem == 0) break;
					if (tempGrowMem < serv.freeRam) {
						serv.freeRam -= tempGrowMem;
						tempTotalRam -= tempGrowMem;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: Math.ceil(tempGrowMem / growRam),
							growTimeOffset: targ.growTimeOffset,
						}
						if (!findRunning(targ.name, growFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
						tempGrowMem = 0;
						break;
					} else {
						tempGrowMem -= fitsGrow * growRam;
						serv.freeRam -= fitsGrow * growRam;
						tempTotalRam -= fitsGrow * growRam;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runGrow: fitsGrow,
							growTimeOffset: targ.growTimeOffset,
						}
						if (!findRunning(targ.name, growFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
					}
				}
			}
			//Put weak threads in queue
			if (toWeak > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsWeak = Math.floor(serv.freeRam / weakRam);
					if (fitsWeak <= 0) continue;
					if (tempWeakMem == 0) break;
					if (tempWeakMem < serv.freeRam) {
						serv.freeRam -= tempWeakMem;
						tempTotalRam -= tempWeakMem;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: Math.ceil(tempWeakMem / weakRam),
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (!findRunning(targ.name, weakFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
						tempWeakMem = 0;
						break;
					} else {
						tempWeakMem -= fitsWeak * weakRam;
						serv.freeRam -= fitsWeak * weakRam;
						tempTotalRam -= fitsWeak * weakRam;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runWeak: fitsWeak,
							weakTimeOffset: targ.weakTimeOffset,
						}
						if (!findRunning(targ.name, weakFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
					}
				}
			}
			//Put hack threads in queue
			if (toHack > 0) { // && tempTotalRam > tempWeakMem + tempGrowMem + tempHackMem) {
				for (let serv of serverObjects) {
					/**how many threads fits in hacking server */
					let fitsHack = Math.floor(serv.freeRam / hackRam);
					if (fitsHack <= 0) continue;
					if (tempHackMem == 0) break;
					if (tempHackMem < serv.freeRam) {
						serv.freeRam -= tempHackMem;
						tempTotalRam -= tempHackMem;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: Math.ceil(tempHackMem / hackRam),
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (!findRunning(targ.name, hackFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
						tempHackMem = 0;
						break;
					} else {
						tempGrowMem -= fitsHack * hackRam;
						serv.freeRam -= fitsHack * hackRam;
						tempTotalRam -= fitsHack * hackRam;
						let tempServerObject = {
							target: targ.name,
							hackServer: serv.name,
							runHack: fitsHack,
							hackTimeOffset: targ.hackTimeOffset,
						}
						if (!findRunning(targ.name, hackFile) || ns.getWeakenTime(targ.name) < spamTime) serversQueue.push(tempServerObject);
					}
				}
			}
		}
	}



	function getTimers(thisTarget) {
		thisTarget.weakingTime = ns.getWeakenTime(thisTarget.name);
		thisTarget.growingTime = ns.getGrowTime(thisTarget.name);
		thisTarget.hackingTime = ns.getHackTime(thisTarget.name);
		thisTarget.growTimeOffset = thisTarget.weakingTime - thisTarget.growingTime + 100;
		thisTarget.hackTimeOffset = thisTarget.weakingTime - thisTarget.hackingTime + 200;
	}

	/**Update servers' free ram */
	function updateServers() {
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
			serverObjects.push(serverObject);
		}
		for (var server of serverObjects) {
			server.freeRam = ns.getServerMaxRam(server.name) - ns.getServerUsedRam(server.name); - server.queueRam;
			if (server.name == "home") server.freeRam -= homeReservedRam;
		}
		objectArraySort(ns, serverObjects, "freeRam", "big");
	}

	/**Calculate threads needed for weak/grow/hack */
	function getThreads() {
		for (var target of validTargetObjects) {
			target.growThreadsNeeded =
				Math.ceil(
					ns.growthAnalyze(
						target.name,
						ns.getServerMaxMoney(target.name) * (1 - moneytoSteal)
					)
				);

			if (ns.getServerMoneyAvailable(target.name) / ns.getServerMaxMoney(target.name) > moneyThresh &&
				ns.getServerSecurityLevel(target.name) / ns.getServerMinSecurityLevel(target.name) < weakThresh) {
				target.hackThreadsNeeded = Math.floor(
					(moneytoSteal / ns.hackAnalyze(target.name))
					* ns.hackAnalyzeChance(target.name)
				);
			} else target.hackThreadsNeeded = 0;

			target.weakThreadsNeeded =
				Math.ceil(
					((ns.getServerSecurityLevel(target.name) - ns.getServerMinSecurityLevel(target.name))
						+ (ns.growthAnalyzeSecurity(target.growThreadsNeeded))
						+ ns.hackAnalyzeSecurity(target.hackThreadsNeeded)
					)
					/ ns.weakenAnalyze(1)
				);
		}
	}

	/** See if hacking level is enough for target
	 *  @param thisArray {array} array to analyze
	 * @return Target array with good hacking level targets
	 */
	function analyzeTargetsLevel(thisArray) {
		let tempTargets = [];
		for (let i = thisArray.length - 1; i >= 0; i--) {
			if (ns.getServerRequiredHackingLevel(thisArray[i].name) <= ns.getHackingLevel()) {
				tempTargets.push(thisArray[i]);
			}
		}
		return tempTargets;
	}
}