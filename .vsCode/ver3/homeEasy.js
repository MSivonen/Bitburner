import { disableLogs } from "/lib/IdisableLogs.js"
/** @param {NS} ns */
export async function main(ns) {
	const portsRequired = 1;
	disableLogs(ns);
	ns.tail();
	const startTime = ns.getTimeSinceLastAug();
	var percentToSteal = 0.8; //0...1 0.5 = 4.7b/s   0.2 2.6b/s    0.8 8b/s
	//var time = new Date(null);

	let scripts = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"];
	var scriptstxt = scripts.toString();

	const secThresh = 1.05;
	const moneyThresh = 0.95;
	var servers = [];
	var targetArray = [];
	var weakTargets = [];
	var growTargets = [];
	var hackTargets = [];
	var serversObjectArray = [];
	var targetObjectArray = [];
	var runningObjectArray = [];
	var prevTime = ns.getTimeSinceLastAug();
	const weakRam = ns.getScriptRam("/lib/weak.js");
	const hackRam = ns.getScriptRam("/lib/hack.js");
	const growRam = ns.getScriptRam("/lib/grow.js");
	ns.clearLog();
	ns.print("Getting servers...");
	getServers();
	ns.print("Servers OK.");
	ns.print("");
	ns.print("Starting copying scripts and opening ports...")
	openPorts();
	ns.print("Scripts copied.");
	ns.print("");
	//	ns.exec("/lib/begin.js", "home", 1);
	//	ns.print('Starting "begin.js"');
	ns.print("");


	while (true) {
		var notHackedServers = [];
		for (let i = 0; i < servers.length; i++) {
			if (ns.isRunning("/lib/ports.js", "home", servers[i], scriptstxt)) {
				notHackedServers.push(1);
			}
		}
		ns.print("Waiting for " + notHackedServers.length + " servers to be hacked...");
		if (notHackedServers.length == 0) break;

		await ns.sleep(2500);
		//		if (!ns.isRunning("/lib(begin.js", "home")) ns.exec("/lib(begin.js", "home", 1);
	}
	ns.print("All servers hacked.");
	ns.print("");
	ns.print("Startup shit done. Script started");

	while (true) { // MAIN LOOP
		//check how much weak/grow/hack is needed on each target
		for (let i = 0; i < targetObjectArray.length; i++) {
			analyzeTarget(targetObjectArray[i]);
		}
		makeTargetArrays(); //put he above results in array
		updateServersRam();
		checkRunningServers(); //delete completed tasks from array
		if (growTargets.length > 0) runGrow(growTargets[0]);
		if (weakTargets.length > 0) runWeak(weakTargets[0]);
		if (hackTargets.length > 0) runHack(hackTargets[0]);


		if (1 == 1 && prevTime + 1000 < ns.getTimeSinceLastAug()) {
			let runtime = (ns.getTimeSinceLastAug() - startTime) / 1000;
			ns.clearLog();
			ns.print("Running time: " + secondsToHms(runtime));
			ns.print("Needs weak: " + weakTargets.length);
			ns.print("Needs grow: " + growTargets.length);
			ns.print("Needs hack: " + hackTargets.length);
			ns.print("Scripts running: " + runningObjectArray.length);
			ns.print("Number of targets: " + targetObjectArray.length);
			//printArray(serversObjectArray);
			prevTime = ns.getTimeSinceLastAug();
		}

		//printArray(serversObjectArray);
		await ns.sleep(50);
	}

	function secondsToHms(s) {
		let time = {
			hours: ((s - s % 3600) / 3600) % 60,
			minutes: ((s - s % 60) / 60) % 60,
			seconds: s % 60
		}
		time.seconds = time.seconds.toFixed(0);
		return time.hours + ":" + time.minutes + ":" + time.seconds;

	}

	function makeTargetArrays() {
		weakTargets = [];
		growTargets = [];
		hackTargets = [];
		for (let i = 0; i < targetObjectArray.length; i++) {
			if (!runningObjectArray.find(run => run.args === targetObjectArray[i].name)) {
				if (targetObjectArray[i].shouldGrow > 0) {
					growTargets.push(targetObjectArray[i]);
				} else if (targetObjectArray[i].shouldWeak > 0) {
					weakTargets.push(targetObjectArray[i]);
				} else if (targetObjectArray[i].shouldHack > 0) {
					hackTargets.push(targetObjectArray[i]);
				}
			}
		}
		objectArraySort(weakTargets, "shouldWeak", "small");
		objectArraySort(growTargets, "shouldGrow", "small");
		objectArraySort(hackTargets, "shouldHack", "big");
	}

	function runWeak(targetServer) {
		let hackServer = serversObjectArray[0].name;
		let threads = Math.ceil(targetServer.shouldWeak / weakRam);
		if (serversObjectArray[0].freeRam < threads * weakRam) {
			threads = Math.floor(serversObjectArray[0].freeRam / weakRam);
		}
		if (threads > 0) {
			ns.exec("/lib/weak.js", hackServer, threads, targetServer.name);
			let targetObject =
			{
				host: hackServer,
				fileName: "/lib/weak.js",
				args: targetServer.name
			}
			runningObjectArray.push(targetObject);
			weakTargets.splice(0, 1);
			serversObjectArray[0].freeRam -= threads * weakRam;
		}
	}
	function runGrow(targetServer) {
		let hackServer = serversObjectArray[0].name;
		let threads = Math.ceil(targetServer.shouldGrow / growRam);
		if (serversObjectArray[0].freeRam < threads * growRam) {
			threads = Math.floor(serversObjectArray[0].freeRam / growRam);
		}

		if (threads > 0) {
			ns.exec("/lib/grow.js", hackServer, threads, targetServer.name);
			let targetObject =
			{
				host: hackServer,
				fileName: "/lib/grow.js",
				args: targetServer.name
			}
			runningObjectArray.push(targetObject);
			growTargets.splice(0, 1);
			serversObjectArray[0].freeRam -= threads * growRam;
		}
	}
	function runHack(targetServer) {
		let hackServer = serversObjectArray[0].name;
		let threads = Math.ceil(targetServer.shouldHack / hackRam);
		if (serversObjectArray[0].freeRam < threads * hackRam) {
			threads = Math.floor(serversObjectArray[0].freeRam / hackRam);
		}
		if (threads > 0) {
			ns.exec("/lib/hack.js", hackServer, threads, targetServer.name);
			let targetObject =
			{
				host: hackServer,
				fileName: "/lib/hack.js",
				args: targetServer.name
			}
			runningObjectArray.push(targetObject);
			hackTargets.splice(0, 1);
			serversObjectArray[0].freeRam -= threads * hackRam;
		}
	}

	function checkRunningServers() {
		for (let i = 0; i < runningObjectArray.length; i++) {
			let host = runningObjectArray[i].host;
			let fileName = runningObjectArray[i].fileName;
			let args = runningObjectArray[i].args;
			if (!ns.isRunning(fileName, host, args)) {
				runningObjectArray.splice(i, 1);
			}
		}
	}

	//------------------------ANALYZE TARGETS------------------------
	function analyzeTarget(thisServer) {
		let serv = thisServer.name;
		let money = ns.getServerMoneyAvailable(serv);
		let maxmoney = ns.getServerMaxMoney(serv);
		let security = ns.getServerSecurityLevel(serv);
		let minSecurity = ns.getServerMinSecurityLevel(serv);
		let weakOneThread = ns.weakenAnalyze(1);
		let weakAmount = weakRam * ((security - minSecurity) * secThresh / weakOneThread);
		let growAmount = 0;

		if (money < 10000) {
			thisServer.shouldGrow = 1024; //if no money, use 1024GB to grow
		} else {
			growAmount = (maxmoney / money);
			if (growAmount > 1 * moneyThresh) {
				thisServer.shouldGrow = growRam * ns.growthAnalyze(serv, growAmount);
			} else {
				thisServer.shouldGrow = 0;
			}
		}

		if (thisServer.shouldGrow == 0) {
			thisServer.shouldWeak = weakAmount;
		}
		thisServer.shouldWeak = weakAmount;

		if (thisServer.shouldWeak <= 0 && thisServer.shouldGrow <= 0) {
			thisServer.shouldHack = hackRam *
				(ns.hackAnalyzeThreads(serv,
					maxmoney *
					percentToSteal /
					ns.hackAnalyzeChance(serv)
				)); //steal 100 * percentToSteal % of max money
		}
	}
	//------------------------GET TARGETS------------------------
	function getTargets() {
		//		targetArray = ["rothman-uni", "johnson-ortho", "computek", "galactic-cyber"];
		//targetArray.push(servers[0]);
		targetObjectArray = [];
		for (let i = 0; i < servers.length; i++) {
			if (ns.getServerMaxMoney(servers[i]) > 1000 && servers[i] != "home" && ns.getServerNumPortsRequired(servers[i]) < 5) {
				targetArray.push(servers[i]);
			}
		}
		for (let i = 0; i < targetArray.length; i++) {
			let targetObject =
			{
				name: targetArray[i],
				shouldWeak: 0, //ram needed
				shouldGrow: 0, //ram needed
				shouldHack: 0, //ram needed
				running: 0
			}
			targetObjectArray.push(targetObject);
		}
	}
	//------------------------GET SERVERS------------------------
	function getServers() {
		serversObjectArray = [];
		let serversToScan = ns.scan("home");
		while (serversToScan.length > 0) {
			let server = serversToScan.shift();
			if (!servers.includes(server)) {
				servers.push(server);
				let tempServ = ns.scan(server);
				for (var i = 0; i < tempServ.length; i++) {
					serversToScan.push(tempServ[i]);
				}
			}
		}
		servers.push("home");

		getTargets();

		for (let i = servers.length - 1; i >= 0; i--) {
			if ((ns.getServerMaxRam(servers[i]) < 2 ||
				ns.getServerNumPortsRequired(servers[i]) > 4) &&
				servers[i].substring(0, 4) != "perk") {
				servers.splice(i, 1);
			}
		}

		//printArray(servers);
		//ns.write("/ver3/servers.txt", servers, "w");
		//serversText = servers.toString();
		for (let i = 0; i < servers.length; i++) {

			let serverObject =
			{
				name: servers[i],
				freeRam: 0
			}
			serversObjectArray.push(serverObject);
		}

		updateServersRam();
		printArray(serversObjectArray);
	}

	function updateServersRam() {

		for (let i = 0; i < serversObjectArray.length; i++) {
			if (serversObjectArray[i].name != "home") {
				serversObjectArray[i].freeRam = ns.getServerMaxRam(serversObjectArray[i].name) -
					ns.getServerUsedRam(serversObjectArray[i].name);
			} else {
				serversObjectArray[i].freeRam = 0.7 * (ns.getServerMaxRam(serversObjectArray[i].name) -
					ns.getServerUsedRam(serversObjectArray[i].name));
			}
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

		for (let i = 0; i < servers.length; i++) {
			if (ns.getServerNumPortsRequired(servers[i]) < portsRequired) {
				ns.exec("/lib/ports.js", "home", 1, servers[i], scriptstxt);
			}
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