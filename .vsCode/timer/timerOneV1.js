import { getServers } from "/lib/IgetServers.js"
import { disableLogs } from "/lib/IdisableLogs.js"
import { getServersWithRam } from "/lib/IgetServersWithRam.js"
import { getServersWithMoney } from "/lib/IgetServersWithMoney.js"
import { secondsToHMS } from "/lib/IsecondsToHMS.js"

/** @param {NS} ns */
export async function main(ns) {
	disableLogs(ns);
	ns.tail();
	const secThresh = 1.05;
	const growThresh = 1.2;
	const moneyThresh = 0.95;
	const percentToSteal = 0.25;
	const startTime = ns.getTimeSinceLastAug();
	var prevTime = ns.getTimeSinceLastAug();
	const weakScript = "/timer/weak.js";
	const growScript = "/timer/grow.js";
	const hackScript = "/timer/hack.js";
	const weakRam = ns.getScriptRam(weakScript);
	const hackRam = ns.getScriptRam(hackScript);
	const growRam = ns.getScriptRam(growScript);
	const scriptRam = ns.getScriptRam("/timer/hackThread");
	const target = ns.args[0];
	var servers = getServersWithRam(ns);
	var targets = getServersWithMoney(ns);
	const moneyAtStart = ns.getServerMoneyAvailable("home");
	const cores = 3;
	var reserveRAM = 32;
	if (ns.args[1]) reserveRAM = ns.args[1];

	/*
		ns.tprint(servers);
	
		for (let i = servers.length - 1; i > 0; i--) {
			let lyhyt = servers[i].substring(0, 4);
			if (lyhyt != "perke" || servers[i] != "home") {
				servers.splice(i, 1);
			}
		}

	ns.tprint(servers);
*/

	var targetObject = {
		name: target,
		shouldWeak: 0, //ram needed
		shouldGrow: 0, //ram needed
		shouldHack: 0, //ram needed
		weakThreads: 0,
		hackThreads: 0,
		growThreads: 0
	}

	/*	openPorts();
	
		while (true) {
			let notHackedServers = [];
			for (let i = 0; i < servers.length; i++) {
				if (ns.isRunning("/ver3/ports.js", "home", servers[i])) {
					notHackedServers.push(1);
				}
			}
			if (notHackedServers.length == 0) break;
			ns.print("Waiting for " + notHackedServers.length + " servers to be hacked...");
	
			await ns.sleep(1000);
		}
		*/

	ns.print("Doing initial grow.");
	//ns.tprint("money before: " + ns.getServerMaxMoney(target) - ns.getServerMoneyAvailable(target));

	while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
		while (!ns.isRunning(growScript, "home", target)) {
			let threads = 1 + Math.ceil((ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - reserveRAM) / growRam);
			if (threads > 0) ns.exec(growScript, "home", threads, target);
			//ns.tprint(ns.getServerMaxMoney(target) - ns.getServerMoneyAvailable(target));
			await ns.sleep(100);
		}
		await ns.sleep(100);
	}
	ns.print("Doing initial weak.");

	while (ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {
		while (!ns.isRunning(weakScript, "home", target)) {
			let threads = 1 + Math.ceil((ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - reserveRAM) / weakRam);
			if (threads > 0) ns.exec(weakScript, "home", threads, target);
			//ns.tprint(ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target));
			await ns.sleep(100);
		}
		await ns.sleep(100);
	}

	analyzeTarget(targetObject);


	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 
	while (true) {
		for (let i = 0; i < 26; i++) {
			if (1 == 1 && prevTime + 1000 < ns.getTimeSinceLastAug()) {
				ns.clearLog();
				ns.print("Money at start: " + moneyAtStart.toExponential(2));
				ns.print("Money now: " + ns.getServerMoneyAvailable("home").toExponential(2));
				ns.print("Money gained: " + (ns.getServerMoneyAvailable("home") - moneyAtStart).toExponential(2));
				ns.print("Money per second: " + (
					(ns.getServerMoneyAvailable("home") - moneyAtStart) /
					((ns.getTimeSinceLastAug() - startTime) / 1000)).toExponential(2)
				);
				ns.print("");
				ns.print("Target: " + target);
				ns.print("Security: " + ns.getServerSecurityLevel(target) + ", min: " + ns.getServerMinSecurityLevel(target));
				let money = ns.getServerMoneyAvailable(target) / 1000;
				let maxmoney = ns.getServerMaxMoney(target) / 1000;
				money = money.toExponential(2);
				maxmoney = maxmoney.toExponential(2);
				ns.print("Money: " + money + " /" + maxmoney) + "M";
				prevTime = ns.getTimeSinceLastAug();
			}




			if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - reserveRAM >
				hackRam * targetObject.hackThreads
				+ weakRam * targetObject.weakThreads
				+ growRam * targetObject.growThreads) {

				let weakTimer = ns.getTimeSinceLastAug();
				let growTimer = ns.getTimeSinceLastAug() + ns.getWeakenTime(target) - ns.getGrowTime(target) + 100;
				let hackTimer = ns.getTimeSinceLastAug() + ns.getWeakenTime(target) - ns.getHackTime(target) + 200;
				ns.print("weak: " + targetObject.weakThreads + "threads, " + targetObject.weakThreads * weakRam + "GB");
				ns.print("grow: " + targetObject.growThreads + "threads, " + targetObject.weakThreads * growRam + "GB");
				ns.print("hack: " + targetObject.hackThreads + "threads, " + targetObject.weakThreads * hackRam + "GB");

				ns.exec("/timer/weak.js", "home", targetObject.weakThreads, target, weakTimer);
				ns.exec("/timer/grow.js", "home", targetObject.growThreads, target, growTimer);
				ns.exec("/timer/hack.js", "home", targetObject.hackThreads, target, hackTimer);
			}
			await ns.sleep(1000);
		}
		await ns.sleep(20);
	}
	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 




	function analyzeTarget(thisServer) {
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
		let newSecurity = minSecurity * secThresh * analyzeGrow * analyzeHack;
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
	//------------------------OPEN PORTS------------------------
	function openPorts() {
		let scripts = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"];
		var scriptstxt = scripts.toString();
		for (let i = 0; i < servers.length; i++) {
			ns.exec("/ver3/ports.js", "home", 1, servers[i], scriptstxt);
		}
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