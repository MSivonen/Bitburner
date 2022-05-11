import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns) {
	/**don't hack if money is less than this %*/
	let moneyThresh = 0.95;
	/**don't hack if security is more than this % */
	let weakThresh = 1.05;
	let moneyToSteal = 0.35;

	/**target = args[0] */
	const weakFile = "/lib/weak.js";
	/**target = args[0] */
	const growFile = "/lib/grow.js";
	/**target = args[0] */
	const hackFile = "/lib/hack.js";
	/**weak.js ram usage */
	const weakRam = ns.getScriptRam(weakFile);
	/**hack.js ram usage */
	const hackRam = ns.getScriptRam(hackFile);
	/**grow.js ram usage */
	const growRam = ns.getScriptRam(growFile);
	/**ram usage of all 3 scripts */
	const totalScriptRam = weakRam + growRam + hackRam;

	let prevTailTime = ns.getTimeSinceLastAug();
	let prevMoney = ns.getServerMoneyAvailable("home");
	let timeArray = [];

	let allHacked = false;
	let batchID = 0;
	let prevTime = 0;
	let startTime = ns.getTimeSinceLastAug();
	let allServers = getServers(ns);
	for (let serv of allServers) {
		await ns.scp([growFile, hackFile, weakFile], serv);
	}
	let targets = ["n00dles", "joesguns"];// getServersWithMoney(ns);
	//let targets = getServersWithMoney(ns);

	/**Targets with root access and hacking level less than player's hacking level */
	/**List of servers with RAM */
	let hackers = getServersWithRam(ns, 4);
	let queueOA = [];
	let toRunOA = [];
	let runningCA = [];
	let hackerServersCA = [];
	let targetServersCA = [];
	let totalFreeRam = 0;
	for (let serv of hackers) {
		totalFreeRam += ns.getServerMaxRam(serv);
	}

	class HackerServer {
		constructor(name_) {
			this.name = name_;
			this.maxRam = ns.getServerMaxRam(name_);
			this.freeRam = ns.getServerMaxRam(name_) - ns.getServerUsedRam(name_);
			this.nextStart = 0; //next script's timings
			this.nextEnd = 0;
		}

		updateRam() {
			this.freeRam = ns.getServerMaxRam(this.name) - ns.getServerUsedRam(this.name);
		}
	}

	class TargetServer {
		constructor(name_) {
			this.target = name_;
			this.maxMoney = ns.getServerMaxMoney(this.target);
			this.money = ns.getServerMoneyAvailable(this.target);
			this.growThreads = 0;
			this.hackThreads = 0;
			this.weak1Threads = 0;
			this.weak2Threads = 0;
			this.weakingTime = 0;
			this.growingTime = 0;
			this.hackingTime = 0;
			this.growTimeOffset = 0;
			this.hackTimeOffset = 0;
			this.minSec = ns.getServerMinSecurityLevel(this.target);
			this.security = ns.getServerSecurityLevel(this.target);
			this.init = true;
			this.totalRamNeeded;
		}

		update() {
			this.updateServer(); //Update server stats

			if (this.init) this.updateInitQueue();
			else this.updateBatchQueue();

			queueOA.push({
				//hacker: "",
				target: this.target,
				init: this.init,
				maxMoney: this.maxMoney,
				money: this.money,
				minSec: this.minSec,
				security: this.security,
				hackThreads: this.hackThreads,
				weak1Threads: this.weak1Threads,
				growThreads: this.growThreads,
				weak2Threads: this.weak2Threads,
				weakingTime: this.weakingTime,
				growingTime: this.growingTime,
				hackingTime: this.hackingTime,
				growTimeOffset: this.growTimeOffset,
				hackTimeOffset: this.hackTimeOffset,
				hackRamNeeded: this.hackThreads * hackRam,
				weak1RamNeeded: this.weak1Threads * weakRam,
				weak2RamNeeded: this.weak2Threads * weakRam,
				growRamNeeded: this.growThreads * growRam,
				totalRamNeeded: this.hackThreads * hackRam + this.weak1Threads * weakRam + this.weak2Threads * weakRam + this.growThreads * growRam
			});
		}


		updateServer() {
			this.maxMoney = ns.getServerMaxMoney(this.target);
			this.money = ns.getServerMoneyAvailable(this.target);
			this.minSec = ns.getServerMinSecurityLevel(this.target);
			this.security = ns.getServerSecurityLevel(this.target);
			if (this.money == this.maxMoney && this.security == this.minSec) {
				this.init = false;
			} else this.init = true;

			this.weakingTime = ns.getWeakenTime(this.target);								//TIMERS//
			this.growingTime = ns.getGrowTime(this.target);								//TIMERS//
			this.hackingTime = ns.getHackTime(this.target);								//TIMERS//
			//HWGW
			this.hackTimeOffset = this.weakingTime - this.hackingTime - 400;			//TIMERS//
			//weak +0
			this.growTimeOffset = this.weakingTime - this.growingTime + 400;			//TIMERS//
			//weak +800
		}

		updateInitQueue() {
			this.money = this.money < this.maxMoney * 0.01 ? this.maxMoney * 0.01 : this.money; //prevent div/0 error
			let growPerc = this.maxMoney / this.money;
			this.growThreads = 1 + Math.ceil(1.25 * ns.growthAnalyze(this.target, growPerc));
			let growAnal = ns.growthAnalyzeSecurity(this.growThreads, this.target, 1);
			this.weak2Threads = 1 + Math.ceil(1.25 * (this.security - this.minSec + growAnal) / ns.weakenAnalyze(1));
		}

		updateBatchQueue() {
			let tempObject = ns.getServer(this.target);
			tempObject.hackDifficulty = tempObject.minDifficulty;
			let hackingChance = ns.formulas.hacking.hackChance(tempObject, ns.getPlayer());
			this.hackThreads = Math.floor(ns.hackAnalyzeThreads(this.target, this.maxMoney * moneyToSteal) / hackingChance);
			this.weak1Threads = 1 + Math.ceil(1.25 * ns.hackAnalyzeSecurity(this.hackThreads, this.target) / ns.weakenAnalyze(1));
			this.growThreads = 1 + Math.ceil(ns.growthAnalyze(this.target, 1.25 / (1 - moneyToSteal)));
			let growAnal = ns.growthAnalyzeSecurity(this.growThreads, this.target, 1);
			this.weak2Threads = 2 + Math.ceil(1.25 * growAnal / ns.weakenAnalyze(1));
		}

	}

	class Runner {
		/**@param  wgh_ {string} "weak"|"grow"|"weak2"|"hack"
		 * @param hackerO_ hacker class
		 * @param targetO_ target class
		 * @param time_ time when the 4 files are started (probably ns.gettime())
		 */
		constructor(wgh_, hackerO_, targetO_, time_, id_) {
			this.wgh = wgh_;
			this.hackerO = hackerO_;
			this.targetO = targetO_;
			this.hacker = this.hackerO.name;
			this.target = this.targetO.target;

			if (this.wgh == "weak1") {
				this.file = weakFile;								//
				this.ramNeeded = this.targetO.weak1RamNeeded;
				this.threads = this.targetO.weak1Threads;
				this.startTime = time_;								//
			}
			if (this.wgh == "weak2") {
				this.file = weakFile;								//
				this.ramNeeded = this.targetO.weak2RamNeeded;		//
				this.threads = this.targetO.weak2Threads;			//Weak 1
				this.startTime = time_ + 800;
			}
			if (this.wgh == "hack") {
				this.ramNeeded = this.targetO.hackRamNeeded;
				this.threads = this.targetO.hackThreads;
				this.startTime = time_ + this.targetO.hackTimeOffset;
				this.file = hackFile;
			}
			if (this.wgh == "grow") {
				this.ramNeeded = this.targetO.growRamNeeded;
				this.threads = this.targetO.growThreads;
				this.startTime = time_ + this.targetO.growTimeOffset;
				this.file = growFile;
			}

			this.endTime = this.startTime + this.targetO.weakingTime; //same endtime for all files
			this.hackerO.freeRam -= this.ramNeeded;
			totalFreeRam -= this.ramNeeded;
			this.executed = false;
			this.id = id_;
			this.alive = true;
			this.random = Math.random();
		}

		update() {
			this.checkRunning();
			this.runScripts();
		}



		runScripts() {
			if (!this.executed && this.startTime <= ns.getTimeSinceLastAug()) {
				ns.exec(this.file, this.hacker, this.threads, this.target, this.id);
				this.executed = true;
				//ns.tprint("started: " + this.wgh + " " + this.target + " id: " + this.id);
			}
		}

		checkRunning() {
			if (((!ns.isRunning(this.file, this.hacker, this.target, this.id) && this.executed) || this.threads == 0) && this.alive) {
				this.hackerO.freeRam += this.ramNeeded;
				this.totalFreeRam += this.ramNeeded;
				this.alive = false;
				//if (this.target == "omega-net") ns.tprint("ended: " + this.wgh + " " + this.target + " id: "
				//	+ this.id + " threads: " + this.threads + " time: " + ns.getTimeSinceLastAug());
			}
		}
	}




	function makeRunQ() {
		objectArraySort(ns, targetServersCA, "weak2Threads", "big");
		//printArray(ns, queueOA);
		for (let i = queueOA.length - 1; i >= 0; i--) {
			let found = false;
			let startRunTime = ns.getTimeSinceLastAug();
			for (let runner of runningCA) {
				if (queueOA[i].target == runner.target && !queueOA[i].init) {
					found = true;
				}
			}
			//ns.tprint(queueOA[i].target);

			if (!found) {
				//if (totalFreeRam >= queueOA[i].totalRamNeeded) { //fits on total RAM
				objectArraySort(ns, hackerServersCA, "freeRam", "big");
				if (hackerServersCA[0].freeRam > queueOA[i].weak1Threads * weakRam && queueOA[i].weak1Threads > 0) {
					runningCA.push(new Runner("weak1", hackerServersCA[0], queueOA[i], startRunTime, batchID));
					hackerServersCA[0].freeRam -= queueOA[i].weak1Threads * weakRam;
					totalFreeRam -= queueOA[i].weak1Threads * weakRam;
					//if (queueOA[i].target == "n00dles") ns.tprint("new Runner N00dles weak1 " + queueOA[i].weak1Threads);
				} else {
					queueOA[i].weak1Threads = Math.floor(hackerServersCA[0].freeRam / weakRam);
					if (queueOA[i].weak1Threads > 0) {
						runningCA.push(new Runner("weak1", hackerServersCA[0], queueOA[i], startRunTime, batchID));
						hackerServersCA[0].freeRam -= queueOA[i].weak1Threads * weakRam;
						totalFreeRam -= queueOA[i].weak1Threads * weakRam;
					}
				}

				objectArraySort(ns, hackerServersCA, "freeRam", "big");
				if (hackerServersCA[0].freeRam > queueOA[i].weak2Threads * weakRam && queueOA[i].weak2Threads > 0) {
					runningCA.push(new Runner("weak2", hackerServersCA[0], queueOA[i], startRunTime, batchID));
					hackerServersCA[0].freeRam -= queueOA[i].weak2Threads * weakRam;
					totalFreeRam -= queueOA[i].weak2Threads * weakRam;
					//if (queueOA[i].target == "n00dles") ns.tprint("new Runner N00dles weak2 " + queueOA[i].weak2Threads);
				} else {
					queueOA[i].weak2Threads = Math.floor(hackerServersCA[0].freeRam / weakRam);
					if (queueOA[i].weak2Threads > 0) {
						runningCA.push(new Runner("weak2", hackerServersCA[0], queueOA[i], startRunTime, batchID));
						hackerServersCA[0].freeRam -= queueOA[i].weak2Threads * weakRam;
						totalFreeRam -= queueOA[i].weak2Threads * weakRam;
					}
				}

				objectArraySort(ns, hackerServersCA, "freeRam", "big");
				if (hackerServersCA[0].freeRam > queueOA[i].growThreads * growRam && queueOA[i].growThreads > 0) {
					runningCA.push(new Runner("grow", hackerServersCA[0], queueOA[i], startRunTime, batchID));
					hackerServersCA[0].freeRam -= queueOA[i].growThreads * growRam;
					totalFreeRam -= queueOA[i].growThreads * growRam;
					//if (queueOA[i].target == "n00dles") ns.tprint("new Runner N00dles grow " + queueOA[i].growThreads + hackerServersCA[0].name);
				} else {
					queueOA[i].growThreads = Math.floor(hackerServersCA[0].freeRam / growRam);
					if (queueOA[i].growThreads > 0) {
						runningCA.push(new Runner("grow", hackerServersCA[0], queueOA[i], startRunTime, batchID));
						hackerServersCA[0].freeRam -= queueOA[i].growThreads * growRam;
						totalFreeRam -= queueOA[i].growThreads * growRam;
					}
				}

				objectArraySort(ns, hackerServersCA, "freeRam", "big");
				if (hackerServersCA[0].freeRam > queueOA[i].hackThreads * hackRam && queueOA[i].hackThreads > 0) {
					runningCA.push(new Runner("hack", hackerServersCA[0], queueOA[i], startRunTime, batchID));
					hackerServersCA[0].freeRam -= queueOA[i].hackThreads * hackRam;
					totalFreeRam -= queueOA[i].hackThreads * hackRam;
					//if (queueOA[i].target == "n00dles") ns.tprint("new Runner N00dles hack, threads: " + queueOA[i].hackThreads);
				} else {
					queueOA[i].hackThreads = Math.floor(hackerServersCA[0].freeRam / hackRam);
					if (queueOA[i].hackThreads > 0) {
						runningCA.push(new Runner("hack", hackerServersCA[0], queueOA[i], startRunTime, batchID));
						hackerServersCA[0].freeRam -= queueOA[i].hackThreads * hackRam;
						totalFreeRam -= queueOA[i].hackThreads * hackRam;
					}
				}
				batchID++;
				//}
			}
		}
	}


	function updateTail() {
		ns.clearLog();
		let tempFreeRam = 0;
		let tempTotalRam = 0;
		for (let serv of hackerServersCA) {
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
		objectArraySort(ns, targetServersCA, "maxMoney", "big");



		ns.clearLog();
		let prevTarget = "";
		ns.print("       ┌───────────────┬───────┬───────┬───┬───┬───┐");
		ns.print("       │    Server     │Money% │ Secu% │Wea│Gro│Hac│");
		ns.print("       ├───────────────┼───────┼───────┼───┼───┼───┤");
		for (let i = 0; i < targetServersCA.length; i++) {
			if (prevTarget != targetServersCA[i].target) {
				let warn = "     ";
				let mani = ns.getServerMoneyAvailable(targetServersCA[i].target);
				let maxMani = ns.getServerMaxMoney(targetServersCA[i].target);
				let secu = ns.getServerSecurityLevel(targetServersCA[i].target);
				let minSecu = ns.getServerMinSecurityLevel(targetServersCA[i].target);
				let namee = targetServersCA[i].target + "               ";
				let maniPercent = mani / maxMani * 100;
				let secuPercent = secu / minSecu * 100;
				if (maniPercent < moneyThresh * 100 || secuPercent > weakThresh * 100) warn = "ERROR";
				maniPercent = maniPercent.toFixed(0) + "   ";
				secuPercent = secuPercent.toFixed(0) + "   ";

				let weakNumber = 0;
				for (let t of runningCA) {
					if (t.target == targetServersCA[i].target && t.file == weakFile) weakNumber++;
				}
				weakNumber = weakNumber.toFixed(0) + "   ";

				let hackNumber = 0;
				for (let t of runningCA) {
					if (t.target == targetServersCA[i].target && t.file == hackFile) hackNumber++;
				}
				hackNumber = hackNumber.toFixed(0) + "   ";

				let growNumber = 0;
				for (let t of runningCA) {
					if (t.target == targetServersCA[i].target && t.file == growFile) growNumber++;
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

				prevTarget = targetServersCA[i].target;
			}

		}
		ns.print("       └───────────────┴───────┴───────┴───┴───┴───┘");
		ns.print("Money per second: " + moneyPerSec.toExponential(2));
		ns.print("Scripts running: " + runningCA.length);
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


	function updateServersCA() {
		let tempTargets = ["n00dles", "joesguns"];//getServersWithMoney(ns);
		for (let i = tempTargets.length - 1; i >= 0; i--) {
			for (let targ of targetServersCA) {
				if (targ.target == tempTargets[i]) {
					tempTargets.splice(i, 1);
				}
			}
		}

		if (!allHacked) openPorts();

		for (let i = tempTargets.length - 1; i >= 0; i--) {
			if (!ns.hasRootAccess(tempTargets[i])) {
				tempTargets.splice(i, 1);
			}
		}
		for (let i = tempTargets.length - 1; i >= 0; i--) {
			targetServersCA.push(new TargetServer(tempTargets[i]));
		}


		tempTargets = getServersWithRam(ns);
		for (let i = tempTargets.length - 1; i >= 0; i--) {
			for (let targ of hackerServersCA) {
				if (targ.name == tempTargets[i]) {
					tempTargets.splice(i, 1);
				}
			}
		}
		for (let i = tempTargets.length - 1; i >= 0; i--) {
			if (!ns.hasRootAccess(tempTargets[i])) {
				tempTargets.splice(i, 1);
			}
		}
		for (let i = tempTargets.length - 1; i >= 0; i--) {
			totalFreeRam += ns.getServerMaxRam(tempTargets[i]);
			hackerServersCA.push(new HackerServer(tempTargets[i]));
		}




	}











	//ns.exec("/lib/purchaseServers.js", "home");

	ns.tail();
	ns.disableLog("ALL");

	for (let serv of hackers) if (ns.hasRootAccess(serv)) hackerServersCA.push(new HackerServer(serv));
	for (let targ of targets) if (ns.hasRootAccess(targ)) targetServersCA.push(new TargetServer(targ));

	//ns.tprint(targetServersCA);


	while (true) {
		totalFreeRam = 0;
		for (let serv of hackerServersCA) { totalFreeRam += serv.freeRam; }									//update free ram

		if (prevTime + 2000 <= ns.getTimeSinceLastAug()) {
			updateServersCA();
			queueOA = [];
			for (let targ of targetServersCA) {
				let found = false;
				for (let runner of runningCA) {
					if (runner.target == targ.target && targ.init) {
						found = true;
						break;
					}
				}
				if (!found) targ.update();
			}
			prevTime = ns.getTimeSinceLastAug();
			makeRunQ();
		}
		//printArray(ns, runningCA);
		//ns.tprint("TIME: " + ns.getTimeSinceLastAug());

		for (let i = runningCA.length - 1; i >= 0; i--) {
			if (!runningCA[i].alive) runningCA.splice(i, 1);
		}	//remove finished runners
		for (let runner of runningCA) {
			runner.update();
		}
		updateTail();
		await ns.sleep(50);
	}

}