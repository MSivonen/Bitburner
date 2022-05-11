import { disableLogs } from "/lib/IdisableLogs.js"
import { getServersWithRam } from "/lib/IgetServersWithRam.js"
import { getServersWithMoney } from "/lib/IgetServersWithMoney.js"
import { getServers } from "/lib/IgetServers.js"

/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	const thisServer = ns.args[1];
	ns.tprint(thisServer + " starting, target is: " + target)
	disableLogs(ns);
	const secThresh = 1.2;
	const growThresh = 1.2;
	const percentToSteal = 0.7;
	const startTime = ns.getTimeSinceLastAug();
	var prevTime = ns.getTimeSinceLastAug();
	const weakScript = "/timer/weak.js";
	const growScript = "/timer/grow.js";
	const hackScript = "/timer/hack.js";
	const weakRam = ns.getScriptRam(weakScript);
	const hackRam = ns.getScriptRam(hackScript);
	const growRam = ns.getScriptRam(growScript);
	var servers = getServersWithRam(ns);
	var targets = getServersWithMoney(ns);
	var totalHackRam = 0;
	var totalWeakRam = 0;
	var totalGrowRam = 0;
	var errorQuit = false;
	const moneyAtStart = ns.getServerMoneyAvailable("home");
	var cores = 1;
	if (thisServer == "home") {
		cores = 6;
	}
	var targetObject = {
		name: target,
		shouldWeak: 0, //ram needed
		shouldGrow: 0, //ram needed
		shouldHack: 0, //ram needed
		weakThreads: 0,
		hackThreads: 0,
		growThreads: 0
	}


	while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) || ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {
		while (!ns.isRunning(growScript, thisServer, target)) {
			let threads = 1 + Math.ceil((ns.getServerMaxRam(thisServer) - ns.getServerUsedRam(thisServer) - 1) / growRam);
			if (threads > 0) ns.exec(growScript, thisServer, threads / 2, target);
			threads = 1 + Math.ceil((ns.getServerMaxRam(thisServer) - ns.getServerUsedRam(thisServer) - 1) / weakRam);
			if (threads > 0) ns.exec(weakScript, thisServer, threads / 2, target);
			//ns.tprint(ns.getServerMaxMoney(target) - ns.getServerMoneyAvailable(target));
			await ns.sleep(100);
		}
		await ns.sleep(100);
	}

	// while (ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {
	// 	while (!ns.isRunning(weakScript, thisServer, target)) {
	// 		let threads = 1 + Math.ceil((ns.getServerMaxRam(thisServer)/2 - ns.getServerUsedRam(thisServer) - 50) / weakRam);
	// 		if (threads > 0) ns.exec(weakScript, thisServer, threads, target);
	// 		//ns.tprint(ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target));
	// 		await ns.sleep(100);
	// 	}
	// 	await ns.sleep(100);
	// }

	analyzeTarget();
	var serverMaxMem = ns.getServerMaxRam(thisServer) - 16;
	var ramNeeded = targetObject.weakThreads * weakRam +
		targetObject.growThreads * growRam +
		targetObject.hackThreads * hackRam;

	if (targetObject.weakThreads == 0) targetObject.weakThreads = 1;
	if (targetObject.growThreads == 0) targetObject.growThreads = 1;
	if (targetObject.hackThreads == 0) targetObject.hackThreads = 1;

	do {
		ramNeeded = targetObject.weakThreads * weakRam +
			targetObject.growThreads * growRam +
			targetObject.hackThreads * hackRam;
		if (targetObject.weakThreads > 1) targetObject.weakThreads -= 1;
		else targetObject.weakThreads = 1;
		if (targetObject.growThreads > 1) targetObject.growThreads -= 1;
		else targetObject.growThreads = 1;
		if (targetObject.hackThreads > 1) targetObject.hackThreads -= 1;
		else targetObject.hackThreads = 1;
		await ns.sleep(1);
	} while (serverMaxMem < ramNeeded)
	ns.print("weak: " + targetObject.weakThreads +
		"\ngrow: " + targetObject.growThreads +
		"\nhack: " + targetObject.hackThreads);

	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 
	while (!errorQuit2) {
		if (errorQuit) {
			let totalRam = totalHackRam + totalWeakRam + totalGrowRam;
			ns.tprint("Not enough RAM on server " + thisServer + ": " + totalRam + "needed, " + ns.getServerMaxRam(thisServer) + " on server");
			var errorQuit2 = true;
		}
		totalGrowRam = growRam * targetObject.growThreads;
		totalWeakRam = growRam * targetObject.weakThreads;
		totalWeakRam = growRam * targetObject.hackThreads;
		if (ns.getServerMaxRam(thisServer) - ns.getServerUsedRam(thisServer) > totalHackRam + totalWeakRam + totalGrowRam) {

			let weakTimer = ns.getTimeSinceLastAug();
			let growTimer = ns.getTimeSinceLastAug() + ns.getWeakenTime(target) - ns.getGrowTime(target) + 100;
			let hackTimer = ns.getTimeSinceLastAug() + ns.getWeakenTime(target) - ns.getHackTime(target) + 200;


			ns.exec("/timer/weak.js", thisServer, targetObject.weakThreads, target, weakTimer);
			ns.exec("/timer/grow.js", thisServer, targetObject.growThreads, target, growTimer);
			ns.exec("/timer/hack.js", thisServer, targetObject.hackThreads, target, hackTimer);
		}

		//ns.clearLog();
		ns.print("Target: " + target);
		ns.print("Security: " + ns.getServerSecurityLevel(target) + ", min: " + ns.getServerMinSecurityLevel(target));
		let money = ns.getServerMoneyAvailable(target) / 1000;
		let maxmoney = ns.getServerMaxMoney(target) / 1000;
		money = money.toExponential(2);
		maxmoney = maxmoney.toExponential(2);
		ns.print("Money: " + money + " /" + maxmoney) + "M";

		await ns.sleep(1000);
	}
	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 




	function analyzeTarget() {
		let serv = targetObject.name;
		let money = ns.getServerMoneyAvailable(serv);
		let maxmoney = ns.getServerMaxMoney(serv);
		let security = ns.getServerSecurityLevel(serv);
		let minSecurity = ns.getServerMinSecurityLevel(serv);
		let growAmount = 0;

		growAmount = growThresh * maxmoney * percentToSteal;
		targetObject.growThreads = Math.max(1, Math.ceil(ns.growthAnalyze(serv, growAmount, cores)));
		let analyzeGrow = 0.004 * targetObject.growThreads;
		targetObject.hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(serv, maxmoney * percentToSteal / ns.hackAnalyzeChance(serv))));
		let analyzeHack = 0.002 * targetObject.hackThreads;
		let newSecurity = minSecurity * secThresh * analyzeGrow * growThresh * analyzeHack;
		//	((Current Security - Min Security) + (Grow Threads * 0.004)) /0.053125
		targetObject.weakThreads = Math.max(1, Math.ceil((newSecurity - minSecurity) / ns.weakenAnalyze(1, cores)));


	}


	function updateServersRam() {

		for (let i = 0; i < serversObjectArray.length; i++) {
			serversObjectArray[i].freeRam = ns.getServerMaxRam(serversObjectArray[i].name) - ns.getServerUsedRam(serversObjectArray[i].name);
		}

		objectArraySort(serversObjectArray, "freeRam", "big");
	}
	//------------------------SORT ARRAY------------------------
	/**Sort array of objects by some value
	 * @param thisArray {array} array name
	 * @param value {string} object's value to sort by
	 * @param big {"big"|"small"} biggest or smallest first
	 */
	function objectArraySort(thisArray, value, big) { //objectArraySort(serversObjectArray, "freeRam", "big|small");
		if (big == "big") thisArray.sort((c1, c2) => (c1[value] < c2[value]) ? 1 : (c1[value] > c2[value]) ? -1 : 0);//biggest first
		if (big == "small") thisArray.sort((c1, c2) => (c1[value] > c2[value]) ? 1 : (c1[value] < c2[value]) ? -1 : 0);//smallest first
	}

	//------------------------PRINT ARRAY------------------------
	function printArray(thisArray) {
		for (let i = 0; i < thisArray.length; i++) {
			ns.tprint(thisArray[i]);
		}
	}
}

/* random notes
	await ns.write("/randomJS/targetArray.txt", targetArray, "w");
	var servers = ns.read("/jsScripts/servers.txt").split(",");
	ns.exec("/ver3/ports.js");

	if (ns.isRunning("/lib/hack.js") || ns.isRunning("/lib/grow.js") || ns.isRunning("/lib/weak.js")) {
			serversObjectArray[i].running = 1;
		} else serversObjectArray[i].running = 0;
*/