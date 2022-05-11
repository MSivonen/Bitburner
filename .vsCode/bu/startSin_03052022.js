//import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	const sin = eval("ns.singularity");
	let servers = getServersWithRam(ns);
	ns.exec("/gang/thugGang.js", "home");
	ns.exec("/ver4/ver4Start.js", "home");
	let boughtAug = false;
	let timer = 0;
	let timeToWaitForAugs = 120 * 1000;
	let gangServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];
	let files = [
		"/bn4/homicide.js",
		"/bn4/mug.js",
		"/bn4/buyHomeRam.js",
		"/bn4/faction.js"
	]

	ns.tail();
	while (true) {
		if (!sin.isBusy() && ns.heart.break() > -54000) murder();
		if (!sin.isBusy() && ns.heart.break() <= -54000) await doHacking();
		await copyProgs();
		faction();
		buyDarkweb();
		buyHomeRam();
		getAugs();
		startGang();
		await backdoors();

		await ns.sleep(50)
	}

	async function copyProgs() {
		for (let serv of getServers(ns)) {
			for (let file of files) {
				await ns.scp(file, serv);
			}
		}
	}

	function startGang() {
		if (!ns.isRunning("/gang/thugGang.js", "home") && ns.heart.break() < -54000 && !boughtAug) {
			ns.print("Create gang");
			ns.gang.createGang("Slum Snakes");
			ns.exec("/gang/thugGang.js", "home");
		}
	}

	function getAugs() {
		for (let fact of ns.getPlayer().factions) {
			let augs = ns.singularity.getAugmentationsFromFaction(fact);
			for (let aug of augs) {
				if (!aug.startsWith("NeuroFlux Govern") || boughtAug)
					if (ns.singularity.purchaseAugmentation(fact, aug)) {
						boughtAug = true;
						timer = ns.getTimeSinceLastAug();
						ns.exec("/test/fireworks.js", "home", 1);
					}
			}
		}
		if (boughtAug && timer + timeToWaitForAugs < ns.getTimeSinceLastAug())
			ns.exec("/bn4/restart.js", "home");
		if (boughtAug) ns.print("Restarting in " + Math.floor((timer + timeToWaitForAugs - ns.getTimeSinceLastAug()) / 1000) + "s");
		if (boughtAug && ns.isRunning("/gang/thugGang.js", "home")) ns.kill("/gang/thugGang.js", "home");
		if (boughtAug && ns.isRunning("/lib/purchaseServers.js", "home")) ns.kill("/lib/purchaseServers.js", "home");
	}

	async function backdoors() {
		for (let server of gangServers) {
			if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
				&& !ns.getServer(server).backdoorInstalled
				&& ns.hasRootAccess(server)
				&& !server.startsWith("perke")) { //PURCHASED SERVER
				connecter(server);
				ns.print("Installing backdoor on " + server);
				await ns.singularity.installBackdoor();
				break;
			}
		}
	}

	function buyDarkweb() {
		if (ns.getServerMoneyAvailable("home") > 200000) ns.singularity.purchaseTor();

		let dwProgs = ns.singularity.getDarkwebPrograms();
		for (let prog of dwProgs) {
			if (ns.singularity.getDarkwebProgramCost(prog) < ns.getServerMoneyAvailable("home")) {
				if (!ns.fileExists(prog, "home")) if (ns.singularity.purchaseProgram(prog)) ns.print("Bought " + prog);
			}
		}
	}

	function faction() {
		for (let server of servers) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/faction.js")) {
				ns.exec("/bn4/faction.js", server);
				break;
			}
		}
	}

	function buyHomeRam() {
		for (let server of servers) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/buyHomeRam.js")) {
				if (ns.singularity.getUpgradeHomeRamCost() * 2 < ns.getServerMoneyAvailable("home")) {
					ns.exec("/bn4/buyHomeRam.js", server);
					ns.print("Bought homeram");
					return;
				}
			}
		}
	}

	function murder() {
		ns.tail();
		for (let server of servers) {
			if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/homicide.js")) {
				if (ns.getPlayer().strength > 100) ns.exec("/bn4/homicide.js", server);
				else ns.exec("/bn4/mug.js", server);
				return;
			}
		}
		ns.print("not enough ram for murder.js");
	}

	async function doHacking() {
		let tempSkill = 0;
		let foundServ = "n00dles";
		for (let serv of getServersWithMoney(ns)) {
			if (ns.getServerRequiredHackingLevel(serv) > tempSkill && ns.hasRootAccess(serv)) {
				tempSkill = ns.getServerRequiredHackingLevel(serv);
				//if (tempSkill <= ns.getHackingLevel()) foundServ = serv;
			}
		}
		connecter(foundServ);
		ns.print("hacking " + foundServ);
		if (ns.hasRootAccess(foundServ)) await ns.singularity.manualHack();
	}

	function connecter(targ) {
		ns.singularity.connect("home");
		let target = targ;
		let paths = { "home": "" };
		let queue = Object.keys(paths);
		let name;
		let pathToTarget = [];
		while ((name = queue.shift())) {
			let path = paths[name];
			let scanRes = ns.scan(name);
			for (let newSv of scanRes) {
				if (paths[newSv] === undefined) {
					queue.push(newSv);
					paths[newSv] = `${path},${newSv}`;
					if (newSv == target)
						pathToTarget = paths[newSv].substr(1).split(",");
				}
			}
		}
		pathToTarget.forEach(server => ns.singularity.connect(server));
	}
}