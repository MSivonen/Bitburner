import { getServers } from "/lib/IgetServers.js"
import { disableLogs } from "/lib/IdisableLogs.js"
import { getServersWithRam } from "/lib/IgetServersWithRam.js"
import { getServersWithMoney } from "/lib/IgetServersWithMoney.js"
import { secondsToHMS } from "/lib/IsecondsToHMS.js"

/** @param {NS} ns */
export async function main(ns) {
	disableLogs(ns);
	ns.tail();
	const secThresh = 1.25;
	const growThresh = 0.90;
	const percentToSteal = 0.25;
	const startTime = ns.getTimeSinceLastAug();
	var prevTime = ns.getTimeSinceLastAug();
	const weakScript = "/timer/weak.js";
	const growScript = "/timer/grow.js";
	const hackScript = "/timer/hack.js";
	const weakRam = ns.getScriptRam(weakScript);
	const hackRam = ns.getScriptRam(hackScript);
	const growRam = ns.getScriptRam(growScript);
	var allServers = getServers(ns);
	var servers = getServersWithRam(ns, 31);
	//ns.tprint(servers);
	var targets = getServersWithMoney(ns);
	const moneyAtStart = ns.getServerMoneyAvailable("home");
	var timeArray = [];
	var prevMoney = ns.getServerMoneyAvailable("home");
	const cores = 1;
	var targetObjects = [];
	for (let i = servers.length - 1; i >= 0; i--) {
		let lyhyt = servers[i].substring(0, 4);
		//		if (lyhyt != "perk" && lyhyt != "home") {
		if (ns.getServerMaxRam < 15) {
			servers.splice(i, 1);
		}
	}

	for (let i = targets.length - 1; i > 0; i--) {
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(targets[i])) {
			targets.splice(i, 1);
		}
	}

	var tempLength = Math.min(servers.length, targetObjects.length);

	for (let i = 0; i < servers.length; i++) {
		let tempName = "n00dles";
		if (targets[i]) tempName = targets[i];
		targetObjects[i] = {
			name: tempName,
			money: ns.getServerMaxMoney(tempName),
			shouldWeak: 0, //ram needed
			shouldGrow: 0, //ram needed
			shouldHack: 0, //ram needed
			weakThreads: 0,
			hackThreads: 0,
			growThreads: 0
		}
		analyzeTarget(targetObjects[i]);
	}
	// for (let i = 0; i < targets.length; i++) {
	// 	targetObjects[i] = {
	// 		name: targets[i],
	// 		money: ns.getServerMaxMoney(targets[i]),
	// 		shouldWeak: 0, //ram needed
	// 		shouldGrow: 0, //ram needed
	// 		shouldHack: 0, //ram needed
	// 		weakThreads: 0,
	// 		hackThreads: 0,
	// 		growThreads: 0
	// 	}
	// 	analyzeTarget(targetObjects[i]);
	// }



	openPorts();

	while (true) {
		let notHackedServers = [];
		for (let i = 0; i < allServers.length; i++) {
			if (!ns.hasRootAccess(allServers[i])) {
				notHackedServers.push(1);
			}
		}
		if (notHackedServers.length == 0) break;
		ns.print("Waiting for " + notHackedServers.length + " servers to be hacked...");

		await ns.sleep(1000);
	}

	ns.tprint("ERRORTESTI");

	ns.print("All servers hacked.");
	//ns.tprint("money before: " + ns.getServerMaxMoney(target) - ns.getServerMoneyAvailable(target));
	sortHackServers(servers);
	objectArraySort(targetObjects, "money", "big");
	var activeTargets = 0;
	//	for (let i = 0; i < tempLength; i++) {
	for (let i = 0; i < servers.length; i++) {
		//if (targetObjects.name == "") targetObjects.name = "n00dles";
		await ns.scp("/timer/timerThread.js", servers[i]);
		await ns.scp("/lib/IdisableLogs.js", servers[i]);
		await ns.scp("/lib/IgetServersWithRam.js", servers[i]);
		await ns.scp("/lib/IgetServersWithMoney.js", servers[i]);
		await ns.scp("/lib/IgetServers.js", servers[i]);
		await ns.scp(growScript, servers[i]);
		await ns.scp(hackScript, servers[i]);
		await ns.scp(weakScript, servers[i]);
		ns.exec("/timer/timerThread.js", servers[i], 1, targetObjects[i].name, servers[i]);
		//ns.tprint("exec " + servers[i] + " " + 1 + " " + targetObjects[i].name + " " + servers[i])
		await ns.sleep(100);
		activeTargets++;
	}



	ns.tprint("ERRORTESTI");

	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 
	while (true) {
		if (1 == 1 && prevTime + 1000 < ns.getTimeSinceLastAug()) {
			let now = (ns.getTimeSinceLastAug());
			timeArray.push(ns.getServerMoneyAvailable("home") - prevMoney);
			prevMoney = ns.getServerMoneyAvailable("home");
			if (timeArray.length > 60) {
				timeArray.splice(0, 1);
			}
			let tempMoney = 0;
			for (var i = 0; i < timeArray.length; i++) {
				tempMoney += timeArray[i];
			}
			let moneyPerSec = tempMoney / timeArray.length;

			ns.clearLog();
			let prevTarget = "";
			for (let i = 0; i < activeTargets; i++) {
				if (prevTarget != targetObjects[i].name) {
					let warn = "     ";
					let mani = ns.getServerMoneyAvailable(targetObjects[i].name);
					let maxMani = ns.getServerMaxMoney(targetObjects[i].name);
					let secu = ns.getServerSecurityLevel(targetObjects[i].name);
					let minSecu = ns.getServerMinSecurityLevel(targetObjects[i].name);
					let namee = targetObjects[i].name + "               ";
					let maniPercent = mani / maxMani * 100;
					let secuPercent = secu / minSecu * 100;
					if (maniPercent < 20 || secuPercent > 200) warn = "ERROR";
					maniPercent = maniPercent.toFixed(0) + "   ";
					secuPercent = secuPercent.toFixed(0) + "   ";
					ns.print(warn + "   " + namee.substring(0, 15) + " $" + maniPercent.substring(0, 3) + "%, sec: " + secuPercent.substring(0, 3) + "%");
					prevTarget = targetObjects[i].name;
				}
			}
			ns.print("\nMoney at start: " + moneyAtStart.toExponential(2));
			ns.print("Money now: " + ns.getServerMoneyAvailable("home").toExponential(2));
			ns.print("Money gained: " + (ns.getServerMoneyAvailable("home") - moneyAtStart).toExponential(2));
			ns.print("Money per second: " + moneyPerSec.toExponential(2));
			//				(ns.getServerMoneyAvailable("home") - moneyAtStart) /
			//				(now - startTime) / 1000)).toExponential(2)
			//				);
			//				ns.print("Target: " + "");
			//				ns.print("Security: " + ns.getServerSecurityLevel(target) + ", min: " + ns.getServerMinSecurityLevel(target));
			//				let money = ns.getServerMoneyAvailable(target) / 1000;
			//				let maxmoney = ns.getServerMaxMoney(target) / 1000;
			//				money = money.toExponential(2);
			//				maxmoney = maxmoney.toExponential(2);
			//				ns.print("Money: " + money + " /" + maxmoney) + "M";
			prevTime = ns.getTimeSinceLastAug();
		}
		await ns.sleep(1000);
	}
	// MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP MAIN LOOP 


	/**Sort server array by max ram, biggest first */
	function sortHackServers(thisServerArray) {
		let tempArray = [];

		for (let i = 0; i < thisServerArray.length; i++) {
			let tempObject = {
				name: thisServerArray[i],
				ram: ns.getServerMaxRam(thisServerArray[i])
			}
			tempArray.push(tempObject);
		}
		objectArraySort(tempArray, "ram", "big");
		servers = [];
		for (let i = 0; i < tempArray.length; i++) {
			servers.push(tempArray[i].name);
		}
	}

	function analyzeTarget(thisServer) {
		let serv = thisServer.name;
		let money = ns.getServerMoneyAvailable(serv);
		let maxmoney = ns.getServerMaxMoney(serv);
		let security = ns.getServerSecurityLevel(serv);
		let minSecurity = ns.getServerMinSecurityLevel(serv);
		let growAmount = 0;

		growAmount = (maxmoney * percentToSteal);
		thisServer.growThreads = Math.max(1, Math.ceil(ns.growthAnalyze(serv, growAmount, cores)));
		let analyzeGrow = 0.004 * thisServer.growThreads;
		thisServer.hackThreads = Math.max(1, Math.ceil(ns.hackAnalyzeThreads(serv, maxmoney * percentToSteal / ns.hackAnalyzeChance(serv))));
		let analyzeHack = 0.002 * thisServer.hackThreads;
		let newSecurity = minSecurity * analyzeGrow * analyzeHack;
		thisServer.weakThreads = Math.max(1, Math.ceil(newSecurity - minSecurity) / ns.weakenAnalyze(1, cores));
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
		for (let i = 0; i < allServers.length; i++) {
			ns.exec("/lib/ports.js", "home", 1, allServers[i], scriptstxt);
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